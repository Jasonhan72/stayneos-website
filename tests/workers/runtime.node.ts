import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import { createHmac } from 'node:crypto';
import { SignJWT } from 'jose';
import { signToken, verifyToken } from '../../src/lib/auth/jwt';
import booking from '../../workers/stayneos-booking/src/index';
import payments from '../../workers/stayneos-payments/src/index';
import { ConversationDO } from '../../src/durable-objects/conversation';
import { authenticateWorkerRequest } from '../../src/lib/auth/edge-session';

const secret = 'local-only-regression-auth-secret';
const webhookSecret = 'local-only-regression-webhook-secret';
function fixture() {
  const sqlite = new DatabaseSync(':memory:');
  sqlite.exec(readFileSync('d1-schema.sql', 'utf8'));
  for (const file of ['20260425_account_deletion.sql', '20260425_account_settings_p1_p2.sql', '20260519_token_version.sql', '20260515_messaging.sql']) {
    sqlite.exec(readFileSync(`migrations/${file}`, 'utf8'));
  }
  sqlite.exec("INSERT INTO User (id,email) VALUES ('owner','owner@example.test'),('outsider','outsider@example.test')");
  sqlite.exec("INSERT INTO Property (id,title,slug,status,address,neighborhood,bedrooms,bathrooms,minStayDays,monthlyRate,nightlyRate) VALUES ('property','Test','test','PUBLISHED','Test','Test',1,1,1,3000,100)");
  sqlite.exec("INSERT INTO Booking (id,bookingNumber,propertyId,userId,checkIn,checkOut,nights,guests,basePrice,totalPrice) VALUES ('booking','QA-1','property','owner','2030-01-01','2030-02-01',31,1,3000,3000)");
  sqlite.exec("INSERT INTO Conversation VALUES ('conversation','dm',1,1); INSERT INTO ConversationParticipant VALUES ('conversation','owner',1,0)");
  const DB = {
    prepare(sql: string) {
      let values: unknown[] = [];
      const statement = {
        bind(...args: unknown[]) { values = args; return statement; },
        async first() { return sqlite.prepare(sql).get(...values as never[]) ?? null; },
        async all() { return { results: sqlite.prepare(sql).all(...values as never[]) }; },
        async run() { return sqlite.prepare(sql).run(...values as never[]); },
      };
      return statement;
    },
    async batch(statements: {run(): Promise<unknown>}[]) { return Promise.all(statements.map(s => s.run())); },
  } as unknown as D1Database;
  return { sqlite, env: { DB, NEXTAUTH_SECRET: secret, STRIPE_WEBHOOK_SECRET: webhookSecret, STRIPE_SECRET_KEY: 'sk_test_local_placeholder' } };
}
async function token(userId = 'owner', expires = '5m', tv = 0) {
  return new SignJWT({ userId, tv }).setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime(expires).sign(new TextEncoder().encode(secret));
}
function request(path: string, jwt?: string, method = 'GET', body?: unknown) {
  return new Request(`https://local.test${path}`, { method, headers: { ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}), 'Content-Type': 'application/json' }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
}

test('D1 baseline and auth/messaging migrations initialize an empty database', () => { const {sqlite} = fixture(); assert.ok(sqlite.prepare('SELECT * FROM User').all().length === 2); sqlite.close(); });
test('booking Worker honors the standard fetch(request, env) contract', async () => { const {env,sqlite}=fixture(); assert.equal((await booking.fetch(request('/health'),env)).status,200); sqlite.close(); });
test('forged headers, raw IDs, bad and expired JWTs cannot list bookings', async () => {
  const {env,sqlite}=fixture();
  const forged=new Request('https://local.test/api/bookings',{headers:{'X-StayNeos-User-Id':'owner'}});
  assert.equal((await booking.fetch(forged,env)).status,401);
  for(const jwt of ['owner-user-long-id','invalid.jwt.signature',await token('owner','-1s')]) assert.equal((await booking.fetch(request('/api/bookings',jwt),env)).status,401);
  sqlite.close();
});
test('valid owner lists own bookings; version revocation and deleted accounts fail closed', async () => {
  const {env,sqlite}=fixture(); const jwt=await token();
  const response=await booking.fetch(request('/api/bookings',jwt),env);
  assert.equal(response.status,200);assert.equal((await response.json() as {bookings:unknown[]}).bookings.length,1);
  sqlite.exec("UPDATE User SET token_version=1 WHERE id='owner'");
  assert.equal((await booking.fetch(request('/api/bookings',jwt),env)).status,401);
  sqlite.exec("UPDATE User SET token_version=0, deletionStatus='pending_deletion' WHERE id='owner'");
  assert.equal((await booking.fetch(request('/api/bookings',jwt),env)).status,401);sqlite.close();
});
test('cookie writes need CSRF and database failures deny access', async () => {
  const {env,sqlite}=fixture();const jwt=await token();
  const make=(csrf:boolean)=>new Request('https://local.test/api/bookings',{method:'POST',headers:{cookie:`stayneos_auth_token=${jwt}; stayneos_csrf=local-test-csrf`,...(csrf?{'x-csrf-token':'local-test-csrf'}:{})}});
  assert.equal(await authenticateWorkerRequest(make(false),env),null);
  assert.ok(await authenticateWorkerRequest(make(true),env));sqlite.close();
  assert.equal(await authenticateWorkerRequest(request('/api/bookings',jwt),env),null);
});
test('payments reject anonymous requests and another user before calling Stripe', async () => {
  const {env,sqlite}=fixture();let calls=0;const original=globalThis.fetch;
  globalThis.fetch=async()=>{calls++;throw new Error('Network forbidden')};
  try {
    assert.equal((await payments.fetch(request('/api/payments/create-intent',undefined,'POST',{bookingId:'booking'}),env)).status,401);
    assert.equal((await payments.fetch(request('/api/payments/create-intent',await token('outsider'),'POST',{bookingId:'booking'}),env)).status,404);
    assert.equal(calls,0);
  } finally {globalThis.fetch=original;sqlite.close();}
});
test('owner payment uses stored amount, encoded metadata and stable idempotency', async () => {
  const {env,sqlite}=fixture();const original=globalThis.fetch;let calls=0;
  globalThis.fetch=async (_url,init)=>{
    calls++;const body=init!.body as URLSearchParams;
    assert.equal(body.get('amount'),'300000');assert.equal(body.get('metadata[bookingId]'),'booking');
    assert.equal(new Headers(init!.headers).get('Idempotency-Key'),'stayneos-booking-booking');
    return Response.json({id:'pi_local',client_secret:'local-only'});
  };
  try {
    const response=await payments.fetch(request('/api/payments/create-intent',await token(),'POST',{bookingId:'booking',amount:1}),env);
    assert.equal(response.status,200);assert.equal(calls,1);
    assert.equal(sqlite.prepare("SELECT paymentStatus FROM Booking WHERE id='booking'").get()!.paymentStatus,'PROCESSING');
  } finally {globalThis.fetch=original;sqlite.close();}
});
function signed(payload:string,time=String(Math.floor(Date.now()/1000))) {
  return `t=${time},v1=${createHmac('sha256',webhookSecret).update(`${time}.${payload}`).digest('hex')}`;
}
test('webhook accepts hex signatures and rotating signatures; rejects missing, invalid and stale ones', async () => {
  const {env,sqlite}=fixture();const payload=JSON.stringify({id:'evt_local',type:'noop',data:{object:{}}});
  for(const [signature,status] of [[signed(payload),200],[signed(payload)+',v1='+'0'.repeat(64),200],[signed(payload,'1'),400],['t=NaN,v1=abcd',400],['t=1,v1=not-hex',400],['',400]] as const){
    const response=await payments.fetch(new Request('https://local.test/api/payments/webhook',{method:'POST',headers:{'stripe-signature':signature},body:payload}),env);
    assert.equal(response.status,status);
  }sqlite.close();
});
class Socket {
  metadata: unknown; messages: string[]=[]; closed=false;
  serializeAttachment(value:unknown){this.metadata=value} deserializeAttachment(){return this.metadata}
  send(value:string){this.messages.push(value)} close(){this.closed=true}
}
test('Durable Object denies nonmembers, permits members, and revokes hibernated sessions', async () => {
  const {env,sqlite}=fixture();let accepted:Socket|undefined;const sockets:Socket[]=[];const storage=new Map<string,unknown>();
  const state={getWebSockets:()=>sockets,storage:{get:async(key:string)=>storage.get(key),put:async(key:string,value:unknown)=>storage.set(key,value)},acceptWebSocket:(socket:Socket)=>{accepted=socket;sockets.push(socket)}};
  const NativeResponse=globalThis.Response;const previousPair=(globalThis as Record<string,unknown>).WebSocketPair;
  (globalThis as Record<string,unknown>).WebSocketPair=class{0=new Socket();1=new Socket()};
  globalThis.Response=class extends NativeResponse { private code:number; constructor(body?:BodyInit|null,init?:ResponseInit){super(body,init?.status===101?{...init,status:200}:init);this.code=init?.status??200}get status(){return this.code} };
  const upgrade=async(user:string)=>new Request(`https://local.test/api/messages/ws?conversation_id=conversation&token=${await token(user)}`,{headers:{Upgrade:'websocket'}});
  try {
    let object=new ConversationDO(state as unknown as DurableObjectState,env);
    assert.equal((await object.fetch(await upgrade('outsider'))).status,403);assert.equal(storage.size,0);
    assert.equal((await object.fetch(await upgrade('owner'))).status,101);assert.ok(accepted);
    const ownerSocket = accepted!;
    sqlite.exec("INSERT INTO ConversationParticipant VALUES ('conversation','outsider',1,0)");
    assert.equal((await object.fetch(await upgrade('outsider'))).status,101);
    const revokedRecipient = accepted!;
    sqlite.exec("DELETE FROM ConversationParticipant WHERE user_id='outsider'");
    accepted = ownerSocket;
    object=new ConversationDO(state as unknown as DurableObjectState,env);
    await object.webSocketMessage(accepted as unknown as WebSocket,JSON.stringify({type:'ping'}));
    assert.ok(accepted!.messages.some(s=>JSON.parse(s).type==='pong'));
    await object.webSocketMessage(accepted as unknown as WebSocket,JSON.stringify({type:'send',body:'persisted message'}));
    assert.equal(sqlite.prepare('SELECT body FROM Message').get()!.body,'persisted message');
    assert.ok(revokedRecipient.closed);assert.ok(!revokedRecipient.messages.some(s=>JSON.parse(s).type==='new_message'));
    assert.equal(accepted!.messages.filter(s=>JSON.parse(s).type==='new_message').length,1);
    sqlite.exec("DELETE FROM ConversationParticipant WHERE user_id='owner'");
    await object.webSocketMessage(accepted as unknown as WebSocket,JSON.stringify({type:'send',body:'denied'}));
    assert.ok(accepted!.closed);assert.equal(accepted!.messages.filter(s=>JSON.parse(s).type==='new_message').length,1);
    assert.equal(sqlite.prepare('SELECT COUNT(*) AS count FROM Message').get()!.count,1);
  } finally {globalThis.Response=NativeResponse;(globalThis as Record<string,unknown>).WebSocketPair=previousPair;sqlite.close();}
});

test('booking quote ignores client prices and owner cannot self-confirm or change paid dates', async () => {
  const {env,sqlite}=fixture(); const jwt=await token();
  const response=await booking.fetch(request('/api/bookings',jwt,'POST',{propertyId:'test',checkIn:'2030-01-01',checkOut:'2030-01-03',guests:1,unitRate:1,unitCount:999}),env);
  assert.equal(response.status,200);
  const result=await response.json() as {booking:{unitRate:number;unitCount:number;totalPrice:number;id:string}};
  assert.equal(result.booking.unitRate,100);assert.equal(result.booking.unitCount,2);assert.equal(result.booking.totalPrice,339);
  assert.equal(sqlite.prepare('SELECT propertyId FROM Booking WHERE id=?').get(result.booking.id)!.propertyId,'property');
  for (const body of [{status:'CONFIRMED'},{checkOut:'2031-01-01'},{guests:-1}]) {
    assert.equal((await booking.fetch(request('/api/bookings/booking',jwt,'PATCH',body),env)).status,400);
  }
  assert.equal((await booking.fetch(request('/api/bookings/booking',jwt,'PATCH',{specialRequests:'Late arrival'}),env)).status,200);
  sqlite.close();
});
test('revoked individual session cannot authenticate', async () => {
  const {env,sqlite}=fixture();const jwt=await token();
  const identity=await authenticateWorkerRequest(request('/api/bookings',jwt),env);assert.ok(identity);
  sqlite.prepare('INSERT INTO user_sessions (id,user_id,token_hash,last_active_at,created_at,revoked_at) VALUES (?,?,?,?,?,?)').run('revoked','owner',identity.tokenHash,'now','now','now');
  assert.equal(await authenticateWorkerRequest(request('/api/bookings',jwt),env),null);sqlite.close();
});

test('separate sign-ins issued together have distinct token identities', async () => {
  const [first,second]=await Promise.all([signToken({userId:'owner',tv:0}),signToken({userId:'owner',tv:0})]);
  assert.notEqual(first,second);
  const a=await verifyToken(first),b=await verifyToken(second);
  assert.ok(a?.jti);assert.ok(b?.jti);assert.notEqual(a.jti,b.jti);
});

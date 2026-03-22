const target = process.env.HEALTHCHECK_URL || 'https://stayneos.com/api/health';
const started = Date.now();
try {
  const res = await fetch(target, { method: 'GET' });
  const latency = Date.now() - started;
  console.log(`health status=${res.status} latency=${latency}ms url=${target}`);
  if (!res.ok || latency > Number(process.env.HEALTHCHECK_MAX_MS || 1500)) process.exit(1);
} catch { process.exit(1); }

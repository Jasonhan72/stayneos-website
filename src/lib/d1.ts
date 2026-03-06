// D1 Database Helper for Cloudflare Workers
// This replaces Prisma for the Cloudflare Workers environment

// User type matching the Prisma schema
export interface User {
  id: string;
  email: string;
  emailVerified: string | null;
  name: string | null;
  phone: string | null;
  avatar: string | null;
  password: string | null;
  role: 'GUEST' | 'HOST' | 'ADMIN' | 'SUPER_ADMIN';
  createdAt: string;
  updatedAt: string;
}

// Session type for NextAuth
export interface Session {
  id: string;
  sessionToken: string;
  userId: string;
  expires: string;
}

// Account type for OAuth (kept for future use)
export interface Account {
  id: string;
  userId: string;
  type: string;
  provider: string;
  providerAccountId: string;
  refresh_token: string | null;
  access_token: string | null;
  expires_at: number | null;
  token_type: string | null;
  scope: string | null;
  id_token: string | null;
  session_state: string | null;
}

// Get Cloudflare context from global symbol
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getCloudflareContext(): any | undefined {
  const symbol = Symbol.for("__cloudflare-context__");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const context = (globalThis as any)[symbol];
  return context;
}

// Get D1 database from environment
export function getDb(): D1Database {
  // Try to get DB from Cloudflare context (for Cloudflare Workers)
  const cfContext = getCloudflareContext();
  if (cfContext?.env?.DB) {
    return cfContext.env.DB;
  }
  
  // Fallback to process.env (for development/testing)
  const env = process.env as unknown as { DB?: D1Database };
  if (env.DB) {
    return env.DB;
  }
  
  console.error("D1 database binding 'DB' not found");
  throw new Error("D1 database binding 'DB' not found. Make sure DB is bound in wrangler.toml");
}

// D1 User helper functions
export const userDb = {
  async findByEmail(db: D1Database, email: string): Promise<User | null> {
    try {
      const result = await db
        .prepare('SELECT * FROM User WHERE email = ?')
        .bind(email)
        .first<User>();
      return result || null;
    } catch (error) {
      console.error('Error finding user by email:', error);
      throw error;
    }
  },

  async findById(db: D1Database, id: string): Promise<User | null> {
    try {
      const result = await db
        .prepare('SELECT * FROM User WHERE id = ?')
        .bind(id)
        .first<User>();
      return result || null;
    } catch (error) {
      console.error('Error finding user by id:', error);
      throw error;
    }
  },

  async create(db: D1Database, data: {
    id: string;
    email: string;
    name?: string;
    password?: string;
    avatar?: string;
    role?: string;
  }): Promise<User> {
    const id = data.id || crypto.randomUUID();
    const now = new Date().toISOString();
    
    try {
      await db
        .prepare(`
          INSERT INTO User (id, email, name, password, avatar, role, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `)
        .bind(
          id,
          data.email,
          data.name || null,
          data.password || null,
          data.avatar || null,
          data.role || 'GUEST',
          now,
          now
        )
        .run();

      return {
        id,
        email: data.email,
        name: data.name || null,
        password: data.password || null,
        avatar: data.avatar || null,
        role: (data.role || 'GUEST') as User['role'],
        emailVerified: null,
        phone: null,
        createdAt: now,
        updatedAt: now,
      };
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  async update(db: D1Database, id: string, data: Partial<Omit<User, 'id' | 'createdAt'>>): Promise<void> {
    const sets: string[] = [];
    const values: (string | null)[] = [];
    
    if (data.name !== undefined) { sets.push('name = ?'); values.push(data.name); }
    if (data.email !== undefined) { sets.push('email = ?'); values.push(data.email); }
    if (data.password !== undefined) { sets.push('password = ?'); values.push(data.password); }
    if (data.avatar !== undefined) { sets.push('avatar = ?'); values.push(data.avatar); }
    if (data.role !== undefined) { sets.push('role = ?'); values.push(data.role); }
    if (data.phone !== undefined) { sets.push('phone = ?'); values.push(data.phone); }
    if (data.emailVerified !== undefined) { sets.push('emailVerified = ?'); values.push(data.emailVerified); }
    
    if (sets.length === 0) return;
    
    values.push(new Date().toISOString()); // updatedAt
    values.push(id);
    
    try {
      await db
        .prepare(`UPDATE User SET ${sets.join(', ')}, updatedAt = ? WHERE id = ?`)
        .bind(...values)
        .run();
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },
};

// D1 Session helper functions
export const sessionDb = {
  async findByToken(db: D1Database, sessionToken: string): Promise<(Session & { user: User }) | null> {
    try {
      const result = await db
        .prepare(`
          SELECT s.*, u.id as user_id, u.email as user_email, u.name as user_name, 
                 u.avatar as user_avatar, u.role as user_role, u.password as user_password,
                 u.phone as user_phone, u.emailVerified as user_emailVerified,
                 u.createdAt as user_createdAt, u.updatedAt as user_updatedAt
          FROM Session s
          JOIN User u ON s.userId = u.id
          WHERE s.sessionToken = ? AND s.expires > datetime('now')
        `)
        .bind(sessionToken)
        .first<Record<string, unknown>>();
      
      if (!result) return null;
      
      return {
        id: result.id as string,
        sessionToken: result.sessionToken as string,
        userId: result.userId as string,
        expires: result.expires as string,
        user: {
          id: result.user_id as string,
          email: result.user_email as string,
          name: result.user_name as string | null,
          avatar: result.user_avatar as string | null,
          role: result.user_role as User['role'],
          password: result.user_password as string | null,
          phone: result.user_phone as string | null,
          emailVerified: result.user_emailVerified as string | null,
          createdAt: result.user_createdAt as string,
          updatedAt: result.user_updatedAt as string,
        },
      };
    } catch (error) {
      console.error('Error finding session by token:', error);
      throw error;
    }
  },

  async create(db: D1Database, data: {
    sessionToken: string;
    userId: string;
    expires: string;
  }): Promise<Session> {
    const id = crypto.randomUUID();
    
    try {
      await db
        .prepare('INSERT INTO Session (id, sessionToken, userId, expires) VALUES (?, ?, ?, ?)')
        .bind(id, data.sessionToken, data.userId, data.expires)
        .run();

      return {
        id,
        sessionToken: data.sessionToken,
        userId: data.userId,
        expires: data.expires,
      };
    } catch (error) {
      console.error('Error creating session:', error);
      throw error;
    }
  },

  async deleteByToken(db: D1Database, sessionToken: string): Promise<void> {
    try {
      await db
        .prepare('DELETE FROM Session WHERE sessionToken = ?')
        .bind(sessionToken)
        .run();
    } catch (error) {
      console.error('Error deleting session:', error);
      throw error;
    }
  },

  async deleteExpired(db: D1Database): Promise<void> {
    try {
      await db
        .prepare("DELETE FROM Session WHERE expires < datetime('now')")
        .run();
    } catch (error) {
      console.error('Error deleting expired sessions:', error);
      throw error;
    }
  },
};

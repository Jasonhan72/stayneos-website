interface DevUser {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'GUEST';
  createdAt: string;
}

const users = new Map<string, DevUser>();

export function addDevUser(user: Omit<DevUser, 'id' | 'createdAt' | 'role'>): DevUser {
  const existing = users.get(user.email.toLowerCase());
  if (existing) return existing;
  const created: DevUser = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    role: 'GUEST',
    name: user.name,
    email: user.email.toLowerCase(),
    password: user.password,
  };
  users.set(created.email, created);
  return created;
}

export function getDevUserByEmail(email: string): DevUser | null {
  return users.get(email.toLowerCase()) || null;
}

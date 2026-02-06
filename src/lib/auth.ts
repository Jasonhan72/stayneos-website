import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const JWT_EXPIRES_IN = "7d";

export interface User {
  id: string;
  email: string;
  name: string;
  password?: string;
}

export interface AuthPayload {
  userId: string;
  email: string;
  name: string;
}

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

/**
 * Compare a plain password with a hashed password
 */
export async function comparePassword(
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(plainPassword, hashedPassword);
}

/**
 * Generate a JWT token
 */
export function generateToken(payload: AuthPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Verify a JWT token
 */
export function verifyToken(token: string): AuthPayload {
  return jwt.verify(token, JWT_SECRET) as AuthPayload;
}

/**
 * Set authentication cookie
 */
export function setAuthCookie(token: string): void {
  cookies().set("auth-token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });
}

/**
 * Remove authentication cookie
 */
export function removeAuthCookie(): void {
  cookies().delete("auth-token");
}

/**
 * Get current user from cookie
 */
export function getCurrentUser(): AuthPayload | null {
  try {
    const token = cookies().get("auth-token")?.value;
    if (!token) return null;
    return verifyToken(token);
  } catch {
    return null;
  }
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return getCurrentUser() !== null;
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Validate password strength
 * - At least 6 characters
 * - Contains at least one letter
 * - Contains at least one number
 */
export function isValidPassword(password: string): {
  valid: boolean;
  message?: string;
} {
  if (password.length < 6) {
    return { valid: false, message: "密码至少需要6位字符" };
  }

  if (!/(?=.*[a-zA-Z])/.test(password)) {
    return { valid: false, message: "密码需要包含至少一个字母" };
  }

  if (!/(?=.*\d)/.test(password)) {
    return { valid: false, message: "密码需要包含至少一个数字" };
  }

  return { valid: true };
}

/**
 * Create a mock user (for demo purposes)
 * In production, this should interact with your database
 */
export async function createUser(
  name: string,
  email: string,
  password: string
): Promise<Omit<User, "password">> {
  const hashedPassword = await hashPassword(password);

  // In production, save to database
  const user: User = {
    id: crypto.randomUUID(),
    email,
    name,
    password: hashedPassword,
  };

  return { id: user.id, email: user.email, name: user.name };
}

/**
 * Mock function to find user by email
 * In production, query from your database
 */
export async function findUserByEmail(): Promise<User | null> {
  // In production, query from database with email parameter
  // This is a mock implementation
  return null;
}

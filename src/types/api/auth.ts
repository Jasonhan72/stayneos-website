/**
 * Auth API 请求 / 响应类型契约
 */
import { z } from 'zod';

export const loginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});
export type LoginRequest = z.infer<typeof loginRequestSchema>;

export const registerRequestSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});
export type RegisterRequest = z.infer<typeof registerRequestSchema>;

export interface LoginResponse {
  message: string;
  pendingDeletionNotice?: {
    status: string;
    deletionRequestedAt?: string | null;
    deletionScheduledAt?: string | null;
    recoverable: boolean;
  } | null;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    deletionStatus?: string;
    deletionRequestedAt?: string | null;
    deletionScheduledAt?: string | null;
  };
}

export interface RegisterResponse {
  message: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
  };
}

export interface SessionResponse {
  message: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    avatar?: string;
    phone?: string | null;
    address?: string | null;
    deletionRequestedAt?: string | null;
    deletionScheduledAt?: string | null;
    deletionStatus?: string | null;
  } | null;
}

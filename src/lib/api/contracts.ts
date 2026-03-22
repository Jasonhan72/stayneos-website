import { NextResponse } from 'next/server';
import { ZodError, type ZodSchema } from 'zod';
import { logger } from '@/lib/utils/logger';

export type ErrorCode = 'BAD_REQUEST' | 'UNAUTHORIZED' | 'FORBIDDEN' | 'NOT_FOUND' | 'CONFLICT' | 'VALIDATION_ERROR' | 'INTERNAL_ERROR';

export interface StandardErrorResponse {
  success: false;
  error: { code: ErrorCode | string; message: string };
}

export interface StandardSuccessResponse<T> { success: true; data: T }

export class AppError extends Error {
  constructor(public code: ErrorCode, public status: number, message: string) {
    super(message);
    this.name = 'AppError';
  }
}

export function ok<T>(data: T, status = 200) {
  return NextResponse.json<StandardSuccessResponse<T>>({ success: true, data }, { status });
}

export function fail(code: ErrorCode | string, message: string, status = 500) {
  return NextResponse.json<StandardErrorResponse>({ success: false, error: { code, message } }, { status });
}

function normalizeUnknownError(error: unknown): AppError {
  if (error instanceof AppError) return error;
  if (error instanceof ZodError) return new AppError('VALIDATION_ERROR', 422, 'Invalid request payload');
  return new AppError('INTERNAL_ERROR', 500, 'Internal server error');
}

export async function withApiHandler(
  handler: () => Promise<NextResponse>,
  context: Record<string, unknown> = {},
) {
  try {
    return await handler();
  } catch (error) {
    const normalized = normalizeUnknownError(error);
    logger.error('API handler failed', error instanceof Error ? error : undefined, { ...context, code: normalized.code, status: normalized.status });
    return fail(normalized.code, normalized.message, normalized.status);
  }
}

export async function parseJsonBody<T>(request: Request, schema: ZodSchema<T>): Promise<T> {
  const payload = await request.json();
  const result = schema.safeParse(payload);
  if (!result.success) throw new AppError('VALIDATION_ERROR', 422, 'Invalid request payload');
  return result.data;
}

import { z, type ZodSchema } from 'zod';
import { AppError } from './contracts';

export const commonSchemas = {
  idParam: z.object({ id: z.string().min(1).transform((v) => v.trim()) }),
  pagination: z.object({ page: z.coerce.number().int().min(1).default(1), limit: z.coerce.number().int().min(1).max(100).default(20) }),
};

export function validateParams<T>(input: unknown, schema: ZodSchema<T>): T {
  const result = schema.safeParse(input);
  if (!result.success) throw new AppError('VALIDATION_ERROR', 422, 'Invalid route parameters');
  return result.data;
}

export function normalizeString(input: unknown): string {
  return typeof input === 'string' ? input.trim() : '';
}

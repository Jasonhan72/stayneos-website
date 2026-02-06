// src/lib/validation/index.ts
// 验证模块导出

export {
  propertyListQuerySchema,
  propertyIdSchema,
  createBookingSchema,
  bookingListQuerySchema,
  registerSchema,
  loginSchema,
  changePasswordSchema,
  createReviewSchema,
} from './schemas';

export type {
  PropertyListQuery,
  CreateBookingInput,
  RegisterInput,
  LoginInput,
  CreateReviewInput,
} from './schemas';

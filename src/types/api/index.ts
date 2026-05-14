/**
 * API 类型契约 — barrel export
 */

export type {
  ApiResponse,
  PaginatedResponse,
  ApiError,
  HttpMethod,
  RequestConfig,
  SuccessResponse,
  PaginationParams,
  ApiErrorResponse,
  UnauthorizedResponse,
} from './common';

export type {
  LoginRequestBody,
  RegisterRequestBody,
  SessionResponse,
  LogoutResponse,
} from './auth';

export type {
  WishlistItem,
  WishlistGetResponse,
  WishlistPostResponse,
  WishlistPropertyCard,
  WishlistPropertyImage,
} from './wishlist';

export type {
  PropertyListResponse,
  PropertyDetailResponse,
  PropertyApiError,
} from './property';

export type {
  BookingListResponse,
  BookingDetailResponse,
  CreateBookingRequestBody,
  CreateBookingResponseBody,
  UpdateBookingRequestBody,
} from './booking';

export type {
  Message,
  Conversation,
  MessagesListResponse,
  MessagesDetailResponse,
  SendMessageRequest,
  SendMessageResponse,
} from './messages';

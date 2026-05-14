/**
 * Property API 共享类型
 */

import type { Property, PropertyListItem } from '../property';

/** GET /api/properties 返回 */
export interface PropertyListResponse {
  properties: PropertyListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/** GET /api/properties/[slug] 返回 */
export interface PropertyDetailResponse {
  property: Property;
}

/** Property API 错误响应 */
export interface PropertyApiError {
  error: string;
  statusCode: number;
}

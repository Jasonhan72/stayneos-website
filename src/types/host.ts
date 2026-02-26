// src/types/host.ts
// Host类型定义

export type HostStatus = 'pending' | 'active' | 'suspended' | 'inactive';
export type HostLevel = 'new' | 'rising' | 'established' | 'superhost';

export interface Host {
  id: string;
  userId: string | null;
  displayName: string;
  tagline?: string;
  bio?: string;
  avatarUrl?: string;
  status: HostStatus;
  isVerified: boolean;
  hostLevel: HostLevel;
  superhostSince?: string;
  businessEmail?: string;
  businessPhone?: string;
  timezone: string;
  preferredLanguages: string[];
  // 统计
  totalProperties: number;
  totalBookings: number;
  responseRate: number;
  responseTimeMinutes?: number;
  rating: number;
  createdAt: string;
  updatedAt: string;
}

export interface HostPublicProfile {
  id: string;
  displayName: string;
  tagline?: string;
  bio?: string;
  avatarUrl?: string;
  hostLevel: HostLevel;
  isVerified: boolean;
  superhostSince?: string;
  totalProperties: number;
  responseRate: number;
  rating: number;
  yearsHosting: number;
}

// 简化的Host选项（用于下拉选择）
export interface HostOption {
  id: string;
  displayName: string;
  avatarUrl?: string;
  totalProperties: number;
  status: HostStatus;
}

/**
 * 加载骨架屏组件
 */

import React from 'react';

// 属性卡片骨架屏
export function PropertyCardSkeleton() {
  return (
    <div className="bg-white rounded-xl overflow-hidden border border-neutral-200 animate-pulse">
      {/* 图片骨架 */}
      <div className="relative aspect-[4/3] bg-neutral-200" />
      
      {/* 内容骨架 */}
      <div className="p-5 space-y-3">
        <div className="flex items-start justify-between">
          <div className="h-5 bg-neutral-200 rounded w-2/3" />
          <div className="h-5 bg-neutral-200 rounded w-12" />
        </div>
        
        <div className="h-4 bg-neutral-200 rounded w-1/2" />
        
        <div className="flex items-center gap-4">
          <div className="h-4 bg-neutral-200 rounded w-16" />
          <div className="h-4 bg-neutral-200 rounded w-16" />
        </div>
        
        <div className="pt-3 border-t border-neutral-100">
          <div className="h-6 bg-neutral-200 rounded w-1/3" />
        </div>
      </div>
    </div>
  );
}

// 属性卡片列表骨架屏
export function PropertyCardSkeletonList({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <PropertyCardSkeleton key={i} />
      ))}
    </div>
  );
}

// 属性详情页骨架屏
export function PropertyDetailSkeleton() {
  return (
    <div className="min-h-screen bg-white animate-pulse">
      {/* 导航骨架 */}
      <div className="h-14 bg-white border-b border-neutral-200" />
      
      {/* 图片画廊骨架 */}
      <div className="h-[400px] bg-neutral-200" />
      
      {/* 内容骨架 */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-8 bg-neutral-200 rounded w-3/4" />
            <div className="h-4 bg-neutral-200 rounded w-1/2" />
            <div className="space-y-3 pt-6">
              <div className="h-4 bg-neutral-200 rounded w-full" />
              <div className="h-4 bg-neutral-200 rounded w-full" />
              <div className="h-4 bg-neutral-200 rounded w-2/3" />
            </div>
          </div>
          
          <div className="hidden lg:block">
            <div className="h-[400px] bg-neutral-100 rounded-2xl border border-neutral-200" />
          </div>
        </div>
      </div>
    </div>
  );
}

// 预订列表骨架屏
export function BookingListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl border border-neutral-200 p-6 animate-pulse">
          <div className="flex gap-4">
            <div className="w-24 h-24 bg-neutral-200 rounded-lg flex-shrink-0" />
            <div className="flex-1 space-y-3">
              <div className="h-5 bg-neutral-200 rounded w-1/3" />
              <div className="h-4 bg-neutral-200 rounded w-1/2" />
              <div className="h-4 bg-neutral-200 rounded w-1/4" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// 通用内容骨架屏
export function ContentSkeleton({ lines = 4 }: { lines?: number }) {
  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: lines }).map((_, i) => (
        <div 
          key={i} 
          className="h-4 bg-neutral-200 rounded"
          style={{ width: i === lines - 1 ? '60%' : '100%' }}
        />
      ))}
    </div>
  );
}

// 导出所有骨架屏
export const Skeleton = {
  PropertyCard: PropertyCardSkeleton,
  PropertyCardList: PropertyCardSkeletonList,
  PropertyDetail: PropertyDetailSkeleton,
  BookingList: BookingListSkeleton,
  Content: ContentSkeleton,
};

export default Skeleton;

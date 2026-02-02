export default function PropertiesLoading() {
  return (
    <div className="min-h-screen bg-amber-50">
      {/* Header Skeleton */}
      <div className="pt-24 pb-6 bg-white border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="h-10 w-48 bg-gray-200 rounded animate-pulse mb-2"></div>
          <div className="h-5 w-32 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>

      {/* Filter Skeleton */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="h-10 w-24 bg-gray-200 rounded animate-pulse"></div>
            <div className="flex gap-4">
              <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-10 w-20 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Properties Grid Skeleton */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <PropertyCardSkeleton key={index} />
          ))}
        </div>
      </div>
    </div>
  );
}

function PropertyCardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      {/* Image Skeleton */}
      <div className="relative aspect-[4/3] bg-gray-200 animate-pulse"></div>

      {/* Content Skeleton */}
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="h-5 w-3/4 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-5 w-12 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse"></div>
        <div className="flex gap-3">
          <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
          <div className="h-6 w-24 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}

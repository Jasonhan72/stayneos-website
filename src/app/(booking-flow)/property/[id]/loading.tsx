export default function PropertyDetailLoading() {
  return (
    <main className="min-h-screen bg-white pt-24 pb-12">
      <div className="container mx-auto px-4">
        <div className="h-8 w-32 bg-neutral-200 animate-pulse rounded mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-6">
            <div className="h-10 w-3/4 bg-neutral-200 animate-pulse rounded" />
            <div className="h-5 w-1/2 bg-neutral-200 animate-pulse rounded" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2 aspect-[4/3] bg-neutral-200 animate-pulse rounded-2xl" />
              <div className="aspect-[4/3] bg-neutral-200 animate-pulse rounded-2xl" />
              <div className="aspect-[4/3] bg-neutral-200 animate-pulse rounded-2xl" />
            </div>
            <div className="space-y-3">
              <div className="h-6 w-40 bg-neutral-200 animate-pulse rounded" />
              <div className="h-4 w-full bg-neutral-200 animate-pulse rounded" />
              <div className="h-4 w-full bg-neutral-200 animate-pulse rounded" />
              <div className="h-4 w-5/6 bg-neutral-200 animate-pulse rounded" />
            </div>
          </div>
          <div className="lg:col-span-5">
            <div className="border border-neutral-200 rounded-2xl p-6 space-y-4 shadow-sm">
              <div className="h-8 w-32 bg-neutral-200 animate-pulse rounded" />
              <div className="h-14 w-full bg-neutral-200 animate-pulse rounded-xl" />
              <div className="h-14 w-full bg-neutral-200 animate-pulse rounded-xl" />
              <div className="h-12 w-full bg-neutral-200 animate-pulse rounded-xl" />
              <div className="h-px w-full bg-neutral-200" />
              <div className="h-5 w-2/3 bg-neutral-200 animate-pulse rounded" />
              <div className="h-5 w-1/2 bg-neutral-200 animate-pulse rounded" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

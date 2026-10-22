function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-[#ece8d9] ${className}`} />;
}

export default function WorkspaceLoading() {
  return (
    <section aria-label="Loading page content" aria-busy="true" className="space-y-6">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-5">
        {Array.from({ length: 10 }, (_, index) => (
          <div key={index} className="rounded-2xl border border-[#e9e4cf] bg-white p-5 shadow-sm">
            <Skeleton className="mb-3 h-7 w-16" />
            <Skeleton className="h-4 w-28 max-w-full" />
          </div>
        ))}
      </div>
      <div className="rounded-2xl border border-[#e9e4cf] bg-white p-5 shadow-sm">
        <Skeleton className="mb-5 h-5 w-44" />
        <div className="space-y-3">
          {Array.from({ length: 5 }, (_, index) => (
            <div key={index} className="flex items-center gap-4 border-b border-[#f0ede2] pb-3 last:border-0">
              <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="hidden h-4 w-28 sm:block" />
              <Skeleton className="h-8 w-20" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

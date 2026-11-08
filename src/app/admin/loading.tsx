export default function AdminLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Top Banner Skeleton */}
      <div className="h-28 sm:h-32 rounded-3xl bg-slate-200 dark:bg-slate-800/80 w-full" />

      {/* Action / Filter Bar Skeleton */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="h-10 w-full sm:w-72 rounded-xl bg-slate-200 dark:bg-slate-800/80" />
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="h-10 w-24 rounded-xl bg-slate-200 dark:bg-slate-800/80" />
          <div className="h-10 w-32 rounded-xl bg-slate-200 dark:bg-slate-800/80" />
        </div>
      </div>

      {/* Table / Grid Skeleton */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3">
        <div className="h-6 w-1/4 rounded bg-slate-200 dark:bg-slate-800/80" />
        <div className="space-y-2 pt-2">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-14 rounded-xl bg-slate-100 dark:bg-slate-800/50 flex items-center px-4 justify-between"
            >
              <div className="h-4 w-1/3 rounded bg-slate-200 dark:bg-slate-700/60" />
              <div className="h-4 w-1/6 rounded bg-slate-200 dark:bg-slate-700/60" />
              <div className="h-4 w-1/12 rounded bg-slate-200 dark:bg-slate-700/60" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

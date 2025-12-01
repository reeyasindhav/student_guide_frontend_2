"use client";

export function VideoGridSkeleton({ count = 12 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex flex-col animate-pulse">
          <div className="w-full aspect-video bg-gray-200 dark:bg-gray-800 rounded-lg mb-3" />
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800" />
            <div className="flex-1">
              <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded mb-2" />
              <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-2/3" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function VideoListSkeleton({ count = 5 }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex gap-4 animate-pulse">
          <div className="w-48 h-28 bg-gray-200 dark:bg-gray-800 rounded-lg flex-shrink-0" />
          <div className="flex-1">
            <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded mb-2" />
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/3 mb-2" />
            <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

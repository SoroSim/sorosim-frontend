interface WasmLoadingSkeletonProps {
  count?: number
}

export default function WasmLoadingSkeleton({ count = 6 }: WasmLoadingSkeletonProps) {
  return (
    <div className="space-y-4">
      {/* Contract name skeleton */}
      <div className="bg-gray-200 dark:bg-gray-700 animate-pulse h-12 rounded-lg"></div>
      
      {/* Search input skeleton */}
      <div className="space-y-2">
        <div className="bg-gray-200 dark:bg-gray-700 animate-pulse h-4 rounded w-32"></div>
        <div className="bg-gray-200 dark:bg-gray-700 animate-pulse h-10 rounded"></div>
      </div>
      
      {/* Function selector label skeleton */}
      <div className="bg-gray-200 dark:bg-gray-700 animate-pulse h-4 rounded w-40 mt-4"></div>
      
      {/* Function dropdown skeleton */}
      <div className="bg-gray-200 dark:bg-gray-700 animate-pulse h-10 rounded"></div>
      
      {/* Function signature skeleton */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded p-3 space-y-2">
        <div className="bg-gray-200 dark:bg-gray-700 animate-pulse h-3 rounded w-20"></div>
        <div className="bg-gray-200 dark:bg-gray-700 animate-pulse h-4 rounded w-full"></div>
      </div>
      
      {/* Contract info skeleton */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded p-3 space-y-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <div key={index} className="flex justify-between">
            <div className="bg-gray-200 dark:bg-gray-700 animate-pulse h-4 rounded w-24"></div>
            <div className="bg-gray-200 dark:bg-gray-700 animate-pulse h-4 rounded w-16"></div>
          </div>
        ))}
      </div>
    </div>
  )
}

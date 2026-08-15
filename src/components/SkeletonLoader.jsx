import React from "react";

// Base shimmer block
function Shimmer({ className = "" }) {
  return (
    <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`} />
  );
}

// Card skeleton (generic)
export function SkeletonCard({ lines = 3 }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-100 dark:border-gray-700 space-y-3">
      <Shimmer className="h-4 w-1/3" />
      {Array.from({ length: lines }).map((_, i) => (
        <Shimmer key={i} className={`h-3 ${i === lines - 1 ? "w-2/3" : "w-full"}`} />
      ))}
    </div>
  );
}

// Rate card skeleton
export function SkeletonRateCard() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-100 dark:border-gray-700 space-y-2">
      <Shimmer className="h-3 w-2/3" />
      <Shimmer className="h-7 w-1/2" />
    </div>
  );
}

// Chart skeleton
export function SkeletonChart() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-100 dark:border-gray-700">
      <Shimmer className="h-4 w-1/4 mb-4" />
      <div className="flex items-end space-x-2 h-48">
        {[40, 65, 45, 80, 55, 70, 50, 90].map((h, i) => (
          <Shimmer key={i} className="flex-1 rounded-t" style={{ height: `${h}%` }} />
        ))}
      </div>
    </div>
  );
}

// Health score skeleton
export function SkeletonHealthScore() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-100 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-2">
          <Shimmer className="h-5 w-40" />
          <Shimmer className="h-3 w-24" />
        </div>
        <Shimmer className="h-20 w-20 rounded-full" />
      </div>
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center space-x-3">
            <Shimmer className="h-3 w-28" />
            <Shimmer className="h-2 flex-1" />
            <Shimmer className="h-3 w-8" />
          </div>
        ))}
      </div>
    </div>
  );
}

// Table skeleton
export function SkeletonTable({ rows = 5 }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-100 dark:border-gray-700">
      <Shimmer className="h-4 w-1/4 mb-4" />
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center space-x-4">
            <Shimmer className="h-3 w-6" />
            <Shimmer className="h-3 flex-1" />
            <Shimmer className="h-3 w-16" />
            <Shimmer className="h-3 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}

// Full dashboard skeleton
export function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Health Score */}
      <SkeletonHealthScore />

      {/* Rate Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <SkeletonRateCard key={i} />
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SkeletonChart />
        <SkeletonChart />
      </div>

      {/* Posts */}
      <SkeletonCard lines={5} />

      {/* Two column */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SkeletonTable rows={5} />
        <SkeletonTable rows={5} />
      </div>

      {/* Two column */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SkeletonCard lines={4} />
        <SkeletonCard lines={4} />
      </div>
    </div>
  );
}

export default DashboardSkeleton;

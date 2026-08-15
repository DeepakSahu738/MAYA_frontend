import React from "react";

export default function CaptionLengthInsight({ captionLengthInsight }) {
  if (!captionLengthInsight) return null;

  const { shortCount, mediumCount, longCount, shortAvgEngagementRate, mediumAvgEngagementRate, longAvgEngagementRate, bestBucket, recommendation } = captionLengthInsight;

  const buckets = [
    { label: "Short", count: shortCount, er: shortAvgEngagementRate, color: "bg-blue-500" },
    { label: "Medium", count: mediumCount, er: mediumAvgEngagementRate, color: "bg-teal-500" },
    { label: "Long", count: longCount, er: longAvgEngagementRate, color: "bg-indigo-500" },
  ];

  const maxER = Math.max(shortAvgEngagementRate || 0, mediumAvgEngagementRate || 0, longAvgEngagementRate || 0);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-100 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Caption Length Analysis</h3>

      <div className="space-y-4 mb-4">
        {buckets.map((bucket, idx) => (
          <div key={idx}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-700 dark:text-gray-200">
                {bucket.label}
                {bucket.label.toLowerCase() === bestBucket?.toLowerCase() && (
                  <span className="ml-2 text-xs text-teal-600 dark:text-teal-400 font-medium">★ Best</span>
                )}
              </span>
              <div className="flex items-center space-x-3">
                <span className="text-xs text-gray-500 dark:text-gray-400">{bucket.count} posts</span>
                <span className="text-sm font-medium text-gray-800 dark:text-gray-100">{bucket.er?.toFixed(2)}% ER</span>
              </div>
            </div>
            <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${bucket.color}`}
                style={{ width: `${maxER > 0 ? (bucket.er / maxER) * 100 : 0}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {recommendation && (
        <p className="text-xs text-gray-500 dark:text-gray-400 italic">💡 {recommendation}</p>
      )}
    </div>
  );
}

import React from "react";

const MEDALS = ["🥇", "🥈", "🥉"];

export default function Superfans({ topCommenters }) {
  if (!topCommenters || topCommenters.length === 0) return null;

  const maxScore = topCommenters[0]?.superfanScore || 1;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
      <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100 mb-5">Top Superfans</h3>

      <div className="space-y-3">
        {topCommenters.map((fan, idx) => (
          <div
            key={idx}
            className="flex items-center p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
          >
            {/* Rank */}
            <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center mr-3">
              {idx < 3 ? (
                <span className="text-2xl">{MEDALS[idx]}</span>
              ) : (
                <span className="text-sm font-bold text-gray-400 dark:text-gray-500 w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                  {idx + 1}
                </span>
              )}
            </div>

            {/* User Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                @{fan.username}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {fan.commentCount} comments
              </p>
            </div>

            {/* Score bar */}
            <div className="flex-shrink-0 w-24 mx-3">
              <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ease-out ${
                    idx === 0 ? "bg-yellow-400" : idx === 1 ? "bg-gray-400" : idx === 2 ? "bg-orange-400" : "bg-teal-500"
                  }`}
                  style={{ width: `${(fan.superfanScore / maxScore) * 100}%` }}
                />
              </div>
            </div>

            {/* Likes */}
            <div className="flex-shrink-0 text-right">
              <p className="text-sm font-semibold text-teal-700 dark:text-teal-400">
                {fan.totalLikesReceived?.toLocaleString()}
              </p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400">likes</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

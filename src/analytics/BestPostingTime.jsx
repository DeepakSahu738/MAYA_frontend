import React from "react";

export default function BestPostingTime({ bestPostingTime }) {
  if (!bestPostingTime) return null;

  const formatHour = (hour) => {
    if (hour === 0) return "12 AM";
    if (hour === 12) return "12 PM";
    return hour > 12 ? `${hour - 12} PM` : `${hour} AM`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-100 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Best Posting Time</h3>

      <div className="flex items-center space-x-4 mb-5 p-4 bg-teal-50 dark:bg-teal-900/20 rounded-lg">
        <div className="w-12 h-12 bg-teal-100 dark:bg-teal-900/40 rounded-full flex items-center justify-center">
          <span className="material-symbols-outlined text-teal-600 dark:text-teal-400">schedule</span>
        </div>
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Best time to post</p>
          <p className="text-lg font-bold text-gray-800 dark:text-gray-100">
            {bestPostingTime.bestDay}, {formatHour(bestPostingTime.bestHour)}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Avg ER: {bestPostingTime.avgEngagementRate?.toFixed(2)}% • {bestPostingTime.timezone}
          </p>
        </div>
      </div>

      {bestPostingTime.topSlots && bestPostingTime.topSlots.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Top Time Slots</h4>
          <div className="space-y-2">
            {bestPostingTime.topSlots.map((slot, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-md"
              >
                <span className="text-sm text-gray-700 dark:text-gray-200">
                  {slot.day}, {formatHour(slot.hour)}
                </span>
                <span className="text-xs font-medium text-teal-700 dark:text-teal-400">
                  {slot.avgEngagementRate?.toFixed(2)}% ER
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

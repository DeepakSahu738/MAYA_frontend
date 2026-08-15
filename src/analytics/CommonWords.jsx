import React from "react";

export default function CommonWords({ commonWords }) {
  if (!commonWords || commonWords.length === 0) return null;

  const maxFrequency = commonWords[0]?.frequency || 1;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-100 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Common Words in Comments</h3>

      <div className="space-y-2">
        {commonWords.map((item, idx) => (
          <div key={idx} className="flex items-center space-x-3">
            <span className="text-xs text-gray-400 w-5 text-right">{idx + 1}</span>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{item.word}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">{item.frequency}</span>
              </div>
              <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-teal-500 rounded-full"
                  style={{ width: `${(item.frequency / maxFrequency) * 100}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

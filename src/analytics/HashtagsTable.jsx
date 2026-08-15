import React, { useState } from "react";

export default function HashtagsTable({ mostUsedHashtags, topPerformingHashtags }) {
  const [activeTab, setActiveTab] = useState("used");

  if (!mostUsedHashtags && !topPerformingHashtags) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-100 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Hashtags</h3>
        <div className="flex bg-gray-100 dark:bg-gray-700 rounded-md p-0.5">
          <button
            onClick={() => setActiveTab("used")}
            className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
              activeTab === "used"
                ? "bg-teal-600 text-white"
                : "text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
            }`}
          >
            Most Used
          </button>
          <button
            onClick={() => setActiveTab("performing")}
            className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
              activeTab === "performing"
                ? "bg-teal-600 text-white"
                : "text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
            }`}
          >
            Top Performing
          </button>
        </div>
      </div>

      {activeTab === "used" && mostUsedHashtags && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">
                <th className="pb-2 font-medium">#</th>
                <th className="pb-2 font-medium">Hashtag</th>
                <th className="pb-2 font-medium text-right">Uses</th>
                <th className="pb-2 font-medium text-right">Total Likes</th>
              </tr>
            </thead>
            <tbody>
              {mostUsedHashtags.map((tag, idx) => (
                <tr key={idx} className="border-b border-gray-50 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="py-2 text-gray-400">{idx + 1}</td>
                  <td className="py-2 text-teal-700 dark:text-teal-400 font-medium">#{tag.hashtag}</td>
                  <td className="py-2 text-right text-gray-700 dark:text-gray-300">{tag.usageCount}</td>
                  <td className="py-2 text-right text-gray-700 dark:text-gray-300">{tag.totalLikes?.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "performing" && topPerformingHashtags && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">
                <th className="pb-2 font-medium">#</th>
                <th className="pb-2 font-medium">Hashtag</th>
                <th className="pb-2 font-medium text-right">Avg ER</th>
                <th className="pb-2 font-medium text-right">Avg Reach</th>
                <th className="pb-2 font-medium text-right">Total Likes</th>
              </tr>
            </thead>
            <tbody>
              {topPerformingHashtags.map((tag, idx) => (
                <tr key={idx} className="border-b border-gray-50 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="py-2 text-gray-400">{idx + 1}</td>
                  <td className="py-2 text-teal-700 dark:text-teal-400 font-medium">#{tag.hashtag}</td>
                  <td className="py-2 text-right text-gray-700 dark:text-gray-300">{tag.avgEngagementRate?.toFixed(2)}%</td>
                  <td className="py-2 text-right text-gray-700 dark:text-gray-300">{tag.avgReach?.toLocaleString()}</td>
                  <td className="py-2 text-right text-gray-700 dark:text-gray-300">{tag.totalLikes?.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

import React, { useState } from "react";

export default function BestWorstPosts({ bestPosts, worstPosts }) {
  const [activeTab, setActiveTab] = useState("best");

  const posts = activeTab === "best" ? bestPosts : worstPosts;

  if (!bestPosts && !worstPosts) return null;

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-100 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Post Performance</h3>
        <div className="flex bg-gray-100 dark:bg-gray-700 rounded-md p-0.5">
          <button
            onClick={() => setActiveTab("best")}
            className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
              activeTab === "best"
                ? "bg-teal-600 text-white"
                : "text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
            }`}
          >
            Top 5
          </button>
          <button
            onClick={() => setActiveTab("worst")}
            className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
              activeTab === "worst"
                ? "bg-teal-600 text-white"
                : "text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
            }`}
          >
            Bottom 5
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {posts && posts.length > 0 ? (
          posts.map((post, idx) => (
            <div
              key={idx}
              className="flex items-start p-3 bg-gray-50 dark:bg-gray-700 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <div className="flex-shrink-0 w-8 h-8 bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-400 rounded-full flex items-center justify-center text-xs font-bold mr-3">
                {idx + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-800 dark:text-gray-200 truncate">
                  {post.caption || "No caption"}
                </p>
                <div className="flex items-center space-x-3 mt-1">
                  <span className="text-xs px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded capitalize">
                    {post.mediaType}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDate(post.postedAt)}
                  </span>
                </div>
              </div>
              <div className="flex-shrink-0 text-right ml-3">
                <p className="text-sm font-semibold text-teal-700 dark:text-teal-400">
                  {post.engagementRate?.toFixed(2)}% ER
                </p>
                <div className="flex items-center space-x-2 mt-1 text-xs text-gray-500 dark:text-gray-400">
                  <span>❤️ {post.likes?.toLocaleString()}</span>
                  <span>💬 {post.comments?.toLocaleString()}</span>
                  <span>🔖 {post.saves?.toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">No data available</p>
        )}
      </div>
    </div>
  );
}

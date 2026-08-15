import React from "react";

export default function MostLikedComments({ mostLikedComments }) {
  if (!mostLikedComments || mostLikedComments.length === 0) return null;

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-100 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Most Liked Comments</h3>

      <div className="space-y-3">
        {mostLikedComments.map((comment, idx) => (
          <div key={idx} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border-l-3 border-teal-500">
            <p className="text-sm text-gray-800 dark:text-gray-200 italic mb-2">"{comment.text}"</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-medium text-teal-700 dark:text-teal-400">@{comment.username}</span>
                <span className="text-xs text-gray-400">•</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">{formatDate(comment.commentedAt)}</span>
              </div>
              <span className="text-xs font-medium text-red-500">❤️ {comment.likeCount}</span>
            </div>
            {comment.postCaption && (
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 truncate">
                On: {comment.postCaption}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

import React from "react";

export default function QuestionsInsight({ questionsInsight }) {
  if (!questionsInsight) return null;

  const { totalQuestions, unansweredCount, questionsThisWeek, deltaVsLastWeek, topQuestions } = questionsInsight;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-100 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Questions from Audience</h3>

      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
          <p className="text-xl font-bold text-gray-800 dark:text-gray-100">{totalQuestions}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
        </div>
        <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-md">
          <p className="text-xl font-bold text-orange-700 dark:text-orange-400">{unansweredCount}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Unanswered</p>
        </div>
        <div className="text-center p-3 bg-teal-50 dark:bg-teal-900/20 rounded-md">
          <p className="text-xl font-bold text-teal-700 dark:text-teal-400">{questionsThisWeek}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">This Week</p>
          {deltaVsLastWeek !== null && deltaVsLastWeek !== undefined && (
            <p className={`text-xs mt-0.5 ${deltaVsLastWeek >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
              {deltaVsLastWeek >= 0 ? "+" : ""}{deltaVsLastWeek} vs last week
            </p>
          )}
        </div>
      </div>

      {topQuestions && topQuestions.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Top Questions</h4>
          <div className="space-y-2">
            {topQuestions.map((q, idx) => (
              <div key={idx} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                <p className="text-sm text-gray-800 dark:text-gray-200 italic">"{q.text}"</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-gray-500 dark:text-gray-400">@{q.username}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">❤️ {q.likeCount}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

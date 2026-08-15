import React from "react";

export default function QuestionsVsStatements({ questionsVsStatements }) {
  if (!questionsVsStatements) return null;

  const { questionCount, statementCount, questionPct, statementPct, questionHeavyPostAvgLikes, statementHeavyPostAvgLikes, likeDelta } = questionsVsStatements;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-100 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Questions vs Statements</h3>

      <div className="flex items-center space-x-2 mb-4">
        <div
          className="h-3 bg-teal-500 rounded-l-full"
          style={{ width: `${questionPct}%` }}
        />
        <div
          className="h-3 bg-indigo-500 rounded-r-full"
          style={{ width: `${statementPct}%` }}
        />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center p-3 bg-teal-50 dark:bg-teal-900/20 rounded-md">
          <p className="text-lg font-bold text-teal-700 dark:text-teal-400">{questionCount}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400">Questions ({questionPct?.toFixed(1)}%)</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Avg likes: {questionHeavyPostAvgLikes?.toLocaleString()}
          </p>
        </div>
        <div className="text-center p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-md">
          <p className="text-lg font-bold text-indigo-700 dark:text-indigo-400">{statementCount}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400">Statements ({statementPct?.toFixed(1)}%)</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Avg likes: {statementHeavyPostAvgLikes?.toLocaleString()}
          </p>
        </div>
      </div>

      {likeDelta !== null && likeDelta !== undefined && (
        <p className={`text-xs text-center ${likeDelta >= 0 ? "text-teal-600 dark:text-teal-400" : "text-indigo-600 dark:text-indigo-400"}`}>
          {likeDelta >= 0
            ? `Questions get ${likeDelta.toLocaleString()} more avg likes`
            : `Statements get ${Math.abs(likeDelta).toLocaleString()} more avg likes`}
        </p>
      )}
    </div>
  );
}

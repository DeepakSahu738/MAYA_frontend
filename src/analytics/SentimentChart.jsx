import React from "react";

export default function SentimentChart({ sentimentBreakdown }) {
  if (!sentimentBreakdown) return null;

  const { positiveCount, neutralCount, negativeCount, positivePercentage, neutralPercentage, negativePercentage } = sentimentBreakdown;
  const total = positiveCount + neutralCount + negativeCount;

  const sentiments = [
    { emoji: "😊", label: "Positive", count: positiveCount, pct: positivePercentage, color: "bg-green-500", barColor: "bg-green-400" },
    { emoji: "😐", label: "Neutral", count: neutralCount, pct: neutralPercentage, color: "bg-gray-400", barColor: "bg-gray-400" },
    { emoji: "😠", label: "Negative", count: negativeCount, pct: negativePercentage, color: "bg-red-500", barColor: "bg-red-400" },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
      <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100 mb-5">Comment Sentiment</h3>

      {/* Emoji bar */}
      <div className="flex items-center justify-center space-x-8 mb-6">
        {sentiments.map((s, idx) => (
          <div key={idx} className="text-center group cursor-default">
            <span className="text-4xl block mb-1 group-hover:scale-125 transition-transform duration-200">
              {s.emoji}
            </span>
            <p className="text-lg font-bold text-gray-800 dark:text-gray-100">
              {s.pct?.toFixed(0)}%
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Distribution bar */}
      <div className="flex h-3 rounded-full overflow-hidden mb-4">
        {sentiments.map((s, idx) => (
          <div
            key={idx}
            className={`${s.barColor} transition-all duration-700 ease-out`}
            style={{ width: `${s.pct}%` }}
          />
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        {sentiments.map((s, idx) => (
          <div key={idx} className="flex items-center space-x-1.5">
            <div className={`w-2.5 h-2.5 rounded-full ${s.color}`} />
            <span>{s.count} {s.label.toLowerCase()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

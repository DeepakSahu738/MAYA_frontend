import React from "react";

export default function AISummaryCard({ dashboardData }) {
  if (!dashboardData) return null;

  const { healthScore, trendDirection, engagementTrend, bestPostingTime } = dashboardData;

  // Generate a smart summary from the data
  const generateSummary = () => {
    const parts = [];

    // Trend
    if (trendDirection === "GROWING") {
      parts.push("Your account is growing 📈");
    } else if (trendDirection === "DECLINING") {
      parts.push("Your engagement is declining 📉");
    } else {
      parts.push("Your performance is steady ➡️");
    }

    // Health
    if (healthScore?.score >= 80) {
      parts.push(`with a strong health score of ${healthScore.score}/100.`);
    } else if (healthScore?.score >= 60) {
      parts.push(`with a decent health score of ${healthScore.score}/100.`);
    } else {
      parts.push(`with a health score of ${healthScore.score}/100 that needs attention.`);
    }

    // Tip
    if (healthScore?.improvements && healthScore.improvements.length > 0) {
      parts.push(`Focus area: ${healthScore.improvements[0].toLowerCase()}`);
    } else if (bestPostingTime?.bestDay) {
      parts.push(`Best time to post: ${bestPostingTime.bestDay}s.`);
    }

    return parts.join(" ");
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-5 shadow-lg">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full -mr-10 -mt-10 blur-2xl" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-cyan-500/10 rounded-full -ml-6 -mb-6 blur-2xl" />

      <div className="relative flex items-start space-x-4">
        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-xl flex items-center justify-center shadow-md">
          <span className="material-symbols-outlined text-white text-lg">psychology</span>
        </div>
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <p className="text-xs font-semibold text-teal-400 uppercase tracking-wide">AI Insight</p>
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
          </div>
          <p className="text-sm text-gray-200 leading-relaxed">
            {generateSummary()}
          </p>
        </div>
      </div>
    </div>
  );
}

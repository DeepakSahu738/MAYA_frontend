import React from "react";

export default function CTAInsight({ ctaInsight }) {
  if (!ctaInsight) return null;

  const { ctaPostCount, noCtaPostCount, ctaAvgEngagement, noCtaAvgEngagement, engagementLift, topCtaType } = ctaInsight;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-100 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">CTA Performance</h3>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="p-4 bg-teal-50 dark:bg-teal-900/20 rounded-lg text-center">
          <p className="text-2xl font-bold text-teal-700 dark:text-teal-400">{ctaAvgEngagement?.toFixed(0)}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">With CTA ({ctaPostCount} posts)</p>
        </div>
        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
          <p className="text-2xl font-bold text-gray-700 dark:text-gray-200">{noCtaAvgEngagement?.toFixed(0)}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Without CTA ({noCtaPostCount} posts)</p>
        </div>
      </div>

      {engagementLift !== null && engagementLift !== undefined && (
        <div className={`p-3 rounded-md text-center mb-4 ${engagementLift >= 0 ? "bg-green-50 dark:bg-green-900/20" : "bg-red-50 dark:bg-red-900/20"}`}>
          <p className={`text-sm font-medium ${engagementLift >= 0 ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"}`}>
            {engagementLift >= 0 ? "+" : ""}{engagementLift.toFixed(1)}% engagement lift with CTAs
          </p>
        </div>
      )}

      {topCtaType && (
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          Best performing CTA type: <span className="font-medium text-gray-700 dark:text-gray-200">{topCtaType}</span>
        </p>
      )}
    </div>
  );
}

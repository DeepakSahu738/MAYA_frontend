import React from "react";
import { getPlatformConfig, formatInsightValue } from "./platformConfig";

export default function PlatformInsights({ platformInsights, platform }) {
  // Only render if there are platform-specific insights (IG/OTHER return empty arrays)
  if (!platformInsights || platformInsights.length === 0) return null;

  const config = getPlatformConfig(platform);
  const Icon = config.icon;

  return (
    <div className="mb-8">
      <div className="flex items-center space-x-2 mb-4">
        {Icon && <Icon className={`text-lg ${config.color}`} />}
        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
          {config.label} Insights
        </h3>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {platformInsights.map((card) => {
          const formatted = formatInsightValue(card.value, card.unit);
          return (
            <div
              key={card.key}
              className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  {card.label}
                </p>
                {card.description && (
                  <div className="relative group flex-shrink-0">
                    <span className="w-4 h-4 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center cursor-help">
                      <span className="material-symbols-outlined text-[10px] text-gray-400 dark:text-gray-500">info</span>
                    </span>
                    <div className="absolute bottom-full right-0 mb-2 w-44 p-2 bg-gray-900 dark:bg-gray-700 text-white text-[11px] leading-relaxed rounded-lg shadow-lg z-30 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                      {card.description}
                      <div className="absolute top-full right-2 w-2 h-2 bg-gray-900 dark:bg-gray-700 rotate-45 -mt-1" />
                    </div>
                  </div>
                )}
              </div>
              {formatted !== null ? (
                <span className={`text-2xl font-bold ${config.accent}`}>{formatted}</span>
              ) : (
                <span className="text-sm text-gray-400 dark:text-gray-500 italic">Not enough data yet</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

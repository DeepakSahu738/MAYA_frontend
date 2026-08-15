import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function EngagementTrend({ engagementTrend, trendDirection }) {
  if (!engagementTrend || engagementTrend.length === 0) return null;

  const getTrendBadge = (direction) => {
    switch (direction) {
      case "GROWING":
        return { label: "Growing", color: "text-green-400", bg: "bg-green-500/10" };
      case "DECLINING":
        return { label: "Declining", color: "text-red-400", bg: "bg-red-500/10" };
      case "FLAT":
        return { label: "Flat", color: "text-gray-400", bg: "bg-gray-500/10" };
      default:
        return null;
    }
  };

  const badge = getTrendBadge(trendDirection);

  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num;
  };

  return (
    <div className="bg-gray-900 dark:bg-gray-950 rounded-2xl p-6 shadow-lg border border-gray-800">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-gray-100">Engagement Trend</h3>
        {badge && (
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${badge.bg} ${badge.color}`}>
            {badge.label}
          </span>
        )}
      </div>
      <div className="w-full h-56">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={engagementTrend} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="engagementGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
            <XAxis
              dataKey="week"
              tick={{ fontSize: 10, fill: "#6b7280" }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tickFormatter={formatNumber}
              tick={{ fontSize: 10, fill: "#6b7280" }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              formatter={(value) => [value.toLocaleString(), "Total Engagement"]}
              labelFormatter={(label) => `Week: ${label}`}
              contentStyle={{
                fontSize: 12,
                borderRadius: 12,
                border: "none",
                backgroundColor: "#1f2937",
                color: "#f3f4f6",
                boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
              }}
            />
            <Area
              type="monotone"
              dataKey="totalEngagement"
              stroke="#14b8a6"
              strokeWidth={2.5}
              fill="url(#engagementGradient)"
              dot={{ r: 4, fill: "#14b8a6", strokeWidth: 2, stroke: "#1f2937" }}
              activeDot={{ r: 6, fill: "#14b8a6", stroke: "#fff", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

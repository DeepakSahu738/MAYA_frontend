import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const COLORS = ["#14b8a6", "#818cf8"];

export default function ContentMix({ contentMix }) {
  if (!contentMix) return null;

  const pieData = [
    { name: "Images", value: contentMix.imagePct },
    { name: "Videos", value: contentMix.videoPct },
  ];

  return (
    <div className="bg-gray-900 dark:bg-gray-950 rounded-2xl p-6 shadow-lg border border-gray-800">
      <h3 className="text-base font-semibold text-gray-100 mb-4">Content Mix</h3>

      <div className="flex flex-col md:flex-row items-center gap-6">
        {/* Pie Chart */}
        <div className="w-44 h-44">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                innerRadius={50}
                outerRadius={70}
                dataKey="value"
                paddingAngle={3}
                strokeWidth={0}
              >
                {pieData.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => `${value.toFixed(1)}%`}
                contentStyle={{
                  fontSize: 12,
                  borderRadius: 12,
                  border: "none",
                  backgroundColor: "#1f2937",
                  color: "#f3f4f6",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Stats */}
        <div className="flex-1 space-y-3 w-full">
          <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-xl">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-teal-500" />
              <span className="text-sm text-gray-300">Images</span>
            </div>
            <div className="text-right">
              <span className="text-sm font-medium text-gray-100">{contentMix.imageCount} posts</span>
              <span className="text-xs text-gray-400 ml-2">ER: {contentMix.imageAvgEngagementRate?.toFixed(2)}%</span>
            </div>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-xl">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-indigo-400" />
              <span className="text-sm text-gray-300">Videos</span>
            </div>
            <div className="text-right">
              <span className="text-sm font-medium text-gray-100">{contentMix.videoCount} posts</span>
              <span className="text-xs text-gray-400 ml-2">ER: {contentMix.videoAvgEngagementRate?.toFixed(2)}%</span>
            </div>
          </div>

          {contentMix.recommendation && (
            <p className="text-xs text-gray-400 mt-2 italic px-1">
              💡 {contentMix.recommendation}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

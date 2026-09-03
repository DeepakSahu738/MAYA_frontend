import React, { useState, useEffect, useRef } from "react";

function AnimatedRing({ score, size = 120, strokeWidth = 10 }) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (animatedScore / 100) * circumference;

  useEffect(() => {
    let start = 0;
    const duration = 1500;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Easing function (ease-out cubic)
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedScore(Math.round(eased * score));
      if (progress < 1) requestAnimationFrame(animate);
    };
    animate();
  }, [score]);

  const getColor = (s) => {
    if (s >= 80) return "#0d9488";
    if (s >= 60) return "#22c55e";
    if (s >= 40) return "#eab308";
    return "#ef4444";
  };

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-gray-200 dark:text-gray-700"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={getColor(score)}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-gray-800 dark:text-gray-100">{animatedScore}</span>
        <span className="text-xs text-gray-500 dark:text-gray-400">/ 100</span>
      </div>
    </div>
  );
}

export default function HealthScoreCard({ healthScore }) {
  if (!healthScore) return null;

  const { score, grade, componentScores, strengths, improvements } = healthScore;

  // Insufficient data / null score → empty state
  const isInsufficient = score === null || score === undefined || grade === "Insufficient Data";

  const getGradient = (grade) => {
    switch (grade) {
      case "Excellent": return "from-teal-600 via-teal-500 to-cyan-500";
      case "Good": return "from-green-600 via-green-500 to-emerald-400";
      case "Fair": return "from-yellow-600 via-yellow-500 to-amber-400";
      case "Average": return "from-yellow-600 via-yellow-500 to-amber-400";
      case "Critical": return "from-red-600 via-red-500 to-orange-400";
      case "Poor": return "from-red-600 via-red-500 to-orange-400";
      default: return "from-gray-600 to-gray-500";
    }
  };

  const getScoreBarColor = (value) => {
    if (value >= 80) return "bg-teal-500";
    if (value >= 60) return "bg-green-500";
    if (value >= 40) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getDescription = (score) => {
    if (score >= 80) return "Your account is performing excellently. Keep it up!";
    if (score >= 60) return "Good performance with room for improvement.";
    if (score >= 40) return "Your account needs attention in some areas.";
    return "Significant improvements needed across multiple areas.";
  };

  // Insufficient data empty state
  if (isInsufficient) {
    return (
      <div className="rounded-2xl overflow-hidden shadow-lg">
        <div className="bg-gradient-to-r from-gray-600 to-gray-500 p-6 md:p-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-white text-center md:text-left">
              <p className="text-sm font-medium opacity-80 uppercase tracking-wide">Account Health</p>
              <h2 className="text-3xl font-bold mt-1">Insufficient Data</h2>
              <p className="text-sm opacity-80 mt-2 max-w-xs">
                We need more post activity to calculate your health score. Keep posting and check back soon.
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 w-[130px] h-[130px] flex items-center justify-center">
              <span className="material-symbols-outlined text-white/70 text-5xl">hourglass_empty</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl overflow-hidden shadow-lg">
      {/* Gradient Banner */}
      <div className={`bg-gradient-to-r ${getGradient(grade)} p-6 md:p-8`}>
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Left: Text */}
          <div className="text-white text-center md:text-left">
            <p className="text-sm font-medium opacity-80 uppercase tracking-wide">Account Health</p>
            <h2 className="text-3xl font-bold mt-1">{grade}</h2>
            <p className="text-sm opacity-80 mt-2 max-w-xs">
              {getDescription(score)}
            </p>
          </div>

          {/* Right: Animated Ring */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
            <AnimatedRing score={score} size={130} strokeWidth={12} />
          </div>
        </div>
      </div>

      {/* Component Scores */}
      <div className="bg-white dark:bg-gray-800 p-6">
        {componentScores && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 uppercase tracking-wide">Performance Breakdown</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
              {Object.entries(componentScores).map(([key, value]) => (
                <div key={key} className="flex items-center space-x-3">
                  <span className="text-xs text-gray-500 dark:text-gray-400 w-32 capitalize truncate">
                    {key.replace(/_/g, " ")}
                  </span>
                  <div className="flex-1 h-2.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${getScoreBarColor(value)} transition-all duration-1000 ease-out`}
                      style={{ width: `${value}%` }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 w-8 text-right">{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Strengths & Improvements */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {strengths && strengths.length > 0 && (
            <div className="p-4 bg-green-50 dark:bg-green-900/10 rounded-xl border border-green-100 dark:border-green-800">
              <h3 className="text-sm font-semibold text-green-700 dark:text-green-400 mb-3 flex items-center">
                <span className="material-symbols-outlined text-base mr-1.5">thumb_up</span>
                Strengths
              </h3>
              <ul className="space-y-2">
                {strengths.map((item, idx) => (
                  <li key={idx} className="text-xs text-gray-600 dark:text-gray-400 flex items-start">
                    <span className="text-green-500 mr-2 mt-0.5">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {improvements && improvements.length > 0 && (
            <div className="p-4 bg-orange-50 dark:bg-orange-900/10 rounded-xl border border-orange-100 dark:border-orange-800">
              <h3 className="text-sm font-semibold text-orange-700 dark:text-orange-400 mb-3 flex items-center">
                <span className="material-symbols-outlined text-base mr-1.5">trending_up</span>
                Focus Areas
              </h3>
              <ul className="space-y-2">
                {improvements.map((item, idx) => (
                  <li key={idx} className="text-xs text-gray-600 dark:text-gray-400 flex items-start">
                    <span className="text-orange-500 mr-2 mt-0.5">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

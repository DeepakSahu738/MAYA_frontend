import React, { useState, useEffect, useRef } from "react";

// Simple, non-technical explanations for each metric
const METRIC_TOOLTIPS = {
  engagement_rate: "How actively your audience interacts with your posts overall",
  save_rate: "How many people saved your post — higher means content worth revisiting",
  share_rate: "How often people share your content with others — drives discovery",
  comment_rate: "How many people comment relative to who saw it — shows depth of connection",
  like_to_comment_ratio: "Likes vs comments — lower means your audience talks more, not just scrolls",
  play_through_rate: "What % of people who saw your video actually watched it",
  reach_efficiency: "How many new people see your content vs the same followers seeing it again",
  posting_frequency: "How often you post per week — consistency matters most",
  profile_conversion: "How many profile visitors actually follow you",
  content_mix_video_pct: "What % of your posts are videos",
  content_mix_image_pct: "What % of your posts are images",
  account_health_score: "Your overall account performance across all dimensions (0-100)",
  questions_vs_statements: "Whether question-style captions get more engagement than statements",
  cta_performance: "Whether posts with a call-to-action ('save this', 'comment below') perform better",
  caption_length: "Which caption length (short / medium / long) works best for your audience",
  sentiment_positive: "% of comments that are positive in tone",
  sentiment_negative: "% of comments that are negative — a rising number needs attention",
  questions_detected: "How many questions your audience is asking in comments",
  unanswered_questions: "Questions from fans that haven't been answered yet — content opportunities",
};

function useCountUp(target, duration = 1200, trigger = true) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!trigger || target === null || target === undefined) return;
    let start = 0;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(eased * target);
      if (progress < 1) requestAnimationFrame(animate);
    };
    animate();
  }, [target, trigger, duration]);

  return value;
}

function RateCard({ card, delay, unavailableInfo, platformLabel }) {
  const [visible, setVisible] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const animatedValue = useCountUp(card.currentValue, 1200, visible);

  // Determine card state
  const isUnavailable = !!unavailableInfo;
  const isEmpty = !isUnavailable && (card.currentValue === null || card.currentValue === undefined);

  const getTrendColor = (delta) => {
    if (delta === null || delta === undefined) return "border-l-gray-200 dark:border-l-gray-600";
    if (delta > 0) return "border-l-green-500";
    if (delta < 0) return "border-l-red-500";
    return "border-l-gray-300 dark:border-l-gray-600";
  };

  const getArrow = (delta) => {
    if (delta === null || delta === undefined) return null;
    if (delta > 0) return { icon: "trending_up", color: "text-green-600 dark:text-green-400", bg: "bg-green-50 dark:bg-green-900/20" };
    if (delta < 0) return { icon: "trending_down", color: "text-red-600 dark:text-red-400", bg: "bg-red-50 dark:bg-red-900/20" };
    return { icon: "trending_flat", color: "text-gray-500", bg: "bg-gray-50 dark:bg-gray-700" };
  };

  const formatValue = (value, unit) => {
    if (value === null || value === undefined) return "—";
    if (unit === "%") return `${value.toFixed(2)}%`;
    if (unit === "posts/week") return `${value.toFixed(1)}`;
    return value.toFixed(2);
  };

  const formatMetricName = (name) => {
    return name.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const arrow = getArrow(card.deltaVsLastWeek);

  return (
    <div
      ref={ref}
      className={`bg-white dark:bg-gray-800 rounded-xl p-5 border-l-4 ${getTrendColor(card.deltaVsLastWeek)} border border-gray-100 dark:border-gray-700 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-default ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
      style={{ transition: `opacity 0.5s ease ${delay}ms, transform 0.5s ease ${delay}ms, box-shadow 0.3s ease` }}
    >
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          {formatMetricName(card.metricName)}
        </p>
        {(METRIC_TOOLTIPS[card.metricName] || isUnavailable) && (
          <div className="relative"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            onClick={() => setShowTooltip(!showTooltip)}
          >
            <span className="w-4 h-4 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center cursor-help">
              <span className="material-symbols-outlined text-[10px] text-gray-400 dark:text-gray-500">info</span>
            </span>
            {showTooltip && (
              <div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-gray-900 dark:bg-gray-700 text-white text-[11px] leading-relaxed rounded-lg shadow-lg z-30 pointer-events-none">
                {isUnavailable ? unavailableInfo.reason : METRIC_TOOLTIPS[card.metricName]}
                <div className="absolute top-full right-2 w-2 h-2 bg-gray-900 dark:bg-gray-700 rotate-45 -mt-1" />
              </div>
            )}
          </div>
        )}
      </div>
      <div className="flex items-end justify-between">
        {isUnavailable ? (
          <span className="text-xs text-gray-400 dark:text-gray-500 italic">
            Not available on {platformLabel}
          </span>
        ) : isEmpty ? (
          <span className="text-xs text-gray-400 dark:text-gray-500 italic">Not enough data yet</span>
        ) : (
          <span className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            {formatValue(animatedValue, card.unit)}
          </span>
        )}
        {!isUnavailable && !isEmpty && arrow && (
          <div className={`flex items-center px-2 py-1 rounded-lg ${arrow.bg}`}>
            <span className={`material-symbols-outlined text-sm ${arrow.color}`}>{arrow.icon}</span>
            <span className={`text-xs font-semibold ${arrow.color} ml-0.5`}>
              {Math.abs(card.deltaVsLastWeek).toFixed(2)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function RateCards({ rateCards, unavailableMetrics, platform }) {
  if (!rateCards || rateCards.length === 0) return null;

  // Build a lookup of unavailable metric keys → { label, reason }
  const unavailableMap = {};
  (unavailableMetrics || []).forEach((m) => { unavailableMap[m.key] = m; });

  // Friendly platform label for "Not available on X"
  const platformLabel = platform
    ? platform.charAt(0) + platform.slice(1).toLowerCase()
    : "this platform";

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {rateCards.map((card, idx) => (
        <RateCard
          key={idx}
          card={card}
          delay={idx * 100}
          unavailableInfo={unavailableMap[card.metricName] || null}
          platformLabel={platformLabel}
        />
      ))}
    </div>
  );
}

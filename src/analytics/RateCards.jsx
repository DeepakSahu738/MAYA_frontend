import React, { useState, useEffect, useRef } from "react";

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

function RateCard({ card, delay }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const animatedValue = useCountUp(card.currentValue, 1200, visible);

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
      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
        {formatMetricName(card.metricName)}
      </p>
      <div className="flex items-end justify-between">
        <span className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          {card.currentValue !== null ? formatValue(animatedValue, card.unit) : "—"}
        </span>
        {arrow && (
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

export default function RateCards({ rateCards }) {
  if (!rateCards || rateCards.length === 0) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {rateCards.map((card, idx) => (
        <RateCard key={idx} card={card} delay={idx * 100} />
      ))}
    </div>
  );
}

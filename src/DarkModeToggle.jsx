import React, { useState, useEffect } from "react";

export default function DarkModeToggle() {
  const [isDark, setIsDark] = useState(() => {
    // Check localStorage first, default to dark mode
    const stored = localStorage.getItem("maya-theme");
    if (stored) return stored === "dark";
    return true; // Default: dark mode
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add("dark");
      localStorage.setItem("maya-theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("maya-theme", "light");
    }
  }, [isDark]);

  return (
    <button
      onClick={() => setIsDark(!isDark)}
      className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? (
        <span className="material-symbols-outlined text-yellow-400 text-xl">light_mode</span>
      ) : (
        <span className="material-symbols-outlined text-gray-600 text-xl">dark_mode</span>
      )}
    </button>
  );
}

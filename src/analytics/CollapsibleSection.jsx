import React, { useState, useEffect } from "react";

export default function CollapsibleSection({ title, icon, children, defaultOpen = true, id }) {
  const storageKey = `maya-section-${id}`;

  const [isOpen, setIsOpen] = useState(() => {
    const stored = localStorage.getItem(storageKey);
    if (stored !== null) return stored === "true";
    return defaultOpen;
  });

  useEffect(() => {
    localStorage.setItem(storageKey, String(isOpen));
  }, [isOpen, storageKey]);

  return (
    <div className="group">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full py-3 text-left"
      >
        <div className="flex items-center space-x-2">
          {icon && (
            <span className="material-symbols-outlined text-teal-600 dark:text-teal-400 text-lg">{icon}</span>
          )}
          <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100">{title}</h3>
        </div>
        <span className={`material-symbols-outlined text-gray-400 dark:text-gray-500 text-lg transition-transform duration-200 ${isOpen ? "" : "-rotate-90"}`}>
          expand_more
        </span>
      </button>

      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? "max-h-[5000px] opacity-100" : "max-h-0 opacity-0"}`}>
        {children}
      </div>
    </div>
  );
}

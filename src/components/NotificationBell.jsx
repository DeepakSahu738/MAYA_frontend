import React, { useState, useRef, useEffect } from "react";

const dummyNotifications = [
  { id: 1, text: "Welcome to MAYA! Start by exploring the AI Content Lab.", time: "Just now", read: false, icon: "waving_hand" },
  { id: 2, text: "Try the Instagram Analytics dashboard for detailed insights.", time: "2m ago", read: false, icon: "analytics" },
  { id: 3, text: "Ask MAYA AI anything about your social media strategy.", time: "5m ago", read: true, icon: "smart_toy" },
];

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState(dummyNotifications);
  const wrapperRef = useRef(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAllRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        aria-label="Notifications"
      >
        <span className="material-symbols-outlined text-gray-600 dark:text-gray-300 text-xl">notifications</span>
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="fixed sm:absolute left-4 right-4 sm:left-auto sm:right-0 top-16 sm:top-full sm:mt-2 w-auto sm:w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-30 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs text-teal-600 dark:text-teal-400 hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-64 overflow-y-auto">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className={`flex items-start px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                  !notif.read ? "bg-teal-50/50 dark:bg-teal-900/10" : ""
                }`}
              >
                <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0 mr-3">
                  <span className="material-symbols-outlined text-teal-600 dark:text-teal-400 text-sm">{notif.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700 dark:text-gray-200">{notif.text}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{notif.time}</p>
                </div>
                {!notif.read && (
                  <div className="w-2 h-2 bg-teal-500 rounded-full flex-shrink-0 mt-2" />
                )}
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-100 dark:border-gray-700 px-4 py-2">
            <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
              More notifications coming soon
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

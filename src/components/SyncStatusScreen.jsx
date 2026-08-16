import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCreator } from "../analytics/CreatorContext";

const API_BASE = "https://maya-backend-service-326007673689.asia-southeast1.run.app";

export default function SyncStatusScreen({ creatorId, platform, username, onComplete }) {
  const navigate = useNavigate();
  const { authState } = useCreator();
  const [status, setStatus] = useState("SYNCING");
  const [message, setMessage] = useState("Connecting to your account...");
  const [postsCount, setPostsCount] = useState(0);
  const [commentsCount, setCommentsCount] = useState(0);
  const [timedOut, setTimedOut] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!creatorId) return;

    let attempts = 0;
    const maxAttempts = 18; // 90 seconds at 5s intervals

    const poll = setInterval(async () => {
      attempts++;
      setElapsed(attempts * 5);

      try {
        const res = await fetch(`${API_BASE}/api/phyllo/sync-status/${creatorId}`, {
          headers: { Authorization: `Bearer ${authState.token}` },
        });

        if (res.ok) {
          const data = await res.json();
          setStatus(data.status);
          setMessage(data.message || "Syncing your data...");
          setPostsCount(data.postsCount || 0);
          setCommentsCount(data.commentsCount || 0);

          if (data.status === "READY") {
            clearInterval(poll);
          }
        }
      } catch (err) {
        console.error("Sync status poll error:", err);
      }

      if (attempts >= maxAttempts && status !== "READY") {
        clearInterval(poll);
        setTimedOut(true);
      }
    }, 5000);

    return () => clearInterval(poll);
  }, [creatorId, authState.token]);

  const handleViewDashboard = () => {
    if (onComplete) onComplete();
    navigate("/plan");
  };

  const steps = [
    { label: `Connected to ${platform || "Instagram"}`, done: true },
    { label: `${postsCount} posts fetched`, done: postsCount > 0 },
    { label: `Fetching comments${commentsCount > 0 ? ` (${commentsCount})` : ""}...`, done: commentsCount > 0 && status === "READY" },
    { label: "Building your analytics", done: status === "READY" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/70 backdrop-blur-sm px-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-8 border border-gray-200 dark:border-gray-700">

        {status !== "READY" && !timedOut && (
          <>
            {/* Syncing State */}
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 relative">
                <div className="w-16 h-16 border-4 border-teal-200 dark:border-teal-800 rounded-full" />
                <div className="absolute inset-0 w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Setting up your account...</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{message}</p>
            </div>

            {/* Steps */}
            <div className="space-y-3 mb-6">
              {steps.map((step, idx) => (
                <div key={idx} className="flex items-center space-x-3">
                  {step.done ? (
                    <span className="w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                      <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-sm">check</span>
                    </span>
                  ) : idx === steps.findIndex(s => !s.done) ? (
                    <span className="w-6 h-6 bg-teal-100 dark:bg-teal-900/30 rounded-full flex items-center justify-center">
                      <div className="w-3 h-3 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
                    </span>
                  ) : (
                    <span className="w-6 h-6 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-gray-300 dark:bg-gray-500 rounded-full" />
                    </span>
                  )}
                  <span className={`text-sm ${step.done ? "text-gray-800 dark:text-gray-200" : "text-gray-400 dark:text-gray-500"}`}>
                    {step.done ? "✓ " : ""}{step.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Progress info */}
            <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
              This usually takes 30-60 seconds. ({elapsed}s elapsed)
            </p>
          </>
        )}

        {status === "READY" && (
          <>
            {/* Success State */}
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-3xl">check_circle</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Your account is ready!</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                @{username || "your account"} has been fully synced.
              </p>
            </div>

            {/* Stats */}
            <div className="space-y-2 mb-6">
              <div className="flex items-center space-x-3 text-sm">
                <span className="w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-sm">check</span>
                </span>
                <span className="text-gray-700 dark:text-gray-300">{postsCount} posts synced</span>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <span className="w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-sm">check</span>
                </span>
                <span className="text-gray-700 dark:text-gray-300">{commentsCount} comments analyzed</span>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <span className="w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-sm">check</span>
                </span>
                <span className="text-gray-700 dark:text-gray-300">Analytics dashboard ready</span>
              </div>
            </div>

            <button
              onClick={handleViewDashboard}
              className="w-full py-3 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-700 transition-colors flex items-center justify-center space-x-2"
            >
              <span>View Your Dashboard</span>
              <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </button>
          </>
        )}

        {timedOut && (
          <>
            {/* Timeout State */}
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-yellow-600 dark:text-yellow-400 text-3xl">hourglass_top</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Taking longer than usual</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Your data will appear on the dashboard shortly. Feel free to navigate away.
              </p>
            </div>

            {postsCount > 0 && (
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center mb-4">
                {postsCount} posts loaded so far. Comments still processing.
              </p>
            )}

            <button
              onClick={handleViewDashboard}
              className="w-full py-3 border border-teal-600 text-teal-700 dark:text-teal-400 rounded-xl font-semibold hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-colors"
            >
              Go to Dashboard Anyway
            </button>
          </>
        )}
      </div>
    </div>
  );
}

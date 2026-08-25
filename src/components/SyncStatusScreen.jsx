import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useCreator } from "../analytics/CreatorContext";

const API_BASE = "https://maya-backend-service-326007673689.asia-southeast1.run.app";

export default function SyncStatusScreen({ creatorId, platform, username, onComplete }) {
  const navigate = useNavigate();
  const { authState, setDataFreshness: setContextDataFreshness } = useCreator();
  const [syncStatus, setSyncStatus] = useState("SYNCING");
  const [dataFreshness, setDataFreshness] = useState(null);
  const [syncError, setSyncError] = useState(null);
  const [message, setMessage] = useState("");
  const [postsCount, setPostsCount] = useState(0);
  const [commentsCount, setCommentsCount] = useState(0);
  const [timedOut, setTimedOut] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [isPolling, setIsPolling] = useState(true);
  const intervalRef = useRef(null);

  const fetchStatus = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/phyllo/sync-status/${creatorId}`, {
        headers: { Authorization: `Bearer ${authState.token}` },
      });
      if (res.ok) {
        const data = await res.json();
        const status = data.syncStatus || data.status;
        setSyncStatus(status);
        setDataFreshness(data.dataFreshness || null);
        setSyncError(data.syncError || null);
        setMessage(data.message || "");
        setPostsCount(data.postsCount || 0);
        setCommentsCount(data.commentsCount || 0);

        // Stop polling conditions
        if (status === "COMPLETED" || status === "READY") {
          setSyncStatus("COMPLETED");
          setIsPolling(false);
          if (data.dataFreshness) setContextDataFreshness(data.dataFreshness);
        } else if (status === "FAILED") {
          setIsPolling(false);
        } else if (status === "SYNCING_WAITING") {
          setIsPolling(false);
        }
      }
    } catch (err) {
      console.error("Sync status poll error:", err);
    }
  };

  // Polling loop
  useEffect(() => {
    if (!creatorId || !isPolling) return;
    fetchStatus(); // immediate first call
    intervalRef.current = setInterval(() => {
      setElapsed((e) => e + 5);
      fetchStatus();
    }, 5000);

    // Timeout after 2 minutes of polling (only for SYNCING state)
    const timeout = setTimeout(() => {
      if (isPolling) {
        setIsPolling(false);
        setTimedOut(true);
      }
    }, 120000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      clearTimeout(timeout);
    };
  }, [creatorId, isPolling]);

  // Stop interval when polling stops
  useEffect(() => {
    if (!isPolling && intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [isPolling]);

  const handleViewDashboard = () => {
    if (onComplete) onComplete(dataFreshness);
    navigate("/plan");
  };

  // Manual check status (for SYNCING_WAITING state)
  const handleCheckStatus = async () => {
    await fetchStatus();
    // If completed after manual check, navigate
    // (syncStatus will update via state, UI will react)
  };

  const isSyncing = syncStatus === "SYNCING" || syncStatus === "IDLE";
  const isWaiting = syncStatus === "SYNCING_WAITING";
  const isCompleted = syncStatus === "COMPLETED";
  const isFailed = syncStatus === "FAILED";

  const steps = [
    { label: `Connected to ${platform || "Instagram"}`, done: true },
    { label: `${postsCount > 0 ? postsCount + " posts fetched" : "Fetching posts..."}`, done: postsCount > 0 },
    { label: `${commentsCount > 0 ? commentsCount + " comments analyzed" : "Analyzing comments..."}`, done: commentsCount > 0 && isCompleted },
    { label: "Building your analytics", done: isCompleted },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/70 backdrop-blur-sm px-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-8 border border-gray-200 dark:border-gray-700">

        {/* SYNCING state */}
        {isSyncing && !timedOut && (
          <>
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 relative">
                <div className="w-16 h-16 border-4 border-teal-200 dark:border-teal-800 rounded-full" />
                <div className="absolute inset-0 w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Setting up your account...</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{message || `Syncing data from ${platform || "your platform"}`}</p>
            </div>

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
                    {step.label}
                  </span>
                </div>
              ))}
            </div>

            <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
              This usually takes 30-60 seconds. ({elapsed}s elapsed)
            </p>
          </>
        )}

        {/* SYNCING_WAITING state — historic data fetch, takes 5+ minutes */}
        {isWaiting && (
          <>
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-amber-600 dark:text-amber-400 text-3xl">schedule</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Fetching your full history</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                {message || "Your account has older content. We're fetching your full post history — this may take 5-6 minutes."}
              </p>
            </div>

            {postsCount > 0 && (
              <div className="flex items-center space-x-2 mb-4 p-3 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-lg">
                <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-sm">check_circle</span>
                <p className="text-xs text-green-700 dark:text-green-400">{postsCount} posts already loaded</p>
              </div>
            )}

            <div className="p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-xl mb-6">
              <div className="flex items-start space-x-3">
                <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-base mt-0.5">email</span>
                <div>
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-300">We'll email you when it's ready</p>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-0.5">Feel free to close this page. We'll notify you at your registered email when sync completes.</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={handleCheckStatus}
                className="w-full py-3 border border-teal-600 text-teal-700 dark:text-teal-400 rounded-xl font-semibold hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-colors flex items-center justify-center space-x-2"
              >
                <span className="material-symbols-outlined text-lg">refresh</span>
                <span>Check Status</span>
              </button>
              <button
                onClick={handleViewDashboard}
                className="w-full py-3 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
              >
                Go to Dashboard Anyway
              </button>
            </div>
          </>
        )}

        {/* COMPLETED state */}
        {isCompleted && (
          <>
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-3xl">check_circle</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Your account is ready!</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                @{username || "your account"} has been fully synced.
              </p>
            </div>

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

            {/* Data freshness banner */}
            {dataFreshness === "HISTORIC" && (
              <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <div className="flex items-start space-x-2">
                  <span className="material-symbols-outlined text-yellow-600 dark:text-yellow-400 text-base mt-0.5">info</span>
                  <p className="text-xs text-yellow-700 dark:text-yellow-400 leading-relaxed">
                    These analytics are based on historic data. No recent posts found in the last 90 days.
                  </p>
                </div>
              </div>
            )}

            {dataFreshness === "STALE" && (
              <div className="mb-4 p-3 bg-gray-100 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg">
                <div className="flex items-start space-x-2">
                  <span className="material-symbols-outlined text-gray-500 dark:text-gray-400 text-base mt-0.5">info</span>
                  <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                    No post data available yet. Connect your account or wait for sync to complete.
                  </p>
                </div>
              </div>
            )}

            <button
              onClick={handleViewDashboard}
              className="w-full py-3 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-700 transition-colors flex items-center justify-center space-x-2"
            >
              <span>View Your Dashboard</span>
              <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </button>
          </>
        )}

        {/* FAILED state */}
        {isFailed && (
          <>
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-red-600 dark:text-red-400 text-3xl">error</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Sync failed</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {syncError || "Something went wrong while syncing your account."}
              </p>
            </div>

            {postsCount > 0 && (
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center mb-4">
                {postsCount} posts were loaded before the error occurred.
              </p>
            )}

            <div className="space-y-2">
              <button
                onClick={handleViewDashboard}
                className="w-full py-3 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-700 transition-colors"
              >
                Go to Dashboard Anyway
              </button>
              <button
                onClick={() => window.location.reload()}
                className="w-full py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </>
        )}

        {/* Timeout (still syncing after 2 min) */}
        {timedOut && isSyncing && (
          <>
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
                {postsCount} posts loaded so far.
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

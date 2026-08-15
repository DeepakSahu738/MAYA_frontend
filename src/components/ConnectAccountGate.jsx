import React from "react";
import { Link } from "react-router-dom";
import { useCreator } from "../analytics/CreatorContext";
import PhylloConnectButton from "../analytics/PhylloConnect";

export default function ConnectAccountGate({ children }) {
  const { connectedAccounts, authState, loading } = useCreator();

  // Still loading — don't flash the gate
  if (loading) return null;

  // Not logged in — AuthGuard handles this, but just in case
  if (!authState.isLoggedIn) return children;

  // Has connected accounts — show the actual page
  if (connectedAccounts.length > 0) return children;

  // Logged in but no accounts — show connect prompt
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-teal-100 to-cyan-100 dark:from-teal-900/30 dark:to-cyan-900/30 rounded-full flex items-center justify-center">
          <span className="material-symbols-outlined text-teal-600 dark:text-teal-400 text-4xl">link</span>
        </div>

        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
          Connect Your Social Account
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-8 leading-relaxed">
          To use this feature, connect at least one social media account. MAYA will analyze your data and provide personalized insights, scheduling, and content recommendations.
        </p>

        <div className="flex flex-col items-center space-y-3">
          <PhylloConnectButton className="w-full justify-center" />

          <div className="flex items-center space-x-4 text-xs text-gray-400 dark:text-gray-500">
            <span>or</span>
          </div>

          <Link to="/UserAccountMgnt" className="text-sm text-teal-600 dark:text-teal-400 hover:underline">
            Go to Account Settings to manage connections
          </Link>

          <Link to="/demo" className="text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 mt-4">
            Want to explore first? Try the Demo Playground →
          </Link>
        </div>

        {/* What you'll unlock */}
        <div className="mt-10 grid grid-cols-2 gap-3 text-left">
          {[
            { icon: "analytics", label: "Full Analytics Dashboard" },
            { icon: "smart_toy", label: "AI-Powered Chat" },
            { icon: "calendar_month", label: "Content Calendar" },
            { icon: "trending_up", label: "Trends & Insights" },
          ].map((item, idx) => (
            <div key={idx} className="flex items-center space-x-2 p-2.5 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
              <span className="material-symbols-outlined text-teal-500 text-base">{item.icon}</span>
              <span className="text-xs text-gray-600 dark:text-gray-300">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

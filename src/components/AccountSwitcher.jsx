import React from "react";
import { useCreator } from "../analytics/CreatorContext";
import { Link } from "react-router-dom";
import { FaInstagram, FaFacebook, FaTiktok, FaYoutube, FaSnapchat } from "react-icons/fa";

const PLATFORM_STYLES = {
  INSTAGRAM: { bg: "bg-gradient-to-br from-purple-500 to-pink-500" },
  FACEBOOK: { bg: "bg-blue-600" },
  TIKTOK: { bg: "bg-black dark:bg-gray-700" },
  YOUTUBE: { bg: "bg-red-600" },
  PINTEREST: { bg: "bg-red-500" },
  SNAPCHAT: { bg: "bg-yellow-400" },
};

function PlatformSwitcherIcon({ platform }) {
  const p = platform?.toUpperCase();
  switch (p) {
    case "INSTAGRAM": return <FaInstagram className="text-white text-xs" />;
    case "FACEBOOK": return <FaFacebook className="text-white text-xs" />;
    case "TIKTOK": return <FaTiktok className="text-white text-xs" />;
    case "YOUTUBE": return <FaYoutube className="text-white text-xs" />;
    case "SNAPCHAT": return <FaSnapchat className="text-white text-xs" />;
    default: return <span className="text-white text-[10px] font-bold">?</span>;
  }
}

export default function AccountSwitcher() {
  const { connectedAccounts, selectedCreator, setSelectedCreator, authState, loading } = useCreator();

  // Don't show if not logged in
  if (!authState.isLoggedIn) return null;

  // Still loading accounts
  if (loading) {
    return (
      <div className="flex items-center space-x-1">
        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
      </div>
    );
  }

  // No accounts — show connect button
  if (connectedAccounts.length === 0) {
    return (
      <Link to="/UserAccountMgnt" className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg border border-dashed border-gray-300 dark:border-gray-600 hover:border-teal-400 dark:hover:border-teal-500 transition-colors" title="Connect a social account">
        <span className="material-symbols-outlined text-gray-400 dark:text-gray-500 text-base">add_link</span>
        <span className="text-xs text-gray-500 dark:text-gray-400 hidden sm:inline">Connect</span>
      </Link>
    );
  }

  return (
    <div className="flex items-center space-x-1">
      {connectedAccounts.map((acc) => {
        const platform = acc.platform?.toUpperCase() || "";
        const style = PLATFORM_STYLES[platform] || { bg: "bg-gray-500" };
        const isActive = selectedCreator?.id === acc.id && !selectedCreator?.isDemo;

        return (
          <button
            key={acc.id}
            onClick={() => setSelectedCreator({ ...acc })}
            title={`@${acc.username} (${acc.platform})${acc.followerCount ? ` • ${acc.followerCount.toLocaleString()} followers` : ""}`}
            className={`relative w-9 h-9 rounded-full flex items-center justify-center transition-all overflow-hidden ${style.bg} ${
              isActive
                ? "ring-2 ring-teal-500 ring-offset-2 ring-offset-white dark:ring-offset-gray-800 scale-110"
                : "opacity-60 hover:opacity-100 hover:scale-105"
            }`}
          >
            {/* Always show platform icon as base */}
            <PlatformSwitcherIcon platform={acc.platform} />
            {/* Image on top if available — hides itself on error */}
            {acc.profilePictureUrl && (
              <img src={acc.profilePictureUrl} alt={acc.username}
                className="absolute inset-0 w-full h-full object-cover rounded-full"
                onError={(e) => { e.target.style.display = "none"; }} />
            )}
            {isActive && (
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white dark:border-gray-800" />
            )}
          </button>
        );
      })}

      {/* Add more button */}
      <Link to="/UserAccountMgnt" className="w-8 h-8 rounded-full border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center hover:border-teal-400 dark:hover:border-teal-500 transition-colors" title="Connect another account">
        <span className="material-symbols-outlined text-gray-400 dark:text-gray-500 text-sm">add</span>
      </Link>
    </div>
  );
}

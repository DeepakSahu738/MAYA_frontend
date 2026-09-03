import React from "react";
import { FaInstagram, FaFacebook, FaYoutube, FaTiktok, FaLinkedin, FaSnapchat } from "react-icons/fa";

// Platform theming — teal stays app primary, platform color used only for badge/section accents
export const PLATFORM_CONFIG = {
  INSTAGRAM: {
    label: "Instagram",
    color: "text-pink-500",
    bg: "bg-gradient-to-br from-purple-500 to-pink-500",
    accent: "text-pink-500 dark:text-pink-400",
    icon: FaInstagram,
  },
  FACEBOOK: {
    label: "Facebook",
    color: "text-blue-600",
    bg: "bg-blue-600",
    accent: "text-blue-600 dark:text-blue-400",
    icon: FaFacebook,
  },
  YOUTUBE: {
    label: "YouTube",
    color: "text-red-500",
    bg: "bg-red-600",
    accent: "text-red-600 dark:text-red-400",
    icon: FaYoutube,
  },
  TIKTOK: {
    label: "TikTok",
    color: "text-gray-800 dark:text-gray-200",
    bg: "bg-black dark:bg-gray-700",
    accent: "text-gray-800 dark:text-gray-200",
    icon: FaTiktok,
  },
  LINKEDIN: {
    label: "LinkedIn",
    color: "text-blue-700",
    bg: "bg-blue-700",
    accent: "text-blue-700 dark:text-blue-400",
    icon: FaLinkedin,
  },
  SNAPCHAT: {
    label: "Snapchat",
    color: "text-yellow-500",
    bg: "bg-yellow-400",
    accent: "text-yellow-600 dark:text-yellow-400",
    icon: FaSnapchat,
  },
  OTHER: {
    label: "Account",
    color: "text-gray-500",
    bg: "bg-gray-500",
    accent: "text-teal-600 dark:text-teal-400",
    icon: null,
  },
};

// Safely get config for any platform string (defaults to OTHER)
export function getPlatformConfig(platform) {
  const key = (platform || "OTHER").toUpperCase();
  return PLATFORM_CONFIG[key] || PLATFORM_CONFIG.OTHER;
}

// Platform badge — icon + label
export function PlatformBadge({ platform, size = "text-base" }) {
  const config = getPlatformConfig(platform);
  const Icon = config.icon;
  return (
    <span className="inline-flex items-center space-x-1.5">
      {Icon ? (
        <Icon className={`${size} ${config.color}`} />
      ) : (
        <span className={`material-symbols-outlined ${size} text-gray-400`}>public</span>
      )}
      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{config.label}</span>
    </span>
  );
}

// Format a platformInsight value by its unit
export function formatInsightValue(value, unit) {
  if (value === null || value === undefined) return null; // caller shows "Not enough data"
  switch (unit) {
    case "%": return `${value}%`;
    case "hours": return `${value} hrs`;
    case "count": return value.toLocaleString();
    case "views/sub": return `${value} views/sub`;
    case "ratio": return `${value}`;
    default: return `${value}`; // safe passthrough for unknown units
  }
}

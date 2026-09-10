import React from "react";
import { Link } from "react-router-dom";
import { FaInstagram, FaFacebook, FaTiktok, FaYoutube, FaSnapchat, FaPinterest } from "react-icons/fa";
import { useCreator } from "../analytics/CreatorContext";

const PLATFORMS = [
  {
    name: "Instagram",
    route: "/ContentGenerationInstagram",
    tagline: "Reels, carousels & captions",
    Icon: FaInstagram,
    gradient: "from-purple-500 via-pink-500 to-orange-400",
    glow: "group-hover:shadow-pink-500/20",
    text: "text-pink-500",
    key: "INSTAGRAM",
  },
  {
    name: "Facebook",
    route: "/ContentGenerationFlow",
    tagline: "Posts, updates & engagement",
    Icon: FaFacebook,
    gradient: "from-blue-600 to-blue-400",
    glow: "group-hover:shadow-blue-500/20",
    text: "text-blue-600",
    key: "FACEBOOK",
  },
  {
    name: "TikTok",
    route: "/ContentGenerationTikTok",
    tagline: "Viral hooks & video scripts",
    Icon: FaTiktok,
    gradient: "from-gray-900 to-gray-700",
    glow: "group-hover:shadow-gray-500/20",
    text: "text-gray-800 dark:text-gray-200",
    key: "TIKTOK",
  },
  {
    name: "YouTube",
    route: "/ContentGenerationYouTube",
    tagline: "Shorts, titles & descriptions",
    Icon: FaYoutube,
    gradient: "from-red-600 to-red-500",
    glow: "group-hover:shadow-red-500/20",
    text: "text-red-500",
    key: "YOUTUBE",
  },
  {
    name: "Snapchat",
    route: "/ContentGenerationSnapchat",
    tagline: "Stories & spotlight ideas",
    Icon: FaSnapchat,
    gradient: "from-yellow-400 to-yellow-300",
    glow: "group-hover:shadow-yellow-400/30",
    text: "text-yellow-500",
    key: "SNAPCHAT",
  },
  {
    name: "Pinterest",
    route: "/ContentGenerationPinterest",
    tagline: "Pins & board descriptions",
    Icon: FaPinterest,
    gradient: "from-red-500 to-rose-500",
    glow: "group-hover:shadow-rose-500/20",
    text: "text-red-500",
    key: "PINTEREST",
  },
];

export default function CreatePage() {
  const { connectedAccounts } = useCreator();
  const connectedPlatforms = new Set(
    (connectedAccounts || []).map((a) => (a.platform || "").toUpperCase())
  );

  return (
    <div className="min-h-full bg-gray-50 dark:bg-gray-800">
      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-3 py-1.5 bg-teal-50 dark:bg-teal-900/20 border border-teal-100 dark:border-teal-800 rounded-full mb-4">
            <span className="material-symbols-outlined text-teal-600 dark:text-teal-400 text-sm mr-1.5">auto_awesome</span>
            <span className="text-xs font-semibold text-teal-700 dark:text-teal-400">AI Content Lab</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50">Pick your channel</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-3 max-w-md mx-auto">
            Generate AI-optimized ideas, captions, hooks, and hashtags tailored to each platform's audience.
          </p>
        </div>

        {/* Platform cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {PLATFORMS.map((platform) => {
            const isConnected = connectedPlatforms.has(platform.key);
            return (
              <Link
                key={platform.name}
                to={platform.route}
                className={`group relative flex items-center p-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 hover:border-transparent shadow-sm hover:shadow-xl ${platform.glow} transition-all duration-300 hover:-translate-y-0.5 overflow-hidden`}
              >
                {/* Subtle brand-gradient wash on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${platform.gradient} opacity-0 group-hover:opacity-[0.04] transition-opacity`} />

                {/* Icon tile */}
                <div className={`relative w-12 h-12 rounded-xl bg-gradient-to-br ${platform.gradient} flex items-center justify-center shadow-md flex-shrink-0 group-hover:scale-105 transition-transform`}>
                  <platform.Icon className="text-white text-xl" />
                </div>

                {/* Text */}
                <div className="relative ml-4 flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="text-base font-semibold text-gray-900 dark:text-gray-100">{platform.name}</span>
                    {isConnected && (
                      <span className="text-[9px] px-1.5 py-0.5 bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-400 rounded-full font-medium">Connected</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">{platform.tagline}</p>
                </div>

                {/* Arrow */}
                <span className={`relative material-symbols-outlined text-gray-300 dark:text-gray-600 ${platform.text} group-hover:translate-x-1 transition-all flex-shrink-0`}>
                  arrow_forward
                </span>
              </Link>
            );
          })}
        </div>

        {/* Informative "How it works" card */}
        <div className="mt-8 bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-900/10 dark:to-cyan-900/10 rounded-2xl border border-teal-100 dark:border-teal-800/40 p-6">
          <div className="flex items-start space-x-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center flex-shrink-0 shadow-md">
              <span className="material-symbols-outlined text-white text-lg">lightbulb</span>
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">How the Content Lab works</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                Pick a platform, tell MAYA a bit about your content, and get platform-tuned ideas in seconds.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { icon: "tune", title: "1. Configure", desc: "Set your goal, niche, tone, audience & keywords — or type your own." },
              { icon: "auto_awesome", title: "2. Generate", desc: "MAYA crafts ideas, captions/hooks, hashtags, and posting tips for that platform." },
              { icon: "content_copy", title: "3. Use it", desc: "Copy what you like, tweak it, and schedule it from your Calendar." },
            ].map((step, idx) => (
              <div key={idx} className="flex items-start space-x-3">
                <span className="material-symbols-outlined text-teal-600 dark:text-teal-400 text-lg flex-shrink-0">{step.icon}</span>
                <div>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{step.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 pt-4 border-t border-teal-100 dark:border-teal-800/40 flex flex-wrap items-center gap-x-5 gap-y-2">
            <span className="flex items-center space-x-1.5 text-xs text-gray-500 dark:text-gray-400">
              <span className="material-symbols-outlined text-teal-500 text-sm">check_circle</span>
              <span>Tailored to each platform's audience</span>
            </span>
            <span className="flex items-center space-x-1.5 text-xs text-gray-500 dark:text-gray-400">
              <span className="material-symbols-outlined text-teal-500 text-sm">bolt</span>
              <span>Ideas in seconds</span>
            </span>
            <span className="flex items-center space-x-1.5 text-xs text-gray-500 dark:text-gray-400">
              <span className="material-symbols-outlined text-teal-500 text-sm">edit</span>
              <span>Fully editable — nothing is auto-posted</span>
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}

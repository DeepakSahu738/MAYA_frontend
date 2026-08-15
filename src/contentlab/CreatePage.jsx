import React from "react";
import { Link } from "react-router-dom";

const PLATFORMS = [
  { name: "Instagram", route: "/ContentGenerationInstagram", icon: "photo_camera", gradient: "from-purple-500 to-pink-500" },
  { name: "Facebook", route: "/ContentGenerationFlow", icon: "public", gradient: "from-blue-600 to-blue-400" },
  { name: "TikTok", route: "/ContentGenerationTikTok", icon: "music_note", gradient: "from-gray-800 to-pink-500" },
  { name: "YouTube", route: "/ContentGenerationYouTube", icon: "play_circle", gradient: "from-red-600 to-orange-500" },
  { name: "Snapchat", route: "/ContentGenerationSnapchat", icon: "photo_camera_front", gradient: "from-yellow-400 to-yellow-300" },
  { name: "Pinterest", route: "/ContentGenerationPinterest", icon: "push_pin", gradient: "from-red-500 to-red-400" },
];

export default function CreatePage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16">
      <main className="max-w-3xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Create Content</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Choose a platform to generate AI-optimized content ideas, captions, hooks, and hashtags.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {PLATFORMS.map((platform) => (
            <Link
              key={platform.name}
              to={platform.route}
              className="group flex flex-col items-center p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 hover:border-teal-300 dark:hover:border-teal-600 hover:shadow-lg transition-all hover:-translate-y-1"
            >
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${platform.gradient} flex items-center justify-center mb-3 shadow-md group-hover:scale-110 transition-transform`}>
                <span className="material-symbols-outlined text-white text-2xl">{platform.icon}</span>
              </div>
              <span className="text-sm font-medium text-gray-800 dark:text-gray-200 group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors">
                {platform.name}
              </span>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}

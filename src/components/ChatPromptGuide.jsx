import React, { useState } from "react";

const CATEGORIES = [
  {
    id: "analytics",
    label: "Analytics",
    icon: "analytics",
    color: "from-teal-500 to-cyan-500",
    prompts: [
      { emoji: "📊", text: "What's my health score?" },
      { emoji: "📈", text: "Show my engagement metrics" },
      { emoji: "⭐", text: "What are my best performing posts?" },
      { emoji: "📉", text: "Which posts flopped?" },
      { emoji: "#️⃣", text: "Which hashtags work best for me?" },
      { emoji: "🕐", text: "When should I post?" },
      { emoji: "👥", text: "Who are my superfans?" },
      { emoji: "💭", text: "How do my followers feel about my content?" },
      { emoji: "🔤", text: "What does my audience talk about?" },
      { emoji: "📋", text: "What's my posting frequency and content mix?" },
    ],
  },
  {
    id: "scheduling",
    label: "Scheduling",
    icon: "calendar_month",
    color: "from-indigo-500 to-purple-500",
    prompts: [
      { emoji: "📅", text: "When should I post this week?" },
      { emoji: "✏️", text: "Schedule a post for tomorrow at 9am about morning yoga" },
      { emoji: "📋", text: "Show my scheduled posts" },
    ],
  },
  {
    id: "comments",
    label: "Comments",
    icon: "forum",
    color: "from-orange-500 to-amber-500",
    prompts: [
      { emoji: "❓", text: "What questions haven't I replied to?" },
      { emoji: "✍️", text: "Draft a reply to my top unanswered question" },
      { emoji: "❤️", text: "Show my most liked comments" },
      { emoji: "📊", text: "How are my comments performing?" },
    ],
  },
  {
    id: "ideas",
    label: "Ideas & Trends",
    icon: "lightbulb",
    color: "from-pink-500 to-rose-500",
    prompts: [
      { emoji: "💡", text: "Give me 5 post ideas for this week" },
      { emoji: "🔍", text: "What content gaps do I have?" },
      { emoji: "🔥", text: "What content went viral for me?" },
      { emoji: "#️⃣", text: "Which hashtags should I keep or drop?" },
    ],
  },
];

export default function ChatPromptGuide({ onPromptClick, compact = false }) {
  const [activeCategory, setActiveCategory] = useState("analytics");

  const active = CATEGORIES.find((c) => c.id === activeCategory);

  if (compact) {
    // Compact version: just show category tabs + prompts as chips
    return (
      <div className="w-full">
        {/* Category Tabs */}
        <div className="flex items-center space-x-1 mb-3 overflow-x-auto pb-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                activeCategory === cat.id
                  ? "bg-teal-600 text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              <span className="material-symbols-outlined text-sm">{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Prompts */}
        <div className="flex flex-wrap gap-2">
          {active?.prompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => onPromptClick(p.text)}
              className="text-xs px-3 py-1.5 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full border border-gray-200 dark:border-gray-600 hover:bg-teal-50 dark:hover:bg-teal-900/20 hover:border-teal-300 dark:hover:border-teal-600 hover:text-teal-700 dark:hover:text-teal-400 transition-colors"
            >
              {p.emoji} {p.text}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Full version: grid layout for empty state
  return (
    <div className="w-full max-w-2xl mx-auto">
      <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-4 text-center">
        What can MAYA help you with?
      </p>

      {/* Category Tabs */}
      <div className="flex items-center justify-center flex-wrap gap-2 mb-5">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
              activeCategory === cat.id
                ? "bg-teal-600 text-white shadow-md"
                : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            }`}
          >
            <span className="material-symbols-outlined text-base">{cat.icon}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Prompts Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {active?.prompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => onPromptClick(p.text)}
            className="flex items-center space-x-2 px-4 py-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 text-left hover:border-teal-300 dark:hover:border-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/10 transition-all group"
          >
            <span className="text-lg">{p.emoji}</span>
            <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors">
              {p.text}
            </span>
          </button>
        ))}
      </div>

      <p className="text-xs text-gray-400 dark:text-gray-500 text-center mt-4">
        Click any suggestion or type your own question below
      </p>
    </div>
  );
}

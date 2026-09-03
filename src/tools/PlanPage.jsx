import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useCreator } from "../analytics/CreatorContext";
import { getAxiosConfig } from "../analytics/apiHelper";
import { getRoleFromToken } from "../tokenDecoder/detokenizer";
import { FaInstagram, FaFacebook, FaTiktok, FaYoutube, FaSnapchat, FaLinkedin } from "react-icons/fa";

const API_BASE = "https://maya-backend-service-326007673689.asia-southeast1.run.app";

// Platform icon component
function PlatformIcon({ platform, size = "text-base" }) {
  const p = platform?.toUpperCase();
  switch (p) {
    case "INSTAGRAM": return <FaInstagram className={`${size} text-pink-500`} />;
    case "FACEBOOK": return <FaFacebook className={`${size} text-blue-500`} />;
    case "TIKTOK": return <FaTiktok className={`${size} text-gray-800 dark:text-gray-200`} />;
    case "YOUTUBE": return <FaYoutube className={`${size} text-red-500`} />;
    case "SNAPCHAT": return <FaSnapchat className={`${size} text-yellow-400`} />;
    case "LINKEDIN": return <FaLinkedin className={`${size} text-blue-700`} />;
    default: return <span className={`material-symbols-outlined ${size} text-gray-400`}>public</span>;
  }
}

// --- Helpers ---
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function getUserName() {
  const token = sessionStorage.getItem("token");
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.name || payload.firstname || payload.sub?.split("@")[0] || null;
  } catch { return null; }
}

// --- Sub-components ---

function WelcomeHeader({ selectedCreator, connectedAccounts }) {
  const name = getUserName();
  const greeting = getGreeting();

  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
        {greeting}{name ? `, ${name}` : ""} 👋
      </h1>
      <div className="flex items-center space-x-3 mt-2 text-sm text-gray-500 dark:text-gray-400">
        {selectedCreator && (
          <span className="flex items-center space-x-1.5">
            <span className="w-2 h-2 bg-green-500 rounded-full" />
            <span>@{selectedCreator.username} ({selectedCreator.platform})</span>
          </span>
        )}
        {connectedAccounts.length > 0 && (
          <span>• {connectedAccounts.length} account{connectedAccounts.length > 1 ? "s" : ""} connected</span>
        )}
      </div>
    </div>
  );
}

function OperationalSummaryCards({ scheduledPosts, connectedAccounts }) {
  const now = new Date();
  const nextPost = scheduledPosts
    .filter(p => (p.status === "PENDING" || p.status === "APPROVED") && p.scheduledFor && new Date(p.scheduledFor) >= now)
    .sort((a, b) => new Date(a.scheduledFor) - new Date(b.scheduledFor))[0] || null;
  // Only count PENDING drafts still in the future (past ones can't be scheduled anymore)
  const draftsCount = scheduledPosts.filter(p => p.status === "PENDING" && p.scheduledFor && new Date(p.scheduledFor) >= now).length;
  // "Planned" = upcoming posts remaining this week (from now until end of week, not past days)
  const thisWeekPosts = scheduledPosts.filter(p => {
    if (!p.scheduledFor) return false;
    const d = new Date(p.scheduledFor);
    const weekEnd = new Date(now); weekEnd.setDate(now.getDate() - now.getDay() + 7); weekEnd.setHours(23, 59, 59);
    return d >= now && d <= weekEnd;
  });

  const cards = [
    {
      icon: "schedule",
      label: "Next Post",
      value: nextPost ? new Date(nextPost.scheduledFor).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }) : "None scheduled",
      sub: nextPost?.caption?.slice(0, 30) + "..." || null,
      gradient: "from-teal-500 to-cyan-500",
    },
    {
      icon: "check_circle",
      label: "Content Ready",
      value: draftsCount > 0 ? `${draftsCount} can be scheduled` : "No pending drafts",
      sub: draftsCount > 0 ? "Ready to schedule" : "Generate a plan to create drafts",
      gradient: "from-green-500 to-emerald-500",
    },
    {
      icon: "devices",
      label: "Platforms",
      value: `${connectedAccounts.length} connected`,
      sub: connectedAccounts.map(a => a.platform).join(", ") || null,
      gradient: "from-indigo-500 to-purple-500",
    },
    {
      icon: "bar_chart",
      label: "This Week",
      value: `${thisWeekPosts.length} post${thisWeekPosts.length !== 1 ? "s" : ""} planned`,
      sub: thisWeekPosts.length < 3 ? "Consider adding more" : "On track",
      gradient: thisWeekPosts.length >= 3 ? "from-green-500 to-teal-500" : "from-yellow-500 to-orange-500",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
      {cards.map((card, idx) => (
        <div key={idx} className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center space-x-2.5 mb-2">
            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${card.gradient} flex items-center justify-center`}>
              <span className="material-symbols-outlined text-white text-sm">{card.icon}</span>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">{card.label}</span>
          </div>
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{card.value}</p>
          {card.sub && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{card.sub}</p>}
        </div>
      ))}
    </div>
  );
}

function UpcomingSchedulePreview({ scheduledPosts, selectedCreator }) {
  const upcoming = scheduledPosts
    .filter(p => p.scheduledFor && new Date(p.scheduledFor) >= new Date())
    .sort((a, b) => new Date(a.scheduledFor) - new Date(b.scheduledFor))
    .slice(0, 4);

  const statusStyle = (status) => {
    if (status === "APPROVED") return "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400";
    if (status === "PUBLISHED") return "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400";
    return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400";
  };

  if (upcoming.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700">
        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-3 flex items-center space-x-2">
          <span className="material-symbols-outlined text-base text-gray-400">event</span>
          <span>Upcoming Posts</span>
        </h3>
        <div className="text-center py-6 text-gray-400 dark:text-gray-500">
          <span className="material-symbols-outlined text-2xl mb-1">event_busy</span>
          <p className="text-xs">No upcoming posts scheduled</p>
          <a href="/calendar" className="text-xs text-teal-600 dark:text-teal-400 hover:underline mt-1 inline-block">Open Calendar →</a>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 flex items-center space-x-2">
          <span className="material-symbols-outlined text-base text-gray-400">event</span>
          <span>Upcoming Posts</span>
        </h3>
        <a href="/calendar" className="text-xs text-teal-600 dark:text-teal-400 hover:underline">View All</a>
      </div>
      <div className="space-y-2">
        {upcoming.map((post, idx) => {
          const platformAccent = PLATFORM_ACCENT[post.platform?.toUpperCase()] || PLATFORM_ACCENT[selectedCreator?.platform?.toUpperCase()] || "border-l-gray-300";
          return (
          <div key={idx} className={`p-2.5 bg-gray-50 dark:bg-gray-700/50 rounded-lg border-l-3 ${platformAccent}`}>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-0.5">
                <PlatformIcon platform={post.platform || selectedCreator?.platform} size="text-lg" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-800 dark:text-gray-200 break-words">{post.caption || "Untitled draft"}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <p className="text-[10px] text-gray-400 dark:text-gray-500">
                    {new Date(post.scheduledFor).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })} at {new Date(post.scheduledFor).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                  </p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusStyle(post.status)}`}>{post.status}</span>
                </div>
              </div>
            </div>
          </div>
          );
        })}
      </div>
    </div>
  );
}

function getStaticFallback(scheduledPosts, connectedAccounts) {
  const fallback = [];
  const drafts = scheduledPosts.filter(p => p.status === "PENDING");
  if (drafts.length > 0) fallback.push(`📝 Review ${drafts.length} pending draft${drafts.length > 1 ? "s" : ""} before scheduling`);
  if (connectedAccounts.length === 1) fallback.push("🔗 Connect another platform for cross-posting opportunities");
  const thisWeek = scheduledPosts.filter(p => { const d = new Date(p.scheduledFor); const now = new Date(); const end = new Date(now); end.setDate(end.getDate() + 7); return d >= now && d <= end; });
  if (thisWeek.length < 3) fallback.push("📅 Schedule more posts this week to maintain consistency");
  if (thisWeek.length === 0) fallback.push("⚠️ No posts scheduled for this week yet");
  if (fallback.length === 0) fallback.push("✅ You're all caught up! Great workflow this week.");
  return fallback;
}

function MayaSuggestionsPanel({ selectedCreator, scheduledPosts, connectedAccounts }) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const { authState } = useCreator();

  useEffect(() => {
    if (!selectedCreator) return;
    setLoaded(false);
    setSuggestions([]);
  }, [selectedCreator?.id]);

  useEffect(() => {
    if (!selectedCreator || loaded) return;

    const fetchSuggestions = async () => {
      setLoading(true);
      try {
        const headers = { "Content-Type": "application/json" };
        if (!selectedCreator.isDemo && authState.token) {
          headers["Authorization"] = `Bearer ${authState.token}`;
        }

        const response = await fetch(`${API_BASE}/api/chat/stream`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            message: "Give me 5 short operational suggestions for this creator. What should they focus on today? Consider their posting frequency, content gaps, best performing content, and engagement patterns. Format each suggestion as a single line starting with an emoji. Keep each under 20 words. No markdown, no headers, just 5 lines.",
            creatorId: selectedCreator.id,
            sessionId: `suggestions-${Date.now()}`,
          }),
        });

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let fullText = "";
        let rateLimited = false;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const parts = buffer.split("\n\n");
          buffer = parts.pop() || "";
          for (const part of parts) {
            for (const line of part.split("\n")) {
              if (line.startsWith("data:")) {
                const token = line.substring(5);
                if (token === "[DONE]") break;
                if (token.startsWith("[ERROR]")) {
                  console.error("AI Suggestions error:", token);
                  if (token.toLowerCase().includes("rate limit")) {
                    rateLimited = true;
                  }
                  fullText = "";
                  break;
                }
                fullText += token;
              }
            }
          }
        }

        // Parse the response into individual suggestions
        const lines = fullText.split("\n").filter(l => l.trim().length > 0).slice(0, 5);
        if (lines.length > 0) {
          setSuggestions(lines);
        } else if (rateLimited) {
          setSuggestions(["⏳ MAYA is taking a breather — suggestions will refresh shortly", ...getStaticFallback(scheduledPosts, connectedAccounts).slice(0, 3)]);
        } else {
          // AI returned empty — use fallback
          setSuggestions(getStaticFallback(scheduledPosts, connectedAccounts));
        }
        setLoaded(true);
      } catch (err) {
        console.error("Failed to fetch AI suggestions:", err);
        setSuggestions(getStaticFallback(scheduledPosts, connectedAccounts));
        setLoaded(true);
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestions();
  }, [selectedCreator, loaded]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 flex items-center space-x-2">
          <span className="material-symbols-outlined text-base text-teal-600 dark:text-teal-400">psychology</span>
          <span>MAYA Suggestions</span>
        </h3>
        <button onClick={() => { setLoaded(false); setSuggestions([]); }} className="text-[10px] text-teal-600 dark:text-teal-400 hover:underline">Refresh</button>
      </div>

      {loading && (
        <div className="space-y-2.5 py-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
              <div className="flex-1 h-3 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
            </div>
          ))}
          <p className="text-[10px] text-gray-400 dark:text-gray-500 text-center mt-2">MAYA is thinking...</p>
        </div>
      )}

      {!loading && suggestions.length > 0 && (
        <div className="space-y-2">
          {suggestions.map((s, idx) => {
            // Extract emoji and text
            const emojiMatch = s.match(/^(\p{Emoji_Presentation}|\p{Emoji}\uFE0F?)/u);
            const emoji = emojiMatch ? emojiMatch[0] : "•";
            const text = emojiMatch ? s.slice(emojiMatch[0].length).trim() : s.trim();

            return (
              <div key={idx} className="flex items-start space-x-3 p-3 rounded-lg border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30">
                <span className="text-lg flex-shrink-0 mt-0.5">{emoji}</span>
                <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed font-medium">{text}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// --- Weekly Plan Section (preserved from original) ---

const PILLAR_COLORS = {
  "Educational": "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
  "Behind the scenes": "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400",
  "Tips & tricks": "bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400",
  "Personal story": "bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-400",
  "Trending": "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400",
};
const FORMAT_STYLES = {
  "VIDEO": "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400",
  "IMAGE": "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400",
};
const LOADING_STEPS = ["Analyzing your recent posts...", "Identifying content pillars...", "Detecting patterns...", "Crafting your plan...", "Almost there..."];

function WeeklyPlanSection({ selectedCreator, onPlanGenerated }) {
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [expandedDay, setExpandedDay] = useState(null);
  const [editingDay, setEditingDay] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [rateLimited, setRateLimited] = useState(false);
  const [remaining, setRemaining] = useState(null);

  const handleGenerate = async () => {
    if (!selectedCreator || rateLimited) return;
    setLoading(true); setLoadingStep(0); setPlan(null);
    const interval = setInterval(() => setLoadingStep(s => Math.min(s + 1, LOADING_STEPS.length - 1)), 2000);
    try {
      const res = await axios.post(`${API_BASE}/api/strategy/generate`, { creatorId: selectedCreator.id }, getAxiosConfig(selectedCreator));
      setPlan(res.data);
      if (onPlanGenerated) onPlanGenerated(res.data);
      toast.success("Weekly plan ready!");
    } catch (err) {
      if (err.response?.status === 429) {
        const data = err.response.data;
        toast.error(data.message || "Rate limit exceeded. Please wait before trying again.");
        setRateLimited(true);
        setRemaining(data.remaining ?? 0);
        setTimeout(() => setRateLimited(false), 60000); // re-enable after 1 min
      } else {
        toast.error("Failed to generate plan.");
      }
    }
    finally { clearInterval(interval); setLoading(false); }
  };

  const handleSaveAll = async () => {
    if (rateLimited) { toast.error("Rate limit active. Please wait before generating."); return; }
    setSaving(true);
    try {
      await axios.post(`${API_BASE}/api/strategy/generate-and-save`, { creatorId: selectedCreator.id }, getAxiosConfig(selectedCreator));
      toast.success("All drafts saved to calendar!");
    } catch (err) {
      if (err.response?.status === 429) {
        const data = err.response.data;
        toast.error(data.message || "Rate limit exceeded. Please wait before trying again.");
        setRateLimited(true);
        setRemaining(data.remaining ?? 0);
        setTimeout(() => setRateLimited(false), 60000);
      } else {
        toast.error("Failed to save.");
      }
    }
    finally { setSaving(false); }
  };

  const handleSaveDay = async (day) => {
    // Prevent scheduling before today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dateStr = `${day.date}T${day.bestTime || "09:00"}:00`;
    const scheduledDate = new Date(dateStr);
    if (scheduledDate < today) {
      toast.error("Cannot schedule in the past.");
      return;
    }
    try {
      await axios.post(`${API_BASE}/api/schedule/create`, {
        creatorId: selectedCreator.id, caption: day.captionDraft, hashtags: (day.hashtags || []).join(","),
        mediaType: day.format || "IMAGE", mediaUrl: null, scheduledFor: dateStr,
      }, getAxiosConfig(selectedCreator));
      toast.success(`${day.day} saved!`);
    } catch { toast.error("Failed to save."); }
  };

  const startEdit = (i) => { setEditingDay(i); setEditForm({ captionDraft: plan.days[i].captionDraft, hook: plan.days[i].hook, hashtags: (plan.days[i].hashtags||[]).join(", "), bestTime: plan.days[i].bestTime||"09:00", callToAction: plan.days[i].callToAction||"" }); };
  const saveEdit = (i) => { const u={...plan}; u.days[i]={...u.days[i], captionDraft:editForm.captionDraft, hook:editForm.hook, hashtags:editForm.hashtags.split(",").map(h=>h.trim()), bestTime:editForm.bestTime, callToAction:editForm.callToAction}; setPlan(u); setEditingDay(null); };

  const getPillarColor = (p) => PILLAR_COLORS[p] || "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300";
  const getFormatStyle = (f) => FORMAT_STYLES[f?.toUpperCase()] || "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300";

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 flex items-center space-x-2">
          <span className="material-symbols-outlined text-base text-teal-600 dark:text-teal-400">auto_awesome</span>
          <span>This Week's Plan</span>
        </h3>
        {plan && <button onClick={handleGenerate} disabled={loading || rateLimited} className="text-xs text-teal-600 dark:text-teal-400 hover:underline disabled:opacity-50 disabled:cursor-not-allowed">{rateLimited ? "Rate limited" : "Regenerate"}</button>}
      </div>

      {/* Empty state */}
      {!plan && !loading && (
        <div className="text-center py-8">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">MAYA will analyze your content and build a personalized 7-day plan.</p>
          <button onClick={handleGenerate} disabled={!selectedCreator || rateLimited}
            className="px-5 py-2.5 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 disabled:opacity-50 transition-colors inline-flex items-center space-x-2">
            <span className="material-symbols-outlined text-base">auto_awesome</span>
            <span>{rateLimited ? "Rate limited — wait" : "Generate Weekly Plan"}</span>
          </button>
          {rateLimited && remaining !== null && (
            <p className="text-xs text-red-500 dark:text-red-400 mt-2">0 generations remaining this hour</p>
          )}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="text-center py-8 space-y-2">
          {LOADING_STEPS.map((step, i) => (
            <p key={i} className={`text-xs transition-all ${i === loadingStep ? "text-teal-600 dark:text-teal-400 font-medium" : i < loadingStep ? "text-gray-400 line-through" : "text-gray-300 dark:text-gray-600"}`}>
              {i < loadingStep ? "✓" : i === loadingStep ? "⟳" : "○"} {step}
            </p>
          ))}
        </div>
      )}

      {/* Plan display */}
      {plan && !loading && (
        <div className="space-y-4">
          {/* Summary */}
          {plan.strategyNotes && <p className="text-xs text-gray-500 dark:text-gray-400 italic">{plan.strategyNotes}</p>}
          {plan.detectedPillars && (
            <div className="flex flex-wrap gap-1.5">
              {plan.detectedPillars.map((p, i) => <span key={i} className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${getPillarColor(p)}`}>{p}</span>)}
            </div>
          )}

          {/* Day grid */}
          <div className="grid grid-cols-7 gap-1.5">
            {(plan.days || []).map((day, idx) => (
              <div key={idx} className="relative">
                <button onClick={() => setExpandedDay(expandedDay === idx ? null : idx)}
                  className={`w-full p-2 rounded-lg border text-center transition-all text-[10px] ${expandedDay === idx ? "border-teal-500 bg-teal-50 dark:bg-teal-900/20" : "border-gray-200 dark:border-gray-600 hover:border-teal-300 dark:hover:border-teal-600"}`}>
                  <p className="font-bold text-gray-800 dark:text-gray-200">{day.day?.slice(0, 3)}</p>
                  <span className={`inline-block mt-1 px-1 py-0.5 rounded ${getFormatStyle(day.format)}`}>{day.format}</span>
                </button>
                <button onClick={() => handleSaveDay(day)} title="Save to Calendar"
                  className="absolute -top-1 -right-1 w-5 h-5 bg-teal-600 text-white rounded-full flex items-center justify-center hover:bg-teal-500 transition-colors shadow-sm">
                  <span className="material-symbols-outlined text-[10px]">add</span>
                </button>
              </div>
            ))}
          </div>

          {/* Expanded day */}
          {expandedDay !== null && plan.days[expandedDay] && (
            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 space-y-3">
              {editingDay === expandedDay ? (
                <div className="space-y-3">
                  <input value={editForm.hook} onChange={e => setEditForm({...editForm, hook: e.target.value})} placeholder="Hook" className="w-full p-2 text-xs border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-teal-500" />
                  <textarea rows="3" value={editForm.captionDraft} onChange={e => setEditForm({...editForm, captionDraft: e.target.value})} className="w-full p-2 text-xs border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-teal-500" />
                  <div className="flex space-x-2">
                    <button onClick={() => setEditingDay(null)} className="text-xs px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-300">Cancel</button>
                    <button onClick={() => saveEdit(expandedDay)} className="text-xs px-3 py-1.5 bg-teal-600 text-white rounded-lg">Save</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${getFormatStyle(plan.days[expandedDay].format)}`}>{plan.days[expandedDay].format}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${getPillarColor(plan.days[expandedDay].contentPillar)}`}>{plan.days[expandedDay].contentPillar}</span>
                    </div>
                    <div className="flex space-x-2">
                      <button onClick={() => startEdit(expandedDay)} className="text-[10px] text-gray-500 hover:text-teal-600">Edit</button>
                      <button onClick={() => handleSaveDay(plan.days[expandedDay])} className="text-[10px] text-teal-600 dark:text-teal-400 hover:underline">Save to Calendar</button>
                    </div>
                  </div>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{plan.days[expandedDay].postIdea}</p>
                  {plan.days[expandedDay].hook && <p className="text-xs text-yellow-700 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/10 px-2 py-1 rounded">Hook: {plan.days[expandedDay].hook}</p>}
                  <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{plan.days[expandedDay].captionDraft}</p>
                  {plan.days[expandedDay].hashtags?.length > 0 && (
                    <div className="flex flex-wrap gap-1">{plan.days[expandedDay].hashtags.map((h, i) => <span key={i} className="text-[9px] px-1.5 py-0.5 bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 rounded-full">{h}</span>)}</div>
                  )}
                  {plan.days[expandedDay].repurposeNote && <p className="text-[10px] text-indigo-600 dark:text-indigo-400 italic">Repurpose: {plan.days[expandedDay].repurposeNote}</p>}
                </>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-2">
            <p className="text-[10px] text-gray-400 dark:text-gray-500">Click a day to see details · Click + to save to calendar</p>
            <button onClick={handleSaveAll} disabled={saving}
              className="text-xs text-teal-600 dark:text-teal-400 hover:underline disabled:opacity-50 flex items-center space-x-1">
              {saving ? <span>Saving all...</span> : <><span className="material-symbols-outlined text-xs">calendar_month</span><span>Save all 7 at once</span></>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Platform accent colors for schedule preview ---
const PLATFORM_ACCENT = {
  INSTAGRAM: "border-l-pink-500",
  FACEBOOK: "border-l-blue-500",
  TIKTOK: "border-l-cyan-500",
  YOUTUBE: "border-l-red-500",
  SNAPCHAT: "border-l-yellow-400",
  LINKEDIN: "border-l-blue-700",
  X: "border-l-gray-600",
  TWITCH: "border-l-purple-500",
  SPOTIFY: "border-l-green-500",
};

function TodaysFocus({ scheduledPosts, plan, selectedCreator }) {
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  const todayPosts = scheduledPosts.filter(p => p.scheduledFor?.startsWith(todayStr));
  const draftsNeedingReview = scheduledPosts.filter(p => p.status === "PENDING").length;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 flex items-center space-x-2">
          <span className="material-symbols-outlined text-base text-orange-500">today</span>
          <span>Today's Focus</span>
        </h3>
        <span className="text-[10px] text-gray-400 dark:text-gray-500">Updated just now</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Scheduled today */}
        <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border-l-3 border-l-teal-500">
          <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Scheduled today</p>
          {todayPosts.length > 0 ? (
            <div className="space-y-1.5">
              {todayPosts
                .sort((a, b) => new Date(a.scheduledFor) - new Date(b.scheduledFor))
                .map((post, idx) => (
                  <div key={idx} className="flex items-center space-x-2">
                    <span className="text-[10px] text-teal-600 dark:text-teal-400 font-medium w-14">
                      {new Date(post.scheduledFor).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                    </span>
                    <p className="text-xs text-gray-700 dark:text-gray-300 truncate flex-1">
                      {post.caption?.slice(0, 30) || "Untitled"}{post.caption?.length > 30 ? "..." : ""}
                    </p>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${
                      post.status === "APPROVED" ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                      : post.status === "PUBLISHED" ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                      : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400"
                    }`}>{post.status}</span>
                  </div>
                ))}
              <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">{todayPosts.length} post{todayPosts.length > 1 ? "s" : ""} today</p>
            </div>
          ) : (
            <p className="text-xs text-gray-400 dark:text-gray-500">Nothing scheduled</p>
          )}
        </div>

        {/* Needs attention */}
        <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border-l-3 border-l-orange-500">
          <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Needs attention</p>
          {draftsNeedingReview > 0 ? (
            <p className="text-xs font-medium text-gray-800 dark:text-gray-200">{draftsNeedingReview} draft{draftsNeedingReview > 1 ? "s" : ""} waiting for review</p>
          ) : (
            <p className="text-xs text-green-600 dark:text-green-400">All clear ✓</p>
          )}
        </div>

        {/* MAYA prepared */}
        <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border-l-3 border-l-indigo-500">
          <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">MAYA prepared</p>
          {plan ? (
            <p className="text-xs font-medium text-gray-800 dark:text-gray-200">Weekly plan is ready to review</p>
          ) : (
            <p className="text-xs text-gray-400 dark:text-gray-500">Generate a plan to get suggestions</p>
          )}
        </div>
      </div>
    </div>
  );
}

// --- Weekly Goal ---
function WeeklyGoal({ thisWeekCount, selectedCreator }) {
  const { authState } = useCreator();
  const [goal, setGoal] = useState(null); // { target, weekStart, exists }
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [inputTarget, setInputTarget] = useState(5);

  // Fetch goal on mount / creator change
  useEffect(() => {
    if (!selectedCreator || !authState.token) { setLoading(false); return; }
    const fetchGoal = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `${API_BASE}/api/goals/current?creatorId=${selectedCreator.id}`,
          { headers: { Authorization: `Bearer ${authState.token}` } }
        );
        setGoal(res.data);
        if (res.data.exists) setInputTarget(res.data.target);
      } catch (err) {
        console.error("Failed to fetch weekly goal:", err);
        setGoal(null);
      } finally { setLoading(false); }
    };
    fetchGoal();
  }, [selectedCreator?.id, authState.token]);

  // Progress comes directly from real post activity data
  const getWeekProgress = () => thisWeekCount || 0;

  const handleSave = async () => {
    if (inputTarget < 1 || inputTarget > 30) { toast.error("Goal must be 1-30"); return; }
    try {
      const res = await axios.post(
        `${API_BASE}/api/goals/set`,
        { creatorId: selectedCreator.id, target: inputTarget },
        { headers: { Authorization: `Bearer ${authState.token}`, "Content-Type": "application/json" } }
      );
      setGoal({ target: res.data.target, weekStart: res.data.weekStart, exists: true });
      setEditing(false);
      toast.success("Weekly goal set!");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to set goal");
    }
  };

  if (loading) return null;

  const progress = getWeekProgress();
  const target = goal?.target || 0;
  const percentage = target > 0 ? Math.min((progress / target) * 100, 100) : 0;
  const circumference = 2 * Math.PI * 28; // radius = 28
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  // No goal set yet — show setup prompt (treat target 0 as no goal)
  if ((!goal?.exists || goal?.target === 0) && !editing) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">🎯</span>
            <div>
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">Set your weekly posting goal</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">How many posts do you want to hit this week?</p>
            </div>
          </div>
          <button
            onClick={() => setEditing(true)}
            className="px-3 py-1.5 text-xs font-medium bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
          >
            Set Goal
          </button>
        </div>
      </div>
    );
  }

  // Editing mode
  if (editing) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 mb-4">
        <div className="flex items-center space-x-4">
          <span className="text-2xl">🎯</span>
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-2">Posts this week</p>
            <div className="flex items-center space-x-3">
              <input
                type="range"
                min="1" max="20" value={inputTarget}
                onChange={(e) => setInputTarget(Number(e.target.value))}
                className="flex-1 h-2 rounded-lg appearance-none bg-gray-200 dark:bg-gray-700 accent-teal-600"
              />
              <span className="text-lg font-bold text-teal-600 dark:text-teal-400 w-8 text-center">{inputTarget}</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button onClick={() => setEditing(false)} className="px-3 py-1.5 text-xs text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">Cancel</button>
            <button onClick={handleSave} className="px-3 py-1.5 text-xs font-medium bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors">Save</button>
          </div>
        </div>
      </div>
    );
  }

  // Goal display with progress ring
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Progress Ring */}
          <div className="relative w-16 h-16 flex-shrink-0">
            <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
              <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="4"
                className="text-gray-200 dark:text-gray-700" />
              <circle cx="32" cy="32" r="28" fill="none" strokeWidth="4" strokeLinecap="round"
                className={percentage >= 100 ? "text-green-500" : "text-teal-500"}
                style={{ strokeDasharray: circumference, strokeDashoffset }} />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-bold text-gray-800 dark:text-gray-100">
                {progress}/{target}
              </span>
            </div>
          </div>

          {/* Text */}
          <div>
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
              {percentage >= 100 ? "Goal reached! 🎉" : `${target - progress} more to go`}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {percentage >= 100
                ? "You hit your weekly target — push further or enjoy the win"
                : `${progress} of ${target} posts this week`}
            </p>
            {/* Progress bar (compact alternative) */}
            <div className="w-40 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full mt-2 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${percentage >= 100 ? "bg-green-500" : "bg-teal-500"}`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-1">
          <button
            onClick={() => { setInputTarget(target); setEditing(true); }}
            className="text-xs text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
            title="Edit goal"
          >
            <span className="material-symbols-outlined text-base">edit</span>
          </button>
          <button
            onClick={async () => {
              if (!confirm("Clear your weekly goal?")) return;
              try {
                await axios.delete(
                  `${API_BASE}/api/goals/reset?creatorId=${selectedCreator.id}`,
                  { headers: { Authorization: `Bearer ${authState.token}` } }
                );
                setGoal({ target: 0, weekStart: goal.weekStart, exists: false });
                toast.success("Goal cleared");
              } catch { toast.error("Failed to clear goal"); }
            }}
            className="text-xs text-gray-400 hover:text-red-500 transition-colors"
            title="Clear goal"
          >
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Posting Streak ---
function PostingStreak({ postDates }) {
  // Calculate streak from real post dates (sorted descending from endpoint)
  const computeStreak = () => {
    if (!postDates || postDates.length === 0) return { current: 0, longest: 0 };

    // Current streak: walk from today backwards
    let current = 0;
    let checkDate = new Date();
    checkDate.setHours(0, 0, 0, 0);

    for (const dateStr of postDates) {
      const postDate = new Date(dateStr);
      postDate.setHours(0, 0, 0, 0);
      const diffDays = Math.round((checkDate - postDate) / (1000 * 60 * 60 * 24));
      if (diffDays <= 1) {
        current++;
        checkDate = postDate;
      } else if (current === 0 && diffDays <= 1) {
        // today has no post, skip to yesterday
        continue;
      } else {
        break;
      }
    }

    // If today has no post but yesterday does, still count from yesterday
    if (current === 0 && postDates.length > 0) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);
      checkDate = yesterday;
      for (const dateStr of postDates) {
        const postDate = new Date(dateStr);
        postDate.setHours(0, 0, 0, 0);
        const diffDays = Math.round((checkDate - postDate) / (1000 * 60 * 60 * 24));
        if (diffDays <= 1) {
          current++;
          checkDate = postDate;
        } else {
          break;
        }
      }
    }

    // Longest streak: walk all dates sorted ascending
    const sorted = [...postDates].sort();
    let longest = 0;
    let streak = 1;
    for (let i = 1; i < sorted.length; i++) {
      const prev = new Date(sorted[i - 1]);
      const curr = new Date(sorted[i]);
      const diff = Math.round((curr - prev) / (1000 * 60 * 60 * 24));
      if (diff === 1) {
        streak++;
      } else {
        longest = Math.max(longest, streak);
        streak = 1;
      }
    }
    longest = Math.max(longest, streak);

    return { current, longest };
  };

  const { current, longest } = computeStreak();

  // Don't show if no data at all
  if (current === 0 && longest === 0) {
    return (
      <div className="flex items-center space-x-3 px-4 py-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 mb-4">
        <span className="text-2xl">🔥</span>
        <div>
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">Start your posting streak</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Post consistently to build your streak. Schedule content to keep it going!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 mb-4">
      <div className="flex items-center space-x-3">
        <div className="relative">
          <span className="text-3xl">{current >= 7 ? "🔥" : current >= 3 ? "⚡" : "✨"}</span>
          {current >= 7 && <span className="absolute -top-1 -right-1 text-xs">🔥</span>}
        </div>
        <div>
          <div className="flex items-baseline space-x-2">
            <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{current} day{current !== 1 ? "s" : ""}</p>
            <span className="text-xs text-gray-400 dark:text-gray-500">current streak</span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {current >= 7
              ? "You're on fire! Keep it going 🔥"
              : current >= 3
                ? "Building momentum — nice work!"
                : current >= 1
                  ? "Great start! Keep it consistent"
                  : "Post today to start a new streak"}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-xs text-gray-400 dark:text-gray-500">Longest</p>
        <p className="text-sm font-bold text-teal-600 dark:text-teal-400">{longest} day{longest !== 1 ? "s" : ""}</p>
      </div>
    </div>
  );
}

// --- Main Page ---

export default function PlanPage() {
  const { selectedCreator, connectedAccounts, authState } = useCreator();
  const [scheduledPosts, setScheduledPosts] = useState([]);
  const [weeklyPlan, setWeeklyPlan] = useState(null);
  const [activity, setActivity] = useState({ postDates: [], thisWeekCount: 0, totalPosts: 0 });

  useEffect(() => {
    if (!selectedCreator) return;
    const fetchSchedule = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/schedule/list?creatorId=${selectedCreator.id}`, getAxiosConfig(selectedCreator));
        setScheduledPosts(res.data || []);
      } catch { setScheduledPosts([]); }
    };
    fetchSchedule();
  }, [selectedCreator]);

  // Fetch real post activity for streak + goal progress
  useEffect(() => {
    if (!selectedCreator || !authState.token) return;
    const fetchActivity = async () => {
      try {
        const res = await axios.get(
          `${API_BASE}/api/posts/activity?creatorId=${selectedCreator.id}`,
          { headers: { Authorization: `Bearer ${authState.token}` } }
        );
        setActivity(res.data || { postDates: [], thisWeekCount: 0, totalPosts: 0 });
      } catch {
        setActivity({ postDates: [], thisWeekCount: 0, totalPosts: 0 });
      }
    };
    fetchActivity();
  }, [selectedCreator?.id, authState.token]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16">
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome */}
        <WelcomeHeader selectedCreator={selectedCreator} connectedAccounts={connectedAccounts} />

        {/* Posting Streak */}
        <PostingStreak postDates={activity.postDates} />

        {/* Weekly Goal */}
        <WeeklyGoal thisWeekCount={activity.thisWeekCount} selectedCreator={selectedCreator} />

        {/* Today's Focus */}
        <TodaysFocus scheduledPosts={scheduledPosts} plan={weeklyPlan} selectedCreator={selectedCreator} />

        {/* Summary Cards */}
        <OperationalSummaryCards scheduledPosts={scheduledPosts} connectedAccounts={connectedAccounts} />

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          {/* Main column */}
          <div className="space-y-6">
            <WeeklyPlanSection selectedCreator={selectedCreator} onPlanGenerated={setWeeklyPlan} />
            <UpcomingSchedulePreview scheduledPosts={scheduledPosts} selectedCreator={selectedCreator} />
          </div>

          {/* Side column */}
          <div className="space-y-6">
            {/* MAYA is watching banner */}
            <div className="bg-teal-50 dark:bg-teal-900/10 rounded-xl p-4 border border-teal-200 dark:border-teal-700/50">
              <div className="flex items-start space-x-2.5">
                <span className="material-symbols-outlined text-teal-600 dark:text-teal-400 text-base mt-0.5">visibility</span>
                <div>
                  <p className="text-xs font-semibold text-teal-800 dark:text-teal-300">MAYA is watching your workflow</p>
                  <p className="text-[10px] text-teal-600 dark:text-teal-500 mt-0.5 leading-relaxed">I'll surface scheduling gaps, pending drafts, and repurposing opportunities as your accounts change.</p>
                </div>
              </div>
            </div>

            <MayaSuggestionsPanel selectedCreator={selectedCreator} scheduledPosts={scheduledPosts} connectedAccounts={connectedAccounts} />

            {/* Quick Ask MAYA — functional */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-1 flex items-center space-x-2">
                <span className="material-symbols-outlined text-base text-teal-600 dark:text-teal-400">smart_toy</span>
                <span>Quick Ask</span>
              </h3>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 mb-3">Ask MAYA about your week's plan</p>
              <a href="/chat" className="block w-full p-3 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-teal-400 dark:hover:border-teal-600 hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
                "What should I post today?" →
              </a>
              <div className="flex flex-wrap gap-1.5 mt-3">
                <a href="/chat" className="text-[10px] px-2.5 py-1 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400 rounded-full hover:bg-teal-100 dark:hover:bg-teal-900/40 transition-colors">When should I post?</a>
                <a href="/chat" className="text-[10px] px-2.5 py-1 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400 rounded-full hover:bg-teal-100 dark:hover:bg-teal-900/40 transition-colors">Repurpose ideas</a>
                <a href="/chat" className="text-[10px] px-2.5 py-1 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400 rounded-full hover:bg-teal-100 dark:hover:bg-teal-900/40 transition-colors">Content gaps</a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

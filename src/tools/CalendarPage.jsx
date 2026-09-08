import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useCreator } from "../analytics/CreatorContext";
import { getAxiosConfig } from "../analytics/apiHelper";

const API_BASE = "https://maya-backend-service-326007673689.asia-southeast1.run.app";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

const STATUS_STYLES = {
  PENDING: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-700",
  APPROVED: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-700",
  PUBLISHED: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-700",
};

function getMonthData(year, month) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1; // Mon=0
  const daysInMonth = lastDay.getDate();

  const cells = [];
  // Previous month padding
  for (let i = 0; i < startDayOfWeek; i++) {
    const d = new Date(year, month, 0 - (startDayOfWeek - 1 - i));
    cells.push({ date: d, isCurrentMonth: false });
  }
  // Current month
  for (let i = 1; i <= daysInMonth; i++) {
    cells.push({ date: new Date(year, month, i), isCurrentMonth: true });
  }
  // Next month padding to fill grid (6 rows max)
  while (cells.length < 42) {
    const d = new Date(year, month + 1, cells.length - startDayOfWeek - daysInMonth + 1);
    cells.push({ date: d, isCurrentMonth: false });
  }
  return cells;
}

function formatDate(d) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatTime(isoStr) {
  if (!isoStr) return "";
  const d = new Date(isoStr);
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
}

// Compact time for pills: "9a", "2:30p"
function compactTime(isoStr) {
  if (!isoStr) return "";
  const d = new Date(isoStr);
  let h = d.getHours();
  const m = d.getMinutes();
  const ampm = h >= 12 ? "p" : "a";
  h = h % 12 || 12;
  return m === 0 ? `${h}${ampm}` : `${h}:${String(m).padStart(2, "0")}${ampm}`;
}

// Material icon name for media type
function mediaIcon(mediaType) {
  const t = (mediaType || "").toUpperCase();
  if (t === "VIDEO" || t === "REEL" || t === "REELS") return "movie";
  if (t === "CAROUSEL" || t === "CAROUSEL_ALBUM") return "collections";
  return "image"; // IMAGE / default
}

// Left accent bar color by status
const STATUS_ACCENT = {
  PENDING: "border-l-yellow-400 dark:border-l-yellow-500",
  APPROVED: "border-l-green-500",
  PUBLISHED: "border-l-blue-500",
  REJECTED: "border-l-red-400",
  FAILED: "border-l-red-500",
};

// Status dot color
const STATUS_DOT = {
  PENDING: "bg-yellow-400",
  APPROVED: "bg-green-500",
  PUBLISHED: "bg-blue-500",
  REJECTED: "bg-red-400",
  FAILED: "bg-red-500",
};

// Is this a pending/approved post whose scheduled time has already passed? (missed)
function isMissed(post) {
  if (post.status === "PUBLISHED" || post.status === "REJECTED" || post.status === "FAILED") return false;
  return post.scheduledFor && new Date(post.scheduledFor) < new Date();
}

export default function CalendarPage() {
  const { selectedCreator } = useCreator();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [form, setForm] = useState({ caption: "", hashtags: "", mediaType: "IMAGE", scheduledFor: "" });
  const [dayModal, setDayModal] = useState(null); // { date, posts } — "view all posts for this day"

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthCells = getMonthData(year, month);
  const today = formatDate(new Date());

  const fetchPosts = useCallback(async () => {
    if (!selectedCreator) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/api/schedule/list?creatorId=${selectedCreator.id}`, getAxiosConfig(selectedCreator));
      setPosts(res.data || []);
    } catch (err) {
      console.error("Failed to fetch posts:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedCreator]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToday = () => setCurrentDate(new Date());

  const openCreateModal = (date) => {
    // Prevent opening drafts for past dates
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);
    const clickedDate = new Date(date);
    clickedDate.setHours(0, 0, 0, 0);
    if (clickedDate < todayDate) {
      toast.error("Cannot schedule in the past");
      return;
    }
    const d = new Date(date);
    d.setHours(9, 0, 0, 0);
    setEditingPost(null);
    setForm({ caption: "", hashtags: "", mediaType: "IMAGE", scheduledFor: d.toISOString().slice(0, 16) });
    setModalOpen(true);
  };

  const openEditModal = (post) => {
    setEditingPost(post);
    setForm({
      caption: post.caption || "",
      hashtags: post.hashtags || "",
      mediaType: post.mediaType || "IMAGE",
      scheduledFor: post.scheduledFor ? post.scheduledFor.slice(0, 16) : "",
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.caption.trim()) { toast.error("Caption is required"); return; }
    if (!form.scheduledFor) { toast.error("Schedule time is required"); return; }

    // Prevent scheduling in the past (including time, not just date)
    const scheduledDate = new Date(form.scheduledFor);
    const now = new Date();
    if (scheduledDate <= now) {
      toast.error("Cannot schedule in the past. Please pick a future date and time.");
      return;
    }

    // Send as-is (datetime-local gives local time string without timezone)
    const scheduledForValue = form.scheduledFor.length === 16 ? form.scheduledFor + ":00" : form.scheduledFor;

    try {
      if (editingPost) {
        await axios.put(`${API_BASE}/api/schedule/update/${editingPost.id}`, {
          caption: form.caption, hashtags: form.hashtags, mediaType: form.mediaType, scheduledFor: scheduledForValue,
        }, getAxiosConfig(selectedCreator));
        toast.success("Post updated!");
      } else {
        await axios.post(`${API_BASE}/api/schedule/create`, {
          creatorId: selectedCreator.id, caption: form.caption, hashtags: form.hashtags,
          mediaType: form.mediaType, mediaUrl: null, scheduledFor: scheduledForValue,
        }, getAxiosConfig(selectedCreator));
        toast.success("Post scheduled!");
      }
      setModalOpen(false);
      fetchPosts();
    } catch (err) {
      toast.error("Failed to save: " + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async () => {
    if (!editingPost) return;
    try {
      await axios.delete(`${API_BASE}/api/schedule/delete/${editingPost.id}`, getAxiosConfig(selectedCreator));
      toast.success("Post deleted");
      setModalOpen(false);
      fetchPosts();
    } catch (err) { toast.error("Failed to delete"); }
  };

  const handleApprove = async () => {
    if (!editingPost) return;
    try {
      await axios.put(`${API_BASE}/api/schedule/approve/${editingPost.id}`, {}, getAxiosConfig(selectedCreator));
      toast.success("Post approved!");
      setModalOpen(false);
      fetchPosts();
    } catch (err) { toast.error("Failed to approve"); }
  };

  const handlePublish = async () => {
    if (!editingPost) return;
    try {
      await axios.put(`${API_BASE}/api/schedule/publish/${editingPost.id}`, {}, getAxiosConfig(selectedCreator));
      toast.success("Post marked as published!");
      setModalOpen(false);
      fetchPosts();
    } catch (err) {
      // Show the backend's specific message (e.g. "Only approved posts can be marked as published")
      const backendMsg = err.response?.data?.error || err.response?.data?.message;
      toast.error(backendMsg || "Failed to mark as published");
    }
  };

  // --- Inline quick actions for the day-posts modal (operate on a post directly) ---
  const refreshDayModal = async (updater) => {
    const fresh = await axios.get(`${API_BASE}/api/schedule/list?creatorId=${selectedCreator.id}`, getAxiosConfig(selectedCreator));
    const allPosts = fresh.data || [];
    setPosts(allPosts);
    // Update the open day modal's posts too (or close if none left)
    if (dayModal) {
      const dateStr = formatDate(dayModal.date);
      const remaining = allPosts.filter((p) => p.scheduledFor && p.scheduledFor.startsWith(dateStr));
      if (remaining.length === 0) setDayModal(null);
      else setDayModal({ ...dayModal, posts: remaining });
    }
  };

  const quickApprove = async (post) => {
    try {
      await axios.put(`${API_BASE}/api/schedule/approve/${post.id}`, {}, getAxiosConfig(selectedCreator));
      toast.success("Post approved!");
      await refreshDayModal();
    } catch { toast.error("Failed to approve"); }
  };

  const quickPublish = async (post) => {
    try {
      await axios.put(`${API_BASE}/api/schedule/publish/${post.id}`, {}, getAxiosConfig(selectedCreator));
      toast.success("Post marked as published!");
      await refreshDayModal();
    } catch (err) {
      const backendMsg = err.response?.data?.error || err.response?.data?.message;
      toast.error(backendMsg || "Failed to mark as published");
    }
  };

  const quickDelete = async (post) => {
    if (!confirm("Delete this post?")) return;
    try {
      await axios.delete(`${API_BASE}/api/schedule/delete/${post.id}`, getAxiosConfig(selectedCreator));
      toast.success("Post deleted");
      await refreshDayModal();
    } catch { toast.error("Failed to delete"); }
  };

  const getPostsForDate = (date) => {
    const dateStr = formatDate(date);
    return posts.filter((p) => p.scheduledFor && p.scheduledFor.startsWith(dateStr));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16">
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              <span className="text-teal-600 dark:text-teal-400">Content</span> Calendar
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Plan and schedule your posts</p>
          </div>
          <div className="flex items-center space-x-2">
            <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
              <span className="material-symbols-outlined text-gray-600 dark:text-gray-300">chevron_left</span>
            </button>
            <button onClick={goToday} className="px-3 py-1.5 text-xs font-medium bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors">Today</button>
            <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
              <span className="material-symbols-outlined text-gray-600 dark:text-gray-300">chevron_right</span>
            </button>
            <button onClick={fetchPosts} className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ml-2" title="Refresh">
              <span className="material-symbols-outlined text-gray-600 dark:text-gray-300">refresh</span>
            </button>
          </div>
        </div>

        {/* Month/Year label */}
        <p className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
          {MONTHS[month]} {year}
        </p>

        {/* Calendar Grid */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-700">
            {DAYS.map((day) => (
              <div key={day} className="py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                {day}
              </div>
            ))}
          </div>

          {/* Date cells */}
          <div className="grid grid-cols-7">
            {monthCells.map((cell, idx) => {
              const dayPosts = getPostsForDate(cell.date);
              const isToday = formatDate(cell.date) === today;
              const cellDate = new Date(cell.date);
              cellDate.setHours(0, 0, 0, 0);
              const todayDate = new Date();
              todayDate.setHours(0, 0, 0, 0);
              const isPast = cellDate < todayDate;
              return (
                <div
                  key={idx}
                  onClick={() => isPast ? null : openCreateModal(cell.date)}
                  className={`group relative min-h-[100px] p-1.5 border-b border-r border-gray-100 dark:border-gray-700 transition-colors ${
                    isPast
                      ? "bg-gray-100/60 dark:bg-gray-900/50 cursor-not-allowed opacity-60"
                      : "cursor-pointer hover:bg-teal-50/50 dark:hover:bg-teal-900/10"
                  } ${isToday ? "bg-teal-50/40 dark:bg-teal-900/10" : ""} ${!cell.isCurrentMonth ? "bg-gray-50/50 dark:bg-gray-900/30" : ""}`}
                >
                  {/* Date number */}
                  <div className="flex items-center justify-between px-1">
                    <span className={`text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full ${
                      isToday ? "bg-teal-600 text-white" : cell.isCurrentMonth ? "text-gray-700 dark:text-gray-300" : "text-gray-300 dark:text-gray-600"
                    }`}>
                      {cell.date.getDate()}
                    </span>
                    {dayPosts.length > 0 && (
                      <span className="text-[9px] font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded-full">{dayPosts.length}</span>
                    )}
                  </div>

                  {/* Empty future day — "+ Add" hover hint */}
                  {dayPosts.length === 0 && !isPast && cell.isCurrentMonth && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      <span className="inline-flex items-center space-x-1 text-[10px] text-teal-500 dark:text-teal-400 font-medium">
                        <span className="material-symbols-outlined text-sm">add</span>
                        <span>Add</span>
                      </span>
                    </div>
                  )}

                  {/* Posts */}
                  <div className="mt-1 space-y-1">
                    {[...dayPosts]
                      .sort((a, b) => new Date(a.scheduledFor) - new Date(b.scheduledFor))
                      .slice(0, 3)
                      .map((post) => (
                      <div
                        key={post.id}
                        onClick={(e) => { e.stopPropagation(); openEditModal(post); }}
                        title={`${post.caption || "Untitled"}${isMissed(post) ? " — scheduled time passed" : ""}`}
                        className={`flex items-center space-x-1 pl-1.5 pr-1 py-1 rounded-md bg-gray-50 dark:bg-gray-700/60 border-l-[3px] ${STATUS_ACCENT[post.status] || STATUS_ACCENT.PENDING} cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 hover:shadow-sm transition-all`}
                      >
                        {/* Status dot */}
                        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${STATUS_DOT[post.status] || STATUS_DOT.PENDING}`} />
                        <span className="text-[9px] font-semibold text-gray-500 dark:text-gray-400 flex-shrink-0">{compactTime(post.scheduledFor)}</span>
                        <span className="text-[10px] font-medium text-gray-700 dark:text-gray-200 truncate flex-1">{post.caption || "Untitled"}</span>
                        {/* Missed warning */}
                        {isMissed(post) && (
                          <span className="material-symbols-outlined text-[12px] text-orange-500 flex-shrink-0" title="Scheduled time has passed">warning</span>
                        )}
                      </div>
                    ))}
                    {dayPosts.length > 3 && (
                      <button
                        onClick={(e) => { e.stopPropagation(); setDayModal({ date: cell.date, posts: dayPosts }); }}
                        className="w-full text-left text-[10px] text-teal-600 dark:text-teal-400 font-medium px-1 hover:underline"
                      >
                        +{dayPosts.length - 3} more
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center space-x-4 mt-4">
          <div className="flex items-center space-x-1.5">
            <div className="w-3 h-3 rounded bg-yellow-200 dark:bg-yellow-900/50 border border-yellow-300 dark:border-yellow-700" />
            <span className="text-xs text-gray-500 dark:text-gray-400">Pending</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <div className="w-3 h-3 rounded bg-green-200 dark:bg-green-900/50 border border-green-300 dark:border-green-700" />
            <span className="text-xs text-gray-500 dark:text-gray-400">Approved</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <div className="w-3 h-3 rounded bg-blue-200 dark:bg-blue-900/50 border border-blue-300 dark:border-blue-700" />
            <span className="text-xs text-gray-500 dark:text-gray-400">Published</span>
          </div>
        </div>
      </main>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm px-4" onClick={() => setModalOpen(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-6 border border-gray-200 dark:border-gray-700" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
              {editingPost ? "Edit Scheduled Post" : "Schedule New Post"}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Caption</label>
                <textarea rows="3" value={form.caption} onChange={(e) => setForm({...form, caption: e.target.value})}
                  className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="Write your caption..." />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Hashtags</label>
                <input type="text" value={form.hashtags} onChange={(e) => setForm({...form, hashtags: e.target.value})}
                  className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="#yoga,#wellness" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Media Type</label>
                  <select value={form.mediaType} onChange={(e) => setForm({...form, mediaType: e.target.value})}
                    className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500">
                    <option value="IMAGE">Image</option>
                    <option value="VIDEO">Video</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Schedule For</label>
                  <input type="datetime-local" value={form.scheduledFor} onChange={(e) => setForm({...form, scheduledFor: e.target.value})}
                    min={(() => { const n = new Date(); return `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,"0")}-${String(n.getDate()).padStart(2,"0")}T${String(n.getHours()).padStart(2,"0")}:${String(n.getMinutes()).padStart(2,"0")}`; })()}
                    className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500" />
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-6">
              <div>
                {editingPost && (
                  <div className="flex flex-wrap gap-2">
                    <button onClick={handleDelete} className="px-3 py-2 text-xs text-red-600 dark:text-red-400 border border-red-300 dark:border-red-700 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">Delete</button>
                    {editingPost.status === "PENDING" && (
                      <button onClick={handleApprove} className="px-3 py-2 text-xs text-green-600 dark:text-green-400 border border-green-300 dark:border-green-700 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors">Approve</button>
                    )}
                    {(editingPost.status === "PENDING" || editingPost.status === "APPROVED") && (
                      <button onClick={handlePublish} className="px-3 py-2 text-xs text-blue-600 dark:text-blue-400 border border-blue-300 dark:border-blue-700 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">Published</button>
                    )}
                  </div>
                )}
              </div>
              <div className="flex space-x-2 justify-end">
                <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">Cancel</button>
                <button onClick={handleSave} className="px-4 py-2 text-sm bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium">
                  {editingPost ? "Update" : "Schedule"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Day Posts Modal — view all posts for a day */}
      {dayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm px-4" onClick={() => setDayModal(null)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-hidden border border-gray-200 dark:border-gray-700 flex flex-col" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                  {dayModal.date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">{dayModal.posts.length} post{dayModal.posts.length !== 1 ? "s" : ""} scheduled</p>
              </div>
              <button onClick={() => setDayModal(null)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                <span className="material-symbols-outlined text-gray-500 text-lg">close</span>
              </button>
            </div>

            {/* Posts list */}
            <div className="p-4 overflow-y-auto space-y-2">
              {[...dayModal.posts]
                .sort((a, b) => new Date(a.scheduledFor) - new Date(b.scheduledFor))
                .map((post) => {
                  const tags = (post.hashtags || "").split(/[\s,]+/).filter(Boolean).slice(0, 3);
                  return (
                  <div
                    key={post.id}
                    className={`p-3 rounded-xl border-l-[3px] ${STATUS_ACCENT[post.status] || STATUS_ACCENT.PENDING} border-y border-r border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors`}
                  >
                    {/* Top row: time + media icon + status */}
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center space-x-2">
                        <span className="material-symbols-outlined text-sm text-gray-400 dark:text-gray-500">{mediaIcon(post.mediaType)}</span>
                        <span className="text-xs font-semibold text-teal-600 dark:text-teal-400">
                          {new Date(post.scheduledFor).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                        </span>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${STATUS_STYLES[post.status] || STATUS_STYLES.PENDING}`}>
                        {post.status}
                      </span>
                    </div>

                    {/* Caption — click to edit */}
                    <button
                      onClick={() => { setDayModal(null); openEditModal(post); }}
                      className="w-full text-left"
                    >
                      <p className="text-sm text-gray-800 dark:text-gray-200 line-clamp-2 hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
                        {post.caption || "Untitled"}
                      </p>
                    </button>

                    {/* Hashtag chips */}
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {tags.map((t, i) => (
                          <span key={i} className="text-[9px] px-1.5 py-0.5 bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 rounded-full">
                            {t.startsWith("#") ? t : `#${t}`}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Inline quick actions */}
                    <div className="flex items-center space-x-2 mt-2.5 pt-2 border-t border-gray-100 dark:border-gray-700">
                      {post.status === "PENDING" && (
                        <button onClick={() => quickApprove(post)} className="text-[11px] font-medium text-green-600 dark:text-green-400 hover:underline">Approve</button>
                      )}
                      {(post.status === "PENDING" || post.status === "APPROVED") && (
                        <button onClick={() => quickPublish(post)} className="text-[11px] font-medium text-blue-600 dark:text-blue-400 hover:underline">Publish</button>
                      )}
                      <button onClick={() => quickDelete(post)} className="text-[11px] font-medium text-red-500 dark:text-red-400 hover:underline">Delete</button>
                      <button onClick={() => { setDayModal(null); openEditModal(post); }} className="text-[11px] font-medium text-gray-500 dark:text-gray-400 hover:underline ml-auto">Edit</button>
                    </div>
                  </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

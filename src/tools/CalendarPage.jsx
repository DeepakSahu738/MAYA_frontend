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

export default function CalendarPage() {
  const { selectedCreator } = useCreator();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [form, setForm] = useState({ caption: "", hashtags: "", mediaType: "IMAGE", scheduledFor: "" });

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
    } catch (err) { toast.error("Failed to mark as published"); }
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
                  className={`min-h-[100px] p-1.5 border-b border-r border-gray-100 dark:border-gray-700 transition-colors ${
                    isPast
                      ? "bg-gray-100/60 dark:bg-gray-900/50 cursor-not-allowed opacity-60"
                      : "cursor-pointer hover:bg-teal-50/50 dark:hover:bg-teal-900/10"
                  } ${!cell.isCurrentMonth ? "bg-gray-50/50 dark:bg-gray-900/30" : ""}`}
                >
                  {/* Date number */}
                  <div className="flex items-center justify-between px-1">
                    <span className={`text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full ${
                      isToday ? "bg-teal-600 text-white" : cell.isCurrentMonth ? "text-gray-700 dark:text-gray-300" : "text-gray-300 dark:text-gray-600"
                    }`}>
                      {cell.date.getDate()}
                    </span>
                    {dayPosts.length > 0 && (
                      <span className="text-[10px] text-gray-400 dark:text-gray-500">{dayPosts.length}</span>
                    )}
                  </div>

                  {/* Posts */}
                  <div className="mt-1 space-y-0.5">
                    {dayPosts.slice(0, 3).map((post) => (
                      <div
                        key={post.id}
                        onClick={(e) => { e.stopPropagation(); openEditModal(post); }}
                        className={`px-1.5 py-0.5 rounded text-[10px] font-medium truncate border cursor-pointer hover:shadow-sm transition-shadow ${STATUS_STYLES[post.status] || STATUS_STYLES.PENDING}`}
                      >
                        {post.caption || "Untitled"}
                      </div>
                    ))}
                    {dayPosts.length > 3 && (
                      <p className="text-[10px] text-gray-400 dark:text-gray-500 px-1">+{dayPosts.length - 3} more</p>
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
    </div>
  );
}

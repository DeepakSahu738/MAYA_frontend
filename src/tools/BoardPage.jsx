import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
  closestCorners,
} from "@dnd-kit/core";
import { useCreator } from "../analytics/CreatorContext";
import { getAxiosConfig } from "../analytics/apiHelper";

const API_BASE = "https://maya-backend-service-326007673689.asia-southeast1.run.app";

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// ── Date helpers ──────────────────────────────────────────────
function formatDate(d) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Monday of the week containing `d`
function startOfWeek(d) {
  const date = new Date(d);
  const day = date.getDay(); // 0=Sun
  const diff = day === 0 ? -6 : 1 - day; // shift so Monday is start
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

function addDays(d, n) {
  const date = new Date(d);
  date.setDate(date.getDate() + n);
  return date;
}

function compactTime(isoStr) {
  if (!isoStr) return "";
  const d = new Date(isoStr);
  let h = d.getHours();
  const m = d.getMinutes();
  const ampm = h >= 12 ? "p" : "a";
  h = h % 12 || 12;
  return m === 0 ? `${h}${ampm}` : `${h}:${String(m).padStart(2, "0")}${ampm}`;
}

function mediaIcon(mediaType) {
  const t = (mediaType || "").toUpperCase();
  if (t === "VIDEO" || t === "REEL" || t === "REELS") return "movie";
  if (t === "CAROUSEL" || t === "CAROUSEL_ALBUM") return "collections";
  return "image";
}

const isSameDay = (a, b) => formatDate(a) === formatDate(b);
const isToday = (d) => isSameDay(d, new Date());

// ── Status style maps ─────────────────────────────────────────
const POST_STATUS = {
  PENDING:   { dot: "bg-yellow-400", pill: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300", accent: "border-l-yellow-400", label: "Draft" },
  APPROVED:  { dot: "bg-green-500",  pill: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300",   accent: "border-l-green-500",  label: "Approved" },
  PUBLISHED: { dot: "bg-blue-500",   pill: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",      accent: "border-l-blue-500",   label: "Published" },
  REJECTED:  { dot: "bg-red-400",    pill: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300",          accent: "border-l-red-400",    label: "Rejected" },
  FAILED:    { dot: "bg-red-500",    pill: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300",          accent: "border-l-red-500",    label: "Failed" },
};
const postStatusOf = (s) => POST_STATUS[s] || POST_STATUS.PENDING;

const TASK_STATUS = {
  TODO:        { dot: "bg-gray-400",   pill: "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300",         accent: "border-l-gray-400",   label: "To Do" },
  IN_PROGRESS: { dot: "bg-amber-500",  pill: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300",  accent: "border-l-amber-500",  label: "In Progress" },
  DONE:        { dot: "bg-teal-500",   pill: "bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300",      accent: "border-l-teal-500",   label: "Done" },
};
const taskStatusOf = (s) => TASK_STATUS[s] || TASK_STATUS.TODO;
const TASK_CYCLE = { TODO: "IN_PROGRESS", IN_PROGRESS: "DONE", DONE: "TODO" };

// A post that's past-due and not yet published/closed
function isPostMissed(item) {
  if (["PUBLISHED", "REJECTED", "FAILED"].includes(item.status)) return false;
  return item.scheduledFor && new Date(item.scheduledFor) < new Date();
}
// A task that's past its day and not done
function isTaskOverdue(item) {
  if (item.taskStatus === "DONE") return false;
  const d = new Date(item.scheduledFor);
  const endOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59);
  return endOfDay < new Date();
}

// ── Draggable card wrapper ────────────────────────────────────
function DraggableCard({ item, children }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: String(item.id) });
  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={`touch-none ${isDragging ? "opacity-40" : ""}`}
    >
      {children}
    </div>
  );
}

// ── Post card ─────────────────────────────────────────────────
function PostCard({ item, onEdit }) {
  const st = postStatusOf(item.status);
  const missed = isPostMissed(item);
  const mediaLabel = (item.mediaType || "IMAGE").replace(/_/g, " ").toLowerCase();
  return (
    <div
      onClick={() => onEdit(item)}
      className={`group bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 border-l-4 ${st.accent} p-3.5 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="inline-flex items-center space-x-1.5 text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide">
          <span className="material-symbols-outlined text-[16px] leading-none">{mediaIcon(item.mediaType)}</span>
          <span>Post</span>
        </span>
        <span className="text-[11px] font-medium text-gray-400 dark:text-gray-500">{compactTime(item.scheduledFor)}</span>
      </div>
      <p className="text-sm text-gray-800 dark:text-gray-100 line-clamp-3 mb-2.5 leading-snug">
        {item.caption || "Untitled post"}
      </p>
      {item.hashtags && (
        <p className="text-[11px] text-teal-600 dark:text-teal-400 truncate mb-2.5">{item.hashtags}</p>
      )}
      <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-100 dark:border-gray-700/60 min-w-0">
        <span className={`inline-flex items-center min-w-0 px-2 py-0.5 rounded-md text-[11px] font-semibold ${st.pill}`}>
          <span className={`w-1.5 h-1.5 rounded-full mr-1.5 flex-shrink-0 ${st.dot}`} />
          <span className="truncate">{st.label}</span>
        </span>
        <div className="flex items-center space-x-1.5 flex-shrink-0">
          <span className="hidden sm:inline text-[10px] text-gray-400 dark:text-gray-500 capitalize">{mediaLabel}</span>
          {missed && (
            <span className="material-symbols-outlined text-[16px] leading-none text-red-500" title="Scheduled time passed">warning</span>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Task card ─────────────────────────────────────────────────
function TaskCard({ item, onCycleStatus, onEdit }) {
  const st = taskStatusOf(item.taskStatus);
  const overdue = isTaskOverdue(item);
  return (
    <div
      onClick={() => onEdit(item)}
      className={`group bg-teal-50/40 dark:bg-gray-800 rounded-xl border border-dashed border-teal-200 dark:border-gray-600 border-l-4 ${st.accent} p-3.5 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="inline-flex items-center space-x-1.5 text-[11px] font-bold text-teal-500 dark:text-teal-400 uppercase tracking-wide">
          <span className="material-symbols-outlined text-[16px] leading-none">check_circle</span>
          <span>Task</span>
        </span>
        {overdue && (
          <span className="text-[10px] font-bold text-red-500 uppercase tracking-wide">Overdue</span>
        )}
      </div>
      <p className="text-sm text-gray-800 dark:text-gray-100 line-clamp-3 mb-2.5 leading-snug">
        {item.caption || "Untitled task"}
      </p>
      {/* Click pill to cycle status */}
      <div className="pt-2 border-t border-teal-100 dark:border-gray-700/60">
        <button
          onClick={(e) => { e.stopPropagation(); onCycleStatus(item); }}
          title="Click to change status"
          className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold ${st.pill} hover:ring-1 hover:ring-teal-300 transition-all`}
        >
          <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${st.dot}`} />
          {st.label}
          <span className="material-symbols-outlined text-[14px] ml-1 leading-none">unfold_more</span>
        </button>
      </div>
    </div>
  );
}

// ── Day column (droppable) ────────────────────────────────────
function DayColumn({ date, items, onAddClick, onEdit, onCycleStatus }) {
  const dayId = formatDate(date);
  const { setNodeRef, isOver } = useDroppable({ id: dayId });
  const today = isToday(date);

  return (
    <div className="flex flex-col min-w-0">
      {/* Column header */}
      <div className={`flex items-center justify-between px-3 py-2.5 rounded-t-xl ${today ? "bg-teal-500 text-white" : "bg-gray-100 dark:bg-gray-700/60 text-gray-700 dark:text-gray-200"}`}>
        <div className="flex items-center space-x-2 min-w-0">
          <div className="flex flex-col leading-tight min-w-0">
            <span className="text-sm font-bold uppercase tracking-wide">{DAY_LABELS[(date.getDay() + 6) % 7]}</span>
            <span className={`text-[11px] ${today ? "text-teal-50" : "text-gray-400 dark:text-gray-500"}`}>
              {MONTHS_SHORT[date.getMonth()]} {date.getDate()}
            </span>
          </div>
          {items.length > 0 && (
            <span className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[11px] font-bold ${today ? "bg-teal-400/60 text-white" : "bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-200"}`}>
              {items.length}
            </span>
          )}
        </div>
        <button
          onClick={() => onAddClick(date)}
          title="Add post or task"
          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${today ? "hover:bg-teal-400" : "hover:bg-gray-200 dark:hover:bg-gray-600"}`}
        >
          <span className="material-symbols-outlined text-[18px] leading-none">add</span>
        </button>
      </div>

      {/* Droppable body */}
      <div
        ref={setNodeRef}
        className={`flex-1 min-h-[80px] sm:min-h-[calc(100vh-230px)] p-2 space-y-2.5 rounded-b-xl border border-t-0 transition-colors overflow-y-auto ${
          isOver
            ? "bg-teal-50 dark:bg-teal-900/20 border-teal-300 dark:border-teal-700"
            : "bg-gray-50/60 dark:bg-gray-800/40 border-gray-200 dark:border-gray-700"
        }`}
      >
        {items.length === 0 && (
          <button
            onClick={() => onAddClick(date)}
            className="w-full h-14 sm:h-24 flex flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-gray-200 dark:border-gray-700 text-gray-300 dark:text-gray-600 hover:text-teal-400 hover:border-teal-300 transition-colors"
          >
            <span className="material-symbols-outlined text-2xl">add</span>
            <span className="text-[11px] font-medium">Add item</span>
          </button>
        )}
        {items.map((item) => (
          <DraggableCard key={item.id} item={item}>
            {item.itemType === "TASK" ? (
              <TaskCard item={item} onCycleStatus={onCycleStatus} onEdit={onEdit} />
            ) : (
              <PostCard item={item} onEdit={onEdit} />
            )}
          </DraggableCard>
        ))}
      </div>
    </div>
  );
}

// ── Create / Edit modal ───────────────────────────────────────
const emptyForm = { itemType: "POST", caption: "", hashtags: "", mediaType: "IMAGE", scheduledFor: "", taskStatus: "TODO" };

function ItemModal({ open, initial, dayDate, editing, onClose, onSave, onDelete, onApprove, onPublish, saving }) {
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (!open) return;
    if (editing && initial) {
      setForm({
        itemType: initial.itemType || "POST",
        caption: initial.caption || "",
        hashtags: initial.hashtags || "",
        mediaType: initial.mediaType && initial.mediaType !== "NONE" ? initial.mediaType : "IMAGE",
        scheduledFor: initial.scheduledFor ? initial.scheduledFor.slice(0, 16) : "",
        taskStatus: initial.taskStatus || "TODO",
      });
    } else {
      // New item on a given day — default 9:00 AM for posts, midnight for tasks handled on save
      const d = new Date(dayDate || new Date());
      d.setHours(9, 0, 0, 0);
      setForm({ ...emptyForm, scheduledFor: `${formatDate(d)}T09:00` });
    }
  }, [open, editing, initial, dayDate]);

  if (!open) return null;

  const isTask = form.itemType === "TASK";
  const isPost = form.itemType === "POST";
  const isPublished = editing && initial?.status === "PUBLISHED";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700">
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
            {editing ? (isTask ? "Edit Task" : "Edit Post") : "Add to Board"}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Type toggle — only when creating */}
          {!editing && (
            <div className="flex rounded-lg bg-gray-100 dark:bg-gray-700 p-1">
              {["POST", "TASK"].map((t) => (
                <button
                  key={t}
                  onClick={() => setForm({ ...form, itemType: t })}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                    form.itemType === t
                      ? "bg-white dark:bg-gray-800 text-teal-600 dark:text-teal-400 shadow-sm"
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  {t === "POST" ? "📝 Post" : "✅ Task"}
                </button>
              ))}
            </div>
          )}

          {/* Title / Caption */}
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              {isTask ? "Task title" : "Caption"}
            </label>
            <textarea
              rows={isTask ? 2 : 3}
              value={form.caption}
              onChange={(e) => setForm({ ...form, caption: e.target.value })}
              placeholder={isTask ? "e.g. Film B-roll for Tuesday reel" : "What's this post about?"}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>

          {/* Post-only fields */}
          {isPost && (
            <>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Hashtags</label>
                <input
                  type="text"
                  value={form.hashtags}
                  onChange={(e) => setForm({ ...form, hashtags: e.target.value })}
                  placeholder="#one, #two"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Media type</label>
                <select
                  value={form.mediaType}
                  onChange={(e) => setForm({ ...form, mediaType: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  <option value="IMAGE">Image</option>
                  <option value="VIDEO">Video</option>
                  <option value="REEL">Reel</option>
                  <option value="CAROUSEL">Carousel</option>
                </select>
              </div>
            </>
          )}

          {/* Task-only: status */}
          {isTask && (
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Status</label>
              <select
                value={form.taskStatus}
                onChange={(e) => setForm({ ...form, taskStatus: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="DONE">Done</option>
              </select>
            </div>
          )}

          {/* Schedule datetime */}
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              {isTask ? "Day" : "Schedule for"}
            </label>
            <input
              type="datetime-local"
              value={form.scheduledFor}
              onChange={(e) => setForm({ ...form, scheduledFor: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
            {isTask && <p className="text-[10px] text-gray-400 mt-1">Tasks sit on a day — time is optional.</p>}
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-5 py-4 border-t border-gray-100 dark:border-gray-700 space-y-2">
          <div className="flex space-x-2">
            <button
              onClick={() => onSave(form)}
              disabled={saving}
              className="flex-1 py-2 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 disabled:opacity-50 transition-colors"
            >
              {saving ? "Saving..." : editing ? "Save changes" : "Add to board"}
            </button>
            {editing && (
              <button
                onClick={() => onDelete(initial)}
                className="px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-medium rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
              >
                Delete
              </button>
            )}
          </div>

          {/* Post-only lifecycle actions */}
          {editing && isPost && !isPublished && (
            <div className="flex space-x-2">
              {initial?.status === "PENDING" && (
                <button
                  onClick={() => onApprove(initial)}
                  className="flex-1 py-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-sm font-medium rounded-lg hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors"
                >
                  Approve
                </button>
              )}
              {initial?.status === "APPROVED" && (
                <button
                  onClick={() => onPublish(initial)}
                  className="flex-1 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-sm font-medium rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                >
                  Mark Published
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main board ────────────────────────────────────────────────
export default function BoardPage() {
  const { selectedCreator } = useCreator();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
  const [activeItem, setActiveItem] = useState(null);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [modalDay, setModalDay] = useState(null);
  const [saving, setSaving] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const fetchItems = useCallback(async () => {
    if (!selectedCreator) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/api/schedule/list?creatorId=${selectedCreator.id}`, getAxiosConfig(selectedCreator));
      setItems(res.data || []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [selectedCreator]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const itemsForDay = (date) => {
    const ds = formatDate(date);
    return items
      .filter((it) => it.scheduledFor && it.scheduledFor.startsWith(ds))
      .sort((a, b) => new Date(a.scheduledFor) - new Date(b.scheduledFor));
  };

  // ── Drag to reschedule (change date, keep time-of-day) ──
  const handleDragEnd = async (event) => {
    setActiveItem(null);
    const { active, over } = event;
    if (!over) return;
    const item = items.find((it) => String(it.id) === String(active.id));
    if (!item) return;
    const targetDay = over.id; // "YYYY-MM-DD"
    const currentDay = item.scheduledFor?.slice(0, 10);
    if (targetDay === currentDay) return;

    // Preserve the original time-of-day, swap the date
    const timePart = item.scheduledFor ? item.scheduledFor.slice(10) : "T00:00:00"; // includes leading "T"
    const newScheduledFor = `${targetDay}${timePart.length >= 6 ? timePart : "T00:00:00"}`;

    // Optimistic update
    const prev = items;
    setItems((list) => list.map((it) => (it.id === item.id ? { ...it, scheduledFor: newScheduledFor } : it)));
    try {
      await axios.put(`${API_BASE}/api/schedule/update/${item.id}`, { scheduledFor: newScheduledFor }, getAxiosConfig(selectedCreator));
      toast.success(`Moved to ${targetDay}`);
    } catch {
      setItems(prev); // rollback
      toast.error("Couldn't reschedule.");
    }
  };

  // ── Cycle task status TODO -> IN_PROGRESS -> DONE ──
  const cycleTaskStatus = async (task) => {
    const next = TASK_CYCLE[task.taskStatus] || "IN_PROGRESS";
    const prev = items;
    setItems((list) => list.map((it) => (it.id === task.id ? { ...it, taskStatus: next } : it)));
    try {
      await axios.put(`${API_BASE}/api/schedule/update/${task.id}`, { taskStatus: next }, getAxiosConfig(selectedCreator));
    } catch {
      setItems(prev);
      toast.error("Couldn't update task status.");
    }
  };

  // ── Modal open helpers ──
  const openCreate = (date) => { setEditingItem(null); setModalDay(date); setModalOpen(true); };
  const openEdit = (item) => { setEditingItem(item); setModalDay(null); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditingItem(null); setModalDay(null); };

  // ── Save (create or update) ──
  const handleSave = async (form) => {
    if (!form.caption.trim()) { toast.error(form.itemType === "TASK" ? "Task title is required" : "Caption is required"); return; }
    if (!form.scheduledFor) { toast.error("Please pick a day"); return; }

    const scheduledForValue = form.scheduledFor.length === 16 ? form.scheduledFor + ":00" : form.scheduledFor;
    setSaving(true);
    try {
      if (editingItem) {
        // Update — send fields relevant to the type
        const body = editingItem.itemType === "TASK"
          ? { caption: form.caption, scheduledFor: scheduledForValue, taskStatus: form.taskStatus }
          : { caption: form.caption, hashtags: form.hashtags, mediaType: form.mediaType, scheduledFor: scheduledForValue };
        await axios.put(`${API_BASE}/api/schedule/update/${editingItem.id}`, body, getAxiosConfig(selectedCreator));
        toast.success("Saved!");
      } else if (form.itemType === "TASK") {
        await axios.post(`${API_BASE}/api/schedule/create`, {
          creatorId: selectedCreator.id,
          caption: form.caption,
          scheduledFor: scheduledForValue,
          itemType: "TASK",
          taskStatus: form.taskStatus,
        }, getAxiosConfig(selectedCreator));
        toast.success("Task added!");
      } else {
        await axios.post(`${API_BASE}/api/schedule/create`, {
          creatorId: selectedCreator.id,
          caption: form.caption,
          hashtags: form.hashtags,
          mediaType: form.mediaType,
          mediaUrl: null,
          scheduledFor: scheduledForValue,
        }, getAxiosConfig(selectedCreator));
        toast.success("Post scheduled!");
      }
      closeModal();
      await fetchItems();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item) => {
    if (!confirm(`Delete this ${item.itemType === "TASK" ? "task" : "post"}?`)) return;
    try {
      await axios.delete(`${API_BASE}/api/schedule/delete/${item.id}`, getAxiosConfig(selectedCreator));
      toast.success("Deleted");
      closeModal();
      await fetchItems();
    } catch { toast.error("Failed to delete."); }
  };

  const handleApprove = async (item) => {
    try {
      await axios.put(`${API_BASE}/api/schedule/approve/${item.id}`, {}, getAxiosConfig(selectedCreator));
      toast.success("Post approved!");
      closeModal();
      await fetchItems();
    } catch (err) { toast.error(err.response?.data?.error || "Failed to approve."); }
  };

  const handlePublish = async (item) => {
    try {
      await axios.put(`${API_BASE}/api/schedule/publish/${item.id}`, {}, getAxiosConfig(selectedCreator));
      toast.success("Post marked as published!");
      closeModal();
      await fetchItems();
    } catch (err) { toast.error(err.response?.data?.error || "Failed to publish."); }
  };

  const goToday = () => setWeekStart(startOfWeek(new Date()));
  const prevWeek = () => setWeekStart((w) => addDays(w, -7));
  const nextWeek = () => setWeekStart((w) => addDays(w, 7));

  const weekEnd = addDays(weekStart, 6);
  const weekLabel =
    weekStart.getMonth() === weekEnd.getMonth()
      ? `${MONTHS_SHORT[weekStart.getMonth()]} ${weekStart.getDate()} – ${weekEnd.getDate()}, ${weekEnd.getFullYear()}`
      : `${MONTHS_SHORT[weekStart.getMonth()]} ${weekStart.getDate()} – ${MONTHS_SHORT[weekEnd.getMonth()]} ${weekEnd.getDate()}, ${weekEnd.getFullYear()}`;

  const totalThisWeek = weekDays.reduce((sum, d) => sum + itemsForDay(d).length, 0);

  return (
    <div className="min-h-full bg-gray-50 dark:bg-gray-800">
      <main className="w-full px-5 py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-5 gap-3">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center space-x-2">
              <span className="material-symbols-outlined text-teal-500">view_kanban</span>
              <span>Weekly Board</span>
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Drag posts &amp; tasks between days to reschedule. {totalThisWeek} item{totalThisWeek === 1 ? "" : "s"} this week.
            </p>
          </div>

          {/* Week nav */}
          <div className="flex items-center space-x-2">
            <button onClick={goToday} className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              Today
            </button>
            <div className="flex items-center rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden">
              <button onClick={prevWeek} className="px-2 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <span className="material-symbols-outlined text-lg text-gray-500 dark:text-gray-400 leading-none">chevron_left</span>
              </button>
              <span className="px-3 text-xs font-medium text-gray-700 dark:text-gray-200 whitespace-nowrap">{weekLabel}</span>
              <button onClick={nextWeek} className="px-2 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <span className="material-symbols-outlined text-lg text-gray-500 dark:text-gray-400 leading-none">chevron_right</span>
              </button>
            </div>
          </div>
        </div>

        {!selectedCreator ? (
          <div className="text-center py-20 text-sm text-gray-400">Select an account to view the board.</div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={(e) => setActiveItem(items.find((it) => String(it.id) === String(e.active.id)) || null)}
            onDragEnd={handleDragEnd}
            onDragCancel={() => setActiveItem(null)}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3">
              {weekDays.map((date) => (
                <DayColumn
                  key={formatDate(date)}
                  date={date}
                  items={itemsForDay(date)}
                  onAddClick={openCreate}
                  onEdit={openEdit}
                  onCycleStatus={cycleTaskStatus}
                />
              ))}
            </div>

            {/* Drag preview */}
            <DragOverlay>
              {activeItem ? (
                <div className="w-72 rotate-2 opacity-90">
                  {activeItem.itemType === "TASK"
                    ? <TaskCard item={activeItem} onCycleStatus={() => {}} onEdit={() => {}} />
                    : <PostCard item={activeItem} onEdit={() => {}} />}
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        )}
      </main>

      <ItemModal
        open={modalOpen}
        initial={editingItem}
        dayDate={modalDay}
        editing={!!editingItem}
        onClose={closeModal}
        onSave={handleSave}
        onDelete={handleDelete}
        onApprove={handleApprove}
        onPublish={handlePublish}
        saving={saving}
      />
    </div>
  );
}

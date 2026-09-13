import React, { useState } from "react";
import { Link, useNavigate, useLocation, Outlet } from "react-router-dom";
import { toast } from "react-toastify";
import { useCreator } from "../analytics/CreatorContext";
import DarkModeToggle from "../DarkModeToggle";
import NotificationBell from "./NotificationBell";
import { getEmailFromToken } from "../tokenDecoder/detokenizer";
import PhylloConnectButton from "../analytics/PhylloConnect";
import { FaInstagram, FaFacebook, FaTiktok, FaYoutube, FaSnapchat, FaLinkedin } from "react-icons/fa";

const NAV_SECTIONS = [
  {
    label: null,
    items: [
      { label: "Plan", path: "/plan", icon: "dashboard" },
      { label: "Calendar", path: "/calendar", icon: "calendar_month" },
      { label: "Board", path: "/board", icon: "view_kanban" },
      { label: "Improve", path: "/analytics", icon: "trending_up" },
      { label: "Ask MAYA", path: "/chat", icon: "smart_toy" },
      { label: "Create", path: "/create", icon: "auto_awesome" },
    ],
  },
  {
    label: "Manage",
    items: [
      { label: "Comments", path: "/comments", icon: "forum" },
      { label: "Trends", path: "/trends", icon: "lightbulb" },
      { label: "Account", path: "/UserAccountMgnt", icon: "manage_accounts" },
    ],
  },
];

const PAGE_META = {
  "/plan": { title: "Plan" },
  "/calendar": { title: "Calendar" },
  "/board": { title: "Board" },
  "/analytics": { title: "Improve" },
  "/chat": { title: "Ask MAYA" },
  "/create": { title: "Create" },
  "/comments": { title: "Comments" },
  "/trends": { title: "Trends" },
  "/UserAccountMgnt": { title: "Account" },
};

const PLATFORM_STYLES = {
  INSTAGRAM: { bg: "bg-gradient-to-br from-purple-500 to-pink-500" },
  FACEBOOK: { bg: "bg-blue-600" },
  TIKTOK: { bg: "bg-black dark:bg-gray-600" },
  YOUTUBE: { bg: "bg-red-600" },
  PINTEREST: { bg: "bg-red-500" },
  SNAPCHAT: { bg: "bg-yellow-400" },
  LINKEDIN: { bg: "bg-blue-700" },
  X: { bg: "bg-gray-800 dark:bg-gray-600" },
  TWITCH: { bg: "bg-purple-600" },
  SPOTIFY: { bg: "bg-green-500" },
};

function PlatformIcon({ platform }) {
  const p = platform?.toUpperCase();
  switch (p) {
    case "INSTAGRAM": return <FaInstagram className="text-white text-xs" />;
    case "FACEBOOK": return <FaFacebook className="text-white text-xs" />;
    case "TIKTOK": return <FaTiktok className="text-white text-xs" />;
    case "YOUTUBE": return <FaYoutube className="text-white text-xs" />;
    case "SNAPCHAT": return <FaSnapchat className="text-white text-xs" />;
    case "LINKEDIN": return <FaLinkedin className="text-white text-xs" />;
    default: return <span className="text-white text-[10px] font-bold">{p ? p[0] : "?"}</span>;
  }
}

export default function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedCreator, setSelectedCreator, refreshAuth, connectedAccounts, loading } = useCreator();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const token = sessionStorage.getItem("token");
  const email = token ? getEmailFromToken(token) : null;

  // Display name + initials for the account avatar (image comes in a later update)
  let displayName = null;
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      displayName = payload.name || payload.firstname || null;
    } catch { /* ignore */ }
  }
  const initials = (() => {
    const src = displayName || email || "";
    const parts = src.trim().split(/[\s@._-]+/).filter(Boolean);
    if (parts.length === 0) return "?";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  })();

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    setSelectedCreator(null);
    refreshAuth();
    toast.success("You have been logged out successfully.");
    navigate("/login");
  };

  const meta = PAGE_META[location.pathname] ||
    Object.entries(PAGE_META).find(([p]) => location.pathname.startsWith(p))?.[1] ||
    { title: "MAYA" };

  const sidebarWidth = collapsed ? "w-[72px]" : "w-72";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-800 flex">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-30 bg-gray-900/50 backdrop-blur-sm md:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* ═══════════ SIDEBAR ═══════════ */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen z-40 bg-white dark:bg-gray-700/30 flex flex-col transition-all duration-200 shadow-[1px_0_0_0_rgba(0,0,0,0.04)] dark:shadow-[1px_0_0_0_rgba(255,255,255,0.06)] ${sidebarWidth} ${
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Logo → home */}
        <div className="flex items-center justify-between h-16 px-4 flex-shrink-0">
          <Link to="/" className="flex items-center space-x-2.5 overflow-hidden group" title="Back to home">
            <div className="w-9 h-9 rounded-xl overflow-hidden flex-shrink-0 shadow-sm group-hover:scale-105 transition-transform">
              <img src="/logo.png" alt="MAYA" className="w-full h-full object-cover" />
            </div>
            {!collapsed && <span className="font-bold text-xl text-gray-900 dark:text-white whitespace-nowrap">MAYA</span>}
          </Link>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden md:flex w-7 h-7 items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 dark:text-gray-500 flex-shrink-0"
            title={collapsed ? "Expand" : "Collapse"}
          >
            <span className="material-symbols-outlined text-lg">{collapsed ? "chevron_right" : "chevron_left"}</span>
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-6">
          {NAV_SECTIONS.map((section, sIdx) => (
            <div key={sIdx}>
              {section.label && !collapsed && (
                <p className="px-3 mb-2 text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{section.label}</p>
              )}
              <div className="space-y-1">
                {section.items.map((item) => {
                  const active = isActive(item.path);
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileOpen(false)}
                      title={collapsed ? item.label : undefined}
                      className={`relative flex items-center rounded-xl text-[15px] font-medium transition-all ${collapsed ? "justify-center px-2 py-3" : "px-3 py-2.5 space-x-3"} ${
                        active
                          ? "bg-teal-50 dark:bg-teal-500/15 text-teal-700 dark:text-teal-300"
                          : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                      }`}
                    >
                      {/* Active left accent bar */}
                      {active && !collapsed && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-teal-500 rounded-r-full" />
                      )}
                      <span className={`material-symbols-outlined text-[22px] flex-shrink-0 ${active ? "text-teal-600 dark:text-teal-400" : ""}`}>{item.icon}</span>
                      {!collapsed && <span className="whitespace-nowrap">{item.label}</span>}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Platforms — connected accounts */}
          {!collapsed && (
            <div>
              <p className="px-3 mb-2 text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Platforms</p>
              <div className="space-y-1">
                {loading ? (
                  <div className="px-3 py-2"><div className="w-full h-4 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" /></div>
                ) : connectedAccounts.length > 0 ? (
                  connectedAccounts.map((acc) => {
                    const style = PLATFORM_STYLES[acc.platform?.toUpperCase()] || { bg: "bg-gray-500" };
                    const active = selectedCreator?.id === acc.id && !selectedCreator?.isDemo;
                    return (
                      <button
                        key={acc.id}
                        onClick={() => { setSelectedCreator({ ...acc }); setMobileOpen(false); }}
                        className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-sm transition-all ${
                          active
                            ? "bg-teal-50 dark:bg-teal-500/15 text-teal-700 dark:text-teal-300 font-medium"
                            : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                        }`}
                      >
                        <span className={`relative w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden ${style.bg}`}>
                          <PlatformIcon platform={acc.platform} />
                          {acc.profilePictureUrl && (
                            <img src={acc.profilePictureUrl} alt="" className="absolute inset-0 w-full h-full object-cover"
                              onError={(e) => { e.target.style.display = "none"; }} />
                          )}
                        </span>
                        <span className="truncate flex-1 text-left">@{acc.username}</span>
                        {active && <span className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0" />}
                      </button>
                    );
                  })
                ) : null}

                {/* Connect / add account — launches Phyllo connect flow directly */}
                <PhylloConnectButton
                  variant="custom"
                  className="w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-teal-600 dark:hover:text-teal-400 transition-colors disabled:opacity-60 disabled:cursor-wait"
                >
                  <span className="w-6 h-6 rounded-full border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-sm">add</span>
                  </span>
                  <span>{connectedAccounts.length > 0 ? "Connect another" : "Connect account"}</span>
                </PhylloConnectButton>
              </div>
            </div>
          )}
        </nav>

        {/* Bottom: user + logout */}
        <div className="p-3 flex-shrink-0 shadow-[0_-1px_0_0_rgba(0,0,0,0.04)] dark:shadow-[0_-1px_0_0_rgba(255,255,255,0.04)]">
          {!collapsed && email && (
            <div className="px-3 py-1.5 mb-1">
              <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{email}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            title={collapsed ? "Logout" : undefined}
            className={`flex items-center w-full rounded-xl text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors ${collapsed ? "justify-center px-2 py-3" : "px-3 py-2.5 space-x-3"}`}
          >
            <span className="material-symbols-outlined text-[22px] flex-shrink-0">logout</span>
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* ═══════════ MAIN AREA ═══════════ */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar — same bg as page, soft elevation shadow so it floats above scrolling content */}
        <header className="sticky top-0 z-20 h-16 bg-gray-50/90 dark:bg-gray-800/90 backdrop-blur-md flex items-center justify-between px-4 md:px-6 flex-shrink-0 shadow-[0_4px_16px_-6px_rgba(0,0,0,0.08)] dark:shadow-[0_4px_20px_-6px_rgba(0,0,0,0.35)]">
          {/* Left: mobile menu + breadcrumb */}
          <div className="flex items-center space-x-3 min-w-0">
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300"
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
            <div className="min-w-0">
              <div className="flex items-center space-x-1.5 text-xs text-gray-400 dark:text-gray-500">
                <Link to="/" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">MAYA</Link>
                {selectedCreator && (
                  <>
                    <span className="material-symbols-outlined text-sm">chevron_right</span>
                    <span className="truncate">@{selectedCreator.username}</span>
                  </>
                )}
              </div>
              <h1 className="text-base font-semibold text-gray-900 dark:text-white leading-tight truncate">{meta.title}</h1>
            </div>
          </div>

          {/* Right: controls */}
          <div className="flex items-center space-x-2 flex-shrink-0">
            <NotificationBell />
            <DarkModeToggle />
            {/* Account avatar — initials for now, image in a later update */}
            <Link
              to="/UserAccountMgnt"
              title={displayName || email || "Account"}
              className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white bg-gradient-to-br from-teal-500 to-cyan-500 shadow-sm hover:ring-2 hover:ring-teal-300 dark:hover:ring-teal-600 transition-all ${
                isActive("/UserAccountMgnt") ? "ring-2 ring-teal-400" : ""
              }`}
            >
              {initials}
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

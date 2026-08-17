import { React, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { getRoleFromToken, isJwtExpired } from "./tokenDecoder/detokenizer";
import DarkModeToggle from "./DarkModeToggle";
import NotificationBell from "./components/NotificationBell";
import AccountSwitcher from "./components/AccountSwitcher";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Auth state
  const token = sessionStorage.getItem("token");
  const role = token ? getRoleFromToken(token) : null;
  const isExpired = token ? isJwtExpired(token) : true;
  const isAuthenticated = token && role === "USER" && !isExpired;

  // Check if current path matches a nav item
  const isActive = (path) => location.pathname === path;

  // Navigation helpers for public site
  const scrollTo = (section) => {
    navigate("/", { state: { scrollTo: section } });
    setMobileMenuOpen(false);
  };

  const NAV_ITEMS = [
    { label: "Plan", path: "/plan", icon: "calendar_month" },
    { label: "Calendar", path: "/calendar", icon: "date_range" },
    { label: "Improve", path: "/analytics", icon: "trending_up" },
    { label: "Ask MAYA", path: "/chat", icon: "smart_toy" },
    { label: "Create", path: "/create", icon: "edit_square" },
    { label: "Accounts", path: "/UserAccountMgnt", icon: "manage_accounts" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-20 flex items-center justify-between px-6 py-3 border-b border-gray-100 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm">

      {/* Left: Logo */}
      <Link to="/" className="flex items-center space-x-2">
        <div className="w-8 h-8 rounded-lg overflow-hidden">
          <img src="/logo.png" alt="MAYA" className="w-full h-full object-cover" />
        </div>
        <span className="font-bold text-lg text-gray-900 dark:text-gray-100">MAYA</span>
      </Link>

      {/* Center: Navigation */}
      <nav className="hidden md:flex items-center">
        {isAuthenticated ? (
          /* Authenticated: Product navigation */
          <div className="flex items-center space-x-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive(item.path)
                    ? "bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        ) : (
          /* Public: Marketing navigation */
          <div className="flex items-center space-x-6">
            <button onClick={() => scrollTo("features")} className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">Features</button>
            <button onClick={() => scrollTo("about")} className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">How It Works</button>
            <a href="/demo" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">Demo</a>
            <button onClick={() => scrollTo("pricing")} className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">Pricing</button>
          </div>
        )}
      </nav>

      {/* Right: Controls */}
      <div className="hidden md:flex items-center space-x-2">
        {isAuthenticated ? (
          <>
            <AccountSwitcher />
            <NotificationBell />
            <DarkModeToggle />
          </>
        ) : (
          <>
            <DarkModeToggle />
            <Link to="/login">
              <button className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
                Login
              </button>
            </Link>
            <Link to="/register">
              <button className="px-4 py-2 text-sm bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium">
                Sign Up
              </button>
            </Link>
          </>
        )}
      </div>

      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
        className="md:hidden text-gray-700 dark:text-gray-200 focus:outline-none"
      >
        <span className="material-symbols-outlined text-2xl">{isMobileMenuOpen ? "close" : "menu"}</span>
      </button>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-lg z-20 md:hidden">
          <div className="px-6 py-4 space-y-1">
            {isAuthenticated ? (
              /* Authenticated mobile */
              <>
                {NAV_ITEMS.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                      isActive(item.path)
                        ? "bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                    }`}
                  >
                    <span className="material-symbols-outlined text-lg">{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                ))}
                <div className="border-t border-gray-100 dark:border-gray-700 pt-3 mt-3 flex items-center space-x-3">
                  <AccountSwitcher />
                  <NotificationBell />
                  <DarkModeToggle />
                </div>
              </>
            ) : (
              /* Public mobile */
              <>
                <button onClick={() => scrollTo("features")} className="block w-full text-left px-3 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg">Features</button>
                <button onClick={() => scrollTo("about")} className="block w-full text-left px-3 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg">How It Works</button>
                <a href="/demo" target="_blank" className="block w-full text-left px-3 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg">Demo</a>
                <button onClick={() => scrollTo("pricing")} className="block w-full text-left px-3 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg">Pricing</button>
                <div className="border-t border-gray-100 dark:border-gray-700 pt-3 mt-3 flex items-center justify-between">
                  <DarkModeToggle />
                  <div className="flex items-center space-x-2">
                    <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg">Login</Link>
                    <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="px-4 py-2 text-sm bg-teal-600 text-white rounded-lg font-medium">Sign Up</Link>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;

import React, { useState, useRef, useEffect } from "react";
import { useCreator } from "./CreatorContext";

export default function CreatorSelector() {
  const { demoCreators, connectedAccounts, selectedCreator, setSelectedCreator, loading, authState } = useCreator();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filterList = (list) =>
    list.filter(
      (c) =>
        c.username.toLowerCase().includes(search.toLowerCase()) ||
        (c.niche || c.platform || "").toLowerCase().includes(search.toLowerCase())
    );

  const filteredConnected = filterList(connectedAccounts);
  const filteredDemo = filterList(demoCreators);

  if (loading) {
    return (
      <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 text-sm">
        <span>Loading creators...</span>
      </div>
    );
  }

  return (
    <div className="relative" ref={wrapperRef}>
      <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mr-2">Creator:</label>

      <button
        onClick={() => {
          setIsOpen(!isOpen);
          setSearch("");
          setTimeout(() => inputRef.current?.focus(), 50);
        }}
        className="inline-flex items-center border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 min-w-[200px] justify-between"
      >
        <span className="flex items-center space-x-1.5">
          <span>{selectedCreator ? `@${selectedCreator.username}` : "Select creator"}</span>
          {selectedCreator?.isDemo && (
            <span className="text-[10px] px-1.5 py-0.5 bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400 rounded font-medium">Demo</span>
          )}
        </span>
        <span className="material-symbols-outlined text-base ml-2 text-gray-500 dark:text-gray-400">
          {isOpen ? "expand_less" : "expand_more"}
        </span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-80 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-30">
          {/* Search */}
          <div className="p-2 border-b border-gray-100 dark:border-gray-600">
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by username or niche..."
              className="w-full border border-gray-200 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>

          <div className="max-h-64 overflow-y-auto">
            {/* Connected Accounts Section */}
            {authState.isLoggedIn && filteredConnected.length > 0 && (
              <>
                <div className="px-3 py-1.5 text-[11px] uppercase font-semibold text-teal-600 dark:text-teal-400 tracking-wider bg-gray-50 dark:bg-gray-800">
                  Your Accounts
                </div>
                {filteredConnected.map((creator) => (
                  <button
                    key={`connected-${creator.id}`}
                    onClick={() => {
                      setSelectedCreator(creator);
                      setIsOpen(false);
                      setSearch("");
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-teal-50 dark:hover:bg-teal-900/30 transition-colors flex items-center justify-between ${
                      selectedCreator?.id === creator.id && !selectedCreator?.isDemo
                        ? "bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 font-medium"
                        : "text-gray-700 dark:text-gray-200"
                    }`}
                  >
                    <span className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full" />
                      <span>@{creator.username}</span>
                    </span>
                    <span className="text-xs text-gray-400 dark:text-gray-500">{creator.platform}</span>
                  </button>
                ))}
              </>
            )}

            {/* Demo Profiles Section — only show if NOT logged in */}
            {!authState.isLoggedIn && (
              <>
                <div className="px-3 py-1.5 text-[11px] uppercase font-semibold text-gray-500 dark:text-gray-400 tracking-wider bg-gray-50 dark:bg-gray-800">
                  Demo Profiles
                </div>
                {filteredDemo.length > 0 ? (
                  filteredDemo.map((creator) => (
                    <button
                      key={`demo-${creator.id}`}
                      onClick={() => {
                        setSelectedCreator(creator);
                        setIsOpen(false);
                        setSearch("");
                      }}
                      className={`w-full text-left px-4 py-2.5 text-sm hover:bg-teal-50 dark:hover:bg-teal-900/30 transition-colors flex items-center justify-between ${
                        selectedCreator?.id === creator.id && selectedCreator?.isDemo
                          ? "bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 font-medium"
                          : "text-gray-700 dark:text-gray-200"
                      }`}
                    >
                      <span className="flex items-center space-x-2">
                        <span>@{creator.username}</span>
                        <span className="text-[10px] px-1.5 py-0.5 bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400 rounded">Demo</span>
                      </span>
                      <span className="text-xs text-gray-400 dark:text-gray-500">{creator.niche}</span>
                    </button>
                  ))
                ) : (
                  <p className="px-4 py-3 text-sm text-gray-400 dark:text-gray-500 text-center">No creators found</p>
                )}
              </>
            )}

            {/* Connect CTA — logged in but no accounts */}
            {authState.isLoggedIn && filteredConnected.length === 0 && (
              <div className="px-4 py-4 text-center">
                <span className="material-symbols-outlined text-2xl text-gray-300 dark:text-gray-600 mb-1">link_off</span>
                <p className="text-xs text-gray-500 dark:text-gray-400">No accounts connected</p>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">Go to Account → Connect Social Account</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

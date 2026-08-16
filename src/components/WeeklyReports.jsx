import React, { useState, useEffect } from "react";
import axios from "axios";
import { useCreator } from "../analytics/CreatorContext";

const API_BASE = "https://maya-backend-service-326007673689.asia-southeast1.run.app";

function AccountSelector({ connectedAccounts, selectedAccountId, setSelectedAccountId }) {
  return (
    <div className="flex items-center space-x-2 mb-4">
      <span className="text-xs text-gray-500 dark:text-gray-400">Account:</span>
      <select
        value={selectedAccountId || ""}
        onChange={(e) => setSelectedAccountId(Number(e.target.value))}
        className="text-xs border border-gray-200 dark:border-gray-600 rounded-lg px-2.5 py-1.5 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
      >
        {connectedAccounts.map((acc) => (
          <option key={acc.id} value={acc.id}>@{acc.username} ({acc.platform})</option>
        ))}
      </select>
    </div>
  );
}

export default function WeeklyReports({ refreshTrigger }) {
  const { connectedAccounts, authState } = useCreator();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [selectedAccountId, setSelectedAccountId] = useState(null);

  // Default to first connected account
  useEffect(() => {
    if (connectedAccounts.length > 0 && !selectedAccountId) {
      setSelectedAccountId(connectedAccounts[0].id);
    }
  }, [connectedAccounts]);

  const activeAccount = connectedAccounts.find(a => a.id === selectedAccountId) || connectedAccounts[0] || null;

  useEffect(() => {
    if (!activeAccount || !authState.isLoggedIn) {
      setReports([]);
      return;
    }

    const fetchReports = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `${API_BASE}/api/analytics/weekly-reports/${activeAccount.id}`,
          { headers: { Authorization: `Bearer ${authState.token}` } }
        );
        setReports(res.data || []);
      } catch (err) {
        console.error("Failed to fetch weekly reports:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [activeAccount, refreshTrigger, authState.isLoggedIn]);

  const formatWeek = (start, end) => {
    const s = new Date(start);
    const e = new Date(end);
    return `${s.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${e.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
  };

  const getDeltaColor = (delta) => {
    if (delta > 0) return "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20";
    if (delta < 0) return "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20";
    return "text-gray-500 bg-gray-100 dark:bg-gray-700";
  };

  if (!activeAccount) {
    return (
      <div className="text-center py-8 text-gray-400 dark:text-gray-500">
        <span className="material-symbols-outlined text-3xl mb-2">calendar_month</span>
        <p className="text-sm">Connect a social account to see weekly reports</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-14 bg-gray-100 dark:bg-gray-700 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div>
        {/* Account Selector */}
        {connectedAccounts.length > 1 && (
          <AccountSelector connectedAccounts={connectedAccounts} selectedAccountId={selectedAccountId} setSelectedAccountId={setSelectedAccountId} />
        )}
        <div className="text-center py-8 text-gray-400 dark:text-gray-500">
          <span className="material-symbols-outlined text-3xl mb-2">pending</span>
          <p className="text-sm">No weekly reports yet</p>
          <p className="text-xs mt-1">Your first report will be generated at the end of this week</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Account Selector */}
      {connectedAccounts.length > 1 && (
        <AccountSelector connectedAccounts={connectedAccounts} selectedAccountId={selectedAccountId} setSelectedAccountId={setSelectedAccountId} />
      )}

      <div className="space-y-2">
      {reports.map((report) => (
        <div key={report.id}>
          {/* Row */}
          <button
            onClick={() => setExpandedId(expandedId === report.id ? null : report.id)}
            className="w-full flex items-center justify-between p-3.5 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-100 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors text-left"
          >
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 bg-teal-50 dark:bg-teal-900/20 rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-teal-600 dark:text-teal-400 text-base">assessment</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                  {formatWeek(report.weekStartDate, report.weekEndDate)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Score: {report.healthScore?.toFixed(0) || "—"}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {report.healthScoreDelta != null && (
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getDeltaColor(report.healthScoreDelta)}`}>
                  {report.healthScoreDelta > 0 ? "+" : ""}{report.healthScoreDelta.toFixed(1)}
                </span>
              )}
              <span className={`material-symbols-outlined text-gray-400 text-base transition-transform ${expandedId === report.id ? "rotate-180" : ""}`}>
                expand_more
              </span>
            </div>
          </button>

          {/* Expanded Detail Card */}
          {expandedId === report.id && (
            <div className="mt-2 p-5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-md animate-[fadeIn_0.2s_ease-out]">
              {/* Health Score Hero */}
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100 dark:border-gray-700">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Health Score</p>
                  <p className="text-3xl font-bold text-gray-800 dark:text-gray-100">{report.healthScore?.toFixed(0) || "—"}</p>
                </div>
                {report.healthScoreDelta != null && (
                  <div className={`text-center px-3 py-2 rounded-xl ${getDeltaColor(report.healthScoreDelta)}`}>
                    <p className="text-lg font-bold">{report.healthScoreDelta > 0 ? "+" : ""}{report.healthScoreDelta.toFixed(1)}</p>
                    <p className="text-[10px]">vs last week</p>
                  </div>
                )}
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                <div className="text-center p-2.5 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-lg font-bold text-gray-800 dark:text-gray-100">{report.avgEngagementRate?.toFixed(2) || "—"}%</p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">Avg ER</p>
                </div>
                <div className="text-center p-2.5 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-lg font-bold text-gray-800 dark:text-gray-100">{report.avgSaveRate?.toFixed(2) || "—"}%</p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">Save Rate</p>
                </div>
                <div className="text-center p-2.5 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-lg font-bold text-gray-800 dark:text-gray-100">{report.avgShareRate?.toFixed(2) || "—"}%</p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">Share Rate</p>
                </div>
                <div className="text-center p-2.5 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-lg font-bold text-gray-800 dark:text-gray-100">{report.avgReachEfficiency?.toFixed(0) || "—"}%</p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">Reach Efficiency</p>
                </div>
              </div>

              {/* Bottom row */}
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-2.5 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-sm font-bold text-gray-800 dark:text-gray-100">{report.postsPublished || 0}</p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">Posts Published</p>
                </div>
                <div className="text-center p-2.5 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center justify-center space-x-1">
                    <span className="text-xs">😊</span>
                    <p className="text-sm font-bold text-gray-800 dark:text-gray-100">{report.sentimentPositivePct?.toFixed(0) || 0}%</p>
                  </div>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">Positive Sentiment</p>
                </div>
                <div className="text-center p-2.5 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-sm font-bold text-orange-600 dark:text-orange-400">{report.unansweredQuestionsCount || 0}</p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">Unanswered Q's</p>
                </div>
              </div>

              {/* Generated date */}
              <p className="text-[10px] text-gray-400 dark:text-gray-500 text-right mt-3">
                Generated {new Date(report.generatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
    </div>
  );
}

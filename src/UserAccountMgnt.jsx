import React, { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { getRoleFromToken, getUserIdFromToken } from "./tokenDecoder/detokenizer";
import axios from "axios";
import { useCreator } from "./analytics/CreatorContext";
import PhylloConnectButton from "./analytics/PhylloConnect";
import WeeklyReports from "./components/WeeklyReports";

function ConnectedAccountsList() {
  const { connectedAccounts, selectedCreator, setSelectedCreator, fetchConnectedAccounts, authState, addConnectedAccount } = useCreator();
  const navigate = useNavigate();
  const [disconnectedAccounts, setDisconnectedAccounts] = useState([]);
  const [reconnecting, setReconnecting] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null); // { acc, confirmText }
  const [deleteConfirmInput, setDeleteConfirmInput] = useState("");

  const getPlatformStyle = (platform) => {
    switch (platform?.toUpperCase()) {
      case "INSTAGRAM": return { bg: "bg-gradient-to-br from-purple-500 to-pink-500", label: "IG" };
      case "FACEBOOK": return { bg: "bg-blue-600", label: "FB" };
      case "TIKTOK": return { bg: "bg-black", label: "TT" };
      case "YOUTUBE": return { bg: "bg-red-600", label: "YT" };
      default: return { bg: "bg-gray-500", label: "??" };
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  // Fetch disconnected accounts
  useEffect(() => {
    const fetchDisconnected = async () => {
      if (!authState.isLoggedIn || !authState.userId) return;
      try {
        const res = await axios.get(
          `https://maya-backend-service-326007673689.us-central1.run.app/api/phyllo/disconnected?userId=${authState.userId}`,
          { headers: { Authorization: `Bearer ${authState.token}` } }
        );
        setDisconnectedAccounts(res.data || []);
      } catch (err) {
        console.error("Failed to fetch disconnected accounts:", err);
      }
    };
    fetchDisconnected();
  }, [authState.isLoggedIn, authState.userId, authState.token, connectedAccounts]);

  const handleReconnect = async (acc) => {
    setReconnecting(acc.creatorId);
    try {
      const res = await fetch(`https://maya-backend-service-326007673689.us-central1.run.app/api/phyllo/reconnect/${acc.creatorId}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${authState.token}` },
      });
      if (res.ok) {
        const data = await res.json();
        toast.success(`@${data.username} reconnected!`);
        addConnectedAccount({
          creatorId: data.creatorId,
          platform: data.platform,
          username: data.username,
        });
        setDisconnectedAccounts((prev) => prev.filter((a) => a.creatorId !== acc.creatorId));
        fetchConnectedAccounts();
      } else {
        toast.error("Failed to reconnect");
      }
    } catch (err) {
      toast.error("Failed to reconnect");
    } finally {
      setReconnecting(null);
    }
  };

  const handleDisconnect = async (e, acc) => {
    e.stopPropagation();
    if (!confirm(`Disconnect @${acc.username}? Your historical data will be preserved.`)) return;
    try {
      const res = await fetch(`https://maya-backend-service-326007673689.us-central1.run.app/api/phyllo/disconnect/${acc.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${authState.token}` },
      });
      if (res.ok) {
        toast.success(`@${acc.username} disconnected`);
        if (selectedCreator?.id === acc.id) {
          setSelectedCreator(null);
        }
        fetchConnectedAccounts();
      } else {
        toast.error("Failed to disconnect");
      }
    } catch (err) {
      toast.error("Failed to disconnect");
    }
  };

  const handleDeleteAccount = async () => {
    if (!deleteModal || deleteConfirmInput !== "DELETE") return;
    try {
      const res = await fetch(`https://maya-backend-service-326007673689.us-central1.run.app/api/phyllo/delete-account/${deleteModal.acc.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${authState.token}` },
      });
      if (res.ok) {
        const data = await res.json();
        toast.success(`All data for @${data.username} permanently deleted (${data.deletedData?.posts || 0} posts, ${data.deletedData?.comments || 0} comments)`);
        if (selectedCreator?.id === deleteModal.acc.id) {
          setSelectedCreator(null);
        }
        setDeleteModal(null);
        setDeleteConfirmInput("");
        setDisconnectedAccounts((prev) => prev.filter((a) => a.creatorId !== deleteModal.acc.id));
        fetchConnectedAccounts();
      } else if (res.status === 404) {
        toast.error("Account not found or you don't own it");
      } else {
        toast.error("Failed to delete account data");
      }
    } catch (err) {
      toast.error("Failed to delete account data");
    }
  };

  return (
    <div>
      {/* Connected accounts */}
      {connectedAccounts.length === 0 && disconnectedAccounts.length === 0 && (
        <div className="text-center py-10">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
            <span className="material-symbols-outlined text-3xl text-gray-400 dark:text-gray-500">link_off</span>
          </div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-300">No accounts connected yet</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Connect your social media to unlock personalized analytics</p>
        </div>
      )}

      {connectedAccounts.length > 0 && (
        <div className="space-y-3">
          {connectedAccounts.map((acc, idx) => {
            const style = getPlatformStyle(acc.platform);
            return (
              <div
                key={idx}
                onClick={() => {
                  setSelectedCreator(acc);
                  navigate("/analytics");
                }}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-100 dark:border-gray-600 hover:bg-teal-50 dark:hover:bg-teal-900/20 hover:border-teal-200 dark:hover:border-teal-700 cursor-pointer transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 ${style.bg} rounded-full flex items-center justify-center`}>
                    <span className="text-white text-sm font-bold">{style.label}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">@{acc.username}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {acc.platform} • Connected {formatDate(acc.connectedAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                    Connected
                  </span>
                  <button
                    onClick={(e) => handleDisconnect(e, acc)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors"
                    title="Disconnect (data preserved)"
                  >
                    <span className="material-symbols-outlined text-sm">link_off</span>
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setDeleteModal({ acc }); setDeleteConfirmInput(""); }}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    title="Delete all data (permanent)"
                  >
                    <span className="material-symbols-outlined text-sm">delete_forever</span>
                  </button>
                  <span className="material-symbols-outlined text-gray-400 text-base">chevron_right</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Previously Connected — Reconnectable */}
      {disconnectedAccounts.length > 0 && (
        <div className="mt-6">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Previously Connected</p>
          <div className="space-y-2">
            {disconnectedAccounts.map((acc, idx) => {
              const style = getPlatformStyle(acc.platform);
              return (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-dashed border-gray-200 dark:border-gray-600"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-9 h-9 ${style.bg} rounded-full flex items-center justify-center opacity-60`}>
                      <span className="text-white text-xs font-bold">{style.label}</span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">@{acc.username}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        {acc.platform} • Disconnected {formatDate(acc.disconnectedAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleReconnect(acc)}
                      disabled={reconnecting === acc.creatorId}
                      className="px-3 py-1.5 text-xs font-medium text-teal-600 dark:text-teal-400 border border-teal-300 dark:border-teal-700 rounded-lg hover:bg-teal-50 dark:hover:bg-teal-900/20 disabled:opacity-50 transition-colors"
                    >
                      {reconnecting === acc.creatorId ? "Reconnecting..." : "Reconnect"}
                    </button>
                    <button
                      onClick={() => { setDeleteModal({ acc: { ...acc, id: acc.creatorId } }); setDeleteConfirmInput(""); }}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      title="Delete all data (permanent)"
                    >
                      <span className="material-symbols-outlined text-sm">delete_forever</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm px-4" onClick={() => setDeleteModal(null)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-6 border border-gray-200 dark:border-gray-700" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-red-600 dark:text-red-400 text-xl">warning</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Permanently Delete Data</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">@{deleteModal.acc.username} ({deleteModal.acc.platform})</p>
              </div>
            </div>

            <div className="p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-200 dark:border-red-800 mb-4">
              <p className="text-xs text-red-700 dark:text-red-400 leading-relaxed">
                This will <strong>permanently delete</strong> all posts, comments, analytics, reports, and scheduled content associated with this account. This action <strong>cannot be undone</strong>.
              </p>
            </div>

            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Type <strong className="text-red-600 dark:text-red-400">DELETE</strong> to confirm:</p>
            <input
              type="text"
              value={deleteConfirmInput}
              onChange={(e) => setDeleteConfirmInput(e.target.value)}
              placeholder="Type DELETE"
              className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500 mb-4"
            />

            <div className="flex items-center justify-end space-x-3">
              <button onClick={() => { setDeleteModal(null); setDeleteConfirmInput(""); }}
                className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirmInput !== "DELETE"}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors font-medium"
              >
                Delete All Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function UserAccountMgnt(){
    const [error, setError] = React.useState(null);
    const [userData, setUserData] = React.useState(null);
    const [refreshReports, setRefreshReports] = useState(0);
    const navigate = useNavigate();
    const { authState, refreshAuth, setSelectedCreator } = useCreator();

    const handleLogout = () => {
        sessionStorage.removeItem('token');
        setSelectedCreator(null);
        refreshAuth();
        toast.success("You have been logged out Successfully.");
        navigate('/login');
    }

    const handleUserData = async () => {
        const token = sessionStorage.getItem('token'); 
        const userID = getUserIdFromToken(sessionStorage.getItem('token'));
        try {
          const response = await axios.get("https://maya-backend-service-326007673689.us-central1.run.app/auth/getUserById/"+userID,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          if (response.status === 200) {
            setUserData(response.data);
          } else {
            toast.error('Fetching user data failed. Please refresh.');
          }
        } catch (err) {
          console.error('User error:', err);
          toast.error('An error occurred while fetching user data.');
        }
    };

    useEffect(() => { handleUserData(); }, []);

    const getInitials = () => {
      if (userData?.firstname && userData?.lastname) {
        return `${userData.firstname[0]}${userData.lastname[0]}`.toUpperCase();
      }
      if (userData?.name) return userData.name[0].toUpperCase();
      return "U";
    };

    const getRoleBadge = () => {
      const role = authState?.role;
      if (role === "GUEST") return { label: "Guest", color: "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400" };
      return { label: "Free Plan", color: "bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400" };
    };

    const badge = getRoleBadge();

    return (
        <div id="UserAccountMgnt">
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans pt-16">
                <main className="container mx-auto px-4 py-8 max-w-6xl">
                    <div className="flex flex-col lg:flex-row gap-8">

                        {/* Sidebar — Sticky */}
                        <div className="w-full lg:w-1/4">
                            <div className="lg:sticky lg:top-24 space-y-4">
                                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
                                    {/* Profile Header */}
                                    <div className="text-center mb-6">
                                        <div className="w-20 h-20 mx-auto mb-3 bg-gradient-to-br from-teal-500 to-teal-700 rounded-full flex items-center justify-center shadow-lg">
                                            <span className="text-2xl font-bold text-white">{getInitials()}</span>
                                        </div>
                                        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{userData?.name || "User"}</h2>
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${badge.color}`}>
                                            {badge.label}
                                        </span>
                                    </div>

                                    {/* Nav */}
                                    <nav className="space-y-1">
                                        <a href="#account-details" className="flex items-center p-2.5 rounded-lg bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400 font-medium text-sm">
                                            <span className="material-symbols-outlined mr-2.5 text-lg">account_circle</span>
                                            Account Details
                                        </a>
                                        <a href="#connected-accounts" className="flex items-center p-2.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm transition-colors">
                                            <span className="material-symbols-outlined mr-2.5 text-lg">link</span>
                                            Connected Accounts
                                        </a>
                                        <a href="#usage" className="flex items-center p-2.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm transition-colors">
                                            <span className="material-symbols-outlined mr-2.5 text-lg">analytics</span>
                                            Usage & Plan
                                        </a>
                                        <a href="#settings" className="flex items-center p-2.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm transition-colors">
                                            <span className="material-symbols-outlined mr-2.5 text-lg">settings</span>
                                            Settings
                                        </a>
                                        <button
                                            onClick={handleLogout}
                                            className="flex items-center p-2.5 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 text-sm transition-colors w-full"
                                        >
                                            <span className="material-symbols-outlined mr-2.5 text-lg">logout</span>
                                            Logout
                                        </button>
                                    </nav>
                                </div>

                                {/* Quick Links */}
                                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-100 dark:border-gray-700">
                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Quick Links</p>
                                    <div className="space-y-2">
                                        <Link to="/analytics" className="flex items-center p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                            <span className="material-symbols-outlined text-teal-600 dark:text-teal-400 mr-2 text-lg">analytics</span>
                                            <span className="text-sm text-gray-700 dark:text-gray-200">Analytics</span>
                                        </Link>
                                        <Link to="/chat" className="flex items-center p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                            <span className="material-symbols-outlined text-teal-600 dark:text-teal-400 mr-2 text-lg">smart_toy</span>
                                            <span className="text-sm text-gray-700 dark:text-gray-200">MAYA AI</span>
                                        </Link>
                                        <Link to="/calendar" className="flex items-center p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                            <span className="material-symbols-outlined text-teal-600 dark:text-teal-400 mr-2 text-lg">calendar_month</span>
                                            <span className="text-sm text-gray-700 dark:text-gray-200">Calendar</span>
                                        </Link>
                                        <Link to="/ContentGenerationFlow" className="flex items-center p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                            <span className="material-symbols-outlined text-teal-600 dark:text-teal-400 mr-2 text-lg">auto_awesome</span>
                                            <span className="text-sm text-gray-700 dark:text-gray-200">Content Lab</span>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Main Content */}
                        <div className="w-full lg:w-3/4 space-y-6">

                            {/* Account Details */}
                            <div id="account-details" className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
                                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-6">Account Details</h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Username</label>
                                        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg text-sm text-gray-800 dark:text-gray-200">{userData?.name || "—"}</div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Email Address</label>
                                        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg text-sm text-gray-800 dark:text-gray-200">{userData?.email || "—"}</div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">First Name</label>
                                        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg text-sm text-gray-800 dark:text-gray-200">{userData?.firstname || "—"}</div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Last Name</label>
                                        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg text-sm text-gray-800 dark:text-gray-200">{userData?.lastname || "—"}</div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Member Since</label>
                                        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg text-sm text-gray-800 dark:text-gray-200">{userData?.createdDate || "—"}</div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Account Type</label>
                                        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg text-sm text-gray-800 dark:text-gray-200">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${badge.color}`}>
                                                {badge.label}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Connected Accounts */}
                            <div id="connected-accounts" className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
                                <div className="flex justify-between items-center mb-6">
                                    <div>
                                        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Connected Accounts</h2>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Link your social media for personalized analytics</p>
                                    </div>
                                    <PhylloConnectButton className="text-sm" />
                                </div>

                                <ConnectedAccountsList />
                            </div>

                            {/* Usage & Plan */}
                            <div id="usage" className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Usage & Plan</h2>
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400">
                                        <span className="material-symbols-outlined text-sm mr-1">verified</span>
                                        Free Tier
                                    </span>
                                </div>

                                {/* Current Plan */}
                                <div className="mb-6 p-5 bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 rounded-xl border border-teal-200 dark:border-teal-800">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="text-base font-semibold text-gray-800 dark:text-gray-100">MAYA Free</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Full access to all features during early access</p>
                                        </div>
                                        <span className="text-2xl font-bold text-teal-600 dark:text-teal-400">$0</span>
                                    </div>
                                    <div className="mt-4 grid grid-cols-2 gap-2">
                                        <div className="flex items-center space-x-2">
                                            <span className="material-symbols-outlined text-teal-600 dark:text-teal-400 text-sm">check_circle</span>
                                            <span className="text-xs text-gray-600 dark:text-gray-300">Unlimited AI conversations</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <span className="material-symbols-outlined text-teal-600 dark:text-teal-400 text-sm">check_circle</span>
                                            <span className="text-xs text-gray-600 dark:text-gray-300">Content generation</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <span className="material-symbols-outlined text-teal-600 dark:text-teal-400 text-sm">check_circle</span>
                                            <span className="text-xs text-gray-600 dark:text-gray-300">Full analytics suite</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <span className="material-symbols-outlined text-teal-600 dark:text-teal-400 text-sm">check_circle</span>
                                            <span className="text-xs text-gray-600 dark:text-gray-300">Calendar & scheduling</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <span className="material-symbols-outlined text-teal-600 dark:text-teal-400 text-sm">check_circle</span>
                                            <span className="text-xs text-gray-600 dark:text-gray-300">Weekly reports</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <span className="material-symbols-outlined text-teal-600 dark:text-teal-400 text-sm">check_circle</span>
                                            <span className="text-xs text-gray-600 dark:text-gray-300">Connect social accounts</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Usage Summary */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div className="bg-teal-50 dark:bg-teal-900/20 rounded-xl p-4 text-center border border-teal-100 dark:border-teal-800">
                                        <span className="material-symbols-outlined text-teal-600 dark:text-teal-400 text-xl">auto_awesome</span>
                                        <p className="text-2xl font-bold text-teal-700 dark:text-teal-400 mt-1">∞</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Generations</p>
                                    </div>
                                    <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-4 text-center border border-indigo-100 dark:border-indigo-800">
                                        <span className="material-symbols-outlined text-indigo-600 dark:text-indigo-400 text-xl">analytics</span>
                                        <p className="text-2xl font-bold text-indigo-700 dark:text-indigo-400 mt-1">∞</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Analytics Views</p>
                                    </div>
                                    <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 text-center border border-purple-100 dark:border-purple-800">
                                        <span className="material-symbols-outlined text-purple-600 dark:text-purple-400 text-xl">chat</span>
                                        <p className="text-2xl font-bold text-purple-700 dark:text-purple-400 mt-1">∞</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">AI Conversations</p>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-4 text-center">
                                    You're on the free tier with full access during early access. Paid plans coming soon.
                                </p>
                            </div>

                            {/* Weekly Reports */}
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
                                <div className="flex items-center justify-between mb-2">
                                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Weekly Reports</h2>
                                    <button onClick={() => setRefreshReports(r => r + 1)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" title="Refresh">
                                        <span className="material-symbols-outlined text-gray-500 dark:text-gray-400 text-base">refresh</span>
                                    </button>
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-5">Your performance snapshots — one generated per week</p>
                                <WeeklyReports refreshTrigger={refreshReports} />
                            </div>

                            {/* Settings */}
                            <div id="settings" className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
                                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-6">Settings</h2>

                                <div className="space-y-4">
                                    {/* Notification preferences */}
                                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                        <div>
                                            <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Email Notifications</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Receive weekly reports and alerts</p>
                                        </div>
                                        <div className="w-10 h-6 bg-teal-500 rounded-full relative cursor-pointer">
                                            <div className="w-4 h-4 bg-white rounded-full absolute top-1 right-1 shadow" />
                                        </div>
                                    </div>

                                    {/* Data export */}
                                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                        <div>
                                            <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Export My Data</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Download all your data as JSON</p>
                                        </div>
                                        <button className="text-xs px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                                            Export
                                        </button>
                                    </div>

                                    {/* Danger Zone */}
                                    <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                                        <p className="text-xs font-medium text-red-600 dark:text-red-400 uppercase tracking-wide mb-3">Danger Zone</p>
                                        <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-200 dark:border-red-800">
                                            <div>
                                                <p className="text-sm font-medium text-red-700 dark:text-red-400">Delete Account</p>
                                                <p className="text-xs text-red-500 dark:text-red-400/70">Permanently remove your account and all data</p>
                                            </div>
                                            <button className="text-xs px-3 py-1.5 border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </main>
            </div>
        </div>
    )
}

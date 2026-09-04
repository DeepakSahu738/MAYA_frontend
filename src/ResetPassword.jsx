import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const API_BASE = "https://maya-backend-service-326007673689.asia-southeast1.run.app";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [invalidLink, setInvalidLink] = useState(false);

  // No token in URL → invalid link
  useEffect(() => {
    if (!token) setInvalidLink(true);
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) { setError("Password must be at least 6 characters"); return; }
    if (password !== confirmPassword) { setError("Passwords do not match"); return; }

    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      });
      const body = await res.json().catch(() => ({}));

      if (res.ok && body.status === "SUCCESS") {
        setDone(true);
        toast.success("Password reset! You can now sign in.");
        setTimeout(() => navigate("/login"), 2500);
      } else if (res.status === 400 && body.status === "WEAK_PASSWORD") {
        setError(body.error || "Password is too weak. Choose a stronger one.");
      } else if (res.status === 400 && body.status === "INVALID_TOKEN") {
        setError("This reset link is invalid. Please request a new one.");
        setInvalidLink(true);
      } else if (res.status === 410 || body.status === "EXPIRED") {
        setError("This reset link has expired. Please request a new one.");
        setInvalidLink(true);
      } else {
        setError(body.error || "Something went wrong. Please try again.");
      }
    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-6 pt-16">
      <div className="w-full max-w-md">
        {/* Invalid / expired link */}
        {invalidLink && !done ? (
          <div className="text-center">
            <div className="w-14 h-14 mx-auto mb-4 bg-red-50 dark:bg-red-900/30 rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-red-600 dark:text-red-400 text-2xl">link_off</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Link invalid or expired</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 mb-6">
              {error || "This password reset link is no longer valid. Request a fresh one to continue."}
            </p>
            <Link to="/forgot-password">
              <button className="h-11 px-6 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-500 transition-colors text-sm">
                Request new link
              </button>
            </Link>
          </div>
        ) : done ? (
          /* Success */
          <div className="text-center">
            <div className="w-14 h-14 mx-auto mb-4 bg-green-50 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-2xl">check_circle</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Password reset!</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Redirecting you to sign in...
            </p>
          </div>
        ) : (
          /* Reset form */
          <>
            <div className="text-center mb-8">
              <div className="w-14 h-14 mx-auto mb-4 bg-teal-50 dark:bg-teal-900/30 rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-teal-600 dark:text-teal-400 text-2xl">password</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Set a new password</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Choose a strong password you haven't used before.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">New password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(""); }}
                    placeholder="At least 6 characters"
                    required
                    className="w-full px-4 py-3 pr-11 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-shadow"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Confirm password</label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setError(""); }}
                  placeholder="Re-enter your password"
                  required
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-shadow"
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}

              <button type="submit" disabled={loading}
                className="w-full h-12 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-500 disabled:opacity-50 transition-colors text-sm flex items-center justify-center">
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  "Reset password"
                )}
              </button>
            </form>

            <div className="text-center mt-6">
              <Link to="/login" className="text-sm text-teal-600 dark:text-teal-400 font-medium hover:underline">
                ← Back to login
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

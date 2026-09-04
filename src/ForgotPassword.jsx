import React, { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

const API_BASE = "https://maya-backend-service-326007673689.asia-southeast1.run.app";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) { setError("Please enter a valid email"); return; }

    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        // Backend always returns SENT (even if email unknown) to prevent enumeration
        setSent(true);
      } else if (res.status === 429) {
        const body = await res.json();
        setError(body.error || "Too many reset requests. Please try again later.");
      } else {
        setError("Something went wrong. Please try again.");
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
        {!sent ? (
          <>
            <div className="text-center mb-8">
              <div className="w-14 h-14 mx-auto mb-4 bg-teal-50 dark:bg-teal-900/30 rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-teal-600 dark:text-teal-400 text-2xl">lock_reset</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Forgot your password?</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Enter your email and we'll send you a link to reset it.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(""); }}
                  placeholder="you@example.com"
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
                  "Send reset link"
                )}
              </button>
            </form>

            <div className="text-center mt-6">
              <Link to="/login" className="text-sm text-teal-600 dark:text-teal-400 font-medium hover:underline">
                ← Back to login
              </Link>
            </div>
          </>
        ) : (
          <>
            {/* Sent confirmation */}
            <div className="text-center">
              <div className="w-14 h-14 mx-auto mb-4 bg-green-50 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-2xl">mark_email_read</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Check your email</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 mb-6">
                If an account exists for <strong className="text-gray-700 dark:text-gray-300">{email}</strong>, we've sent a password reset link. It expires soon, so use it quickly.
              </p>

              <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700 mb-6">
                <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
                  Don't see it? Check your spam/junk folder. You can request another link if needed.
                </p>
              </div>

              <Link to="/login" className="inline-block text-sm text-teal-600 dark:text-teal-400 font-medium hover:underline">
                ← Back to login
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

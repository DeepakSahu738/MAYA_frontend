import React, { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useCreator } from "./analytics/CreatorContext";

const API_BASE = "https://maya-backend-service-326007673689.asia-southeast1.run.app";

export default function Register() {
  const navigate = useNavigate();
  const { refreshAuth } = useCreator();
  const [step, setStep] = useState("form"); // 'form' | 'otp'
  const [form, setForm] = useState({ firstname: "", lastname: "", name: "", email: "", password: "", role: "USER" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // OTP state
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [attemptsLeft, setAttemptsLeft] = useState(3);
  const [countdown, setCountdown] = useState(300); // 5 minutes
  const [resendCooldown, setResendCooldown] = useState(0);
  const otpRefs = useRef([]);

  // Countdown timer
  useEffect(() => {
    if (step !== "otp" || countdown <= 0) return;
    const timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [step, countdown]);

  // Resend cooldown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const validate = () => {
    if (!form.firstname.trim()) return "First name is required";
    if (!form.lastname.trim()) return "Last name is required";
    if (!form.name.trim()) return "Username is required";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) return "Please enter a valid email";
    if (form.password.length < 6) return "Password must be at least 6 characters";
    return null;
  };

  // Step 1: Send OTP
  const handleRegister = async (e) => {
    if (e) e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }

    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const body = await res.json();
      if (res.ok) {
        setStep("otp");
        setCountdown(300);
        setAttemptsLeft(3);
        toast.success("Verification code sent to your email!");
      } else if (res.status === 409) {
        setError(body.error || "Email already registered. Try logging in.");
      } else {
        setError(body.error || "Something went wrong. Please try again.");
      }
    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP — accepts code directly or reads from state
  const submitOtp = async (codeOverride) => {
    const code = codeOverride || otp.join("");
    if (code.length !== 6) { setError("Please enter the full 6-digit code"); return; }

    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, otp: code }),
      });
      const body = await res.json();
      if (res.ok) {
        // Auto-login: save token and redirect
        sessionStorage.setItem("token", body.token);
        refreshAuth();
        toast.success("Account created! Welcome to MAYA.");
        navigate("/plan");
      } else if (res.status === 400) {
        setAttemptsLeft(body.attemptsRemaining ?? attemptsLeft - 1);
        setError(`Wrong code. ${body.attemptsRemaining ?? attemptsLeft - 1} attempt${body.attemptsRemaining === 1 ? "" : "s"} remaining.`);
        setOtp(["", "", "", "", "", ""]);
        otpRefs.current[0]?.focus();
      } else if (res.status === 410) {
        setError("Code expired. Click resend for a new one.");
      } else if (res.status === 429) {
        setError("Too many attempts. Click resend for a new code.");
      } else {
        setError(body.error || "Verification failed. Please try again.");
      }
    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = () => submitOtp();

  // Resend OTP
  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setOtp(["", "", "", "", "", ""]);
    setResendCooldown(30);
    await handleRegister(null);
  };

  // OTP input handlers
  const handleOtpChange = (idx, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[idx] = value.slice(-1);
    setOtp(newOtp);
    setError("");
    if (value && idx < 5) otpRefs.current[idx + 1]?.focus();
    // Auto-submit on last digit — pass code directly (don't rely on stale state)
    if (value && idx === 5) {
      const code = newOtp.join("");
      if (code.length === 6) setTimeout(() => submitOtp(code), 150);
    }
  };

  const handleOtpKeyDown = (idx, e) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) {
      otpRefs.current[idx - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && idx > 0) {
      e.preventDefault();
      otpRefs.current[idx - 1]?.focus();
    }
    if (e.key === "ArrowRight" && idx < 5) {
      e.preventDefault();
      otpRefs.current[idx + 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const paste = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (paste.length > 0) {
      const newOtp = ["", "", "", "", "", ""];
      paste.split("").forEach((ch, i) => { newOtp[i] = ch; });
      setOtp(newOtp);
      // Focus the next empty box or last filled
      const focusIdx = Math.min(paste.length, 5);
      otpRefs.current[focusIdx]?.focus();
      if (paste.length === 6) {
        setTimeout(() => submitOtp(paste), 150);
      }
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-950 pt-16">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-[45%] bg-gradient-to-br from-gray-900 via-gray-900 to-gray-950 relative overflow-hidden items-center justify-center p-12">
        <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-teal-500/10 rounded-full blur-[120px] -mt-32 -ml-32" />
        <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-purple-500/10 rounded-full blur-[100px] -mb-20 -mr-20" />

        <div className="relative text-center max-w-sm">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl overflow-hidden shadow-lg">
            <img src="/logo.png" alt="MAYA" className="w-full h-full object-cover" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Join MAYA</h2>
          <p className="text-gray-400 text-sm leading-relaxed mb-8">
            Your AI creator workspace. Plan content, schedule posts, track performance — all in one place.
          </p>

          <div className="space-y-4 text-left">
            {[
              { icon: "auto_awesome", text: "AI-powered weekly content plans" },
              { icon: "calendar_month", text: "Visual calendar with scheduling" },
              { icon: "insights", text: "24 analytics metrics from your data" },
              { icon: "smart_toy", text: "Personal AI assistant that knows your account" },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-teal-400 text-sm">{item.icon}</span>
                </div>
                <span className="text-sm text-gray-300">{item.text}</span>
              </div>
            ))}
          </div>

          <p className="text-xs text-gray-500 mt-10">Free during early access. No credit card required.</p>
        </div>
      </div>

      {/* Right panel — form/OTP */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">

          {/* Step 1: Registration Form */}
          {step === "form" && (
            <>
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Create your account</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Get started in 30 seconds — it's free</p>
              </div>

              <form onSubmit={handleRegister} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">First name</label>
                    <input type="text" name="firstname" value={form.firstname} onChange={handleChange} required
                      className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-shadow" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Last name</label>
                    <input type="text" name="lastname" value={form.lastname} onChange={handleChange} required
                      className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-shadow" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Username</label>
                  <input type="text" name="name" value={form.name} onChange={handleChange} required
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-shadow" />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Email</label>
                  <input type="email" name="email" value={form.email} onChange={handleChange} required
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-shadow" />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Password</label>
                  <div className="relative">
                    <input type={showPassword ? "text" : "password"} name="password" value={form.password} onChange={handleChange} required
                      className="w-full px-4 py-3 pr-11 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-shadow" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">Minimum 6 characters</p>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
                  </div>
                )}

                <button type="submit" disabled={loading}
                  className="w-full h-12 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-500 disabled:opacity-50 transition-colors text-sm flex items-center justify-center space-x-2">
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span>Continue</span>
                  )}
                </button>
              </form>

              <div className="text-center mt-6">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Already have an account?{" "}
                  <Link to="/login" className="text-teal-600 dark:text-teal-400 font-medium hover:underline">Sign in</Link>
                </p>
              </div>

              <p className="text-center text-[10px] text-gray-400 dark:text-gray-500 mt-6">
                By creating an account you agree to our{" "}
                <Link to="/terms" className="underline hover:text-teal-600">Terms</Link> and{" "}
                <Link to="/privacy" className="underline hover:text-teal-600">Privacy Policy</Link>
              </p>
            </>
          )}

          {/* Step 2: OTP Verification */}
          {step === "otp" && (
            <>
              <div className="text-center mb-8">
                <div className="w-14 h-14 mx-auto mb-4 bg-teal-50 dark:bg-teal-900/30 rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-teal-600 dark:text-teal-400 text-2xl">mark_email_read</span>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Check your email</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  We sent a 6-digit code to <strong className="text-gray-700 dark:text-gray-300">{form.email}</strong>
                </p>
              </div>

              {/* OTP Input */}
              <div className="flex justify-center gap-2 mb-6" onPaste={handleOtpPaste}>
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => (otpRefs.current[idx] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    className={`w-12 h-14 text-center text-xl font-bold border-2 rounded-xl bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all ${
                      error ? "border-red-300 dark:border-red-700" : "border-gray-200 dark:border-gray-700"
                    }`}
                  />
                ))}
              </div>

              {/* Timer */}
              <div className="text-center mb-4">
                {countdown > 0 ? (
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    Code expires in <span className="font-mono font-medium text-gray-600 dark:text-gray-300">{formatTime(countdown)}</span>
                  </p>
                ) : (
                  <p className="text-xs text-red-500">Code expired. Please resend.</p>
                )}
              </div>

              {/* Error */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-xs text-red-600 dark:text-red-400 text-center">{error}</p>
                </div>
              )}

              {/* Verify button */}
              <button onClick={handleVerifyOtp} disabled={loading || otp.join("").length < 6}
                className="w-full h-12 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-500 disabled:opacity-50 transition-colors text-sm flex items-center justify-center">
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  "Verify & Create Account"
                )}
              </button>

              {/* Resend */}
              <div className="text-center mt-5">
                <button onClick={handleResend} disabled={resendCooldown > 0 || loading}
                  className="text-sm text-teal-600 dark:text-teal-400 font-medium hover:underline disabled:opacity-50 disabled:no-underline">
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend code"}
                </button>
              </div>

              {/* Hints */}
              <div className="mt-6 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700">
                <p className="text-[11px] text-gray-500 dark:text-gray-400 text-center leading-relaxed">
                  Don't see the email? Check your spam/junk folder. The code is valid for 5 minutes.
                </p>
              </div>

              {/* Back button */}
              <button onClick={() => { setStep("form"); setError(""); setOtp(["", "", "", "", "", ""]); }}
                className="w-full mt-4 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors text-center">
                ← Back to registration form
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

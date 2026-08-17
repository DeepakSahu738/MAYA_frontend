import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaInstagram, FaFacebook, FaTiktok, FaYoutube, FaSnapchat, FaLinkedin, FaTwitch, FaSpotify, FaXTwitter } from "react-icons/fa6";
import { SiSubstack } from "react-icons/si";
import { getRoleFromToken, isJwtExpired } from './tokenDecoder/detokenizer';

// --- Neural Constellation Background ---
function NeuralConstellation() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;
    let particles = [];
    const isMobile = window.innerWidth < 768;
    const PARTICLE_COUNT = isMobile ? 30 : 80;
    const CONNECTION_DIST = isMobile ? 120 : 180;
    const SPEED = 0.4;

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    const init = () => {
      resize();
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      particles = Array.from({ length: PARTICLE_COUNT }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * SPEED,
        vy: (Math.random() - 0.5) * SPEED,
        r: isMobile ? Math.random() * 1.5 + 0.5 : Math.random() * 2.5 + 1,
      }));
    };

    const draw = () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      ctx.clearRect(0, 0, w, h);

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
      }

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECTION_DIST) {
            const opacity = (1 - dist / CONNECTION_DIST) * (isMobile ? 0.4 : 0.7);
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(45, 212, 191, ${opacity})`;
            ctx.lineWidth = isMobile ? 0.5 : 1;
            ctx.stroke();
          }
        }
      }

      for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(45, 212, 191, ${isMobile ? 0.5 : 0.9})`;
        ctx.fill();
      }

      animId = requestAnimationFrame(draw);
    };

    init();
    draw();
    window.addEventListener("resize", init);
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", init); };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />;
}

// --- Scroll reveal hook ---
function useScrollReveal(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); obs.disconnect(); }
    }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

// --- Staggered children wrapper ---
function StaggerChildren({ children, className = "", delay = 100 }) {
  const [ref, visible] = useScrollReveal(0.1);
  return (
    <div ref={ref} className={className}>
      {React.Children.map(children, (child, i) => (
        <div
          className={`transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          style={{ transitionDelay: `${i * delay}ms` }}
        >
          {child}
        </div>
      ))}
    </div>
  );
}

// --- Contact Form ---
function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) { toast.error('Please enter a valid email.'); return; }
    try {
      setLoading(true);
      await axios.post('https://maya-backend-service-326007673689.asia-southeast1.run.app/contact/addContactMessages', { name, email, message });
      toast.success('Message sent successfully!');
      setName(''); setEmail(''); setMessage('');
    } catch { toast.error('Failed to send. Please try again.'); }
    finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-left">
      <input type="text" placeholder="Your Name" value={name} onChange={(e) => setName(e.target.value)} required
        className="w-full p-3.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-shadow" />
      <input type="email" placeholder="Your Email" value={email} onChange={(e) => setEmail(e.target.value)} required
        className="w-full p-3.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-shadow" />
      <textarea rows="4" placeholder="Your Message" value={message} onChange={(e) => setMessage(e.target.value)} required
        className="w-full p-3.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-shadow" />
      <button type="submit" disabled={loading}
        className="w-full h-12 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-500 disabled:opacity-50 transition-colors text-sm">
        {loading ? "Sending..." : "Send Message"}
      </button>
    </form>
  );
}

// --- Animated Counter ---
function AnimatedCounter({ target, suffix = "", duration = 2000 }) {
  const [count, setCount] = useState(0);
  const [ref, visible] = useScrollReveal(0.3);

  useEffect(() => {
    if (!visible) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else { setCount(Math.floor(start)); }
    }, 16);
    return () => clearInterval(timer);
  }, [visible, target, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
}

// --- Main ---
export default function Home() {
  const navigate = useNavigate();
  const [showStickyCTA, setShowStickyCTA] = useState(false);

  const getAuthTarget = () => {
    const token = sessionStorage.getItem("token");
    if (token && getRoleFromToken(token) === "USER" && !isJwtExpired(token)) return "/plan";
    return "/register";
  };

  // Sticky CTA on scroll
  useEffect(() => {
    const handleScroll = () => setShowStickyCTA(window.scrollY > 600);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="flex flex-col items-center bg-white dark:bg-gray-950 overflow-hidden">

      {/* ═══════════════ HERO ═══════════════ */}
      <section className="relative w-full pt-32 pb-56 px-6 bg-gradient-to-b from-gray-900 via-gray-900 to-gray-950 overflow-visible">
        {/* Neural constellation background */}
        <NeuralConstellation />
        {/* Ambient glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-teal-500/8 rounded-full blur-[120px]" />
        <div className="absolute top-10 right-[10%] w-[400px] h-[400px] bg-violet-500/5 rounded-full blur-[100px]" />

        <div className="relative max-w-[900px] mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-1.5 bg-white/5 border border-white/10 text-teal-400 text-xs font-medium rounded-full mb-8 backdrop-blur-sm animate-fade-in-up">
            <span className="w-2 h-2 bg-teal-400 rounded-full mr-2 animate-pulse" />
            AI-Powered Creator Operations
          </div>

          {/* Heading with staggered animation */}
          <h1 className="text-4xl md:text-6xl font-bold text-white leading-[1.1] mb-6 tracking-tight">
            <span className="inline-block animate-fade-in-up" style={{ animationDelay: "0.1s" }}>Your creator workspace.</span><br/>
            <span className="inline-block animate-fade-in-up text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-400" style={{ animationDelay: "0.3s" }}>All in one place.</span>
          </h1>

          <p className="text-base md:text-lg text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in-up" style={{ animationDelay: "0.5s" }}>
            Connect your social accounts. MAYA generates weekly plans, manages drafts, schedules posts, and helps you publish consistently — all from one workspace.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6 animate-fade-in-up" style={{ animationDelay: "0.7s" }}>
            <a href="/demo" target="_blank" rel="noopener noreferrer">
              <button className="h-12 px-8 bg-white/10 border border-white/20 text-white rounded-xl font-semibold hover:bg-white/15 hover:scale-[1.02] backdrop-blur-sm transition-all flex items-center justify-center space-x-2 text-sm w-full sm:w-auto min-w-[200px]">
                <span className="material-symbols-outlined text-lg">play_circle</span>
                <span>Try the Live Demo</span>
              </button>
            </a>
            <Link to={getAuthTarget()}>
              <button className="h-12 px-8 bg-teal-500 text-white rounded-xl font-semibold hover:bg-teal-400 hover:scale-[1.02] shadow-lg shadow-teal-500/25 transition-all text-sm w-full sm:w-auto min-w-[200px]">
                Get Started Free
              </button>
            </Link>
          </div>

          <p className="text-xs text-gray-500 animate-fade-in-up" style={{ animationDelay: "0.9s" }}>No credit card required · Free during early access</p>
        </div>
      </section>

      {/* ═══════════════ DASHBOARD IMAGE ═══════════════ */}
      <div className="relative -mt-44 mb-16 px-6 z-10">
        <div className="relative max-w-[850px] mx-auto group">
          <div className="absolute inset-0 bg-teal-500/10 rounded-3xl blur-[50px] scale-[0.92] group-hover:bg-teal-500/15 transition-all duration-700" />
          <img
            src="/homepage_hero.png"
            alt="MAYA Operations Dashboard"
            className="relative w-full h-auto rounded-2xl border border-gray-200 dark:border-white/10 shadow-2xl group-hover:shadow-teal-500/10 transition-all duration-500"
          />
        </div>
        <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-4">Your Operations Dashboard — plans, schedules, and AI suggestions in one view</p>
      </div>

      {/* ═══════════════ FEATURE MARQUEE — AUTO-SCROLLING ═══════════════ */}
      <section className="w-full py-16 px-0 border-y border-gray-100 dark:border-gray-800 overflow-hidden">
        <p className="text-center text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-8">What MAYA does for you</p>
        <div className="relative">
          {/* Gradient masks on edges */}
          <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-white dark:from-gray-950 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-white dark:from-gray-950 to-transparent z-10 pointer-events-none" />

          {/* Scrolling track */}
          <div className="marquee-track">
            {[...Array(2)].map((_, dupeIdx) => (
              <div key={dupeIdx} className="marquee-content">
                {[
                  { emoji: "🔥", gradient: "from-orange-500 to-rose-500", title: "Streak Manager", desc: "Never break your posting streak again. We track it — you just keep going.", highlight: "Stay consistent" },
                  { emoji: "🎯", gradient: "from-teal-500 to-cyan-500", title: "Weekly Goal Setter", desc: "Set a target, watch the ring fill. Simple accountability that works.", highlight: "Hit your targets" },
                  { emoji: "💡", gradient: "from-purple-500 to-indigo-500", title: "AI Daily Suggestions", desc: "Wake up to smart actions. MAYA tells you exactly what to focus on today.", highlight: "Start every day clear" },
                  { emoji: "📋", gradient: "from-teal-500 to-emerald-500", title: "7-Day Plan Generator", desc: "One click → full week planned. Captions, hooks, hashtags — done in seconds.", highlight: "Plan in 30 seconds" },
                  { emoji: "📅", gradient: "from-blue-500 to-indigo-500", title: "Calendar Manager", desc: "Draft → Schedule → Approve → Track. Your entire content pipeline, visual.", highlight: "See your whole month" },
                  { emoji: "🤖", gradient: "from-emerald-500 to-teal-500", title: "MAYA AI Assistant", desc: "An AI that actually knows YOUR account. Ask anything, get real answers.", highlight: "Your personal strategist" },
                  { emoji: "✨", gradient: "from-yellow-500 to-orange-500", title: "Content Idea Generator", desc: "Pick your platform, choose your vibe. Bright ideas generated instantly.", highlight: "Never run out of ideas" },
                ].map((item, idx) => (
                  <div key={idx} className="flex-shrink-0 w-[200px] md:w-[320px] bg-white dark:bg-white/5 rounded-2xl p-3 md:p-6 border border-gray-200 dark:border-white/10 hover:border-teal-300 dark:hover:border-teal-500/30 hover:shadow-xl transition-all group relative overflow-hidden">
                    {/* Background accent */}
                    <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${item.gradient} opacity-5 rounded-full -mt-8 -mr-8 group-hover:opacity-10 transition-opacity`} />
                    
                    <div className="relative">
                      <div className="flex items-center space-x-2 md:space-x-3 mb-2 md:mb-4">
                        <span className="text-2xl md:text-3xl">{item.emoji}</span>
                        <div>
                          <h4 className="text-xs md:text-base font-bold text-gray-900 dark:text-gray-100">{item.title}</h4>
                          <p className={`text-[8px] md:text-[10px] font-semibold uppercase tracking-wide bg-gradient-to-r ${item.gradient} bg-clip-text text-transparent`}>{item.highlight}</p>
                        </div>
                      </div>
                      <p className="text-[11px] md:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ BEFORE / AFTER ═══════════════ */}
      <section className="w-full py-16 md:py-28 px-6">
        <div className="max-w-[900px] mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold text-teal-600 dark:text-teal-400 uppercase tracking-widest mb-3">The difference</p>
            <h2 className="text-2xl md:text-4xl font-bold text-gray-900 dark:text-gray-50">Without MAYA vs With MAYA</h2>
          </div>

          <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6" delay={150}>
            {/* Without */}
            <div className="relative bg-red-50/50 dark:bg-red-900/10 rounded-2xl p-5 md:p-8 border border-red-200/50 dark:border-red-800/30 overflow-hidden">
              <div className="absolute top-4 right-4 w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-red-500 text-sm">close</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-5">Without MAYA</h3>
              <div className="space-y-3">
                {[
                  "5 apps open just to manage content",
                  "Forgot to post again this week",
                  "No idea what's working and what's not",
                  "Scrambling for captions last minute",
                  "Inconsistent — 3 posts one week, 0 the next",
                ].map((item, i) => (
                  <div key={i} className="flex items-start space-x-3">
                    <span className="material-symbols-outlined text-red-400 text-sm mt-0.5">remove_circle</span>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* With */}
            <div className="relative bg-teal-50/50 dark:bg-teal-900/10 rounded-2xl p-5 md:p-8 border border-teal-200/50 dark:border-teal-800/30 overflow-hidden">
              <div className="absolute top-4 right-4 w-8 h-8 bg-teal-100 dark:bg-teal-900/30 rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-teal-500 text-sm">check</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-5">With MAYA</h3>
              <div className="space-y-3">
                {[
                  "One workspace for all your platforms",
                  "AI generates your weekly plan automatically",
                  "See what's performing — save rate, reach, sentiment",
                  "Captions, hooks, and hashtags ready in seconds",
                  "Consistent posting streak with calendar + reminders",
                ].map((item, i) => (
                  <div key={i} className="flex items-start space-x-3">
                    <span className="material-symbols-outlined text-teal-500 text-sm mt-0.5">check_circle</span>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </StaggerChildren>
        </div>
      </section>

      {/* ═══════════════ BENTO GRID FEATURES ═══════════════ */}
      <section id="features" className="w-full py-16 md:py-28 px-6 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-[1000px] mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold text-teal-600 dark:text-teal-400 uppercase tracking-widest mb-3">Capabilities</p>
            <h2 className="text-2xl md:text-4xl font-bold text-gray-900 dark:text-gray-50">Everything you need. One workspace.</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-3 max-w-lg mx-auto">Stop switching between apps. Plan, create, schedule, analyze — all connected to your real accounts.</p>
          </div>

          <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-[850px] mx-auto" delay={100}>
            {/* Plan Page — Streak, Goal, Plan, Suggestions */}
            <div className="bg-white dark:bg-white/5 rounded-2xl p-6 md:p-8 border border-gray-200 dark:border-white/10 hover:border-teal-300 dark:hover:border-teal-500/30 transition-all group card-tilt flex flex-col md:h-[420px] overflow-hidden">
              <div className="flex items-start justify-between mb-5">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-teal-500/20">
                  <span className="material-symbols-outlined text-white text-xl">dashboard</span>
                </div>
                <span className="text-[10px] px-2.5 py-1 bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400 rounded-full font-medium border border-teal-100 dark:border-teal-500/20">Your HQ</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">Operations Dashboard</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-5">Your daily command center — posting streak, weekly goal ring, 7-day AI plan, and smart suggestions. All on one page.</p>
              {/* Mini plan page preview */}
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-100 dark:border-gray-700 space-y-3 flex-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-base">🔥</span>
                    <div className="h-2.5 w-16 bg-orange-200 dark:bg-orange-900/40 rounded-full" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-base">🎯</span>
                    <div className="w-7 h-7 rounded-full border-2 border-teal-400 flex items-center justify-center">
                      <span className="text-[8px] font-bold text-teal-600 dark:text-teal-400">3/5</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {["M","T","W","T","F","S","S"].map((d, i) => (
                    <div key={i} className="text-center">
                      <p className="text-[8px] text-gray-400">{d}</p>
                      <div className={`h-6 rounded ${i < 4 ? "bg-teal-100 dark:bg-teal-900/40" : "bg-gray-100 dark:bg-gray-700"}`} />
                    </div>
                  ))}
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs">💡</span>
                  <div className="h-2 flex-1 bg-purple-100 dark:bg-purple-900/30 rounded-full" />
                </div>
              </div>
            </div>

            {/* Calendar */}
            <div className="bg-white dark:bg-white/5 rounded-2xl p-6 md:p-8 border border-gray-200 dark:border-white/10 hover:border-teal-300 dark:hover:border-teal-500/30 transition-all group card-tilt flex flex-col md:h-[420px] overflow-hidden">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 mb-5">
                <span className="material-symbols-outlined text-white text-xl">calendar_month</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">Visual Calendar</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-5">Draft, schedule, approve — see your entire month at a glance. Never miss a posting window again.</p>
              {/* Mini calendar preview */}
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-100 dark:border-gray-700 flex-1">
                <div className="grid grid-cols-7 gap-1.5">
                  {Array.from({ length: 21 }).map((_, i) => (
                    <div key={i} className={`h-4 rounded ${[2,5,8,10,14,17,19].includes(i) ? "bg-teal-200 dark:bg-teal-800" : [4,12].includes(i) ? "bg-yellow-200 dark:bg-yellow-900/40" : "bg-gray-100 dark:bg-gray-700"}`} />
                  ))}
                </div>
              </div>
            </div>

            {/* AI Chat */}
            <div className="bg-white dark:bg-white/5 rounded-2xl p-6 md:p-8 border border-gray-200 dark:border-white/10 hover:border-teal-300 dark:hover:border-teal-500/30 transition-all group card-tilt flex flex-col md:h-[420px] overflow-hidden">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 mb-5">
                <span className="material-symbols-outlined text-white text-xl">smart_toy</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">Ask MAYA Anything</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-5">Chat with AI that knows your data. "When should I post?" "What's working?" — real answers, not generic advice.</p>
              {/* Mini chat preview */}
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-100 dark:border-gray-700 space-y-2.5 flex-1">
                <div className="h-3 w-3/4 bg-gray-200 dark:bg-gray-700 rounded-full" />
                <div className="h-3 w-1/2 bg-teal-100 dark:bg-teal-900/40 rounded-full ml-auto" />
                <div className="h-3 w-2/3 bg-gray-200 dark:bg-gray-700 rounded-full" />
                <div className="h-3 w-2/5 bg-teal-100 dark:bg-teal-900/40 rounded-full ml-auto" />
                <div className="h-3 w-1/2 bg-gray-200 dark:bg-gray-700 rounded-full" />
              </div>
            </div>

            {/* Analytics */}
            <div className="bg-white dark:bg-white/5 rounded-2xl p-6 md:p-8 border border-gray-200 dark:border-white/10 hover:border-teal-300 dark:hover:border-teal-500/30 transition-all group card-tilt flex flex-col md:h-[420px] overflow-hidden">
              <div className="flex items-start justify-between mb-5">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
                  <span className="material-symbols-outlined text-white text-xl">insights</span>
                </div>
                <span className="text-[10px] px-2.5 py-1 bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-full font-medium border border-orange-100 dark:border-orange-500/20">24 Metrics</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">Performance Insights</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-5">Save rate, engagement trends, sentiment, hashtag performance — all computed from your real data. Know what's working.</p>
              {/* Mini chart preview */}
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-100 dark:border-gray-700 flex-1">
                <div className="flex items-end space-x-2 h-16">
                  {[40, 55, 35, 70, 60, 80, 65, 90].map((h, i) => (
                    <div key={i} className="flex-1 bg-gradient-to-t from-teal-500 to-cyan-400 rounded-md opacity-70" style={{ height: `${h}%` }} />
                  ))}
                </div>
              </div>
            </div>
          </StaggerChildren>
        </div>
      </section>

      {/* ═══════════════ HOW IT WORKS ═══════════════ */}
      <section className="w-full py-16 md:py-28 px-6">
        <div className="max-w-[900px] mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold text-teal-600 dark:text-teal-400 uppercase tracking-widest mb-3">How it works</p>
            <h2 className="text-2xl md:text-4xl font-bold text-gray-900 dark:text-gray-50">Connect once. Plan every week.</h2>
          </div>

          <StaggerChildren className="grid grid-cols-1 md:grid-cols-4 gap-8" delay={120}>
            {[
              { step: "01", icon: "link", title: "Connect", desc: "Link accounts via secure OAuth. Takes 30 seconds.", gradient: "from-blue-500 to-indigo-500" },
              { step: "02", icon: "auto_awesome", title: "Generate", desc: "AI creates a 7-day plan with captions, hooks, and timing.", gradient: "from-teal-500 to-cyan-500" },
              { step: "03", icon: "calendar_month", title: "Schedule", desc: "Save drafts to your calendar. Edit before publishing.", gradient: "from-purple-500 to-pink-500" },
              { step: "04", icon: "trending_up", title: "Grow", desc: "Track insights and refine your strategy over time.", gradient: "from-orange-500 to-rose-500" },
            ].map((item, idx) => (
              <div key={idx} className="relative text-center group">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                  <span className="material-symbols-outlined text-white text-xl">{item.icon}</span>
                </div>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 font-mono mb-1">{item.step}</p>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1.5">{item.title}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{item.desc}</p>
                {/* Connector line (hidden on mobile, hidden on last) */}
                {idx < 3 && <div className="hidden md:block absolute top-7 left-[calc(50%+32px)] w-[calc(100%-64px)] h-[1px] bg-gradient-to-r from-gray-200 dark:from-gray-700 to-transparent" />}
              </div>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* ═══════════════ PLATFORMS ═══════════════ */}
      <section className="w-full py-16 px-6 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-[700px] mx-auto text-center">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-8">Works with your platforms</p>
          <div className="flex flex-wrap justify-center gap-5">
            {[
              { icon: <FaInstagram />, name: "Instagram", color: "text-pink-500" },
              { icon: <FaTiktok />, name: "TikTok", color: "text-gray-900 dark:text-white" },
              { icon: <FaYoutube />, name: "YouTube", color: "text-red-500" },
              { icon: <FaFacebook />, name: "Facebook", color: "text-blue-600" },
              { icon: <FaSnapchat />, name: "Snapchat", color: "text-yellow-400" },
              { icon: <FaXTwitter />, name: "X", color: "text-gray-800 dark:text-gray-200" },
              { icon: <FaLinkedin />, name: "LinkedIn", color: "text-blue-700" },
              { icon: <FaTwitch />, name: "Twitch", color: "text-purple-500" },
              { icon: <FaSpotify />, name: "Spotify", color: "text-green-500" },
              { icon: <SiSubstack />, name: "Substack", color: "text-orange-500" },
            ].map((p, i) => (
              <div key={i} className="flex flex-col items-center space-y-2 group cursor-default">
                <div className="w-12 h-12 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl flex items-center justify-center group-hover:scale-110 group-hover:shadow-lg transition-all">
                  <span className={`text-xl ${p.color}`}>{p.icon}</span>
                </div>
                <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">{p.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ EARLY ACCESS ═══════════════ */}
      <section className="w-full py-16 md:py-28 px-6">
        <div className="max-w-[800px] mx-auto">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 dark:from-white/5 dark:to-white/[0.02] rounded-3xl p-10 md:p-14 border border-gray-700 dark:border-white/10 relative overflow-hidden text-center">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-teal-500/10 rounded-full blur-[100px] -mt-48" />
            <div className="absolute bottom-0 right-0 w-[200px] h-[200px] bg-purple-500/10 rounded-full blur-[80px] -mb-20 -mr-20" />
            
            <div className="relative">
              <div className="inline-flex items-center px-4 py-1.5 bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-medium rounded-full mb-6">
                <span className="w-2 h-2 bg-teal-400 rounded-full mr-2 animate-pulse" />
                Early Access — Limited Spots
              </div>
              
              <h2 className="text-2xl md:text-4xl font-bold text-white mb-4">Get in while it's free</h2>
              <p className="text-sm md:text-base text-gray-400 mb-8 max-w-lg mx-auto leading-relaxed">
                MAYA is in early access. Full platform, zero cost. Connect your accounts today and lock in free access before paid plans launch.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <Link to={getAuthTarget()}>
                  <button className="h-12 px-8 bg-teal-500 text-white font-semibold rounded-xl hover:bg-teal-400 hover:scale-[1.02] shadow-lg shadow-teal-500/25 transition-all text-sm w-full sm:w-auto">
                    Claim Free Access
                  </button>
                </Link>
                <a href="/demo" target="_blank" rel="noopener noreferrer">
                  <button className="h-12 px-8 bg-white/10 border border-white/20 text-white rounded-xl font-semibold hover:bg-white/15 backdrop-blur-sm transition-all text-sm w-full sm:w-auto">
                    See Demo First
                  </button>
                </a>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-gray-400">
                <span className="flex items-center space-x-1.5">
                  <span className="material-symbols-outlined text-teal-400 text-sm">verified</span>
                  <span>Full access to all features</span>
                </span>
                <span className="flex items-center space-x-1.5">
                  <span className="material-symbols-outlined text-teal-400 text-sm">timer</span>
                  <span>30-second setup</span>
                </span>
                <span className="flex items-center space-x-1.5">
                  <span className="material-symbols-outlined text-teal-400 text-sm">credit_card_off</span>
                  <span>No credit card ever</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ DEMO CTA ═══════════════ */}
      <section className="w-full py-16 md:py-28 px-6 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-[700px] mx-auto">
          <div className="bg-gray-900 dark:bg-white/5 rounded-3xl p-12 border border-gray-800 dark:border-white/10 text-center relative overflow-hidden backdrop-blur-sm">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-teal-500/10 rounded-full blur-[80px] -mt-32" />
            <div className="relative">
              <div className="inline-flex items-center px-3 py-1.5 bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-medium rounded-full mb-6">
                <span className="material-symbols-outlined text-sm mr-1.5">science</span>
                No sign-up required
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">See it working</h2>
              <p className="text-sm text-gray-400 mb-8 max-w-md mx-auto">
                Full interactive demo with live creator data. Plans, schedules, AI suggestions — all functional.
              </p>
              <a href="/demo" target="_blank" rel="noopener noreferrer">
                <button className="h-12 px-8 bg-teal-500 text-white font-semibold rounded-xl hover:bg-teal-400 hover:scale-[1.02] shadow-lg shadow-teal-500/25 transition-all inline-flex items-center space-x-2 text-sm">
                  <span className="material-symbols-outlined text-lg">play_circle</span>
                  <span>Launch Demo</span>
                </button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ TRUST BADGES ═══════════════ */}
      <section className="w-full py-12 px-6">
        <div className="max-w-[700px] mx-auto">
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs text-gray-500 dark:text-gray-400">
            <span className="flex items-center space-x-1.5"><span className="material-symbols-outlined text-green-500 text-sm">lock</span><span>No passwords stored</span></span>
            <span className="flex items-center space-x-1.5"><span className="material-symbols-outlined text-blue-500 text-sm">visibility</span><span>Read-only access</span></span>
            <span className="flex items-center space-x-1.5"><span className="material-symbols-outlined text-purple-500 text-sm">link_off</span><span>Disconnect anytime</span></span>
            <span className="flex items-center space-x-1.5"><span className="material-symbols-outlined text-teal-500 text-sm">shield</span><span>We never sell your data</span></span>
          </div>
        </div>
      </section>

      {/* ═══════════════ ROADMAP TEASER ═══════════════ */}
      <section className="w-full py-24 px-6">
        <div className="max-w-[600px] mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-50 mb-4">Built for growing creators</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-8">
            Today, MAYA helps you plan, schedule, and manage your creator operations. Next, it will evolve into a unified creator profile for collaborations, sponsorships, and monetization.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {["Creator Discovery", "Brand Collaboration", "Campaign Workflows", "Monetization Tools"].map((t, i) => (
              <span key={i} className="text-xs px-4 py-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 rounded-full backdrop-blur-sm">{t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ FINAL CTA ═══════════════ */}
      <section className="w-full py-24 px-6 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-[500px] mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-50 mb-4">Ready to get organized?</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">Join creators using MAYA to plan, schedule, and grow consistently.</p>
          <Link to={getAuthTarget()}>
            <button className="h-14 px-10 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-500 hover:scale-[1.02] shadow-lg shadow-teal-600/20 transition-all text-sm">
              Get Started Free
            </button>
          </Link>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-4">Free during beta · No credit card</p>
        </div>
      </section>

      {/* ═══════════════ CONTACT ═══════════════ */}
      <section id="contact" className="w-full py-24 px-6">
        <div className="max-w-[450px] mx-auto text-center">
          <p className="text-xs font-semibold text-teal-600 dark:text-teal-400 uppercase tracking-widest mb-3">Contact</p>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-3">Get in touch</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">Questions or feedback? We'd love to hear from you.</p>
          <ContactForm />
        </div>
      </section>

      {/* ═══════════════ STICKY CTA BAR ═══════════════ */}
      <div className={`fixed bottom-0 left-0 right-0 z-40 transition-all duration-300 ${showStickyCTA ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"}`}>
        <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-t border-gray-200 dark:border-gray-800 px-6 py-3">
          <div className="max-w-[900px] mx-auto flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-300 hidden sm:block">
              <span className="font-semibold text-gray-900 dark:text-gray-100">MAYA</span> — Your creator workspace
            </p>
            <div className="flex items-center space-x-3 w-full sm:w-auto">
              <a href="/demo" target="_blank" rel="noopener noreferrer" className="flex-1 sm:flex-initial">
                <button className="w-full sm:w-auto h-9 px-5 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                  Try Demo
                </button>
              </a>
              <Link to={getAuthTarget()} className="flex-1 sm:flex-initial">
                <button className="w-full sm:w-auto h-9 px-5 text-xs font-semibold text-white bg-teal-600 rounded-lg hover:bg-teal-500 transition-colors shadow-sm">
                  Get Started Free
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

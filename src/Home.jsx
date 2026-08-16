import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { getRoleFromToken, isJwtExpired } from './tokenDecoder/detokenizer';

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
        className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500" />
      <input type="email" placeholder="Your Email" value={email} onChange={(e) => setEmail(e.target.value)} required
        className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500" />
      <textarea rows="4" placeholder="Your Message" value={message} onChange={(e) => setMessage(e.target.value)} required
        className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500" />
      <button type="submit" disabled={loading}
        className="w-full h-12 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-500 disabled:opacity-50 transition-colors text-sm">
        {loading ? "Sending..." : "Send Message"}
      </button>
    </form>
  );
}

export default function Home() {
  const navigate = useNavigate();

  const getAuthTarget = () => {
    const token = sessionStorage.getItem("token");
    if (token && getRoleFromToken(token) === "USER" && !isJwtExpired(token)) {
      return "/plan";
    }
    return "/register";
  };

  return (
    <div className="flex flex-col items-center bg-white dark:bg-gray-950 overflow-hidden">

      {/* Hero — stacked: text above, image straddles boundary */}
      <section className="relative w-full pt-32 pb-56 px-6 bg-gradient-to-b from-gray-900 via-gray-900 to-gray-950 overflow-visible">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-teal-500/8 rounded-full blur-[120px]" />
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-violet-500/5 rounded-full blur-[100px]" />

        <div className="relative max-w-[900px] mx-auto text-center">
          <div className="inline-flex items-center px-4 py-1.5 bg-white/5 border border-white/10 text-teal-400 text-xs font-medium rounded-full mb-8 backdrop-blur-sm">
            <span className="w-2 h-2 bg-teal-400 rounded-full mr-2 animate-pulse" />
            AI-Powered Creator Operations
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-white leading-[1.1] mb-6 tracking-tight">
            Your creator workspace.<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-400">All in one place.</span>
          </h1>

          <p className="text-base md:text-lg text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Connect your social accounts. MAYA generates weekly plans, manages drafts, schedules posts, and helps you publish consistently — all from one workspace.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
            <a href="/demo" target="_blank" rel="noopener noreferrer">
              <button className="h-12 px-8 bg-white/10 border border-white/20 text-white rounded-xl font-semibold hover:bg-white/15 backdrop-blur-sm transition-all flex items-center justify-center space-x-2 text-sm w-full sm:w-auto min-w-[200px]">
                <span className="material-symbols-outlined text-lg">play_circle</span>
                <span>Try the Live Demo</span>
              </button>
            </a>
            <Link to={getAuthTarget()}>
              <button className="h-12 px-8 bg-teal-500 text-white rounded-xl font-semibold hover:bg-teal-400 shadow-lg shadow-teal-500/25 transition-all text-sm w-full sm:w-auto min-w-[200px]">
                Connect My Accounts
              </button>
            </Link>
          </div>

          <p className="text-xs text-gray-500">No credit card required · Demo works instantly</p>
        </div>
      </section>

      {/* Dashboard image — overlapping hero and next section */}
      <div className="relative -mt-44 mb-12 px-6 z-10">
        <div className="relative max-w-[850px] mx-auto">
          <div className="absolute inset-0 bg-teal-500/10 rounded-3xl blur-[50px] scale-[0.92]" />
          <img
            src="/homepage_hero.png"
            alt="MAYA Operations Dashboard"
            className="relative w-full h-auto rounded-2xl border border-gray-200 dark:border-white/10 shadow-2xl"
          />
        </div>
        <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-4">Your Operations Dashboard — plans, schedules, and AI suggestions in one view</p>
      </div>

      {/* What happens after you connect? */}
      <section className="w-full py-28 px-6">
        <div className="max-w-[900px] mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold text-teal-600 dark:text-teal-400 uppercase tracking-widest mb-3">After you connect your accounts</p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-50">Here's what happens next</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: "calendar_month",
                title: "See your week",
                desc: "MAYA builds a personalized 7-day publishing plan from your connected creator accounts.",
              },
              {
                icon: "edit_note",
                title: "Review drafts",
                desc: "Edit AI-generated captions, hooks, and post ideas before saving them to your calendar.",
              },
              {
                icon: "dashboard",
                title: "Stay organized",
                desc: "Track scheduled posts, pending drafts, and connected platforms from one operational dashboard.",
              },
            ].map((item, idx) => (
              <div key={idx} className="bg-white dark:bg-white/5 rounded-2xl p-7 border border-gray-200 dark:border-white/10 hover:border-teal-300 dark:hover:border-teal-500/30 hover:shadow-lg dark:hover:shadow-teal-500/5 transition-all backdrop-blur-sm group text-center">
                <div className="w-12 h-12 rounded-xl bg-teal-50 dark:bg-teal-500/10 border border-teal-100 dark:border-teal-500/20 flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-teal-600 dark:text-teal-400 text-xl">{item.icon}</span>
                </div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">{item.title}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works — Steps */}
      <section id="features" className="w-full py-28 px-6 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-[900px] mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold text-teal-600 dark:text-teal-400 uppercase tracking-widest mb-3">How MAYA works</p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-50">Connect once. Plan every week.</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { step: "01", icon: "link", title: "Connect", desc: "Link accounts via secure OAuth. Takes 30 seconds." },
              { step: "02", icon: "auto_awesome", title: "Generate", desc: "AI creates a 7-day plan with captions, hooks, and timing." },
              { step: "03", icon: "calendar_month", title: "Schedule", desc: "Save drafts to your calendar. Edit before publishing." },
              { step: "04", icon: "trending_up", title: "Grow", desc: "Insights help you refine and stay consistent over time." },
            ].map((item, idx) => (
              <div key={idx} className="relative text-center group">
                <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 flex items-center justify-center mx-auto mb-4 group-hover:border-teal-400/50 group-hover:bg-teal-50 dark:group-hover:bg-teal-500/10 transition-all backdrop-blur-sm">
                  <span className="material-symbols-outlined text-teal-600 dark:text-teal-400 text-xl">{item.icon}</span>
                </div>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 font-mono mb-1">{item.step}</p>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1.5">{item.title}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="about" className="w-full py-28 px-6">
        <div className="max-w-[900px] mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold text-teal-600 dark:text-teal-400 uppercase tracking-widest mb-3">Capabilities</p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-50">One workspace for everything</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              { icon: "devices", title: "Multi-Platform Workspace", desc: "Connect Instagram, Facebook, TikTok, YouTube, and Snapchat. Each account has an isolated workspace you can switch between instantly." },
              { icon: "auto_awesome", title: "AI Weekly Planning", desc: "Generate a personalized 7-day plan with captions, hooks, hashtags, and optimal posting times — based on your real content patterns." },
              { icon: "edit_calendar", title: "Draft & Calendar Management", desc: "Create, edit, approve, and schedule drafts visually. See your entire week at a glance and never miss a publishing window." },
              { icon: "smart_toy", title: "AI Workflow Assistant", desc: "Ask MAYA anything — when to post, what gaps exist, how to repurpose content. Every answer is personalized to your connected accounts." },
            ].map((f, idx) => (
              <div key={idx} className="bg-white dark:bg-white/5 rounded-2xl p-7 border border-gray-200 dark:border-white/10 hover:border-teal-300 dark:hover:border-teal-500/30 hover:shadow-lg dark:hover:shadow-teal-500/5 transition-all backdrop-blur-sm group">
                <div className="w-11 h-11 rounded-xl bg-teal-50 dark:bg-teal-500/10 border border-teal-100 dark:border-teal-500/20 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-teal-600 dark:text-teal-400 text-lg">{f.icon}</span>
                </div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">{f.title}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section className="w-full py-28 px-6 bg-gray-50 dark:bg-gray-900/50">
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
                <button className="h-12 px-8 bg-teal-500 text-white font-semibold rounded-xl hover:bg-teal-400 shadow-lg shadow-teal-500/25 transition-all inline-flex items-center space-x-2 text-sm">
                  <span className="material-symbols-outlined text-lg">play_circle</span>
                  <span>Launch Demo</span>
                </button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Trust */}
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

      {/* Built for Growing Creators */}
      <section className="w-full py-24 px-6">
        <div className="max-w-[600px] mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-50 mb-4">Built for growing creators</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-8">
            Today, MAYA helps you plan, schedule, and manage your creator operations. Next, it will evolve into a unified creator profile for collaborations, sponsorships, campaign management, and monetization opportunities across connected platforms.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {["Creator Discovery", "Brand Collaboration", "Campaign Workflows", "Monetization Tools"].map((t, i) => (
              <span key={i} className="text-xs px-4 py-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 rounded-full backdrop-blur-sm">{t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="w-full py-24 px-6 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-[500px] mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-50 mb-4">Ready to get organized?</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">Join creators using MAYA to plan, schedule, and grow consistently.</p>
          <Link to={getAuthTarget()}>
            <button className="h-14 px-10 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-500 shadow-lg shadow-teal-600/20 transition-all text-sm">
              Get Started Free
            </button>
          </Link>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-4">Free during beta · No credit card</p>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="w-full py-24 px-6">
        <div className="max-w-[450px] mx-auto text-center">
          <p className="text-xs font-semibold text-teal-600 dark:text-teal-400 uppercase tracking-widest mb-3">Contact</p>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-3">Get in touch</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">Questions or feedback? We'd love to hear from you.</p>
          <ContactForm />
        </div>
      </section>

    </div>
  );
}

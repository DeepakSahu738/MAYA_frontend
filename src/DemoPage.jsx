import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import ChatPromptGuide from "./components/ChatPromptGuide";

const API_BASE = "https://maya-backend-service-326007673689.us-central1.run.app";

function SectionGuide({ step, title, description, tip }) {
  return (
    <div className="mb-6">
      <div className="flex items-start space-x-3">
        <span className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 text-white text-sm font-bold flex items-center justify-center shadow-md">
          {step}
        </span>
        <div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">{title}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{description}</p>
          {tip && (
            <div className="mt-2 inline-flex items-center px-3 py-1.5 bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-700 rounded-lg">
              <span className="material-symbols-outlined text-teal-600 dark:text-teal-400 text-sm mr-1.5">lightbulb</span>
              <span className="text-xs text-teal-700 dark:text-teal-400">{tip}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DemoPage() {
  const [demoCreators, setDemoCreators] = useState([]);
  const [selectedCreator, setSelectedCreator] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [dashLoading, setDashLoading] = useState(false);
  // Chat state
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [chatStreaming, setChatStreaming] = useState(false);
  const chatEndRef = useRef(null);
  const [sessionId] = useState(() => crypto.randomUUID());
  const [demoPlan, setDemoPlan] = useState(null);
  const [planLoading, setPlanLoading] = useState(false);

  // Fetch demo creators dynamically
  useEffect(() => {
    const fetchCreators = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/analytics/creators`);
        setDemoCreators(res.data);
        if (res.data.length > 0) setSelectedCreator(res.data[0]);
      } catch (err) { console.error("Failed to fetch demo creators:", err); }
    };
    fetchCreators();
  }, []);

  // Tour state
  const [showTour, setShowTour] = useState(() => !localStorage.getItem("maya-demo-toured"));
  const [tourStep, setTourStep] = useState(0);

  const tourSteps = [
    { title: "Welcome to the Demo!", description: "This is a guided walkthrough of MAYA's features. You'll see real data from demo creators. Click Next to explore each section.", target: "demo-analytics" },
    { title: "Analytics Dashboard", description: "See your account health score, engagement metrics, trends, and sentiment — all updated automatically from your connected accounts.", target: "demo-analytics" },
    { title: "AI Chat Assistant", description: "Ask MAYA anything — it analyzes real data and gives personalized, actionable answers. Try clicking a suggestion!", target: "demo-chat" },
    { title: "Content Calendar", description: "Plan your posts visually. Schedule at optimal times, manage drafts, and never miss a posting window.", target: "demo-calendar" },
    { title: "Trends & Ideas", description: "Discover content gaps, viral patterns, and get AI-generated post ideas backed by your actual performance data.", target: "demo-trends" },
    { title: "Ready to Start!", description: "Sign up to connect your own accounts and get all of this personalized for you. It's free during beta!", target: "demo-cta" },
  ];

  const tourPositions = [
    { top: "25%", left: "50%" },
    { top: "30%", left: "50%" },
    { top: "30%", left: "50%" },
    { top: "30%", left: "50%" },
    { top: "30%", left: "50%" },
    { top: "40%", left: "50%" },
  ];

  // Fetch dashboard
  useEffect(() => {
    const fetchDash = async () => {
      setDashLoading(true);
      try {
        const res = await axios.get(`${API_BASE}/api/analytics/dashboard/${selectedCreator.id}`);
        setDashboardData(res.data);
      } catch (err) { console.error(err); }
      finally { setDashLoading(false); }
    };
    fetchDash();
  }, [selectedCreator]);

  useEffect(() => {
    if (chatMessages.length > 0) chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // Chat handler
  const handleChat = async (messageText) => {
    const trimmed = (messageText || chatInput).trim();
    if (!trimmed || chatStreaming) return;
    setChatMessages((prev) => [...prev, { role: "user", content: trimmed }]);
    setChatInput("");
    setChatStreaming(true);
    setChatMessages((prev) => [...prev, { role: "assistant", content: "" }]);
    try {
      const response = await fetch(`${API_BASE}/api/chat/stream`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed, creatorId: selectedCreator.id, sessionId }),
      });
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n\n");
        buffer = parts.pop() || "";
        for (const part of parts) {
          for (const line of part.split("\n")) {
            if (line.startsWith("data:")) {
              const token = line.substring(5);
              if (token === "[DONE]") { setChatStreaming(false); return; }
              setChatMessages((prev) => {
                const u = [...prev]; const last = u[u.length - 1];
                if (last.role === "assistant") u[u.length - 1] = { ...last, content: last.content + token };
                return u;
              });
            }
          }
        }
      }
    } catch { setChatMessages((prev) => { const u = [...prev]; u[u.length-1]={...u[u.length-1], content:"Something went wrong."}; return u; }); }
    finally { setChatStreaming(false); }
  };

  const handleGeneratePlan = async () => {
    if (!selectedCreator) return;
    setPlanLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/api/strategy/generate`, { creatorId: selectedCreator.id });
      setDemoPlan(res.data);
    } catch (err) {
      console.error("Plan generation failed:", err);
    } finally {
      setPlanLoading(false);
    }
  };

  const hs = dashboardData?.healthScore;
  const trend = dashboardData?.engagementTrend;
  const rateCards = dashboardData?.rateCards;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Demo Header — no navigation */}
      <header className="fixed top-0 left-0 right-0 z-20 flex items-center justify-between px-6 py-3 border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
        <div className="flex items-center space-x-3">
          <img src="/logo.png" alt="MAYA" className="w-8 h-8 rounded-md" />
          <span className="font-bold text-lg text-gray-800 dark:text-gray-100">MAYA</span>
          <span className="text-[10px] px-2 py-0.5 bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 rounded-full font-medium">Demo Mode</span>
        </div>
        <p className="text-xs text-gray-400 dark:text-gray-500 hidden sm:block">Interactive demo — explore freely</p>
      </header>
      {/* Demo Tour Guide */}
      {showTour && (
        <div className="fixed inset-0 z-50 pointer-events-none">
          {/* Overlay */}
          <div className="absolute inset-0 bg-gray-900/30 pointer-events-auto" onClick={() => setShowTour(false)} />

          {/* Tooltip */}
          <div className="absolute pointer-events-auto" style={{ top: tourPositions[tourStep]?.top || "30%", left: tourPositions[tourStep]?.left || "50%", transform: "translate(-50%, 0)" }}>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-5 max-w-xs">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-7 h-7 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">{tourStep + 1}</span>
                </div>
                <p className="text-xs text-gray-400 dark:text-gray-500">{tourStep + 1} of {tourSteps.length}</p>
              </div>
              <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-1">{tourSteps[tourStep]?.title}</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{tourSteps[tourStep]?.description}</p>
              <div className="flex items-center justify-between mt-4">
                <button onClick={() => { setShowTour(false); localStorage.setItem("maya-demo-toured", "true"); }}
                  className="text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">Skip</button>
                <div className="flex space-x-2">
                  {tourStep > 0 && (
                    <button onClick={() => setTourStep(s => s - 1)}
                      className="text-xs px-3 py-1.5 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">Back</button>
                  )}
                  <button onClick={() => {
                    if (tourStep < tourSteps.length - 1) {
                      setTourStep(s => s + 1);
                      document.getElementById(tourSteps[tourStep + 1]?.target)?.scrollIntoView({ behavior: "smooth", block: "center" });
                    } else {
                      setShowTour(false);
                      localStorage.setItem("maya-demo-toured", "true");
                    }
                  }} className="text-xs px-3 py-1.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700">
                    {tourStep === tourSteps.length - 1 ? "Done" : "Next"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-5xl mx-auto px-4 py-8 pt-20 space-y-16">

        {/* Hero */}
        <div className="text-center">
          <div className="inline-flex items-center px-3 py-1 bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 text-xs font-medium rounded-full mb-4">
            <span className="material-symbols-outlined text-sm mr-1">science</span>
            Interactive Demo — No sign-up required
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-gray-100 mb-3">
            Experience <span className="text-teal-600 dark:text-teal-400">MAYA</span> in Action
          </h1>
          <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto mb-6">
            Explore real analytics, chat with AI, and see how MAYA helps creators grow — all with live demo data. This is exactly what you'll get when you connect your own account.
          </p>

          {/* Creator Selector */}
          <div className="inline-flex items-center space-x-3 bg-white dark:bg-gray-800 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Demo Profile:</span>
            <select
              value={selectedCreator?.id || ""}
              onChange={(e) => setSelectedCreator(demoCreators.find(c => c.id === Number(e.target.value)))}
              className="border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              {demoCreators.map(c => (
                <option key={c.id} value={c.id}>@{c.username} — {c.niche}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Section 1: Analytics */}
        <section id="demo-analytics">
          <SectionGuide step="1" title="Analytics Dashboard"
            description="Get a complete picture of your account health, engagement trends, and performance metrics — updated automatically."
            tip="When you connect your real account, this data updates daily with fresh insights." />

          {dashLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="flex space-x-1"><div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce"/><div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{animationDelay:"0.15s"}}/><div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{animationDelay:"0.3s"}}/></div>
            </div>
          ) : dashboardData && (
            <div className="space-y-4">
              {/* Health Score Mini */}
              {hs && (
                <div className="bg-gradient-to-r from-teal-600 to-cyan-600 rounded-2xl p-5 text-white flex items-center justify-between">
                  <div>
                    <p className="text-xs opacity-80 uppercase tracking-wide">Account Health</p>
                    <p className="text-3xl font-bold mt-1">{hs.score}/100</p>
                    <p className="text-xs opacity-70 mt-1">{hs.grade} — {hs.strengths?.[0] || "Strong performance"}</p>
                  </div>
                  <div className="w-16 h-16 border-4 border-white/30 rounded-full flex items-center justify-center">
                    <span className="text-xl font-bold">{hs.score}</span>
                  </div>
                </div>
              )}

              {/* All Rate Cards */}
              {rateCards && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {rateCards.map((card, idx) => (
                    <div key={idx} className="bg-white dark:bg-gray-800 rounded-xl p-3 border border-gray-100 dark:border-gray-700">
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 capitalize truncate">{card.metricName?.replace(/_/g," ")}</p>
                      <div className="flex items-end justify-between mt-1">
                        <p className="text-sm font-bold text-gray-800 dark:text-gray-100">
                          {card.currentValue != null ? `${card.currentValue.toFixed(2)}${card.unit === "%" ? "%" : ""}` : "—"}
                        </p>
                        {card.deltaVsLastWeek != null && (
                          <span className={`text-[10px] font-medium ${card.deltaVsLastWeek >= 0 ? "text-green-500" : "text-red-500"}`}>
                            {card.deltaVsLastWeek >= 0 ? "+" : ""}{card.deltaVsLastWeek.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Engagement Chart */}
                {trend && trend.length > 0 && (
                  <div className="bg-gray-900 dark:bg-gray-950 rounded-2xl p-4 border border-gray-800">
                    <p className="text-xs font-medium text-gray-400 mb-2">Engagement Trend (8 weeks)</p>
                    <div className="h-32">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={trend}>
                          <defs><linearGradient id="demoGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#14b8a6" stopOpacity={0.4}/><stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/></linearGradient></defs>
                          <XAxis dataKey="week" tick={{fontSize:9,fill:"#6b7280"}} tickLine={false} axisLine={false}/>
                          <YAxis tick={{fontSize:9,fill:"#6b7280"}} tickLine={false} axisLine={false} tickFormatter={v=>v>=1000?`${(v/1000).toFixed(0)}K`:v}/>
                          <Tooltip contentStyle={{backgroundColor:"#1f2937",border:"none",borderRadius:8,color:"#f3f4f6",fontSize:11}}/>
                          <Area type="monotone" dataKey="totalEngagement" stroke="#14b8a6" strokeWidth={2} fill="url(#demoGrad)" dot={{r:2,fill:"#14b8a6"}}/>
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                {/* Right column: Sentiment + Best Time + Content Mix */}
                <div className="space-y-3">
                  {/* Sentiment inline */}
                  {dashboardData.sentimentBreakdown && (
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-3 border border-gray-100 dark:border-gray-700">
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Comment Sentiment</p>
                      <div className="flex items-center space-x-4 text-center">
                        <div><span className="text-lg">😊</span><p className="text-xs font-bold text-gray-800 dark:text-gray-100">{dashboardData.sentimentBreakdown.positivePercentage?.toFixed(0)}%</p></div>
                        <div><span className="text-lg">😐</span><p className="text-xs font-bold text-gray-800 dark:text-gray-100">{dashboardData.sentimentBreakdown.neutralPercentage?.toFixed(0)}%</p></div>
                        <div><span className="text-lg">😠</span><p className="text-xs font-bold text-gray-800 dark:text-gray-100">{dashboardData.sentimentBreakdown.negativePercentage?.toFixed(0)}%</p></div>
                      </div>
                      <div className="flex h-1.5 rounded-full overflow-hidden mt-2">
                        <div className="bg-green-400" style={{width:`${dashboardData.sentimentBreakdown.positivePercentage}%`}}/>
                        <div className="bg-gray-300" style={{width:`${dashboardData.sentimentBreakdown.neutralPercentage}%`}}/>
                        <div className="bg-red-400" style={{width:`${dashboardData.sentimentBreakdown.negativePercentage}%`}}/>
                      </div>
                    </div>
                  )}

                  {/* Best Posting Time */}
                  {dashboardData.bestPostingTime && (
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-3 border border-gray-100 dark:border-gray-700 flex items-center space-x-3">
                      <div className="w-9 h-9 bg-teal-50 dark:bg-teal-900/30 rounded-lg flex items-center justify-center">
                        <span className="material-symbols-outlined text-teal-600 dark:text-teal-400 text-base">schedule</span>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400">Best Time to Post</p>
                        <p className="text-sm font-bold text-gray-800 dark:text-gray-100">{dashboardData.bestPostingTime.bestDay}, {dashboardData.bestPostingTime.bestHour > 12 ? `${dashboardData.bestPostingTime.bestHour-12} PM` : `${dashboardData.bestPostingTime.bestHour} AM`}</p>
                      </div>
                    </div>
                  )}

                  {/* Content Mix inline */}
                  {dashboardData.contentMix && (
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-3 border border-gray-100 dark:border-gray-700">
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Content Mix</p>
                      <div className="flex items-center space-x-3">
                        <div className="flex-1">
                          <div className="flex h-2 rounded-full overflow-hidden">
                            <div className="bg-teal-500" style={{width:`${dashboardData.contentMix.imagePct}%`}}/>
                            <div className="bg-indigo-400" style={{width:`${dashboardData.contentMix.videoPct}%`}}/>
                          </div>
                        </div>
                        <div className="flex space-x-2 text-[10px]">
                          <span className="text-teal-600 dark:text-teal-400 font-medium">IMG {dashboardData.contentMix.imagePct?.toFixed(0)}%</span>
                          <span className="text-indigo-500 dark:text-indigo-400 font-medium">VID {dashboardData.contentMix.videoPct?.toFixed(0)}%</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Top Hashtags */}
              {dashboardData.mostUsedHashtags && dashboardData.mostUsedHashtags.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-xl p-3 border border-gray-100 dark:border-gray-700">
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Top Hashtags</p>
                  <div className="flex flex-wrap gap-1.5">
                    {dashboardData.mostUsedHashtags.slice(0, 8).map((h, idx) => (
                      <span key={idx} className="text-[10px] px-2 py-0.5 bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 rounded-full">#{h.hashtag}</span>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-xs text-gray-400 dark:text-gray-500 text-center italic">
                This is a preview — the full dashboard has 24+ metrics with interactive charts, leaderboards, and AI insights.
              </p>
            </div>
          )}
        </section>

        {/* Section 2: AI Chat */}
        <section id="demo-chat">
          <SectionGuide step="2" title="AI Chat Assistant"
            description="Ask MAYA anything about your performance. It knows your data and gives personalized, actionable answers."
            tip="Try asking: 'What's my engagement rate?' or 'When should I post next?'" />

          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            {/* Categorized prompt guide */}
            <div className="px-5 pt-4 pb-3 border-b border-gray-100 dark:border-gray-700">
              <ChatPromptGuide onPromptClick={(text) => handleChat(text)} compact={true} />
            </div>

            {/* Messages */}
            <div className="px-5 py-4 space-y-3 min-h-[150px] max-h-[400px] overflow-y-auto">
              {chatMessages.length === 0 && (
                <p className="text-center text-sm text-gray-400 dark:text-gray-500 py-8">Click a suggestion above or type your own question below</p>
              )}
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} gap-2`}>
                  {msg.role === "assistant" && (
                    <div className="flex-shrink-0 w-6 h-6 bg-teal-100 dark:bg-teal-900/40 rounded-full flex items-center justify-center mt-1">
                      <span className="material-symbols-outlined text-teal-600 dark:text-teal-400 text-xs">smart_toy</span>
                    </div>
                  )}
                  <div className={`max-w-[80%] px-3.5 py-2.5 text-sm leading-relaxed ${
                    msg.role === "user" ? "bg-teal-600 text-white rounded-2xl rounded-br-sm"
                      : "bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-2xl rounded-bl-sm border border-gray-100 dark:border-gray-600"
                  }`}>
                    {msg.role === "assistant" ? (
                      <div className="chat-markdown prose prose-sm dark:prose-invert max-w-none">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                        {chatStreaming && idx === chatMessages.length - 1 && <span className="inline-block w-1.5 h-4 bg-teal-500 animate-pulse ml-0.5 rounded-sm"/>}
                      </div>
                    ) : <p>{msg.content}</p>}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef}/>
            </div>

            {/* Input */}
            <div className="border-t border-gray-100 dark:border-gray-700 px-5 py-3 flex items-center space-x-2">
              <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleChat(); }}}
                placeholder="Ask MAYA anything..."
                className="flex-1 border border-gray-200 dark:border-gray-600 rounded-full px-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                disabled={chatStreaming}/>
              <button onClick={() => handleChat()} disabled={chatStreaming || !chatInput.trim()}
                className="w-9 h-9 flex items-center justify-center bg-teal-600 text-white rounded-full hover:bg-teal-700 disabled:opacity-40 transition-colors">
                <span className="material-symbols-outlined text-base">send</span>
              </button>
            </div>
          </div>
        </section>

        {/* Section 3: Calendar Preview */}
        <section id="demo-calendar">
          <SectionGuide step="3" title="Content Calendar"
            description="Plan your week visually. Schedule posts at optimal times and never miss a posting window."
            tip="In the full version, you can create, edit, approve, and delete scheduled posts." />

          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
            <div className="grid grid-cols-7 gap-1 text-center">
              {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(d => (
                <div key={d} className="text-xs font-semibold text-gray-500 dark:text-gray-400 py-2">{d}</div>
              ))}
              {Array.from({length:7}, (_, i) => {
                const hasPost = i === 1 || i === 3 || i === 5;
                return (
                  <div key={i} className={`h-20 rounded-xl border-2 border-dashed p-1.5 ${hasPost ? "border-teal-300 dark:border-teal-700 bg-teal-50/30 dark:bg-teal-900/10" : "border-gray-200 dark:border-gray-700"}`}>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{14+i}</span>
                    {hasPost && (
                      <div className="mt-1 px-1.5 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-[10px] font-medium rounded truncate border border-yellow-200 dark:border-yellow-700">
                        {i === 1 ? "Yoga routine" : i === 3 ? "Meal prep" : "Q&A session"}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500 text-center mt-3 italic">Sample week — your calendar shows real scheduled posts</p>
          </div>
        </section>

        {/* Section 4: Trends */}
        <section id="demo-trends">
          <SectionGuide step="4" title="Trends & Content Ideas"
            description="Discover content gaps, viral patterns, and get AI-generated post ideas backed by your actual performance data."
            tip="Click any card in the full version to get instant AI analysis." />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { icon: "search", label: "Content Gaps", color: "from-orange-500 to-amber-500", desc: "Find what your audience wants" },
              { icon: "local_fire_department", label: "Viral Patterns", color: "from-red-500 to-pink-500", desc: "Learn what went viral" },
              { icon: "lightbulb", label: "Post Ideas", color: "from-teal-500 to-cyan-500", desc: "AI-generated suggestions" },
              { icon: "tag", label: "Hashtag Strategy", color: "from-indigo-500 to-purple-500", desc: "Keep, drop, or add tags" },
            ].map((item, idx) => (
              <div key={idx} className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 text-center group hover:shadow-lg hover:-translate-y-1 transition-all">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform shadow-sm`}>
                  <span className="material-symbols-outlined text-white text-lg">{item.icon}</span>
                </div>
                <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">{item.label}</p>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Section 5: Weekly Plan */}
        <section id="demo-plan">
          <SectionGuide step="5" title="AI Weekly Strategy"
            description="MAYA analyzes your recent posts, detects your content pillars, and generates a personalized 7-day publishing plan with captions, hooks, and scheduling."
            tip="This is the hero feature — one click builds your entire week." />

          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
            <div className="text-center mb-4">
              <button onClick={handleGeneratePlan} disabled={planLoading || chatStreaming}
                className="px-6 py-3 bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] disabled:opacity-50 flex items-center space-x-2 mx-auto">
                {planLoading ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/><span>Generating...</span></>
                ) : (
                  <><span className="material-symbols-outlined text-lg">auto_awesome</span><span>Generate Weekly Plan</span></>
                )}
              </button>
            </div>

            {planLoading && (
              <div className="text-center py-6">
                <p className="text-sm text-teal-600 dark:text-teal-400 animate-pulse">MAYA is analyzing content and crafting your plan...</p>
              </div>
            )}

            {demoPlan && !planLoading && (
              <div className="space-y-4">
                {/* Plan summary */}
                <div className="p-4 bg-teal-50 dark:bg-teal-900/20 rounded-xl">
                  <p className="text-xs text-teal-700 dark:text-teal-400 font-medium">{demoPlan.strategyNotes}</p>
                  {demoPlan.detectedPillars && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {demoPlan.detectedPillars.map((p, i) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-400 rounded-full">{p}</span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Day cards preview */}
                <div className="grid grid-cols-7 gap-2">
                  {(demoPlan.days || []).slice(0, 7).map((day, idx) => (
                    <div key={idx} className="p-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-center">
                      <p className="text-[9px] text-gray-500 dark:text-gray-400 uppercase">{day.day?.slice(0, 3)}</p>
                      <p className="text-[10px] font-bold text-gray-800 dark:text-gray-200 mt-1 truncate">{day.postIdea?.split(" ").slice(0, 3).join(" ")}...</p>
                      <span className="text-[8px] text-teal-600 dark:text-teal-400">{day.format}</span>
                    </div>
                  ))}
                </div>

                <p className="text-xs text-gray-400 dark:text-gray-500 text-center italic">Full plan with captions, hooks, hashtags available in the real app</p>
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section id="demo-cta" className="space-y-6">
          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-4 py-4">
            <div className="flex items-center space-x-1.5 text-xs text-gray-500 dark:text-gray-400">
              <span className="material-symbols-outlined text-green-500 text-sm">lock</span>
              <span>No passwords stored</span>
            </div>
            <div className="flex items-center space-x-1.5 text-xs text-gray-500 dark:text-gray-400">
              <span className="material-symbols-outlined text-blue-500 text-sm">visibility</span>
              <span>Read-only access</span>
            </div>
            <div className="flex items-center space-x-1.5 text-xs text-gray-500 dark:text-gray-400">
              <span className="material-symbols-outlined text-purple-500 text-sm">link_off</span>
              <span>Disconnect anytime</span>
            </div>
            <div className="flex items-center space-x-1.5 text-xs text-gray-500 dark:text-gray-400">
              <span className="material-symbols-outlined text-teal-500 text-sm">shield</span>
              <span>We never sell your data</span>
            </div>
          </div>

          {/* CTA card */}
          <div className="text-center bg-gradient-to-r from-teal-600 to-cyan-600 rounded-2xl p-10 shadow-xl">
          <h2 className="text-2xl font-bold text-white mb-2">Ready to see YOUR data?</h2>
          <p className="text-teal-100 text-sm mb-6 max-w-md mx-auto">
            Connect your Instagram, Facebook, TikTok, or YouTube account and get the same powerful insights — personalized for you.
          </p>
          <p className="text-white text-sm font-medium mb-4">
            Head back to the main site and sign up or login to get started.
          </p>
          <p className="text-xs text-teal-200 mt-4">You can close this tab when you're done exploring, or keep it open for reference.</p>
          </div>
        </section>

      </main>
    </div>
  );
}

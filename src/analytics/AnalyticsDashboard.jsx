import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useCreator } from "./CreatorContext";
import PhylloConnectButton from "./PhylloConnect";
import HealthScoreCard from "./HealthScoreCard";
import RateCards from "./RateCards";
import EngagementTrend from "./EngagementTrend";
import ContentMix from "./ContentMix";
import BestWorstPosts from "./BestWorstPosts";
import BestPostingTime from "./BestPostingTime";
import HashtagsTable from "./HashtagsTable";
import Superfans from "./Superfans";
import SentimentChart from "./SentimentChart";
import CommonWords from "./CommonWords";
import QuestionsInsight from "./QuestionsInsight";
import MostLikedComments from "./MostLikedComments";
import CTAInsight from "./CTAInsight";
import CaptionLengthInsight from "./CaptionLengthInsight";
import QuestionsVsStatements from "./QuestionsVsStatements";
import { getAxiosConfig, getAuthHeaders } from "./apiHelper";
import { DashboardSkeleton } from "../components/SkeletonLoader";

const API_BASE = "https://maya-backend-service-326007673689.asia-southeast1.run.app";

const METRICS_GUIDE = [
  {
    category: "Health & Overview",
    metrics: [
      { name: "Health Score (0–100)", description: "A composite score combining five dimensions: engagement rate (30%), posting consistency (20%), reach efficiency (20%), comment sentiment (15%), and save rate (15%). Each component is normalised to 100 before weighting. 80–100 = Excellent, 60–79 = Good, 40–59 = Fair, Below 40 = Needs immediate attention." },
      { name: "Trend Direction", description: "Compares your average total engagement (likes + comments + saves + shares) over the last 4 weeks versus weeks 5–8. GROWING if recent average is higher, DECLINING if lower, FLAT if within 5%. A declining trend is often visible 2–3 weeks before follower count drops." },
      { name: "Engagement Trend Chart", description: "An 8-week line chart showing total weekly engagement (sum of likes + comments + saves + shares for all posts that week). Reveals whether your content momentum is building or fading over time." },
    ]
  },
  {
    category: "Engagement Rates",
    metrics: [
      { name: "Overall Engagement Rate", description: "Formula: (likes + comments + saves + shares) ÷ reach × 100, averaged across all posts with reach data. This is your headline number — brands use it to evaluate creator quality. Benchmark: 1–3% is industry average, 5%+ is exceptional, 10%+ is micro-influencer territory." },
      { name: "Save Rate", description: "Formula: saves ÷ reach × 100. The single strongest signal of content value. When someone saves a post, they're telling the algorithm it's worth revisiting. High save rate = educational, evergreen, or deeply useful content. Benchmark: 1–3% is healthy, 5%+ is exceptional, below 0.5% means content entertains but doesn't inform." },
      { name: "Share Rate", description: "Formula: shares ÷ reach × 100. Measures how strongly your audience spreads your content to others. High share rate triggers the algorithm to push content to non-followers — it's the primary organic discovery driver. Benchmark: 1–2% is solid, above 3% is viral territory." },
      { name: "Comment Rate", description: "Formula: comments ÷ reach × 100. Commenting is the most expensive engagement action — it takes thought and effort. A rising comment rate means your content sparks genuine conversation. Benchmark: 0.3–0.8% is typical, above 1% is high engagement, below 0.1% on a high-like post indicates passive audience." },
      { name: "Like-to-Comment Ratio", description: "Formula: likes ÷ comments. Tells you how active vs passive your audience is. Low ratio (5:1) = opinionated, invested audience — excellent for brand deals. High ratio (50:1) = people enjoy but don't connect deeply. A sudden spike means recent content stopped sparking conversation." },
      { name: "Play-through Rate (Video Only)", description: "Formula: views ÷ impressions × 100. Measures what fraction of people who saw your video actually watched it. Above 50% = strong hook, 30–50% = average, below 30% = thumbnail or opening frame needs work. Only computed for VIDEO/REELS posts." },
      { name: "Reach Efficiency", description: "Formula: reach ÷ impressions × 100. Tells you how widely content is distributed vs how many times the same people see it. Above 70% = algorithm actively distributing to new audiences. Below 40% = same followers seeing it repeatedly, organic discovery is weak." },
    ]
  },
  {
    category: "Content Performance",
    metrics: [
      { name: "Best / Worst Posts", description: "Posts ranked by engagement rate (likes + comments + saves + shares ÷ reach). Best posts reveal your content formula — the topics, formats, and times that work. Worst posts show what to stop. The gap between best and worst should narrow as you learn from patterns." },
      { name: "Content Mix (Image vs Video)", description: "Percentage split of images vs videos, with average engagement rate for each format. Identifies which format performs better for YOUR specific audience — not generic advice. If videos outperform images by X%, consider shifting your mix accordingly." },
      { name: "Posting Frequency", description: "Posts per week (current vs last week). Consistency is the #1 growth driver — a sudden drop in frequency almost always precedes a reach decline within days. Benchmark: 3–5 posts/week is optimal. Under 2 risks algorithm suppression. Above 14 often leads to quality drops." },
      { name: "Caption Length vs Engagement", description: "Posts bucketed into Short (<100 chars), Medium (100–300), and Long (300+). Shows which caption length gets highest engagement for your audience. Some audiences prefer punchy captions, others engage more with storytelling. This is creator-specific — no universal rule." },
    ]
  },
  {
    category: "Timing & Hashtags",
    metrics: [
      { name: "Best Day & Hour", description: "Analyses all your posts by (day, hour) slot and ranks by average engagement rate. Shows YOUR audience's peak attention window — more valuable than generic 'best time to post' guides because it's built from your own data and your audience's actual behaviour." },
      { name: "Most-Used Hashtags", description: "Your top hashtags ranked by frequency of use. Important: high usage does NOT mean high performance. Compare with Top Performing Hashtags to find hashtags you use a lot but which don't drive reach — those are candidates for removal." },
      { name: "Top Performing Hashtags", description: "Hashtags ranked by a performance score: (avg reach × 0.4) + (avg engagement rate × 0.6). Only includes hashtags used on 3+ posts. A hashtag ranked #1 in usage but #18 in performance should be dropped. One ranked #15 in usage but #2 in performance should be used more." },
    ]
  },
  {
    category: "Audience & Sentiment",
    metrics: [
      { name: "Top Commenters / Superfans", description: "Your most loyal community members ranked by superfan score: (comment_count × 2) + (total likes on their comments × 0.5). These people show up repeatedly, engage deeply, and their comments resonate with others. They're most likely to buy what you recommend and defend you in negative situations." },
      { name: "Sentiment Breakdown", description: "Classifies all comments as Positive, Neutral, or Negative. A high positive % means content resonates emotionally. A rising negative % is an early warning — something needs attention. Neutral (questions/observations) at 60–80% is normal. A spike in negative sentiment is the most actionable alert." },
      { name: "Common Words / Topics", description: "Top 30 words extracted from all comments (after removing stopwords). Reveals what your audience ACTUALLY cares about vs what you think they care about. Topics mentioned frequently in comments but absent from your recent captions = unmet content demand." },
      { name: "Profile → Follow Conversion", description: "Formula: followers gained ÷ profile visits × 100. Shows how well your posts convert curious viewers into followers. High rate = your bio, grid aesthetic, and pinned posts work. Low rate = people like individual posts but aren't compelled by the overall account. Only 30-32% of posts have this data." },
    ]
  },
  {
    category: "Comments & Questions",
    metrics: [
      { name: "Questions Detected", description: "Counts comments that are questions (ends with '?' or starts with how/what/when/where/why/which/can/should). Every unanswered question is a missed content opportunity. High question volume = your content sparks enough curiosity that people want more. Top liked questions = highest audience priority." },
      { name: "Unanswered Questions", description: "Questions in comments where reply_count = 0. Each unanswered question is a potential future post topic. For Maya, these feed directly into the content gap detector to auto-generate post ideas your audience is already asking for." },
      { name: "Most Liked Comments", description: "Comments with the highest like counts from other users on your last 10 posts. A comment with 200 likes means hundreds of people had the same thought. This is the highest-quality intent signal — more specific than word frequency and more validated than any single comment." },
      { name: "Questions vs Statements", description: "Compares average likes on question-heavy posts vs statement-heavy posts. If question-driven posts get more likes, curiosity content outperforms opinion content for YOUR audience. For a travel creator, questions about itinerary and cost signal purchase intent." },
    ]
  },
  {
    category: "Strategy Insights",
    metrics: [
      { name: "CTA Detection & Lift", description: "Detects calls-to-action in captions (link in bio, comment below, save this, share this, question CTAs) and compares engagement. Positive lift = CTAs work, use them in every caption. Negative/zero lift = your audience dislikes being directed, organic captions perform better." },
      { name: "Account Health Components", description: "The 5 sub-scores that feed your Health Score: A) Engagement rate (÷5, cap at 100) × 30%, B) Posts/week (÷3, cap at 100) × 20%, C) Reach efficiency (÷70, cap at 100) × 20%, D) Net sentiment (÷80, cap at 100) × 15%, E) Save rate (÷3, cap at 100) × 15%. Identify which dimension is dragging your score down." },
    ]
  },
];

// --- Operational Insight Cards ---
function InsightCards({ dashboardData, connectedAccounts }) {
  const rateCards = dashboardData?.rateCards || [];
  const engagementCard = rateCards.find(c => c.metricName === "engagement_rate");
  const postingFreq = rateCards.find(c => c.metricName === "posting_frequency");
  const bestTime = dashboardData?.bestPostingTime;

  const cards = [
    {
      icon: "event_repeat",
      label: "Posting Consistency",
      value: postingFreq?.currentValue != null ? `${postingFreq.currentValue.toFixed(1)} posts/week` : "—",
      sub: postingFreq?.deltaVsLastWeek != null ? `${postingFreq.deltaVsLastWeek >= 0 ? "+" : ""}${postingFreq.deltaVsLastWeek.toFixed(1)} vs last week` : null,
      color: "text-teal-600 dark:text-teal-400",
    },
    {
      icon: "group",
      label: "Followers",
      value: connectedAccounts[0]?.followerCount != null ? connectedAccounts[0].followerCount.toLocaleString() : "—",
      sub: connectedAccounts[0]?.platform || null,
      color: "text-purple-600 dark:text-purple-400",
    },
    {
      icon: "schedule",
      label: "Best Engagement Window",
      value: bestTime ? `${bestTime.bestDay}, ${bestTime.bestHour > 12 ? bestTime.bestHour - 12 + " PM" : bestTime.bestHour + " AM"}` : "—",
      sub: bestTime?.avgEngagementRate ? `${bestTime.avgEngagementRate.toFixed(1)}% avg ER` : null,
      color: "text-orange-600 dark:text-orange-400",
    },
    {
      icon: "trending_up",
      label: "Engagement Rate",
      value: engagementCard?.currentValue != null ? `${engagementCard.currentValue.toFixed(2)}%` : "—",
      sub: engagementCard?.deltaVsLastWeek != null ? `${engagementCard.deltaVsLastWeek >= 0 ? "+" : ""}${engagementCard.deltaVsLastWeek.toFixed(2)} vs last week` : null,
      color: engagementCard?.deltaVsLastWeek >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
      {cards.map((card, idx) => (
        <div key={idx} className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center space-x-2 mb-2">
            <span className={`material-symbols-outlined text-lg ${card.color}`}>{card.icon}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">{card.label}</span>
          </div>
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{card.value}</p>
          {card.sub && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{card.sub}</p>}
        </div>
      ))}
    </div>
  );
}

// --- AI Insights Panel ---
function AIInsightsPanel({ selectedCreator }) {
  const { authState } = useCreator();
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!selectedCreator) return;
    setLoaded(false);
    setInsights([]);
  }, [selectedCreator?.id]);

  useEffect(() => {
    if (!selectedCreator || loaded) return;
    setLoading(true);

    const fetchInsights = async () => {
      try {
        const headers = { "Content-Type": "application/json" };
        if (!selectedCreator.isDemo && authState.token) headers["Authorization"] = `Bearer ${authState.token}`;

        const response = await fetch(`${API_BASE}/api/chat/stream`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            message: "Give me 4 short operational insights about this creator's recent performance. Focus on: posting consistency, engagement trends, content format effectiveness, and one improvement suggestion. Each insight should be one sentence starting with an emoji. No markdown.",
            creatorId: selectedCreator.id,
            sessionId: `insights-${Date.now()}`,
          }),
        });

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "", fullText = "";
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
                if (token === "[DONE]") break;
                if (token.startsWith("[ERROR]")) {
                  console.error("AI Insights error:", token);
                  if (token.toLowerCase().includes("rate limit")) {
                    fullText = "__RATE_LIMITED__";
                  } else {
                    fullText = ""; // Clear so fallback triggers
                  }
                  break;
                }
                fullText += token;
              }
            }
          }
        }
        const lines = fullText.split("\n").filter(l => l.trim().length > 0).slice(0, 4);
        if (fullText === "__RATE_LIMITED__") {
          setInsights(["⏳ MAYA is taking a breather — insights will refresh shortly.", "📊 Your metrics are still visible below.", "💡 Try again in a minute for fresh AI insights."]);
        } else if (lines.length > 0) {
          setInsights(lines);
        } else {
          setInsights(["📊 Your account data is being analyzed.", "📅 Check your posting consistency from the Plan page.", "💡 Use Ask MAYA for personalized recommendations."]);
        }
        setLoaded(true);
      } catch {
        setInsights(["📊 Insights temporarily unavailable.", "📅 Check your Plan page for scheduling status.", "💡 Ask MAYA directly for performance questions."]);
        setLoaded(true);
      } finally {
        setLoading(false);
      }
    };
    fetchInsights();
  }, [selectedCreator, loaded]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 flex items-center space-x-2">
          <span className="material-symbols-outlined text-base text-teal-600 dark:text-teal-400">psychology</span>
          <span>MAYA Insights</span>
        </h3>
        <button onClick={() => { setLoaded(false); setInsights([]); }} className="text-[10px] text-teal-600 dark:text-teal-400 hover:underline">Refresh</button>
      </div>
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map(i => <div key={i} className="h-4 bg-gray-100 dark:bg-gray-700 rounded animate-pulse" />)}
        </div>
      ) : (
        <div className="space-y-2">
          {insights.map((s, idx) => {
            const emojiMatch = s.match(/^(\p{Emoji_Presentation}|\p{Emoji}\uFE0F?)/u);
            const emoji = emojiMatch ? emojiMatch[0] : "•";
            const text = emojiMatch ? s.slice(emojiMatch[0].length).trim() : s.trim();
            return (
              <div key={idx} className="flex items-start space-x-3 p-3 rounded-lg border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30">
                <span className="text-lg flex-shrink-0">{emoji}</span>
                <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">{text}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// --- Connected Platforms Summary ---
function PlatformsSummary({ connectedAccounts }) {
  if (connectedAccounts.length === 0) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700 mb-8">
      <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-3 flex items-center space-x-2">
        <span className="material-symbols-outlined text-base text-gray-400">devices</span>
        <span>Connected Platforms</span>
      </h3>
      <div className="space-y-2">
        {connectedAccounts.map((acc, idx) => (
          <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className="flex items-center space-x-3">
              <span className="w-2 h-2 bg-green-500 rounded-full" />
              <div>
                <p className="text-xs font-medium text-gray-800 dark:text-gray-200">@{acc.username}</p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400">{acc.platform}</p>
              </div>
            </div>
            <span className="text-[10px] text-green-600 dark:text-green-400 font-medium">Connected</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- Main Dashboard ---
function DashboardContent() {
  const { selectedCreator, authState, connectedAccounts, syncingCreatorId } = useCreator();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showMetricsGuide, setShowMetricsGuide] = useState(false);

  useEffect(() => {
    if (!selectedCreator) return;
    const fetchDashboard = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `${API_BASE}/api/analytics/dashboard/${selectedCreator.id}`,
          getAxiosConfig(selectedCreator)
        );
        setDashboardData(response.data);
      } catch (error) {
        console.error("Failed to fetch dashboard:", error);
        toast.error("Failed to load insights. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [selectedCreator]);

  // Auto-refresh for syncing
  useEffect(() => {
    if (!dashboardData || selectedCreator?.isDemo) return;
    if (dashboardData.healthScore?.score) return;
    const poll = setInterval(async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/analytics/dashboard/${selectedCreator.id}`, getAxiosConfig(selectedCreator));
        setDashboardData(res.data);
        if (res.data.healthScore?.score) clearInterval(poll);
      } catch {}
    }, 10000);
    const timeout = setTimeout(() => clearInterval(poll), 120000);
    return () => { clearInterval(poll); clearTimeout(timeout); };
  }, [dashboardData, selectedCreator]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans pt-16">
      <main className="max-w-5xl mx-auto px-4 py-8">

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Insights</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {selectedCreator
              ? `Recent publishing activity and performance for @${selectedCreator.username}`
              : "Recent publishing activity and operational insights across your connected accounts."}
          </p>
        </div>

        {/* Loading */}
        {loading && <DashboardSkeleton />}

        {/* Syncing */}
        {!loading && dashboardData && !dashboardData.healthScore?.score && !selectedCreator?.isDemo && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 mb-4 relative">
              <div className="w-16 h-16 border-4 border-teal-200 dark:border-teal-800 rounded-full" />
              <div className="absolute inset-0 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Syncing your data...</p>
          </div>
        )}

        {/* Main Content */}
        {!loading && dashboardData && (dashboardData.healthScore?.score || selectedCreator?.isDemo) && (
          <>
            {/* Section 1: Operational Insight Cards */}
            <InsightCards dashboardData={dashboardData} connectedAccounts={connectedAccounts} />

            {/* Section 2: Primary Trend Chart */}
            <div className="mb-8">
              <EngagementTrend
                engagementTrend={dashboardData.engagementTrend}
                trendDirection={dashboardData.trendDirection}
              />
            </div>

            {/* Section 3: Connected Platforms Summary */}
            <PlatformsSummary connectedAccounts={connectedAccounts} />

            {/* Section 4: AI Operational Insights */}
            <AIInsightsPanel selectedCreator={selectedCreator} />

            {/* Section 5: Advanced Metrics (collapsed) */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800">
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
                >
                  <span className="material-symbols-outlined text-gray-400 text-base">analytics</span>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Advanced Metrics</span>
                  <span className="text-[10px] text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">24+ metrics</span>
                  <span className={`material-symbols-outlined text-gray-400 text-sm transition-transform ${showAdvanced ? "rotate-180" : ""}`}>expand_more</span>
                </button>
                <button
                  onClick={() => setShowMetricsGuide(true)}
                  className="flex items-center space-x-1 text-xs text-teal-600 dark:text-teal-400 hover:underline"
                >
                  <span className="material-symbols-outlined text-sm">help</span>
                  <span>What do these mean?</span>
                </button>
              </div>

              {showAdvanced && (
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 space-y-6">
                  <HealthScoreCard healthScore={dashboardData.healthScore} />
                  <RateCards rateCards={dashboardData.rateCards} />

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <ContentMix contentMix={dashboardData.contentMix} />
                    <BestPostingTime bestPostingTime={dashboardData.bestPostingTime} />
                  </div>

                  <BestWorstPosts bestPosts={dashboardData.bestPosts} worstPosts={dashboardData.worstPosts} />

                  <HashtagsTable mostUsedHashtags={dashboardData.mostUsedHashtags} topPerformingHashtags={dashboardData.topPerformingHashtags} />

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <SentimentChart sentimentBreakdown={dashboardData.sentimentBreakdown} />
                    <Superfans topCommenters={dashboardData.topCommenters} />
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <CommonWords commonWords={dashboardData.commonWords} />
                  </div>

                  <QuestionsInsight questionsInsight={dashboardData.questionsInsight} />
                  <MostLikedComments mostLikedComments={dashboardData.mostLikedComments} />

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <CTAInsight ctaInsight={dashboardData.ctaInsight} />
                    <CaptionLengthInsight captionLengthInsight={dashboardData.captionLengthInsight} />
                    <QuestionsVsStatements questionsVsStatements={dashboardData.questionsVsStatements} />
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Empty State */}
        {!loading && !dashboardData && (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400 dark:text-gray-500">
            <span className="material-symbols-outlined text-4xl mb-3">insights</span>
            <p className="text-sm">Select an account to view insights</p>
          </div>
        )}

        {/* Metrics Explanation Modal */}
        {showMetricsGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm px-4" onClick={() => setShowMetricsGuide(false)}>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden border border-gray-200 dark:border-gray-700" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Metrics Explained</h3>
                <button onClick={() => setShowMetricsGuide(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                  <span className="material-symbols-outlined text-gray-500 text-lg">close</span>
                </button>
              </div>
              <div className="p-5 overflow-y-auto max-h-[calc(80vh-70px)] space-y-4">
                {METRICS_GUIDE.map((section, idx) => (
                  <div key={idx}>
                    <h4 className="text-xs font-semibold text-teal-600 dark:text-teal-400 uppercase tracking-wide mb-2">{section.category}</h4>
                    <div className="space-y-2">
                      {section.metrics.map((m, i) => (
                        <div key={i} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{m.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{m.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function AnalyticsDashboard() {
  return <DashboardContent />;
}

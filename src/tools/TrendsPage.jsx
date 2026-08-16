import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import axios from "axios";
import { toast } from "react-toastify";
import { useCreator } from "../analytics/CreatorContext";
import { getAuthHeaders } from "../analytics/apiHelper";

const API_BASE = "https://maya-backend-service-326007673689.asia-southeast1.run.app";

const PROMPTS = [
  { icon: "search", label: "Content Gaps", prompt: "What content gaps do I have? What topics does my audience want that I haven't covered?", color: "from-orange-500 to-amber-500" },
  { icon: "local_fire_department", label: "Viral Patterns", prompt: "What content went viral for me? Analyze my high-share content and explain why it worked.", color: "from-red-500 to-pink-500" },
  { icon: "lightbulb", label: "Post Ideas", prompt: "Give me 5 data-backed post ideas for this week based on my audience interests and best performing content.", color: "from-teal-500 to-cyan-500" },
  { icon: "tag", label: "Hashtag Strategy", prompt: "Analyze my hashtag strategy. Which hashtags should I keep using and which should I drop? Suggest new ones.", color: "from-indigo-500 to-purple-500" },
];

export default function TrendsPage() {
  const { selectedCreator } = useCreator();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [sessionId] = useState(() => crypto.randomUUID());
  const [scheduleModal, setScheduleModal] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messages.length > 0) messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (messageText) => {
    const trimmed = (messageText || input).trim();
    if (!trimmed || isStreaming) return;
    setMessages((prev) => [...prev, { role: "user", content: trimmed }]);
    setInput("");
    setIsStreaming(true);
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    try {
      const response = await fetch(`${API_BASE}/api/chat/stream`, {
        method: "POST",
        headers: getAuthHeaders(selectedCreator),
        body: JSON.stringify({ message: trimmed, creatorId: selectedCreator?.id, sessionId }),
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
              if (token === "[DONE]") { setIsStreaming(false); return; }
              setMessages((prev) => {
                const updated = [...prev];
                const last = updated[updated.length - 1];
                if (last.role === "assistant") updated[updated.length - 1] = { ...last, content: last.content + token };
                return updated;
              });
            }
          }
        }
      }
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((prev) => { const u = [...prev]; u[u.length-1] = {...u[u.length-1], content: "Something went wrong."}; return u; });
    } finally { setIsStreaming(false); }
  };

  const handleScheduleThis = (content) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);
    setScheduleModal({ caption: content.slice(0, 300), scheduledFor: tomorrow.toISOString().slice(0, 16) });
  };

  const handleSaveSchedule = async () => {
    if (!scheduleModal) return;
    try {
      await axios.post(`${API_BASE}/api/schedule/create`, {
        creatorId: selectedCreator?.id,
        caption: scheduleModal.caption,
        hashtags: "",
        mediaType: "IMAGE",
        mediaUrl: null,
        scheduledFor: scheduleModal.scheduledFor,
      }, getAxiosConfig(selectedCreator));
      toast.success("Post scheduled to calendar!");
      setScheduleModal(null);
    } catch (err) { toast.error("Failed to schedule"); }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16">
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            <span className="text-teal-600 dark:text-teal-400">Trends</span> & Content Ideas
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">AI-powered insights to fuel your content strategy</p>
        </div>

        {/* Prompt Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {PROMPTS.map((p, idx) => (
            <button key={idx} onClick={() => handleSend(p.prompt)}
              disabled={isStreaming}
              className="flex flex-col items-center p-5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all group disabled:opacity-50 hover:-translate-y-1">
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${p.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-sm`}>
                <span className="material-symbols-outlined text-white text-lg">{p.icon}</span>
              </div>
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center">{p.label}</span>
            </button>
          ))}
        </div>

        {/* Chat Area */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="px-5 py-4 space-y-4 min-h-[200px]">
            {messages.length === 0 && (
              <div className="text-center py-12 text-gray-400 dark:text-gray-500">
                <span className="material-symbols-outlined text-4xl mb-2">trending_up</span>
                <p className="text-sm">Click a card above to discover trends and get content ideas</p>
              </div>
            )}
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} gap-2`}>
                {msg.role === "assistant" && (
                  <div className="flex-shrink-0 w-7 h-7 bg-teal-100 dark:bg-teal-900/40 rounded-full flex items-center justify-center mt-1">
                    <span className="material-symbols-outlined text-teal-600 dark:text-teal-400 text-xs">smart_toy</span>
                  </div>
                )}
                <div className={`max-w-[80%] px-4 py-3 text-sm leading-relaxed ${
                  msg.role === "user" ? "bg-teal-600 text-white rounded-2xl rounded-br-sm"
                    : "bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-2xl rounded-bl-sm border border-gray-100 dark:border-gray-600"
                }`}>
                  {msg.role === "assistant" ? (
                    <div className="chat-markdown prose prose-sm dark:prose-invert max-w-none">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                      {isStreaming && idx === messages.length - 1 && <span className="inline-block w-1.5 h-4 bg-teal-500 animate-pulse ml-0.5 rounded-sm" />}
                    </div>
                  ) : <p>{msg.content}</p>}
                </div>
                {msg.role === "assistant" && msg.content && !isStreaming && (
                  <div className="flex flex-col gap-1 self-end mb-1">
                    <button onClick={() => navigator.clipboard.writeText(msg.content)} className="text-gray-400 hover:text-teal-500 transition-colors" title="Copy">
                      <span className="material-symbols-outlined text-sm">content_copy</span>
                    </button>
                    <button onClick={() => handleScheduleThis(msg.content)} className="text-gray-400 hover:text-orange-500 transition-colors" title="Schedule This">
                      <span className="material-symbols-outlined text-sm">calendar_month</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-gray-100 dark:border-gray-700 px-5 py-3">
            <div className="flex items-center space-x-2">
              <input type="text" value={input} onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                placeholder="Ask about trends, ideas, or strategy..."
                className="flex-1 border border-gray-200 dark:border-gray-600 rounded-full px-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                disabled={isStreaming} />
              <button onClick={() => handleSend()} disabled={isStreaming || !input.trim()}
                className="w-10 h-10 flex items-center justify-center bg-teal-600 text-white rounded-full hover:bg-teal-700 disabled:opacity-40 transition-colors">
                <span className="material-symbols-outlined text-lg">send</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Schedule Modal */}
      {scheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm px-4" onClick={() => setScheduleModal(null)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-6 border border-gray-200 dark:border-gray-700" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4 flex items-center">
              <span className="material-symbols-outlined text-teal-600 dark:text-teal-400 mr-2">calendar_month</span>
              Schedule This Idea
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Caption</label>
                <textarea rows="4" value={scheduleModal.caption} onChange={(e) => setScheduleModal({...scheduleModal, caption: e.target.value})}
                  className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Schedule For</label>
                <input type="datetime-local" value={scheduleModal.scheduledFor} onChange={(e) => setScheduleModal({...scheduleModal, scheduledFor: e.target.value})}
                  className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <button onClick={() => setScheduleModal(null)} className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">Cancel</button>
              <button onClick={handleSaveSchedule} className="px-4 py-2 text-sm bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium">Schedule</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

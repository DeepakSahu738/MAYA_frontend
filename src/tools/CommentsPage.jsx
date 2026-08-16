import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { useCreator } from "../analytics/CreatorContext";
import { getAuthHeaders } from "../analytics/apiHelper";

const API_BASE = "https://maya-backend-service-326007673689.asia-southeast1.run.app";

const PROMPTS = [
  { icon: "help", label: "Unanswered Questions", prompt: "Show my top unanswered questions sorted by priority" },
  { icon: "edit_note", label: "Draft Replies", prompt: "Draft replies to my top 3 unanswered questions in my brand voice" },
  { icon: "analytics", label: "Comment Stats", prompt: "Give me my comment statistics: total comments, question percentage, unanswered count, and response rate" },
  { icon: "favorite", label: "Top Comments", prompt: "Show my most liked comments and suggest how to engage with them" },
];

export default function CommentsPage() {
  const { selectedCreator } = useCreator();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [sessionId] = useState(() => crypto.randomUUID());
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
      setMessages((prev) => { const u = [...prev]; u[u.length-1] = {...u[u.length-1], content: "Something went wrong. Try again."}; return u; });
    } finally { setIsStreaming(false); }
  };

  const copyText = (text) => { navigator.clipboard.writeText(text); };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16">
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            <span className="text-teal-600 dark:text-teal-400">Comment</span> Manager
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Use AI to manage and reply to your audience</p>
        </div>

        {/* Prompt Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {PROMPTS.map((p, idx) => (
            <button key={idx} onClick={() => handleSend(p.prompt)}
              disabled={isStreaming}
              className="flex flex-col items-center p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-teal-300 dark:hover:border-teal-600 hover:shadow-md transition-all group disabled:opacity-50">
              <span className="material-symbols-outlined text-teal-600 dark:text-teal-400 text-xl mb-2 group-hover:scale-110 transition-transform">{p.icon}</span>
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center">{p.label}</span>
            </button>
          ))}
        </div>

        {/* Chat Area */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="px-5 py-4 space-y-4 min-h-[200px]">
            {messages.length === 0 && (
              <div className="text-center py-12 text-gray-400 dark:text-gray-500">
                <span className="material-symbols-outlined text-4xl mb-2">forum</span>
                <p className="text-sm">Click a prompt above or type your own question</p>
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
                  <button onClick={() => copyText(msg.content)} className="self-end mb-1 text-gray-400 hover:text-teal-500 transition-colors" title="Copy">
                    <span className="material-symbols-outlined text-sm">content_copy</span>
                  </button>
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
                placeholder="Ask about your comments..."
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
    </div>
  );
}

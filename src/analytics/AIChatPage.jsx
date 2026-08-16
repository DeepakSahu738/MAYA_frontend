import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import axios from "axios";
import { useCreator } from "./CreatorContext";
import { getAuthHeaders } from "./apiHelper";
import ChatPromptGuide from "../components/ChatPromptGuide";
import { getUserIdFromToken, getRoleFromToken } from "../tokenDecoder/detokenizer";

const API_BASE = "https://maya-backend-service-326007673689.asia-southeast1.run.app";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function getUserName() {
  const token = sessionStorage.getItem("token");
  if (!token) return null;
  const role = getRoleFromToken(token);
  if (role === "GUEST") return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.name || payload.firstname || payload.sub || null;
  } catch {
    return null;
  }
}

function ChatContent() {
  const { selectedCreator } = useCreator();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [sessionId] = useState(() => crypto.randomUUID());
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const userName = getUserName();
  const greeting = getGreeting();

  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, []);

  const handleSend = async (messageText) => {
    const trimmed = (messageText || input).trim();
    if (!trimmed || isStreaming) return;

    const userMessage = { role: "user", content: trimmed };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsStreaming(true);

    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    try {
      const response = await fetch(`${API_BASE}/api/chat/stream`, {
        method: "POST",
        headers: getAuthHeaders(selectedCreator),
        body: JSON.stringify({
          message: trimmed,
          creatorId: selectedCreator?.id,
          sessionId,
        }),
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
          const lines = part.split("\n");
          for (const line of lines) {
            if (line.startsWith("data:")) {
              const token = line.substring(5);
              if (token === "[DONE]") {
                setIsStreaming(false);
                return;
              }
              setMessages((prev) => {
                const updated = [...prev];
                const lastMsg = updated[updated.length - 1];
                if (lastMsg.role === "assistant") {
                  updated[updated.length - 1] = {
                    ...lastMsg,
                    content: lastMsg.content + token,
                  };
                }
                return updated;
              });
            }
          }
        }
      }
    } catch (error) {
      console.error("Chat stream error:", error);
      setMessages((prev) => {
        const updated = [...prev];
        const lastMsg = updated[updated.length - 1];
        if (lastMsg.role === "assistant" && lastMsg.content === "") {
          updated[updated.length - 1] = {
            ...lastMsg,
            content: "Sorry, something went wrong. Please try again.",
          };
        }
        return updated;
      });
    } finally {
      setIsStreaming(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans pt-16">
      <div className="max-w-4xl mx-auto px-4 py-6 flex flex-col min-h-[calc(100vh-64px)]">

        {/* Top Bar */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-700 rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-xl">smart_toy</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-800 dark:text-gray-100">MAYA AI</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {selectedCreator ? `Analyzing @${selectedCreator.username}${selectedCreator.followerCount ? ` • ${selectedCreator.followerCount.toLocaleString()} followers` : ""}` : "Your social media strategist"}
              </p>
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 bg-white dark:bg-gray-800 rounded-2xl shadow-sm flex flex-col">

          {/* Messages */}
          <div className="px-6 py-5 space-y-5">

            {/* Empty State */}
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center min-h-[400px]">
                <div className="w-16 h-16 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
                  <span className="material-symbols-outlined text-white text-3xl">psychology</span>
                </div>

                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-1">
                  {greeting}{userName ? `, ${userName}` : ""}! 👋
                </h2>
                <p className="text-gray-500 dark:text-gray-400 text-center mb-6 max-w-md text-sm">
                  I'm MAYA — your AI social media strategist. I can analyze your data, schedule posts, draft replies, and generate content ideas.
                </p>

                <ChatPromptGuide onPromptClick={(text) => handleSend(text)} />
              </div>
            )}

            {/* Message Bubbles */}
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} gap-3`}
              >
                {msg.role === "assistant" && (
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-teal-500 to-teal-700 rounded-full flex items-center justify-center mt-1">
                    <span className="material-symbols-outlined text-white text-sm">smart_toy</span>
                  </div>
                )}

                <div
                  className={`max-w-[75%] px-4 py-3 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-teal-600 text-white rounded-2xl rounded-br-sm"
                      : "bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-2xl rounded-bl-sm border border-gray-100 dark:border-gray-600"
                  }`}
                >
                  {msg.role === "assistant" ? (
                    <div className="chat-markdown prose prose-sm dark:prose-invert max-w-none prose-p:my-1.5 prose-ul:my-1.5 prose-ol:my-1.5 prose-li:my-0.5 prose-headings:my-2 prose-headings:text-gray-800 dark:prose-headings:text-gray-100 prose-strong:text-teal-700 dark:prose-strong:text-teal-400 prose-a:text-teal-600 dark:prose-a:text-teal-400">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                      {isStreaming && idx === messages.length - 1 && (
                        <span className="inline-block w-1.5 h-4 bg-teal-500 animate-pulse ml-0.5 rounded-sm align-middle" />
                      )}
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                  )}
                </div>

                {msg.role === "user" && (
                  <div className="flex-shrink-0 w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center mt-1">
                    <span className="material-symbols-outlined text-gray-600 dark:text-gray-300 text-sm">person</span>
                  </div>
                )}
              </div>
            ))}

            {/* Typing Indicator */}
            {isStreaming && messages.length > 0 && messages[messages.length - 1].content === "" && (
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-teal-500 to-teal-700 rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-sm">smart_toy</span>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 border border-gray-100 dark:border-gray-600 rounded-2xl rounded-bl-sm px-4 py-3">
                  <div className="flex space-x-1.5">
                    <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: "0.15s" }} />
                    <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: "0.3s" }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="px-5 py-4 bg-white dark:bg-gray-800">
            <div className="flex items-center space-x-3">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask MAYA anything about your Instagram..."
                className="flex-1 border border-gray-200 dark:border-gray-600 rounded-full px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                disabled={isStreaming}
              />
              <button
                onClick={() => handleSend()}
                disabled={isStreaming || !input.trim()}
                className="w-11 h-11 flex items-center justify-center bg-teal-600 text-white rounded-full hover:bg-teal-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:scale-105 shadow-sm"
              >
                <span className="material-symbols-outlined text-lg">send</span>
              </button>
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500 text-center mt-2">
              MAYA analyzes your real Instagram data to provide personalized insights
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AIChatPage() {
  return <ChatContent />;
}

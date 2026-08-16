import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { useCreator } from "./CreatorContext";
import { getAuthHeaders } from "./apiHelper";

const API_BASE = "https://maya-backend-service-326007673689.asia-southeast1.run.app";

export default function AIChatPanel({ isOpen, onClose }) {
  const { selectedCreator } = useCreator();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [sessionId] = useState(() => crypto.randomUUID());
  const [cooldown, setCooldown] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (messages.length > 0 && messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current.focus(), 100);
    }
  }, [isOpen]);

  const handleSend = async () => {
    const trimmed = input.trim();
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
              // Handle [ERROR] tokens — including rate limit messages
              if (token.startsWith("[ERROR]")) {
                const errorMsg = token.replace("[ERROR] ", "").replace("[ERROR]", "").trim();
                const isRateLimit = errorMsg.toLowerCase().includes("rate limit");
                setMessages((prev) => {
                  const updated = [...prev];
                  updated[updated.length - 1] = {
                    role: "assistant",
                    content: isRateLimit
                      ? "⏳ " + (errorMsg || "Rate limit exceeded. Please wait a moment before sending more messages.")
                      : "⚠️ " + (errorMsg || "Something went wrong. Please try again."),
                    isError: true,
                  };
                  return updated;
                });
                if (isRateLimit) {
                  setCooldown(true);
                  setTimeout(() => setCooldown(false), 5000);
                }
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

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-24 right-4 md:right-6 w-[calc(100%-2rem)] md:w-[400px] h-[70vh] max-h-[600px] z-30 flex flex-col border border-gray-200 dark:border-gray-700 overflow-hidden animate-[fadeInUp_0.2s_ease-out] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-teal-600 to-teal-700">
        <div className="flex items-center space-x-2">
          <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-lg">smart_toy</span>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">MAYA AI</h3>
            {selectedCreator && (
              <p className="text-xs text-teal-100">Analyzing @{selectedCreator.username}</p>
            )}
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors text-white"
        >
          <span className="material-symbols-outlined text-lg">close</span>
        </button>
      </div>

      {/* Messages */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-4 bg-gray-50 dark:bg-gray-900">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-16 h-16 bg-teal-50 dark:bg-teal-900/30 rounded-full flex items-center justify-center mb-3 border-2 border-teal-100 dark:border-teal-800">
              <span className="material-symbols-outlined text-teal-600 dark:text-teal-400 text-3xl">psychology</span>
            </div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Ask me anything about your analytics</p>
            <div className="space-y-1.5 w-full">
              <button
                onClick={() => { setInput("What's my engagement rate?"); }}
                className="w-full text-xs text-left px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-teal-50 dark:hover:bg-teal-900/20 hover:border-teal-200 dark:hover:border-teal-700 transition-colors"
              >
                💡 "What's my engagement rate?"
              </button>
              <button
                onClick={() => { setInput("Which posts perform best?"); }}
                className="w-full text-xs text-left px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-teal-50 dark:hover:bg-teal-900/20 hover:border-teal-200 dark:hover:border-teal-700 transition-colors"
              >
                💡 "Which posts perform best?"
              </button>
              <button
                onClick={() => { setInput("How can I grow my audience?"); }}
                className="w-full text-xs text-left px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-teal-50 dark:hover:bg-teal-900/20 hover:border-teal-200 dark:hover:border-teal-700 transition-colors"
              >
                💡 "How can I grow my audience?"
              </button>
            </div>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} gap-2`}
          >
            {msg.role === "assistant" && (
              <div className="flex-shrink-0 w-6 h-6 bg-teal-100 dark:bg-teal-900/40 rounded-full flex items-center justify-center mt-1">
                <span className="material-symbols-outlined text-teal-600 dark:text-teal-400 text-xs">smart_toy</span>
              </div>
            )}

            <div
              className={`max-w-[80%] px-3.5 py-2.5 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-teal-600 text-white rounded-2xl rounded-br-sm"
                  : msg.isError
                    ? "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-2xl rounded-bl-sm shadow-sm border border-red-200 dark:border-red-800"
                    : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-2xl rounded-bl-sm shadow-sm border border-gray-100 dark:border-gray-700"
              }`}
            >
              {msg.role === "assistant" ? (
                <div className="chat-markdown prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5 prose-headings:my-1.5 prose-headings:text-gray-800 dark:prose-headings:text-gray-100 prose-strong:text-teal-700 dark:prose-strong:text-teal-400 prose-a:text-teal-600 dark:prose-a:text-teal-400">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                  {isStreaming && idx === messages.length - 1 && (
                    <span className="inline-block w-1.5 h-4 bg-teal-500 animate-pulse ml-0.5 rounded-sm align-middle" />
                  )}
                </div>
              ) : (
                <p className="whitespace-pre-wrap break-words">{msg.content}</p>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-100 dark:border-gray-700 p-3 bg-white dark:bg-gray-800">
        <div className="flex items-center space-x-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={cooldown ? "Please wait..." : "Type a message..."}
            className="flex-1 border border-gray-200 dark:border-gray-600 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
            disabled={isStreaming || cooldown}
          />
          <button
            onClick={handleSend}
            disabled={isStreaming || cooldown || !input.trim()}
            className="w-10 h-10 flex items-center justify-center bg-teal-600 text-white rounded-full hover:bg-teal-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:scale-105"
          >
            <span className="material-symbols-outlined text-lg">send</span>
          </button>
        </div>
      </div>
    </div>
  );
}

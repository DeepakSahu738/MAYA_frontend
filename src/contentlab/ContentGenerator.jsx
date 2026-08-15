import React, { useState, useRef } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { getRoleFromToken } from "../tokenDecoder/detokenizer";

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={handleCopy} className="text-xs text-gray-400 hover:text-teal-500 transition-colors flex items-center space-x-0.5" title="Copy">
      <span className="material-symbols-outlined text-sm">{copied ? "check" : "content_copy"}</span>
      {copied && <span className="text-teal-500">Copied</span>}
    </button>
  );
}

export default function ContentGenerator({ platform }) {
  const { name, gradient, icon, tagline, apiEndpoint, fields, keywordsLabel, keywordsApiKey, parseResponse } = platform;

  const token = sessionStorage.getItem("token");
  const [step, setStep] = useState(0); // 0=form, 1=results
  const [keywords, setKeywords] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const resultsRef = useRef(null);

  // Initialize form with first option of each field
  const [formData, setFormData] = useState(() => {
    const initial = {};
    fields.forEach((f) => { initial[f.key] = f.options[0]; });
    return initial;
  });

  const handleSelect = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleKeyDown = (e) => {
    if ((e.key === "Enter" || e.key === ",") && inputValue.trim()) {
      e.preventDefault();
      const kw = inputValue.trim().replace(/,$/, "");
      if (!keywords.includes(kw)) setKeywords([...keywords, kw]);
      setInputValue("");
    }
  };

  const handleRemove = (idx) => {
    setKeywords(keywords.filter((_, i) => i !== idx));
  };

  const handleGenerate = async () => {
    if (!token) {
      toast.error("Please register or continue as a Guest to access this feature.");
      return;
    }
    setLoading(true);
    try {
      const body = {};
      fields.forEach((f) => { body[f.apiKey] = formData[f.key]; });
      body[keywordsApiKey] = keywords;

      const response = await axios.post(apiEndpoint, body, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const parsed = parseResponse(response.data);
      setResults(parsed);
      setStep(1);
      toast.success("Recommendations generated successfully!");
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth" }), 200);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        const role = getRoleFromToken(token);
        if (role === "GUEST") toast.error("Free credit limit exceeded. Register for more.");
        else toast.error("Session expired. Please login again.");
      } else {
        console.error("Content generation error:", error.response?.data || error.message || error);
        toast.error("Failed to generate: " + (error.response?.data?.message || error.message || "Please try again."));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = () => {
    setStep(0);
  };

  const handleViewResults = () => {
    if (results) setStep(1);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans pt-16">
      <main className="max-w-5xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="text-center mb-10">
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${gradient} shadow-lg mb-4`}>
            <span className="material-symbols-outlined text-white text-3xl">{icon}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-gray-100 mb-2">
            {name} <span className={`text-transparent bg-clip-text bg-gradient-to-r ${gradient}`}>Optimizer</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">{tagline}</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setStep(0)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${step === 0 ? "bg-teal-600 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600"}`}
            >
              <span className="material-symbols-outlined text-base">tune</span>
              <span>Configure</span>
            </button>
            <div className="w-8 h-0.5 bg-gray-300 dark:bg-gray-600" />
            <button
              onClick={handleViewResults}
              disabled={!results}
              className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${step === 1 ? "bg-teal-600 text-white" : results ? "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600" : "bg-gray-100 dark:bg-gray-800 text-gray-300 dark:text-gray-600 cursor-not-allowed"}`}
            >
              <span className="material-symbols-outlined text-base">auto_awesome</span>
              <span>Results</span>
            </button>
          </div>
        </div>

        {/* Form Section */}
        {step === 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {fields.map((field) => (
                <div key={field.key}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{field.label}</label>
                  <select
                    value={formData[field.key]}
                    onChange={(e) => handleSelect(field.key, e.target.value)}
                    className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 cursor-pointer appearance-none"
                  >
                    {field.options.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">{field.hint}</p>
                </div>
              ))}

              {/* Keywords */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{keywordsLabel}</label>
                <div className="flex flex-wrap items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl min-h-[3rem]">
                  {keywords.map((kw, idx) => (
                    <span key={idx} className="inline-flex items-center bg-teal-100 dark:bg-teal-900/40 text-teal-800 dark:text-teal-300 px-2.5 py-1 rounded-full text-xs font-medium">
                      {kw}
                      <button onClick={() => handleRemove(idx)} className="ml-1.5 text-teal-600 dark:text-teal-400 hover:text-red-500">&times;</button>
                    </span>
                  ))}
                  <input
                    className="flex-grow bg-transparent focus:outline-none text-sm text-gray-800 dark:text-gray-200 min-w-[140px] placeholder-gray-400 dark:placeholder-gray-500"
                    placeholder="Type and press Enter or comma"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                  />
                </div>
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={loading}
              className={`w-full mt-8 py-4 bg-gradient-to-r ${gradient} text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2`}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">auto_awesome</span>
                  <span>Generate Recommendations</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Results Section */}
        {step === 1 && results && (
          <div ref={resultsRef} className="space-y-6">
            {/* Back + Regenerate */}
            <div className="flex items-center justify-between">
              <button onClick={handleRegenerate} className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
                <span className="material-symbols-outlined text-base">arrow_back</span>
                <span>Edit Parameters</span>
              </button>
              <button onClick={handleGenerate} disabled={loading} className="flex items-center space-x-1 text-sm text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 font-medium transition-colors">
                <span className="material-symbols-outlined text-base">refresh</span>
                <span>Regenerate</span>
              </button>
            </div>

            {/* Ideas */}
            {results.ideas?.items?.length > 0 && (
              <ResultSection title={results.ideas.title} icon={results.ideas.icon}>
                <div className="space-y-4">
                  {results.ideas.items.map((item, idx) => (
                    <div key={idx} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-100 dark:border-gray-600 hover:shadow-md transition-shadow" style={{ animationDelay: `${idx * 100}ms` }}>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                          <span className={`flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br ${gradient} text-white text-xs font-bold flex items-center justify-center`}>{idx + 1}</span>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-800 dark:text-gray-100 text-sm">{item.title}</h4>
                            {item.body && <p className="text-xs text-gray-600 dark:text-gray-400 mt-1.5 leading-relaxed">{item.body}</p>}
                            {item.note && <p className="text-xs text-teal-600 dark:text-teal-400 mt-2 italic">Why: {item.note}</p>}
                          </div>
                        </div>
                        <CopyButton text={`${item.title}\n${item.body || ""}`} />
                      </div>
                    </div>
                  ))}
                </div>
              </ResultSection>
            )}

            {/* Headlines / Captions */}
            {results.headlines?.items?.length > 0 && (
              <ResultSection title={results.headlines.title} icon={results.headlines.icon}>
                <div className="space-y-3">
                  {results.headlines.items.map((item, idx) => (
                    <div key={idx} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-100 dark:border-gray-600">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          {item.title && <p className="font-medium text-gray-800 dark:text-gray-100 text-sm">{String(item.title)}</p>}
                          {item.body && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{String(item.body)}</p>}
                          {!item.title && !item.body && <p className="text-sm text-gray-600 dark:text-gray-300">{JSON.stringify(item)}</p>}
                        </div>
                        <CopyButton text={`${item.title || ""}\n${item.body || ""}`} />
                      </div>
                    </div>
                  ))}
                </div>
              </ResultSection>
            )}

            {/* Hashtags / Tags */}
            {results.hashtags?.tags?.length > 0 && (
              <ResultSection title={results.hashtags.title} icon={results.hashtags.icon}>
                <div className="flex flex-wrap gap-2">
                  {results.hashtags.tags.map((tag, idx) => (
                    <span key={idx} className="px-3 py-1.5 bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 rounded-full text-xs font-medium cursor-pointer hover:bg-teal-100 dark:hover:bg-teal-900/50 transition-colors"
                      onClick={() => { navigator.clipboard.writeText(tag); toast.success(`Copied: ${tag}`); }}>
                      {tag}
                    </span>
                  ))}
                </div>
                <button
                  className="mt-3 text-xs text-teal-600 dark:text-teal-400 hover:underline flex items-center space-x-1"
                  onClick={() => { navigator.clipboard.writeText(results.hashtags.tags.join(" ")); toast.success("All hashtags copied!"); }}>
                  <span className="material-symbols-outlined text-sm">content_copy</span>
                  <span>Copy All</span>
                </button>
              </ResultSection>
            )}

            {/* Features / Tips (list) */}
            {results.features?.list?.length > 0 && (
              <ResultSection title={results.features.title} icon={results.features.icon}>
                <ul className="space-y-2">
                  {results.features.list.map((item, idx) => (
                    <li key={idx} className="flex items-start space-x-3 p-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <span className="flex-shrink-0 w-5 h-5 bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-400 rounded-full flex items-center justify-center text-[10px] font-bold">{idx + 1}</span>
                      <span className="text-sm text-gray-700 dark:text-gray-300">{item}</span>
                    </li>
                  ))}
                </ul>
              </ResultSection>
            )}

            {/* Boosting (could be items or list) */}
            {results.boosting?.items?.length > 0 && (
              <ResultSection title={results.boosting.title} icon={results.boosting.icon}>
                <div className="space-y-3">
                  {results.boosting.items.map((item, idx) => (
                    <div key={idx} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-100 dark:border-gray-600">
                      <p className="font-medium text-gray-800 dark:text-gray-100 text-sm">{item.title}</p>
                      {item.body && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{item.body}</p>}
                    </div>
                  ))}
                </div>
              </ResultSection>
            )}
            {results.boosting?.list?.length > 0 && (
              <ResultSection title={results.boosting.title} icon={results.boosting.icon}>
                <ul className="space-y-2">
                  {results.boosting.list.map((item, idx) => (
                    <li key={idx} className="flex items-start space-x-3 p-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <span className="flex-shrink-0 w-5 h-5 bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-400 rounded-full flex items-center justify-center text-[10px] font-bold">{idx + 1}</span>
                      <span className="text-sm text-gray-700 dark:text-gray-300">{item}</span>
                    </li>
                  ))}
                </ul>
              </ResultSection>
            )}

            {/* Timing */}
            {results.timing?.list?.length > 0 && (
              <ResultSection title={results.timing.title} icon={results.timing.icon}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {results.timing.list.map((time, idx) => (
                    <div key={idx} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                      <span className="w-8 h-8 bg-teal-100 dark:bg-teal-900/40 rounded-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-teal-600 dark:text-teal-400 text-sm">schedule</span>
                      </span>
                      <span className="text-sm text-gray-700 dark:text-gray-300">{time}</span>
                    </div>
                  ))}
                </div>
              </ResultSection>
            )}
          </div>
        )}

        {/* Loading Overlay */}
        {loading && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm">
            <div className="flex flex-col items-center p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 max-w-sm">
              <img
                src="/MAYA_Panda_withoutBackground_withBase.png"
                alt="MAYA mascot"
                className="w-32 h-32 mb-4 animate-bounce"
                style={{ animationDuration: "2s" }}
              />
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-3 animate-pulse`}>
                <span className="material-symbols-outlined text-white text-2xl">{icon}</span>
              </div>
              <p className="text-gray-800 dark:text-gray-100 font-semibold mb-1">Generating your content...</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">MAYA is crafting personalized recommendations for you</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function ResultSection({ title, icon, children }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 animate-[fadeIn_0.5s_ease-out]">
      <div className="flex items-center space-x-2 mb-4">
        <span className="material-symbols-outlined text-teal-600 dark:text-teal-400 text-lg">{icon}</span>
        <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100">{title}</h3>
      </div>
      {children}
    </div>
  );
}

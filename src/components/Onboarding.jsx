import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const steps = [
  {
    icon: "waving_hand",
    title: "Welcome to MAYA!",
    description: "Your AI-powered social media strategist. MAYA helps you generate content, analyze performance, and grow your audience across every platform.",
    color: "from-teal-500 to-teal-700",
  },
  {
    icon: "link",
    title: "Connect Your Accounts",
    description: "Link your Instagram, Facebook, TikTok, and other social accounts to unlock personalized analytics and AI-driven recommendations. (Coming soon!)",
    color: "from-indigo-500 to-purple-600",
  },
  {
    icon: "auto_awesome",
    title: "Start Creating",
    description: "Use the AI Content Lab to generate optimized posts, or ask MAYA AI for personalized strategies. Your social media growth starts now.",
    color: "from-teal-500 to-cyan-500",
  },
];

export default function Onboarding({ onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Mark onboarding complete
      localStorage.setItem("maya-onboarded", "true");
      onComplete();
    }
  };

  const handleSkip = () => {
    localStorage.setItem("maya-onboarded", "true");
    onComplete();
  };

  const step = steps[currentStep];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/70 backdrop-blur-sm px-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-8 relative overflow-hidden">
        {/* Progress dots */}
        <div className="flex items-center justify-center space-x-2 mb-8">
          {steps.map((_, idx) => (
            <div
              key={idx}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === currentStep
                  ? "w-8 bg-teal-600"
                  : idx < currentStep
                  ? "w-2 bg-teal-400"
                  : "w-2 bg-gray-200 dark:bg-gray-600"
              }`}
            />
          ))}
        </div>

        {/* Icon */}
        <div className={`w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg`}>
          <span className="material-symbols-outlined text-white text-4xl">{step.icon}</span>
        </div>

        {/* Content */}
        <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-gray-100 mb-3">
          {step.title}
        </h2>
        <p className="text-center text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
          {step.description}
        </p>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <button
            onClick={handleSkip}
            className="text-sm text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            Skip
          </button>

          <button
            onClick={handleNext}
            className="px-6 py-2.5 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors flex items-center space-x-1"
          >
            <span>{currentStep === steps.length - 1 ? "Get Started" : "Next"}</span>
            <span className="material-symbols-outlined text-lg">
              {currentStep === steps.length - 1 ? "rocket_launch" : "arrow_forward"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

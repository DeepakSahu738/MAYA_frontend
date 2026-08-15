import React from "react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900 px-4 pt-16">
      <div className="text-center max-w-md">
        {/* Big 404 */}
        <h1 className="text-8xl font-bold text-teal-600 dark:text-teal-400 mb-2">404</h1>

        {/* Illustration */}
        <div className="w-32 h-32 mx-auto mb-6 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
          <span className="material-symbols-outlined text-6xl text-gray-400 dark:text-gray-500">explore_off</span>
        </div>

        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
          Page Not Found
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-8">
          Oops! The page you're looking for doesn't exist or has been moved. Let's get you back on track.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/">
            <button className="px-6 py-3 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 transition-colors">
              Go Home
            </button>
          </Link>
          <Link to="/chat">
            <button className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              Ask MAYA AI
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

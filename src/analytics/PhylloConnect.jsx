import React, { useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "react-toastify";
import { useCreator } from "./CreatorContext";
import SyncStatusScreen from "../components/SyncStatusScreen";
import { FaInstagram } from "react-icons/fa";

const API_BASE = "https://maya-backend-service-326007673689.asia-southeast1.run.app";

export default function PhylloConnectButton({ className = "", children, variant = "button" }) {
  const { authState, addConnectedAccount } = useCreator();
  const [connecting, setConnecting] = useState(false);
  const [syncingAccount, setSyncingAccount] = useState(null); // { creatorId, platform, username }
  const [showGuide, setShowGuide] = useState(false);

  // Button click → show the Instagram guidance modal first
  const handleButtonClick = () => {
    if (!authState.isLoggedIn) {
      toast.error("Please log in to connect your account.");
      return;
    }
    setShowGuide(true);
  };

  // "Continue" from the modal → launch the Phyllo SDK
  const proceedFromGuide = () => {
    setShowGuide(false);
    handleConnect();
  };

  // Cancel (X or click outside) → just close, do NOT open Phyllo
  const cancelGuide = () => {
    setShowGuide(false);
  };

  const handleConnect = async () => {
    if (!authState.isLoggedIn) {
      toast.error("Please log in to connect your account.");
      return;
    }

    setConnecting(true);

    try {
      // Step 1: Get SDK token from backend
      console.log("Phyllo: Initiating with", { userId: authState.userId, email: authState.email, tokenExists: !!authState.token });
      
      const response = await fetch(`${API_BASE}/api/phyllo/connect`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authState.token}`,
        },
        body: JSON.stringify({
          userId: authState.userId,
          userName: authState.email || `user-${authState.userId}`,
        }),
      });

      console.log("Phyllo: Backend response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Phyllo: Backend error:", errorText);
        throw new Error(`Backend returned ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log("Phyllo: Got SDK config:", { phylloUserId: data.phylloUserId, environment: data.environment, tokenLength: data.sdkToken?.length });
      
      const { phylloUserId, sdkToken, environment } = data;

      // Step 2: Initialize Phyllo SDK
      if (!window.PhylloConnect) {
        console.error("Phyllo: window.PhylloConnect is undefined — SDK script not loaded");
        toast.error("Phyllo SDK not loaded. Please refresh the page.");
        setConnecting(false);
        return;
      }

      console.log("Phyllo: SDK available, initializing...");

      const config = {
        clientDisplayName: "Maya Manage",
        environment: environment || "staging",
        userId: phylloUserId,
        token: sdkToken,
      };

      console.log("Phyllo: Config:", { ...config, token: config.token?.slice(0, 20) + "..." });

      const phylloConnect = window.PhylloConnect.initialize(config);
      console.log("Phyllo: Initialized, opening widget...");

      // Step 3: Listen for events
      phylloConnect.on("accountConnected", async (accountId, workPlatformId, userId) => {
        try {
          const storeResponse = await fetch(`${API_BASE}/api/phyllo/account-connected`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authState.token}`,
            },
            body: JSON.stringify({
              userId: authState.userId,
              phylloUserId: userId,
              accountId: accountId,
              workPlatformId: workPlatformId,
            }),
          });

          const data = await storeResponse.json();

          if (storeResponse.ok) {
            // Add to creator context
            addConnectedAccount({
              creatorId: data.creatorId,
              platform: data.platform,
              username: data.username,
            });
            // Show sync status screen
            setSyncingAccount({
              creatorId: data.creatorId,
              platform: data.platform,
              username: data.username,
            });
          } else if (storeResponse.status === 409) {
            toast.error("This account is already connected to another Maya user. They must disconnect it first.");
          } else if (storeResponse.status === 403) {
            toast.error("Authorization failed. Please try logging in again.");
          } else {
            toast.error(data.message || "Failed to store account connection.");
          }
        } catch (err) {
          console.error("Error storing connected account:", err);
          toast.error("Something went wrong while saving the connection.");
        }
      });

      phylloConnect.on("accountDisconnected", (accountId, workPlatformId, userId) => {
        console.log("Account disconnected:", accountId);
        toast.info("Account disconnected.");
      });

      phylloConnect.on("tokenExpired", (userId) => {
        console.log("Phyllo token expired for:", userId);
        toast.warning("Session expired. Please try connecting again.");
      });

      phylloConnect.on("exit", (reason, userId) => {
        console.log("Phyllo SDK closed:", reason);
        setConnecting(false);
      });

      // Step 4: Open the widget
      phylloConnect.open();
    } catch (error) {
      console.error("Phyllo connect error:", error);
      toast.error("Failed to start account connection. Please try again.");
      setConnecting(false);
    }
  };

  return (
    <>
      {variant === "custom" ? (
        // Caller supplies its own markup (e.g. sidebar row). className fully controls styling.
        <button onClick={handleButtonClick} disabled={connecting} className={className}>
          {children ?? (connecting ? "Connecting..." : "Connect Social Account")}
        </button>
      ) : (
        <button
          onClick={handleButtonClick}
          disabled={connecting}
          className={`flex items-center space-x-2 px-4 py-2.5 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${className}`}
        >
          {connecting ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Connecting...</span>
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-lg">link</span>
              <span>Connect Social Account</span>
            </>
          )}
        </button>
      )}

      {/* Instagram guidance modal — portaled to body so it always covers the full screen.
          Cancel (X / outside) closes without connecting; only "Continue" opens Phyllo. */}
      {showGuide && createPortal(
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={cancelGuide}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="relative px-6 pt-6 pb-4 text-center border-b border-gray-100 dark:border-gray-700">
              <button
                onClick={cancelGuide}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Cancel"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
              <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center shadow-lg">
                <FaInstagram className="text-white text-3xl" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Connecting Instagram?</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Instagram must be linked to a Facebook Page before it can connect.
                <span className="block mt-1 text-xs text-gray-400 dark:text-gray-500">Connecting a different platform? You can skip this.</span>
              </p>
            </div>

            {/* Steps */}
            <div className="px-6 py-5">
              <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
                How to link Instagram to a Facebook Page
              </p>
              <ol className="space-y-3">
                {[
                  { t: "Create a Facebook Page", d: "In Facebook, create a Page if you don't have one already." },
                  { t: "Open Page Settings", d: "Go to your Page and open its Settings." },
                  { t: "Find “Linked accounts”", d: "Look for the Linked accounts (or Instagram) section in Settings." },
                  { t: "Link your Instagram", d: "Connect your Instagram account there, then come back here." },
                ].map((step, i) => (
                  <li key={i} className="flex items-start space-x-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-teal-100 dark:bg-teal-500/20 text-teal-700 dark:text-teal-300 text-xs font-bold flex items-center justify-center mt-0.5">
                      {i + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{step.t}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 leading-snug">{step.d}</p>
                    </div>
                  </li>
                ))}
              </ol>

              <div className="mt-4 flex items-start space-x-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/50">
                <span className="material-symbols-outlined text-[18px] text-amber-500 flex-shrink-0">lightbulb</span>
                <p className="text-xs text-amber-700 dark:text-amber-300 leading-snug">
                  Make sure your Instagram is a <strong>Business</strong> or <strong>Creator</strong> account — personal accounts can't be linked.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 pb-6 flex space-x-2">
              <button
                onClick={cancelGuide}
                className="px-4 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={proceedFromGuide}
                className="flex-1 py-2.5 bg-teal-600 text-white text-sm font-semibold rounded-lg hover:bg-teal-700 transition-colors inline-flex items-center justify-center space-x-2"
              >
                <span className="material-symbols-outlined text-lg">link</span>
                <span>Continue to connect</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Sync Status Overlay */}
      {syncingAccount && (
        <SyncStatusScreen
          creatorId={syncingAccount.creatorId}
          platform={syncingAccount.platform}
          username={syncingAccount.username}
          onComplete={() => setSyncingAccount(null)}
        />
      )}
    </>
  );
}

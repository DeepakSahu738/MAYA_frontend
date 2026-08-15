import React, { useState } from "react";
import { toast } from "react-toastify";
import { useCreator } from "./CreatorContext";
import SyncStatusScreen from "../components/SyncStatusScreen";

const API_BASE = "https://maya-backend-service-326007673689.us-central1.run.app";

export default function PhylloConnectButton({ className = "" }) {
  const { authState, addConnectedAccount } = useCreator();
  const [connecting, setConnecting] = useState(false);
  const [syncingAccount, setSyncingAccount] = useState(null); // { creatorId, platform, username }

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
      <button
        onClick={handleConnect}
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

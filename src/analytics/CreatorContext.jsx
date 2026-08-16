import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import axios from "axios";
import { getUserIdFromToken, getRoleFromToken, isJwtExpired } from "../tokenDecoder/detokenizer";

const CreatorContext = createContext();

const API_BASE = "https://maya-backend-service-326007673689.asia-southeast1.run.app";

// Helper to get auth state from sessionStorage
function getAuthState() {
  const token = sessionStorage.getItem("token");
  if (!token) return { isLoggedIn: false, token: null, userId: null, email: null, role: null };

  const role = getRoleFromToken(token);
  if (isJwtExpired(token)) return { isLoggedIn: false, token: null, userId: null, email: null, role: null };

  const userId = getUserIdFromToken(token);

  // Get email (sub claim) from JWT
  let email = null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    email = payload.sub || payload.email || null;
  } catch {}

  return { isLoggedIn: true, token, userId, email, role };
}

export function CreatorProvider({ children }) {
  const [demoCreators, setDemoCreators] = useState([]);
  const [connectedAccounts, setConnectedAccounts] = useState([]);
  const [selectedCreator, setSelectedCreator] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authState, setAuthState] = useState(getAuthState);
  const [syncingCreatorId, setSyncingCreatorId] = useState(null);

  // Refresh auth state (call after login/logout)
  const refreshAuth = useCallback(() => {
    const newAuth = getAuthState();
    setAuthState(newAuth);
    // Clear connected accounts if logged out
    if (!newAuth.isLoggedIn) {
      setConnectedAccounts([]);
      setSelectedCreator(null);
    }
  }, []);

  // Fetch demo creators (always fetch for availability, but don't auto-select for logged-in users)
  useEffect(() => {
    const fetchDemoCreators = async () => {
      try {
        const response = await axios.get(`${API_BASE}/api/analytics/creators`);
        const demos = response.data.map((c) => ({ ...c, isDemo: true }));
        setDemoCreators(demos);
      } catch (error) {
        console.error("Failed to fetch demo creators:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDemoCreators();
  }, []);

  // Fetch connected accounts (only when logged in)
  const fetchConnectedAccounts = useCallback(async () => {
    if (!authState.isLoggedIn || !authState.userId) return;

    try {
      const response = await axios.get(
        `${API_BASE}/api/phyllo/accounts?userId=${authState.userId}`,
        { headers: { Authorization: `Bearer ${authState.token}` } }
      );
      const accounts = response.data
        .filter((acc) => acc.status === "CONNECTED")
        .map((acc) => ({
          id: acc.creatorId,
          username: acc.username,
          niche: acc.platform,
          platform: acc.platform,
          status: acc.status,
          connectedAt: acc.connectedAt,
          accountId: acc.id,
          followerCount: acc.followerCount || null,
          followingCount: acc.followingCount || null,
          mediaCount: acc.mediaCount || null,
          profilePictureUrl: acc.profilePictureUrl || null,
          isVerified: acc.isVerified || false,
          isDemo: false,
      }));
      setConnectedAccounts(accounts);
      // Auto-select first connected account if nothing is selected or a demo is selected
      if (accounts.length > 0 && (!selectedCreator || selectedCreator.isDemo)) {
        setSelectedCreator(accounts[0]);
      }
    } catch (error) {
      console.error("Failed to fetch connected accounts:", error);
      setConnectedAccounts([]);
    }
  }, [authState.isLoggedIn, authState.userId, authState.token]);

  useEffect(() => {
    fetchConnectedAccounts();
  }, [fetchConnectedAccounts]);

  // Re-check auth when sessionStorage might have changed
  useEffect(() => {
    const interval = setInterval(() => {
      const newAuth = getAuthState();
      if (newAuth.isLoggedIn !== authState.isLoggedIn || newAuth.userId !== authState.userId) {
        setAuthState(newAuth);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [authState.isLoggedIn, authState.userId]);

  // Combined creators list
  const allCreators = [...connectedAccounts, ...demoCreators];

  // Polling for sync status
  useEffect(() => {
    if (!syncingCreatorId) return;

    let attempts = 0;
    const maxAttempts = 12; // 60 seconds at 5s intervals

    const pollInterval = setInterval(async () => {
      attempts++;
      try {
        const response = await axios.get(`${API_BASE}/api/analytics/dashboard/${syncingCreatorId}`);
        if (response.data.healthScore !== null && response.data.healthScore.score !== null) {
          // Data is ready
          setSyncingCreatorId(null);
          clearInterval(pollInterval);
        }
      } catch {}

      if (attempts >= maxAttempts) {
        setSyncingCreatorId(null);
        clearInterval(pollInterval);
      }
    }, 5000);

    return () => clearInterval(pollInterval);
  }, [syncingCreatorId]);

  // Add a newly connected account to the list
  const addConnectedAccount = useCallback((account) => {
    const newAccount = {
      id: account.creatorId,
      username: account.username,
      niche: account.platform,
      platform: account.platform,
      status: "CONNECTED",
      connectedAt: new Date().toISOString(),
      isDemo: false,
    };
    setConnectedAccounts((prev) => [...prev, newAccount]);
    setSelectedCreator(newAccount);
  }, []);

  return (
    <CreatorContext.Provider
      value={{
        demoCreators,
        connectedAccounts,
        allCreators,
        selectedCreator,
        setSelectedCreator,
        loading,
        authState,
        refreshAuth,
        fetchConnectedAccounts,
        addConnectedAccount,
        syncingCreatorId,
      }}
    >
      {children}
    </CreatorContext.Provider>
  );
}

export function useCreator() {
  const context = useContext(CreatorContext);
  if (!context) {
    throw new Error("useCreator must be used within a CreatorProvider");
  }
  return context;
}

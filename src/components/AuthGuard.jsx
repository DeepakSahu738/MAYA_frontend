import React from "react";
import { Navigate } from "react-router-dom";
import { getRoleFromToken, isJwtExpired } from "../tokenDecoder/detokenizer";

export default function AuthGuard({ children }) {
  const token = sessionStorage.getItem("token");

  if (!token) return <Navigate to="/login" replace />;

  if (isJwtExpired(token)) {
    sessionStorage.removeItem("token");
    return <Navigate to="/login" replace />;
  }

  const role = getRoleFromToken(token);
  if (role !== "USER") return <Navigate to="/login" replace />;

  return children;
}

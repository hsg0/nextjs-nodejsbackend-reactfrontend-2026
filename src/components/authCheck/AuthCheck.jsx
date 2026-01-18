// nextjs-reactjs-practice-2026/src/components/authCheck/AuthCheck.jsx

"use client";

import React from "react";
import useAuthCheck from "../../checkAuth/authCheck.js";

export default function AuthCheck({ children }) {
  const { loading, isAuthenticated } = useAuthCheck();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0B10] text-white flex items-center justify-center">
        <p className="text-white/80 text-sm">Checking authentication…</p>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return <>{children}</>;
}

"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import useAuthCheck from "@/checkAuth/authCheck.js";

export default function Day23Page() {
  const { loading, isAuthenticated, user } = useAuthCheck();

  useEffect(() => {
    console.log("[Day23Page] loaded");
    console.log("[Day23Page] loading:", loading);
    console.log("[Day23Page] isAuthenticated:", isAuthenticated);
    console.log("[Day23Page] user:", user);
  }, [loading, isAuthenticated, user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        Loading…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-3xl font-extrabold">☠️🔥 Day 23</h1>
      <p className="text-white/70 mt-2">
        Today: auto-generate a React UI from PDF AcroForm fields using <b>pdf-lib</b>
      </p>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1 */}
        <div className="rounded-xl bg-white/5 p-5 border border-white/10">
          <h2 className="text-xl font-bold">1) Open PDF + Auto-Generate Fields</h2>
          <p className="text-white/70 mt-2">
            We’ll load <code>labs_temp.pdf</code>, read its AcroForm fields from the backend,
            and auto-render inputs for them.
          </p>

          <Link
            href="/dashboard/day23/openpdffile"
            className="inline-block mt-4 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 font-bold"
            onClick={() => console.log("[Day23Page] clicked: openpdffile")}
          >
            Open AutoGen UI →
          </Link>
        </div>

        {/* Card 2 */}
        <div className="rounded-xl bg-white/5 p-5 border border-white/10">
          <h2 className="text-xl font-bold">2) Debug Info</h2>
          <p className="text-white/70 mt-2">
            Logged-in doctor/web user:
          </p>

          <div className="mt-3 rounded-lg bg-black/40 p-3 border border-white/10">
            <div className="text-sm text-white/80">
              <div><b>webUserId:</b> {user?.webUserId || "(none)"}</div>
              <div><b>name:</b> {user?.name || user?.fullName || "(none)"}</div>
              <div><b>email:</b> {user?.email || "(none)"}</div>
            </div>
          </div>

          <p className="text-white/60 mt-3 text-sm">
            We’ll use this to auto-fill “Doctor Name” and “Doctor Email”
            once we identify the correct field names inside the PDF.
          </p>
        </div>
      </div>
    </div>
  );
}
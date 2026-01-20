"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import useAuthCheck from "@/checkAuth/authCheck.js";

export default function Day20EntryPage() {
  const router = useRouter();
  const { isAuthenticated, loading, user } = useAuthCheck();

  const [adpath, setAdpath] = useState("ax01");
  const [error, setError] = useState("");

  useEffect(() => {
    console.log("[Day20EntryPage] loaded");
  }, []);

  const safeEmail = useMemo(() => user?.email || "", [user]);

  const goNext = () => {
    setError("");

    const cleaned = (adpath || "").trim();

    if (!cleaned) {
      setError("Please enter an ad path (example: ax01)");
      return;
    }

    // URL-safe
    const encoded = encodeURIComponent(cleaned);

    console.log("[Day20EntryPage] navigating to:", encoded);

    const qp = new URLSearchParams();
    if (safeEmail) qp.set("email", safeEmail);

    router.push(`/dashboard/day20/${encoded}?${qp.toString()}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        <div className="text-center">
          <p className="text-lg font-semibold">Loading…</p>
          <p className="text-sm text-white/60 mt-1">Checking auth</p>
        </div>
      </div>
    );
  }

  // authCheck already redirects if not authed, but keep safe fallback
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        <p>Redirecting…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white px-5 py-8">
      {/* SkullFire Header */}
      <div className="max-w-3xl mx-auto">
        <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-zinc-950 to-black shadow-2xl overflow-hidden">
          <div className="p-6 sm:p-8">
            {/* Top row */}
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs tracking-widest text-white/60">DASHBOARD • DAY 20</p>
                <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold">
                  ☠️🔥 Axios Practice Lab
                </h1>
                <p className="mt-2 text-sm text-white/70">
                  We’re building CRUD (Create / Read / Update / Delete) using Axios + your protected backend.
                </p>
              </div>

              <div className="hidden sm:flex flex-col items-end">
                <p className="text-xs text-white/60">Signed in</p>
                <p className="text-sm font-semibold">{user?.username || "User"}</p>
                <p className="text-xs text-white/60">{user?.email || ""}</p>
              </div>
            </div>

            {/* Divider */}
            <div className="my-6 h-px bg-white/10" />

            {/* Input card */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-5">
              <p className="text-sm font-semibold">Enter your “adpath”</p>
              <p className="text-xs text-white/60 mt-1">
                This becomes your route param: <span className="text-white/80">/dashboard/day20/[adpath]</span>
              </p>

              <div className="mt-4 flex flex-col sm:flex-row gap-3">
                <input
                  value={adpath}
                  onChange={(e) => setAdpath(e.target.value)}
                  placeholder="ex: ax01"
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white placeholder:text-white/40 outline-none focus:border-orange-500/60"
                />

                <button
                  onClick={goNext}
                  className="rounded-xl px-5 py-3 font-bold bg-gradient-to-r from-orange-500 to-red-600 hover:opacity-95 active:scale-[0.99] transition"
                >
                  Enter Lab →
                </button>
              </div>

              {error && (
                <p className="mt-3 text-sm text-red-400">
                  {error}
                </p>
              )}

              <div className="mt-5 flex flex-wrap gap-2">
                <QuickTag label="ax01" onClick={() => setAdpath("ax01")} />
                <QuickTag label="users-crud" onClick={() => setAdpath("users-crud")} />
                <QuickTag label="seed-test" onClick={() => setAdpath("seed-test")} />
              </div>
            </div>

            {/* Footer hint */}
            <div className="mt-6 text-xs text-white/50">
              Next page: <span className="text-white/70">day20/[adpath]/page.jsx</span>
              <span className="mx-2">•</span>
              Auth: <span className="text-white/70">useAuthCheck()</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickTag({ label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-xs rounded-full border border-white/10 bg-white/5 px-3 py-1 hover:bg-white/10"
    >
      {label}
    </button>
  );
}
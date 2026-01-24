// src/app/(privateroutes)/dashboard/day24/page.jsx
"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import useAuthCheck from "@/checkAuth/authCheck.js";

function SkullCard({ title, subtitle, children }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-red-600/30 bg-zinc-950 p-6 shadow-[0_0_0_1px_rgba(255,0,0,0.08),0_20px_60px_rgba(0,0,0,0.6)]">
      {/* glow */}
      <div className="pointer-events-none absolute -inset-10 opacity-30 blur-3xl">
        <div className="h-40 w-40 rounded-full bg-red-600/40" />
        <div className="mt-10 h-40 w-40 rounded-full bg-orange-500/30" />
      </div>

      <div className="relative">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              {title}
            </h1>
            {subtitle ? (
              <p className="mt-2 text-sm md:text-base text-white/70">
                {subtitle}
              </p>
            ) : null}
          </div>
          <div className="text-3xl md:text-4xl">☠️🔥</div>
        </div>

        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}

function EnterButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="group relative w-full rounded-2xl bg-gradient-to-r from-red-600 to-orange-500 px-6 py-4 font-extrabold tracking-wide text-black shadow-lg transition hover:brightness-110 active:scale-[0.99]"
    >
      <span className="absolute inset-0 rounded-2xl ring-2 ring-red-500/40 group-hover:ring-red-400/70" />
      <span className="relative flex items-center justify-center gap-3 text-lg md:text-xl">
        <span className="inline-block animate-pulse">ENTER</span>
        <span className="text-2xl">📚</span>
      </span>
      <div className="relative mt-1 text-center text-xs md:text-sm font-semibold text-black/80">
        Press to enter the SkullFire Library
      </div>
    </button>
  );
}

export default function Day24EntryPage() {
  const router = useRouter();
  const { loading, user } = useAuthCheck();

  useEffect(() => {
    console.log("[Day24EntryPage] loaded");
  }, []);

  const handleEnter = () => {
    console.log("➡️ [Day24EntryPage] ENTER pressed");
    router.push("/dashboard/day24/bookstore");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        Loading…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,0,0,0.12),transparent_55%),radial-gradient(circle_at_bottom,rgba(255,140,0,0.10),transparent_55%)]" />
      <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:40px_40px]" />

      <div className="relative mx-auto max-w-3xl px-6 py-10">
        <SkullCard
          title="SkullFire Library — Day 24"
          subtitle="A simple Bookstore CRUD practice project. Add, view, update, and delete books stored in MongoDB."
        >
          <div className="rounded-xl border border-white/10 bg-black/40 p-4">
            <div className="text-sm text-white/70">Signed in as</div>
            <div className="mt-1 font-bold">
              {user?.email || "unknown@email"}{" "}
              <span className="text-white/50 font-normal">
                ({user?.name || user?.fullName || "SkullFire Member"})
              </span>
            </div>
          </div>

          <div className="mt-6">
            <EnterButton onClick={handleEnter} />
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
            <div className="rounded-xl border border-white/10 bg-black/40 p-3">
              <div className="font-bold">📖 Browse</div>
              <div className="text-white/60 mt-1">View books in the store.</div>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/40 p-3">
              <div className="font-bold">✍️ Manage</div>
              <div className="text-white/60 mt-1">Add / edit / delete books.</div>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/40 p-3">
              <div className="font-bold">🧠 Practice</div>
              <div className="text-white/60 mt-1">Learn CRUD end-to-end.</div>
            </div>
          </div>

          <div className="mt-6 text-xs text-white/50">
            Tip: later we’ll wire this to real backend endpoints and MongoDB models after the UI is finalized.
          </div>
        </SkullCard>
      </div>
    </div>
  );
}
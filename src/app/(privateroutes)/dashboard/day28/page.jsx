"use client";

// /src/app/(privateroutes)/dashboard/day28/page.jsx

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import useAuthCheck from "@/checkAuth/authCheck";
import { toast } from "react-toastify";

/* ------------------ UI helpers ------------------ */

function Card({ title, subtitle, children }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/40 p-6 shadow-xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-extrabold text-white">{title}</h2>
          {subtitle ? <p className="mt-1 text-sm text-white/60">{subtitle}</p> : null}
        </div>
      </div>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function NavButton({ label, desc, onClick, icon = "➡️" }) {
  return (
    <button
      onClick={onClick}
      className="group w-full rounded-2xl border border-white/10 bg-white/5 p-5 text-left transition hover:bg-white/10 hover:border-white/20 active:scale-[0.99]"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-600/20 text-purple-200">
          <span className="text-lg">{icon}</span>
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between gap-3">
            <div className="text-base font-extrabold text-white">{label}</div>
            <div className="text-xs font-bold text-white/50 group-hover:text-white/70">
              open
            </div>
          </div>
          <div className="mt-1 text-sm text-white/60">{desc}</div>
        </div>
      </div>
    </button>
  );
}

/* ------------------ page ------------------ */

export default function Day28EntryPage() {
  const router = useRouter();
  const { loading, isAuthenticated, user } = useAuthCheck();

  useEffect(() => {
    console.log("[Day28EntryPage] mounted");
  }, []);

  useEffect(() => {
    console.log("[Day28EntryPage] auth state:", { loading, isAuthenticated, user });
  }, [loading, isAuthenticated, user]);

  const go = (path) => {
    console.log("[Day28EntryPage] navigating to:", path);
    toast.info(`Opening: ${path}`, { toastId: `nav-${path}` });
    router.push(path);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-white/80 font-bold">Loading…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* top glow */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-purple-700/20 via-purple-700/5 to-transparent" />

      <div className="relative mx-auto w-full max-w-6xl px-6 py-10">
        {/* header */}
        <div className="flex flex-col gap-3">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2">
            <span className="text-lg">☠️🔥</span>
            <span className="text-sm font-extrabold text-white/80">
              SkullFire Labs
            </span>
            <span className="text-sm font-extrabold text-purple-200">
              Day 28
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Day 28 Entry Page
          </h1>

          <p className="text-white/60 max-w-2xl">
            This is the main Day 28 hub. Use the buttons below to jump into each
            section.
          </p>
        </div>

        {/* main grid */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* nav */}
          <div className="lg:col-span-2">
            <Card
              title="Navigation"
              subtitle="Routes from this entry point: /dashboard/day28/*"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <NavButton
                  label="Dashboard"
                  desc="Go to the Day 28 dashboard page."
                  icon="📊"
                  onClick={() => go("/dashboard/day28/dashboard")}
                />

                <NavButton
                  label="Functions"
                  desc="Day 28 function utilities + practice."
                  icon="🧩"
                  onClick={() => go("/dashboard/day28/functions")}
                />

                <NavButton
                  label="Switch"
                  desc="Switch statement page / experiments."
                  icon="🔀"
                  onClick={() => go("/dashboard/day28/switch")}
                />

                <NavButton
                  label="Loops"
                  desc="Loops page / practice (for, while, map, etc)."
                  icon="🔁"
                  onClick={() => go("/dashboard/day28/loops")}
                />
              </div>

              <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
                <div className="font-extrabold text-white mb-1">
                  Folder check
                </div>
                <div>
                  Make sure each subfolder has a{" "}
                  <span className="text-white font-bold">page.jsx</span>:
                  <div className="mt-2 text-white/70 font-mono text-xs">
                    /day28/dashboard/page.jsx <br />
                    /day28/functions/page.jsx <br />
                    /day28/switch/page.jsx
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* info */}
          <div className="lg:col-span-1">
            <Card title="Session Info" subtitle="Quick auth snapshot.">
              <div className="space-y-3 text-sm">
                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <div className="text-white/60 font-bold">Authenticated</div>
                  <div className="text-white font-extrabold">
                    {isAuthenticated ? "✅ Yes" : "❌ No"}
                  </div>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <div className="text-white/60 font-bold">User</div>
                  <div className="text-white/80 break-all">
                    {user?.email ||
                      user?.webUserEmail ||
                      user?.webUserId ||
                      "—"}
                  </div>
                </div>

                <button
                  onClick={() => {
                    console.log("[Day28EntryPage] refresh clicked");
                    toast.info("Refreshing…", { toastId: "refresh-day28" });
                    router.refresh();
                  }}
                  className="w-full rounded-2xl border border-white/10 bg-purple-600/20 p-4 font-extrabold text-purple-100 transition hover:bg-purple-600/30"
                >
                  Refresh
                </button>

                <button
                  onClick={() => {
                    console.log("[Day28EntryPage] back clicked");
                    router.back();
                  }}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 p-4 font-extrabold text-white/80 transition hover:bg-white/10"
                >
                  Back
                </button>
              </div>
            </Card>
          </div>
        </div>

        <div className="mt-10 text-center text-xs text-white/40">
          Day 28 • Entry Point • /dashboard/day28
        </div>
      </div>
    </div>
  );
}
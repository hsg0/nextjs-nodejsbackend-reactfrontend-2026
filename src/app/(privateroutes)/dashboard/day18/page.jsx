"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-toastify";
import callBackend from "@/lib/callBackend";

function SkullFireMark({ className = "" }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" aria-hidden="true">
      <path d="M34 6c2 6-2 10-6 14-5 5-6 10-4 16 2 8 10 12 18 10 9-2 15-10 14-19-1-9-8-15-13-21 1 6-2 9-9 10z" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M16 37c0-9 7-16 16-16s16 7 16 16c0 6-3 11-8 14v6c0 2-2 4-4 4H28c-2 0-4-2-4-4v-6c-5-3-8-8-8-14z" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M26 39c0 2-1 3-3 3s-3-1-3-3 1-3 3-3 3 1 3 3zm18 0c0 2-1 3-3 3s-3-1-3-3 1-3 3-3 3 1 3 3z" fill="currentColor" />
      <path d="M24 50h16M28 50v6M36 50v6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

function makeForgeSessionId() {
  const rand = Math.random().toString(36).slice(2, 7);
  return `forge-${Date.now()}-${rand}`;
}

export default function Day18EntryPage() {
  const router = useRouter();
  const params = useParams(); // requested to use
  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    console.log("[Day18Entry] Mounted. useParams():", params);
  }, [params]);

  useEffect(() => {
    const load = async () => {
      try {
        console.log("[Day18Entry] Fetching userId/email...");
        const res = await callBackend.get("/web/api/day18/get-day18-data");
        console.log("[Day18Entry] get-day18-data:", res.data);

        if (!res?.data?.success) throw new Error(res?.data?.message || "Failed");
        setUserId(String(res.data.userId || ""));
        setEmail(String(res.data.email || ""));

        toast.success("✅ User loaded. Ready to forge.", { toastId: "day18-user-loaded" });
      } catch (err) {
        console.log("[Day18Entry] Failed to load user:", err?.response?.data || err?.message || err);
        toast.error("❌ Could not load user. Are you logged in?", { toastId: "day18-user-fail" });
      }
    };

    load();
  }, []);

  const enterForge = () => {
    if (!userId) {
      toast.error("User not loaded yet. Try again in a second.", { toastId: "day18-no-user" });
      return;
    }

    const session = makeForgeSessionId();
    const adprepare = `${userId}__${session}`; // ✅ includes MongoDB _id
    console.log("[Day18Entry] adprepare:", adprepare, "email:", email);

    toast.success("🔥 Forge created! Entering Day 18...", { toastId: "day18-enter" });

    const qp = new URLSearchParams();
    if (email) qp.set("email", email);

    router.push(`/dashboard/day18/${adprepare}?${qp.toString()}`);
  };

  return (
    <div className="relative">
      <section className="overflow-hidden rounded-3xl bg-white/5 ring-1 ring-white/10 shadow-2xl">
        <div className="relative px-6 sm:px-10 py-10 sm:py-12">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -top-24 -right-24 h-80 w-80 rounded-full blur-3xl opacity-25 bg-orange-500" />
            <div className="absolute top-16 -left-24 h-80 w-80 rounded-full blur-3xl opacity-15 bg-red-500" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-96 w-[70vw] rounded-full blur-3xl opacity-10 bg-amber-300" />
          </div>

          <div className="relative">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute -inset-2 rounded-3xl blur-lg opacity-70 bg-gradient-to-r from-orange-500 via-red-500 to-amber-400" />
                <div className="relative rounded-3xl bg-zinc-950 ring-1 ring-white/10 p-3">
                  <SkullFireMark className="h-9 w-9 text-orange-300" />
                </div>
              </div>

              <div>
                <div className="text-xs text-white/50">SkullFire • Day 18</div>
                <h1 className="text-2xl sm:text-3xl font-semibold text-white">AI Ad Generator Forge</h1>
                <div className="mt-1 text-xs text-white/45 break-all">
                  userId: <span className="text-white/60">{userId || "loading..."}</span>
                </div>
              </div>
            </div>

            <p className="mt-6 text-white/75 max-w-2xl leading-relaxed">
              You will create an ad using AI. You’ll need:
              <span className="text-white font-medium"> 1 product image</span> and
              <span className="text-white font-medium"> 1 actor image</span>.
              Then you’ll describe the ad style + what the actor should say.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <button
                type="button"
                onClick={enterForge}
                className={[
                  "inline-flex items-center justify-center",
                  "rounded-2xl px-6 py-3 text-sm font-semibold",
                  "bg-orange-500/20 hover:bg-orange-500/25",
                  "text-orange-200 ring-1 ring-orange-400/30",
                  "transition focus:outline-none focus:ring-2 focus:ring-orange-400/40",
                ].join(" ")}
              >
                Enter Forge →
              </button>

              <div className="text-xs text-white/45">
                Routes to <span className="text-white/60">/dashboard/day18/[adprepare]</span> using your MongoDB{" "}
                <span className="text-white/60">_id</span>.
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 sm:px-10 py-4 border-t border-white/10 bg-zinc-950/40">
          <div className="text-xs text-white/50">Tip: use high-resolution images for best output quality.</div>
        </div>
      </section>
    </div>
  );
}
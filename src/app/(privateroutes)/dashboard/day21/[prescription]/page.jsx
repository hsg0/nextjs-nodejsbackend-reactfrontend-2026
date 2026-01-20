"use client";

import React, { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import useAuthCheck from "@/checkAuth/authCheck.js";

export default function Day21HubPage() {
  const router = useRouter();
  const { loading } = useAuthCheck();
  const params = useParams();

  const prescription = params?.prescription; // this is your dynamic segment (likely userId)

  useEffect(() => {
    console.log("[Day21 Hub] loaded");
    console.log("[Day21 Hub] prescription param:", prescription);
  }, [prescription]);

  const go = (path) => {
    console.log("[Day21 Hub] go ->", path);
    router.push(path);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Loading…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white px-6 py-10">
      <div className="mx-auto w-full max-w-3xl">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
          <div className="flex items-center gap-3">
            <div className="text-3xl">☠️🔥</div>
            <div>
              <h1 className="text-2xl font-extrabold">SkullFire Hub</h1>
              <p className="text-white/60 mt-1">
                Choose what you want to send.
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-zinc-800 bg-black/40 p-4 text-sm text-white/70">
            Dynamic param <span className="text-white">[prescription]</span>:{" "}
            <span className="text-white">{prescription}</span>
          </div>

          <div className="mt-6 grid sm:grid-cols-2 gap-4">
            <button
              onClick={() => go(`/dashboard/day21/${prescription}/prescriptionreq`)}
              className="rounded-2xl border border-purple-500/40 bg-purple-600/20 hover:bg-purple-600/30 px-5 py-6 text-left"
            >
              <div className="text-lg font-extrabold">🧾 Send Prescription</div>
              <div className="text-white/60 mt-1">Create a prescription document draft.</div>
            </button>

            <button
              onClick={() => go(`/dashboard/day21/${prescription}/diagnosticreq`)}
              className="rounded-2xl border border-red-500/40 bg-red-600/10 hover:bg-red-600/20 px-5 py-6 text-left"
            >
              <div className="text-lg font-extrabold">🩻 Diagnostic Imaging Requisition</div>
              <div className="text-white/60 mt-1">Imaging request workflow.</div>
            </button>

            <button
              onClick={() => go(`/dashboard/day21/${prescription}/labreq`)}
              className="rounded-2xl border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 px-5 py-6 text-left"
            >
              <div className="text-lg font-extrabold">🧪 Laboratory (Lab) Requisition</div>
              <div className="text-white/60 mt-1">Lab test request workflow.</div>
            </button>

            <button
              onClick={() => go(`/dashboard/day21/${prescription}/specialreq`)}
              className="rounded-2xl border border-orange-500/30 bg-orange-600/10 hover:bg-orange-600/20 px-5 py-6 text-left"
            >
              <div className="text-lg font-extrabold">🧬 Specialized Test Requisition</div>
              <div className="text-white/60 mt-1">Special tests & notes.</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import useAuthCheck from "@/checkAuth/authCheck.js";

export default function Day21EntryPage() {

  const router = useRouter();
  const { loading, isAuthenticated, user } = useAuthCheck();

  const webUserId = user?.webUserId || "";

  useEffect(() => {
   console.log("[Day21 Entry] loaded");
  }, [loading, isAuthenticated, user, webUserId]);

  const sendEmailMailto = () => {
    
    console.log("[Day21 Entry] Send Email clicked");
    toast.warning("⚠️ You are entering SkullFire Labs.", { toastId: "skullfire-entry" });

    // For now: open blank compose (user chooses recipient)
    const subject = "SkullFire Labs — Day 21";
    const body = "Testing grounds email.\n\n— Sent from SkullFire Labs";

    const mailto = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    console.log("[Day21 Entry] mailto url:", mailto);

    window.location.href = mailto;
  };

  const enterHub = () => {
    console.log("[Day21 Entry] Enter Hub clicked");
    toast.warning("⚠️ You are entering SkullFire Labs.", { toastId: "skullfire-entry" });

    if (!webUserId) {
      console.log("[Day21 Entry] ❌ Missing user.webUserId - cannot route");
      toast.error("No webUserId found from authCheck().", { toastId: "no-webuserid" });
      return;
    }

    const dest = `/dashboard/day21/${webUserId}`;
    console.log("[Day21 Entry] routing to:", dest);
    router.push(dest);
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
        <div className="rounded-2xl border border-red-500/40 bg-zinc-950 p-6 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="text-3xl">☠️🔥</div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">
                SkullFire Labs — Day 21
              </h1>
              <p className="text-white/70 mt-1">
                Testing grounds: email + requisitions.
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-orange-500/30 bg-orange-500/10 p-4">
            <div className="font-bold text-orange-200">Warning</div>
            <div className="text-white/70 mt-1">
              This is a dev/test zone. Use test data only.
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <div className="text-sm text-white/60">
              Auth webUserId: <span className="text-white">{webUserId || "(missing)"}</span>
            </div>

            <div className="flex gap-3">
              <button
                onClick={sendEmailMailto}
                className="rounded-xl border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 px-5 py-3 font-bold"
              >
                Send Email (mailto)
              </button>

              <button
                onClick={enterHub}
                className="rounded-xl bg-purple-600 hover:bg-purple-500 px-5 py-3 font-bold shadow"
              >
                Enter Hub →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
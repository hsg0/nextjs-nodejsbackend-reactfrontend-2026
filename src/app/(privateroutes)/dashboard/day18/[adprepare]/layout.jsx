// src/app/(privateroutes)/dashboard/day18/[adprepare]/layout.jsx
"use client";

import React, { useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";

export default function AdPrepareLayout({ children }) {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  useEffect(() => {
    console.log("[AdPrepareLayout] params:", params);
    console.log("[AdPrepareLayout] searchParams email:", searchParams.get("email"));
  }, [params, searchParams]);

  return (
    <div className="relative">
      {/* small top bar inside main content */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="text-xs text-white/50">SkullFire • Day 18</div>
          <h2 className="text-lg sm:text-xl font-semibold text-white">Ad Generator • Prepare</h2>
        </div>

        <button
          type="button"
          onClick={() => router.push("/dashboard/day18")}
          className={[
            "rounded-2xl px-4 py-2 text-sm font-semibold",
            "bg-white/5 hover:bg-white/10 text-white",
            "ring-1 ring-white/10 transition",
            "focus:outline-none focus:ring-2 focus:ring-white/20",
          ].join(" ")}
        >
          ← Back
        </button>
      </div>

      {children}
    </div>
  );
}
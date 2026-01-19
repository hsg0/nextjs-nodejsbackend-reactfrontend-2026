// src/app/(privateroutes)/dashboard/day18/[adprepare]/[adcreation]/layout.jsx
"use client";

import React, { useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";

export default function AdCreationLayout({ children }) {
  const router = useRouter();
  const params = useParams();
  const sp = useSearchParams();

  useEffect(() => {
    console.log("[AdCreationLayout] params:", params);
    console.log("[AdCreationLayout] email:", sp.get("email"));
  }, [params, sp]);

  return (
    <div className="relative">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="text-xs text-white/50">SkullFire • Day 18</div>
          <h2 className="text-lg sm:text-xl font-semibold text-white">Ad Generator • Creation</h2>
        </div>

        <button
          type="button"
          onClick={() => router.push(`/dashboard/day18/${params?.adprepare}`)}
          className={[
            "rounded-2xl px-4 py-2 text-sm font-semibold",
            "bg-white/5 hover:bg-white/10 text-white",
            "ring-1 ring-white/10 transition",
            "focus:outline-none focus:ring-2 focus:ring-white/20",
          ].join(" ")}
        >
          ← Back to Prepare
        </button>
      </div>

      {children}
    </div>
  );
}
// src/app/(privateroutes)/dashboard/day18/[adprepare]/[adcreation]/page.jsx
"use client";

import React, { useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";

export default function AdCreationPage() {
  const params = useParams();
  const sp = useSearchParams();

  const adprepare = String(params?.adprepare || "");
  const adcreation = String(params?.adcreation || "");
  const email = sp.get("email") || "";

  useEffect(() => {
    console.log("[AdCreationPage] params:", params);
    console.log("[AdCreationPage] email:", email);

    toast.info("⚙️ Generating ad... (placeholder UI)", {
      toastId: "adcreation-start",
    });
  }, [params, email]);

  return (
    <section className="overflow-hidden rounded-3xl bg-white/5 ring-1 ring-white/10 shadow-2xl">
      <div className="relative px-6 sm:px-10 py-10 sm:py-12">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 -right-24 h-80 w-80 rounded-full blur-3xl opacity-25 bg-orange-500" />
          <div className="absolute top-16 -left-24 h-80 w-80 rounded-full blur-3xl opacity-15 bg-red-500" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-96 w-[70vw] rounded-full blur-3xl opacity-10 bg-amber-300" />
        </div>

        <div className="relative">
          <div className="text-xs text-white/50">SkullFire • Day 18</div>
          <h1 className="mt-2 text-2xl sm:text-3xl font-semibold text-white">
            Forging Your Ad
          </h1>

          <p className="mt-4 text-white/75 max-w-3xl">
            We received your product image, actor image, directions, and script. Next we’ll generate your
            ad output here (image/video/text). This page is the placeholder UI for the “creation” step.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-zinc-950/40 ring-1 ring-white/10 p-4">
              <div className="text-xs text-white/50">adprepare</div>
              <div className="mt-1 text-xs text-white/80 break-all">{adprepare}</div>
            </div>
            <div className="rounded-2xl bg-zinc-950/40 ring-1 ring-white/10 p-4">
              <div className="text-xs text-white/50">adcreation</div>
              <div className="mt-1 text-xs text-white/80 break-all">{adcreation}</div>
            </div>
            <div className="rounded-2xl bg-zinc-950/40 ring-1 ring-white/10 p-4">
              <div className="text-xs text-white/50">email</div>
              <div className="mt-1 text-xs text-white/80 break-all">{email || "missing"}</div>
            </div>
          </div>

          <div className="mt-10 rounded-2xl bg-zinc-950/40 ring-1 ring-white/10 p-5">
            <div className="text-sm font-semibold text-white">Status</div>
            <div className="mt-2 text-sm text-white/70">
              Waiting for backend processing output…
            </div>
            <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-white/10">
              <div className="h-full w-1/3 bg-orange-500/40" />
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 sm:px-10 py-4 border-t border-white/10 bg-zinc-950/40">
        <div className="text-xs text-white/50">
          Next: we’ll wire backend output (download link / preview) into this page.
        </div>
      </div>
    </section>
  );
}
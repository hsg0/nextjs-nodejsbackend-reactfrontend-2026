// src/app/(privateroutes)/dashboard/day26/props/[useparams]/[usesearchparams]/(userouter)/routerused/[theend]/page.jsx
"use client";

import React, { useEffect, useMemo } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import useAuthCheck from "@/checkAuth/authCheck";

function Card({ title, subtitle, children }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/40 p-6">
      <div>
        <h2 className="text-lg font-extrabold">{title}</h2>
        {subtitle ? <p className="mt-1 text-sm text-white/60">{subtitle}</p> : null}
      </div>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function MiniRow({ label, value }) {
  return (
    <div className="text-white/70 break-words">
      {label}: <span className="text-white font-bold">{value || "—"}</span>
    </div>
  );
}

export default function Day26TheEndPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const { isAuthenticated, loading, user } = useAuthCheck();

  // ✅ route params from folders
  const useparamsValue = params?.useparams || "";
  const usesearchparamsValue = params?.usesearchparams || "";
  const theendValue = params?.theend || ""; // because folder is [theend]

  // ✅ query string carried across pages
  const query = searchParams.get("query") || "";
  const level = searchParams.get("level") || "";

  // carried from /useSearchParams backend call (earlier page)
  const serverMsg = searchParams.get("serverMsg") || "";

  // carried from /useParams backend call (routerused page)
  const paramsServerMsg = searchParams.get("paramsServerMsg") || "";

  // ✅ rebuild a “carry” QS so buttons preserve everything if you click around
  const carryQS = useMemo(() => {
    const qp = new URLSearchParams();
    if (query) qp.set("query", query);
    if (level) qp.set("level", level);
    if (serverMsg) qp.set("serverMsg", serverMsg);
    if (paramsServerMsg) qp.set("paramsServerMsg", paramsServerMsg);
    const qs = qp.toString();
    return qs ? `?${qs}` : "";
  }, [query, level, serverMsg, paramsServerMsg]);

  const backToRouterusedUrl = useMemo(() => {
    // route group (userouter) does NOT appear in URL, but routerused DOES (real segment)
    return `/dashboard/day26/props/${useparamsValue}/${usesearchparamsValue}/routerused${carryQS}`;
  }, [useparamsValue, usesearchparamsValue, carryQS]);

  const backToUseSearchParamsUrl = useMemo(() => {
    return `/dashboard/day26/props/${useparamsValue}/${usesearchparamsValue}${carryQS}`;
  }, [useparamsValue, usesearchparamsValue, carryQS]);

  // ✅ auth guard
  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated) {
      console.log("[Day26TheEndPage] ❌ not authenticated -> /login");
      router.replace("/login");
    }
  }, [loading, isAuthenticated, router]);

  // ✅ learning logs
  useEffect(() => {
    console.log("[Day26TheEndPage] params:", params);
    console.log("[Day26TheEndPage] useparamsValue:", useparamsValue);
    console.log("[Day26TheEndPage] usesearchparamsValue:", usesearchparamsValue);
    console.log("[Day26TheEndPage] theendValue:", theendValue);

    console.log("[Day26TheEndPage] query:", query);
    console.log("[Day26TheEndPage] level:", level);
    console.log("[Day26TheEndPage] serverMsg:", serverMsg);
    console.log("[Day26TheEndPage] paramsServerMsg:", paramsServerMsg);

    toast.success("🏁 Reached [theend] — carry-over complete!");
  }, [
    params,
    useparamsValue,
    usesearchparamsValue,
    theendValue,
    query,
    level,
    serverMsg,
    paramsServerMsg,
  ]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Loading auth…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-5xl mx-auto space-y-5">
        <div className="rounded-2xl border border-white/10 bg-black/40 p-6">
          <h1 className="text-2xl font-extrabold">Day 26 — ✅ [theend]</h1>
          <div className="mt-2 text-white/70 text-sm">
            Signed in as{" "}
            <span className="text-white font-bold">{user?.email || "unknown@email"}</span>
          </div>
          <div className="mt-3 text-xs text-white/50">
            This is the final page. No backend calls here — we only read:
            <span className="text-white/70"> useParams()</span> +{" "}
            <span className="text-white/70">useSearchParams()</span> values that were carried across.
          </div>
        </div>

        <Card title="1) Route Params (useParams)" subtitle="From folder segments">
          <div className="rounded-xl border border-white/10 bg-black/40 p-4 space-y-2">
            <MiniRow label="params.useparams" value={useparamsValue} />
            <MiniRow label="params.usesearchparams" value={usesearchparamsValue} />
            <MiniRow label="params.theend" value={theendValue} />
          </div>

          <div className="mt-3 text-xs text-white/50">
            URL example:{" "}
            <span className="text-white/70">
              /dashboard/day26/props/{useparamsValue}/{usesearchparamsValue}/routerused/{theendValue}
            </span>
          </div>
        </Card>

        <Card title="2) Query String (useSearchParams)" subtitle="Carried from upstream pages">
          <div className="rounded-xl border border-white/10 bg-black/40 p-4 space-y-2">
            <MiniRow label="query" value={query} />
            <MiniRow label="level" value={level} />
            <div className="pt-2 border-t border-white/10" />
            <MiniRow label="serverMsg (from /useSearchParams backend call)" value={serverMsg} />
            <MiniRow label="paramsServerMsg (from /useParams backend call on routerused)" value={paramsServerMsg} />
          </div>

          <div className="mt-3 text-xs text-white/50">
            ✅ You proved: you can fetch server data on one page and “carry” it forward with query params.
          </div>
        </Card>

        <Card title="3) Navigation" subtitle="Test Link vs router">
          <div className="rounded-xl border border-white/10 bg-black/40 p-4">
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => {
                  console.log("[theend] router.back()");
                  router.back();
                }}
                className="rounded-xl border border-white/10 bg-black/40 px-4 py-2 hover:bg-black/60"
              >
                router.back()
              </button>

              <button
                onClick={() => {
                  console.log("[theend] router.push ->", backToRouterusedUrl);
                  router.push(backToRouterusedUrl);
                }}
                className="rounded-xl border border-white/10 bg-black/40 px-4 py-2 hover:bg-black/60"
              >
                router.push(routerused)
              </button>

              <Link
                href={backToUseSearchParamsUrl}
                className="rounded-xl border border-white/10 bg-black/40 px-4 py-2 hover:bg-black/60"
                onClick={() => console.log("[theend] <Link> backToUseSearchParamsUrl:", backToUseSearchParamsUrl)}
              >
                &lt;Link&gt; back to useSearchParams
              </Link>

              <button
                onClick={() => {
                  const home = "/dashboard/day26";
                  console.log("[theend] router.replace ->", home);
                  router.replace(home);
                }}
                className="rounded-xl border border-white/10 bg-black/40 px-4 py-2 hover:bg-black/60"
              >
                router.replace(/day26)
              </button>
            </div>

            <div className="mt-3 text-xs text-white/50">
              Tip: If you want to preserve query params when you navigate, always append{" "}
              <span className="text-white/70">{carryQS || "(none)"}</span>
            </div>
          </div>
        </Card>

        <div className="text-xs text-white/60 flex flex-wrap gap-4">
          <Link className="underline text-white/80" href="/dashboard/day26/props">
            Back to Props
          </Link>
          <Link className="underline text-white/80" href="/dashboard/day26">
            Back to Day26 Home
          </Link>
        </div>
      </div>
    </div>
  );
}
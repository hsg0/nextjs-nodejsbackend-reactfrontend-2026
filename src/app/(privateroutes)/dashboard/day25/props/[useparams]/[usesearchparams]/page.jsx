// src/app/(privateroutes)/dashboard/day25/props/[useparams]/[usesearchparams]/page.jsx
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
    <div className="text-white/70">
      {label}: <span className="text-white font-bold">{value || "—"}</span>
    </div>
  );
}

export default function Day25UseSearchParamsPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const { isAuthenticated, loading, user } = useAuthCheck();

  // ✅ carried over from last page via URL segments
  const useparamsValue = params?.useparams || "";
  const usesearchparamsValue = params?.usesearchparams || "";

  // ✅ carried over from last page via query string
  const query = searchParams.get("query") || "";
  const level = searchParams.get("level") || "";
  const serverMessage = searchParams.get("serverMsg") || "";

  // ✅ keep carry-over query string everywhere
  const carryQS = useMemo(() => {
    const qp = new URLSearchParams();
    if (query) qp.set("query", query);
    if (level) qp.set("level", level);
    if (serverMessage) qp.set("serverMsg", serverMessage);
    const qs = qp.toString();
    return qs ? `?${qs}` : "";
  }, [query, level, serverMessage]);

  // ✅ these pages are inside (userouter) route group, BUT the URL does NOT include (userouter)
  const linkingUrl = useMemo(() => {
    return `/dashboard/day25/props/${useparamsValue}/${usesearchparamsValue}/linking${carryQS}`;
  }, [useparamsValue, usesearchparamsValue, carryQS]);

  const routerusedUrl = useMemo(() => {
    return `/dashboard/day25/props/${useparamsValue}/${usesearchparamsValue}/routerused${carryQS}`;
  }, [useparamsValue, usesearchparamsValue, carryQS]);

  // ✅ auth guard
  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated) {
      console.log("[Day25UseSearchParamsPage] ❌ not authenticated -> /login");
      router.replace("/login");
    }
  }, [loading, isAuthenticated, router]);

  // ✅ log everything (learning page)
  useEffect(() => {
    console.log("[Day25UseSearchParamsPage] params:", params);
    console.log("[Day25UseSearchParamsPage] useparamsValue:", useparamsValue);
    console.log("[Day25UseSearchParamsPage] usesearchparamsValue:", usesearchparamsValue);

    console.log("[Day25UseSearchParamsPage] query:", query);
    console.log("[Day25UseSearchParamsPage] level:", level);
    console.log("[Day25UseSearchParamsPage] serverMsg:", serverMessage);

    console.log("[Day25UseSearchParamsPage] linkingUrl:", linkingUrl);
    console.log("[Day25UseSearchParamsPage] routerusedUrl:", routerusedUrl);

    toast.info(`✅ Arrived: useparams=${useparamsValue}, usesearchparams=${usesearchparamsValue}`);
  }, [
    params,
    useparamsValue,
    usesearchparamsValue,
    query,
    level,
    serverMessage,
    linkingUrl,
    routerusedUrl,
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
          <h1 className="text-2xl font-extrabold">Day 25 — useSearchParams()</h1>
          <div className="mt-2 text-white/70 text-sm">
            Signed in as{" "}
            <span className="text-white font-bold">{user?.email || "unknown@email"}</span>
          </div>
          <div className="mt-3 text-xs text-white/50">
            ✅ No backend calls here. We read route params + query string that were carried in the URL.
          </div>
        </div>

        <Card
          title="1) Route Params (useParams)"
          subtitle="These come from [useparams] and [usesearchparams]"
        >
          <div className="rounded-xl border border-white/10 bg-black/40 p-4 space-y-2">
            <MiniRow label="params.useparams" value={useparamsValue} />
            <MiniRow label="params.usesearchparams" value={usesearchparamsValue} />
          </div>
        </Card>

        <Card
          title="2) Query String (useSearchParams)"
          subtitle="These come from ?query=...&level=...&serverMsg=..."
        >
          <div className="rounded-xl border border-white/10 bg-black/40 p-4 space-y-2">
            <MiniRow label="query" value={query} />
            <MiniRow label="level" value={level} />
            <MiniRow label="serverMsg" value={serverMessage} />
          </div>
        </Card>

        <Card
          title="3) Next Pages (inside (userouter) route group)"
          subtitle="We can route to BOTH /linking and /routerused"
        >
          <div className="rounded-xl border border-white/10 bg-black/40 p-4">
            <div className="text-xs text-white/50">
              (userouter) is a route group → it does NOT appear in the URL.
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              <button
                onClick={() => {
                  console.log("[Day25UseSearchParamsPage] router.push ->", linkingUrl);
                  router.push(linkingUrl);
                }}
                className="rounded-xl border border-white/10 bg-black/40 px-4 py-2 hover:bg-black/60"
              >
                Go to linking →
              </button>

              <button
                onClick={() => {
                  console.log("[Day25UseSearchParamsPage] router.push ->", routerusedUrl);
                  router.push(routerusedUrl);
                }}
                className="rounded-xl border border-white/10 bg-black/40 px-4 py-2 hover:bg-black/60"
              >
                Go to routerused →
              </button>
            </div>

            <div className="mt-4 space-y-2 text-xs text-white/50">
              <div>
                linkingUrl: <span className="text-white/70 break-all">{linkingUrl}</span>
              </div>
              <div>
                routerusedUrl: <span className="text-white/70 break-all">{routerusedUrl}</span>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href={linkingUrl}
                className="rounded-xl border border-white/10 bg-black/40 px-4 py-2 hover:bg-black/60"
                onClick={() => console.log("[Day25UseSearchParamsPage] <Link> ->", linkingUrl)}
              >
                Link to linking
              </Link>

              <Link
                href={routerusedUrl}
                className="rounded-xl border border-white/10 bg-black/40 px-4 py-2 hover:bg-black/60"
                onClick={() => console.log("[Day25UseSearchParamsPage] <Link> ->", routerusedUrl)}
              >
                Link to routerused
              </Link>
            </div>
          </div>
        </Card>

        <div className="text-xs text-white/60 flex flex-wrap gap-4">
          <Link className="underline text-white/80" href="/dashboard/day25/props">
            Back to Props
          </Link>
          <Link className="underline text-white/80" href="/dashboard/day25">
            Back to Day25 Home
          </Link>
          <button
            onClick={() => {
              console.log("[Day25UseSearchParamsPage] router.back()");
              router.back();
            }}
            className="underline text-white/80"
          >
            router.back()
          </button>
        </div>
      </div>
    </div>
  );
}
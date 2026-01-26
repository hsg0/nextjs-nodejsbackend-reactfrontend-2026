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
    <div className="text-white/70">
      {label}: <span className="text-white font-bold">{value || "—"}</span>
    </div>
  );
}

function JsonBox({ data }) {
  return (
    <pre className="overflow-auto rounded-2xl border border-white/10 bg-zinc-950/80 p-4 text-xs">
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}

export default function Day26TheEndPage() {
  const router = useRouter();
  const params = useParams();
  const sp = useSearchParams();

  const { isAuthenticated, loading, user } = useAuthCheck();

  // ✅ carried route params (same through the whole tree)
  const useparamsValue = params?.useparams || "";
  const usesearchparamsValue = params?.usesearchparams || "";

  // ✅ carried query string (from upstream)
  const query = sp.get("query") || "";
  const level = sp.get("level") || "";
  const serverMsg = sp.get("serverMsg") || ""; // from /useSearchParams backend on first page
  const paramsServerMsg = sp.get("paramsServerMsg") || ""; // from /useParams backend on routerused page

  // ✅ build a carryQS again (so every button keeps state)
  const carryQS = useMemo(() => {
    const qp = new URLSearchParams();
    if (query) qp.set("query", query);
    if (level) qp.set("level", level);
    if (serverMsg) qp.set("serverMsg", serverMsg);
    if (paramsServerMsg) qp.set("paramsServerMsg", paramsServerMsg);
    const qs = qp.toString();
    return qs ? `?${qs}` : "";
  }, [query, level, serverMsg, paramsServerMsg]);

  // ✅ useful urls
  const backToRouterusedUrl = useMemo(() => {
    return `/dashboard/day26/props/${useparamsValue}/${usesearchparamsValue}/routerused${carryQS}`;
  }, [useparamsValue, usesearchparamsValue, carryQS]);

  const backToUseSearchParamsUrl = useMemo(() => {
    return `/dashboard/day26/props/${useparamsValue}/${usesearchparamsValue}${carryQS}`;
  }, [useparamsValue, usesearchparamsValue, carryQS]);

  const backToUseParamsUrl = useMemo(() => {
    return `/dashboard/day26/props/${useparamsValue}${carryQS}`;
  }, [useparamsValue, carryQS]);

  // ✅ auth guard
  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated) {
      console.log("[Day26TheEndPage] ❌ not authenticated -> /login");
      router.replace("/login");
    }
  }, [loading, isAuthenticated, router]);

  // ✅ log everything for learning
  useEffect(() => {
    console.log("[Day26TheEndPage] params:", params);
    console.log("[Day26TheEndPage] useparamsValue:", useparamsValue);
    console.log("[Day26TheEndPage] usesearchparamsValue:", usesearchparamsValue);

    console.log("[Day26TheEndPage] query:", query);
    console.log("[Day26TheEndPage] level:", level);
    console.log("[Day26TheEndPage] serverMsg:", serverMsg);
    console.log("[Day26TheEndPage] paramsServerMsg:", paramsServerMsg);

    toast.success("🏁 Reached [theend] — carry-over complete ✅");
  }, [params, useparamsValue, usesearchparamsValue, query, level, serverMsg, paramsServerMsg]);

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
          <h1 className="text-2xl font-extrabold">Day 26 — THE END 🏁</h1>
          <div className="mt-2 text-white/70 text-sm">
            Signed in as{" "}
            <span className="text-white font-bold">{user?.email || "unknown@email"}</span>
          </div>
          <div className="mt-3 text-xs text-white/50">
            ✅ This final page proves the entire chain works:
            <br />
            - Route segments: <span className="text-white/70">[useparams]/[usesearchparams]</span>
            <br />
            - Query string: <span className="text-white/70">query/level/serverMsg</span>
            <br />
            - New downstream server value:{" "}
            <span className="text-white/70">paramsServerMsg</span> (from routerused backend call)
          </div>
        </div>

        <Card
          title="1) Final Values (what survived all navigation)"
          subtitle="If these show, your useParams + useSearchParams + router/link carry works."
        >
          <div className="rounded-xl border border-white/10 bg-black/40 p-4 space-y-2">
            <MiniRow label="params.useparams" value={useparamsValue} />
            <MiniRow label="params.usesearchparams" value={usesearchparamsValue} />
            <div className="my-2 border-t border-white/10" />
            <MiniRow label="query" value={query} />
            <MiniRow label="level" value={level} />
            <MiniRow label="serverMsg (from /useSearchParams earlier)" value={serverMsg} />
            <MiniRow label="paramsServerMsg (from /useParams on routerused)" value={paramsServerMsg} />
          </div>

          <div className="mt-3 text-xs text-white/50">
            carryQS right now: <span className="text-white/70">{carryQS || "—"}</span>
          </div>

          <div className="mt-3">
            <JsonBox
              data={{
                routeParams: { useparamsValue, usesearchparamsValue },
                queryString: { query, level, serverMsg, paramsServerMsg },
                carryQS,
              }}
            />
          </div>
        </Card>

        <Card title="2) Navigation (prove back/forward still carries state)">
          <div className="rounded-xl border border-white/10 bg-black/40 p-4">
            <div className="text-xs text-white/60 mb-3">Useful links:</div>

            <div className="text-xs text-white/50 break-all">
              Back to routerused: <span className="text-white/70">{backToRouterusedUrl}</span>
            </div>
            <div className="text-xs text-white/50 break-all">
              Back to useSearchParams: <span className="text-white/70">{backToUseSearchParamsUrl}</span>
            </div>
            <div className="text-xs text-white/50 break-all">
              Back to useParams: <span className="text-white/70">{backToUseParamsUrl}</span>
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href={backToRouterusedUrl}
                className="rounded-xl border border-white/10 bg-black/40 px-4 py-2 hover:bg-black/60"
                onClick={() => console.log("[theend] <Link> -> routerused", backToRouterusedUrl)}
              >
                ← Back to routerused (Link)
              </Link>

              <button
                onClick={() => {
                  console.log("[theend] router.push -> useSearchParams", backToUseSearchParamsUrl);
                  router.push(backToUseSearchParamsUrl);
                }}
                className="rounded-xl border border-white/10 bg-black/40 px-4 py-2 hover:bg-black/60"
              >
                router.push(useSearchParams)
              </button>

              <button
                onClick={() => {
                  console.log("[theend] router.replace -> /dashboard/day26", `/dashboard/day26${carryQS}`);
                  router.replace(`/dashboard/day26${carryQS}`);
                }}
                className="rounded-xl border border-white/10 bg-black/40 px-4 py-2 hover:bg-black/60"
              >
                router.replace(/day26)
              </button>

              <button
                onClick={() => {
                  console.log("[theend] router.back()");
                  router.back();
                }}
                className="rounded-xl border border-white/10 bg-black/40 px-4 py-2 hover:bg-black/60"
              >
                router.back()
              </button>
            </div>

            <div className="mt-3 text-xs text-white/50">
              ✅ If you click around and values stay consistent, your carry-over system is working.
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
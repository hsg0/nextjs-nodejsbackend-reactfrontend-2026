// src/app/(privateroutes)/dashboard/day25/props/[useparams]/[usesearchparams]/(userouter)/linking/page.jsx
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

export default function Day25LinkingPage() {
  const router = useRouter();
  const params = useParams();
  const sp = useSearchParams();

  const { isAuthenticated, loading, user } = useAuthCheck();

  // ✅ route params
  const useparamsValue = params?.useparams || "";
  const usesearchparamsValue = params?.usesearchparams || "";

  // ✅ query string carried from previous pages
  const query = sp.get("query") || "";
  const level = sp.get("level") || "";
  const serverMsg = sp.get("serverMsg") || "";

  // ✅ build a reusable query string so we "carry over" data to every next page
  const carryQS = useMemo(() => {
    const qp = new URLSearchParams();
    if (query) qp.set("query", query);
    if (level) qp.set("level", level);
    if (serverMsg) qp.set("serverMsg", serverMsg);
    const qs = qp.toString();
    return qs ? `?${qs}` : "";
  }, [query, level, serverMsg]);

  // ✅ useful URLs (NOTE: (userouter) is a route group → NOT in URL)
  const backToUseSearchParamsPage = useMemo(() => {
    return `/dashboard/day25/props/${useparamsValue}/${usesearchparamsValue}${carryQS}`;
  }, [useparamsValue, usesearchparamsValue, carryQS]);

  const goToRouterused = useMemo(() => {
    return `/dashboard/day25/props/${useparamsValue}/${usesearchparamsValue}/routerused${carryQS}`;
  }, [useparamsValue, usesearchparamsValue, carryQS]);

  // ✅ auth guard
  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated) {
      console.log("[Day25LinkingPage] ❌ not authenticated -> /login");
      router.replace("/login");
    }
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    console.log("[Day25LinkingPage] params:", params);
    console.log("[Day25LinkingPage] query:", query, "level:", level);
    console.log("[Day25LinkingPage] serverMsg:", serverMsg);

    toast.success("✅ Linking page loaded (no backend calls)");
  }, [params, query, level, serverMsg]);

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
          <h1 className="text-2xl font-extrabold">Day 25 — Linking</h1>
          <div className="mt-2 text-white/70 text-sm">
            Signed in as{" "}
            <span className="text-white font-bold">{user?.email || "unknown@email"}</span>
          </div>
          <div className="mt-3 text-xs text-white/50">
            ✅ No backend calls. This page demonstrates{" "}
            <span className="text-white/70">&lt;Link /&gt;</span> vs{" "}
            <span className="text-white/70">router.push()</span> and how we keep carry-over values
            in the URL.
          </div>
        </div>

        <Card title="1) What we received (params + query string)">
          <div className="rounded-xl border border-white/10 bg-black/40 p-4 space-y-2">
            <MiniRow label="params.useparams" value={useparamsValue} />
            <MiniRow label="params.usesearchparams" value={usesearchparamsValue} />
            <div className="my-2 border-t border-white/10" />
            <MiniRow label="query" value={query} />
            <MiniRow label="level" value={level} />
            <MiniRow label="serverMsg" value={serverMsg} />
          </div>

          <div className="mt-3 text-xs text-white/50">
            carryQS we will re-use everywhere:{" "}
            <span className="text-white/70">{carryQS || "—"}</span>
          </div>

          <div className="mt-3">
            <JsonBox
              data={{
                routeParams: { useparamsValue, usesearchparamsValue },
                queryString: { query, level, serverMsg },
                carryQS,
              }}
            />
          </div>
        </Card>

        <Card
          title="2) Linking demos"
          subtitle="When possible, prefer <Link /> for normal navigation. Use router.push for actions (after submit, after logic, etc.)"
        >
          <div className="rounded-xl border border-white/10 bg-black/40 p-4">
            <div className="text-xs text-white/60 mb-2">Target URLs:</div>

            <div className="text-xs text-white/50 break-all">
              Back: <span className="text-white/70">{backToUseSearchParamsPage}</span>
            </div>

            <div className="text-xs text-white/50 break-all">
              Routerused: <span className="text-white/70">{goToRouterused}</span>
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              {/* ✅ normal Link */}
              <Link
                href={goToRouterused}
                className="rounded-xl border border-white/10 bg-black/40 px-4 py-2 hover:bg-black/60"
                onClick={() => console.log("[Day25LinkingPage] <Link> -> routerused", goToRouterused)}
              >
                Go to routerused (Link) →
              </Link>

              {/* ✅ Link that replaces history */}
              <Link
                href={goToRouterused}
                replace
                className="rounded-xl border border-white/10 bg-black/40 px-4 py-2 hover:bg-black/60"
                onClick={() =>
                  console.log("[Day25LinkingPage] <Link replace> -> routerused", goToRouterused)
                }
              >
                Go to routerused (Link replace)
              </Link>

              {/* ✅ Link with prefetch disabled (demo) */}
              <Link
                href={backToUseSearchParamsPage}
                prefetch={false}
                className="rounded-xl border border-white/10 bg-black/40 px-4 py-2 hover:bg-black/60"
                onClick={() =>
                  console.log(
                    "[Day25LinkingPage] <Link prefetch={false}> -> back",
                    backToUseSearchParamsPage
                  )
                }
              >
                Back (Link prefetch=false)
              </Link>

              {/* ✅ compare router.push */}
              <button
                onClick={() => {
                  console.log("[Day25LinkingPage] router.push ->", goToRouterused);
                  router.push(goToRouterused);
                }}
                className="rounded-xl border border-white/10 bg-black/40 px-4 py-2 hover:bg-black/60"
              >
                Go to routerused (router.push)
              </button>

              {/* ✅ router.back demo */}
              <button
                onClick={() => {
                  console.log("[Day25LinkingPage] router.back()");
                  router.back();
                }}
                className="rounded-xl border border-white/10 bg-black/40 px-4 py-2 hover:bg-black/60"
              >
                router.back()
              </button>
            </div>

            <div className="mt-4 text-xs text-white/50">
              ✅ Notice: because we keep the query string, the next pages still see{" "}
              <span className="text-white/70">query / level / serverMsg</span>.
            </div>

            <div className="mt-2 text-xs text-white/50">
              ✅ Also notice: <span className="text-white/70">replace</span> changes history (back
              behaves differently).
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
        </div>
      </div>
    </div>
  );
}
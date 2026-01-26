"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-toastify";
import useAuthCheck from "@/checkAuth/authCheck";

/* ------------------ backend calls ------------------ */
const fetchUseParamsTest = async () => {
  console.log("[fetchUseParamsTest] GET /web/api/day26/useParams");
  const res = await axios.get("http://localhost:5020/web/api/day26/useParams", {
    withCredentials: true,
    timeout: 15000,
  });
  console.log("[fetchUseParamsTest] ✅ res.data:", res.data);
  return res.data;
};

const fetchUseSearchParamsTest = async () => {
  console.log("[fetchUseSearchParamsTest] GET /web/api/day26/useSearchParams");
  const res = await axios.get(
    "http://localhost:5020/web/api/day26/useSearchParams",
    {
      withCredentials: true,
      timeout: 15000,
    }
  );
  console.log("[fetchUseSearchParamsTest] ✅ res.data:", res.data);
  return res.data;
};

function JsonBox({ data }) {
  return (
    <pre className="overflow-auto rounded-2xl border border-white/10 bg-zinc-950/80 p-4 text-xs">
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}

function Card({ title, subtitle, children }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/40 p-6">
      <div>
        <h2 className="text-lg font-extrabold">{title}</h2>
        {subtitle ? (
          <p className="mt-1 text-sm text-white/60">{subtitle}</p>
        ) : null}
      </div>
      <div className="mt-4">{children}</div>
    </div>
  );
}

export default function Day26UseParamsPage() {
  const router = useRouter();
  const params = useParams();

  // ✅ url param from folder: /props/[useparams]
  const useparamsValue = params?.useparams || "";

  const { isAuthenticated, loading, user } = useAuthCheck();

  // ✅ you prepare the NEXT route segment here (this becomes [usesearchparams])
  const [usesearchparamsValue, setUsesearchparamsValue] = useState("beta");

  // ✅ server response: /useParams
  const [serverParamsData, setServerParamsData] = useState(null);
  const [serverParamsLoading, setServerParamsLoading] = useState(false);
  const [serverParamsErr, setServerParamsErr] = useState("");

  // ✅ server response: /useSearchParams
  const [serverSearchData, setServerSearchData] = useState(null);
  const [serverSearchLoading, setServerSearchLoading] = useState(false);
  const [serverSearchErr, setServerSearchErr] = useState("");

  const nextUrl = useMemo(() => {
    const base = `/dashboard/day26/props/${useparamsValue}/${usesearchparamsValue}`;
    const qp = `?query=hello&level=5`;
    return base + qp;
  }, [useparamsValue, usesearchparamsValue]);

  const canGoNext = useMemo(() => {
    return !!useparamsValue && !!usesearchparamsValue && !serverSearchLoading && !serverParamsLoading;
  }, [useparamsValue, usesearchparamsValue, serverSearchLoading, serverParamsLoading]);

  // ✅ auth guard
  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated) {
      console.log("[Day26UseParamsPage] ❌ not authenticated -> /login");
      router.replace("/login");
    }
  }, [loading, isAuthenticated, router]);

  // ✅ log param
  useEffect(() => {
    console.log("[Day26UseParamsPage] params:", params);
    console.log("[Day26UseParamsPage] useparamsValue:", useparamsValue);
    if (useparamsValue) toast.info(`useParams() got: ${useparamsValue}`);
  }, [params, useparamsValue]);

  // ✅ fetch /useParams
  useEffect(() => {
    let alive = true;

    const run = async () => {
      if (loading) return;
      if (!isAuthenticated) return;

      try {
        setServerParamsLoading(true);
        setServerParamsErr("");

        const data = await fetchUseParamsTest();
        if (!alive) return;

        setServerParamsData(data);
        toast.success("✅ Server /useParams loaded");
      } catch (err) {
        const msg =
          err?.response?.data?.message || err?.message || "Failed to load server useParams";
        console.log(
          "[Day26UseParamsPage] ❌ server /useParams error:",
          err?.response?.data || err?.message || err
        );
        if (!alive) return;

        setServerParamsErr(msg);
        toast.error(msg);
      } finally {
        if (!alive) return;
        setServerParamsLoading(false);
      }
    };

    run();
    return () => (alive = false);
  }, [loading, isAuthenticated]);

  // ✅ fetch /useSearchParams
  useEffect(() => {
    let alive = true;

    const run = async () => {
      if (loading) return;
      if (!isAuthenticated) return;

      try {
        setServerSearchLoading(true);
        setServerSearchErr("");

        const data = await fetchUseSearchParamsTest();
        if (!alive) return;

        setServerSearchData(data);
        toast.success("✅ Server /useSearchParams loaded");
      } catch (err) {
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          "Failed to load server useSearchParams";
        console.log(
          "[Day26UseParamsPage] ❌ server /useSearchParams error:",
          err?.response?.data || err?.message || err
        );
        if (!alive) return;

        setServerSearchErr(msg);
        toast.error(msg);
      } finally {
        if (!alive) return;
        setServerSearchLoading(false);
      }
    };

    run();
    return () => (alive = false);
  }, [loading, isAuthenticated]);

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
          <h1 className="text-2xl font-extrabold">Day 26 — useParams()</h1>
          <div className="mt-2 text-white/70 text-sm">
            Signed in as{" "}
            <span className="text-white font-bold">
              {user?.email || "unknown@email"}
            </span>
          </div>
        </div>

        {/* ✅ URL param + prepare next param */}
        <Card
          title="1) URL Param (useParams) + Prepare Next Param"
          subtitle="This page reads [useparams] and prepares [usesearchparams] for the next page."
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-white/10 bg-black/40 p-4">
              <div className="text-white/70 text-sm">Current URL Param:</div>
              <div className="mt-2 text-xl font-extrabold text-white">
                {useparamsValue || "—"}
              </div>
              <div className="mt-3 text-xs text-white/50">
                From folder: <span className="text-white/70">[useparams]</span> →{" "}
                <span className="text-white/70">params.useparams</span>
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-black/40 p-4">
              <div className="text-white/70 text-sm">
                Next route segment (this becomes <span className="text-white/70">[usesearchparams]</span>):
              </div>

              <input
                value={usesearchparamsValue}
                onChange={(e) => {
                  console.log("[Day26UseParamsPage] usesearchparamsValue changed:", e.target.value);
                  setUsesearchparamsValue(e.target.value);
                }}
                className="mt-2 w-full rounded-xl border border-white/10 bg-black/50 px-3 py-2 text-white outline-none"
                placeholder="example: beta"
              />

              <div className="mt-2 text-xs text-white/50">
                Next URL:{" "}
                <span className="text-white/70">{nextUrl}</span>
              </div>

              <button
                disabled={!canGoNext}
                onClick={() => {
                  const serverMsg = encodeURIComponent(serverSearchData?.searchParams || "");
                  const finalUrl = `/dashboard/day26/props/${useparamsValue}/${usesearchparamsValue}?query=hello&level=5&serverMsg=${serverMsg}`;
                  console.log("[Day26UseParamsPage] going to next page:", finalUrl);
                  router.push(finalUrl);
                }}
                className={`mt-3 rounded-xl border border-white/10 px-4 py-2 ${
                  canGoNext ? "bg-black/40 hover:bg-black/60" : "bg-black/20 opacity-60"
                }`}
              >
                Go to useSearchParams page →
              </button>
            </div>
          </div>
        </Card>

        {/* ✅ server response: /useParams */}
        <Card title="2) Server Response (GET /web/api/day26/useParams)">
          {serverParamsLoading ? (
            <div className="text-white/70">Loading…</div>
          ) : serverParamsErr ? (
            <div className="rounded-xl border border-red-500/30 bg-black/60 p-4 text-white/80">
              ❌ {serverParamsErr}
            </div>
          ) : serverParamsData ? (
            <div className="space-y-3">
              <JsonBox data={serverParamsData} />
              <div className="text-xs text-white/50">
                This is demo server text. Your real param is above in the URL param section.
              </div>
            </div>
          ) : (
            <div className="text-white/60 text-sm">No data yet.</div>
          )}
        </Card>

        {/* ✅ server response: /useSearchParams */}
        <Card title="3) Server Response (GET /web/api/day26/useSearchParams)">
          {serverSearchLoading ? (
            <div className="text-white/70">Loading…</div>
          ) : serverSearchErr ? (
            <div className="rounded-xl border border-red-500/30 bg-black/60 p-4 text-white/80">
              ❌ {serverSearchErr}
            </div>
          ) : serverSearchData ? (
            <div className="space-y-3">
              <JsonBox data={serverSearchData} />
              <div className="text-xs text-white/50">
                On the NEXT page you will use <span className="text-white/70">useSearchParams()</span>
                to read <span className="text-white/70">?query=hello&level=5</span> from the URL.
              </div>
            </div>
          ) : (
            <div className="text-white/60 text-sm">No data yet.</div>
          )}
        </Card>

        <div className="text-xs text-white/60 flex flex-wrap gap-3">
          <Link
            href="/dashboard/day26/props"
            className="rounded-xl border border-white/10 bg-black/40 px-4 py-2 hover:bg-black/60"
          >
            Back to Props
          </Link>

          <button
            onClick={() => {
              console.log("[Day26UseParamsPage] router.back()");
              router.back();
            }}
            className="rounded-xl border border-white/10 bg-black/40 px-4 py-2 hover:bg-black/60"
          >
            router.back()
          </button>
        </div>
      </div>
    </div>
  );
}
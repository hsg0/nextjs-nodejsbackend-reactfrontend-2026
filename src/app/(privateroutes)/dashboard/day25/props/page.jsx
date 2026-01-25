"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import useAuthCheck from "@/checkAuth/authCheck";

const fetchPropsTest = async () => {
  console.log("[fetchPropsTest] GET /web/api/day25/test");
  const res = await axios.get("http://localhost:5020/web/api/day25/test", {
    withCredentials: true,
    timeout: 15000,
  });
  console.log("[fetchPropsTest] ✅ res.data:", res.data);
  return res.data;
};

const fetchUseParamsTest = async () => {
  console.log("[fetchUseParamsTest] GET /web/api/day25/useParams");
  const res = await axios.get("http://localhost:5020/web/api/day25/useParams", {
    withCredentials: true,
    timeout: 15000,
  });
  console.log("[fetchUseParamsTest] ✅ res.data:", res.data);
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

/** ✅ PROPS DEMO COMPONENT 1 */
function PropsMessage({ message }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/40 p-4 text-sm text-white/80">
      <div className="font-extrabold text-white mb-1">Prop: message</div>
      <div>{message || "—"}</div>
    </div>
  );
}

/** ✅ PROPS DEMO COMPONENT 2 */
function PropsUserCard({ user }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/40 p-4 text-sm text-white/80">
      <div className="font-extrabold text-white mb-2">Prop: user</div>
      <div className="text-white/70">
        webUserId: <span className="text-white">{user?.webUserId || "—"}</span>
      </div>
      <div className="text-white/70">
        username: <span className="text-white">{user?.username || "—"}</span>
      </div>
      <div className="text-white/70">
        email: <span className="text-white">{user?.email || "—"}</span>
      </div>
    </div>
  );
}

export default function Day25PropsPage() {
  const router = useRouter();
  const { isAuthenticated, loading, user } = useAuthCheck();

  // ✅ Response 1: /test
  const [propsData, setPropsData] = useState(null);
  const [propsLoading, setPropsLoading] = useState(false);
  const [propsErr, setPropsErr] = useState("");

  // ✅ Response 2: /useParams
  const [paramsData, setParamsData] = useState(null);
  const [paramsLoading, setParamsLoading] = useState(false);
  const [paramsErr, setParamsErr] = useState("");

  // ✅ Carry-over param value (this will become the URL segment)
  const [selectedParam, setSelectedParam] = useState("alpha");

  // If you want: we can auto-generate the param from server later.
  // For now: keep it simple and controlled.

  const canGoNext = useMemo(() => {
    return !!selectedParam && !propsLoading && !paramsLoading;
  }, [selectedParam, propsLoading, paramsLoading]);

  // ✅ auth guard
  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) {
      console.log("[Day25PropsPage] ❌ not authenticated -> /login");
      router.replace("/login");
    }
  }, [loading, isAuthenticated, router]);

  // ✅ fetch both on load (separately)
  useEffect(() => {
    let alive = true;

    const runProps = async () => {
      if (loading) return;
      if (!isAuthenticated) return;

      try {
        setPropsLoading(true);
        setPropsErr("");
        const resData = await fetchPropsTest();
        if (!alive) return;
        setPropsData(resData);
        toast.success("✅ Props endpoint loaded");
      } catch (err) {
        const msg =
          err?.response?.data?.message || err?.message || "Failed to load props test";
        console.log("[Day25PropsPage] ❌ /test error:", err?.response?.data || err?.message || err);
        if (!alive) return;
        setPropsErr(msg);
        toast.error(msg);
      } finally {
        if (!alive) return;
        setPropsLoading(false);
      }
    };

    const runParams = async () => {
      if (loading) return;
      if (!isAuthenticated) return;

      try {
        setParamsLoading(true);
        setParamsErr("");
        const resData = await fetchUseParamsTest();
        if (!alive) return;
        setParamsData(resData);
        toast.success("✅ useParams endpoint loaded");
      } catch (err) {
        const msg =
          err?.response?.data?.message || err?.message || "Failed to load useParams test";
        console.log(
          "[Day25PropsPage] ❌ /useParams error:",
          err?.response?.data || err?.message || err
        );
        if (!alive) return;
        setParamsErr(msg);
        toast.error(msg);
      } finally {
        if (!alive) return;
        setParamsLoading(false);
      }
    };

    runProps();
    runParams();

    return () => {
      alive = false;
    };
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
          <h1 className="text-2xl font-extrabold">Day 25 — Props Page</h1>
          <div className="mt-2 text-white/70 text-sm">
            Signed in as{" "}
            <span className="text-white font-bold">
              {user?.email || "unknown@email"}
            </span>
          </div>
          <div className="mt-3 text-xs text-white/50">
            This page fetches 2 endpoints, then we carry a value to the next page
            using the URL param.
          </div>
        </div>

        {/* ✅ Endpoint 1 */}
        <Card title="1) Props Controller" subtitle="GET /web/api/day25/test">
          {propsLoading ? (
            <div className="text-white/70">Loading…</div>
          ) : propsErr ? (
            <div className="rounded-xl border border-red-500/30 bg-black/60 p-4 text-white/80">
              ❌ {propsErr}
            </div>
          ) : propsData ? (
            <div className="space-y-4">
              <JsonBox data={propsData} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <PropsMessage message={propsData?.props} />
                <PropsUserCard user={propsData?.user} />
              </div>
            </div>
          ) : (
            <div className="text-white/60 text-sm">No data yet.</div>
          )}
        </Card>

        {/* ✅ Endpoint 2 */}
        <Card title="2) useParams Controller (server response)" subtitle="GET /web/api/day25/useParams">
          {paramsLoading ? (
            <div className="text-white/70">Loading…</div>
          ) : paramsErr ? (
            <div className="rounded-xl border border-red-500/30 bg-black/60 p-4 text-white/80">
              ❌ {paramsErr}
            </div>
          ) : paramsData ? (
            <div className="space-y-4">
              <JsonBox data={paramsData} />
              <div className="text-xs text-white/50">
                Note: this server endpoint is just demo data. The real “useParams”
                comes from your URL on the next page.
              </div>
            </div>
          ) : (
            <div className="text-white/60 text-sm">No data yet.</div>
          )}
        </Card>

        {/* ✅ Carry-over + Next */}
        <Card
          title="3) Carry value to the next page (URL Param)"
          subtitle="We cannot pass React props across pages reliably, so we carry via the URL."
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-white/10 bg-black/40 p-4">
              <div className="text-sm text-white/70">Pick a param value:</div>

              <input
                value={selectedParam}
                onChange={(e) => {
                  console.log("[Day25PropsPage] selectedParam changed:", e.target.value);
                  setSelectedParam(e.target.value);
                }}
                className="mt-2 w-full rounded-xl border border-white/10 bg-black/50 px-3 py-2 text-white outline-none"
                placeholder="example: alpha"
              />

              <div className="mt-2 text-xs text-white/50">
                Next URL will be:
                <span className="text-white/70"> /dashboard/day25/props/</span>
                <span className="text-purple-300 font-bold">{selectedParam || "—"}</span>
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-black/40 p-4">
              <div className="text-sm text-white/70">Go to useParams page:</div>

              <button
                disabled={!canGoNext}
                onClick={() => {
                  console.log("[Day25PropsPage] going to useParams page with:", selectedParam);
                  router.push(`/dashboard/day25/props/${selectedParam}`);
                }}
                className={`mt-2 rounded-xl border border-white/10 px-4 py-2 ${
                  canGoNext ? "bg-black/40 hover:bg-black/60" : "bg-black/20 opacity-60"
                }`}
              >
                Open useParams page →
              </button>

              <div className="mt-3 text-xs text-white/50">
                (This is the “carry over” step.)
              </div>
            </div>
          </div>
        </Card>

        <div className="text-xs text-white/60 flex flex-wrap gap-4">
          <Link className="underline text-white/80" href="/dashboard/day25">
            Back to Day25 Home
          </Link>

          <Link
            className="underline text-white/80"
            href={`/dashboard/day25/props/${selectedParam}/beta?query=hello&level=5`}
          >
            Skip ahead: useSearchParams demo
          </Link>
        </div>
      </div>
    </div>
  );
}
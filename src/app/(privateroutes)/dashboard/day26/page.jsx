"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import useAuthCheck from "@/checkAuth/authCheck";

function PropsMessage({ message }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/40 p-4 text-sm text-white/80">
      <div className="font-extrabold text-white mb-1">Prop: message</div>
      <div>{message || "—"}</div>
    </div>
  );
}

function PropsUserCard({ userObj }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/40 p-4 text-sm text-white/80">
      <div className="font-extrabold text-white mb-2">Prop: user</div>

      <div className="text-white/70">
        webUserId: <span className="text-white">{userObj?.webUserId || "—"}</span>
      </div>

      <div className="text-white/70">
        username: <span className="text-white">{userObj?.username || "—"}</span>
      </div>

      <div className="text-white/70">
        email: <span className="text-white">{userObj?.email || "—"}</span>
      </div>
    </div>
  );
}

// ✅ Each axios call is its own separate function
const fetchPropsTest = async () => {
  console.log("[fetchPropsTest] GET /web/api/day26/test");
  const res = await axios.get("http://localhost:5020/web/api/day26/test", {
    withCredentials: true,
    timeout: 15000,
  });
  console.log("[fetchPropsTest] ✅ res.data:", res.data);
  return res.data;
};

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

const fetchUseRouterTest = async () => {
  console.log("[fetchUseRouterTest] GET /web/api/day26/useRouter");
  const res = await axios.get("http://localhost:5020/web/api/day26/useRouter", {
    withCredentials: true,
    timeout: 15000,
  });
  console.log("[fetchUseRouterTest] ✅ res.data:", res.data);
  return res.data;
};

const fetchLinkingTest = async () => {
  console.log("[fetchLinkingTest] GET /web/api/day26/linking");
  const res = await axios.get("http://localhost:5020/web/api/day26/linking", {
    withCredentials: true,
    timeout: 15000,
  });
  console.log("[fetchLinkingTest] ✅ res.data:", res.data);
  return res.data;
};

function Section({ title, subtitle, children }) {
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

function JsonBox({ data }) {
  return (
    <pre className="overflow-auto rounded-2xl border border-white/10 bg-zinc-950/80 p-4 text-xs">
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}

export default function Page25() {
  const router = useRouter();
  const { isAuthenticated, loading, user } = useAuthCheck();

  // ✅ each response has its own state
  const [propsData, setPropsData] = useState(null);
  const [propsLoading, setPropsLoading] = useState(false);
  const [propsError, setPropsError] = useState("");

  const [paramsData, setParamsData] = useState(null);
  const [paramsLoading, setParamsLoading] = useState(false);
  const [paramsError, setParamsError] = useState("");

  const [searchParamsData, setSearchParamsData] = useState(null);
  const [searchParamsLoading, setSearchParamsLoading] = useState(false);
  const [searchParamsError, setSearchParamsError] = useState("");

  const [routerData, setRouterData] = useState(null);
  const [routerLoading, setRouterLoading] = useState(false);
  const [routerError, setRouterError] = useState("");

  const [linkingData, setLinkingData] = useState(null);
  const [linkingLoading, setLinkingLoading] = useState(false);
  const [linkingError, setLinkingError] = useState("");

  // ✅ Auth guard (useRouter redirect)
  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated) {
      console.log("[Page25] ❌ not authenticated -> router.replace('/login')");
      router.replace("/login");
    }
  }, [loading, isAuthenticated, router]);

  // ✅ 1) Props -> useEffect on load
  useEffect(() => {
    let alive = true;

    const run = async () => {
      if (loading) return;
      if (!isAuthenticated) return;

      try {
        setPropsLoading(true);
        setPropsError("");
        const data = await fetchPropsTest();
        if (!alive) return;
        setPropsData(data);
        toast.success("✅ Props loaded");
      } catch (err) {
        const msg = err?.response?.data?.message || err?.message || "Failed to load props";
        console.log("[props useEffect] ❌ error:", err?.response?.data || err?.message || err);
        if (!alive) return;
        setPropsError(msg);
        toast.error(msg);
      } finally {
        if (!alive) return;
        setPropsLoading(false);
      }
    };

    run();

    return () => {
      alive = false;
    };
  }, [loading, isAuthenticated]);

  // ✅ 2) useParams -> useEffect on load
  useEffect(() => {
    let alive = true;

    const run = async () => {
      if (loading) return;
      if (!isAuthenticated) return;

      try {
        setParamsLoading(true);
        setParamsError("");
        const data = await fetchUseParamsTest();
        if (!alive) return;
        setParamsData(data);
        toast.success("✅ useParams loaded");
      } catch (err) {
        const msg =
          err?.response?.data?.message || err?.message || "Failed to load useParams";
        console.log("[useParams useEffect] ❌ error:", err?.response?.data || err?.message || err);
        if (!alive) return;
        setParamsError(msg);
        toast.error(msg);
      } finally {
        if (!alive) return;
        setParamsLoading(false);
      }
    };

    run();

    return () => {
      alive = false;
    };
  }, [loading, isAuthenticated]);

  // ✅ 3) useSearchParams -> useEffect on load
  useEffect(() => {
    let alive = true;

    const run = async () => {
      if (loading) return;
      if (!isAuthenticated) return;

      try {
        setSearchParamsLoading(true);
        setSearchParamsError("");
        const data = await fetchUseSearchParamsTest();
        if (!alive) return;
        setSearchParamsData(data);
        toast.success("✅ useSearchParams loaded");
      } catch (err) {
        const msg =
          err?.response?.data?.message || err?.message || "Failed to load useSearchParams";
        console.log(
          "[useSearchParams useEffect] ❌ error:",
          err?.response?.data || err?.message || err
        );
        if (!alive) return;
        setSearchParamsError(msg);
        toast.error(msg);
      } finally {
        if (!alive) return;
        setSearchParamsLoading(false);
      }
    };

    run();

    return () => {
      alive = false;
    };
  }, [loading, isAuthenticated]);

  // ✅ 4) useRouter controller -> useEffect on load
  useEffect(() => {
    let alive = true;

    const run = async () => {
      if (loading) return;
      if (!isAuthenticated) return;

      try {
        setRouterLoading(true);
        setRouterError("");
        const data = await fetchUseRouterTest();
        if (!alive) return;
        setRouterData(data);
        toast.success("✅ useRouter controller loaded");
      } catch (err) {
        const msg =
          err?.response?.data?.message || err?.message || "Failed to load useRouter";
        console.log("[useRouter useEffect] ❌ error:", err?.response?.data || err?.message || err);
        if (!alive) return;
        setRouterError(msg);
        toast.error(msg);
      } finally {
        if (!alive) return;
        setRouterLoading(false);
      }
    };

    run();

    return () => {
      alive = false;
    };
  }, [loading, isAuthenticated]);

  // ✅ 5) linking controller -> useEffect on load
  useEffect(() => {
    let alive = true;

    const run = async () => {
      if (loading) return;
      if (!isAuthenticated) return;

      try {
        setLinkingLoading(true);
        setLinkingError("");
        const data = await fetchLinkingTest();
        if (!alive) return;
        setLinkingData(data);
        toast.success("✅ linking loaded");
      } catch (err) {
        const msg = err?.response?.data?.message || err?.message || "Failed to load linking";
        console.log("[linking useEffect] ❌ error:", err?.response?.data || err?.message || err);
        if (!alive) return;
        setLinkingError(msg);
        toast.error(msg);
      } finally {
        if (!alive) return;
        setLinkingLoading(false);
      }
    };

    run();

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
          <h1 className="text-2xl font-extrabold">
            Day 26: Auto-Fetch Controller Tests
          </h1>
          <div className="mt-2 text-white/70 text-sm">
            Signed in as{" "}
            <span className="text-white font-bold">
              {user?.email || "unknown@email"}
            </span>
          </div>
          <div className="mt-3 text-xs text-white/50">
            Auto-fetch on page load/refresh (each endpoint has its own
            useEffect).
          </div>
        </div>

        {/* ✅ ONLY THIS SECTION WAS UPDATED */}
        <Section title="1) Props Controller" subtitle="GET /web/api/day26/test">
          <button
            onClick={() => {
              console.log("[Props Section] open /dashboard/day26/props");
              router.push("/dashboard/day26/props");
            }}
            className="rounded-xl border border-white/10 bg-black/40 px-4 py-2 hover:bg-black/60"
          >
            Open Props Page →
          </button>

          <div className="mt-4">
            {propsLoading ? (
              <div className="text-white/70">Loading...</div>
            ) : propsError ? (
              <div className="rounded-xl border border-red-500/30 bg-black/60 p-4 text-white/80">
                ❌ {propsError}
              </div>
            ) : propsData ? (
              <div className="space-y-4">
                <JsonBox data={propsData} />

                {/* ✅ PROPS DEMO (ONLY ADDED HERE) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <PropsMessage message={propsData?.props} />
                  <PropsUserCard userObj={propsData?.user} />
                </div>
              </div>
            ) : (
              <div className="text-white/60 text-sm">No data yet.</div>
            )}
          </div>
        </Section>

        <Section
          title="2) useParams Controller"
          subtitle="GET /web/api/day26/useParams"
        >
          {paramsLoading ? (
            <div className="text-white/70">Loading...</div>
          ) : paramsError ? (
            <div className="rounded-xl border border-red-500/30 bg-black/60 p-4 text-white/80">
              ❌ {paramsError}
            </div>
          ) : paramsData ? (
            <JsonBox data={paramsData} />
          ) : (
            <div className="text-white/60 text-sm">No data yet.</div>
          )}
        </Section>

        <Section
          title="3) useSearchParams Controller"
          subtitle="GET /web/api/day26/useSearchParams"
        >
          {searchParamsLoading ? (
            <div className="text-white/70">Loading...</div>
          ) : searchParamsError ? (
            <div className="rounded-xl border border-red-500/30 bg-black/60 p-4 text-white/80">
              ❌ {searchParamsError}
            </div>
          ) : searchParamsData ? (
            <JsonBox data={searchParamsData} />
          ) : (
            <div className="text-white/60 text-sm">No data yet.</div>
          )}
        </Section>

        <Section
          title="4) useRouter Controller + Router Demo"
          subtitle="GET /web/api/day26/useRouter (plus router.push('/login') demo button)"
        >
          <button
            onClick={() => {
              console.log("[useRouter demo] router.push('/login') clicked");
              router.push("/login");
            }}
            className="rounded-xl border border-white/10 bg-black/40 px-4 py-2 hover:bg-black/60"
          >
            Go to Login (useRouter)
          </button>

          <div className="mt-4">
            {routerLoading ? (
              <div className="text-white/70">Loading...</div>
            ) : routerError ? (
              <div className="rounded-xl border border-red-500/30 bg-black/60 p-4 text-white/80">
                ❌ {routerError}
              </div>
            ) : routerData ? (
              <JsonBox data={routerData} />
            ) : (
              <div className="text-white/60 text-sm">No data yet.</div>
            )}
          </div>
        </Section>

        <Section
          title="5) Linking Controller + Link Demo"
          subtitle="GET /web/api/day26/linking (plus <Link /> demo)"
        >
          <Link
            href="/login"
            className="rounded-xl border border-white/10 bg-black/40 px-4 py-2 hover:bg-black/60 inline-flex items-center justify-center"
            onClick={() =>
              console.log("[Linking demo] <Link href='/login'> clicked")
            }
          >
            Go to Login (Link)
          </Link>

          <div className="mt-4">
            {linkingLoading ? (
              <div className="text-white/70">Loading...</div>
            ) : linkingError ? (
              <div className="rounded-xl border border-red-500/30 bg-black/60 p-4 text-white/80">
                ❌ {linkingError}
              </div>
            ) : linkingData ? (
              <JsonBox data={linkingData} />
            ) : (
              <div className="text-white/60 text-sm">No data yet.</div>
            )}
          </div>
        </Section>

        <div className="mt-2 text-xs text-white/50">
          <Link className="underline text-white/80" href="/dashboard">
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
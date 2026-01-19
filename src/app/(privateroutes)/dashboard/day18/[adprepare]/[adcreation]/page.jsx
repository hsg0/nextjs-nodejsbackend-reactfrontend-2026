// src/app/(privateroutes)/dashboard/day18/[adprepare]/[adcreation]/page.jsx
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { toast } from "react-toastify";
import callBackend from "@/lib/callBackend";

export default function AdCreationPage() {
  const router = useRouter();
  const params = useParams();
  const sp = useSearchParams();

  const adprepare = String(params?.adprepare || "");
  const adcreation = String(params?.adcreation || "");
  const email = sp.get("email") || "";

  const [status, setStatus] = useState("loading"); // loading | uploaded | processing | ready | error | discarded
  const [videoUrl, setVideoUrl] = useState("");
  const [productUrl, setProductUrl] = useState("");
  const [actorUrl, setActorUrl] = useState("");
  const [busy, setBusy] = useState(false);

  const pollRef = useRef(null);

  const canPlay = useMemo(() => Boolean(videoUrl), [videoUrl]);

  const fetchCreation = async () => {
    try {
      console.log("[AdCreationPage] fetching /get-adcreation for:", adcreation);
      const res = await callBackend.get("/web/api/day18/get-adcreation", {
        params: { adcreation },
      });

      console.log("[AdCreationPage] get-adcreation response:", res.data);

      const s = String(res?.data?.status || "unknown");
      setStatus(s);

      setVideoUrl(String(res?.data?.videoUrl || ""));
      setProductUrl(String(res?.data?.productUrl || ""));
      setActorUrl(String(res?.data?.actorUrl || ""));

      return { status: s, videoUrl: String(res?.data?.videoUrl || "") };
    } catch (err) {
      console.log("[AdCreationPage] fetchCreation error:", err?.response?.data || err?.message || err);
      // 410 means discarded
      if (err?.response?.status === 410) {
        setStatus("discarded");
        return { status: "discarded", videoUrl: "" };
      }
      setStatus("error");
      return { status: "error", videoUrl: "" };
    }
  };

  // On mount: fetch + poll until ready (or error)
  useEffect(() => {
    console.log("[AdCreationPage] params:", params);
    console.log("[AdCreationPage] email:", email);
    console.log("[AdCreationPage] adcreation:", adcreation);

    toast.info("⚙️ Loading your ad creation…", { toastId: "adcreation-load" });

    let active = true;

    const start = async () => {
      const first = await fetchCreation();

      // If already ready, stop.
      if (!active) return;
      if (first.status === "ready" && first.videoUrl) {
        toast.success("✅ Ad is ready!", { toastId: "adcreation-ready" });
        return;
      }

      // Poll every 4s up to ~2 minutes
      let tries = 0;
      pollRef.current = setInterval(async () => {
        tries += 1;
        if (!active) return;

        const r = await fetchCreation();
        if (r.status === "ready" && r.videoUrl) {
          toast.success("✅ Ad is ready!", { toastId: "adcreation-ready" });
          clearInterval(pollRef.current);
          pollRef.current = null;
        }

        if (r.status === "discarded" || r.status === "error") {
          clearInterval(pollRef.current);
          pollRef.current = null;
        }

        if (tries >= 30) {
          // 30 * 4s = 120s
          clearInterval(pollRef.current);
          pollRef.current = null;
          toast.info("Still processing. You can refresh this page in a bit.", { toastId: "adcreation-time" });
        }
      }, 4000);
    };

    start();

    return () => {
      active = false;
      if (pollRef.current) clearInterval(pollRef.current);
      pollRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const discard = async () => {
    try {
      setBusy(true);
      toast.info("🗑️ Discarding ad…", { toastId: "discard-start" });

      console.log("[AdCreationPage] DELETE /delete-adcreation body:", { adcreation });

      // axios delete with body must be sent as { data: ... }
      const res = await callBackend.delete("/web/api/day18/delete-adcreation", {
        data: { adcreation },
      });

      console.log("[AdCreationPage] discard response:", res.data);

      toast.success("✅ Discarded", { toastId: "discard-ok" });
      setStatus("discarded");
      setVideoUrl("");
      setProductUrl("");
      setActorUrl("");

      // send user back to day18 root (or wherever you want)
      router.push("/dashboard/day18");
    } catch (err) {
      console.log("[AdCreationPage] discard failed:", err?.response?.data || err?.message || err);
      toast.error("❌ Discard failed. Check backend logs.", { toastId: "discard-fail" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="overflow-hidden rounded-3xl bg-white/5 ring-1 ring-white/10 shadow-2xl">
      <div className="relative px-6 sm:px-10 py-10 sm:py-12">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 -right-24 h-80 w-80 rounded-full blur-3xl opacity-25 bg-orange-500" />
          <div className="absolute top-16 -left-24 h-80 w-80 rounded-full blur-3xl opacity-15 bg-red-500" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-96 w-[70vw] rounded-full blur-3xl opacity-10 bg-amber-300" />
        </div>

        <div className="relative">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-xs text-white/50">SkullFire • Day 18</div>
              <h1 className="mt-2 text-2xl sm:text-3xl font-semibold text-white">Forging Your Ad</h1>
              <p className="mt-3 text-white/75 max-w-3xl">
                This page auto-loads your creation from Mongo (URLs stored from ImageKit). If it’s still processing,
                we’ll keep checking.
              </p>
            </div>

            <button
              type="button"
              disabled={busy}
              onClick={discard}
              className={[
                "rounded-2xl px-4 py-2 text-sm font-semibold",
                "bg-white/5 hover:bg-white/10 text-white",
                "ring-1 ring-white/10 transition",
                "focus:outline-none focus:ring-2 focus:ring-white/20",
                busy ? "opacity-60 cursor-not-allowed" : "",
              ].join(" ")}
            >
              Discard
            </button>
          </div>

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
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-white">Status</div>
                <div className="mt-1 text-sm text-white/70">
                  {status === "ready"
                    ? "✅ Ready"
                    : status === "processing"
                    ? "⚙️ Processing..."
                    : status === "uploaded"
                    ? "📦 Uploaded (waiting for processing...)"
                    : status === "discarded"
                    ? "🗑️ Discarded"
                    : status === "error"
                    ? "❌ Error"
                    : "Loading..."}
                </div>
              </div>

              <button
                type="button"
                disabled={busy}
                onClick={fetchCreation}
                className={[
                  "rounded-2xl px-4 py-2 text-sm font-semibold",
                  "bg-white/5 hover:bg-white/10 text-white",
                  "ring-1 ring-white/10 transition",
                  "focus:outline-none focus:ring-2 focus:ring-white/20",
                  busy ? "opacity-60 cursor-not-allowed" : "",
                ].join(" ")}
              >
                Refresh
              </button>
            </div>

            <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className={[
                  "h-full transition-all",
                  status === "ready" ? "w-full bg-orange-500/60" : status === "processing" ? "w-2/3 bg-orange-500/40" : "w-1/3 bg-orange-500/25",
                ].join(" ")}
              />
            </div>
          </div>

          {/* Preview + Video */}
          <div className="mt-8 grid gap-5 lg:grid-cols-2">
            <div className="rounded-3xl bg-zinc-950/40 ring-1 ring-white/10 p-5">
              <div className="text-sm font-semibold text-white">Inputs (stored on ImageKit)</div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-3">
                  <div className="text-xs text-white/50">Product</div>
                  {productUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={productUrl} alt="product" className="mt-2 h-40 w-full object-cover rounded-xl" />
                  ) : (
                    <div className="mt-2 text-xs text-white/60">No URL yet</div>
                  )}
                </div>

                <div className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-3">
                  <div className="text-xs text-white/50">Actor</div>
                  {actorUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={actorUrl} alt="actor" className="mt-2 h-40 w-full object-cover rounded-xl" />
                  ) : (
                    <div className="mt-2 text-xs text-white/60">No URL yet</div>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-3xl bg-zinc-950/40 ring-1 ring-white/10 p-5">
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm font-semibold text-white">Ad Video Output</div>

                {canPlay ? (
                  <a
                    href={videoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-orange-200 hover:text-orange-100 underline"
                  >
                    Download / Open
                  </a>
                ) : null}
              </div>

              {!canPlay ? (
                <div className="mt-4 text-sm text-white/70">
                  Video URL not ready yet. If it’s processing, this page will keep checking…
                </div>
              ) : (
                <div className="mt-4">
                  <video
                    src={videoUrl}
                    controls
                    playsInline
                    className="w-full rounded-2xl ring-1 ring-white/10 bg-black"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 sm:px-10 py-4 border-t border-white/10 bg-zinc-950/40">
        <div className="text-xs text-white/50">
          Backend endpoints used: set-day18-data → generate → get-adcreation → delete-adcreation
        </div>
      </div>
    </section>
  );
}
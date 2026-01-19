// src/app/(privateroutes)/dashboard/day18/[adprepare]/page.jsx
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import callBackend from "@/lib/callBackend";

/* ---------------- SkullFire Mark ---------------- */
function SkullFireMark({ className = "" }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" aria-hidden="true">
      <path
        d="M34 6c2 6-2 10-6 14-5 5-6 10-4 16 2 8 10 12 18 10 9-2 15-10 14-19-1-9-8-15-13-21 1 6-2 9-9 10z"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path
        d="M16 37c0-9 7-16 16-16s16 7 16 16c0 6-3 11-8 14v6c0 2-2 4-4 4H28c-2 0-4-2-4-4v-6c-5-3-8-8-8-14z"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path
        d="M26 39c0 2-1 3-3 3s-3-1-3-3 1-3 3-3 3 1 3 3zm18 0c0 2-1 3-3 3s-3-1-3-3 1-3 3-3 3 1 3 3z"
        fill="currentColor"
      />
      <path
        d="M24 50h16M28 50v6M36 50v6"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* ---------------- Helpers ---------------- */
const MAX_BYTES = 10 * 1024 * 1024; // 10MB

function bytesToMB(bytes) {
  return Math.round((bytes / (1024 * 1024)) * 100) / 100;
}

// Basic image “wash down” to <= 10MB using canvas (JPEG output).
async function compressImageToMax(file, maxBytes = MAX_BYTES) {
  try {
    console.log("[compressImageToMax] incoming:", file?.name, file?.type, file?.size);

    if (!file || !(file instanceof File)) return file;
    if (file.size <= maxBytes) return file;

    toast.info(`Image is ${bytesToMB(file.size)}MB. Washing down to ≤ 10MB...`, {
      toastId: `compress-${file.name}`,
    });

    const dataUrl = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    const img = await new Promise((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = reject;
      i.src = dataUrl;
    });

    // Start with a reasonable max dimension
    let targetW = img.width;
    let targetH = img.height;
    const maxDim = 1920;
    if (Math.max(targetW, targetH) > maxDim) {
      const scale = maxDim / Math.max(targetW, targetH);
      targetW = Math.round(targetW * scale);
      targetH = Math.round(targetH * scale);
    }

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d", { alpha: false });
    canvas.width = targetW;
    canvas.height = targetH;

    ctx.drawImage(img, 0, 0, targetW, targetH);

    // iterate quality down
    let quality = 0.92;
    let blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));

    // if still too big, reduce quality and (sometimes) dimensions
    let attempts = 0;
    while (blob && blob.size > maxBytes && attempts < 10) {
      attempts += 1;
      quality = Math.max(0.45, quality - 0.07);

      // every few attempts also shrink dimensions
      if (attempts % 3 === 0) {
        targetW = Math.round(targetW * 0.85);
        targetH = Math.round(targetH * 0.85);
        canvas.width = targetW;
        canvas.height = targetH;
        ctx.drawImage(img, 0, 0, targetW, targetH);
      }

      blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
      console.log("[compressImageToMax] attempt:", attempts, "quality:", quality, "size:", blob?.size);
    }

    if (!blob) return file;

    const washed = new File([blob], file.name.replace(/\.\w+$/, "") + ".jpg", {
      type: "image/jpeg",
    });

    console.log("[compressImageToMax] washed result:", washed.name, washed.type, washed.size);
    toast.success(`Washed down to ${bytesToMB(washed.size)}MB ✅`, {
      toastId: `compressed-ok-${file.name}`,
    });

    return washed;
  } catch (err) {
    console.log("[compressImageToMax] failed:", err?.message || err);
    toast.error("Could not compress image. Please try a smaller file.", {
      toastId: `compress-fail-${file?.name}`,
    });
    return file;
  }
}

/* ---------------- DropZone ---------------- */
function DropZone({ label, hint, file, previewUrl, onPick, onClear, inputRef, accept = "image/*" }) {
  const [dragOver, setDragOver] = useState(false);

  return (
    <div className="rounded-3xl bg-zinc-950/40 ring-1 ring-white/10 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-white">{label}</div>
          <div className="text-xs text-white/60 mt-1">{hint}</div>
        </div>

        {file ? (
          <button type="button" onClick={onClear} className="text-xs text-white/70 hover:text-white underline">
            Remove
          </button>
        ) : (
          <button
            type="button"
            onClick={() => inputRef?.current?.click()}
            className="text-xs text-orange-200 hover:text-orange-100 underline"
          >
            Upload
          </button>
        )}
      </div>

      <div
        className={[
          "mt-4 rounded-2xl border border-dashed p-5 transition",
          dragOver ? "border-orange-400/60 bg-orange-500/10" : "border-white/15 bg-white/5",
        ].join(" ")}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const f = e.dataTransfer.files?.[0];
          if (f) onPick(f);
        }}
      >
        {!file ? (
          <div className="text-center">
            <div className="text-sm text-white/80">Drag & drop your image here</div>
            <div className="text-xs text-white/50 mt-1">or click Upload • max 10MB (we’ll wash down if bigger)</div>

            <button
              type="button"
              onClick={() => inputRef?.current?.click()}
              className={[
                "mt-4 inline-flex items-center justify-center",
                "rounded-2xl px-4 py-2 text-xs font-semibold",
                "bg-white/5 hover:bg-white/10 text-white",
                "ring-1 ring-white/10 transition",
                "focus:outline-none focus:ring-2 focus:ring-white/20",
              ].join(" ")}
            >
              Choose File
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl overflow-hidden ring-1 ring-white/10 bg-black/30 shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={previewUrl} alt="preview" className="h-full w-full object-cover" />
            </div>

            <div className="min-w-0">
              <div className="text-sm text-white truncate">{file.name}</div>
              <div className="text-xs text-white/60">
                {bytesToMB(file.size)}MB • {file.type || "file"}
              </div>
            </div>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onPick(f);
        }}
      />
    </div>
  );
}

/* ---------------- Page ---------------- */
export default function AdPreparePage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const adprepare = String(params?.adprepare || "");
  const parsed = useMemo(() => {
    const parts = adprepare.split("__");
    return {
      raw: adprepare,
      userId: parts.length > 1 ? parts[0] : null,
      sessionId: parts.length > 1 ? parts.slice(1).join("__") : adprepare,
    };
  }, [adprepare]);

  const productInputRef = useRef(null);
  const actorInputRef = useRef(null);

  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [productFile, setProductFile] = useState(null);
  const [actorFile, setActorFile] = useState(null);
  const [directions, setDirections] = useState("");
  const [actorWords, setActorWords] = useState("");

  const [uploading, setUploading] = useState(false); // Step 1
  const [uploadedOk, setUploadedOk] = useState(false); // Step 1 done
  const [nextCountdown, setNextCountdown] = useState(0); // 5s
  const [canGenerate, setCanGenerate] = useState(false); // Step 2 button enabled

  const [generating, setGenerating] = useState(false); // Step 2
  const [genCountdown, setGenCountdown] = useState(0); // 30s
  const [serverAdCreation, setServerAdCreation] = useState(""); // returned from backend

  const productPreview = useMemo(() => (productFile ? URL.createObjectURL(productFile) : ""), [productFile]);
  const actorPreview = useMemo(() => (actorFile ? URL.createObjectURL(actorFile) : ""), [actorFile]);

  // If email not in URL, fetch it from backend (protected)
  useEffect(() => {
    const run = async () => {
      try {
        if (email) return;
        console.log("[AdPreparePage] email missing. Fetching from backend...");
        const res = await callBackend.get("/web/api/day18/get-day18-data");
        console.log("[AdPreparePage] get-day18-data:", res.data);
        const e = res?.data?.email;
        if (e) setEmail(String(e));
      } catch (err) {
        console.log("[AdPreparePage] failed to fetch email:", err?.message || err);
      }
    };
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pickProduct = async (file) => {
    console.log("[AdPreparePage] product pick:", file?.name, file?.size);
    if (!file.type?.startsWith("image/")) {
      toast.error("Product file must be an image.", { toastId: "prod-not-image" });
      return;
    }
    const washed = await compressImageToMax(file, MAX_BYTES);
    setProductFile(washed);
    setUploadedOk(false);
    setCanGenerate(false);
  };

  const pickActor = async (file) => {
    console.log("[AdPreparePage] actor pick:", file?.name, file?.size);
    if (!file.type?.startsWith("image/")) {
      toast.error("Actor file must be an image.", { toastId: "actor-not-image" });
      return;
    }
    const washed = await compressImageToMax(file, MAX_BYTES);
    setActorFile(washed);
    setUploadedOk(false);
    setCanGenerate(false);
  };

  // Step 1: upload + save session
 // Step 1: upload + save session
const forgeUpload = async () => {
  try {
    if (!productFile) return toast.error("Please add a product image (Step 1).", { toastId: "need-product" });
    if (!actorFile) return toast.error("Please add an actor image (Step 2).", { toastId: "need-actor" });
    if (!directions.trim()) return toast.error("Please add ad directions (Step 3).", { toastId: "need-directions" });
    if (!actorWords.trim()) return toast.error("Please add actor words (Step 4).", { toastId: "need-words" });

    setUploading(true);
    setUploadedOk(false);
    setCanGenerate(false);
    setServerAdCreation("");

    toast.info("🔥 Step 1: Uploading & saving session…", { toastId: "step1-start" });

    const form = new FormData();
    form.append("adprepare", parsed.raw);
    form.append("email", email || "");
    form.append("directions", directions);
    form.append("actorWords", actorWords);
    form.append("productImage", productFile);
    form.append("actorImage", actorFile);

    const res = await callBackend.post("/web/api/day18/set-day18-data", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    console.log("[AdPreparePage] step1 response:", res.data);

    toast.success("✅ Step 1 complete. Preparing next step…", { toastId: "step1-ok" });
    setUploadedOk(true);

    // 5 second timer then enable Step 2
    setNextCountdown(5);
    setCanGenerate(false);

    const interval = setInterval(() => {
      setNextCountdown((prev) => {
        const next = prev - 1;
        if (next <= 0) {
          clearInterval(interval);
          setCanGenerate(true);
          toast.info("✨ Step 2 unlocked: Generate Ad", { toastId: "step2-unlocked" });
          return 0;
        }
        return next;
      });
    }, 1000);
  } catch (err) {
    const data = err?.response?.data;
    const status = err?.response?.status;

    console.log("[AdPreparePage] step1 failed:", data || err?.message || err);

    // ✅ If session already exists, continue to it
    if (status === 409 && data?.adcreation) {
      toast.info("This session already exists — opening your existing ad…", { toastId: "exists" });

      const qp = new URLSearchParams();
      if (email) qp.set("email", email);

      router.push(`/dashboard/day18/${parsed.raw}/${data.adcreation}?${qp.toString()}`);
      return;
    }

    toast.error("❌ Step 1 failed. Check backend logs.", { toastId: "step1-fail" });
    setUploadedOk(false);
    setCanGenerate(false);
  } finally {
    setUploading(false);
  }
};

  // Step 2: trigger backend generation (backend creates adcreation)
  const triggerGenerate = async () => {
    try {
      if (!uploadedOk) {
        toast.error("Step 1 must complete first.", { toastId: "must-step1" });
        return;
      }
      if (!canGenerate) {
        toast.info("Please wait for Step 2 to unlock…", { toastId: "wait-unlock" });
        return;
      }

      setGenerating(true);
      toast.info("⚙️ Step 2: Generating your ad…", { toastId: "step2-start" });

      const res = await callBackend.post("/web/api/day18/generate", {
        adprepare: parsed.raw,
      });

      console.log("[AdPreparePage] generate response:", res.data);

      const adcreation = String(res?.data?.adcreation || "");
      if (!adcreation) {
        toast.error("Backend did not return adcreation. Check logs.", { toastId: "no-adcreation" });
        setGenerating(false);
        return;
      }

      setServerAdCreation(adcreation);

      toast.success("✅ Generation started. Your ad is on the way…", { toastId: "step2-ok" });

      // 30 second UX timer before redirect
      setGenCountdown(30);

      const interval = setInterval(() => {
        setGenCountdown((prev) => {
          const next = prev - 1;
          if (next <= 0) {
            clearInterval(interval);

            const qp = new URLSearchParams();
            if (email) qp.set("email", email);

            toast.info("🚀 Redirecting to your ad page now…", { toastId: "redirecting" });

            router.push(`/dashboard/day18/${parsed.raw}/${adcreation}?${qp.toString()}`);
            return 0;
          }
          return next;
        });
      }, 1000);
    } catch (err) {
      console.log("[AdPreparePage] generate failed:", err?.response?.data || err?.message || err);
      toast.error("❌ Step 2 failed. Check backend logs.", { toastId: "step2-fail" });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="relative">
      <section className="overflow-hidden rounded-3xl bg-white/5 ring-1 ring-white/10 shadow-2xl">
        <div className="relative px-6 sm:px-10 py-10 sm:py-12">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -top-24 -right-24 h-80 w-80 rounded-full blur-3xl opacity-25 bg-orange-500" />
            <div className="absolute top-16 -left-24 h-80 w-80 rounded-full blur-3xl opacity-15 bg-red-500" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-96 w-[70vw] rounded-full blur-3xl opacity-10 bg-amber-300" />
          </div>

          <div className="relative">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute -inset-2 rounded-3xl blur-lg opacity-70 bg-gradient-to-r from-orange-500 via-red-500 to-amber-400" />
                <div className="relative rounded-3xl bg-zinc-950 ring-1 ring-white/10 p-3">
                  <SkullFireMark className="h-9 w-9 text-orange-300" />
                </div>
              </div>

              <div className="min-w-0">
                <div className="text-xs text-white/50">SkullFire • Day 18</div>
                <h1 className="text-2xl sm:text-3xl font-semibold text-white">Ad Generator • Prepare</h1>
                <div className="mt-1 text-xs text-white/45 break-all">
                  session: <span className="text-white/60">{parsed.raw}</span>
                </div>
              </div>
            </div>

            <p className="mt-6 text-white/75 max-w-3xl leading-relaxed">
              Step 1 uploads your images + saves the session by <span className="text-white font-medium">adprepare</span>.
              Step 2 triggers generation and the backend returns the real{" "}
              <span className="text-white font-medium">adcreation</span>.
            </p>

            <div className="mt-8 grid gap-5 lg:grid-cols-2">
              <DropZone
                label="Step 1 — Product Image"
                hint="Drag & drop or upload a product image (max 10MB; we’ll wash down if larger)."
                file={productFile}
                previewUrl={productPreview}
                inputRef={productInputRef}
                onPick={pickProduct}
                onClear={() => {
                  setProductFile(null);
                  setUploadedOk(false);
                  setCanGenerate(false);
                }}
              />

              <DropZone
                label="Step 2 — Actor Image"
                hint="Drag & drop or upload an actor image (max 10MB; we’ll wash down if larger)."
                file={actorFile}
                previewUrl={actorPreview}
                inputRef={actorInputRef}
                onPick={pickActor}
                onClear={() => {
                  setActorFile(null);
                  setUploadedOk(false);
                  setCanGenerate(false);
                }}
              />
            </div>

            <div className="mt-6 grid gap-5 lg:grid-cols-2">
              <div className="rounded-3xl bg-zinc-950/40 ring-1 ring-white/10 p-5">
                <div className="text-sm font-semibold text-white">Step 3 — Ad Directions</div>
                <div className="text-xs text-white/60 mt-1">
                  Example: “Dark background, orange glow, bold headline, product on left, actor on right.”
                </div>
                <textarea
                  value={directions}
                  onChange={(e) => {
                    setDirections(e.target.value);
                    setUploadedOk(false);
                    setCanGenerate(false);
                  }}
                  rows={6}
                  className={[
                    "mt-4 w-full rounded-2xl px-4 py-3 text-sm",
                    "bg-white/5 text-white placeholder:text-white/30",
                    "ring-1 ring-white/10 focus:ring-2 focus:ring-orange-400/30",
                    "outline-none resize-none",
                  ].join(" ")}
                  placeholder="Describe the ad style, layout, mood, colors, camera angle, etc..."
                />
              </div>

              <div className="rounded-3xl bg-zinc-950/40 ring-1 ring-white/10 p-5">
                <div className="text-sm font-semibold text-white">Step 4 — Actor Script</div>
                <div className="text-xs text-white/60 mt-1">
                  What should the actor say in the ad? Keep it short + punchy.
                </div>
                <textarea
                  value={actorWords}
                  onChange={(e) => {
                    setActorWords(e.target.value);
                    setUploadedOk(false);
                    setCanGenerate(false);
                  }}
                  rows={6}
                  className={[
                    "mt-4 w-full rounded-2xl px-4 py-3 text-sm",
                    "bg-white/5 text-white placeholder:text-white/30",
                    "ring-1 ring-white/10 focus:ring-2 focus:ring-orange-400/30",
                    "outline-none resize-none",
                  ].join(" ")}
                  placeholder='Example: “SkullFire gives me the power to crush my day — let’s go!”'
                />
              </div>
            </div>

            {/* STEP 1 BUTTON */}
            <div className="mt-8 flex flex-col gap-3">
              <button
                type="button"
                disabled={uploading || generating}
                onClick={forgeUpload}
                className={[
                  "inline-flex items-center justify-center",
                  "rounded-2xl px-6 py-3 text-sm font-semibold",
                  "bg-orange-500/20 hover:bg-orange-500/25",
                  "text-orange-200 ring-1 ring-orange-400/30",
                  "transition focus:outline-none focus:ring-2 focus:ring-orange-400/40",
                  uploading || generating ? "opacity-60 cursor-not-allowed" : "",
                ].join(" ")}
              >
                {uploading ? "Uploading..." : "Step 1 — Upload + Save Session"}
              </button>

              {/* 5s timer UI */}
              {uploadedOk && !canGenerate ? (
                <div className="text-xs text-white/60">
                  ✅ Step 1 complete. Step 2 unlocks in{" "}
                  <span className="text-orange-200 font-semibold">{nextCountdown}s</span>…
                </div>
              ) : null}

              {/* STEP 2 BUTTON */}
              <button
                type="button"
                disabled={!canGenerate || generating || uploading}
                onClick={triggerGenerate}
                className={[
                  "inline-flex items-center justify-center",
                  "rounded-2xl px-6 py-3 text-sm font-semibold",
                  canGenerate ? "bg-white/5 hover:bg-white/10 text-white ring-1 ring-white/15" : "bg-white/2 text-white/40 ring-1 ring-white/5",
                  "transition focus:outline-none focus:ring-2 focus:ring-white/20",
                  !canGenerate || generating || uploading ? "opacity-70 cursor-not-allowed" : "",
                ].join(" ")}
              >
                {generating ? "Starting generation..." : "Step 2 — Generate Ad (Backend creates adcreation)"}
              </button>

              {/* 30s timer UI */}
              {serverAdCreation && genCountdown > 0 ? (
                <div className="rounded-2xl bg-zinc-950/40 ring-1 ring-white/10 p-4">
                  <div className="text-sm text-white font-semibold">Your ad is being processed 🔥</div>
                  <div className="mt-1 text-xs text-white/60">
                    We started generation and got your <span className="text-white/80">adcreation</span>:{" "}
                    <span className="text-orange-200">{serverAdCreation}</span>
                  </div>
                  <div className="mt-2 text-xs text-white/60">
                    Redirecting to your ad page in{" "}
                    <span className="text-orange-200 font-semibold">{genCountdown}s</span>…
                  </div>
                  <div className="mt-2 text-xs text-white/50">
                    Next page: <span className="text-white/70">/dashboard/day18/{parsed.raw}/{serverAdCreation}?email=...</span>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="px-6 sm:px-10 py-4 border-t border-white/10 bg-zinc-950/40">
          <div className="text-xs text-white/50">
            Upload limit: 10MB each. Oversized images are automatically washed down on the client.
          </div>
        </div>
      </section>
    </div>
  );
}
"use client";

import React, { useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-toastify";
import useAuthCheck from "@/checkAuth/authCheck.js";

export default function Day21LabReqPage() {
  const router = useRouter();
  const params = useParams();
  const { loading, user } = useAuthCheck();

  // NOTE: your dynamic segment is named [prescription] but it's actually your webUserId
  const webUserIdFromRoute = params?.prescription || "";

  const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

  // GET /web/api/day21/templates/labreq
  const templateUrl = useMemo(() => {
    const url = `${BACKEND}/web/api/day21/templates/labreq`;
    return url;
  }, [BACKEND]);

  useEffect(() => {
    console.log("[LabReqPage] loaded");
    console.log("[LabReqPage] webUserIdFromRoute:", webUserIdFromRoute);
    console.log("[LabReqPage] templateUrl:", templateUrl);
    console.log("[LabReqPage] user:", user);
  }, [webUserIdFromRoute, templateUrl, user]);

  const openTemplateNewTab = () => {
    console.log("[LabReqPage] openTemplateNewTab clicked");
    toast.info("Opening template…", { toastId: "open-template" });
    window.open(templateUrl, "_blank");
  };

  const goBackToHub = () => {
    const dest = `/dashboard/day21/${webUserIdFromRoute}`;
    console.log("[LabReqPage] goBackToHub ->", dest);
    router.push(dest);
  };

  const goToFillStep = () => {
    const dest = `/dashboard/day21/${webUserIdFromRoute}/labreq/fill`;
    console.log("[LabReqPage] goToFillStep ->", dest);
    router.push(dest);
  };

  // ✅ NEW: go to JSX version that matches the PDF
  const goToJSXVersion = () => {
    const dest = `/dashboard/day21/${webUserIdFromRoute}/labreq/labReqInCode`;
    console.log("[LabReqPage] goToJSXVersion ->", dest);
    router.push(dest);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Loading…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white px-6 py-10">
      <div className="mx-auto w-full max-w-6xl">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold">🧪 Lab Requisition</h1>
              <p className="text-white/60 mt-1">
                PDF template preview + workflow. Now also includes a JSX version you can save to MongoDB.
              </p>

              <div className="mt-3 text-sm text-white/60">
                Route param [prescription] (webUserId):{" "}
                <span className="text-white">{webUserIdFromRoute || "(missing)"}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={goBackToHub}
                className="rounded-xl border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 px-4 py-2 font-bold"
              >
                ← Back
              </button>

              <button
                onClick={openTemplateNewTab}
                className="rounded-xl border border-purple-500/40 bg-purple-600/20 hover:bg-purple-600/30 px-4 py-2 font-bold"
              >
                Open Template (New Tab)
              </button>

              <button
                onClick={goToFillStep}
                className="rounded-xl bg-purple-600 hover:bg-purple-500 px-4 py-2 font-bold"
              >
                Fill + Finalize (PDF) →
              </button>

              {/* ✅ NEW */}
              <button
                onClick={goToJSXVersion}
                className="rounded-xl border border-orange-500/40 bg-orange-600/15 hover:bg-orange-600/25 px-4 py-2 font-bold"
              >
                JSX Version (Save to Mongo) →
              </button>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-zinc-800 bg-black/40 p-3">
            <div className="text-sm text-white/60 mb-2">Inline Preview (browser PDF viewer)</div>

            <iframe
              title="Lab Requisition Template"
              src={templateUrl}
              className="w-full h-[78vh] rounded-xl bg-white"
            />
          </div>

          <div className="mt-4 text-xs text-white/50">
            Note: Some browsers don’t reliably save filled PDF form fields from an iframe.
            That’s why we compare: JSX saved to Mongo vs PDF generated output.
          </div>
        </div>
      </div>
    </div>
  );
}
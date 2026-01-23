"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-toastify";
import useAuthCheck from "@/checkAuth/authCheck.js";
import callBackend from "@/lib/callBackend.js";

export default function LabReqFillPage() {
  const router = useRouter();
  const params = useParams();
  const { loading, user } = useAuthCheck();

  const webUserIdFromRoute = params?.prescription || "";

  const [form, setForm] = useState({
    ordering_address: "",
    practitioner_or_license: "",
    physician_phone: "",
    physician_email: "",
  });

  useEffect(() => {
    console.log("[LabReqFillPage] loaded");
    console.log("[LabReqFillPage] route webUserId:", webUserIdFromRoute);
    console.log("[LabReqFillPage] user:", user);

    // ✅ Auto-fill from auth user (adjust keys to match your DB model)
    if (user) {
      setForm((prev) => ({
        ...prev,
        ordering_address: user?.clinicAddress || user?.address || "",
        practitioner_or_license: user?.licenseNumber || user?.practitionerNumber || "",
        physician_phone: user?.phone || "",
        physician_email: user?.email || "",
      }));
    }
  }, [webUserIdFromRoute, user]);

  const onChange = (key, val) => {
    console.log("[LabReqFillPage] change", key, "=", val);
    setForm((p) => ({ ...p, [key]: val }));
  };

  const generatePdf = async () => {
    try {
      console.log("[LabReqFillPage] generatePdf clicked");
      console.log("[LabReqFillPage] sending form:", form);

      toast.info("Generating Lab Req PDF…", { toastId: "labreq-gen" });

      const res = await callBackend.post("/web/api/day21/documents/labreq", form, {
        responseType: "blob",
      });

      console.log("[LabReqFillPage] PDF response status:", res?.status);

      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch (err) {
      console.log("[LabReqFillPage] ❌ generate error:", err?.response?.data || err?.message || err);
      toast.error("Failed to generate PDF. Check backend logs.");
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading…</div>;
  }

  return (
    <div className="min-h-screen bg-black text-white px-6 py-10">
      <div className="mx-auto w-full max-w-3xl">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
          <h1 className="text-2xl font-extrabold">🧪 Lab Req — Fill + Finalize</h1>
          <p className="text-white/60 mt-2">
            Auto-filled from auth user. Edit if needed, then generate the PDF.
          </p>

          <div className="mt-6 grid gap-3">
            <label className="text-sm text-white/70">
              Ordering physician address
              <input
                value={form.ordering_address}
                onChange={(e) => onChange("ordering_address", e.target.value)}
                className="mt-1 w-full rounded-xl bg-black/50 border border-zinc-800 px-3 py-2 text-white"
              />
            </label>

            <label className="text-sm text-white/70">
              Physician License / Practitioner number
              <input
                value={form.practitioner_or_license}
                onChange={(e) => onChange("practitioner_or_license", e.target.value)}
                className="mt-1 w-full rounded-xl bg-black/50 border border-zinc-800 px-3 py-2 text-white"
              />
            </label>

            <label className="text-sm text-white/70">
              Physician phone number
              <input
                value={form.physician_phone}
                onChange={(e) => onChange("physician_phone", e.target.value)}
                className="mt-1 w-full rounded-xl bg-black/50 border border-zinc-800 px-3 py-2 text-white"
              />
            </label>

            <label className="text-sm text-white/70">
              Physician email address
              <input
                value={form.physician_email}
                onChange={(e) => onChange("physician_email", e.target.value)}
                className="mt-1 w-full rounded-xl bg-black/50 border border-zinc-800 px-3 py-2 text-white"
              />
            </label>
          </div>

          <div className="mt-6 flex gap-2">
            <button
              onClick={() => router.back()}
              className="rounded-xl border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 px-4 py-2 font-bold"
            >
              ← Back
            </button>

            <button
              onClick={generatePdf}
              className="rounded-xl bg-purple-600 hover:bg-purple-500 px-4 py-2 font-bold"
            >
              Generate PDF →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
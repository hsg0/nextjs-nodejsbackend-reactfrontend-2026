"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-toastify";
import useAuthCheck from "@/checkAuth/authCheck.js";
import callBackend from "@/lib/callBackend.js";

function ssGet(key) {
  try {
    const raw = sessionStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

export default function SendPrescriptionPage() {
  const router = useRouter();
  const { loading, user } = useAuthCheck();

  const params = useParams();
  const prescription = params?.prescription; // doctor webUserId (your dynamic)
  const sendprescription = params?.sendprescription; // your dynamic slug

  const storageKey = useMemo(
    () => `day21_prescription_draft_${prescription}`,
    [prescription]
  );

  const [draft, setDraft] = useState(null);
  const [patientEmail, setPatientEmail] = useState(""); // where we send link
  const [sending, setSending] = useState(false);

  useEffect(() => {
    console.log("[SendPrescription] loaded");
    console.log("[SendPrescription] prescription param:", prescription);
    console.log("[SendPrescription] sendprescription param:", sendprescription);
    console.log("[SendPrescription] storageKey:", storageKey);

    const found = ssGet(storageKey);
    console.log("[SendPrescription] draft from sessionStorage:", found);
    setDraft(found);

    // OPTIONAL: prefill patient email from slug (if slug is like hsg_001 or email)
    // If your slug is not email, ignore.
    // You can also prefill from found meta later if you store it.
  }, [prescription, sendprescription, storageKey]);

  const goBackToHub = () => {
    const dest = `/dashboard/day21/${prescription}`;
    console.log("[SendPrescription] goBackToHub ->", dest);
    router.push(dest);
  };

  const buildDocumentPayload = () => {
    if (!draft) return null;

    const payload = {
      type: "PRESCRIPTION",
      version: 1,

      doctor: {
        webUserId: user?.webUserId || "",
        name: draft?.physician?.physicianName || "",
        contact: draft?.physician?.physicianContact || "",
      },

      patient: {
        name: draft?.patient?.patientName || "",
        dob: draft?.patient?.dob || "",
        healthCardNumber: draft?.patient?.healthCard || "",
        email: patientEmail || "", // we add email here
      },

      clinical: {
        reason: draft?.clinical?.reason || "",
        history: draft?.clinical?.history || "",
      },

      orders: {
        items: (draft?.ordered?.tests || []).map((t) => ({
          label: t?.label || "",
          checked: !!t?.checked,
        })),
      },

      considerations: {
        stat: !!draft?.special?.isSTAT,
        pregnancy: !!draft?.special?.pregnancy,
        notes: draft?.special?.notes || "",
      },

      signature: {
        method: "TYPED",
        typedName: draft?.physician?.signatureTyped || "",
        signedAtISO: new Date().toISOString(),
      },

      audit: {
        createdAtISO: draft?.meta?.createdAt || new Date().toISOString(),
        prescriptionParam: draft?.meta?.prescriptionParam || prescription,
        uiSendSlug: sendprescription || "",
        userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "",
      },
    };

    console.log("[SendPrescription] built payload:", payload);
    return payload;
  };

  const handleSend = async () => {
    console.log("[SendPrescription] handleSend clicked");

    if (!draft) {
      toast.error("No draft found. Go back and create one.", { toastId: "no-draft" });
      return;
    }

    if (!patientEmail) {
      toast.error("Enter patient email to send the link.", { toastId: "missing-patient-email" });
      return;
    }

    const documentPayload = buildDocumentPayload();
    if (!documentPayload) {
      toast.error("Failed to build document payload.", { toastId: "payload-fail" });
      return;
    }

    setSending(true);

    try {
      console.log("[SendPrescription] POST /web/api/documents/prescriptions");
      const res = await callBackend.post("/web/api/day21/documents/prescriptions", { documentPayload });

      console.log("[SendPrescription] response:", res?.data);

      const signedUrl = res?.data?.signedUrl || "";
      const expiresAt = res?.data?.expiresAt || "";

      if (!signedUrl) {
        toast.error("Backend did not return a signedUrl.", { toastId: "no-url" });
        setSending(false);
        return;
      }

      toast.success("✅ Prescription sent successfully!", { toastId: "sent-ok" });

      // Optional: show link briefly, then return
      console.log("[SendPrescription] signedUrl:", signedUrl);
      console.log("[SendPrescription] expiresAt:", expiresAt);

      setTimeout(() => {
        const dest = `/dashboard/day21/${prescription}`;
        console.log("[SendPrescription] redirecting back to hub:", dest);
        router.push(dest);
      }, 800);
    } catch (err) {
      console.log(
        "❌ [SendPrescription] send failed:",
        err?.response?.data || err?.message || err
      );
      toast.error("❌ Send failed. Check backend logs.", { toastId: "send-failed" });
      setSending(false);
    }
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
      <div className="mx-auto w-full max-w-4xl">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
          <div className="flex items-center gap-3">
            <div className="text-3xl">☠️🔥</div>
            <div>
              <h1 className="text-2xl font-extrabold">Finalize & Send Prescription</h1>
              <p className="text-white/60 mt-1">
                This step sends the prescription link to the patient email.
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-zinc-800 bg-black/40 p-4 text-sm text-white/70">
            <div>Doctor param [prescription]: <span className="text-white">{prescription}</span></div>
            <div className="mt-1">Send slug [sendprescription]: <span className="text-white">{sendprescription}</span></div>
          </div>

          {/* Patient email */}
          <div className="mt-6">
            <label className="text-sm text-white/70">Patient Email (send link to)</label>
            <input
              value={patientEmail}
              onChange={(e) => {
                setPatientEmail(e.target.value);
                console.log("[SendPrescription] patientEmail:", e.target.value);
              }}
              placeholder="patient@domain.com"
              className="mt-2 w-full rounded-xl bg-zinc-900 border border-zinc-700 px-4 py-3 outline-none"
            />
          </div>

          {/* Draft preview */}
          <div className="mt-6 rounded-xl border border-zinc-800 bg-white text-black p-5">
            <div className="font-extrabold text-lg">Draft Preview</div>
            {!draft ? (
              <div className="text-black/60 mt-2">No draft found in sessionStorage.</div>
            ) : (
              <div className="mt-3 text-sm">
                <div className="font-bold">Patient</div>
                <div>Name: {draft?.patient?.patientName || "—"}</div>
                <div>DOB: {draft?.patient?.dob || "—"}</div>
                <div>Health Card: {draft?.patient?.healthCard || "—"}</div>

                <hr className="my-3" />

                <div className="font-bold">Clinical</div>
                <div>Reason: {draft?.clinical?.reason || "—"}</div>
                <div className="whitespace-pre-wrap mt-1">
                  History: {draft?.clinical?.history || "—"}
                </div>

                <hr className="my-3" />

                <div className="font-bold">Ordered</div>
                <ul className="list-disc ml-5 mt-1">
                  {(draft?.ordered?.tests || [])
                    .filter((t) => t?.checked)
                    .map((t, idx) => (
                      <li key={idx}>{t?.label}</li>
                    ))}
                  {(draft?.ordered?.tests || []).filter((t) => t?.checked).length === 0 && (
                    <li>No items selected</li>
                  )}
                </ul>

                <hr className="my-3" />

                <div className="font-bold">Physician</div>
                <div>Name: {draft?.physician?.physicianName || "—"}</div>
                <div>Contact: {draft?.physician?.physicianContact || "—"}</div>
                <div>Signature: {draft?.physician?.signatureTyped || "—"}</div>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="mt-6 flex gap-3">
            <button
              onClick={goBackToHub}
              className="rounded-xl border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 px-5 py-3 font-bold"
            >
              ← Back
            </button>

            <button
              onClick={handleSend}
              disabled={sending}
              className="rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-60 px-5 py-3 font-extrabold"
            >
              {sending ? "Sending…" : "Send Prescription"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
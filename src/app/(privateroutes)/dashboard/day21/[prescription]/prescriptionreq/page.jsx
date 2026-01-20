"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import useAuthCheck from "@/checkAuth/authCheck.js";
import { toast } from "react-toastify";

function ssSet(key, value) {
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    return false;
  }
}

export default function PrescriptionReqPage() {
  const router = useRouter();
  const { loading } = useAuthCheck();
  const params = useParams();
  const prescription = params?.prescription;

  const storageKey = useMemo(
    () => `day21_prescription_draft_${prescription}`,
    [prescription]
  );

  const [patientName, setPatientName] = useState("");
  const [dob, setDob] = useState("");
  const [healthCard, setHealthCard] = useState("");

  const [reason, setReason] = useState("");
  const [history, setHistory] = useState("");

  const [tests, setTests] = useState([
    { label: "Medication A (example)", checked: false },
    { label: "Medication B (example)", checked: false },
    { label: "Medication C (example)", checked: false },
  ]);

  const [physicianName, setPhysicianName] = useState("");
  const [physicianContact, setPhysicianContact] = useState("");
  const [signatureTyped, setSignatureTyped] = useState("");

  const [isSTAT, setIsSTAT] = useState(false);
  const [pregnancy, setPregnancy] = useState(false);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    console.log("[PrescriptionReq] loaded");
    console.log("[PrescriptionReq] prescription param:", prescription);
    console.log("[PrescriptionReq] storageKey:", storageKey);
  }, [prescription, storageKey]);

  const toggleTest = (idx) => {
    setTests((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], checked: !next[idx].checked };
      console.log("[PrescriptionReq] toggleTest:", next[idx]);
      return next;
    });
  };

  const addTest = () => {
    setTests((prev) => {
      const next = [...prev, { label: "New item", checked: false }];
      console.log("[PrescriptionReq] addTest -> count:", next.length);
      return next;
    });
  };

  const updateTestLabel = (idx, value) => {
    setTests((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], label: value };
      console.log("[PrescriptionReq] updateTestLabel idx:", idx, "value:", value);
      return next;
    });
  };

  const continueToSend = () => {
    console.log("[PrescriptionReq] continueToSend clicked");

    const draft = {
      patient: { patientName, dob, healthCard },
      clinical: { reason, history },
      ordered: { tests },
      physician: { physicianName, physicianContact, signatureTyped },
      special: { isSTAT, pregnancy, notes },
      meta: { createdAt: new Date().toISOString(), prescriptionParam: prescription },
    };

    console.log("[PrescriptionReq] draft:", draft);

    if (!patientName || !dob || !physicianName) {
      toast.error("Missing required fields (patient name, DOB, physician name).", {
        toastId: "missing-required",
      });
      return;
    }

    const ok = ssSet(storageKey, draft);
    if (!ok) {
      toast.error("Failed to save draft (sessionStorage blocked).", {
        toastId: "ss-fail",
      });
      return;
    }

    toast.success("Draft saved. Moving to send step…", { toastId: "draft-saved" });

    // Your folder is: /prescriptionreq/[sendprescription]
    const dest = `/dashboard/day21/${prescription}/prescriptionreq/sendprescription`;
    console.log("[PrescriptionReq] routing to:", dest);
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
      <div className="mx-auto w-full max-w-5xl grid lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
          <h1 className="text-2xl font-extrabold">🧾 Prescription Draft</h1>
          <p className="text-white/60 mt-1">
            Fill the draft. We’ll send it on the next page.
          </p>

          <div className="mt-6 grid gap-4">
            <div className="rounded-xl border border-zinc-800 p-4">
              <div className="font-bold">Patient Details</div>
              <div className="mt-3 grid gap-3">
                <input
                  value={patientName}
                  onChange={(e) => {
                    setPatientName(e.target.value);
                    console.log("[PrescriptionReq] patientName:", e.target.value);
                  }}
                  placeholder="Patient full name"
                  className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-4 py-3 outline-none"
                />
                <input
                  value={dob}
                  onChange={(e) => {
                    setDob(e.target.value);
                    console.log("[PrescriptionReq] dob:", e.target.value);
                  }}
                  placeholder="Date of birth (YYYY-MM-DD)"
                  className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-4 py-3 outline-none"
                />
                <input
                  value={healthCard}
                  onChange={(e) => {
                    setHealthCard(e.target.value);
                    console.log("[PrescriptionReq] healthCard:", e.target.value);
                  }}
                  placeholder="Health card number"
                  className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-4 py-3 outline-none"
                />
              </div>
            </div>

            <div className="rounded-xl border border-zinc-800 p-4">
              <div className="font-bold">Clinical Information</div>
              <input
                value={reason}
                onChange={(e) => {
                  setReason(e.target.value);
                  console.log("[PrescriptionReq] reason:", e.target.value);
                }}
                placeholder="Reason / provisional diagnosis"
                className="mt-3 w-full rounded-xl bg-zinc-900 border border-zinc-700 px-4 py-3 outline-none"
              />
              <textarea
                value={history}
                onChange={(e) => {
                  setHistory(e.target.value);
                  console.log("[PrescriptionReq] history updated");
                }}
                placeholder="Relevant history"
                rows={4}
                className="mt-3 w-full rounded-xl bg-zinc-900 border border-zinc-700 px-4 py-3 outline-none"
              />
            </div>

            <div className="rounded-xl border border-zinc-800 p-4">
              <div className="flex items-center justify-between">
                <div className="font-bold">Specific Tests / Items Ordered</div>
                <button
                  onClick={addTest}
                  className="rounded-lg border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 px-3 py-2 text-sm font-bold"
                >
                  + Add
                </button>
              </div>

              <div className="mt-3 grid gap-2">
                {tests.map((t, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={t.checked}
                      onChange={() => toggleTest(idx)}
                      className="h-4 w-4"
                    />
                    <input
                      value={t.label}
                      onChange={(e) => updateTestLabel(idx, e.target.value)}
                      className="flex-1 rounded-xl bg-zinc-900 border border-zinc-700 px-4 py-2 outline-none"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-zinc-800 p-4">
              <div className="font-bold">Physician Information</div>
              <div className="mt-3 grid gap-3">
                <input
                  value={physicianName}
                  onChange={(e) => {
                    setPhysicianName(e.target.value);
                    console.log("[PrescriptionReq] physicianName:", e.target.value);
                  }}
                  placeholder="Physician name"
                  className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-4 py-3 outline-none"
                />
                <input
                  value={physicianContact}
                  onChange={(e) => {
                    setPhysicianContact(e.target.value);
                    console.log("[PrescriptionReq] physicianContact:", e.target.value);
                  }}
                  placeholder="Contact info (phone/email/clinic)"
                  className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-4 py-3 outline-none"
                />
                <input
                  value={signatureTyped}
                  onChange={(e) => {
                    setSignatureTyped(e.target.value);
                    console.log("[PrescriptionReq] signatureTyped:", e.target.value);
                  }}
                  placeholder="Signature (typed name for now)"
                  className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-4 py-3 outline-none"
                />
              </div>
            </div>

            <div className="rounded-xl border border-zinc-800 p-4">
              <div className="font-bold">Specialty Considerations</div>
              <div className="mt-3 flex items-center gap-6 text-sm">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={isSTAT}
                    onChange={() => {
                      setIsSTAT((v) => !v);
                      console.log("[PrescriptionReq] isSTAT toggled");
                    }}
                  />
                  STAT (urgent)
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={pregnancy}
                    onChange={() => {
                      setPregnancy((v) => !v);
                      console.log("[PrescriptionReq] pregnancy toggled");
                    }}
                  />
                  Pregnancy considerations
                </label>
              </div>

              <textarea
                value={notes}
                onChange={(e) => {
                  setNotes(e.target.value);
                  console.log("[PrescriptionReq] notes updated");
                }}
                placeholder="Extra notes / accommodations"
                rows={3}
                className="mt-3 w-full rounded-xl bg-zinc-900 border border-zinc-700 px-4 py-3 outline-none"
              />
            </div>

            <button
              onClick={continueToSend}
              className="rounded-xl bg-purple-600 hover:bg-purple-500 px-5 py-3 font-extrabold"
            >
              Continue to Send →
            </button>
          </div>
        </div>

        {/* Preview */}
        <div className="rounded-2xl border border-zinc-800 bg-white text-black p-6">
          <div className="font-extrabold text-xl">Prescription Document Preview</div>
          <div className="text-black/60 text-sm mt-1">Draft (not final PDF yet)</div>

          <hr className="my-4" />

          <div className="text-sm">
            <div className="font-bold">Patient</div>
            <div>Name: {patientName || "—"}</div>
            <div>DOB: {dob || "—"}</div>
            <div>Health Card: {healthCard || "—"}</div>

            <hr className="my-3" />

            <div className="font-bold">Clinical</div>
            <div>Reason: {reason || "—"}</div>
            <div className="mt-1 whitespace-pre-wrap">History: {history || "—"}</div>

            <hr className="my-3" />

            <div className="font-bold">Ordered</div>
            <ul className="list-disc ml-5 mt-1">
              {tests.filter((t) => t.checked).length === 0 ? (
                <li>No items selected</li>
              ) : (
                tests
                  .filter((t) => t.checked)
                  .map((t, idx) => <li key={idx}>{t.label}</li>)
              )}
            </ul>

            <hr className="my-3" />

            <div className="font-bold">Physician</div>
            <div>Name: {physicianName || "—"}</div>
            <div>Contact: {physicianContact || "—"}</div>
            <div>Signature: {signatureTyped || "—"}</div>

            <hr className="my-3" />

            <div className="font-bold">Special</div>
            <div>STAT: {isSTAT ? "YES" : "NO"}</div>
            <div>Pregnancy: {pregnancy ? "YES" : "NO"}</div>
            <div className="mt-1 whitespace-pre-wrap">Notes: {notes || "—"}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
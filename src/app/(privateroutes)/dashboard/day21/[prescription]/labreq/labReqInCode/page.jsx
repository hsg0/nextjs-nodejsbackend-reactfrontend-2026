"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-toastify";
import useAuthCheck from "@/checkAuth/authCheck.js";
import callBackend from "@/lib/callBackend.js";

/* ---------- UI helpers ---------- */
function Card({ title, subtitle, children }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-lg">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-extrabold">{title}</h2>
          {subtitle ? <p className="text-white/60 mt-1 text-sm">{subtitle}</p> : null}
        </div>
      </div>
      <div className="mt-5">{children}</div>
    </div>
  );
}

function SectionTitle({ children }) {
  return <div className="text-base font-extrabold tracking-wide text-white">{children}</div>;
}

function SubTitle({ children }) {
  return <div className="text-sm font-bold text-white/70">{children}</div>;
}

function Divider() {
  return <div className="h-px w-full bg-zinc-800 my-4" />;
}

function Input({ label, value, onChange, placeholder = "" }) {
  return (
    <label className="block text-sm text-white/70">
      <div className="mb-1">{label}</div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl bg-black/50 border border-zinc-800 px-3 py-2 text-white outline-none focus:border-purple-500/60"
      />
    </label>
  );
}

function TextArea({ label, value, onChange, placeholder = "", rows = 4 }) {
  return (
    <label className="block text-sm text-white/70">
      <div className="mb-1">{label}</div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full rounded-xl bg-black/50 border border-zinc-800 px-3 py-2 text-white outline-none focus:border-purple-500/60"
      />
    </label>
  );
}

function Check({ label, checked, onChange, subtle = false }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-left w-full
      ${
        checked
          ? "border-purple-500/60 bg-purple-600/20"
          : subtle
          ? "border-zinc-800 bg-black/15 hover:bg-black/30"
          : "border-zinc-800 bg-black/30 hover:bg-black/50"
      }`}
    >
      <div
        className={`h-4 w-4 rounded border flex items-center justify-center
        ${checked ? "border-purple-400 bg-purple-500/40" : "border-zinc-600 bg-black/40"}`}
      >
        {checked ? "✓" : ""}
      </div>
      <div className="text-sm text-white/80">{label}</div>
    </button>
  );
}

function YesNo({ label, value, setValue }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-black/30 p-4">
      <div className="text-sm text-white/70 mb-3">{label}</div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setValue("yes")}
          className={`rounded-xl px-4 py-2 font-bold border ${
            value === "yes"
              ? "border-green-400/50 bg-green-600/20"
              : "border-zinc-800 bg-black/30 hover:bg-black/50"
          }`}
        >
          Yes
        </button>
        <button
          type="button"
          onClick={() => setValue("no")}
          className={`rounded-xl px-4 py-2 font-bold border ${
            value === "no"
              ? "border-red-400/50 bg-red-600/20"
              : "border-zinc-800 bg-black/30 hover:bg-black/50"
          }`}
        >
          No
        </button>
        <button
          type="button"
          onClick={() => setValue("")}
          className="rounded-xl px-4 py-2 font-bold border border-zinc-800 bg-black/30 hover:bg-black/50"
        >
          Clear
        </button>
      </div>
    </div>
  );
}

/* ---------- page ---------- */
export default function LabReqInCodePage() {
  const router = useRouter();
  const params = useParams();
  const { loading, user } = useAuthCheck();

  // Your folder is [prescription], but it’s your webUserId
  const webUserIdFromRoute = params?.prescription || "";

  const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
  const templateUrl = useMemo(() => `${BACKEND}/web/api/day21/templates/labreq`, [BACKEND]);

  // Draft endpoints (add later)
  const saveDraftEndpoint = "/web/api/day21/forms/labreq/save";
  const loadDraftEndpoint = "/web/api/day21/forms/labreq/load";

  // Optional: map JSX -> PDF later
  const generatePdfEndpoint = "/web/api/day21/documents/labreq";

  const [busySave, setBusySave] = useState(false);
  const [busyLoad, setBusyLoad] = useState(false);
  const [busyGen, setBusyGen] = useState(false);

  // ✅ FULL FORM — matches labs_temp.pdf (all sections) in JSX
  const [form, setForm] = useState({
    header: {
      patientLastName: "",
      patientFirstName: "",
      orderingPhysicianAddress: "",
      physicianLicenseOrPractitionerNumber: "",
      physicianPhoneNumber: "",
      notes: "",
      pregnant: "", // "yes" | "no" | ""
      fastingHours: "",
      collectionDateTime: "",
      bottomPhysicianLicenseNumber: "",
      bottomPhysicianSignature: "",
    },

    hematology: {
      hematologyProfile: false,
      ptINR: false,
      onWarfarin: "", // "yes" | "no" | ""
      ferritinQueryIronDeficiency: false,
      hfeHemochromatosis: false,
      hfeConfirmDiagnosisFerritinFirstTS_DNA: false,
      hfeFamilyC282YC282YHomozygoteDNA: false,
    },

    chemistry: {
      glucoseFasting: false,
      gttGestationalDiabetesScreen: false,
      gttGestationalDiabetesConfirmation: false,
      hemoglobinA1c: false,
      acrUrine: false, // Albumin/Creatinine ratio (ACR) - Urine
    },

    lipids: {
      baselineCardiovascularRiskAssessment: false,
      followUpForTreatedHypercholesterolemia: false,
      followUpOfTreatedHypercholesterolemia: false,
      lipidProfile: false,
    },

    thyroid: {
      monitorThyroidReplacementTherapyTSH: false,
      suspectedHypothyroidismTSHFirst: false,
      suspectedHyperthyroidism: false, // template shows comma, we keep label as-is
    },

    otherChemistry: {
      sodium: false,
      potassium: false,
      albumin: false,
      alkPhos: false,
      alt: false,
      bilirubin: false,
      ggt: false,

      creatinineEGFR: false,
      calcium: false,
      creatineKinaseCK: false,
      psa: false,
      pregnancyTest: false,
      totalProtein: false, // T.Protein
    },

    routineCulture: {
      currentAntibiotics: "",
      specimenThroat: false,
      specimenSputum: false,
      specimenBlood: false,
      superficialWoundSite: "",
      deepWoundSite: "",
      other: "",
      vaginitisInitialSmearBVYeastOnly: false,
      vaginitisChronicRecurrentSmearCultureTrich: false,
      trichomonasTesting: false,
      groupBStrepPregnancyOnly: false, // heading exists, but checkboxes below
      vaginoAnorectalSwab: false,
      penicillinAllergy: false,

      chlamydiaCTandGonorrhoeaGC: false, // heading exists
      ct7gcTesting: false,

      sourceSiteUrethra: false,
      sourceSiteCervix: false,
      sourceSiteUrine: false,

      gcCultureThroat: false,
      gcCultureRectal: false,
      gcCultureOther: "",
    },

    stoolSpecimens: {
      historyOfBloodyStools: "", // "yes" | "no" | ""
      cDifficileTesting: false,
      stoolCulture: false,
      stoolOvaParasiteExam: false,
      stoolOvaParasiteHighRisk2Samples: false,
    },

    dermatophytes: {
      dermatophyteCulture: false,
      kohPrepDirectExam: false,
      specimenSkin: false,
      specimenNail: false,
      specimenHair: false,
      site: "",
    },

    urineTests: {
      urineCultureCurrentAntibiotics: "",
      macroscopicDipstick: false,
      microscopic: false,
      specialCaseOrderedTogether: false,
    },

    hepatitisSerology: {
      hepA_IgM: false, // Hepatitis A (anti-HAV IgM)
      hepB_HBsAg_plusAntiHBcIfRequired: false,
      hepB_HBsAg_antiHBc_antiHBs: false,
      hepC_antiHCV: false,
      hepA_total: false, // Hepatitis A (anti-HAV, total)
      hepB_antiHBs: false, // Hepatitis B (anti-HBs)
    },

    hivSerology: {
      hivSerology: false,
      nonNominalReporting: false,
    },

    otherTests: {
      ecg: false,
      fecalOccultBloodAge50to74: false,
      fecalOccultBlood: false,
      yeast: false,
      fungus: false,
    },
  });

  useEffect(() => {
    console.log("[LabReqInCodePage] loaded");
    console.log("[LabReqInCodePage] webUserIdFromRoute:", webUserIdFromRoute);
    console.log("[LabReqInCodePage] user:", user);
    console.log("[LabReqInCodePage] templateUrl:", templateUrl);

    // Optional autofill from auth user if you want
    // (kept minimal + safe)
    if (user?.phone && !form.header.physicianPhoneNumber) {
      console.log("[LabReqInCodePage] auto-fill physician phone from user.phone");
      setForm((prev) => ({
        ...prev,
        header: {
          ...prev.header,
          physicianPhoneNumber: user.phone || "",
        },
      }));
    }
  }, [webUserIdFromRoute, user, templateUrl]); // eslint-disable-line react-hooks/exhaustive-deps

  const setPath = (path, value) => {
    console.log("[LabReqInCodePage] setPath:", path, "=", value);
    setForm((prev) => {
      const copy = structuredClone(prev);
      const parts = path.split(".");
      let obj = copy;
      for (let i = 0; i < parts.length - 1; i++) obj = obj[parts[i]];
      obj[parts[parts.length - 1]] = value;
      return copy;
    });
  };

  const openTemplate = () => {
    console.log("[LabReqInCodePage] openTemplate clicked:", templateUrl);
    toast.info("Opening PDF template…", { toastId: "open-template" });
    window.open(templateUrl, "_blank");
  };

  const exportJSON = () => {
    console.log("[LabReqInCodePage] exportJSON clicked");
    const pretty = JSON.stringify(form, null, 2);
    console.log("[LabReqInCodePage] form JSON:\n", pretty);
    toast.success("✅ Exported JSON to console.", { toastId: "export-json" });
  };

  const saveDraftMongo = async () => {
    try {
      console.log("[LabReqInCodePage] saveDraftMongo clicked");
      if (!webUserIdFromRoute) {
        toast.error("Missing route webUserId.", { toastId: "missing-webuserid" });
        return;
      }

      setBusySave(true);
      toast.info("Saving draft to MongoDB…", { toastId: "saving" });

      const payload = {
        webUserId: webUserIdFromRoute,
        form,
        meta: {
          savedAt: new Date().toISOString(),
          userEmail: user?.email || "",
        },
      };

      console.log("[LabReqInCodePage] save payload:", payload);

      const res = await callBackend.post(saveDraftEndpoint, payload);
      console.log("[LabReqInCodePage] save res:", res?.data);

      toast.success("✅ Draft saved.", { toastId: "saved" });
    } catch (err) {
      console.log("[LabReqInCodePage] ❌ save error:", err?.response?.data || err?.message || err);
      toast.error("Save failed (endpoint not added yet?). Check logs.", { toastId: "save-fail" });
    } finally {
      setBusySave(false);
    }
  };

  const loadDraftMongo = async () => {
    try {
      console.log("[LabReqInCodePage] loadDraftMongo clicked");
      if (!webUserIdFromRoute) {
        toast.error("Missing route webUserId.", { toastId: "missing-webuserid" });
        return;
      }

      setBusyLoad(true);
      toast.info("Loading draft…", { toastId: "loading" });

      const res = await callBackend.post(loadDraftEndpoint, { webUserId: webUserIdFromRoute });
      console.log("[LabReqInCodePage] load res:", res?.data);

      if (res?.data?.form) {
        console.log("[LabReqInCodePage] setting form from DB");
        setForm(res.data.form);
        toast.success("✅ Draft loaded into UI.", { toastId: "loaded" });
      } else {
        toast.warning("No draft found.", { toastId: "no-draft" });
      }
    } catch (err) {
      console.log("[LabReqInCodePage] ❌ load error:", err?.response?.data || err?.message || err);
      toast.error("Load failed (endpoint not added yet?). Check logs.", { toastId: "load-fail" });
    } finally {
      setBusyLoad(false);
    }
  };

  const generatePdfFromJSX = async () => {
    try {
      console.log("[LabReqInCodePage] generatePdfFromJSX clicked");
      setBusyGen(true);
      toast.info("Generating PDF from JSX…", { toastId: "gen" });

      // NOTE: backend currently expects different keys.
      // Once you approve this JSX schema, we map it server-side.
      const res = await callBackend.post(generatePdfEndpoint, { form }, { responseType: "blob" });

      console.log("[LabReqInCodePage] pdf res status:", res?.status);

      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch (err) {
      console.log("[LabReqInCodePage] ❌ gen error:", err?.response?.data || err?.message || err);
      toast.error("PDF generate failed. Check backend logs.", { toastId: "gen-fail" });
    } finally {
      setBusyGen(false);
    }
  };

  const backToHub = () => {
    const dest = `/dashboard/day21/${webUserIdFromRoute}`;
    console.log("[LabReqInCodePage] backToHub ->", dest);
    router.push(dest);
  };

  if (loading) {
    return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading…</div>;
  }

  return (
    <div className="min-h-screen bg-black text-white px-6 py-10">
      <div className="mx-auto w-full max-w-7xl">
        {/* Header */}
        <div className="rounded-2xl border border-red-500/40 bg-zinc-950 p-6 shadow-lg">
          <div className="flex flex-col xl:flex-row xl:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="text-3xl">☠️🔥</div>
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight">SkullFire Labs — Laboratory Requisition (JSX)</h1>
                <p className="text-white/70 mt-1">
                  One-page JSX version of the template. Save the JSON draft to MongoDB later.
                </p>
                <div className="text-sm text-white/60 mt-2">
                  Route param [prescription] (webUserId):{" "}
                  <span className="text-white">{webUserIdFromRoute || "(missing)"}</span>
                </div>
              </div>
            </div>

            <div className="xl:ml-auto flex flex-wrap gap-2">
              <button
                onClick={backToHub}
                className="rounded-xl border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 px-4 py-2 font-bold"
              >
                ← Back
              </button>

              <button
                onClick={openTemplate}
                className="rounded-xl border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 px-4 py-2 font-bold"
              >
                View PDF Template
              </button>

              <button
                disabled={busyLoad}
                onClick={loadDraftMongo}
                className="rounded-xl border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 px-4 py-2 font-bold disabled:opacity-60"
              >
                {busyLoad ? "Loading…" : "Load Draft"}
              </button>

              <button
                disabled={busySave}
                onClick={saveDraftMongo}
                className="rounded-xl border border-purple-500/40 bg-purple-600/20 hover:bg-purple-600/30 px-4 py-2 font-bold disabled:opacity-60"
              >
                {busySave ? "Saving…" : "Save Draft (Mongo)"}
              </button>

              <button
                onClick={exportJSON}
                className="rounded-xl border border-orange-500/40 bg-orange-600/15 hover:bg-orange-600/25 px-4 py-2 font-bold"
              >
                Export JSON
              </button>

              <button
                disabled={busyGen}
                onClick={generatePdfFromJSX}
                className="rounded-xl bg-purple-600 hover:bg-purple-500 px-4 py-2 font-bold shadow disabled:opacity-60"
              >
                {busyGen ? "Generating…" : "Generate PDF"}
              </button>
            </div>
          </div>
        </div>

        {/* TOP HEADER FIELDS (matches the top of the PDF) */}
        <div className="mt-6">
          <Card
            title="Patient + Collection Info"
            subtitle="Top fields: patient name, ordering physician, notes, pregnant/fasting, date/time of collection."
          >
            <div className="grid lg:grid-cols-2 gap-4">
              <Input
                label="Patient Last Name"
                value={form.header.patientLastName}
                onChange={(v) => setPath("header.patientLastName", v)}
              />
              <Input
                label="Patient First Name"
                value={form.header.patientFirstName}
                onChange={(v) => setPath("header.patientFirstName", v)}
              />

              <Input
                label="Ordering physician address"
                value={form.header.orderingPhysicianAddress}
                onChange={(v) => setPath("header.orderingPhysicianAddress", v)}
              />
              <Input
                label="Physician License number / Practitioner number"
                value={form.header.physicianLicenseOrPractitionerNumber}
                onChange={(v) => setPath("header.physicianLicenseOrPractitionerNumber", v)}
              />

              <Input
                label="Physician phone number"
                value={form.header.physicianPhoneNumber}
                onChange={(v) => setPath("header.physicianPhoneNumber", v)}
              />

              <Input
                label="Date/Time of Collection"
                value={form.header.collectionDateTime}
                onChange={(v) => setPath("header.collectionDateTime", v)}
                placeholder="YYYY-MM-DD HH:mm"
              />
            </div>

            <div className="mt-4 grid lg:grid-cols-3 gap-4">
              <TextArea
                label="NOTES"
                value={form.header.notes}
                onChange={(v) => setPath("header.notes", v)}
                placeholder="Notes…"
                rows={5}
              />

              <YesNo
                label="Pregnant?"
                value={form.header.pregnant}
                setValue={(v) => setPath("header.pregnant", v)}
              />

              <Input
                label="Fasting Hours"
                value={form.header.fastingHours}
                onChange={(v) => setPath("header.fastingHours", v)}
                placeholder="e.g. 8"
              />
            </div>

            <Divider />

            <div className="grid lg:grid-cols-2 gap-4">
              <Input
                label="Physician license number (bottom)"
                value={form.header.bottomPhysicianLicenseNumber}
                onChange={(v) => setPath("header.bottomPhysicianLicenseNumber", v)}
              />
              <Input
                label="Physician signature (typed)"
                value={form.header.bottomPhysicianSignature}
                onChange={(v) => setPath("header.bottomPhysicianSignature", v)}
                placeholder="Type full name…"
              />
            </div>
          </Card>
        </div>

        {/* MAIN GRID (3 columns like the PDF) */}
        <div className="mt-6 grid xl:grid-cols-3 gap-6">
          {/* LEFT COLUMN: Hematology / Chemistry / Lipids / Thyroid / Other Chemistry */}
          <div className="space-y-6">
            <Card title="HEMATOLOGY">
              <div className="grid gap-2">
                <Check
                  label="Hematology Profile"
                  checked={form.hematology.hematologyProfile}
                  onChange={(v) => setPath("hematology.hematologyProfile", v)}
                />
                <Check
                  label="PT-INR"
                  checked={form.hematology.ptINR}
                  onChange={(v) => setPath("hematology.ptINR", v)}
                />
                <YesNo
                  label="On Warfarin?"
                  value={form.hematology.onWarfarin}
                  setValue={(v) => setPath("hematology.onWarfarin", v)}
                />
                <Check
                  label="Ferritin (query iron deficiency)"
                  checked={form.hematology.ferritinQueryIronDeficiency}
                  onChange={(v) => setPath("hematology.ferritinQueryIronDeficiency", v)}
                />

                <Divider />

                <Check
                  label="HFE - Hemochromatosis"
                  checked={form.hematology.hfeHemochromatosis}
                  onChange={(v) => setPath("hematology.hfeHemochromatosis", v)}
                />
                <div className="pl-2 grid gap-2">
                  <Check
                    subtle
                    label="Confirm diagnosis (ferritin first + TS + DNA)"
                    checked={form.hematology.hfeConfirmDiagnosisFerritinFirstTS_DNA}
                    onChange={(v) => setPath("hematology.hfeConfirmDiagnosisFerritinFirstTS_DNA", v)}
                  />
                  <Check
                    subtle
                    label="Family C282Y/C282Y homozygote DNA"
                    checked={form.hematology.hfeFamilyC282YC282YHomozygoteDNA}
                    onChange={(v) => setPath("hematology.hfeFamilyC282YC282YHomozygoteDNA", v)}
                  />
                </div>
              </div>
            </Card>

            <Card title="CHEMISTRY">
              <div className="grid gap-2">
                <Check
                  label="Glucose - fasting (follow fasting rules)"
                  checked={form.chemistry.glucoseFasting}
                  onChange={(v) => setPath("chemistry.glucoseFasting", v)}
                />
                <Check
                  label="GTT - gestational diabetes screen"
                  checked={form.chemistry.gttGestationalDiabetesScreen}
                  onChange={(v) => setPath("chemistry.gttGestationalDiabetesScreen", v)}
                />
                <Check
                  label="GTT - gestational diabetes confirmation"
                  checked={form.chemistry.gttGestationalDiabetesConfirmation}
                  onChange={(v) => setPath("chemistry.gttGestationalDiabetesConfirmation", v)}
                />
                <Check
                  label="Hemoglobin A1c"
                  checked={form.chemistry.hemoglobinA1c}
                  onChange={(v) => setPath("chemistry.hemoglobinA1c", v)}
                />
                <Check
                  label="Albumin / Creatinine ratio (ACR) - Urine"
                  checked={form.chemistry.acrUrine}
                  onChange={(v) => setPath("chemistry.acrUrine", v)}
                />
              </div>
            </Card>

            <Card title="LIPIDS" subtitle="Check one box only (template note).">
              <div className="grid gap-2">
                <Check
                  label="Baseline cardiovascular risk assessment (lipid profile, total, HDL, non-HDL & LDL)"
                  checked={form.lipids.baselineCardiovascularRiskAssessment}
                  onChange={(v) => setPath("lipids.baselineCardiovascularRiskAssessment", v)}
                />
                <Check
                  label="Follow up for treated hypercholesterolemia"
                  checked={form.lipids.followUpForTreatedHypercholesterolemia}
                  onChange={(v) => setPath("lipids.followUpForTreatedHypercholesterolemia", v)}
                />
                <Check
                  label="Follow-up of treated hypercholesterolemia"
                  checked={form.lipids.followUpOfTreatedHypercholesterolemia}
                  onChange={(v) => setPath("lipids.followUpOfTreatedHypercholesterolemia", v)}
                />
                <Check
                  label="Lipid profile"
                  checked={form.lipids.lipidProfile}
                  onChange={(v) => setPath("lipids.lipidProfile", v)}
                />
              </div>
            </Card>

            <Card title="THYROID FUNCTION" subtitle="Check one box only (template note).">
              <div className="grid gap-2">
                <Check
                  label="Monitor thyroid replacement therapy (TSH)"
                  checked={form.thyroid.monitorThyroidReplacementTherapyTSH}
                  onChange={(v) => setPath("thyroid.monitorThyroidReplacementTherapyTSH", v)}
                />
                <Check
                  label="Suspected Hypothyroidism — TSH first"
                  checked={form.thyroid.suspectedHypothyroidismTSHFirst}
                  onChange={(v) => setPath("thyroid.suspectedHypothyroidismTSHFirst", v)}
                />
                <Check
                  label="Suspected Hyperthyroidism,"
                  checked={form.thyroid.suspectedHyperthyroidism}
                  onChange={(v) => setPath("thyroid.suspectedHyperthyroidism", v)}
                />
              </div>
            </Card>

            <Card title="Other Chemistry Tests">
              <div className="grid md:grid-cols-2 gap-2">
                <Check label="Sodium" checked={form.otherChemistry.sodium} onChange={(v) => setPath("otherChemistry.sodium", v)} />
                <Check label="Creatinine/eGFR" checked={form.otherChemistry.creatinineEGFR} onChange={(v) => setPath("otherChemistry.creatinineEGFR", v)} />
                <Check label="Potassium" checked={form.otherChemistry.potassium} onChange={(v) => setPath("otherChemistry.potassium", v)} />
                <Check label="Calcium" checked={form.otherChemistry.calcium} onChange={(v) => setPath("otherChemistry.calcium", v)} />
                <Check label="Albumin" checked={form.otherChemistry.albumin} onChange={(v) => setPath("otherChemistry.albumin", v)} />
                <Check label="Creatine kinase (CK)" checked={form.otherChemistry.creatineKinaseCK} onChange={(v) => setPath("otherChemistry.creatineKinaseCK", v)} />
                <Check label="Alk phos" checked={form.otherChemistry.alkPhos} onChange={(v) => setPath("otherChemistry.alkPhos", v)} />
                <Check label="PSA" checked={form.otherChemistry.psa} onChange={(v) => setPath("otherChemistry.psa", v)} />
                <Check label="ALT" checked={form.otherChemistry.alt} onChange={(v) => setPath("otherChemistry.alt", v)} />
                <Check label="Pregnancy test" checked={form.otherChemistry.pregnancyTest} onChange={(v) => setPath("otherChemistry.pregnancyTest", v)} />
                <Check label="Bilirubin" checked={form.otherChemistry.bilirubin} onChange={(v) => setPath("otherChemistry.bilirubin", v)} />
                <Check label="T.Protein" checked={form.otherChemistry.totalProtein} onChange={(v) => setPath("otherChemistry.totalProtein", v)} />
                <Check label="GGT" checked={form.otherChemistry.ggt} onChange={(v) => setPath("otherChemistry.ggt", v)} />
              </div>
            </Card>
          </div>

          {/* CENTER COLUMN: Microbiology */}
          <div className="space-y-6">
            <Card title="MICROBIOLOGY" subtitle="Label all specimens with patient first, last.">
              <SectionTitle>ROUTINE CULTURE</SectionTitle>
              <div className="mt-3 grid gap-3">
                <Input
                  label="List current antibiotics"
                  value={form.routineCulture.currentAntibiotics}
                  onChange={(v) => setPath("routineCulture.currentAntibiotics", v)}
                />

                <div className="rounded-2xl border border-zinc-800 bg-black/30 p-4">
                  <SubTitle>Specimen</SubTitle>
                  <div className="mt-2 grid sm:grid-cols-3 gap-2">
                    <Check
                      label="Throat"
                      checked={form.routineCulture.specimenThroat}
                      onChange={(v) => setPath("routineCulture.specimenThroat", v)}
                    />
                    <Check
                      label="Sputum"
                      checked={form.routineCulture.specimenSputum}
                      onChange={(v) => setPath("routineCulture.specimenSputum", v)}
                    />
                    <Check
                      label="Blood"
                      checked={form.routineCulture.specimenBlood}
                      onChange={(v) => setPath("routineCulture.specimenBlood", v)}
                    />
                  </div>
                </div>

                <Input
                  label="Superficial wound site"
                  value={form.routineCulture.superficialWoundSite}
                  onChange={(v) => setPath("routineCulture.superficialWoundSite", v)}
                />
                <Input
                  label="Deep wound site"
                  value={form.routineCulture.deepWoundSite}
                  onChange={(v) => setPath("routineCulture.deepWoundSite", v)}
                />
                <Input
                  label="Other"
                  value={form.routineCulture.other}
                  onChange={(v) => setPath("routineCulture.other", v)}
                />
              </div>

              <Divider />

              <SectionTitle>Vaginitis</SectionTitle>
              <div className="mt-3 grid gap-2">
                <Check
                  label="Initial (smear for BV & yeast only)"
                  checked={form.routineCulture.vaginitisInitialSmearBVYeastOnly}
                  onChange={(v) => setPath("routineCulture.vaginitisInitialSmearBVYeastOnly", v)}
                />
                <Check
                  label="Chronic/recurrent (smear, culture, trichomonas)"
                  checked={form.routineCulture.vaginitisChronicRecurrentSmearCultureTrich}
                  onChange={(v) => setPath("routineCulture.vaginitisChronicRecurrentSmearCultureTrich", v)}
                />
                <Check
                  label="Trichomonas testing"
                  checked={form.routineCulture.trichomonasTesting}
                  onChange={(v) => setPath("routineCulture.trichomonasTesting", v)}
                />
              </div>

              <Divider />

              <SectionTitle>Group B Strep Screen (pregnancy only)</SectionTitle>
              <div className="mt-3 grid gap-2">
                <Check
                  label="Vagino-anorectal swab"
                  checked={form.routineCulture.vaginoAnorectalSwab}
                  onChange={(v) => setPath("routineCulture.vaginoAnorectalSwab", v)}
                />
                <Check
                  label="Penicillin allergy"
                  checked={form.routineCulture.penicillinAllergy}
                  onChange={(v) => setPath("routineCulture.penicillinAllergy", v)}
                />
              </div>

              <Divider />

              <SectionTitle>Chlamydia (CT) & Gonorrhoea GC</SectionTitle>
              <div className="mt-3 grid gap-3">
                <Check
                  label="CT 7 GC Testing"
                  checked={form.routineCulture.ct7gcTesting}
                  onChange={(v) => setPath("routineCulture.ct7gcTesting", v)}
                />

                <div className="rounded-2xl border border-zinc-800 bg-black/25 p-4">
                  <SubTitle>Source/Site</SubTitle>
                  <div className="mt-2 grid sm:grid-cols-3 gap-2">
                    <Check
                      label="Urethra"
                      checked={form.routineCulture.sourceSiteUrethra}
                      onChange={(v) => setPath("routineCulture.sourceSiteUrethra", v)}
                    />
                    <Check
                      label="Cervix"
                      checked={form.routineCulture.sourceSiteCervix}
                      onChange={(v) => setPath("routineCulture.sourceSiteCervix", v)}
                    />
                    <Check
                      label="Urine"
                      checked={form.routineCulture.sourceSiteUrine}
                      onChange={(v) => setPath("routineCulture.sourceSiteUrine", v)}
                    />
                  </div>
                </div>

                <div className="rounded-2xl border border-zinc-800 bg-black/25 p-4">
                  <SubTitle>GC culture</SubTitle>
                  <div className="mt-2 grid sm:grid-cols-2 gap-2">
                    <Check
                      label="Throat"
                      checked={form.routineCulture.gcCultureThroat}
                      onChange={(v) => setPath("routineCulture.gcCultureThroat", v)}
                    />
                    <Check
                      label="Rectal"
                      checked={form.routineCulture.gcCultureRectal}
                      onChange={(v) => setPath("routineCulture.gcCultureRectal", v)}
                    />
                  </div>
                  <div className="mt-3">
                    <Input
                      label="Other"
                      value={form.routineCulture.gcCultureOther}
                      onChange={(v) => setPath("routineCulture.gcCultureOther", v)}
                    />
                  </div>
                </div>
              </div>

              <Divider />

              <SectionTitle>STOOL SPECIMENS</SectionTitle>
              <div className="mt-3 grid gap-3">
                <YesNo
                  label="History of Bloody Stools?"
                  value={form.stoolSpecimens.historyOfBloodyStools}
                  setValue={(v) => setPath("stoolSpecimens.historyOfBloodyStools", v)}
                />
                <div className="grid gap-2">
                  <Check
                    label="C. difficile testing"
                    checked={form.stoolSpecimens.cDifficileTesting}
                    onChange={(v) => setPath("stoolSpecimens.cDifficileTesting", v)}
                  />
                  <Check
                    label="Stool culture"
                    checked={form.stoolSpecimens.stoolCulture}
                    onChange={(v) => setPath("stoolSpecimens.stoolCulture", v)}
                  />
                  <Check
                    label="Stool ova & parasite exam"
                    checked={form.stoolSpecimens.stoolOvaParasiteExam}
                    onChange={(v) => setPath("stoolSpecimens.stoolOvaParasiteExam", v)}
                  />
                  <Check
                    label="Stool ova & parasite (high risk, 2 samples)"
                    checked={form.stoolSpecimens.stoolOvaParasiteHighRisk2Samples}
                    onChange={(v) => setPath("stoolSpecimens.stoolOvaParasiteHighRisk2Samples", v)}
                  />
                </div>
              </div>

              <Divider />

              <SectionTitle>DERMATOPHYTES</SectionTitle>
              <div className="mt-3 grid gap-3">
                <Check
                  label="Dermatophyte culture"
                  checked={form.dermatophytes.dermatophyteCulture}
                  onChange={(v) => setPath("dermatophytes.dermatophyteCulture", v)}
                />
                <Check
                  label="KOH prep (direct exam)"
                  checked={form.dermatophytes.kohPrepDirectExam}
                  onChange={(v) => setPath("dermatophytes.kohPrepDirectExam", v)}
                />

                <div className="rounded-2xl border border-zinc-800 bg-black/25 p-4">
                  <SubTitle>Specimen</SubTitle>
                  <div className="mt-2 grid sm:grid-cols-3 gap-2">
                    <Check
                      label="Skin"
                      checked={form.dermatophytes.specimenSkin}
                      onChange={(v) => setPath("dermatophytes.specimenSkin", v)}
                    />
                    <Check
                      label="Nail"
                      checked={form.dermatophytes.specimenNail}
                      onChange={(v) => setPath("dermatophytes.specimenNail", v)}
                    />
                    <Check
                      label="Hair"
                      checked={form.dermatophytes.specimenHair}
                      onChange={(v) => setPath("dermatophytes.specimenHair", v)}
                    />
                  </div>
                </div>

                <Input
                  label="Site"
                  value={form.dermatophytes.site}
                  onChange={(v) => setPath("dermatophytes.site", v)}
                />
              </div>
            </Card>
          </div>

          {/* RIGHT COLUMN: Urine Tests / Hepatitis / HIV / Other Tests */}
          <div className="space-y-6">
            <Card title="URINE TESTS" subtitle="Template notes shown in PDF are guidance; fields below are selectable.">
              <div className="grid gap-3">
                <Input
                  label="Urine Culture — list current antibiotics"
                  value={form.urineTests.urineCultureCurrentAntibiotics}
                  onChange={(v) => setPath("urineTests.urineCultureCurrentAntibiotics", v)}
                />

                <div className="rounded-2xl border border-zinc-800 bg-black/25 p-4">
                  <SubTitle>Urinalysis Options</SubTitle>
                  <div className="mt-2 grid gap-2">
                    <Check
                      label="Macroscopic (dipstick)"
                      checked={form.urineTests.macroscopicDipstick}
                      onChange={(v) => setPath("urineTests.macroscopicDipstick", v)}
                    />
                    <Check
                      label="Microscopic"
                      checked={form.urineTests.microscopic}
                      onChange={(v) => setPath("urineTests.microscopic", v)}
                    />
                    <Check
                      label="Special case (if ordered together)"
                      checked={form.urineTests.specialCaseOrderedTogether}
                      onChange={(v) => setPath("urineTests.specialCaseOrderedTogether", v)}
                    />
                  </div>
                </div>
              </div>

              <Divider />

              <SectionTitle>HEPATITIS SEROLOGY</SectionTitle>
              <div className="mt-3 rounded-2xl border border-zinc-800 bg-black/25 p-4">
                <SubTitle>Acute viral hepatitis (undefined etiology)</SubTitle>
                <div className="mt-2 grid gap-2">
                  <Check
                    label="Hepatitis A (anti-HAV IgM)"
                    checked={form.hepatitisSerology.hepA_IgM}
                    onChange={(v) => setPath("hepatitisSerology.hepA_IgM", v)}
                  />
                  <Check
                    label="Hepatitis B (HBsAg, plus anti-HBc if required)"
                    checked={form.hepatitisSerology.hepB_HBsAg_plusAntiHBcIfRequired}
                    onChange={(v) => setPath("hepatitisSerology.hepB_HBsAg_plusAntiHBcIfRequired", v)}
                  />
                </div>

                <Divider />

                <SubTitle>Chronic viral hepatitis (undefined etiology)</SubTitle>
                <div className="mt-2 grid gap-2">
                  <Check
                    label="Hepatitis B (HBsAg, anti-HBc, anti-HBs)"
                    checked={form.hepatitisSerology.hepB_HBsAg_antiHBc_antiHBs}
                    onChange={(v) => setPath("hepatitisSerology.hepB_HBsAg_antiHBc_antiHBs", v)}
                  />
                  <Check
                    label="Hepatitis C (anti-HCV)"
                    checked={form.hepatitisSerology.hepC_antiHCV}
                    onChange={(v) => setPath("hepatitisSerology.hepC_antiHCV", v)}
                  />
                </div>

                <Divider />

                <div className="grid gap-2">
                  <Check
                    label="Hepatitis A (anti-HAV, total)"
                    checked={form.hepatitisSerology.hepA_total}
                    onChange={(v) => setPath("hepatitisSerology.hepA_total", v)}
                  />
                  <Check
                    label="Hepatitis B (anti-HBs)"
                    checked={form.hepatitisSerology.hepB_antiHBs}
                    onChange={(v) => setPath("hepatitisSerology.hepB_antiHBs", v)}
                  />
                </div>
              </div>

              <Divider />

              <SectionTitle>HIV SEROLOGY</SectionTitle>
              <div className="mt-3 grid gap-2">
                <Check
                  label="HIV Serology"
                  checked={form.hivSerology.hivSerology}
                  onChange={(v) => setPath("hivSerology.hivSerology", v)}
                />
                <Check
                  label="Non-nominal reporting"
                  checked={form.hivSerology.nonNominalReporting}
                  onChange={(v) => setPath("hivSerology.nonNominalReporting", v)}
                />
              </div>

              <Divider />

              <SectionTitle>OTHER TESTS</SectionTitle>
              <div className="mt-3 grid gap-2">
                <Check label="ECG" checked={form.otherTests.ecg} onChange={(v) => setPath("otherTests.ecg", v)} />
                <Check
                  label="Fecal Occult Blood (age 50-74)"
                  checked={form.otherTests.fecalOccultBloodAge50to74}
                  onChange={(v) => setPath("otherTests.fecalOccultBloodAge50to74", v)}
                />
                <Check
                  label="Fecal Occult Blood"
                  checked={form.otherTests.fecalOccultBlood}
                  onChange={(v) => setPath("otherTests.fecalOccultBlood", v)}
                />
                <div className="grid sm:grid-cols-2 gap-2">
                  <Check label="Yeast" checked={form.otherTests.yeast} onChange={(v) => setPath("otherTests.yeast", v)} />
                  <Check label="Fungus" checked={form.otherTests.fungus} onChange={(v) => setPath("otherTests.fungus", v)} />
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Footer note */}
        <div className="mt-6 text-xs text-white/50">
          Next: add Save/Load draft endpoints in backend. After that, we can decide: JSX-only stored JSON vs generating a finalized PDF.
        </div>
      </div>
    </div>
  );
}
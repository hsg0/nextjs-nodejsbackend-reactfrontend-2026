"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import useAuthCheck from "@/checkAuth/authCheck";
import callBackend from "@/lib/callBackend";
import { PDFDocument } from "pdf-lib";
import { toast } from "react-toastify";

/* ------------------ helpers ------------------ */

function bytesToBlobUrl(bytes, mime = "application/pdf") {
  console.log("[bytesToBlobUrl] creating blob url...");
  const blob = new Blob([bytes], { type: mime });
  const url = URL.createObjectURL(blob);
  console.log("[bytesToBlobUrl] ✅ blob url created:", url);
  return url;
}

function buildFieldTree(fieldNames) {
  const root = {};
  for (const full of fieldNames) {
    const parts = String(full || "").split(".");
    let node = root;
    for (const p of parts) {
      if (!node[p]) node[p] = {};
      node = node[p];
    }
  }
  return root;
}

function logFieldTree(tree, indent = "") {
  const keys = Object.keys(tree || {});
  keys.forEach((k) => {
    console.log(`${indent}- ${k}`);
    logFieldTree(tree[k], indent + "  ");
  });
}

function logAllAcroformFields(pdfDoc) {
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("[logAllAcroformFields] ✅ Starting full AcroForm dump...");

  const form = pdfDoc.getForm();
  const fields = form.getFields();

  console.log("[logAllAcroformFields] fields.length:", fields.length);

  const names = [];

  fields.forEach((field, idx) => {
    const name = field.getName?.() || "(no getName)";
    const type = field?.constructor?.name || "UnknownFieldType";
    names.push(name);

    console.log(`[AcroField ${idx}]`, { name, type });

    try {
      const widgets = field.acroField?.getWidgets?.() || [];
      console.log(`[AcroField ${idx}] widgets count:`, widgets.length);
    } catch (e) {
      console.log(`[AcroField ${idx}] (no widgets info)`, e?.message || e);
    }

    try {
      if (type === "PDFRadioGroup" && typeof field.getOptions === "function") {
        console.log(`[AcroField ${idx}] radio options:`, field.getOptions());
      }
      if (
        (type === "PDFDropdown" || type === "PDFOptionList") &&
        typeof field.getOptions === "function"
      ) {
        console.log(`[AcroField ${idx}] select options:`, field.getOptions());
      }
    } catch (e) {
      console.log(`[AcroField ${idx}] (no options)`, e?.message || e);
    }
  });

  const tree = buildFieldTree(names);
  console.log("[logAllAcroformFields] ✅ Field tree (dot paths):");
  logFieldTree(tree);

  console.log("[logAllAcroformFields] ✅ Finished dump.");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
}

/* ------------------ UI controls ------------------ */

function FieldLabel({ children }) {
  return (
    <div className="text-[11px] font-bold uppercase tracking-wide text-zinc-700">
      {children}
    </div>
  );
}

function TextField({ label, value, placeholder, onChange, className = "" }) {
  return (
    <div className={className}>
      <FieldLabel>{label}</FieldLabel>
      <input
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || ""}
        className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-2 py-1 text-sm text-zinc-900 outline-none focus:border-purple-500"
      />
    </div>
  );
}

function TextAreaField({ label, value, placeholder, onChange, className = "" }) {
  return (
    <div className={className}>
      <FieldLabel>{label}</FieldLabel>
      <textarea
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || ""}
        rows={4}
        className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-2 py-1 text-sm text-zinc-900 outline-none focus:border-purple-500"
      />
    </div>
  );
}

function CheckField({ label, checked, onChange, className = "" }) {
  return (
    <label className={`flex items-center gap-2 ${className}`}>
      <input
        type="checkbox"
        checked={!!checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="text-sm text-zinc-900">{label}</span>
    </label>
  );
}

function RadioGroupField({ label, options, value, onChange, className = "" }) {
  const opts = Array.isArray(options) && options.length ? options : [];
  return (
    <div className={className}>
      <FieldLabel>{label}</FieldLabel>
      <div className="mt-1 flex flex-wrap gap-3">
        {opts.map((opt) => (
          <label
            key={String(opt)}
            className="flex items-center gap-2 text-sm text-zinc-900"
          >
            <input
              type="radio"
              name={label}
              checked={String(value ?? "") === String(opt)}
              onChange={() => onChange(String(opt))}
            />
            <span>{String(opt)}</span>
          </label>
        ))}
        {!opts.length ? (
          <div className="text-xs text-zinc-500">
            No options detected for this radio group.
          </div>
        ) : null}
      </div>
    </div>
  );
}

function SelectField({ label, options, value, onChange, className = "" }) {
  const opts = Array.isArray(options) && options.length ? options : [];
  return (
    <div className={className}>
      <FieldLabel>{label}</FieldLabel>
      <select
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-2 py-1 text-sm text-zinc-900 outline-none focus:border-purple-500"
      >
        <option value="">— Select —</option>
        {opts.map((o) => (
          <option key={String(o)} value={String(o)}>
            {String(o)}
          </option>
        ))}
      </select>
      {!opts.length ? (
        <div className="mt-1 text-xs text-zinc-500">No options detected.</div>
      ) : null}
    </div>
  );
}

/* ------------------ main page ------------------ */

export default function AutoGeneratePdfFeildsPage() {
  const { loading, user, isAuthenticated } = useAuthCheck();

  const [pdfUrl, setPdfUrl] = useState("");
  const [busy, setBusy] = useState(false);

  // pdf-lib doc in memory
  const pdfDocRef = useRef(null);

  // fieldName -> { type, instance, options }
  const fieldMapRef = useRef(new Map());

  // fieldName -> value (string/boolean)
  const [fieldValues, setFieldValues] = useState({});

  const [lastUpload, setLastUpload] = useState(null);

  const pdfUrlRef = useRef("");
  const previewDebounceRef = useRef(null);

  const statusLabel = useMemo(() => {
    if (busy) return "working";
    if (!pdfDocRef.current) return "loading-pdf";
    return "ready";
  }, [busy]);

  useEffect(() => {
    console.log("[Day27/autogeneratepdffeilds] mounted");
    console.log("[Day27/autogeneratepdffeilds] isAuthenticated:", isAuthenticated);
    console.log("[Day27/autogeneratepdffeilds] user:", user);
  }, [isAuthenticated, user]);

  // Cleanup blob urls
  useEffect(() => {
    return () => {
      try {
        if (previewDebounceRef.current) clearTimeout(previewDebounceRef.current);
        if (pdfUrlRef.current) {
          console.log("[Day27] cleanup: revoking blob url:", pdfUrlRef.current);
          URL.revokeObjectURL(pdfUrlRef.current);
        }
      } catch (e) {
        console.log("[Day27] cleanup failed:", e?.message || e);
      }
    };
  }, []);

  const rebuildPreview = async (reason = "unknown") => {
    try {
      const pdfDoc = pdfDocRef.current;
      if (!pdfDoc) return;

      console.log("[Day27] rebuildPreview start. reason:", reason);

      const newBytes = await pdfDoc.save();
      console.log(
        "[Day27] rebuildPreview ✅ newBytes byteLength:",
        newBytes?.byteLength
      );

      if (pdfUrlRef.current) {
        console.log("[Day27] rebuildPreview revoke old url:", pdfUrlRef.current);
        URL.revokeObjectURL(pdfUrlRef.current);
      }

      const newUrl = bytesToBlobUrl(newBytes, "application/pdf");
      pdfUrlRef.current = newUrl;
      setPdfUrl(newUrl);
    } catch (e) {
      console.log("[Day27] rebuildPreview ❌ failed:", e?.message || e);
    }
  };

  const schedulePreviewRebuild = (reason) => {
    try {
      if (previewDebounceRef.current) clearTimeout(previewDebounceRef.current);
      previewDebounceRef.current = setTimeout(() => rebuildPreview(reason), 250);
    } catch (e) {
      console.log("[Day27] schedulePreviewRebuild error:", e?.message || e);
    }
  };

  const setPdfFieldValue = (name, nextValue) => {
    const meta = fieldMapRef.current.get(name);
    if (!meta?.instance) {
      console.log("[Day27] setPdfFieldValue ❌ missing field:", name);
      return;
    }

    const { type, instance } = meta;
    console.log("[Day27] setPdfFieldValue:", { name, type, nextValue });

    try {
      if (type === "PDFTextField") {
        instance.setText(String(nextValue ?? ""));
      } else if (type === "PDFCheckBox") {
        if (nextValue) instance.check();
        else instance.uncheck();
      } else if (type === "PDFRadioGroup") {
        // If you want to clear a radio group, try clear() when available
        const v = nextValue ?? "";
        if (!v) {
          if (typeof instance.clear === "function") instance.clear();
          else console.log("[Day27] radio clear not supported on this field:", name);
        } else {
          instance.select(String(v));
        }
      } else if (type === "PDFDropdown") {
        instance.select(String(nextValue ?? ""));
      } else if (type === "PDFOptionList") {
        instance.select(String(nextValue ?? ""));
      } else {
        if (typeof instance.setText === "function") {
          instance.setText(String(nextValue ?? ""));
        } else {
          console.log("[Day27] setPdfFieldValue (unsupported type):", { name, type });
        }
      }
    } catch (e) {
      console.log("[Day27] setPdfFieldValue ❌ error:", e?.message || e);
    }
  };

  const setField = (name, rawValue, type) => {
    console.log("[Day27] setField:", { name, rawValue, type });

    setFieldValues((prev) => {
      const next = { ...prev };
      next[name] = rawValue;
      return next;
    });

    setPdfFieldValue(name, rawValue);
    schedulePreviewRebuild(`change:${name}`);
  };

  // 1) Fetch PDF from backend + load + map fields
  useEffect(() => {
    const run = async () => {
      try {
        setBusy(true);

        console.log("[Day27] 🔥 fetching PDF from backend: GET /web/api/day27/get-pdf-data");

        const res = await callBackend.get("/web/api/day27/get-pdf-data", {
          responseType: "arraybuffer",
          withCredentials: true,
          timeout: 30000,
        });

        console.log(
          "[Day27] ✅ got PDF bytes (arraybuffer) byteLength:",
          res?.data?.byteLength
        );

        const bytes = new Uint8Array(res.data);
        console.log("[Day27] ✅ Uint8Array length:", bytes.length);

        const loadedDoc = await PDFDocument.load(bytes);
        console.log("[Day27] ✅ pdf-lib loaded document");

        pdfDocRef.current = loadedDoc;

        // Log ALL fields once (for dev)
        logAllAcroformFields(loadedDoc);

        const form = loadedDoc.getForm();
        const fields = form.getFields();

        const nextMap = new Map();
        const nextVals = {};

        fields.forEach((f) => {
          const name = f.getName?.() || "";
          const type = f?.constructor?.name || "UnknownFieldType";

          let options = [];
          try {
            if (
              (type === "PDFRadioGroup" ||
                type === "PDFDropdown" ||
                type === "PDFOptionList") &&
              typeof f.getOptions === "function"
            ) {
              options = f.getOptions() || [];
            }
          } catch (e) {
            console.log("[Day27] options extract failed:", name, e?.message || e);
          }

          nextMap.set(name, { type, instance: f, options });

          try {
            if (type === "PDFTextField") nextVals[name] = f.getText?.() || "";
            else if (type === "PDFCheckBox") nextVals[name] = f.isChecked?.() || false;
            else nextVals[name] = "";
          } catch (e) {
            console.log("[Day27] initial value extract failed:", name, e?.message || e);
            nextVals[name] = "";
          }
        });

        fieldMapRef.current = nextMap;
        setFieldValues(nextVals);

        // Initial preview
        const url = bytesToBlobUrl(bytes, "application/pdf");
        pdfUrlRef.current = url;
        setPdfUrl(url);

        toast.success("✅ PDF loaded. UI replica ready.", { toastId: "pdf-loaded" });
      } catch (err) {
        console.log(
          "[Day27] ❌ failed to fetch/load PDF:",
          err?.response?.data || err?.message || err
        );
        toast.error("❌ Failed to load PDF from backend. Check console.", {
          toastId: "pdf-load-fail",
        });
      } finally {
        setBusy(false);
      }
    };

    run();
  }, []);

  // 2) Auto-fill (best effort)
  const handleAutoFill = async () => {
    try {
      console.log("[Day27] handleAutoFill clicked");

      if (!pdfDocRef.current) {
        console.log("[Day27] ❌ pdfDoc missing");
        toast.error("PDF not loaded yet.");
        return;
      }

      setBusy(true);

      console.log("[Day27] fetching profile for autofill: GET /web/api/auth/profile");
      const prof = await callBackend.get("/web/api/auth/profile", {
        withCredentials: true,
        timeout: 15000,
      });

      const webUser = prof?.data?.webUser || null;
      console.log("[Day27] ✅ profile webUser:", webUser);

      const updates = [
        { key: "patientFirstName", value: webUser?.name || webUser?.fullName || "" },
        { key: "patientLastName", value: webUser?.lastName || "" },
        { key: "patientEmailaddress", value: webUser?.email || "" },
        { key: "patientTelephoneNumber", value: webUser?.phone || "" },
        { key: "patientAddress", value: webUser?.address || "" },
      ];

      const next = { ...fieldValues };
      updates.forEach((u) => {
        if (!u.key) return;
        next[u.key] = u.value;
        setPdfFieldValue(u.key, u.value);
      });

      setFieldValues(next);
      schedulePreviewRebuild("autofill");

      toast.success("✅ Auto-fill applied (best effort).", { toastId: "autofill-ok" });
    } catch (err) {
      console.log("[Day27] ❌ autofill failed:", err?.response?.data || err?.message || err);
      toast.error("❌ Auto-fill failed. Check console.");
    } finally {
      setBusy(false);
    }
  };

  // 3) Save filled PDF to backend (multipart)
  const handleSaveToBackend = async () => {
    try {
      console.log("[Day27] handleSaveToBackend clicked");

      const pdfDoc = pdfDocRef.current;
      if (!pdfDoc) {
        console.log("[Day27] ❌ pdfDoc missing");
        toast.error("PDF not loaded yet.");
        return;
      }

      setBusy(true);

      console.log("[Day27] saving pdfDoc -> bytes");
      const savedBytes = await pdfDoc.save();
      console.log("[Day27] ✅ savedBytes byteLength:", savedBytes?.byteLength);

      const blob = new Blob([savedBytes], { type: "application/pdf" });

      const fileName = `day27_${user?.webUserId || "user"}_${Date.now()}.pdf`;
      console.log("[Day27] fileName:", fileName);

      const fd = new FormData();
      fd.append("pdf", blob, fileName);
      fd.append("fieldValues", JSON.stringify(fieldValues || {}));
      fd.append("templateName", "Fillable Form Draft (1)");
      fd.append("sessionId", `${user?.webUserId || "user"}_${Date.now()}`);

      console.log("[Day27] uploading multipart: POST /web/api/day27/upload-pdf-imagekit");

      const up = await callBackend.post("/web/api/day27/upload-pdf-imagekit", fd, {
        withCredentials: true,
        timeout: 60000,
        transformRequest: [
          (data, headers) => {
            try {
              if (headers) {
                delete headers["Content-Type"];
                delete headers["content-type"];
              }
            } catch (e) {
              console.log("[Day27] transformRequest header delete failed:", e?.message || e);
            }
            return data;
          },
        ],
        headers: {},
      });

      console.log("[Day27] ✅ upload response:", up?.data);
      setLastUpload(up?.data || null);

      toast.success("✅ Saved (uploaded to ImageKit).", { toastId: "upload-ok" });
    } catch (err) {
      console.log("[Day27] ❌ save/upload failed:", err?.response?.data || err?.message || err);
      toast.error("❌ Upload failed. Check backend logs + console.", { toastId: "upload-fail" });
    } finally {
      setBusy(false);
    }
  };

  /* ------------------ “Replica” layout config ------------------ */

  const getMeta = (fieldName) => fieldMapRef.current.get(fieldName);
  const getMetaOptions = (fieldName) => {
    const meta = getMeta(fieldName);
    const opts = meta?.options;
    return Array.isArray(opts) ? opts : [];
  };

  const checkboxPanels = useMemo(() => {
    // Group checkboxes into panels to mimic the 3-column tests zone.
    const map = fieldMapRef.current;
    const entries = Array.from(map.entries()).map(([name, meta]) => ({ name, type: meta.type }));

    const checks = entries.filter((x) => x.type === "PDFCheckBox");

    const groups = [
      { title: "HEMATOLOGY", match: (n) => n.startsWith("Hematology") || n.includes("ferritin") || n.includes("DNA testing") },
      { title: "CHEMISTRY", match: (n) => n.startsWith("Chemistry") || n.startsWith("OtherChemistryTests") || n.startsWith("Lipids") || n.startsWith("ThyroidFunction") || n.includes("Apo B") },
      { title: "MICROBIOLOGY / CULTURE", match: (n) => n.startsWith("Microbiology") || n.startsWith("microbiology") || n.startsWith("Vaginitis") || n.startsWith("Chilamydia") || n.startsWith("Gonorrhea") },
      { title: "STOOL SPECIMENS", match: (n) => n.startsWith("StoolSpecimens") },
      { title: "DERMATOLOGY / MYCOLOGY", match: (n) => n.startsWith("Dermatophytes") || n.startsWith("Specimen") || n.startsWith("Mycology") },
      { title: "URINE TESTS", match: (n) => n.startsWith("UrineTests") || n.startsWith("Urinetests") },
      { title: "HEPATITIS / HIV", match: (n) => n.startsWith("HepatitisSerology") || n.startsWith("Hiv") || n.startsWith("HivSerology") },
      { title: "OTHER TESTS", match: (n) => n.startsWith("Othertests") },
    ];

    const used = new Set();
    const panels = groups.map((g) => {
      const items = checks
        .filter((c) => g.match(c.name))
        .filter((c) => !used.has(c.name))
        .map((c) => {
          used.add(c.name);
          return c;
        });

      return { title: g.title, items };
    });

    const leftover = checks.filter((c) => !used.has(c.name));
    if (leftover.length) panels.push({ title: "OTHER (UNSORTED)", items: leftover });

    return panels.filter((p) => p.items.length);
  }, [fieldValues]);

  // Track which fields are already “placed” in the replica so we can auto-render the rest
  const replicaPlacedFields = useMemo(() => {
    const set = new Set();

    const add = (name) => {
      if (!name) return;
      set.add(name);
    };

    // Header
    add("thisAreaIsForLabUseOnly");

    // Patient
    add("patientLastName");
    add("patientFirstName");
    add("patientInitial(s)");
    add("dateOfBirth");
    add("ChartNumber");
    add("Room#(LTCuseonly)");
    add("patientEmailaddress");
    add("patientHealthIdNumber");
    add("patientAddress");
    add("patientCity,Province/State");
    add("patientPostalCode/ZipCode");
    add("patientTelephoneNumber");
    add("Fasting");
    add("FastingHoursPriorToTest");
    add("Sex");
    add("Pregnant");

    // Bill to radios
    add("BilltoPatient");
    add("BilltoOther");
    add("BilltoThirdPartyInsurance");

    // Physician
    add("physicianLastName");
    add("physicianFirstName");
    add("physicianAddress");
    add("physicianTelephoneNumber");
    add("physicianEmailAddress");
    add("physicianCONumber");
    add("Date/TimeOfMedication");
    add("Date/TimeOfCollection");
    add("physicianMSC#");
    add("physicianPhlebotomist");
    add("physicianDateEntry");
    add("PhoneOrFax");
    add("copy to: Address, Use Physician License number");
    add("Diagnosis & indicators for guideline protocol and special tests");

    // Bottom
    add("SendingOrder");
    add("Expiry");
    add("Frequency");
    add("PhysicianLicenseNumber");
    add("PhysicianSignature");
    add("Note");

    // Tests checkboxes (panels)
    checkboxPanels.forEach((p) => p.items.forEach((it) => add(it.name)));

    return set;
  }, [checkboxPanels]);

  const unmappedFields = useMemo(() => {
    const entries = Array.from(fieldMapRef.current.entries()).map(([name, meta]) => ({
      name,
      type: meta.type,
      options: meta.options || [],
    }));

    // Anything not in placed set is shown here (so NOTHING is missed)
    return entries
      .filter((x) => x.name && !replicaPlacedFields.has(x.name))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [fieldValues, replicaPlacedFields]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="rounded-2xl border border-white/10 bg-black/40 px-6 py-4 text-white/80">
          Loading…
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <div className="text-2xl font-extrabold text-white">
            ☠️🔥 Day 27 — PDF UI Replica (Doctor Fill)
          </div>
          <div className="text-sm text-white/60 mt-1">
            JSX “paper” form captures doctor typing → updates fieldValues + pdf-lib → preview below → upload (multipart).
          </div>
          <div className="text-xs text-white/50 mt-1">
            status: <span className="text-white/70">{statusLabel}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleAutoFill}
            disabled={!pdfDocRef.current || busy}
            className={[
              "rounded-2xl px-4 py-2 text-sm font-extrabold border transition",
              !pdfDocRef.current || busy
                ? "border-white/10 bg-zinc-900/30 text-white/40 cursor-not-allowed"
                : "border-purple-500/40 bg-purple-500/15 text-purple-200 hover:bg-purple-500/25",
            ].join(" ")}
          >
            {busy ? "Working..." : "⚡ Auto Fill"}
          </button>

          <button
            onClick={handleSaveToBackend}
            disabled={!pdfDocRef.current || busy}
            className={[
              "rounded-2xl px-4 py-2 text-sm font-extrabold border transition",
              !pdfDocRef.current || busy
                ? "border-white/10 bg-zinc-900/30 text-white/40 cursor-not-allowed"
                : "border-white/20 bg-white/10 text-white hover:bg-white/15",
            ].join(" ")}
          >
            {busy ? "Saving..." : "💾 Save PDF"}
          </button>
        </div>
      </div>

      {/* ✅ NEW LAYOUT: Form on top (full width) */}
      <div className="rounded-2xl border border-white/10 bg-zinc-950/40 p-4">
        {/* “Paper” */}
        <div className="rounded-xl bg-white text-zinc-900 shadow-xl border border-zinc-200">
          {/* Top header */}
          <div className="border-b border-zinc-200 p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-lg font-extrabold uppercase">Laboratory Requisition</div>
                <div className="text-xs text-zinc-600 mt-1">
                  Complete and accurate information is required.
                </div>
              </div>

              {/* This Area Is For Lab Use Only */}
              <div className="w-[42%]">
                <TextAreaField
                  label="This Area Is For Lab Use Only"
                  value={fieldValues["thisAreaIsForLabUseOnly"] || ""}
                  onChange={(v) => setField("thisAreaIsForLabUseOnly", v, "PDFTextField")}
                />
              </div>
            </div>
          </div>

          {/* Patient Details */}
          <div className="p-4 border-b border-zinc-200">
            <div className="text-sm font-extrabold text-zinc-800 mb-2">Patient Details</div>

            <div className="grid grid-cols-12 gap-3">
              <TextField
                label="Patient Last Name"
                value={fieldValues["patientLastName"] || ""}
                onChange={(v) => setField("patientLastName", v, "PDFTextField")}
                className="col-span-4"
              />
              <TextField
                label="Patient First Name"
                value={fieldValues["patientFirstName"] || ""}
                onChange={(v) => setField("patientFirstName", v, "PDFTextField")}
                className="col-span-4"
              />
              <TextField
                label="Patient Initial(s)"
                value={fieldValues["patientInitial(s)"] || ""}
                onChange={(v) => setField("patientInitial(s)", v, "PDFTextField")}
                className="col-span-2"
              />
              <TextField
                label="Date of Birth"
                value={fieldValues["dateOfBirth"] || ""}
                onChange={(v) => setField("dateOfBirth", v, "PDFTextField")}
                className="col-span-2"
              />

              {/* Bill to (your PDF has these under “Bill to: …”) */}
              <div className="col-span-12 grid grid-cols-12 gap-3">
                <RadioGroupField
                  label="Bill to: Patient"
                  options={getMetaOptions("BilltoPatient")}
                  value={fieldValues["BilltoPatient"] || ""}
                  onChange={(v) => setField("BilltoPatient", v, "PDFRadioGroup")}
                  className="col-span-4"
                />
                <RadioGroupField
                  label="Bill to: Other"
                  options={getMetaOptions("BilltoOther")}
                  value={fieldValues["BilltoOther"] || ""}
                  onChange={(v) => setField("BilltoOther", v, "PDFRadioGroup")}
                  className="col-span-4"
                />
                <RadioGroupField
                  label="Bill to: Third Party Insurance"
                  options={getMetaOptions("BilltoThirdPartyInsurance")}
                  value={fieldValues["BilltoThirdPartyInsurance"] || ""}
                  onChange={(v) => setField("BilltoThirdPartyInsurance", v, "PDFRadioGroup")}
                  className="col-span-4"
                />
              </div>

              <TextField
                label="Chart Number"
                value={fieldValues["ChartNumber"] || ""}
                onChange={(v) => setField("ChartNumber", v, "PDFTextField")}
                className="col-span-3"
              />
              <TextField
                label="Room # (LTC use only)"
                value={fieldValues["Room#(LTCuseonly)"] || ""}
                onChange={(v) => setField("Room#(LTCuseonly)", v, "PDFTextField")}
                className="col-span-3"
              />
              <TextField
                label="Health ID Number"
                value={fieldValues["patientHealthIdNumber"] || ""}
                onChange={(v) => setField("patientHealthIdNumber", v, "PDFTextField")}
                className="col-span-3"
              />
              <TextField
                label="Postal Code / Zip"
                value={fieldValues["patientPostalCode/ZipCode"] || ""}
                onChange={(v) => setField("patientPostalCode/ZipCode", v, "PDFTextField")}
                className="col-span-3"
              />

              <TextField
                label="Patient Email"
                value={fieldValues["patientEmailaddress"] || ""}
                onChange={(v) => setField("patientEmailaddress", v, "PDFTextField")}
                className="col-span-4"
              />
              <TextField
                label="Patient Telephone"
                value={fieldValues["patientTelephoneNumber"] || ""}
                onChange={(v) => setField("patientTelephoneNumber", v, "PDFTextField")}
                className="col-span-4"
              />
              <TextField
                label="City / Province / State"
                value={fieldValues["patientCity,Province/State"] || ""}
                onChange={(v) => setField("patientCity,Province/State", v, "PDFTextField")}
                className="col-span-4"
              />

              <TextField
                label="Patient Address"
                value={fieldValues["patientAddress"] || ""}
                onChange={(v) => setField("patientAddress", v, "PDFTextField")}
                className="col-span-8"
              />

              <div className="col-span-4">
                <RadioGroupField
                  label="Sex"
                  options={getMetaOptions("Sex").length ? getMetaOptions("Sex") : ["F", "M"]}
                  value={fieldValues["Sex"] || ""}
                  onChange={(v) => setField("Sex", v, "PDFRadioGroup")}
                />
              </div>

              <div className="col-span-6 flex items-end gap-4">
                <div className="flex-1">
                  <CheckField
                    label="Fasting"
                    checked={!!fieldValues["Fasting"]}
                    onChange={(v) => setField("Fasting", v, "PDFCheckBox")}
                    className="mt-1"
                  />
                </div>
                <div className="flex-1">
                  <TextField
                    label="Hours prior to test"
                    value={fieldValues["FastingHoursPriorToTest"] || ""}
                    onChange={(v) => setField("FastingHoursPriorToTest", v, "PDFTextField")}
                  />
                </div>
              </div>

              <div className="col-span-6">
                <RadioGroupField
                  label="Pregnant"
                  options={getMetaOptions("Pregnant").length ? getMetaOptions("Pregnant") : ["Yes", "No"]}
                  value={fieldValues["Pregnant"] || ""}
                  onChange={(v) => setField("Pregnant", v, "PDFRadioGroup")}
                />
              </div>
            </div>
          </div>

          {/* Physician Details */}
          <div className="p-4 border-b border-zinc-200">
            <div className="text-sm font-extrabold text-zinc-800 mb-2">Physician Details</div>

            <div className="grid grid-cols-12 gap-3">
              <TextField
                label="Physician Last Name"
                value={fieldValues["physicianLastName"] || ""}
                onChange={(v) => setField("physicianLastName", v, "PDFTextField")}
                className="col-span-4"
              />
              <TextField
                label="Physician First Name"
                value={fieldValues["physicianFirstName"] || ""}
                onChange={(v) => setField("physicianFirstName", v, "PDFTextField")}
                className="col-span-4"
              />
              <TextField
                label="Physician Telephone Number"
                value={fieldValues["physicianTelephoneNumber"] || ""}
                onChange={(v) => setField("physicianTelephoneNumber", v, "PDFTextField")}
                className="col-span-4"
              />

              <TextField
                label="Physician Address"
                value={fieldValues["physicianAddress"] || ""}
                onChange={(v) => setField("physicianAddress", v, "PDFTextField")}
                className="col-span-6"
              />
              <TextField
                label="Physician Email Address"
                value={fieldValues["physicianEmailAddress"] || ""}
                onChange={(v) => setField("physicianEmailAddress", v, "PDFTextField")}
                className="col-span-6"
              />

              <TextField
                label="CO Number"
                value={fieldValues["physicianCONumber"] || ""}
                onChange={(v) => setField("physicianCONumber", v, "PDFTextField")}
                className="col-span-3"
              />
              <TextField
                label="MSC #"
                value={fieldValues["physicianMSC#"] || ""}
                onChange={(v) => setField("physicianMSC#", v, "PDFTextField")}
                className="col-span-3"
              />
              <TextField
                label="Date / Time of Medication"
                value={fieldValues["Date/TimeOfMedication"] || ""}
                onChange={(v) => setField("Date/TimeOfMedication", v, "PDFTextField")}
                className="col-span-3"
              />
              <TextField
                label="Date / Time of Collection"
                value={fieldValues["Date/TimeOfCollection"] || ""}
                onChange={(v) => setField("Date/TimeOfCollection", v, "PDFTextField")}
                className="col-span-3"
              />

              <TextField
                label="Phlebotomist"
                value={fieldValues["physicianPhlebotomist"] || ""}
                onChange={(v) => setField("physicianPhlebotomist", v, "PDFTextField")}
                className="col-span-4"
              />
              <TextField
                label="Date Entry"
                value={fieldValues["physicianDateEntry"] || ""}
                onChange={(v) => setField("physicianDateEntry", v, "PDFTextField")}
                className="col-span-4"
              />

              <RadioGroupField
                label="Phone / Fax"
                options={getMetaOptions("PhoneOrFax").length ? getMetaOptions("PhoneOrFax") : ["Phone", "Fax"]}
                value={fieldValues["PhoneOrFax"] || ""}
                onChange={(v) => setField("PhoneOrFax", v, "PDFRadioGroup")}
                className="col-span-4"
              />

              <TextAreaField
                label="Copy to: Address, Use Physician License number"
                value={fieldValues["copy to: Address, Use Physician License number"] || ""}
                onChange={(v) => setField("copy to: Address, Use Physician License number", v, "PDFTextField")}
                className="col-span-6"
              />

              <TextAreaField
                label="Diagnosis & indicators for guideline protocol and special tests"
                value={fieldValues["Diagnosis & indicators for guideline protocol and special tests"] || ""}
                onChange={(v) =>
                  setField("Diagnosis & indicators for guideline protocol and special tests", v, "PDFTextField")
                }
                className="col-span-6"
              />
            </div>
          </div>

          {/* Tests Area */}
          <div className="p-4 border-b border-zinc-200">
            <div className="text-xs text-zinc-600 mb-3">
              For tests indicated with the shaded tick box consult guidelines and protocols.
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {checkboxPanels.map((panel) => (
                <div key={panel.title} className="rounded-lg border border-zinc-200 bg-zinc-50 p-3">
                  <div className="text-xs font-extrabold text-zinc-800 mb-2">{panel.title}</div>
                  <div className="space-y-1">
                    {panel.items.map((it) => (
                      <CheckField
                        key={it.name}
                        label={it.name}
                        checked={!!fieldValues[it.name]}
                        onChange={(v) => setField(it.name, v, "PDFCheckBox")}
                        className="text-[13px]"
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom right-ish metadata */}
          <div className="p-4 border-b border-zinc-200">
            <div className="grid grid-cols-12 gap-3">
              <TextField
                label="Sending Order"
                value={fieldValues["SendingOrder"] || ""}
                onChange={(v) => setField("SendingOrder", v, "PDFTextField")}
                className="col-span-4"
              />
              <TextField
                label="Expiry"
                value={fieldValues["Expiry"] || ""}
                onChange={(v) => setField("Expiry", v, "PDFTextField")}
                className="col-span-4"
              />
              <TextField
                label="Frequency"
                value={fieldValues["Frequency"] || ""}
                onChange={(v) => setField("Frequency", v, "PDFTextField")}
                className="col-span-4"
              />

              <TextField
                label="Physician License Number"
                value={fieldValues["PhysicianLicenseNumber"] || ""}
                onChange={(v) => setField("PhysicianLicenseNumber", v, "PDFTextField")}
                className="col-span-6"
              />
              <TextField
                label="Physician Signature"
                value={fieldValues["PhysicianSignature"] || ""}
                onChange={(v) => setField("PhysicianSignature", v, "PDFTextField")}
                className="col-span-6"
              />
            </div>
          </div>

          {/* Note */}
          <div className="p-4 border-b border-zinc-200">
            <TextAreaField
              label="Note"
              value={fieldValues["Note"] || ""}
              onChange={(v) => setField("Note", v, "PDFTextField")}
            />
          </div>

          {/* ✅ ALWAYS SHOW ANY LEFTOVER/NESTED FIELDS SO WE MISS NOTHING */}
          <div className="p-4">
            <div className="text-sm font-extrabold text-zinc-800 mb-1">
              Unmapped / Nested Fields (Auto-rendered)
            </div>
            <div className="text-xs text-zinc-600 mb-3">
              Anything not placed above shows here automatically so <b>no AcroForm fields are missed</b>.
            </div>

            {!unmappedFields.length ? (
              <div className="text-sm text-zinc-700">✅ No unmapped fields.</div>
            ) : (
              <div className="grid grid-cols-12 gap-3">
                {unmappedFields.map((f) => {
                  const val = fieldValues?.[f.name];

                  // Wider for long names like “Diagnosis & …” etc
                  const wide = String(f.name || "").length > 28;

                  if (f.type === "PDFCheckBox") {
                    return (
                      <div key={f.name} className={`col-span-12 ${wide ? "" : ""}`}>
                        <div className="rounded-md border border-zinc-200 bg-zinc-50 p-3">
                          <FieldLabel>{f.type}</FieldLabel>
                          <div className="mt-1">
                            <CheckField
                              label={f.name}
                              checked={!!val}
                              onChange={(v) => setField(f.name, v, "PDFCheckBox")}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  }

                  if (f.type === "PDFRadioGroup") {
                    const opts = getMetaOptions(f.name);
                    return (
                      <div key={f.name} className={`col-span-12 md:col-span-6`}>
                        <div className="rounded-md border border-zinc-200 bg-zinc-50 p-3">
                          <FieldLabel>{f.type}</FieldLabel>
                          <RadioGroupField
                            label={f.name}
                            options={opts}
                            value={val || ""}
                            onChange={(v) => setField(f.name, v, "PDFRadioGroup")}
                          />
                        </div>
                      </div>
                    );
                  }

                  if (f.type === "PDFDropdown" || f.type === "PDFOptionList") {
                    const opts = getMetaOptions(f.name);
                    return (
                      <div key={f.name} className={`col-span-12 md:col-span-6`}>
                        <div className="rounded-md border border-zinc-200 bg-zinc-50 p-3">
                          <FieldLabel>{f.type}</FieldLabel>
                          <SelectField
                            label={f.name}
                            options={opts}
                            value={val || ""}
                            onChange={(v) => setField(f.name, v, f.type)}
                          />
                        </div>
                      </div>
                    );
                  }

                  // Default to text
                  return (
                    <div key={f.name} className={`col-span-12 ${wide ? "" : "md:col-span-6"}`}>
                      <div className="rounded-md border border-zinc-200 bg-zinc-50 p-3">
                        <FieldLabel>{f.type}</FieldLabel>
                        <TextField
                          label={f.name}
                          value={typeof val === "string" ? val : String(val ?? "")}
                          onChange={(v) => setField(f.name, v, "PDFTextField")}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {lastUpload?.fileId ? (
              <div className="mt-4 rounded-lg border border-zinc-200 bg-zinc-50 p-3">
                <div className="text-xs font-extrabold text-zinc-800">Last upload</div>
                <div className="text-xs text-zinc-700 mt-2">fileId: {lastUpload.fileId}</div>
                <div className="text-xs text-zinc-700 mt-1 break-all">url: {lastUpload.url}</div>
              </div>
            ) : null}

            <div className="mt-3 text-xs text-zinc-600">
              ✅ Controlled JSX updates <b>fieldValues</b> and pdf-lib fields together, so doctor input is always captured.
            </div>
          </div>
        </div>
      </div>

      {/* ✅ NEW LAYOUT: PDF preview UNDER the form */}
      <div className="mt-4 rounded-2xl border border-white/10 bg-black/40 p-4">
        <div className="text-white font-extrabold mb-2">PDF Live Preview</div>
        {!pdfUrl ? (
          <div className="h-[78vh] rounded-2xl border border-white/10 bg-zinc-900/20 flex items-center justify-center text-white/60">
            Loading PDF from backend…
          </div>
        ) : (
          <iframe
            title="Day27 PDF"
            src={pdfUrl}
            className="w-full h-[78vh] rounded-2xl border border-white/10 bg-black"
          />
        )}
        <div className="mt-3 text-xs text-white/50">
          Preview updates as you type (debounced). Save uploads the generated PDF bytes (multipart) + fieldValues JSON.
        </div>
      </div>
    </div>
  );
}
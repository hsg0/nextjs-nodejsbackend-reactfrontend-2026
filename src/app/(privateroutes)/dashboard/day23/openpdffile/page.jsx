"use client";

import React, { useEffect, useMemo, useState } from "react";
import useAuthCheck from "@/checkAuth/authCheck.js";
import callBackend from "@/lib/callBackend.js";

export default function Day23OpenPdfFilePage() {
  const { loading, user } = useAuthCheck();

  const [fields, setFields] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [search, setSearch] = useState("");

  // values keyed by PDF field name
  const [values, setValues] = useState({});

  // pick which field corresponds to doctor info
  const [doctorNameField, setDoctorNameField] = useState("");
  const [doctorEmailField, setDoctorEmailField] = useState("");

  // PDF URL (served by backend)
  const pdfUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/web/api/day23/acroform/template`;

  useEffect(() => {
    console.log("[Day23 openpdffile] mounted");
    console.log("[Day23 openpdffile] pdfUrl:", pdfUrl);
  }, [pdfUrl]);

  useEffect(() => {
    const fetchFields = async () => {
      try {
        console.log("➡️ [Day23] fetching acroform fields...");
        const res = await callBackend.get("/web/api/day23/acroform/fields");
        const list = res?.data?.fields || [];

        console.log("✅ [Day23] fields received:", list.length, list);

        setFields(list);

        // init values with defaults
        const init = {};
        list.forEach((f) => {
          if (f.type === "PDFCheckBox") init[f.name] = Boolean(f.value);
          else if (f.type === "PDFRadioGroup") init[f.name] = f.value || "";
          else if (f.type === "PDFDropdown")
            init[f.name] = Array.isArray(f.value) ? f.value[0] || "" : f.value || "";
          else init[f.name] = f.value ?? "";
        });
        setValues(init);
      } catch (err) {
        console.log("❌ [Day23] fetch fields error:", err?.response?.data || err?.message || err);
      } finally {
        setFetching(false);
      }
    };

    fetchFields();
  }, []);

  const filteredFields = useMemo(() => {
    const s = search.trim().toLowerCase();
    if (!s) return fields;
    return fields.filter(
      (f) => f.name.toLowerCase().includes(s) || f.type.toLowerCase().includes(s)
    );
  }, [fields, search]);

  const onChange = (fieldName, nextVal) => {
    console.log("[Day23] change:", fieldName, nextVal);
    setValues((prev) => ({ ...prev, [fieldName]: nextVal }));
  };

  const applyDoctorAutoFill = () => {
    const docName = user?.name || user?.fullName || "";
    const docEmail = user?.email || "";

    console.log("➡️ [Day23] applyDoctorAutoFill:", {
      doctorNameField,
      doctorEmailField,
      docName,
      docEmail,
    });

    setValues((prev) => {
      const next = { ...prev };
      if (doctorNameField) next[doctorNameField] = docName;
      if (doctorEmailField) next[doctorEmailField] = docEmail;
      return next;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        Loading…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-2xl font-extrabold">☠️🔥 Day 23 — PDF + Auto Fields</h1>
      <p className="text-white/70 mt-2">
        Left: PDF preview. Right: Auto-generated fields from AcroForm using pdf-lib.
      </p>

      {/* Layout: PDF first (left), fields overlay UI (right) */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT: PDF Viewer */}
        <div className="rounded-xl bg-white/5 border border-white/10 overflow-hidden">
          <div className="p-3 border-b border-white/10 flex items-center justify-between">
            <div className="font-bold">PDF Preview</div>
            <a
              className="text-sm text-purple-300 hover:text-purple-200"
              href={pdfUrl}
              target="_blank"
              rel="noreferrer"
              onClick={() => console.log("[Day23] open pdf in new tab")}
            >
              Open in new tab
            </a>
          </div>

          <div className="h-[80vh] bg-white">
            {/* ✅ PDF first */}
            <iframe
              title="labs_temp.pdf"
              src={pdfUrl}
              className="w-full h-full"
            />
          </div>
        </div>

        {/* RIGHT: Auto-generated fields */}
        <div className="rounded-xl bg-white/5 border border-white/10 p-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-bold text-lg">Auto-Generated Fields</h2>
            <div className="text-sm text-white/60">
              {fetching ? "Loading fields..." : `${filteredFields.length} fields`}
            </div>
          </div>

          {/* Doctor Autofill controls */}
          <div className="mt-4 rounded-xl bg-black/30 border border-white/10 p-4">
            <div className="font-bold">Doctor Auto-Fill Mapping</div>
            <div className="text-sm text-white/70 mt-1">
              Pick the field names for doctor name/email, then auto-fill from your logged-in user.
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm text-white/80">Doctor Name Field</label>
                <select
                  className="mt-1 w-full p-2 rounded bg-white text-black"
                  value={doctorNameField}
                  onChange={(e) => {
                    console.log("[Day23] doctorNameField selected:", e.target.value);
                    setDoctorNameField(e.target.value);
                  }}
                >
                  <option value="">-- choose field --</option>
                  {fields.map((f) => (
                    <option key={f.name} value={f.name}>
                      {f.name} ({f.type})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-white/80">Doctor Email Field</label>
                <select
                  className="mt-1 w-full p-2 rounded bg-white text-black"
                  value={doctorEmailField}
                  onChange={(e) => {
                    console.log("[Day23] doctorEmailField selected:", e.target.value);
                    setDoctorEmailField(e.target.value);
                  }}
                >
                  <option value="">-- choose field --</option>
                  {fields.map((f) => (
                    <option key={f.name} value={f.name}>
                      {f.name} ({f.type})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={applyDoctorAutoFill}
              className="mt-4 px-4 py-2 rounded bg-purple-600 hover:bg-purple-500 font-bold"
            >
              Auto-Fill Doctor Info
            </button>

            <div className="mt-3 text-sm text-white/70">
              Logged-in: <b>{user?.email || "no email"}</b>
            </div>
          </div>

          {/* Search */}
          <div className="mt-4">
            <input
              className="w-full p-2 rounded bg-white text-black"
              placeholder="Search fields (name/type)..."
              value={search}
              onChange={(e) => {
                console.log("[Day23] search:", e.target.value);
                setSearch(e.target.value);
              }}
            />
          </div>

          {/* Fields list */}
          <div className="mt-4 max-h-[55vh] overflow-auto pr-1">
            <div className="grid grid-cols-1 gap-4">
              {filteredFields.map((f) => {
                const v = values[f.name];

                // Text Field
                if (f.type === "PDFTextField") {
                  return (
                    <div key={f.name}>
                      <div className="text-sm text-white/80">
                        <b>{f.name}</b>{" "}
                        <span className="text-white/50">({f.type})</span>
                      </div>
                      <input
                        className="mt-1 w-full p-2 rounded bg-white text-black"
                        value={v || ""}
                        onChange={(e) => onChange(f.name, e.target.value)}
                      />
                    </div>
                  );
                }

                // Checkbox
                if (f.type === "PDFCheckBox") {
                  return (
                    <label key={f.name} className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={Boolean(v)}
                        onChange={(e) => onChange(f.name, e.target.checked)}
                      />
                      <span className="text-sm text-white/80">
                        <b>{f.name}</b>{" "}
                        <span className="text-white/50">({f.type})</span>
                      </span>
                    </label>
                  );
                }

                // Dropdown / Option list / Radio
                if (
                  f.type === "PDFDropdown" ||
                  f.type === "PDFOptionList" ||
                  f.type === "PDFRadioGroup"
                ) {
                  const opts = Array.isArray(f.options) ? f.options : [];
                  return (
                    <div key={f.name}>
                      <div className="text-sm text-white/80">
                        <b>{f.name}</b>{" "}
                        <span className="text-white/50">({f.type})</span>
                      </div>

                      <select
                        className="mt-1 w-full p-2 rounded bg-white text-black"
                        value={v || ""}
                        onChange={(e) => onChange(f.name, e.target.value)}
                      >
                        <option value="">-- select --</option>
                        {opts.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>

                      {opts.length === 0 && (
                        <div className="text-xs text-white/50 mt-1">
                          (No options returned for this field.)
                        </div>
                      )}
                    </div>
                  );
                }

                // Other field types
                return (
                  <div
                    key={f.name}
                    className="p-3 rounded bg-black/40 border border-white/10"
                  >
                    <div className="text-sm text-white/80">
                      <b>{f.name}</b>{" "}
                      <span className="text-white/50">({f.type})</span>
                    </div>
                    <div className="text-xs text-white/60 mt-1">
                      Not rendering an editor for this type yet.
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 text-white/60 text-sm">
            Next: add <b>POST /web/api/day23/acroform/fill</b> to generate the filled PDF.
          </div>
        </div>
      </div>
    </div>
  );
}
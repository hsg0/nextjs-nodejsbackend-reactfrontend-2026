// backend/pdfgenerator/day21/templates/labReqFromTemplate.js
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { PDFDocument, StandardFonts } from "pdf-lib";

/**
 * Loads labs_temp.pdf as the background and overlays fillable fields.
 * Returns: Buffer (pdf bytes)
 *
 * IMPORTANT:
 * - Coordinates in pdf-lib start at bottom-left of the page.
 * - You will likely do 1-3 alignment passes using the debug overlay helper below.
 */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function safeStr(v) {
  return String(v ?? "").replaceAll("\u00A0", " ");
}

function canCreateEmitter(mod) {
  return !!mod;
}

// ✅ prevents "/DA not found" issues and keeps appearances working
function addTextField({ form, page, name, x, y, w, h, font, fontSize = 10, multiline = false }) {
  const tf = form.createTextField(name);
  tf.addToPage(page, { x, y, width: w, height: h });
  tf.setFontSize(fontSize);
  if (multiline) tf.enableMultiline();
  tf.updateAppearances(font);
  return tf;
}

function addCheckBox({ form, page, name, x, y, size = 10 }) {
  const cb = form.createCheckBox(name);
  cb.addToPage(page, { x, y, width: size, height: size });
  return cb;
}

/**
 * DEBUG helper: draws boxes around your fields so you can align them.
 * Turn on/off using options.debugBoxes = true.
 */
function drawDebugRect(page, x, y, w, h) {
  page.drawRectangle({
    x,
    y,
    width: w,
    height: h,
    borderWidth: 0.6,
    // default black border
  });
}

export async function createLabReqPdfFromTemplate(data = {}, options = {}) {
  console.log("[labReqFromTemplate] createLabReqPdfFromTemplate called");
  console.log("[labReqFromTemplate] data keys:", Object.keys(data || {}));
  console.log("[labReqFromTemplate] options:", options);

  const templatePath = path.join(__dirname, "labs_temp.pdf");

  console.log("[labReqFromTemplate] templatePath:", templatePath);

  if (!fs.existsSync(templatePath)) {
    console.log("[labReqFromTemplate] ❌ labs_temp.pdf not found at:", templatePath);
    throw new Error("labs_temp.pdf not found");
  }

  const templateBytes = fs.readFileSync(templatePath);
  const pdfDoc = await PDFDocument.load(templateBytes);

  const form = pdfDoc.getForm();
  const pages = pdfDoc.getPages();
  const page = pages[0];

  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // OPTIONAL: if the template already has fields, log them
  try {
    const existingFields = form.getFields();
    console.log("[labReqFromTemplate] existing fields count:", existingFields.length);
    existingFields.slice(0, 25).forEach((f, idx) => {
      console.log(`[labReqFromTemplate] existing field ${idx}:`, f.getName());
    });
  } catch (e) {
    console.log("[labReqFromTemplate] existing field read error (safe to ignore):", e?.message);
  }

  /**
   * ✅ FIELD PLACEMENT STARTER MAP
   * These coordinates are STARTING POINTS.
   * You will tune them after generating a debug PDF and visually checking.
   *
   * TIP:
   * - Run once with debugBoxes: true
   * - Open the PDF, see where boxes land
   * - Adjust x/y/w/h until perfect
   */

  const debug = !!options.debugBoxes;

  const fields = [];

  // --- Patient Header Area (starter positions) ---
  fields.push({ type: "text", name: "patient_last_name", x: 70,  y: 455, w: 240, h: 18, fs: 11 });
  fields.push({ type: "text", name: "patient_first_name", x: 410, y: 455, w: 240, h: 18, fs: 11 });

  fields.push({ type: "text", name: "patient_email", x: 150, y: 405, w: 250, h: 16, fs: 10 });
  fields.push({ type: "text", name: "patient_health_id", x: 520, y: 405, w: 170, h: 16, fs: 10 });

  fields.push({ type: "text", name: "patient_address", x: 160, y: 380, w: 520, h: 16, fs: 10 });

  fields.push({ type: "text", name: "patient_phone", x: 170, y: 355, w: 210, h: 16, fs: 10 });
  fields.push({ type: "text", name: "patient_dob", x: 520, y: 355, w: 170, h: 16, fs: 10 });

  // Bill-to checkboxes (starter)
  fields.push({ type: "check", name: "bill_government", x: 255, y: 430, size: 10 });
  fields.push({ type: "check", name: "bill_third_party", x: 345, y: 430, size: 10 });
  fields.push({ type: "check", name: "bill_insurance", x: 445, y: 430, size: 10 });
  fields.push({ type: "check", name: "bill_patient", x: 545, y: 430, size: 10 });
  fields.push({ type: "check", name: "bill_other", x: 625, y: 430, size: 10 });
  fields.push({ type: "text", name: "bill_other_text", x: 665, y: 428, w: 90, h: 14, fs: 9 });

  // --- Ordering physician area (starter) ---
  fields.push({ type: "text", name: "ordering_address", x: 200, y: 320, w: 460, h: 16, fs: 10 });
  fields.push({ type: "text", name: "practitioner_or_license", x: 280, y: 295, w: 380, h: 16, fs: 10 });
  fields.push({ type: "text", name: "physician_phone", x: 175, y: 270, w: 200, h: 16, fs: 10 });
  fields.push({ type: "text", name: "physician_email", x: 190, y: 245, w: 280, h: 16, fs: 10 });

  // --- Right middle area (collection/pregnancy/fasting) ---
  fields.push({ type: "text", name: "collection_datetime", x: 540, y: 320, w: 200, h: 16, fs: 10 });
  fields.push({ type: "check", name: "pregnant_yes", x: 560, y: 295, size: 10 });
  fields.push({ type: "check", name: "pregnant_no", x: 620, y: 295, size: 10 });
  fields.push({ type: "text", name: "fasting_hours", x: 615, y: 270, w: 40, h: 16, fs: 10 });

  // Notes (starter big box)
  fields.push({ type: "text", name: "notes", x: 85, y: 205, w: 650, h: 60, fs: 10, multiline: true });

  // -----------------------------
  // Create fields (and debug draw)
  // -----------------------------
  console.log("[labReqFromTemplate] adding fields:", fields.length);

  for (const f of fields) {
    if (debug && f.type === "text") drawDebugRect(page, f.x, f.y, f.w, f.h);
    if (debug && f.type === "check") drawDebugRect(page, f.x, f.y, f.size, f.size);

    if (f.type === "text") {
      addTextField({
        form,
        page,
        name: f.name,
        x: f.x,
        y: f.y,
        w: f.w,
        h: f.h,
        font: helvetica,
        fontSize: f.fs ?? 10,
        multiline: !!f.multiline,
      });
    }

    if (f.type === "check") {
      addCheckBox({
        form,
        page,
        name: f.name,
        x: f.x,
        y: f.y,
        size: f.size ?? 10,
      });
    }
  }

  // -----------------------------
  // Fill values if provided
  // -----------------------------
  console.log("[labReqFromTemplate] filling values...");

  const setIf = (fieldName, value) => {
    if (value === undefined || value === null) return;
    try {
      const tf = form.getTextField(fieldName);
      tf.setText(safeStr(value));
      tf.updateAppearances(helvetica);
      console.log("[labReqFromTemplate] set text:", fieldName, "=", value);
    } catch (e) {
      console.log("[labReqFromTemplate] (skip) text field not found:", fieldName);
    }
  };

  const checkIf = (fieldName, isChecked) => {
    if (isChecked === undefined || isChecked === null) return;
    try {
      const cb = form.getCheckBox(fieldName);
      if (isChecked) cb.check();
      else cb.uncheck();
      console.log("[labReqFromTemplate] set check:", fieldName, "=", !!isChecked);
    } catch (e) {
      console.log("[labReqFromTemplate] (skip) checkbox not found:", fieldName);
    }
  };

  // Example fills (you’ll pass real values from req.body later)
  setIf("patient_last_name", data.patient_last_name);
  setIf("patient_first_name", data.patient_first_name);
  setIf("patient_email", data.patient_email);
  setIf("patient_health_id", data.patient_health_id);
  setIf("patient_address", data.patient_address);
  setIf("patient_phone", data.patient_phone);
  setIf("patient_dob", data.patient_dob);

  checkIf("bill_government", data.bill_government);
  checkIf("bill_third_party", data.bill_third_party);
  checkIf("bill_insurance", data.bill_insurance);
  checkIf("bill_patient", data.bill_patient);
  checkIf("bill_other", data.bill_other);
  setIf("bill_other_text", data.bill_other_text);

  setIf("ordering_address", data.ordering_address);
  setIf("practitioner_or_license", data.practitioner_or_license);
  setIf("physician_phone", data.physician_phone);
  setIf("physician_email", data.physician_email);

  setIf("collection_datetime", data.collection_datetime);
  checkIf("pregnant_yes", data.pregnant_yes);
  checkIf("pregnant_no", data.pregnant_no);
  setIf("fasting_hours", data.fasting_hours);

  setIf("notes", data.notes);

  // IMPORTANT: do NOT flatten if you want users to edit fields after download
  const bytes = await pdfDoc.save();
  console.log("[labReqFromTemplate] ✅ PDF created from template. bytes:", bytes.length);

  return Buffer.from(bytes);
}
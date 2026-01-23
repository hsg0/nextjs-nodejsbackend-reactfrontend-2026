// backend/pdfgenerator/day21/templates/labReqTemplate.js
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

/**
 * Lab Requisition TEMPLATE (ONE PAGE, fillable)
 * - Letter LANDSCAPE: 792 x 612
 * - Uses ONLY StandardFonts (Helvetica/HelveticaBold)
 * - Uses the ENTIRE page (near-zero margins) like your screenshot
 *
 * IMPORTANT:
 * - StandardFonts use WinAnsi encoding (limited). Unicode like "→" will crash.
 * - This file sanitizes ALL text before drawing.
 */

export async function createGenericLabReqTemplatePdf() {
  console.log("[labReqTemplate] createGenericLabReqTemplatePdf called");

  // =========================
  // PDF setup
  // =========================
  const pdfDocument = await PDFDocument.create();
  const pdfPage = pdfDocument.addPage([792, 612]); // landscape letter

  const normalFont = await pdfDocument.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDocument.embedFont(StandardFonts.HelveticaBold);

  const pdfForm = pdfDocument.getForm();

  // =========================
  // Page geometry (USE ENTIRE PAGE)
  // =========================
  const pageWidth = 792;
  const pageHeight = 612;

  // ✅ near-zero margin (still leaves 4px so borders don't clip in some viewers/printers)
  const m = 4;

  const x0 = m;
  const x3 = pageWidth - m;
  const y0 = m;
  const y3 = pageHeight - m;

  const usableW = x3 - x0;
  const usableH = y3 - y0;

  // =========================
  // Styling
  // =========================
  const colorPalette = {
    borderBlue: rgb(0.15, 0.45, 0.75),
    lightFillBlue: rgb(0.92, 0.96, 1.0),
    headerFillBlue: rgb(0.86, 0.93, 1.0),
    textDarkBlue: rgb(0.06, 0.18, 0.28),
    accentBlue: rgb(0.05, 0.15, 0.9),
    redNotice: rgb(0.85, 0.12, 0.12),
    white: rgb(1, 1, 1),
  };

  // =========================
  // WinAnsi-safe sanitizer
  // =========================
  const sanitizeWinAnsi = (s) =>
    String(s ?? "")
      .replaceAll("→", "->")
      .replaceAll("•", "-")
      .replaceAll("’", "'")
      .replaceAll("“", '"')
      .replaceAll("”", '"')
      .replaceAll("–", "-")
      .replaceAll("—", "-")
      .replaceAll("…", "...")
      .replaceAll("\u00A0", " ");

  // =========================
  // Drawing helpers
  // =========================
  const drawRectangleBox = (leftX, bottomY, boxWidth, boxHeight, options = {}) => {
    pdfPage.drawRectangle({
      x: leftX,
      y: bottomY,
      width: boxWidth,
      height: boxHeight,
      borderWidth: options.borderWidth ?? 1,
      borderColor: options.borderColor ?? colorPalette.borderBlue,
      color: options.fill ? options.fillColor ?? colorPalette.lightFillBlue : undefined,
      opacity: options.opacity ?? 1,
    });
  };

  const drawLine = (xA, yA, xB, yB, thickness = 1) => {
    pdfPage.drawLine({
      start: { x: xA, y: yA },
      end: { x: xB, y: yB },
      thickness,
      color: colorPalette.borderBlue,
    });
  };

  const wrapTextLines = (rawText, font, fontSize, maxWidth) => {
    const text = sanitizeWinAnsi(rawText);
    if (!maxWidth || maxWidth <= 0) return [text];

    const words = text.split(/\s+/).filter(Boolean);
    if (words.length === 0) return [""];

    const lines = [];
    let current = "";

    for (const w of words) {
      const trial = current ? `${current} ${w}` : w;
      const width = font.widthOfTextAtSize(trial, fontSize);
      if (width <= maxWidth) {
        current = trial;
      } else {
        if (current) lines.push(current);

        const wWidth = font.widthOfTextAtSize(w, fontSize);
        if (wWidth <= maxWidth) {
          current = w;
        } else {
          let chunk = "";
          for (const ch of w) {
            const t = chunk + ch;
            if (font.widthOfTextAtSize(t, fontSize) <= maxWidth) chunk = t;
            else {
              if (chunk) lines.push(chunk);
              chunk = ch;
            }
          }
          current = chunk;
        }
      }
    }
    if (current) lines.push(current);
    return lines.length ? lines : [text];
  };

  const drawTextLabel = (textValue, leftX, bottomY, fontSize = 9, bold = false, options = {}) => {
    const font = bold ? boldFont : normalFont;
    const color = options.color ?? colorPalette.textDarkBlue;
    const maxWidth = options.maxWidth ?? null;
    const lineGap = options.lineGap ?? 2;

    const lines = wrapTextLines(textValue, font, fontSize, maxWidth);
    let y = bottomY;

    for (let i = 0; i < lines.length; i++) {
      pdfPage.drawText(lines[i], {
        x: leftX,
        y,
        size: fontSize,
        font,
        color,
      });
      y -= fontSize + lineGap;
    }
    return y;
  };

  // ✅ prevents "/DA not found" errors
  const addFillableTextField = (
    fieldName,
    leftX,
    bottomY,
    fieldWidth,
    fieldHeight,
    fontSize = 9,
    multiline = false
  ) => {
    const textField = pdfForm.createTextField(fieldName);

    textField.addToPage(pdfPage, {
      x: leftX,
      y: bottomY,
      width: fieldWidth,
      height: fieldHeight,
      borderColor: colorPalette.borderBlue,
      borderWidth: 1,
    });

    textField.updateAppearances(normalFont);
    textField.setFontSize(fontSize);
    if (multiline) textField.enableMultiline();
    textField.updateAppearances(normalFont);

    return textField;
  };

  const addFillableCheckBox = (fieldName, leftX, bottomY, size = 10) => {
    const checkBox = pdfForm.createCheckBox(fieldName);
    checkBox.addToPage(pdfPage, {
      x: leftX,
      y: bottomY,
      width: size,
      height: size,
      borderColor: colorPalette.borderBlue,
      borderWidth: 1,
    });
    return checkBox;
  };

  const drawSectionHeaderBar = (title, leftX, bottomY, width, height = 12, fontSize = 7.2) => {
    drawRectangleBox(leftX, bottomY, width, height, {
      fill: true,
      fillColor: colorPalette.lightFillBlue,
    });
    drawTextLabel(title, leftX + 5, bottomY + 3, fontSize, true);
  };

  const drawCheckRow = ({
    name,
    label,
    x,
    y,
    boxSize = 7,
    fontSize = 6.0,
    labelOffsetX = 11,
    maxWidth = null,
  }) => {
    addFillableCheckBox(name, x, y, boxSize);
    drawTextLabel(label, x + labelOffsetX, y + 1, fontSize, false, {
      maxWidth,
      lineGap: 1,
    });
  };

  // =========================
  // OUTER BORDER (like screenshot)
  // =========================
  drawRectangleBox(x0, y0, usableW, usableH, {
    fill: false,
    borderWidth: 1.2,
  });

  // =========================
  // LAYOUT (pixel-like sections)
  // =========================
  const gap = 4;

  // Header band
  const headerH = 50;
  const headerTop = y3;
  const headerBottom = headerTop - headerH;

  // Instruction band
  const instructionH = 18;
  const instructionTop = headerBottom - gap;
  const instructionBottom = instructionTop - instructionH;

  // Patient info band
  const patientH = 94;
  const patientTop = instructionBottom - gap;
  const patientBottom = patientTop - patientH;

  // Ordering + Collection band
  const middleH = 170;
  const middleTop = patientBottom - gap;
  const middleBottom = middleTop - middleH;

  // Tests band (rest of page)
  const testsTop = middleBottom - gap;
  const testsBottom = y0 + 2;

  // =========================
  // HEADER
  // =========================
  drawRectangleBox(x0 + 1, headerBottom, usableW - 2, headerH, {
    fill: true,
    fillColor: colorPalette.headerFillBlue,
  });

  // Title left
  drawTextLabel("Laboratory Requisition", x0 + 10, headerTop - 26, 18, true, {
    color: colorPalette.accentBlue,
  });

  // Small subtitle (left)
  drawTextLabel(
    "This requisition form, when completed,\nconstitutes a referral to a laboratory",
    x0 + 10,
    headerTop - 40,
    7.2,
    false,
    { maxWidth: 260, lineGap: 1 }
  );

  // Lab-use box right
  const labUseW = 260;
  const labUseH = 20;
  const labUseX = x3 - labUseW - 6;
  const labUseY = headerTop - labUseH - 8;
  drawRectangleBox(labUseX, labUseY, labUseW, labUseH, { fill: false });
  drawTextLabel("This Area Is For Lab Use Only", labUseX + 10, labUseY + 6, 9, true);

  // =========================
  // INSTRUCTION BAR
  // =========================
  drawRectangleBox(x0 + 1, instructionBottom, usableW - 2, instructionH, {
    fill: true,
    fillColor: colorPalette.lightFillBlue,
  });
  drawTextLabel(
    "Complete and Accurate information is required",
    x0 + usableW / 2 - 150,
    instructionBottom + 5,
    11,
    true,
    { color: colorPalette.redNotice }
  );

  // =========================
  // PATIENT SECTION (match screenshot blocks)
  // =========================
  drawRectangleBox(x0 + 1, patientBottom, usableW - 2, patientH, {
    fill: true,
    fillColor: colorPalette.lightFillBlue,
    opacity: 0.55,
  });
  drawRectangleBox(x0 + 1, patientBottom, usableW - 2, patientH, { fill: false });

  const pPad = 8;
  const pX = x0 + pPad;
  const pYTop = patientTop - 8;

  const leftW = usableW * 0.68;
  const rightW = usableW - leftW - pPad;
  const leftX = pX;
  const rightX = x0 + leftW + pPad;

  const labelSize = 8;
  const fieldH = 12;

  // Row 1: last / first name
  drawTextLabel("Patient Last Name:", leftX, pYTop, labelSize, true, { color: colorPalette.accentBlue });
  addFillableTextField("patient_lastName", leftX + 110, pYTop - 3, leftW - 130, fieldH, 9);

  drawTextLabel("Patient First Name:", rightX, pYTop, labelSize, true, { color: colorPalette.accentBlue });
  addFillableTextField("patient_firstName", rightX + 105, pYTop - 3, rightW - 115, fieldH, 9);

  // Row 2: bill to + health id
  const r2y = pYTop - 16;
  drawTextLabel("Patient Information: Bill To:", leftX, r2y, 7.6, true, { color: colorPalette.accentBlue });

  const cbS = 8;
  let bx = leftX + 155;
  const by = r2y - 2;

  const billItems = [
    ["bill_insurance", "Insurance"],
    ["bill_third_party", "Third-Party"],
    ["bill_government", "Government"],
    ["bill_patient", "Patient"],
    ["bill_other", "Other"],
  ];

  for (const [name, label] of billItems) {
    addFillableCheckBox(name, bx, by, cbS);
    drawTextLabel(label, bx + 10, by + 2, 7.2, false, { color: colorPalette.accentBlue });
    bx += 75;
  }
  addFillableTextField("bill_other_text", bx - 10, by - 1, 90, 10, 7);

  // Health ID number (right side)
  drawTextLabel("Health ID Number:", rightX, r2y, 7.6, true, { color: colorPalette.accentBlue });
  addFillableTextField("patient_id_number", rightX + 95, r2y - 3, rightW - 105, fieldH, 8);

  // Row 3: email + DOB
  const r3y = r2y - 16;
  drawTextLabel("Patient EMAIL ADDRESS:", leftX, r3y, 7.6, true, { color: colorPalette.accentBlue });
  addFillableTextField("patient_email", leftX + 130, r3y - 3, leftW - 150, fieldH, 8);

  drawTextLabel("Date Of Birth:", rightX, r3y, 7.6, true, { color: colorPalette.accentBlue });
  // compact DOB field (screenshot shows a single line)
  addFillableTextField("patient_dob_compact", rightX + 75, r3y - 3, rightW - 85, fieldH, 8);

  // keep the structured fields too (not visible but still fillable)
  addFillableTextField("patient_dob_day", rightX + 75, r3y - 18, 30, 10, 7);
  addFillableTextField("patient_dob_month", rightX + 110, r3y - 18, 40, 10, 7);
  addFillableTextField("patient_dob_year", rightX + 155, r3y - 18, 50, 10, 7);

  // Row 4: home address (full-ish) + phone + sex
  const r4y = r3y - 16;
  drawTextLabel("Patient Home Address:", leftX, r4y, 7.6, true, { color: colorPalette.accentBlue });
  addFillableTextField("patient_address", leftX + 125, r4y - 3, leftW - 145, fieldH, 8);

  drawTextLabel("Patient Phone Number:", rightX, r4y, 7.6, true, { color: colorPalette.accentBlue });
  addFillableTextField("patient_phone", rightX + 120, r4y - 3, rightW - 130, fieldH, 8);

  // Bottom row inside patient box: city/province + postal + chart id + room + sex
  const r5y = patientBottom + 10;
  addFillableTextField("patient_city_province", leftX + 0, r5y, 190, 10, 7);
  addFillableTextField("patient_postal_code", leftX + 195, r5y, 80, 10, 7);
  addFillableTextField("patient_chart_id", leftX + 280, r5y, 110, 10, 7);
  addFillableTextField("patient_room_number", leftX + 395, r5y, 110, 10, 7);

  // Sex checkboxes on far right bottom like screenshot
  drawTextLabel("Sex:", rightX, r5y + 2, 7.6, true, { color: colorPalette.accentBlue });
  addFillableCheckBox("patient_sex_f", rightX + 28, r5y + 1, 9);
  drawTextLabel("F", rightX + 40, r5y + 2, 7.6, false, { color: colorPalette.accentBlue });
  addFillableCheckBox("patient_sex_m", rightX + 55, r5y + 1, 9);
  drawTextLabel("M", rightX + 67, r5y + 2, 7.6, false, { color: colorPalette.accentBlue });

  // =========================
  // MIDDLE SECTION (Ordering + Collection)
  // =========================
  drawRectangleBox(x0 + 1, middleBottom, usableW - 2, middleH, { fill: false });

  const midPad = 8;
  const midLeftW = usableW * 0.67;
  const midRightW = usableW - midLeftW - 2;

  const midLeftX = x0 + 1;
  const midRightX = x0 + 1 + midLeftW + 1;

  // Left big box
  drawRectangleBox(midLeftX, middleBottom, midLeftW, middleH, { fill: false });
  // Right box
  drawRectangleBox(midRightX, middleBottom, midRightW, middleH, { fill: false });

  // LEFT fields stacked
  let oy = middleTop - 14;
  const ox = midLeftX + midPad;

  const labelW = 165;
  const fieldW = midLeftW - midPad * 2 - labelW;

  const rowH = 18;
  const labFS = 8;

  const leftRow = (label, fieldName, extra = {}) => {
    drawTextLabel(label, ox, oy, labFS, false);
    addFillableTextField(fieldName, ox + labelW, oy - 4, fieldW, 12, 8, !!extra.multiline);
    oy -= rowH;
  };

  leftRow("Ordering physician address:", "ordering_physician_details");
  leftRow("Physician License number/ Practitioner number:", "ordering_practitioner_license");
  leftRow("Physician phone number:", "ordering_physician_phone");
  leftRow("Physician email address:", "ordering_physician_email");
  leftRow("Copy to:", "copy_to");
  leftRow("Locum for:", "locum_for");

  // Physician + MSC same line (like screenshot lower area)
  drawTextLabel("Physician:", ox, oy, labFS, false);
  addFillableTextField("ordering_physician_name", ox + 70, oy - 4, 220, 12, 8);
  drawTextLabel("MSC#:", ox + 300, oy, labFS, false);
  addFillableTextField("msc_number", ox + 340, oy - 4, 120, 12, 8);
  oy -= rowH;

  // Diagnosis line near bottom
  drawLine(midLeftX + 6, middleBottom + 44, midLeftX + midLeftW - 6, middleBottom + 44, 1);
  drawTextLabel(
    "Diagnosis and indications for guideline protocol and special tests",
    ox,
    middleBottom + 34,
    6.8,
    false,
    { maxWidth: midLeftW - 20 }
  );
  addFillableTextField("diagnosis_indications", ox, middleBottom + 18, midLeftW - midPad * 2, 14, 8);

  // RIGHT fields
  let cy = middleTop - 14;
  const cx = midRightX + midPad;

  const rLabelW = 120;
  const rFieldW = midRightW - midPad * 2 - rLabelW;

  const rightRow = (label, fieldName, opts = {}) => {
    drawTextLabel(label, cx, cy, 7.4, false);
    addFillableTextField(fieldName, cx + rLabelW, cy - 4, rFieldW, 12, 8, !!opts.multiline);
    cy -= 18;
  };

  rightRow("Date/Time of Collection:", "collection_datetime");

  // Pregnant Yes/No
  drawTextLabel("Pregnant:", cx, cy, 7.4, false);
  addFillableCheckBox("pregnant_yes", cx + 65, cy - 2, 9);
  drawTextLabel("Yes", cx + 78, cy, 7.2);
  addFillableCheckBox("pregnant_no", cx + 110, cy - 2, 9);
  drawTextLabel("No", cx + 123, cy, 7.2);
  cy -= 18;

  // Fasting hours
  drawTextLabel("Fasting Hours:", cx, cy, 7.4, false);
  addFillableCheckBox("fasting", cx + 80, cy - 2, 9);
  addFillableTextField("fasting_hours", cx + 95, cy - 4, 55, 12, 8);
  cy -= 18;

  rightRow("Phlebotomist:", "phlebotomist");

  // Medication line
  drawTextLabel("Date/Time/Name of Medication:", cx, cy, 6.8, false, { maxWidth: midRightW - 16 });
  addFillableTextField("medication_datetime_name", cx, cy - 18, midRightW - midPad * 2, 12, 7);
  cy -= 26;

  // Telephone requisition received by + initial/date
  drawTextLabel("Telephone Requisition Received By:", cx, cy, 6.6, false);
  addFillableTextField(
    "telephone_requisition_received_by",
    cx + 150,
    cy - 4,
    midRightW - midPad * 2 - 150,
    12,
    7
  );
  cy -= 16;

  drawTextLabel("INITIAL/DATE:", cx, cy, 6.6, false);
  addFillableTextField(
    "telephone_req_initial_date",
    cx + 75,
    cy - 4,
    midRightW - midPad * 2 - 75,
    12,
    7
  );
  cy -= 16;

  // Notes box (big, bottom-right)
  drawTextLabel("NOTES:", cx, middleBottom + 56, 8, true, { color: colorPalette.accentBlue });
  addFillableTextField("notes", cx, middleBottom + 10, midRightW - midPad * 2, 44, 8, true);

  // =========================
  // TESTS SECTION (use ALL remaining height)
  // =========================
  drawRectangleBox(x0 + 1, testsBottom, usableW - 2, testsTop - testsBottom, {
    fill: true,
    fillColor: colorPalette.lightFillBlue,
    opacity: 0.55,
  });
  drawRectangleBox(x0 + 1, testsBottom, usableW - 2, testsTop - testsBottom, { fill: false });

  // Signature row sits AT BOTTOM of the whole page (like screenshot)
  const sigH = 22;
  const sigY = testsBottom + 4;

  // Line separating signature row from tests grid
  drawLine(x0 + 2, sigY + sigH + 4, x3 - 2, sigY + sigH + 4, 1);

  drawTextLabel("Physician Signature / Typed Name:", x3 - 290, sigY + 12, 7, false);
  addFillableTextField("physician_typed_name", x3 - 170 - 120, sigY + 4, 170, 12, 8);

  drawTextLabel("Date", x3 - 105, sigY + 12, 7, false);
  addFillableTextField("physician_date", x3 - 70, sigY + 4, 66, 12, 8);

  // Tests grid area above signature row
  const gridBottom = sigY + sigH + 8;
  const gridTop = testsTop - 4;
  const gridH = gridTop - gridBottom;

  // 3 columns like screenshot
  const colGap = 4;
  const colW = (usableW - 2 - colGap * 2) / 3;

  const col1X = x0 + 1;
  const col2X = col1X + colW + colGap;
  const col3X = col2X + colW + colGap;

  drawRectangleBox(col1X, gridBottom, colW, gridH, { fill: false });
  drawRectangleBox(col2X, gridBottom, colW, gridH, { fill: false });
  drawRectangleBox(col3X, gridBottom, colW, gridH, { fill: false });

  const colPad = 5;
  const cbSize = 6;
  const lineH = 7.5;
  const fSmall = 5.2;

  // ---------- Column 1 ----------
  let yC1 = gridTop - 12;
  drawSectionHeaderBar("HEMATOLOGY", col1X, yC1, colW, 12, 6.4);
  yC1 -= 14;

  drawCheckRow({ name: "hemo_profile", label: "Hematology profile", x: col1X + colPad, y: yC1, boxSize: cbSize, fontSize: fSmall, maxWidth: colW - 18 });
  yC1 -= lineH;
  drawCheckRow({ name: "hemo_pt_inr", label: "PT-INR", x: col1X + colPad, y: yC1, boxSize: cbSize, fontSize: fSmall, maxWidth: colW - 18 });
  yC1 -= lineH;
  drawCheckRow({ name: "hemo_on_warfarin", label: "On Warfarin?", x: col1X + colPad, y: yC1, boxSize: cbSize, fontSize: fSmall, maxWidth: colW - 18 });
  yC1 -= lineH;
  drawCheckRow({ name: "hemo_ferritin_query_iron_def", label: "Ferritin (query iron deficiency)", x: col1X + colPad, y: yC1, boxSize: cbSize, fontSize: 5.0, maxWidth: colW - 18 });
  yC1 -= lineH + 1;

  drawTextLabel("HFE - Hemochromatosis (check ONE box only)", col1X + colPad, yC1 + 2, 4.9, true, { maxWidth: colW - 12 });
  yC1 -= lineH;

  drawCheckRow({ name: "hemo_hemochromatosis_confirm_dx", label: "Confirm diagnosis (DNA testing)", x: col1X + colPad, y: yC1, boxSize: cbSize, fontSize: 4.9, maxWidth: colW - 18 });
  yC1 -= lineH;
  drawCheckRow({ name: "hemo_sibling_parent_c282y_homo", label: "Sibling/parent is C282Y/C282Y homozygote (DNA testing)", x: col1X + colPad, y: yC1, boxSize: cbSize, fontSize: 4.7, maxWidth: colW - 18 });
  yC1 -= lineH + 1;

  drawTextLabel("List current antibiotics:", col1X + colPad, yC1 + 2, 4.9, true);
  yC1 -= lineH;
  addFillableTextField("hemo_current_antibiotics", col1X + colPad, yC1 - 2, colW - colPad * 2, 12, 6);
  yC1 -= 14;

  drawSectionHeaderBar("CHEMISTRY", col1X, yC1, colW, 12, 6.2);
  yC1 -= 14;

  drawCheckRow({ name: "chem_glucose_fasting", label: "Glucose - fasting", x: col1X + colPad, y: yC1, boxSize: cbSize, fontSize: 5.0, maxWidth: colW - 18 });
  yC1 -= lineH;
  drawCheckRow({ name: "chem_gtt_50g_1h", label: "GTT - gestational diabetes screen (50g, 1 hour)", x: col1X + colPad, y: yC1, boxSize: cbSize, fontSize: 4.7, maxWidth: colW - 18 });
  yC1 -= lineH;
  drawCheckRow({ name: "chem_hba1c", label: "Hemoglobin A1c", x: col1X + colPad, y: yC1, boxSize: cbSize, fontSize: 5.0, maxWidth: colW - 18 });
  yC1 -= lineH;
  drawCheckRow({ name: "chem_acr_urine", label: "Albumin/creatinine ratio (ACR) - Urine", x: col1X + colPad, y: yC1, boxSize: cbSize, fontSize: 4.7, maxWidth: colW - 18 });
  yC1 -= lineH + 1;

  drawSectionHeaderBar("LIPIDS", col1X, yC1, colW, 12, 6.2);
  yC1 -= 14;
  drawCheckRow({ name: "lipids_baseline_cv_risk", label: "Baseline CV risk (Lipid profile, fasting)", x: col1X + colPad, y: yC1, boxSize: cbSize, fontSize: 4.7, maxWidth: colW - 18 });
  yC1 -= lineH;
  drawCheckRow({ name: "lipids_followup_total_hdl_nonhdl", label: "Follow-up treated hypercholesterolemia (Total/HDL/non-HDL)", x: col1X + colPad, y: yC1, boxSize: cbSize, fontSize: 4.6, maxWidth: colW - 18 });
  yC1 -= lineH;

  // ---------- Column 2 ----------
  let yC2 = gridTop - 12;
  drawSectionHeaderBar("MICROBIOLOGY", col2X, yC2, colW, 12, 6.4);
  yC2 -= 14;

  drawSectionHeaderBar("ROUTINE CULTURE", col2X, yC2, colW, 12, 6.0);
  yC2 -= 14;

  drawTextLabel("Site:", col2X + colPad, yC2 + 2, 5.2, true);
  yC2 -= lineH;

  const routineCultureItems = [
    ["culture_throat", "Throat"],
    ["culture_sputum", "Sputum"],
    ["culture_blood", "Blood"],
    ["culture_wound_superficial", "Superficial Wound"],
    ["culture_wound_deep", "Deep Wound"],
    ["culture_urine", "Urine"],
  ];

  routineCultureItems.forEach(([name, label]) => {
    if (yC2 < gridBottom + 22) return;
    drawCheckRow({ name, label, x: col2X + colPad, y: yC2, boxSize: cbSize, fontSize: 5.1, maxWidth: colW - 18 });
    yC2 -= lineH;

    if (label.includes("Wound")) {
      if (yC2 < gridBottom + 22) return;
      drawTextLabel("Site:", col2X + colPad + 16, yC2 + 2, 5.0, false);
      addFillableTextField(`${name}_site`, col2X + colPad + 40, yC2 - 2, colW - colPad * 2 - 40, 12, 6);
      yC2 -= 14;
    }
  });

  yC2 -= 2;
  drawSectionHeaderBar("VAGINITIS", col2X, yC2, colW, 12, 6.0);
  yC2 -= 14;
  drawCheckRow({ name: "vaginitis_initial", label: "Initial (smear for BV & yeast only)", x: col2X + colPad, y: yC2, boxSize: cbSize, fontSize: 4.9, maxWidth: colW - 18 });
  yC2 -= lineH;
  drawCheckRow({ name: "vaginitis_chronic_recurrent", label: "Chronic/recurrent (smear, culture, trichomonas)", x: col2X + colPad, y: yC2, boxSize: cbSize, fontSize: 4.9, maxWidth: colW - 18 });
  yC2 -= lineH;

  // ---------- Column 3 ----------
  let yC3 = gridTop - 12;
  drawSectionHeaderBar("URINE TESTS", col3X, yC3, colW, 12, 6.4);
  yC3 -= 14;

  drawTextLabel("Macroscopic -> microscopic if dipstick positive", col3X + colPad, yC3 + 2, 4.6, false, { maxWidth: colW - 12 });
  yC3 -= lineH;
  drawTextLabel("Macroscopic -> urine culture if pyuria or nitrite present", col3X + colPad, yC3 + 2, 4.6, false, { maxWidth: colW - 12 });
  yC3 -= lineH;

  drawCheckRow({ name: "urine_macroscopic_dipstick", label: "Macroscopic (dipstick)", x: col3X + colPad, y: yC3, boxSize: cbSize, fontSize: 5.0, maxWidth: colW - 18 });
  yC3 -= lineH;
  drawCheckRow({ name: "urine_microscopic", label: "Microscopic", x: col3X + colPad, y: yC3, boxSize: cbSize, fontSize: 5.0, maxWidth: colW - 18 });
  yC3 -= lineH;

  yC3 -= 2;
  drawSectionHeaderBar("HEPATITIS SEROLOGY", col3X, yC3, colW, 12, 5.8);
  yC3 -= 14;
  drawCheckRow({ name: "hep_acute_hav_igm", label: "Hepatitis A (anti-HAV IgM)", x: col3X + colPad, y: yC3, boxSize: cbSize, fontSize: 4.8, maxWidth: colW - 18 });
  yC3 -= lineH;
  drawCheckRow({ name: "hep_acute_anti_hcv", label: "Hepatitis C (anti-HCV)", x: col3X + colPad, y: yC3, boxSize: cbSize, fontSize: 4.8, maxWidth: colW - 18 });
  yC3 -= lineH;

  yC3 -= 2;
  drawSectionHeaderBar("HIV SEROLOGY", col3X, yC3, colW, 12, 6.2);
  yC3 -= 14;
  drawCheckRow({ name: "hiv_serology", label: "HIV Serology", x: col3X + colPad, y: yC3, boxSize: cbSize, fontSize: 5.0, maxWidth: colW - 18 });

  // =========================
  // Finalize (TEMPLATE: do not flatten)
  // =========================
  const pdfBytes = await pdfDocument.save();
  console.log("[labReqTemplate] ✅ template PDF bytes created (ONE PAGE, full-page layout)");
  return Buffer.from(pdfBytes);
}
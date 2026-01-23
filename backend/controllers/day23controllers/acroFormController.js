// backend/controllers/day23controllers/acroFormController.js
import fs from "fs";
import path from "path";
import { PDFDocument } from "pdf-lib";

// @desc    Get AcroForm fields from PDF
// @route   GET /web/api/day23/acroform/fields
// @access  Private
export const getAcroFormFields = async (req, res) => {
  try {
    console.log("➡️ [Day23] GET /acroform/fields");

    // ✅ Correct path based on your folder screenshot
    const pdfPath = path.join(
      process.cwd(),
      "pdfgenerator",
      "day21",
      "templates",
      "labs_temp.pdf"
    );

    console.log("✅ [Day23] pdfPath:", pdfPath);

    if (!fs.existsSync(pdfPath)) {
      console.log("❌ [Day23] PDF not found at:", pdfPath);
      return res.status(404).json({ message: "PDF template not found." });
    }

    const pdfBytes = fs.readFileSync(pdfPath);
    const pdfDoc = await PDFDocument.load(pdfBytes);

    const form = pdfDoc.getForm(); // pdf-lib returns a form object even if empty
    const rawFields = form.getFields();

    console.log("✅ [Day23] field count:", rawFields.length);

    const fields = rawFields.map((field) => {
      const name = field.getName();
      const type = field.constructor.name;

      let value = null;
      let options = [];

      try {
        if (type === "PDFTextField") {
          value = form.getTextField(name).getText() || "";
        }

        if (type === "PDFCheckBox") {
          value = form.getCheckBox(name).isChecked();
        }

        if (type === "PDFDropdown") {
          const dd = form.getDropdown(name);
          options = dd.getOptions ? dd.getOptions() : [];
          value = dd.getSelected ? dd.getSelected() : null;
        }

        if (type === "PDFOptionList") {
          const ol = form.getOptionList(name);
          options = ol.getOptions ? ol.getOptions() : [];
          value = ol.getSelected ? ol.getSelected() : null;
        }

        if (type === "PDFRadioGroup") {
          const rg = form.getRadioGroup(name);
          options = rg.getOptions ? rg.getOptions() : [];
          value = rg.getSelected ? rg.getSelected() : null;
        }

        // Buttons/signature fields might exist too; keep them visible
      } catch (e) {
        console.log("⚠️ [Day23] could not extract value for:", name, type, e?.message || e);
      }

      return { name, type, value, options };
    });

    return res.status(200).json({ fields });
  } catch (error) {
    console.log("❌ [Day23] Error getting AcroForm fields:", error?.message || error);
    return res.status(500).json({ message: "Server error while retrieving AcroForm fields." });
  }
};

// ------------------------------------------------

export const getAcroFormTemplatePdf = async (req, res) => {
  try {
    console.log("➡️ [Day23] GET /acroform/template");

    const pdfPath = path.join(
      process.cwd(),
      "pdfgenerator",
      "day21",
      "templates",
      "labs_temp.pdf"
    );

    console.log("✅ [Day23] template pdfPath:", pdfPath);

    const pdfBytes = fs.readFileSync(pdfPath);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "inline; filename=labs_temp.pdf");
    return res.status(200).send(pdfBytes);
  } catch (err) {
    console.log("❌ [Day23] template error:", err?.message || err);
    return res.status(500).json({ message: "Failed to load template PDF" });
  }
};
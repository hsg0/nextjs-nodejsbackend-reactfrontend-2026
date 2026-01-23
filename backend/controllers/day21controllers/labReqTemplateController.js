import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const templatePath = path.join(
  __dirname,
  "../../pdfgenerator/day21/templates/labs_temp.pdf"
);

export const getLabReqTemplate = async (req, res) => {
  try {
    console.log("[labReqTemplateController] getLabReqTemplate hit");
    console.log("[labReqTemplateController] templatePath:", templatePath);

    if (!fs.existsSync(templatePath)) {
      console.log("[labReqTemplateController] ❌ Template not found");
      return res.status(404).json({ message: "labs_temp.pdf not found" });
    }

    const bytes = fs.readFileSync(templatePath);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "inline; filename=labs_temp.pdf");
    return res.status(200).send(bytes);
  } catch (err) {
    console.log("[labReqTemplateController] ❌ error:", err?.message || err);
    return res.status(500).json({ message: "Failed to load template" });
  }
};
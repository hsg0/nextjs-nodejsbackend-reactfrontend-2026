// backend/controllers/day21controllers/labReqDocumentController.js
import { createLabReqPdfFromTemplate } from "../../pdfgenerator/day21/templates/labReqFromTemplate.js";

export const createLabReqDocument = async (req, res) => {
  try {
    console.log("[labReqDocumentController] createLabReqDocument hit");
    console.log("[labReqDocumentController] user:", req.user?._id || req.user?.id);
    console.log("[labReqDocumentController] body keys:", Object.keys(req.body || {}));

    const pdfBuffer = await createLabReqPdfFromTemplate(req.body, { debugBoxes: false });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "inline; filename=labreq.pdf");
    return res.status(200).send(pdfBuffer);
  } catch (err) {
    console.log("[labReqDocumentController] ❌ error:", err?.message || err);
    return res.status(500).json({ message: "Failed to generate lab requisition PDF" });
  }
};

export const createLabReqDocumentDebug = async (req, res) => {
  try {
    console.log("[labReqDocumentController] createLabReqDocumentDebug hit");
    console.log("[labReqDocumentController] user:", req.user?._id || req.user?.id);
    console.log("[labReqDocumentController] body keys:", Object.keys(req.body || {}));

    const pdfBuffer = await createLabReqPdfFromTemplate(req.body, { debugBoxes: true });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "inline; filename=labreq_debug.pdf");
    return res.status(200).send(pdfBuffer);
  } catch (err) {
    console.log("[labReqDocumentController] ❌ debug error:", err?.message || err);
    return res.status(500).json({ message: "Failed to generate debug lab requisition PDF" });
  }
};
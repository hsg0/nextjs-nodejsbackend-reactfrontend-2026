import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import ImageKit from "imagekit";
import dotenv from "dotenv";
import { uploadMemory, runMulter } from "../../config/multer.js";

dotenv.config();

/**
 * Helper: resolve backend/testpdf/Fillable Form Draft (1).pdf
 */
function getPdfPath() {
  // When you run: node server.js
  // your cwd is usually: .../backend
  // so this becomes: .../backend/backend/testpdf/Fillable.pdf
  const pdfPath = path.join(process.cwd(), "backend", "testpdf", "Fillable.pdf");

  console.log("[day27Controller] resolved pdfPath:", pdfPath);
  return pdfPath;
}

/**
 * GET /web/api/day27/get-pdf-data
 * Sends raw PDF bytes to frontend
 */
export const getDay27DataPDF = async (req, res) => {
  try {
    console.log("[getDay27DataPDF] start");

    const pdfPath = getPdfPath();

    if (!fs.existsSync(pdfPath)) {
      console.log("[getDay27DataPDF] ❌ PDF not found:", pdfPath);
      return res.status(404).json({ message: "PDF not found" });
    }

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", 'inline; filename="Fillable-Form-Draft.pdf"');

    const stream = fs.createReadStream(pdfPath);
    stream.on("error", (err) => {
      console.log("[getDay27DataPDF] ❌ stream error:", err?.message || err);
      return res.status(500).json({ message: "Failed to read PDF" });
    });

    console.log("[getDay27DataPDF] ✅ streaming PDF...");
    stream.pipe(res);
  } catch (error) {
    console.log("[getDay27DataPDF] ❌ error:", error?.message || error);
    res.status(500).json({ message: "Server error fetching PDF data" });
  }
};

/**
 * POST /web/api/day27/upload-pdf-imagekit
 * Frontend sends filled PDF as base64, backend uploads to ImageKit
 */
export const uploadPDFFiletoImageKit = async (req, res) => {
  try {
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("[uploadPDFFiletoImageKit] start");

    // ✅ Parse multipart/form-data INSIDE controller
    await runMulter(uploadMemory.single("pdf"))(req, res);

    console.log("[uploadPDFFiletoImageKit] multer done");
    console.log("[uploadPDFFiletoImageKit] req.file present:", !!req.file);
    console.log("[uploadPDFFiletoImageKit] req.body keys:", Object.keys(req.body || {}));

    if (!req.file?.buffer) {
      console.log("[uploadPDFFiletoImageKit] ❌ Missing pdf file buffer");
      return res.status(400).json({ message: "Missing PDF file (field name must be 'pdf')" });
    }

    console.log("[uploadPDFFiletoImageKit] file meta:", {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
    });

    // Optional fields
    let fieldValues = {};
    try {
      fieldValues = req.body?.fieldValues ? JSON.parse(req.body.fieldValues) : {};
    } catch (e) {
      console.log("[uploadPDFFiletoImageKit] ❌ fieldValues parse failed:", e?.message || e);
    }

    const imageKit = new ImageKit({
      publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
      privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
      urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
    });

    const uploadResponse = await imageKit.upload({
      file: req.file.buffer, // ✅ buffer upload
      fileName: req.file.originalname || `day27_${Date.now()}.pdf`,
      folder: "/day27-pdfs/",
    });

    console.log("[uploadPDFFiletoImageKit] ✅ uploaded:", uploadResponse?.fileId);

    return res.status(200).json({
      fileId: uploadResponse.fileId,
      url: uploadResponse.url,
      name: uploadResponse.name,
    });
  } catch (err) {
    console.log("[uploadPDFFiletoImageKit] ❌ error:", err?.message || err);

    // ✅ Common multer errors
    if (err?.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({ message: "PDF too large (fileSize limit hit)" });
    }

    return res.status(500).json({ message: "Upload failed" });
  }
};
/**
 * GET /web/api/day27/get-pdf-imagekit?fileId=xxx
 */
export const getPDFFilefromImageKit = async (req, res) => {
  try {
    console.log("[getPDFFilefromImageKit] start");

    const { fileId } = req.query;
    console.log("[getPDFFilefromImageKit] fileId:", fileId);

    if (!fileId) {
      console.log("[getPDFFilefromImageKit] ❌ missing fileId");
      return res.status(400).json({ message: "fileId is required" });
    }

    const imageKit = new ImageKit({
      publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
      privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
      urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
    });

    const fileResponse = await imageKit.getFileDetails(fileId);

    console.log("[getPDFFilefromImageKit] ✅ got details url:", fileResponse?.url);

    res.status(200).json({ url: fileResponse.url });
  } catch (error) {
    console.log("[getPDFFilefromImageKit] ❌ error:", error?.message || error);
    res.status(500).json({ message: "Server error fetching PDF from ImageKit" });
  }
};

// ✅ For now we do NOT need saveDay27DataPDF on backend if filling is on frontend.
// If you still want it later, we’ll add it properly.
export const saveDay27DataPDF = async (req, res) => {
  console.log("[saveDay27DataPDF] not used — frontend will fill PDF with pdf-lib");
  return res.status(501).json({ message: "Not implemented. Fill PDF on frontend." });
};
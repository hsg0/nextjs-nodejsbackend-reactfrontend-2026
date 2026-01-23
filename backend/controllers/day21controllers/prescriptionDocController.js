import crypto from "crypto";
import PrescriptionDoc from "../../models/day21models/PrescriptionDoc.js";

// 90 days in ms
const NINETY_DAYS_MS = 90 * 24 * 60 * 60 * 1000;

function makeMockSignedUrl({ docId }) {
  const token = crypto.randomBytes(16).toString("hex");
  return `https://mock-signed-url.local/prescription/${docId}?token=${token}`;
}

export const createPrescriptionDoc = async (req, res) => {
  try {
    console.log("➡️ [Day21] createPrescriptionDoc hit");
    console.log("➡️ [Day21] req.user:", req.user);

    const { documentPayload } = req.body;

    if (!documentPayload) {
      console.log("❌ [Day21] Missing documentPayload");
      return res.status(400).json({ message: "Missing documentPayload" });
    }

    // Your protect middleware should attach something like req.user
    // We will safely read webUserId from multiple common shapes.
    const ownerWebUserId =
      req.user?.webUserId ||
      req.user?._id ||
      req.user?.id ||
      documentPayload?.doctor?.webUserId ||
      "";

    const patientEmail = (documentPayload?.patient?.email || "").toLowerCase().trim();

    console.log("✅ [Day21] ownerWebUserId:", ownerWebUserId);
    console.log("✅ [Day21] patientEmail:", patientEmail);

    if (!ownerWebUserId || !patientEmail) {
      return res.status(400).json({
        message: "Missing required fields",
        required: ["patientEmail", "ownerWebUserId (from auth/protect)"],
      });
    }

    const expiresAt = new Date(Date.now() + NINETY_DAYS_MS);

    // Create DB record
    const doc = await PrescriptionDoc.create({
      ownerWebUserId,
      patientEmail,
      expiresAt,
    });

    console.log("✅ [Day21] created docId:", doc?._id?.toString());

    // MVP mock signed URL — replace with ImageKit signed URL later
    const signedUrl = makeMockSignedUrl({ docId: doc._id.toString() });

    doc.signedUrl = signedUrl;
    await doc.save();

    console.log("✅ [Day21] saved signedUrl:", signedUrl);
    console.log("✅ [Day21] expiresAt:", expiresAt.toISOString());

    // Later: send email via SMTP/Brevo
    console.log("📧 [Day21 MVP] would email patient:", patientEmail);
    console.log("📧 [Day21 MVP] link:", signedUrl);

    return res.status(201).json({
      message: "Prescription created (MVP mock signed URL).",
      docId: doc._id.toString(),
      signedUrl,
      expiresAt: expiresAt.toISOString(),
    });
  } catch (err) {
    console.log("❌ [Day21] createPrescriptionDoc error:", err?.message || err);
    return res.status(500).json({
      message: "Server error",
      error: err?.message || String(err),
    });
  }
};
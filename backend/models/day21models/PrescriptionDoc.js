import mongoose from "mongoose";

// Separate DB (matches your other web models)
const webDb = mongoose.connection.useDb("webSiteDatabase");

const prescriptionDocSchema = new mongoose.Schema(
  {
    docType: { type: String, default: "PRESCRIPTION" },

    // Link record to the logged-in web user (doctor)
    ownerWebUserId: { type: String, required: true, index: true },

    // Patient email to send signed URL
    patientEmail: { type: String, required: true, trim: true, lowercase: true, index: true },

    // ImageKit fields (later)
    imagekitFileId: { type: String, default: "" },
    imagekitFilePath: { type: String, default: "" },

    // Signed URL returned to patient
    signedUrl: { type: String, default: "" },

    // TTL expiry
    expiresAt: { type: Date, required: true, index: true },
  },
  { timestamps: true }
);

// ✅ TTL index: Mongo will delete the document when expiresAt passes
prescriptionDocSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Prevent model overwrite in dev hot-reload
const PrescriptionDoc =
  webDb.models.PrescriptionDoc ||
  webDb.model("PrescriptionDoc", prescriptionDocSchema, "day21_prescription_docs");

export default PrescriptionDoc;
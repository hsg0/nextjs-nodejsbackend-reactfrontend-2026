// backend/models/day27models/day27PDFModel.js
import mongoose from "mongoose";

// Separate DB (matches other web models)
const webDb = mongoose.connection.useDb("webSiteDatabase");

const day27PdfSessionSchema = new mongoose.Schema(
  {
    webUserId: {
      type: String,
      required: true,
      index: true,
    },

    // optional: lets you resume a specific session
    sessionId: {
      type: String,
      default: "",
      index: true,
    },

    templateName: {
      type: String,
      default: "Fillable Form Draft (1)",
    },

    templatePath: {
      type: String,
      default: "backend/backend/testpdf/Fillable.pdf",
    },

    // draft -> filled -> uploaded -> sent -> error
    status: {
      type: String,
      enum: ["draft", "filled", "uploaded", "sent", "error"],
      default: "draft",
      index: true,
    },

    // store any field types: text, checkbox booleans, radios, etc.
    fieldValues: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    // final PDF info (ImageKit)
    pdfFile: {
      fileId: { type: String, default: "" },
      url: { type: String, default: "" },
      name: { type: String, default: "" },
      size: { type: Number, default: 0 },
      fileType: { type: String, default: "pdf" },
      mime: { type: String, default: "application/pdf" },

      signedUrl: { type: String, default: "" },
      expiresAt: { type: Date, default: null },
    },

    lastError: {
      type: String,
      default: "",
    },

    filledAt: { type: Date, default: null },
    uploadedAt: { type: Date, default: null },
    sentAt: { type: Date, default: null },
  },
  { timestamps: true },
);

// Prevent model overwrite in dev hot-reload
const Day27PDFModel =
  webDb.models.Day27PDF || webDb.model("Day27PDF", day27PdfSessionSchema, "day27_pdf_sessions");

export default Day27PDFModel;
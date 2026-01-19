// backend/models/day18models/day18Model.js
import mongoose from "mongoose";

// Separate DB (matches other web models)
const webDb = mongoose.connection.useDb("webSiteDatabase");

const day18Schema = new mongoose.Schema(
  {
    webUserId: {
      type: String,
      required: true,
      index: true,
    },
    adprepare: {
      type: String,
      required: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      index: true,
    },
    directions: {
      type: String,
      required: true,
    },
    actorWords: {
      type: String,
      required: true,
    },

    // ✅ status timeline:
    // uploaded → planned → processing → rendering → final → ready → discarded
    status: {
      type: String,
      default: "uploaded",
      index: true,
    },

    // ✅ pipeline outputs (Phase 1 planner)
    generatedScript: { type: String, default: "" },

    // keep it flexible for learning (objects inside array)
    shotList: { type: [mongoose.Schema.Types.Mixed], default: [] },

    // captions/subtitles
    captions: { type: [String], default: [] },

    // overlays: headline/cta/styleNotes/etc
    overlays: { type: mongoose.Schema.Types.Mixed, default: {} },

    // error storage (if pipeline fails)
    errorMessage: { type: String, default: "" },

    // optional timestamps for debugging
    processingStartedAt: { type: Date, default: null },
    readyAt: { type: Date, default: null },

    productImage: {
      fileId: { type: String, required: true },
      url: { type: String, required: true },
      name: { type: String, required: true },
      size: { type: Number, required: true },
      fileType: { type: String, required: true },
      mime: { type: String, required: true },
    },
    actorImage: {
      fileId: { type: String, required: true },
      url: { type: String, required: true },
      name: { type: String, required: true },
      size: { type: Number, required: true },
      fileType: { type: String, required: true },
      mime: { type: String, required: true },
    },

    adcreation: { type: String, default: "", index: true },
    publicShareId: { type: String, default: "", index: true },

    adVideo: {
      fileId: { type: String, default: "" },
      url: { type: String, default: "" },
      name: { type: String, default: "" },
      size: { type: Number, default: 0 },
      fileType: { type: String, default: "video" },
      mime: { type: String, default: "" },
    },

    discardedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// Prevent model overwrite in dev hot-reload
const Day18Model =
  webDb.models.Day18 || webDb.model("Day18", day18Schema, "day18data");

export default Day18Model;
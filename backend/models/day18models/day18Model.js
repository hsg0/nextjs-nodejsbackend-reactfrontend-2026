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
    status: {
      type: String,
      default: "uploaded",
      index: true,
    },
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
  },
  { timestamps: true }
);

// Prevent model overwrite in dev hot-reload
const Day18Model =
  webDb.models.Day18 || webDb.model("Day18", day18Schema, "day18data");

export default Day18Model;

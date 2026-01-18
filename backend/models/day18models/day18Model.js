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
    data: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

// Prevent model overwrite in dev hot-reload
const Day18Model =
  webDb.models.Day18 || webDb.model("Day18", day18Schema, "day18data");

export default Day18Model;

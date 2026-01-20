import mongoose from "mongoose";

// Separate DB (matches your other web models)
const webDb = mongoose.connection.useDb("webSiteDatabase");

const day20Schema = new mongoose.Schema(
  {
    // ✅ link record to the logged-in web user
    webUserId: { type: String, required: true, index: true },

    firstName: { type: String, required: true, trim: true, index: true },
    lastName: { type: String, required: true, trim: true, index: true },

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },

    phoneNumber: { type: String, required: true, trim: true, index: true },

    address: {
      line1: { type: String, required: true, trim: true },
      line2: { type: String, default: "", trim: true },
      city: { type: String, required: true, trim: true, index: true },
      province: { type: String, required: true, trim: true, index: true },
      country: { type: String, default: "Canada", trim: true },
    },

    zipCode: { type: String, required: true, trim: true, index: true },

    payment: {
      method: {
        type: String,
        enum: ["card", "cash", "etransfer", "other"],
        default: "card",
      },
      last4: { type: String, default: "", trim: true },
    },
  },
  { timestamps: true }
);

// Prevent model overwrite in dev hot-reload
const Day20Model =
  webDb.models.Day20 || webDb.model("Day20", day20Schema, "day20data");

export default Day20Model;
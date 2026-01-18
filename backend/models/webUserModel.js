// nextjs-reactjs-practice-2026/backend/models/webUserModel.js
import mongoose from "mongoose";
import { nanoid } from "nanoid";

// Separate DB (works as long as mongoose.connect() is called first)
const webDb = mongoose.connection.useDb("webSiteDatabase");

const webUserSchema = new mongoose.Schema(
  {
    userNanoId: {
      type: String,
      default: () => nanoid(10),
      unique: true,
      index: true,
    },

    username: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },

    //  don’t return password by default
    password: {
      type: String,
      required: true,
    //   select: false,
    //   minlength: 6,
    },

    verifyAccount: {
      type: Boolean,
      default: false,
    },

    verifyOTP: {
      type: String,
      default: null,
    },
    verifyOTPExpiry: {
      type: Date,
      default: null,
    },

    resetPasswordOTP: {
      type: String,
      default: null,
    },
    resetPasswordOTPExpiry: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Prevent model overwrite in dev hot-reload
const WebUserModel =
  webDb.models.WebUser || webDb.model("WebUser", webUserSchema, "webusermodel");

export default WebUserModel;
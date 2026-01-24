// backend/models/day24models/bookstoremodel.js
import mongoose from "mongoose";

const webDb = mongoose.connection.useDb("webSiteDatabase");

const bookStoreSchema = new mongoose.Schema(
  {
    shelf: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BookShelf",
      required: true,
      index: true,
    },

    title: { type: String, required: true, trim: true },
    author: { type: String, required: true, trim: true },

    isbn: { type: String, default: "", trim: true, index: true }, // keep optional

    description: { type: String, default: "" },
    pages: { type: Number, default: 0 },

    tags: { type: [String], default: [] },

    available: { type: Boolean, default: true, index: true },

    // URLs used by your UI buttons
    downloadUrl: { type: String, default: "" },
    readUrl: { type: String, default: "" },

    bookCoverImageUrl: { type: String, default: "" },

    // checkout tracking
    checkedOutBy: { type: mongoose.Schema.Types.ObjectId, ref: "WebUser", default: null },
    checkedOutAt: { type: Date, default: null },
  },
  { timestamps: true }
);

const BookStoreModel =
  webDb.models.BookStore || webDb.model("BookStore", bookStoreSchema, "day24_books");

export default BookStoreModel;
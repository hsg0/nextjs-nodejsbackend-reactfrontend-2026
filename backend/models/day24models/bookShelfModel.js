// backend/models/day24models/bookShelfModel.js
import mongoose from "mongoose";

// Separate DB (matches your web models)
const webDb = mongoose.connection.useDb("webSiteDatabase");

const bookShelfSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },            // "Sci-Fi"
    shelfKey: { type: String, required: true, trim: true, lowercase: true, unique: true }, // "sci-fi"
    icon: { type: String, default: "📚" },                          // "🛸"
    description: { type: String, default: "" },
    tags: { type: [String], default: [] },

    active: { type: Boolean, default: true, index: true },

    // OPTIONAL: only if you want to keep a list on the shelf doc
    books: [{ type: mongoose.Schema.Types.ObjectId, ref: "BookStore" }],
  },
  { timestamps: true }
);

const BookShelfModel =
  webDb.models.BookShelf || webDb.model("BookShelf", bookShelfSchema, "day24_shelves");

export default BookShelfModel;
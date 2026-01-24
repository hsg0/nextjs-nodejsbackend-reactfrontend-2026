// backend/controllers/day24controllers/day24Controller.js
import bookShelfModel from "../../models/day24models/bookShelfModel.js";
import bookStoreModel from "../../models/day24models/bookstoremodel.js";

/**
 * ✅ Create a shelf (category)
 * POST /web/api/day24/shelves
 * body: { title, shelfKey, icon, description, tags }
 */
export const createShelfController = async (req, res) => {
  try {
    console.log("➡️ [Day24] createShelfController body:", req.body);

    const { title, shelfKey, icon, description, tags } = req.body;

    if (!title || !shelfKey) {
      console.log("❌ [Day24] missing title/shelfKey");
      return res.status(400).json({ message: "title and shelfKey are required" });
    }

    const exists = await bookShelfModel.findOne({ shelfKey: String(shelfKey).toLowerCase() });
    console.log("✅ [Day24] shelf exists?:", !!exists);

    if (exists) {
      return res.status(409).json({ message: "Shelf already exists", shelf: exists });
    }

    const shelf = await bookShelfModel.create({
      title,
      shelfKey: String(shelfKey).toLowerCase(),
      icon: icon || "📚",
      description: description || "",
      tags: Array.isArray(tags) ? tags : [],
      active: true,
    });

    console.log("✅ [Day24] shelf created:", shelf?._id);
    return res.status(201).json({ message: "Shelf created", shelf });
  } catch (error) {
    console.log("❌ [Day24] createShelf error:", error?.message || error);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * ✅ List all shelves (library shelves page)
 * GET /web/api/day24/shelves
 */
export const listAllShelvesController = async (req, res) => {
  try {
    console.log("➡️ [Day24] listAllShelvesController");

    const shelves = await bookShelfModel
      .find({ active: true })
      .sort({ title: 1 })
      .lean();

    // attach counts (UI wants shelf counts)
    const shelfIds = shelves.map((s) => s._id);
    const counts = await bookStoreModel.aggregate([
      { $match: { shelf: { $in: shelfIds } } },
      { $group: { _id: "$shelf", count: { $sum: 1 } } },
    ]);

    const countMap = {};
    counts.forEach((c) => {
      countMap[String(c._id)] = c.count;
    });

    const shelvesWithCounts = shelves.map((s) => ({
      ...s,
      bookCount: countMap[String(s._id)] || 0,
    }));

    console.log("✅ [Day24] shelves:", shelvesWithCounts.length);
    return res.status(200).json({ shelves: shelvesWithCounts });
  } catch (error) {
    console.log("❌ [Day24] listAllShelves error:", error?.message || error);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * ✅ Get one shelf (focus shelf header details)
 * GET /web/api/day24/shelves/:shelfId
 */
export const getShelfController = async (req, res) => {
  try {
    const { shelfId } = req.params;
    console.log("➡️ [Day24] getShelfController shelfId:", shelfId);

    const shelf = await bookShelfModel.findById(shelfId);
    if (!shelf) {
      console.log("❌ [Day24] shelf not found");
      return res.status(404).json({ message: "Shelf not found" });
    }

    return res.status(200).json({ shelf });
  } catch (error) {
    console.log("❌ [Day24] getShelf error:", error?.message || error);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * ✅ Add a new book to a shelf
 * POST /web/api/day24/books
 * body: { shelfId, title, author, isbn, description, pages, tags, downloadUrl, readUrl, bookCoverImageUrl }
 */
export const addBookController = async (req, res) => {
  try {
    console.log("➡️ [Day24] addBookController body:", req.body);

    const {
      shelfId,
      title,
      author,
      isbn,
      description,
      pages,
      tags,
      downloadUrl,
      readUrl,
      bookCoverImageUrl,
    } = req.body;

    if (!shelfId || !title || !author) {
      console.log("❌ [Day24] missing shelfId/title/author");
      return res.status(400).json({ message: "shelfId, title, author are required" });
    }

    const shelf = await bookShelfModel.findById(shelfId);
    console.log("✅ [Day24] shelf found:", !!shelf);

    if (!shelf) {
      return res.status(404).json({ message: "Shelf not found" });
    }

    const newBook = await bookStoreModel.create({
      shelf: shelfId,
      title,
      author,
      isbn: isbn || "",
      description: description || "",
      pages: Number(pages || 0),
      tags: Array.isArray(tags) ? tags : [],
      available: true,
      downloadUrl: downloadUrl || "",
      readUrl: readUrl || "",
      bookCoverImageUrl: bookCoverImageUrl || "",
    });

    console.log("✅ [Day24] book created:", newBook?._id);

    // optional: push into shelf.books (if your shelf schema has books array)
    if (Array.isArray(shelf.books)) {
      shelf.books.push(newBook._id);
      await shelf.save();
      console.log("✅ [Day24] pushed book into shelf.books");
    }

    return res.status(201).json({ message: "Book added successfully", book: newBook });
  } catch (error) {
    console.log("❌ [Day24] addBook error:", error?.message || error);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * ✅ List ALL books in the entire library
 * GET /web/api/day24/books
 */
export const listAllBooksController = async (req, res) => {
  try {
    console.log("➡️ [Day24] listAllBooksController");

    const books = await bookStoreModel
      .find({})
      .sort({ createdAt: -1 })
      .populate("shelf", "title shelfKey icon");

    console.log("✅ [Day24] books count:", books.length);
    return res.status(200).json({ books });
  } catch (error) {
    console.log("❌ [Day24] listAllBooks error:", error?.message || error);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * ✅ List books in a specific shelf (what your bookshelf UI needs)
 * GET /web/api/day24/shelves/:shelfId/books
 */
export const listBooksInShelfController = async (req, res) => {
  try {
    const { shelfId } = req.params;
    console.log("➡️ [Day24] listBooksInShelfController shelfId:", shelfId);

    const shelf = await bookShelfModel.findById(shelfId);
    if (!shelf) {
      console.log("❌ [Day24] shelf not found");
      return res.status(404).json({ message: "Shelf not found" });
    }

    const books = await bookStoreModel
      .find({ shelf: shelfId })
      .sort({ createdAt: -1 });

    console.log("✅ [Day24] shelf:", shelf.title, "books:", books.length);

    return res.status(200).json({
      shelf: {
        _id: shelf._id,
        title: shelf.title,
        shelfKey: shelf.shelfKey,
        icon: shelf.icon,
        description: shelf.description,
        tags: shelf.tags,
      },
      books,
    });
  } catch (error) {
    console.log("❌ [Day24] listBooksInShelf error:", error?.message || error);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * ✅ Search books (either whole library OR within a shelf)
 * POST /web/api/day24/books/search
 * body: { query, shelfId }
 */
export const searchBooksController = async (req, res) => {
  try {
    console.log("➡️ [Day24] searchBooksController body:", req.body);

    const { query, shelfId } = req.body;

    const q = String(query || "").trim();
    if (!q) {
      return res.status(400).json({ message: "query is required" });
    }

    const match = {
      $or: [
        { title: { $regex: q, $options: "i" } },
        { author: { $regex: q, $options: "i" } },
        { isbn: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
      ],
    };

    if (shelfId) {
      match.shelf = shelfId;
    }

    const books = await bookStoreModel.find(match).sort({ createdAt: -1 });

    console.log("✅ [Day24] search results:", books.length);
    return res.status(200).json({ books });
  } catch (error) {
    console.log("❌ [Day24] searchBooks error:", error?.message || error);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * ✅ Get a single book (book focus page)
 * GET /web/api/day24/books/:id
 */
export const getABookController = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("➡️ [Day24] getABookController id:", id);

    const book = await bookStoreModel.findById(id).populate("shelf", "title shelfKey icon");
    if (!book) {
      console.log("❌ [Day24] book not found");
      return res.status(404).json({ message: "Book not found" });
    }

    return res.status(200).json({ book });
  } catch (error) {
    console.log("❌ [Day24] getABook error:", error?.message || error);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * ✅ Update book
 * PUT /web/api/day24/books/:id
 */
export const updateBookController = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("➡️ [Day24] updateBookController id:", id);
    console.log("➡️ [Day24] update body:", req.body);

    const updated = await bookStoreModel.findByIdAndUpdate(id, { ...req.body }, { new: true });
    if (!updated) {
      console.log("❌ [Day24] book not found");
      return res.status(404).json({ message: "Book not found" });
    }

    console.log("✅ [Day24] book updated:", updated?._id);
    return res.status(200).json({ message: "Book updated", book: updated });
  } catch (error) {
    console.log("❌ [Day24] updateBook error:", error?.message || error);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * ✅ Delete book (also removes from shelf.books if you store that)
 * DELETE /web/api/day24/books/:id
 */
export const deleteBookController = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("➡️ [Day24] deleteBookController id:", id);

    const book = await bookStoreModel.findById(id);
    if (!book) {
      console.log("❌ [Day24] book not found");
      return res.status(404).json({ message: "Book not found" });
    }

    if (book.shelf) {
      await bookShelfModel.findByIdAndUpdate(book.shelf, { $pull: { books: book._id } });
      console.log("✅ [Day24] removed from shelf.books");
    }

    await book.deleteOne();
    console.log("✅ [Day24] book deleted");

    return res.status(200).json({ message: "Book deleted" });
  } catch (error) {
    console.log("❌ [Day24] deleteBook error:", error?.message || error);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * ✅ Checkout a book (marks unavailable)
 * POST /web/api/day24/books/:id/checkout
 */
export const checkoutBookController = async (req, res) => {
  try {
    const { id } = req.params;
    const webUserId = req?.user?._id || null; // depends on your protect middleware
    console.log("➡️ [Day24] checkoutBookController bookId:", id, "webUser:", webUserId);

    const book = await bookStoreModel.findById(id);
    if (!book) return res.status(404).json({ message: "Book not found" });

    if (!book.available) {
      return res.status(409).json({ message: "Book already checked out" });
    }

    book.available = false;
    book.checkedOutBy = webUserId;
    book.checkedOutAt = new Date();

    await book.save();

    console.log("✅ [Day24] book checked out:", book._id);
    return res.status(200).json({ message: "Book checked out", book });
  } catch (error) {
    console.log("❌ [Day24] checkoutBook error:", error?.message || error);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * ✅ Return a book (marks available)
 * POST /web/api/day24/books/:id/return
 */
export const returnBookController = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("➡️ [Day24] returnBookController bookId:", id);

    const book = await bookStoreModel.findById(id);
    if (!book) return res.status(404).json({ message: "Book not found" });

    book.available = true;
    book.checkedOutBy = null;
    book.checkedOutAt = null;

    await book.save();

    console.log("✅ [Day24] book returned:", book._id);
    return res.status(200).json({ message: "Book returned", book });
  } catch (error) {
    console.log("❌ [Day24] returnBook error:", error?.message || error);
    return res.status(500).json({ message: "Server error" });
  }
};

//---------------------------------------------------------------

export const seedDefaultShelvesController = async (req, res) => {
  try {
    console.log("➡️ [Day24] seedDefaultShelvesController");

    const defaults = [
      {
        title: "Sci-Fi",
        shelfKey: "sci-fi",
        icon: "🛸",
        description: "Alien worlds, future tech, space empires, time loops.",
        tags: ["space", "AI", "future", "cyberpunk"],
      },
      {
        title: "Fiction",
        shelfKey: "fiction",
        icon: "📖",
        description: "Characters, drama, mystery, unforgettable plots.",
        tags: ["novels", "mystery", "drama", "classics"],
      },
      {
        title: "Facts",
        shelfKey: "facts",
        icon: "🧠",
        description: "Non-fiction: history, science, business, real-world knowledge.",
        tags: ["history", "science", "business", "biography"],
      },
      {
        title: "Adventure",
        shelfKey: "adventure",
        icon: "🗺️",
        description: "Treasure hunts, wild journeys, epic survival stories.",
        tags: ["journey", "treasure", "survival", "explore"],
      },
      {
        title: "Famous / Public",
        shelfKey: "famous",
        icon: "🏛️",
        description: "Popular titles and iconic authors everyone talks about.",
        tags: ["popular", "top reads", "iconic", "recommended"],
      },
      {
        title: "Terror",
        shelfKey: "terror",
        icon: "🕯️",
        description: "Dark stories, horror, suspense, psychological thrillers.",
        tags: ["horror", "thriller", "suspense", "dark"],
      },
    ];

    const ops = defaults.map((s) => ({
      updateOne: {
        filter: { shelfKey: s.shelfKey },
        update: { $setOnInsert: { ...s, active: true } },
        upsert: true,
      },
    }));

    const result = await bookShelfModel.bulkWrite(ops);
    console.log("✅ [Day24] seed result:", result);

    const shelves = await bookShelfModel.find({ active: true }).sort({ title: 1 }).lean();
    return res.status(200).json({ message: "Seed complete", shelves });
  } catch (error) {
    console.log("❌ [Day24] seed error:", error?.message || error);
    return res.status(500).json({ message: "Server error" });
  }
};
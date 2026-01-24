// backend/routes/day24routes/day24Routes.js
import express from "express";
import { protect } from "../../middleware/authMiddleware.js";

import {
  createShelfController,
  listAllShelvesController,
  getShelfController,
  addBookController,
  listAllBooksController,
  listBooksInShelfController,
  searchBooksController,
  getABookController,
  updateBookController,
  deleteBookController,
  checkoutBookController,
  returnBookController,
    seedDefaultShelvesController,
} from "../../controllers/day24controllers/day24Controller.js";

const day24Router = express.Router();

// ✅ Shelves
day24Router.post("/shelves", protect, createShelfController);
day24Router.get("/shelves", protect, listAllShelvesController);
day24Router.get("/shelves/:shelfId", protect, getShelfController);
day24Router.get("/shelves/:shelfId/books", protect, listBooksInShelfController);
day24Router.post("/shelves/seed", protect, seedDefaultShelvesController);

// ✅ Books
day24Router.post("/books", protect, addBookController);
day24Router.get("/books", protect, listAllBooksController);
day24Router.post("/books/search", protect, searchBooksController);
day24Router.get("/books/:id", protect, getABookController);
day24Router.put("/books/:id", protect, updateBookController);
day24Router.delete("/books/:id", protect, deleteBookController);

// ✅ Checkout / Return
day24Router.post("/books/:id/checkout", protect, checkoutBookController);
day24Router.post("/books/:id/return", protect, returnBookController);

export default day24Router;
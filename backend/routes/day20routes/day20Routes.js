import express from "express";
import { protect } from "../../middleware/authMiddleware.js";
import {
  getDay20Data,
  setDay20Data,
  updateDay20Data,
  deleteDay20Data,
} from "../../controllers/day20controllers/day20Controller.js";

const day20Router = express.Router();

// READ all
day20Router.get("/get-day20-data", protect, getDay20Data);

// CREATE
day20Router.post("/set-day20-data", protect, setDay20Data);

// UPDATE (needs :id)
day20Router.put("/update-day20-data/:id", protect, updateDay20Data);

// DELETE (needs :id)
day20Router.delete("/delete-day20-data/:id", protect, deleteDay20Data);

export default day20Router;
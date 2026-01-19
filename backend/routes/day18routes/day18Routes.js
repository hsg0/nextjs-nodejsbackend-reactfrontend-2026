import express from "express";
import { protect } from "../../middleware/authMiddleware.js";
import {
  getDay18Data,
  setDay18Data,
  generateDay18Ad,
  getDay18Creation,
  deleteDay18Creation,
} from "../../controllers/day18controllers/day18Controller.js";

const day18Router = express.Router();

// entrypoint (returns userId/email)
day18Router.get("/get-day18-data", protect, getDay18Data);

// step 1 (multer inside controller)
day18Router.post("/set-day18-data", protect, setDay18Data);

// step 2 (generate)   STATIC
day18Router.post("/generate", protect, generateDay18Ad);

// step 3 (fetch result)  STATIC
day18Router.get("/get-adcreation", protect, getDay18Creation);

// step 4 (discard/delete) STATIC
day18Router.delete("/delete-adcreation", protect, deleteDay18Creation);

export default day18Router;
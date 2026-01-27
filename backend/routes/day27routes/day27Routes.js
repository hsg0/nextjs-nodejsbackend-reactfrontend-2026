import express from "express";
import { protect } from "../../middleware/authMiddleware.js";
import {
  getDay27DataPDF,
  saveDay27DataPDF,
  uploadPDFFiletoImageKit,
  getPDFFilefromImageKit,
} from "../../controllers/day27controllers/day27Controller.js";

const day27Router = express.Router();

day27Router.get("/get-pdf-data", protect, getDay27DataPDF);
day27Router.post("/save-pdf-data", protect, saveDay27DataPDF);
day27Router.post("/upload-pdf-imagekit", protect, uploadPDFFiletoImageKit);
day27Router.get("/get-pdf-imagekit", protect, getPDFFilefromImageKit);

export default day27Router;
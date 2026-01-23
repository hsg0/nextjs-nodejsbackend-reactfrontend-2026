// backend/routes/day21routes/day21routes.js
import express from "express";
import { protect } from "../../middleware/authMiddleware.js";

import { getLabReqTemplate } from "../../controllers/day21controllers/labReqTemplateController.js";
import { createPrescriptionDoc } from "../../controllers/day21controllers/prescriptionDocController.js";

import {
  createLabReqDocument,
  createLabReqDocumentDebug,
} from "../../controllers/day21controllers/labReqDocumentController.js";

const day21Router = express.Router();

// ✅ Template PDF (served to frontend)
day21Router.get("/templates/labreq", getLabReqTemplate);

// ✅ Lab Req Document (fillable overlay on labs_temp.pdf)
day21Router.post("/documents/labreq", createLabReqDocument);

// ✅ Debug version (draws boxes for alignment)
day21Router.post("/documents/labreq/debug", protect, createLabReqDocumentDebug);

// ✅ Your existing doc creation endpoint
day21Router.post("/documents/prescriptions", protect, createPrescriptionDoc);

export default day21Router;
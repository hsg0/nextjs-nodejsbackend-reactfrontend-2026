// nextjs-nodejsbackend-reactfrontend-2026/backend/routes/day23routes/day23Routes.js
import express from 'express';
import { protect } from '../../middleware/authMiddleware.js';
import {
  getAcroFormFields,
    getAcroFormTemplatePdf,
} from '../../controllers/day23controllers/acroFormController.js';

const day23Router = express.Router();

// ✅ Get AcroForm fields from PDF
day23Router.get('/acroform/fields', protect, getAcroFormFields);
day23Router.get("/acroform/template", protect, getAcroFormTemplatePdf);

export default day23Router; 



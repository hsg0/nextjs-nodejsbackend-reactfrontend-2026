// nextjs-reactjs-practice-2026/backend/routes/day18routes/day18Routes.js
import express from 'express';
import { protect } from '../../middleware/authMiddleware.js';
import { getDay18Data, setDay18Data } from '../../controllers/day18Controller.js';

const day18Router = express.Router();

day18Router.get('/get-day18-data', protect, getDay18Data);
day18Router.post('/set-day18-data', protect, setDay18Data);

export default day18Router;
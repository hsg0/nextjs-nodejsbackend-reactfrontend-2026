// nextjs-reactjs-practice-2026/backend/controllers/day18controllers/day18Controller.js
import Day18Model from '../models/day18Model.js';

export const getDay18Data = async (req, res) => {
  try {
    const day18Data = await Day18Model.find();
    res.status(200).json(day18Data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const setDay18Data = async (req, res) => {   
    try {
        const { data } = req.body;
        const day18Data = await Day18Model.create(data);
        res.status(200).json(day18Data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
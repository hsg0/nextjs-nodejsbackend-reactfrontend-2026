// nextjs-reactjs-practice-2026/backend/routes/userRoutes.js
import express from 'express';
import { getAllUsers, getUserByEmail, getUserById, updateUserById, deleteUserById } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const userRouter = express.Router();

// Get all users (protected route)
userRouter.get('/getallusers', protect, getAllUsers);

// Get user by email (protected route)
userRouter.get('/getuserbyemail', protect, getUserByEmail);

// Get user by ID (protected route)
userRouter.get('/getuserbyid', protect, getUserById);

// Update user by ID (protected route)
userRouter.put('/updateuserbyid', protect, updateUserById);

// Delete user by ID (protected route)
userRouter.delete('/deleteuserbyid', protect, deleteUserById);

export default userRouter;
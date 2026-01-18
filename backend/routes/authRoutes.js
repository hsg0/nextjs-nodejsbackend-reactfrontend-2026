// nextjs-reactjs-practice-2026/backend/routes/authRoutes.js
import express from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  getUserProfile,

  sendVerificationOTP,
  verifyOTP,

  sendResetPasswordOTP,
  resetPassword,
} from "../controllers/authController.js";

import { protect } from "../middleware/authMiddleware.js";

const authRouter = express.Router();

// Register a new user
authRouter.post("/register", registerUser);

// Verification OTP flow
authRouter.post("/send-verification-otp", sendVerificationOTP);
authRouter.post("/verify-otp", verifyOTP);

// Login / Logout
authRouter.post("/login", loginUser);
authRouter.post("/logout", logoutUser);

// Reset password OTP flow (MATCHES FRONTEND)
authRouter.post("/send-reset-password-otp", sendResetPasswordOTP);
authRouter.post("/reset-password", resetPassword);

// Protected profile
authRouter.get("/profile", protect, getUserProfile);

export default authRouter;
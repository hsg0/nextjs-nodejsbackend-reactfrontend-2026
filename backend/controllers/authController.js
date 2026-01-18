// nextjs-reactjs-practice-2026/backend/controllers/authController.js
import dotenv from "dotenv";
import WebUserModel from "../models/webUserModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// ✅ email transporter
import emailWebTransporter from "../config/emailTransporter.js";

dotenv.config();

/* ----------------------------------------------------------
   REGISTER
---------------------------------------------------------- */
export const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // ✅ Basic validation (prevents weird saves)
    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ message: "username, email, and password are required" });
    }

    const cleanEmail = String(email).toLowerCase().trim();
    const cleanUsername = String(username).trim();

    // Check if user already exists
    const existingUser = await WebUserModel.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUserOnWeb = new WebUserModel({
      username: cleanUsername,
      email: cleanEmail,
      password: hashedPassword,
    });

    await newUserOnWeb.save();

    const webToken = jwt.sign(
      { userId: newUserOnWeb._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // ✅ Set token cookie (added path "/")
    res.cookie("token", webToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    // ✅ Send thank-you email (non-blocking)
    try {
      await emailWebTransporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: newUserOnWeb.email,
        subject: "Thanks for registering ✅",
        text: `Hi ${newUserOnWeb.username},\n\nThanks for registering!\n\nNext step: request a verification OTP and verify your account.\n\n— Practice Lab`,
      });
      console.log("✅ Register email sent to:", newUserOnWeb.email);
    } catch (emailErr) {
      console.log("❌ Register email failed:", emailErr?.message || emailErr);
    }

    return res.status(201).json({
      message: "User registered successfully",
      webUser: {
        webUserId: newUserOnWeb._id,
        username: newUserOnWeb.username,
        email: newUserOnWeb.email,
      },
    });
  } catch (error) {
    console.error("Error registering user:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

/* ----------------------------------------------------------
   SEND VERIFICATION OTP
---------------------------------------------------------- */
export const sendVerificationOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await WebUserModel.findOne({
      email: String(email).toLowerCase().trim(),
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.verifyAccount === true) {
      return res.status(400).json({ message: "Account already verified" });
    }

    // Generate OTP and expiry (10 minutes)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    user.verifyOTP = otp;
    user.verifyOTPExpiry = otpExpiry;
    await user.save();

    // Send "verification OTP" email (non-blocking)
    try {
      await emailWebTransporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: user.email,
        subject: "Account Verification OTP ✅",
        text: `Hi ${user.username},\n\nYour OTP for account verification is: ${otp}\n\nThis OTP is valid for 10 minutes.\n\n— Practice Lab`,
      });
      console.log("✅ Verification OTP email sent to:", user.email);
    } catch (emailErr) {
      console.log("❌ Verification OTP email failed:", emailErr?.message || emailErr);
    }

    return res
      .status(200)
      .json({ message: "Verification OTP sent to email successfully" });
  } catch (error) {
    console.error("Error sending verification OTP:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

/* ----------------------------------------------------------
   VERIFY OTP
---------------------------------------------------------- */
export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    const user = await WebUserModel.findOne({
      email: String(email).toLowerCase().trim(),
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // must have OTP and not expired
    if (!user.verifyOTP || !user.verifyOTPExpiry || user.verifyOTPExpiry < new Date()) {
      return res.status(400).json({ message: "OTP is invalid or has expired" });
    }

    // ✅ compare as strings
    if (String(user.verifyOTP) !== String(otp)) {
      return res.status(400).json({ message: "Incorrect OTP" });
    }

    // Mark account as verified
    user.verifyAccount = true;
    user.verifyOTP = null;
    user.verifyOTPExpiry = null;

    await user.save();

    // Send "verified" email (non-blocking)
    try {
      await emailWebTransporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: user.email,
        subject: "Account verified ✅",
        text: `Hi ${user.username},\n\nYour account has been verified successfully.\n\nYou can now log in and use the site.\n\n— Practice Lab`,
      });
      console.log("✅ Verified email sent to:", user.email);
    } catch (emailErr) {
      console.log("❌ Verified email failed:", emailErr?.message || emailErr);
    }

    return res.status(200).json({
      message: "Account verified successfully",
      webUser: {
        webUserId: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

/* ----------------------------------------------------------
   LOGIN
---------------------------------------------------------- */
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await WebUserModel.findOne({
      email: String(email).toLowerCase().trim(),
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid password" });
    }

    if (!user.verifyAccount) {
      return res
        .status(403)
        .json({ message: "Account not verified. Please verify your account." });
    }

    const webToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // ✅ Set token cookie (added path "/")
    res.cookie("token", webToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    return res.status(200).json({
      message: "Login successful",
      webUser: {
        webUserId: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Error during login:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

/* ----------------------------------------------------------
   LOGOUT
---------------------------------------------------------- */
export const logoutUser = (req, res) => {
  try {
    // ✅ clearCookie must match cookie options (added path "/")
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      path: "/",
    });

    return res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.error("Error during logout:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

/* ----------------------------------------------------------
   PROFILE (protected)
---------------------------------------------------------- */
export const getUserProfile = async (req, res) => {
  try {
    // ✅ your protect middleware sets req.user.webUserId
    const userId = req?.user?.webUserId;

    if (!userId) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const user = await WebUserModel.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      webUser: {
        webUserId: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

/* ----------------------------------------------------------
   SEND RESET PASSWORD OTP
---------------------------------------------------------- */
export const sendResetPasswordOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await WebUserModel.findOne({
      email: String(email).toLowerCase().trim(),
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate OTP and expiry (10 minutes)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    user.resetPasswordOTP = otp;
    user.resetPasswordOTPExpiry = otpExpiry;

    await user.save();

    // Send "reset password OTP" email (non-blocking)
    try {
      await emailWebTransporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: user.email,
        subject: "Password Reset OTP ✅",
        text: `Hi ${user.username},\n\nYour OTP for password reset is: ${otp}\n\nThis OTP is valid for 10 minutes.\n\n— Practice Lab`,
      });
      console.log("✅ Reset Password OTP email sent to:", user.email);
    } catch (emailErr) {
      console.log("❌ Reset Password OTP email failed:", emailErr?.message || emailErr);
    }

    return res
      .status(200)
      .json({ message: "Password reset OTP sent to email successfully" });
  } catch (error) {
    console.error("Error sending reset password OTP:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

/* ----------------------------------------------------------
   RESET PASSWORD
---------------------------------------------------------- */
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res
        .status(400)
        .json({ message: "Email, OTP, and new password are required" });
    }

    const user = await WebUserModel.findOne({
      email: String(email).toLowerCase().trim(),
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // must have OTP and not expired
    if (
      !user.resetPasswordOTP ||
      !user.resetPasswordOTPExpiry ||
      user.resetPasswordOTPExpiry < new Date()
    ) {
      return res.status(400).json({ message: "OTP is invalid or has expired" });
    }

    // ✅ compare as strings
    if (String(user.resetPasswordOTP) !== String(otp)) {
      return res.status(400).json({ message: "Incorrect OTP" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;

    // Clear OTP fields
    user.resetPasswordOTP = null;
    user.resetPasswordOTPExpiry = null;

    await user.save();

    return res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Error resetting password:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
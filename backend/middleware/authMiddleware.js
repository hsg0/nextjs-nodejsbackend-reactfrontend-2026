// nextjs-reactjs-practice-2026/backend/middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import webUserModel from "../models/webUserModel.js";

dotenv.config();

export const protect = async (req, res, next) => {
  console.log("🔐 protect middleware hit:", req.method, req.originalUrl);

  // must be let (we may overwrite it)
  let token = req?.cookies?.token;

  // If no cookie token, try Authorization header
  if (!token) {
    const auth = req.headers.authorization || "";
    if (auth.startsWith("Bearer ")) {
      token = auth.slice("Bearer ".length).trim();
    }
  }

  if (!token) {
    console.log("❌ protect: token missing");
    return res.status(401).json({ message: "Not authorized, token missing" });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("✅ protect: decoded token:", decoded);

    // support different token payload keys
    const userId = decoded?.userId || decoded?._id || decoded?.id;

    if (!userId) {
      console.log("❌ protect: invalid token payload (no userId)");
      return res.status(401).json({ message: "Not authorized, invalid token" });
    }

    // ✅ Your model uses "username" (not "name")
    const user = await webUserModel
      .findById(userId)
      .select("_id username email");

    if (!user) {
      console.log("❌ protect: user not found for id:", userId);
      return res.status(401).json({ message: "Not authorized, user not found" });
    }

    // ✅ Attach user to request object (use username)
    req.user = {
      webUserId: user._id.toString(),
      username: user.username,
      email: user.email,
    };

    console.log("✅ protect: req.user set:", req.user);

    next();
  } catch (error) {
    console.log("❌ Error in auth middleware:", error?.message || error);
    return res.status(401).json({ message: "Not authorized, token failed" });
  }
};
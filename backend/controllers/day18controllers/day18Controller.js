// backend/controllers/day18controllers/day18Controller.js
import Day18Model from "../../models/day18models/day18Model.js";

// ✅ GET /web/api/day18/get-day18-data
// Use this as "entrypoint" that returns the logged-in user's MongoDB _id
export const getDay18Data = async (req, res) => {
  try {
    console.log("[Day18] GET /get-day18-data hit");
    console.log("[Day18] req.user:", req.user);

    // From protect middleware: req.user.webUserId is the MongoDB _id string
    const userId = req.user?.webUserId;

    if (!userId) {
      console.log("[Day18] Missing req.user.webUserId");
      return res.status(401).json({
        success: false,
        message: "Unauthorized: userId missing on request",
      });
    }

    // (optional) you can also return username/email if you want
    return res.status(200).json({
      success: true,
      userId: String(userId),
      username: req.user?.username || null,
      email: req.user?.email || null,
    });
  } catch (error) {
    console.log("[Day18] getDay18Data error:", error?.message || error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ✅ POST /web/api/day18/set-day18-data
// Keep this for saving day18 data later (but fix create payload)
export const setDay18Data = async (req, res) => {
  try {
    console.log("[Day18] POST /set-day18-data hit user:", req.user?.webUserId);
    console.log("[Day18] body:", req.body);

    // Example expected body:
    // { data: { ...whatever fields your Day18Model needs... } }
    const { data } = req.body;

    if (!data || typeof data !== "object") {
      return res.status(400).json({
        success: false,
        message: "Bad request: missing data object",
      });
    }

    // Attach who saved it (optional, only if your schema supports it)
    const doc = await Day18Model.create({
      ...data,
      webUserId: req.user?.webUserId, // only works if your schema has this field
    });

    return res.status(201).json({
      success: true,
      saved: doc,
    });
  } catch (error) {
    console.log("[Day18] setDay18Data error:", error?.message || error);
    return res.status(500).json({
      success: false,
      message: error?.message || "Server error",
    });
  }
};
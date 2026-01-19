import Day18Model from "../../models/day18models/day18Model.js";
import imagekit from "../../config/day18config/imagekit.js";
import { upload } from "../../middleware/uploadMiddleware.js";

// ✅ GET /web/api/day18/get-day18-data
export const getDay18Data = async (req, res) => {
  try {
    console.log("[Day18] GET /get-day18-data hit");
    console.log("[Day18] req.user:", req.user);

    // protect middleware sets: req.user.webUserId
    const userId = req.user?.webUserId;

    if (!userId) {
      console.log("[Day18] Missing req.user.webUserId");
      return res.status(401).json({
        success: false,
        message: "Unauthorized: userId missing on request",
      });
    }

    return res.status(200).json({
      success: true,
      userId: String(userId),
      username: req.user?.username || null,
      email: req.user?.email || null,
    });
  } catch (error) {
    console.log("[Day18] getDay18Data error:", error?.message || error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ✅ POST /web/api/day18/set-day18-data
// Router stays clean (protect only). We run multer HERE.
export const setDay18Data = async (req, res) => {
  console.log("[Day18] POST /set-day18-data hit user:", req.user?.webUserId);

  const userId = req.user?.webUserId;
  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: userId missing on request",
    });
  }

  const runUpload = upload.fields([
    { name: "productImage", maxCount: 1 },
    { name: "actorImage", maxCount: 1 },
  ]);

  runUpload(req, res, async (err) => {
    try {
      if (err) {
        console.log("❌ [Day18] multer error:", err?.message || err);

        if (String(err?.message || "").toLowerCase().includes("file too large")) {
          return res.status(413).json({
            success: false,
            message: "One of the images is too large (max 10MB).",
          });
        }

        return res.status(400).json({
          success: false,
          message: err?.message || "Upload error",
        });
      }

      console.log("[Day18] body keys:", Object.keys(req.body || {}));
      console.log("[Day18] files present?", !!req.files);

      const adprepare = req.body?.adprepare || "";
      const email = req.body?.email || req.user?.email || "";
      const directions = req.body?.directions || "";
      const actorWords = req.body?.actorWords || "";

      const productFile = req.files?.productImage?.[0] || null;
      const actorFile = req.files?.actorImage?.[0] || null;

      if (!adprepare) return res.status(400).json({ success: false, message: "Missing adprepare" });
      if (!productFile) return res.status(400).json({ success: false, message: "Missing productImage" });
      if (!actorFile) return res.status(400).json({ success: false, message: "Missing actorImage" });
      if (!directions.trim()) return res.status(400).json({ success: false, message: "Missing directions" });
      if (!actorWords.trim()) return res.status(400).json({ success: false, message: "Missing actorWords" });

      const productUpload = await imagekit.upload({
        file: productFile.buffer,
        fileName: `${adprepare}-product-${Date.now()}`,
      });

      const actorUpload = await imagekit.upload({
        file: actorFile.buffer,
        fileName: `${adprepare}-actor-${Date.now()}`,
      });

      if (!productUpload?.fileId || !productUpload?.url) {
        return res.status(500).json({
          success: false,
          message: "Product image upload failed",
        });
      }

      if (!actorUpload?.fileId || !actorUpload?.url) {
        return res.status(500).json({
          success: false,
          message: "Actor image upload failed",
        });
      }

      const doc = await Day18Model.create({
        webUserId: String(userId),
        adprepare: String(adprepare),
        email: String(email),
        directions: String(directions),
        actorWords: String(actorWords),

        productImage: {
          fileId: String(productUpload.fileId),
          url: String(productUpload.url),
          name: String(productUpload.name || productFile.originalname || ""),
          size: Number(productUpload.size || productFile.size || 0),
          fileType: String(productUpload.fileType || "image"),
          mime: String(productUpload.mimeType || productFile.mimetype || ""),
        },
        actorImage: {
          fileId: String(actorUpload.fileId),
          url: String(actorUpload.url),
          name: String(actorUpload.name || actorFile.originalname || ""),
          size: Number(actorUpload.size || actorFile.size || 0),
          fileType: String(actorUpload.fileType || "image"),
          mime: String(actorUpload.mimeType || actorFile.mimetype || ""),
        },

        status: "uploaded",
      });

      return res.status(201).json({
        success: true,
        message: "Forge payload received ✅",
        savedId: String(doc?._id),
        userId: String(userId),
        adprepare: String(adprepare),
        email: String(email),
      });
    } catch (error) {
      console.log("[Day18] setDay18Data inner error:", error?.message || error);
      return res.status(500).json({
        success: false,
        message: error?.message || "Server error",
      });
    }
  });
};
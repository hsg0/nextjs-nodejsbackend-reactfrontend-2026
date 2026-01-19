// backend/middleware/uploadMiddleware.js
import multer from "multer";

// Store files in memory (Buffer) so we can send to AI / ImageKit later
const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB per file
  },
  fileFilter: (req, file, cb) => {
    // only allow images
    if (!file?.mimetype?.startsWith("image/")) {
      console.log("❌ [uploadMiddleware] Rejected file:", file?.originalname, file?.mimetype);
      return cb(new Error("Only image files are allowed"), false);
    }
    cb(null, true);
  },
});
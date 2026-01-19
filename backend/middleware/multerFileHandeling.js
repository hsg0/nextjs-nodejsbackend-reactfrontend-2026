import multer from "multer";

// Store files in memory (Buffer) so we can send to AI / ImageKit later
const storage = multer.memoryStorage();

export const multerUpload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB per file
  },
  fileFilter: (req, file, cb) => {
    if (!file?.mimetype?.startsWith("image/")) {
      console.log(
        "❌ [uploadMiddleware] Rejected file:",
        file?.originalname,
        file?.mimetype
      );
      return cb(new Error("Only image files are allowed"), false);
    }
    cb(null, true);
  },
});




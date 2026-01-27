// backend/config/multer.js
import multer from "multer";

export const uploadMemory = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 15 * 1024 * 1024, // 15MB
  },
});

/**
 * Run a multer middleware inside a controller (Promise wrapper).
 * Usage: await runMulter(uploadMemory.single("pdf"))(req, res);
 */
export const runMulter = (multerMiddleware) => {
  return (req, res) =>
    new Promise((resolve, reject) => {
      multerMiddleware(req, res, (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
};
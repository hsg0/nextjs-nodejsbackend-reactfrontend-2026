// backend/controllers/day18controllers/day18Controller.js
import fs from "fs";
import Day18Model from "../../models/day18models/day18Model.js";
import imagekit from "../../config/day18config/imagekit.js";
import { multerUpload } from "../../middleware/multerFileHandeling.js";
import { nanoid } from "nanoid";

import { buildAdVideo } from "../../utils/day18utils/buildAdVideo.js";

/**
 * Day 18 Controller (SkullFire)
 * --------------------------------
 * Fixed/static endpoints:
 *  - GET    /web/api/day18/get-day18-data
 *  - POST   /web/api/day18/set-day18-data        (multipart: productImage + actorImage)
 *  - POST   /web/api/day18/generate              (json: { adprepare })
 *  - GET    /web/api/day18/get-adcreation        (query: ?adcreation=...)
 *  - DELETE /web/api/day18/delete-adcreation     (json body: { adcreation, deleteInputs? })
 *
 * NOTE:
 * Your pipeline writes extra fields (generatedScript, shotList, captions, overlays, errorMessage).
 * Make sure your Day18 schema includes them OR set schema strict:false.
 */

/* ---------------- Helpers ---------------- */
function makeAdCreationId() {
  return `ad-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function makePublicShareId() {
  return `share-${nanoid(12)}`;
}

/**
 * ✅ PHASE 1 (FREE): Rule-based planner
 * Creates:
 *  - generatedScript
 *  - shotList (3–6)
 *  - captions
 *  - overlays (headline/cta/etc)
 */
function ruleBasedPlan({ directions, actorWords }) {
  const cleanDirections = String(directions || "").trim();
  const cleanWords = String(actorWords || "").trim();

  const headline = "SKULLFIRE";
  const cta = "FORGE YOUR POWER 🔥";

  const generatedScript = cleanWords.length
    ? cleanWords
    : "SkullFire gives me the power to crush my day. Let’s go!";

  // 4-shot default (easy learning pipeline)
  const shotList = [
    {
      id: "shot-1",
      type: "product",
      durationSec: 2.5,
      motion: "zoom_in",
      text: [headline],
    },
    {
      id: "shot-2",
      type: "actor",
      durationSec: 3.0,
      motion: "slow_pan",
      text: ["Listen up…"],
      subtitleFromScript: true,
    },
    {
      id: "shot-3",
      type: "split",
      durationSec: 3.0,
      motion: "shake_glow",
      text: ["Power. Style. SkullFire."],
    },
    {
      id: "shot-4",
      type: "endcard",
      durationSec: 2.5,
      motion: "fade_in",
      text: [cta],
    },
  ];

  // captions: simple split into 1–2 lines (starter)
  const captions = generatedScript
    .split(/[.?!]\s+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 4);

  const overlays = {
    headline,
    cta,
    styleNotes: cleanDirections || "Dark background, orange glow, bold type.",
  };

  return { generatedScript, shotList, captions, overlays };
}

/**
 * ✅ PHASE 3 (FREE optional): Local TTS
 * TODO (later): Piper / espeak-ng
 */
async function generateVoicePlaceholder({ generatedScript }) {
  console.log("[Day18][TTS] TODO voice. Skipping for now...");
  console.log("[Day18][TTS] script:", String(generatedScript || "").slice(0, 120));
  return null; // return Buffer (wav/mp3) later if you implement
}

/**
 * Background pipeline runner
 * - Updates Mongo through: planned -> rendering -> final -> ready (or error)
 *
 * IMPORTANT:
 * - This runs async (non-awaited) after /generate responds.
 * - Any throw will be caught and saved to doc.status="error".
 */
async function runPipelineInBackground({ userId, adprepare }) {
  console.log("[Day18][Pipeline] Background job start:", { userId, adprepare });

  const doc = await Day18Model.findOne({ webUserId: String(userId), adprepare });
  if (!doc) {
    console.log("[Day18][Pipeline] Doc missing, stop.");
    return;
  }

  // if discarded mid-flight, stop
  if (doc.status === "discarded") {
    console.log("[Day18][Pipeline] Doc discarded, stop.");
    return;
  }

  let outPath = "";
  let tmpDir = "";

  try {
    // -------- Phase 1: plan (rule-based) --------
    const plan = ruleBasedPlan({
      directions: doc.directions,
      actorWords: doc.actorWords,
    });

    doc.generatedScript = plan.generatedScript;
    doc.shotList = plan.shotList;
    doc.captions = plan.captions;
    doc.overlays = plan.overlays;

    doc.status = "planned";
    await doc.save();
    console.log("[Day18][Pipeline] planned ✅");

    // Check discard again (user could discard while planning)
    const afterPlan = await Day18Model.findOne({ webUserId: String(userId), adprepare });
    if (afterPlan?.status === "discarded") {
      console.log("[Day18][Pipeline] Discarded after planning, stop.");
      return;
    }

    // -------- Phase 2: render (ffmpeg realistic fake) --------
    doc.status = "rendering";
    await doc.save();
    console.log("[Day18][Pipeline] rendering...");

    // ✅ THIS IS WHERE YOUR SNIPPET GOES
    const built = await buildAdVideo({
      adcreation: doc.adcreation,
      productUrl: doc.productImage?.url,
      actorUrl: doc.actorImage?.url,
      // Later: shotList, captions, overlays when buildAdVideo supports them
    });

    outPath = built.outPath;
    tmpDir = built.tmpDir;

    const videoBuffer = fs.readFileSync(outPath);

    // cleanup tmp
    try {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    } catch (e) {
      console.log("[Day18][Video] tmp cleanup failed:", e?.message || e);
    }

    // Check discard again (user could discard while rendering)
    const afterRender = await Day18Model.findOne({ webUserId: String(userId), adprepare });
    if (afterRender?.status === "discarded") {
      console.log("[Day18][Pipeline] Discarded after render, stop.");
      return;
    }

    // -------- Phase 3: voice (optional) --------
    const voiceBuffer = await generateVoicePlaceholder({
      generatedScript: doc.generatedScript,
    });

    if (voiceBuffer) {
      doc.status = "voiced";
      await doc.save();
      console.log("[Day18][Pipeline] voiced ✅");
    }

    // -------- Phase 4: merge (ffmpeg) --------
    // TODO: merge video + voice + captions/music
    doc.status = "final";
    await doc.save();
    console.log("[Day18][Pipeline] finalizing...");

    // -------- Phase 5: upload mp4 to ImageKit --------
    console.log("[Day18][Pipeline] Uploading final MP4 to ImageKit...");
    const videoUpload = await imagekit.upload({
      file: videoBuffer,
      fileName: `${doc.adprepare}-${doc.adcreation}-final-${Date.now()}.mp4`,
      folder: "/day18/ads",
    });

    if (!videoUpload?.fileId || !videoUpload?.url) {
      doc.status = "error";
      doc.errorMessage = "Final MP4 upload failed";
      await doc.save();
      console.log("[Day18][Pipeline] upload failed ❌");
      return;
    }

    doc.adVideo = {
      fileId: String(videoUpload.fileId || ""),
      url: String(videoUpload.url || ""),
      name: String(videoUpload.name || ""),
      size: Number(videoUpload.size || 0),
      fileType: String(videoUpload.fileType || "video"),
      mime: String(videoUpload.mimeType || "video/mp4"),
    };

    doc.status = "ready";
    await doc.save();

    console.log("[Day18][Pipeline] ready ✅", doc.adVideo?.url);

    // Optional: delete local out file so USB doesn’t fill up
    try {
      if (outPath && fs.existsSync(outPath)) fs.unlinkSync(outPath);
    } catch (e) {
      console.log("[Day18][Video] out cleanup failed:", e?.message || e);
    }
  } catch (e) {
    console.log("[Day18][Pipeline] error:", e?.message || e);

    // cleanup tmp/out if present
    try {
      if (tmpDir) fs.rmSync(tmpDir, { recursive: true, force: true });
    } catch {}
    try {
      if (outPath && fs.existsSync(outPath)) fs.unlinkSync(outPath);
    } catch {}

    try {
      const fresh = await Day18Model.findOne({ webUserId: String(userId), adprepare });
      if (fresh && fresh.status !== "discarded") {
        fresh.status = "error";
        fresh.errorMessage = String(e?.message || "Pipeline error");
        await fresh.save();
      }
    } catch (inner) {
      console.log("[Day18][Pipeline] error while saving error:", inner?.message || inner);
    }
  }
}

/* ---------------- GET /get-day18-data ---------------- */
export const getDay18Data = async (req, res) => {
  try {
    console.log("[Day18] GET /get-day18-data hit");
    console.log("[Day18] req.user:", req.user);

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

/* ---------------- POST /set-day18-data ----------------
   Multer runs INSIDE controller (no route middleware added) */
export const setDay18Data = async (req, res) => {
  console.log("[Day18] POST /set-day18-data hit user:", req.user?.webUserId);

  const userId = req.user?.webUserId;
  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: userId missing on request",
    });
  }

  const runUpload = multerUpload.fields([
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

      const adprepare = String(req.body?.adprepare || "");
      const email = String(req.body?.email || req.user?.email || "");
      const directions = String(req.body?.directions || "");
      const actorWords = String(req.body?.actorWords || "");

      const productFile = req.files?.productImage?.[0] || null;
      const actorFile = req.files?.actorImage?.[0] || null;

      if (!adprepare) return res.status(400).json({ success: false, message: "Missing adprepare" });
      if (!productFile) return res.status(400).json({ success: false, message: "Missing productImage" });
      if (!actorFile) return res.status(400).json({ success: false, message: "Missing actorImage" });
      if (!directions.trim()) return res.status(400).json({ success: false, message: "Missing directions" });
      if (!actorWords.trim()) return res.status(400).json({ success: false, message: "Missing actorWords" });

      // If session exists and NOT resettable -> block
      const existing = await Day18Model.findOne({ webUserId: String(userId), adprepare });

      const resettableStatuses = new Set(["discarded", "error"]);

      if (existing && !resettableStatuses.has(String(existing.status || ""))) {
        return res.status(409).json({
          success: false,
          message: "This adprepare session already exists for this user.",
          adprepare: existing.adprepare,
          adcreation: existing.adcreation || "",
          status: existing.status || "",
        });
      }

      // ✅ if we reach here:
      // - no existing doc, OR
      // - existing doc is discarded/error (so we are allowed to overwrite/reset it)

      console.log("[Day18] Uploading product to ImageKit...");
      const productUpload = await imagekit.upload({
        file: productFile.buffer,
        fileName: `${adprepare}-product-${Date.now()}`,
        folder: "/day18/uploads",
      });

      console.log("[Day18] Uploading actor to ImageKit...");
      const actorUpload = await imagekit.upload({
        file: actorFile.buffer,
        fileName: `${adprepare}-actor-${Date.now()}`,
        folder: "/day18/uploads",
      });

      if (!productUpload?.fileId || !productUpload?.url) {
        return res.status(500).json({ success: false, message: "Product image upload failed" });
      }

      if (!actorUpload?.fileId || !actorUpload?.url) {
        return res.status(500).json({ success: false, message: "Actor image upload failed" });
      }

      // If there was a discarded doc, reuse it (reset it)
      let doc = existing;
      if (doc) {
        console.log("[Day18] Reusing discarded doc and resetting...");

        doc.webUserId = String(userId);
        doc.adprepare = adprepare;
        doc.email = email;
        doc.directions = directions;
        doc.actorWords = actorWords;

        doc.productImage = {
          fileId: String(productUpload.fileId),
          url: String(productUpload.url),
          name: String(productUpload.name || productFile.originalname || ""),
          size: Number(productUpload.size || productFile.size || 0),
          fileType: String(productUpload.fileType || "image"),
          mime: String(productUpload.mimeType || productFile.mimetype || ""),
        };

        doc.actorImage = {
          fileId: String(actorUpload.fileId),
          url: String(actorUpload.url),
          name: String(actorUpload.name || actorFile.originalname || ""),
          size: Number(actorUpload.size || actorFile.size || 0),
          fileType: String(actorUpload.fileType || "image"),
          mime: String(actorUpload.mimeType || actorFile.mimetype || ""),
        };

        // reset pipeline fields
        doc.status = "uploaded";
        doc.discardedAt = null;
        doc.errorMessage = "";
        doc.adcreation = "";
        doc.publicShareId = "";
        doc.adVideo = { fileId: "", url: "", name: "", size: 0, fileType: "video", mime: "" };

        doc.generatedScript = "";
        doc.shotList = [];
        doc.captions = [];
        doc.overlays = {};

        await doc.save();
      } else {
        doc = await Day18Model.create({
          webUserId: String(userId),
          adprepare,
          email,
          directions,
          actorWords,

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
      }

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

/* ---------------- POST /generate ----------------
   Body: { adprepare }
   ✅ Returns quickly: { adcreation }
   ✅ Starts pipeline in background (planned -> rendering -> final -> ready) */
export const generateDay18Ad = async (req, res) => {
  try {
    console.log("[Day18] POST /generate hit");

    const userId = req.user?.webUserId;
    const adprepare = String(req.body?.adprepare || "");

    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });
    if (!adprepare) return res.status(400).json({ success: false, message: "Missing adprepare in body" });

    const doc = await Day18Model.findOne({ webUserId: String(userId), adprepare });
    if (!doc) return res.status(404).json({ success: false, message: "Session not found" });

    if (doc.status === "discarded") {
      return res.status(400).json({ success: false, message: "This session was discarded" });
    }

    // If already ready, just return existing
    if (doc.status === "ready" && doc.adcreation && doc.adVideo?.url) {
      return res.status(200).json({
        success: true,
        message: "Already ready ✅",
        adprepare: doc.adprepare,
        adcreation: doc.adcreation,
        videoUrl: doc.adVideo?.url || "",
      });
    }

    // Ensure IDs
    if (!doc.adcreation) doc.adcreation = makeAdCreationId();
    if (!doc.publicShareId) doc.publicShareId = makePublicShareId();

    // Mark processing start (frontend will poll)
    doc.status = "processing";
    doc.errorMessage = "";
    await doc.save();

    // ✅ respond immediately for UI redirect flow
    res.status(200).json({
      success: true,
      message: "Generation started ✅",
      adprepare: doc.adprepare,
      adcreation: doc.adcreation,
      publicShareId: doc.publicShareId,
    });

    // ✅ run pipeline async (do NOT await)
    setImmediate(() => {
      runPipelineInBackground({ userId: String(userId), adprepare: String(adprepare) });
    });
  } catch (error) {
    console.log("[Day18] generateDay18Ad error:", error?.message || error);
    return res.status(500).json({ success: false, message: error?.message || "Server error" });
  }
};

/* ---------------- GET /get-adcreation ----------------
   Query: ?adcreation=...
   Returns status + URLs */
export const getDay18Creation = async (req, res) => {
  try {
    console.log("[Day18] GET /get-adcreation hit");

    const userId = req.user?.webUserId;
    const adcreation = String(req.query?.adcreation || "");

    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });
    if (!adcreation) {
      return res.status(400).json({ success: false, message: "Missing adcreation query param" });
    }

    const doc = await Day18Model.findOne({ webUserId: String(userId), adcreation });
    if (!doc) return res.status(404).json({ success: false, message: "Ad not found" });

    if (doc.status === "discarded") {
      return res.status(410).json({ success: false, message: "Discarded" });
    }

    return res.status(200).json({
      success: true,
      status: doc.status,
      adprepare: doc.adprepare,
      adcreation: doc.adcreation,
      email: doc.email,
      publicShareId: doc.publicShareId || "",

      // URLs expected by frontend
      productUrl: doc.productImage?.url || "",
      actorUrl: doc.actorImage?.url || "",
      videoUrl: doc.adVideo?.url || "",

      // optional debug fields
      errorMessage: doc.errorMessage || "",
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  } catch (error) {
    console.log("[Day18] getDay18Creation error:", error?.message || error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ---------------- DELETE /delete-adcreation ----------------
   Body: { adcreation, deleteInputs?: boolean }
   Deletes MP4 always; optionally deletes input images */
export const deleteDay18Creation = async (req, res) => {
  try {
    console.log("[Day18] DELETE /delete-adcreation hit");

    const userId = req.user?.webUserId;
    const adcreation = String(req.body?.adcreation || "");
    const deleteInputs = Boolean(req.body?.deleteInputs || false); // optional

    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });
    if (!adcreation) return res.status(400).json({ success: false, message: "Missing adcreation in body" });

    const doc = await Day18Model.findOne({ webUserId: String(userId), adcreation });
    if (!doc) return res.status(404).json({ success: false, message: "Ad not found" });

    if (doc.status === "discarded") {
      return res.status(200).json({ success: true, message: "Already discarded" });
    }

    // Always delete final MP4 if present
    const idsToDelete = [];
    if (doc.adVideo?.fileId) idsToDelete.push(doc.adVideo.fileId);

    // Optional: also delete product + actor inputs
    if (deleteInputs) {
      if (doc.productImage?.fileId) idsToDelete.push(doc.productImage.fileId);
      if (doc.actorImage?.fileId) idsToDelete.push(doc.actorImage.fileId);
    }

    console.log("[Day18] Deleting ImageKit files:", idsToDelete);

    for (const fid of idsToDelete) {
      try {
        await imagekit.deleteFile(String(fid));
        console.log("[Day18] Deleted:", fid);
      } catch (e) {
        console.log("[Day18] deleteFile failed (continuing):", fid, e?.message || e);
      }
    }

    doc.status = "discarded";
    doc.discardedAt = new Date();

    // Clear outputs so UI can’t play old video
    doc.adVideo = { fileId: "", url: "", name: "", size: 0, fileType: "video", mime: "" };

    // If deleting inputs, clear those URLs too
    if (deleteInputs) {
      doc.productImage.url = "";
      doc.actorImage.url = "";
    }

    await doc.save();

    return res.status(200).json({
      success: true,
      message: deleteInputs ? "Discarded + inputs deleted ✅" : "Discarded (video deleted) ✅",
    });
  } catch (error) {
    console.log("[Day18] deleteDay18Creation error:", error?.message || error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
// backend/utils/day18utils/buildAdVideo.js
import fs from "fs";
import path from "path";
import { downloadFile } from "./downloadFile.js";
import { runFfmpeg } from "./runFfmpeg.js";

function day18Base() {
  // backend/day18folder/uploads/day18
  return path.resolve(process.cwd(), "backend/day18folder/uploads/day18");
}

function safeName(name) {
  return String(name || "").replace(/[^a-zA-Z0-9-_]/g, "_");
}

/**
 * Builds an MP4 from 2 images using FFmpeg.
 * Returns { outPath, tmpDir }
 */
export async function buildAdVideo({ adcreation, productUrl, actorUrl }) {
  if (!adcreation) throw new Error("buildAdVideo: missing adcreation");
  if (!productUrl) throw new Error("buildAdVideo: missing productUrl");
  if (!actorUrl) throw new Error("buildAdVideo: missing actorUrl");

  const base = day18Base();
  const tmpRoot = path.join(base, "tmp");
  const outRoot = path.join(base, "out");

  fs.mkdirSync(tmpRoot, { recursive: true });
  fs.mkdirSync(outRoot, { recursive: true });

  const tmpDir = path.join(tmpRoot, safeName(adcreation));
  fs.mkdirSync(tmpDir, { recursive: true });

  const productPath = path.join(tmpDir, "product.jpg");
  const actorPath = path.join(tmpDir, "actor.jpg");

  console.log("[Day18][Video] tmpDir:", tmpDir);
  console.log("[Day18][Video] downloading inputs...");

  await downloadFile(productUrl, productPath, { logPrefix: "[Day18][DL][product]" });
  await downloadFile(actorUrl, actorPath, { logPrefix: "[Day18][DL][actor]" });

  const outPath = path.join(outRoot, `${safeName(adcreation)}.mp4`);

  // Vertical video 1080x1920 (TikTok/Reels style)
  // 4 shots total (approx 11s). No text yet (keep it simple + reliable).
  // You can add drawtext once this works end-to-end.
  const args = [
    "-y",

    // inputs as looping images
    "-loop", "1", "-t", "3", "-i", productPath,
    "-loop", "1", "-t", "3", "-i", actorPath,
    "-loop", "1", "-t", "3", "-i", productPath,
    "-loop", "1", "-t", "2.5", "-i", actorPath,

    "-filter_complex",
    [
      // Shot 1: product zoom in
      "[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,",
      "zoompan=z='min(zoom+0.0018,1.25)':d=90:s=1080x1920:fps=30,",
      "trim=duration=3,setsar=1,fade=t=out:st=2.7:d=0.3[v0];",

      // Shot 2: actor slow zoom
      "[1:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,",
      "zoompan=z='min(zoom+0.0012,1.18)':d=90:s=1080x1920:fps=30,",
      "trim=duration=3,setsar=1,fade=t=in:st=0:d=0.3,fade=t=out:st=2.7:d=0.3[v1];",

      // Shot 3: product punch zoom
      "[2:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,",
      "zoompan=z='min(zoom+0.0022,1.32)':d=90:s=1080x1920:fps=30,",
      "trim=duration=3,setsar=1,fade=t=in:st=0:d=0.3,fade=t=out:st=2.7:d=0.3[v2];",

      // Shot 4: actor end card
      "[3:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,",
      "zoompan=z='min(zoom+0.0010,1.12)':d=75:s=1080x1920:fps=30,",
      "trim=duration=2.5,setsar=1,fade=t=in:st=0:d=0.3[v3];",

      // concat to one video stream
      "[v0][v1][v2][v3]concat=n=4:v=1:a=0,format=yuv420p[v]"
    ].join(""),

    "-map", "[v]",
    "-r", "30",
    "-c:v", "libx264",
    "-pix_fmt", "yuv420p",
    outPath,
  ];

  console.log("[Day18][Video] rendering mp4...");
  await runFfmpeg(args, { logPrefix: "[Day18][FFmpeg]" });

  // sanity check
  const stat = fs.statSync(outPath);
  console.log("[Day18][Video] outPath:", outPath, "size:", stat.size);

  return { outPath, tmpDir };
}
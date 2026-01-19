import { spawn } from "child_process";
import path from "path";

export function getFfmpegPath() {
  // your project-local binary
  return path.resolve(process.cwd(), "backend/ffmpeg/ffmpeg");
}

export function runFfmpeg(args, { logPrefix = "[FFmpeg]" } = {}) {
  return new Promise((resolve, reject) => {
    const ffmpegPath = getFfmpegPath();
    console.log(logPrefix, "bin:", ffmpegPath);
    console.log(logPrefix, "args:", args.join(" "));

    const p = spawn(ffmpegPath, args, { stdio: ["ignore", "pipe", "pipe"] });

    p.stdout.on("data", (d) => console.log(logPrefix, "stdout:", d.toString()));
    p.stderr.on("data", (d) => console.log(logPrefix, "stderr:", d.toString()));

    p.on("error", (err) => reject(err));
    p.on("close", (code) => {
      if (code === 0) return resolve(true);
      reject(new Error(`FFmpeg failed with exit code ${code}`));
    });
  });
}
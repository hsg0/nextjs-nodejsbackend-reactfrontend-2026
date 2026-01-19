// backend/utils/day18utils/downloadFile.js
import fs from "fs";
import path from "path";
import http from "http";
import https from "https";

function getClient(url) {
  return url.startsWith("https:") ? https : http;
}

export async function downloadFile(url, destPath, { logPrefix = "[Day18][DL]" } = {}) {
  if (!url) throw new Error("downloadFile: missing url");
  if (!destPath) throw new Error("downloadFile: missing destPath");

  fs.mkdirSync(path.dirname(destPath), { recursive: true });

  return new Promise((resolve, reject) => {
    const client = getClient(url);

    console.log(logPrefix, "GET", url);
    const req = client.get(url, (res) => {
      // Handle redirects
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        const nextUrl = res.headers.location.startsWith("http")
          ? res.headers.location
          : new URL(res.headers.location, url).toString();

        console.log(logPrefix, "redirect ->", nextUrl);
        res.resume();
        downloadFile(nextUrl, destPath, { logPrefix }).then(resolve).catch(reject);
        return;
      }

      if (res.statusCode !== 200) {
        const msg = `downloadFile failed: ${res.statusCode} ${res.statusMessage}`;
        res.resume();
        return reject(new Error(msg));
      }

      const fileStream = fs.createWriteStream(destPath);
      res.pipe(fileStream);

      fileStream.on("finish", () => {
        fileStream.close(() => resolve(destPath));
      });

      fileStream.on("error", (err) => {
        try { fs.unlinkSync(destPath); } catch {}
        reject(err);
      });
    });

    req.on("error", reject);
    req.setTimeout(30000, () => {
      req.destroy(new Error("downloadFile timeout (30s)"));
    });
  });
}
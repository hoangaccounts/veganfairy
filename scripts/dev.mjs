import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const root = process.cwd();
const dist = path.join(root, "dist");
const port = Number(process.env.PORT || 4173);
const types = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".jpg": "image/jpeg", ".png": "image/png", ".svg": "image/svg+xml", ".xml": "application/xml", ".txt": "text/plain; charset=utf-8" };

execFileSync(process.execPath, ["scripts/build.mjs"], { stdio: "inherit" });

http.createServer((req, res) => {
  const clean = decodeURIComponent(new URL(req.url, `http://${req.headers.host}`).pathname);
  let target = path.join(dist, clean);
  if (clean.endsWith("/")) target = path.join(target, "index.html");
  if (!path.extname(target) && fs.existsSync(`${target}/index.html`)) target = `${target}/index.html`;
  if (!target.startsWith(dist) || !fs.existsSync(target) || fs.statSync(target).isDirectory()) target = path.join(dist, "404.html");
  const ext = path.extname(target);
  res.writeHead(target.endsWith("404.html") ? 404 : 200, { "Content-Type": types[ext] || "application/octet-stream", "Cache-Control": "no-cache" });
  fs.createReadStream(target).pipe(res);
}).listen(port, "127.0.0.1", () => console.log(`Local: http://127.0.0.1:${port}/`));

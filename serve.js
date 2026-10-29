/**
 * 本地预览服务器（零依赖，仅用于自己电脑上查看效果）
 * 运行：node serve.js   然后浏览器打开 http://localhost:4000
 * 上线不需要它 —— 线上用 Cloudflare Pages / Vercel 托管
 */
const http = require("http");
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "dist");
const PORT = Number(process.env.PORT || 4000);
const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".yml": "text/yaml; charset=utf-8",
};

http
  .createServer((req, res) => {
    let urlPath = decodeURIComponent(req.url.split("?")[0]);
    if (urlPath.endsWith("/")) urlPath += "index.html";
    let file = path.join(ROOT, urlPath);

    if (!file.startsWith(ROOT)) {
      res.writeHead(403).end("Forbidden");
      return;
    }
    if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      const notFound = path.join(ROOT, "404.html");
      if (fs.existsSync(notFound)) file = notFound;
      else {
        res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
        res.end("<h1>404</h1><p>页面不存在。请先运行 <code>node generate.js</code> 生成 dist 目录。</p>");
        return;
      }
    }
    res.writeHead(200, { "Content-Type": TYPES[path.extname(file).toLowerCase()] || "application/octet-stream" });
    fs.createReadStream(file).pipe(res);
  })
  .listen(PORT, () => console.log(`\n▶ 本地预览：http://localhost:${PORT}\n  后台预览：http://localhost:${PORT}/admin/\n`));

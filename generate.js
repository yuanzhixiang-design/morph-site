/**
 * CIRCAFORM 官网构建脚本（零依赖）
 * ------------------------------------------------------------------
 * 读 content/ 里的所有内容 → 生成 dist/ 里的一整套静态页面
 *
 * 页面清单：
 *   dist/index.html                首页
 *   dist/works/index.html          作品列表
 *   dist/works/<文件名>/           每个案例一页
 *   dist/insights/index.html       洞察列表
 *   dist/insights/<文件名>/        每篇文章一页
 *   dist/method/index.html         方法
 *   dist/about/index.html          关于
 *   dist/contact/index.html        联系
 *
 * 运行：node generate.js
 * ------------------------------------------------------------------
 */
const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const OUT = path.join(ROOT, "dist");
const P = (...s) => path.join(ROOT, ...s);

const homePage = require("./build/home");
const sub = require("./build/subpages");
const { esc, layout } = require("./build/helpers");

const readJson = (p) => JSON.parse(fs.readFileSync(p, "utf8"));

/** 读一个文件夹里的所有 json，文件名就是 slug */
function readCollection(dir) {
  const full = P("content", dir);
  if (!fs.existsSync(full)) return [];
  return fs
    .readdirSync(full)
    .filter((f) => f.endsWith(".json"))
    .map((f) => {
      const data = readJson(path.join(full, f));
      const slug = data.code || f.replace(/\.json$/, "");
      return { ...data, slug };
    })
    .sort((a, b) => {
      const oa = a.order ?? 999;
      const ob = b.order ?? 999;
      if (oa !== ob) return oa - ob;
      return a.slug.localeCompare(b.slug);
    });
}

/* ---------------- 读取内容 ---------------- */
const site = readJson(P("content/home.json"));
const pages = {
  method: readJson(P("content/pages/method.json")),
  about: readJson(P("content/pages/about.json")),
  contact: readJson(P("content/pages/contact.json")),
};
const works = readCollection("works");
const insights = readCollection("insights");

/* ---------------- 写文件 ---------------- */
const written = [];
function writePage(relPath, html) {
  const full = path.join(OUT, relPath);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, html, "utf8");
  written.push(relPath);
}

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const f of fs.readdirSync(src)) {
    const s = path.join(src, f);
    const d = path.join(dest, f);
    if (fs.statSync(s).isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}

/* ---------------- 清空输出 ---------------- */
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

/* ---------------- 首页 ---------------- */
writePage("index.html", homePage(site, 0));

/* ---------------- 作品 ---------------- */
writePage("works/index.html", sub.worksIndex(site, site.worksPage, works, 1));
for (const w of works) {
  writePage(path.join("works", w.slug, "index.html"), sub.workDetail(site, w, works, 2));
}

/* ---------------- 洞察 ---------------- */
writePage("insights/index.html", sub.insightsIndex(site, site.insightsPage, insights, 1));
for (const p of insights) {
  writePage(path.join("insights", p.slug, "index.html"), sub.insightDetail(site, p, insights, 2));
}

/* ---------------- 单页 ---------------- */
writePage("method/index.html", sub.methodPage(site, pages.method, 1));
writePage("about/index.html", sub.aboutPage(site, pages.about, 1));
writePage("contact/index.html", sub.contactPage(site, pages.contact, 1));

/* ---------------- 404 ---------------- */
writePage(
  "404.html",
  layout({
    site,
    depth: 0,
    seo: { title: "页面不存在 — " + site.brand.nameEn, description: "" },
    body: `
  <section class="page-hero page-hero--center">
    <span class="eyebrow">404</span>
    <h1 class="page-title">这一页不在。</h1>
    <p class="page-lead">链接可能改过了，或者产品还没发布。</p>
    <p class="hero-actions"><a class="btn-solid" href="/">回到首页</a></p>
  </section>`,
  })
);

/* ---------------- 静态资源 ---------------- */
fs.mkdirSync(path.join(OUT, "assets"), { recursive: true });
fs.copyFileSync(P("src/styles.css"), path.join(OUT, "assets/styles.css"));
copyDir(P("src/assets/images"), path.join(OUT, "assets/images"));
if (fs.existsSync(P("admin"))) copyDir(P("admin"), path.join(OUT, "admin"));

/* ---------------- 报告 ---------------- */
console.log("✅ 构建完成 → dist/");
console.log(`   页面 ${written.length} 个：`);
written.forEach((f) => console.log("     · " + f));
console.log(`   案例 ${works.length} 个 / 文章 ${insights.length} 篇`);
console.log("   本地预览：npm run dev  →  http://localhost:4000");
if (!works.length) console.log("   ⚠️ content/works/ 还是空的");

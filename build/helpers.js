/**
 * 公共工具 —— 所有页面共用的函数
 *  ├─ esc / asset / url：处理转义与相对路径（子目录页面要用 ../ 回退）
 *  ├─ md：极简 Markdown 转 HTML（正文用）
 *  └─ layout：统一的外壳（head + 导航 + 页脚 + 交互脚本）
 */

const esc = (s = "") =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

/** 页面层级：0=首页，1=/works/，2=/works/xxx/ */
const rootPrefix = (depth = 0) => (depth > 0 ? "../".repeat(depth) : "");

/** 把内容里写的链接，转成当前页面能用的链接 */
const url = (href = "", depth = 0) => {
  const h = String(href || "").trim();
  if (!h) return url("#top", depth);
  if (/^(https?:|mailto:|tel:)/i.test(h)) return h;
  if (h.startsWith("#")) return depth === 0 ? h : `${rootPrefix(depth)}index.html${h}`;
  if (h.startsWith("/")) return `${rootPrefix(depth)}${h.slice(1)}`;
  return `${rootPrefix(depth)}${h}`;
};

/** 把内容里写的图片路径，转成当前页面能用的路径 */
const asset = (p = "", depth = 0) => {
  const v = String(p || "").trim();
  if (!v) return "";
  if (/^(https?:|data:)/i.test(v)) return v;
  if (v.startsWith("/")) return v;
  return `${rootPrefix(depth)}${v}`;
};

const arrow = (color = "#8A8A87") =>
  `<svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M1.5 7H12M12 7L7.75 2.75M12 7L7.75 11.25" stroke="${color}" stroke-width="1.1" stroke-linecap="square"/></svg>`;

/* ---------------- 极简 Markdown ---------------- */
const inline = (t = "", depth = 0) =>
  esc(t)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[^*])\*([^*\n]+)\*/g, "$1<em>$2</em>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, txt, href) => `<a href="${url(href, depth)}">${txt}</a>`)
    .replace(/\n/g, "<br>");

const md = (source = "", depth = 0) => {
  if (!source) return "";
  const blocks = String(source).replace(/\r\n/g, "\n").trim().split(/\n{2,}/);
  return blocks
    .map((raw) => {
      const b = raw.trim();
      if (!b) return "";

      const img = b.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
      if (img) {
        return `<figure class="md-figure"><img src="${asset(img[2], depth)}" alt="${esc(img[1])}" loading="lazy"></figure>`;
      }
      if (/^###\s/.test(b)) return `<h3>${inline(b.replace(/^###\s/, ""), depth)}</h3>`;
      if (/^##\s/.test(b)) return `<h2>${inline(b.replace(/^##\s/, ""), depth)}</h2>`;
      if (/^#{1}\s/.test(b)) return `<h2>${inline(b.replace(/^#\s/, ""), depth)}</h2>`;
      if (/^>\s?/.test(b)) return `<blockquote>${inline(b.replace(/^>\s?/gm, ""), depth)}</blockquote>`;
      if (/^[-*]\s/.test(b)) {
        const lis = b
          .split("\n")
          .filter((l) => /^[-*]\s/.test(l.trim()))
          .map((l) => `<li>${inline(l.trim().replace(/^[-*]\s/, ""), depth)}</li>`)
          .join("");
        return `<ul>${lis}</ul>`;
      }
      if (/^\d+\.\s/.test(b)) {
        const lis = b
          .split("\n")
          .filter((l) => /^\d+\.\s/.test(l.trim()))
          .map((l) => `<li>${inline(l.trim().replace(/^\d+\.\s/, ""), depth)}</li>`)
          .join("");
        return `<ol>${lis}</ol>`;
      }
      return `<p>${inline(b, depth)}</p>`;
    })
    .filter(Boolean)
    .join("\n");
};

/* ---------------- 导航 / 页脚 ---------------- */
const renderNav = (site, depth, active) => `
  <header class="site-header" id="top">
    <a class="brand" href="${url("/", depth)}">
      <span class="brand-en">${esc(site.brand.nameEn)}</span>
      <span class="brand-cn">${esc(site.brand.nameCn)}</span>
    </a>
    <nav class="site-nav" id="siteNav">
      ${site.nav.items
        .map((i) => {
          const isOn = active && i.href === active;
          return `<a href="${url(i.href, depth)}"${isOn ? ' class="is-active" aria-current="page"' : ""}>${esc(i.label)}</a>`;
        })
        .join("\n      ")}
    </nav>
    <button class="nav-toggle" id="navToggle" aria-label="打开菜单" aria-expanded="false">
      <i></i><i></i><i></i>
    </button>
  </header>`;

const renderFooter = (site, depth) => {
  const f = site.footer;
  return `
  <footer class="site-footer">
    <div class="footer-top">
      <div class="footer-brand">
        <span class="footer-wordmark">${esc(f.wordmark)}</span>
        <p>${esc(f.tagline)}</p>
      </div>
      <div class="footer-cols">
        ${f.columns
          .map(
            (col) => `
        <div class="footer-col">
          <h4>${esc(col.heading)}</h4>
          ${col.links
            .map((l) => `<a href="${url(l.href || "#top", depth)}">${esc(l.text || l)}</a>`)
            .join("\n          ")}
        </div>`
          )
          .join("")}
      </div>
    </div>
    <span class="ghost-wordmark" aria-hidden="true">${esc(f.wordmark)}</span>
    <div class="footer-divider"></div>
    <div class="footer-bottom">
      <span>${esc(f.copyright)}</span>
      <div class="footer-legal">
        <a href="${url("#top", depth)}">${esc(f.icp)}</a>
        ${f.legal.map((l) => `<a href="${url(l.href || "#top", depth)}">${esc(l.text || l)}</a>`).join("")}
      </div>
    </div>
  </footer>`;
};

/* ---------------- 联系转化区（多个页面复用） ---------------- */
const renderCta = (site, depth) => {
  const c = site.cta;
  return `
  <section class="cta" id="contact-cta">
    <span class="eyebrow reveal">${esc(c.eyebrow)}</span>
    <h2 class="cta-title reveal">${c.title.split("\n").map((l) => `<span class="cta-line">${esc(l)}</span>`).join("")}</h2>
    <div class="cta-bottom reveal">
      <a class="btn-solid" href="${url(c.buttonHref, depth)}">${esc(c.buttonText)}</a>
      <div class="cta-info">
        <a href="mailto:${esc(c.email)}">${esc(c.email)}</a>
        <a href="tel:${esc(String(c.phone).replace(/\s/g, ""))}">${esc(c.phone)}</a>
        <p class="addr">${esc(c.address)}</p>
      </div>
    </div>
  </section>`;
};

/* ---------------- 页面外壳 ---------------- */
const layout = ({ site, depth = 0, seo = {}, active = "", body = "", ogImage = "" }) => {
  const title = seo.title || site.seo.title;
  const desc = seo.description || site.seo.description;
  const og = asset(ogImage || site.hero.image, depth);
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:type" content="website">
<meta property="og:image" content="${esc(og)}">
<meta name="theme-color" content="#0A0A0A">
<script>document.documentElement.classList.add('js');</script>
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' rx='7' fill='%230A0A0A'/><circle cx='16' cy='16' r='8.5' fill='none' stroke='%23F5F5F3' stroke-width='2.5'/><circle cx='16' cy='16' r='2.5' fill='%23F5F5F3'/></svg>">
<link rel="stylesheet" href="${rootPrefix(depth)}assets/styles.css">
</head>
<body>
<div class="wrap">
${renderNav(site, depth, active)}
${body}
${renderFooter(site, depth)}
</div>
<script>
const hd = document.querySelector('.site-header');
const onScroll = () => hd.classList.toggle('is-scrolled', window.scrollY > 8);
onScroll(); window.addEventListener('scroll', onScroll, { passive: true });

const tg = document.getElementById('navToggle');
tg.addEventListener('click', () => {
  const open = document.body.classList.toggle('nav-open');
  tg.setAttribute('aria-expanded', String(open));
});
document.querySelectorAll('.site-nav a').forEach(a =>
  a.addEventListener('click', () => {
    document.body.classList.remove('nav-open');
    tg.setAttribute('aria-expanded', 'false');
  })
);

const io = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
document.querySelectorAll('.reveal').forEach((el, i) => {
  el.style.transitionDelay = (i % 4) * 70 + 'ms';
  io.observe(el);
});
</script>
</body>
</html>`;
};

module.exports = { esc, url, asset, arrow, md, layout, renderCta, renderNav, renderFooter };

/** 二级页面渲染：作品列表 / 作品详情 / 洞察列表 / 洞察详情 / 方法 / 关于 / 联系 */
const { esc, url, asset, arrow, md, layout, renderCta } = require("./helpers");

/* ---------- 通用：页面头 ---------- */
const pageHero = (h, extra = "") => `
  <section class="page-hero">
    <span class="eyebrow reveal">${esc(h.eyebrow)}</span>
    <h1 class="page-title reveal">${esc(h.title)}</h1>
    ${h.lead ? `<p class="page-lead reveal">${esc(h.lead)}</p>` : ""}
    ${extra}
  </section>`;

const backLink = (href, text, depth) =>
  `<a class="back-link" href="${url(href, depth)}"><svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M12.5 7H2M2 7L6.25 2.75M2 7L6.25 11.25" stroke="#8A8A87" stroke-width="1.1" stroke-linecap="square"/></svg>${esc(text)}</a>`;

/* =========================================================
   作品列表
   ========================================================= */
const worksIndex = (site, page, works, depth = 1) => {
  const industries = [...new Set(works.map((w) => w.industry).filter(Boolean))];
  const body = `
  ${pageHero(page.hero)}
  <section class="section section--tight">
    <div class="filter-row reveal" data-filter>
      <button class="filter-chip is-active" data-industry="all">全部</button>
      ${industries.map((i) => `<button class="filter-chip" data-industry="${esc(i)}">${esc(i)}</button>`).join("")}
    </div>
    <div class="works-grid" id="worksGrid">
      ${works
        .map(
          (w, i) => `
      <a class="work-card reveal" href="../works/${esc(w.slug)}/" data-industry="${esc(w.industry || "")}">
        <div class="work-card-media"><img src="${asset(w.cover, depth)}" alt="${esc(w.title)}" loading="lazy"></div>
        <div class="work-card-meta">
          <div class="work-card-top">
            <span class="work-card-index">${String(i + 1).padStart(2, "0")}</span>
            <span class="work-card-tag">${esc(w.industry)}${w.year ? ` · ${esc(w.year)}` : ""}</span>
          </div>
          <h2 class="work-card-title">${esc(w.title)}</h2>
          <p class="work-card-desc">${esc(w.tagline)}</p>
        </div>
      </a>`
        )
        .join("")}
    </div>
    <p class="grid-empty" id="gridEmpty" hidden>这个分类下还没有公开案例。</p>
  </section>
  ${renderCta(site, depth)}
  <script>
  (function () {
    const chips = document.querySelectorAll('[data-filter] .filter-chip');
    const cards = document.querySelectorAll('#worksGrid .work-card');
    const empty = document.getElementById('gridEmpty');
    chips.forEach(chip => chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('is-active'));
      chip.classList.add('is-active');
      const want = chip.dataset.industry;
      let shown = 0;
      cards.forEach(c => {
        const hit = want === 'all' || c.dataset.industry === want;
        c.hidden = !hit;
        if (hit) shown++;
      });
      empty.hidden = shown > 0;
    }));
  })();
  </script>`;
  return layout({ site, depth, seo: page.seo, active: "/works/", body, ogImage: works[0] ? works[0].cover : "" });
};

/* =========================================================
   作品详情
   ========================================================= */
const workDetail = (site, work, all, depth = 2) => {
  const idx = all.findIndex((w) => w.slug === work.slug);
  const prev = idx > 0 ? all[idx - 1] : all[all.length - 1];
  const next = idx < all.length - 1 ? all[idx + 1] : all[0];
  const seo = {
    title: `${work.title} — ${site.brand.fullNameCn} ${site.brand.nameEn}`,
    description: work.tagline || site.seo.description,
  };
  const body = `
  <article class="case">
    <div class="case-back">${backLink("/works/", "全部作品", depth)}</div>
    <header class="case-head">
      <span class="eyebrow reveal">${esc(work.industry)}${work.year ? ` · ${esc(work.year)}` : ""}</span>
      <h1 class="case-title reveal">${esc(work.title)}</h1>
      <p class="case-tagline reveal">${esc(work.tagline)}</p>
    </header>
    <div class="case-cover reveal"><img src="${asset(work.cover, depth)}" alt="${esc(work.title)}" loading="eager"></div>
    ${
      work.meta && work.meta.length
        ? `<dl class="case-meta reveal">
      ${work.meta
        .map(
          (m) => `
      <div class="case-meta-item">
        <dt>${esc(m.label)}</dt>
        <dd>${esc(m.value)}</dd>
      </div>`
        )
        .join("")}
    </dl>`
        : ""
    }
    <div class="case-body prose reveal">${md(work.body, depth)}</div>
    ${
      work.gallery && work.gallery.length
        ? `<div class="case-gallery">
      ${work.gallery
        .map((g) => {
          const src = typeof g === "string" ? g : g.image;
          const cap = typeof g === "string" ? "" : g.caption || "";
          return `<figure class="case-gallery-item reveal"><img src="${asset(src, depth)}" alt="${esc(cap || work.title)}" loading="lazy">${
            cap ? `<figcaption>${esc(cap)}</figcaption>` : ""
          }</figure>`;
        })
        .join("")}
    </div>`
        : ""
    }
    <nav class="pager">
      <a class="pager-item" href="../${esc(prev.slug)}/">
        <span class="pager-label">上一个案例</span>
        <span class="pager-title">${esc(prev.title)}</span>
      </a>
      <a class="pager-item pager-item--next" href="../${esc(next.slug)}/">
        <span class="pager-label">下一个案例</span>
        <span class="pager-title">${esc(next.title)}</span>
      </a>
    </nav>
  </article>
  ${renderCta(site, depth)}`;
  return layout({ site, depth, seo, active: "/works/", body, ogImage: work.cover });
};

/* =========================================================
   洞察列表
   ========================================================= */
const insightsIndex = (site, page, posts, depth = 1) => {
  const body = `
  ${pageHero(page.hero)}
  <section class="section section--tight">
    <div class="insight-list insight-list--big">
      ${posts
        .map(
          (p) => `
      <a class="insight-row reveal" href="../insights/${esc(p.slug)}/">
        <div class="insight-thumb"><img src="${asset(p.cover, depth)}" alt="${esc(p.title)}" loading="lazy"></div>
        <div class="insight-mid">
          <span class="insight-tag">${esc(p.category)}</span>
          <h2 class="insight-title">${esc(p.title)}</h2>
          ${p.excerpt ? `<p class="insight-excerpt">${esc(p.excerpt)}</p>` : ""}
        </div>
        <span class="insight-date">${esc(p.date)}</span>
      </a>`
        )
        .join("")}
    </div>
  </section>
  ${renderCta(site, depth)}`;
  return layout({ site, depth, seo: page.seo, active: "/insights/", body });
};

/* =========================================================
   洞察详情
   ========================================================= */
const insightDetail = (site, post, all, depth = 2) => {
  const idx = all.findIndex((p) => p.slug === post.slug);
  const prev = idx < all.length - 1 ? all[idx + 1] : null;
  const next = idx > 0 ? all[idx - 1] : null;
  const seo = {
    title: `${post.title} — ${site.brand.nameEn} 洞察`,
    description: post.excerpt || site.seo.description,
  };
  const body = `
  <article class="case">
    <div class="case-back">${backLink("/insights/", "全部洞察", depth)}</div>
    <header class="case-head">
      <span class="eyebrow reveal">${esc(post.category)}${post.date ? ` · ${esc(post.date)}` : ""}</span>
      <h1 class="case-title case-title--article reveal">${esc(post.title)}</h1>
      ${post.excerpt ? `<p class="case-tagline reveal">${esc(post.excerpt)}</p>` : ""}
    </header>
    ${post.cover ? `<div class="case-cover reveal"><img src="${asset(post.cover, depth)}" alt="${esc(post.title)}" loading="eager"></div>` : ""}
    <div class="case-body prose prose--article reveal">${md(post.body, depth)}</div>
    <nav class="pager">
      ${
        prev
          ? `<a class="pager-item" href="../${esc(prev.slug)}/"><span class="pager-label">上一篇</span><span class="pager-title">${esc(prev.title)}</span></a>`
          : `<span class="pager-item pager-item--void"></span>`
      }
      ${
        next
          ? `<a class="pager-item pager-item--next" href="../${esc(next.slug)}/"><span class="pager-label">下一篇</span><span class="pager-title">${esc(next.title)}</span></a>`
          : `<span class="pager-item pager-item--void"></span>`
      }
    </nav>
  </article>
  ${renderCta(site, depth)}`;
  return layout({ site, depth, seo, active: "/insights/", body, ogImage: post.cover });
};

/* =========================================================
   方法页
   ========================================================= */
const methodPage = (site, page, depth = 1) => {
  const body = `
  ${pageHero(page.hero)}
  <section class="section section--tight">
    <div class="flow">
      ${page.steps
        .map(
          (s) => `
      <div class="flow-row reveal">
        <div class="flow-left">
          <span class="flow-num">${esc(s.num)}</span>
          <h2 class="flow-title">${esc(s.title)}</h2>
        </div>
        <div class="flow-right">
          <p class="flow-desc">${esc(s.desc)}</p>
          ${
            s.deliverables && s.deliverables.length
              ? `<div class="tag-row">${s.deliverables.map((t) => `<span class="tag">${esc(t)}</span>`).join("")}</div>`
              : ""
          }
        </div>
      </div>`
        )
        .join("")}
    </div>
  </section>
  <section class="section">
    <div class="section-head reveal">
      <div class="titles">
        <span class="eyebrow">${esc(page.services.eyebrow)}</span>
        <h2 class="section-title">${esc(page.services.title)}</h2>
      </div>
      ${page.services.desc ? `<p class="section-sub">${esc(page.services.desc)}</p>` : ""}
    </div>
    <div class="service-list">
      ${page.services.items
        .map(
          (it, i) => `
      <div class="service-row reveal">
        <span class="service-num">${String(i + 1).padStart(2, "0")}</span>
        <h3 class="service-name">${esc(it.name)}</h3>
        <p class="service-desc">${esc(it.desc)}</p>
      </div>`
        )
        .join("")}
    </div>
  </section>
  ${renderCta(site, depth)}`;
  return layout({ site, depth, seo: page.seo, active: "/method/", body });
};

/* =========================================================
   关于页
   ========================================================= */
const aboutPage = (site, page, depth = 1) => {
  const body = `
  ${pageHero(page.hero)}
  ${
    page.stats && page.stats.length
      ? `<section class="stats-bar">
    ${page.stats
      .map(
        (s) => `
    <div class="stat reveal">
      <span class="stat-num">${esc(s.num)}</span>
      <span class="stat-label">${esc(s.label)}</span>
    </div>`
      )
      .join("")}
  </section>`
      : ""
  }
  <section class="section section--tight">
    <div class="section-head reveal">
      <div class="titles">
        <span class="eyebrow">${esc(page.intro.eyebrow)}</span>
        <h2 class="section-title">${esc(page.intro.title)}</h2>
      </div>
    </div>
    <div class="about-intro prose reveal">${md(page.intro.body, depth)}</div>
  </section>
  ${
    page.team && page.team.members && page.team.members.length
      ? `<section class="section">
    <div class="section-head reveal">
      <div class="titles">
        <span class="eyebrow">${esc(page.team.eyebrow)}</span>
        <h2 class="section-title">${esc(page.team.title)}</h2>
      </div>
      ${page.team.desc ? `<p class="section-sub">${esc(page.team.desc)}</p>` : ""}
    </div>
    <div class="team-grid">
      ${page.team.members
        .map(
          (m) => `
      <div class="team-card reveal">
        <h3 class="team-name">${esc(m.name)}</h3>
        <span class="team-role">${esc(m.role)}</span>
        <p class="team-bio">${esc(m.bio)}</p>
      </div>`
        )
        .join("")}
    </div>
  </section>`
      : ""
  }
  ${
    page.awards && page.awards.items && page.awards.items.length
      ? `<section class="section">
    <div class="section-head reveal">
      <div class="titles">
        <span class="eyebrow">${esc(page.awards.eyebrow)}</span>
        <h2 class="section-title">${esc(page.awards.title)}</h2>
      </div>
    </div>
    <div class="award-list">
      ${page.awards.items
        .map(
          (a) => `
      <div class="award-row reveal">
        <span class="award-year">${esc(a.year)}</span>
        <span class="award-name">${esc(a.name)}</span>
        <span class="award-project">${esc(a.project)}</span>
      </div>`
        )
        .join("")}
    </div>
  </section>`
      : ""
  }
  ${
    page.clients && page.clients.items && page.clients.items.length
      ? `<section class="section">
    <div class="section-head reveal">
      <div class="titles">
        <span class="eyebrow">${esc(page.clients.eyebrow)}</span>
        <h2 class="section-title">${esc(page.clients.title)}</h2>
      </div>
    </div>
    <div class="client-grid reveal">
      ${page.clients.items.map((c) => `<span class="client-name">${esc(c)}</span>`).join("")}
    </div>
  </section>`
      : ""
  }
  ${renderCta(site, depth)}`;
  return layout({ site, depth, seo: page.seo, active: "/about/", body });
};

/* =========================================================
   联系页
   ========================================================= */
const contactPage = (site, page, depth = 1) => {
  const body = `
  ${pageHero(page.hero)}
  <section class="section section--tight">
    <div class="contact-grid">
      <div class="contact-channels reveal">
        ${page.channels
          .map(
            (c) => `
        <div class="contact-channel">
          <span class="contact-label">${esc(c.label)}</span>
          ${c.href ? `<a class="contact-value" href="${url(c.href, depth)}">${esc(c.value)}</a>` : `<span class="contact-value">${esc(c.value)}</span>`}
          ${c.note ? `<span class="contact-note">${esc(c.note)}</span>` : ""}
        </div>`
          )
          .join("")}
        ${
          page.studio
            ? `<div class="contact-channel">
          <span class="contact-label">工作室</span>
          <span class="contact-value contact-value--plain">${esc(page.studio.address)}</span>
          <span class="contact-note">${esc(page.studio.hours)}</span>
        </div>`
            : ""
        }
        ${
          page.wechatQr
            ? `<div class="contact-channel contact-channel--qr">
          <span class="contact-label">${esc(page.wechatQr.label || "企业微信")}</span>
          <img class="contact-qr" src="${url(page.wechatQr.image, depth)}" alt="企业微信二维码" width="140" height="140">
          ${page.wechatQr.note ? `<span class="contact-note">${esc(page.wechatQr.note)}</span>` : ""}
        </div>`
            : ""
        }
      </div>
      <div class="contact-form-wrap reveal">
        <span class="eyebrow">${esc(page.form.eyebrow)}</span>
        <h2 class="contact-form-title">${esc(page.form.title)}</h2>
        <form class="contact-form" action="${esc(page.form.action)}" method="POST">
          <div class="field">
            <label for="f-name">怎么称呼</label>
            <input id="f-name" name="称呼" type="text" placeholder="你的名字 / 公司" required>
          </div>
          <div class="field">
            <label for="f-contact">联系方式</label>
            <input id="f-contact" name="联系方式" type="text" placeholder="邮箱或手机号" required>
          </div>
          <div class="field">
            <label for="f-msg">想做什么产品</label>
            <textarea id="f-msg" name="需求描述" rows="4" placeholder="产品方向、大致时间、预算范围（有就写，没有也没关系）"></textarea>
          </div>
          <button class="btn-solid" type="submit">发出咨询</button>
          <p class="form-note">${esc(page.form.note)}</p>
        </form>
      </div>
    </div>
  </section>
  <section class="map-band reveal">
    ${
      page.map && page.map.embed
        ? `<iframe class="map-frame" src="${esc(page.map.embed)}" loading="lazy" title="工作室位置地图" allowfullscreen referrerpolicy="no-referrer-when-downgrade"></iframe>`
        : `<div class="map-inner">
      <span class="eyebrow">STUDIO</span>
      <p class="map-text">${esc(page.studio ? page.studio.address : site.cta.address)}</p>
      <span class="map-hint">地图占位 · 可替换为高德 / 百度地图嵌入代码</span>
    </div>`
    }
    ${
      page.map && page.map.embed
        ? `<div class="map-card">
      <span class="eyebrow">STUDIO</span>
      <p class="map-text">${esc(page.studio ? page.studio.address : site.cta.address)}</p>
      ${page.map.link ? `<a class="map-link" href="${esc(page.map.link)}" target="_blank" rel="noopener">${esc(page.map.linkText || "在高德地图中打开")} →</a>` : ""}
    </div>`
        : ""
    }
  </section>`;
  return layout({ site, depth, seo: page.seo, active: "/contact/", body });
};

module.exports = { worksIndex, workDetail, insightsIndex, insightDetail, methodPage, aboutPage, contactPage };

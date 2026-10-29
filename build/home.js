/** 首页渲染 */
const { esc, url, asset, arrow, layout } = require("./helpers");

const renderHero = (d, depth) => `
  <section class="hero">
    <div class="hero-meta">
      <span>${esc(d.hero.metaLeft)}</span>
      <span>${esc(d.hero.metaRight)}</span>
    </div>
    <h1 class="hero-h1">${esc(d.hero.headline)}</h1>
    <div class="hero-bottom">
      <p class="hero-desc">${esc(d.hero.desc)}</p>
      <div class="scroll-cue"><span>${esc(d.hero.scrollCue)}</span><i></i></div>
    </div>
  </section>
  <div class="hero-band">
    <img src="${asset(d.hero.image, depth)}" alt="${esc(d.brand.fullNameCn)} 产品设计" loading="eager">
  </div>`;

const renderFeatured = (d, depth) => `
  <section class="section" id="works">
    <div class="section-head reveal">
      <div class="titles">
        <span class="eyebrow">${esc(d.featured.eyebrow)}</span>
        <h2 class="section-title">${esc(d.featured.title)}</h2>
      </div>
      <a class="arrow-link" href="${url(d.featured.linkHref, depth)}">${esc(d.featured.linkText)}${arrow()}</a>
    </div>
    <div class="card-row">
      ${d.featured.items
        .map(
          (c) => `
      <a class="card reveal" href="${url(c.href || d.featured.linkHref, depth)}">
        <div class="card-media"><img src="${asset(c.image, depth)}" alt="${esc(c.title)}" loading="lazy"></div>
        <div class="card-meta">
          <span class="card-tag">${esc(c.tag)}</span>
          <h3 class="card-title">${esc(c.title)}</h3>
        </div>
      </a>`
        )
        .join("")}
    </div>
  </section>`;

const renderSelected = (d, depth) => `
  <section class="section">
    <div class="section-head reveal">
      <div class="titles">
        <span class="eyebrow">${esc(d.selected.eyebrow)}</span>
        <h2 class="section-title">${esc(d.selected.title)}</h2>
      </div>
      <p class="section-sub">${esc(d.selected.sub)}</p>
    </div>
    <figure class="work-figure reveal">
      <div class="work-media"><img src="${asset(d.selected.image, depth)}" alt="${esc(d.selected.title)}" loading="lazy"></div>
      <figcaption class="work-caption">
        <span class="work-meta">${esc(d.selected.meta)}</span>
        <a class="arrow-link" href="${url(d.selected.linkHref, depth)}">${esc(d.selected.linkText)}${arrow("#F5F5F3")}</a>
      </figcaption>
    </figure>
  </section>`;

const renderHow = (d, depth) => `
  <section class="section" id="how">
    <div class="section-head reveal">
      <div class="titles">
        <span class="eyebrow">${esc(d.how.eyebrow)}</span>
        <h2 class="section-title">${esc(d.how.title)}</h2>
      </div>
      <p class="section-sub">${esc(d.how.desc)}</p>
    </div>
    <div class="steps">
      ${d.how.steps
        .map(
          (s) => `
      <div class="step reveal">
        <span class="step-num">${esc(s.num)}</span>
        <h3 class="step-title">${esc(s.title)}</h3>
        <p class="step-desc">${esc(s.desc)}</p>
      </div>`
        )
        .join("")}
    </div>
  </section>`;

const renderPrinciples = (d) => `
  <section class="section" id="principles">
    <span class="eyebrow reveal">${esc(d.principles.eyebrow)}</span>
    <div class="principles-body">
      <h2 class="principles-statement reveal">${esc(d.principles.statement)}</h2>
      <div class="principle-list reveal">
        ${d.principles.items
          .map(
            (t, i) => `
        <div class="principle-item"><span>${String(i + 1).padStart(2, "0")}</span>${esc(t.text || t)}</div>`
          )
          .join("")}
      </div>
    </div>
  </section>`;

const renderInsights = (d, depth) => `
  <section class="section" id="insights">
    <div class="section-head reveal">
      <div class="titles">
        <span class="eyebrow">${esc(d.insights.eyebrow)}</span>
        <h2 class="section-title">${esc(d.insights.title)}</h2>
      </div>
      <a class="arrow-link" href="${url(d.insights.linkHref, depth)}">${esc(d.insights.linkText)}${arrow()}</a>
    </div>
    <div class="insight-list">
      ${d.insights.items
        .map(
          (i) => `
      <a class="insight-row reveal" href="${url(i.href || d.insights.linkHref, depth)}">
        <div class="insight-thumb"><img src="${asset(i.image, depth)}" alt="${esc(i.title)}" loading="lazy"></div>
        <div class="insight-mid">
          <span class="insight-tag">${esc(i.tag)}</span>
          <h3 class="insight-title">${esc(i.title)}</h3>
        </div>
        <span class="insight-date">${esc(i.date)}</span>
      </a>`
        )
        .join("")}
    </div>
  </section>`;

module.exports = (d, depth = 0) => {
  const body = [
    renderHero(d, depth),
    renderFeatured(d, depth),
    renderSelected(d, depth),
    renderHow(d, depth),
    renderPrinciples(d),
    renderInsights(d, depth),
    require("./helpers").renderCta(d, depth),
  ].join("\n");
  return layout({ site: d, depth, seo: d.seo, active: "/", body, ogImage: d.hero.image });
};

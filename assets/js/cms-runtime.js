(function () {
  "use strict";

  function getPageSlug() {
    const declared = document.body?.dataset.cmsPage;
    if (declared && declared !== "dynamic") return declared;
    const match = window.location.pathname.match(/^\/page\/([a-z0-9-]+)/i);
    return match ? match[1].toLowerCase() : "";
  }

  function isString(value) {
    return typeof value === "string";
  }

  function text(node, value, options = {}) {
    if (!node || !isString(value)) return false;
    const next = value.trim();
    if (!next && !options.allowEmpty) return false;
    node.textContent = next;
    return true;
  }

  function field(section, name) {
    return section.querySelector(`[data-cms-field="${name}"]`);
  }

  function textField(section, name, value) {
    const target = field(section, name);
    return target ? text(target, value, { allowEmpty: true }) : false;
  }

  function updateParagraphs(section, body) {
    if (!isString(body)) return;
    const parts = body.split(/\n\s*\n/).map((item) => item.trim()).filter(Boolean);
    if (!parts.length) return;
    let paragraphs = [...section.querySelectorAll(
      ":scope > .container > p, :scope > .container .section-copy > p, :scope > .container .hero-content > p, :scope > .container .section-heading > p, :scope > .container .kitchen-cta-card p, :scope > div > p"
    )].filter((p) => !p.closest("article") && !p.closest("form"));
    if (!paragraphs.length) paragraphs = [...section.querySelectorAll("p")].filter((p) => !p.closest("article") && !p.closest("form"));
    const parent = paragraphs[0]?.parentElement || section.querySelector(".container") || section;
    parts.forEach((part, index) => {
      let p = paragraphs[index];
      if (!p) {
        p = document.createElement("p");
        parent.append(p);
      }
      p.textContent = part;
    });
    paragraphs.slice(parts.length).forEach((p) => { if (!p.closest("form")) p.hidden = true; });
  }

  function itemCandidates(section) {
    const selectors = [
      ":scope [data-cms-item]",
      ":scope article",
      ":scope .service-card",
      ":scope .kitchen-feature",
      ":scope .home-metric",
      ":scope .client-logo-card",
      ":scope .home-service-tile",
      ":scope .home-kitchen-card",
      ":scope .home-sector-card",
      ":scope .kitchen-stat",
      ":scope .gallery-item",
      ":scope .photo-card",
      ":scope .related-kitchen-list > a"
    ];
    const result = [];
    const seen = new Set();
    selectors.forEach((selector) => {
      section.querySelectorAll(selector).forEach((node) => {
        if (!seen.has(node)) { seen.add(node); result.push(node); }
      });
    });
    return result;
  }

  function itemContainer(section, candidates) {
    return section.querySelector('[data-cms-list="items"]')
      || candidates[0]?.parentElement
      || section.querySelector(".service-list, .kitchen-feature-grid, .home-service-tiles, .home-kitchen-cards, .home-sector-grid, .kitchen-stats, .home-client-logos, .photo-grid, .photo-masonry, .container")
      || section;
  }

  function setItemCounter(node, index) {
    const value = String(index + 1).padStart(2, "0");
    const letter = String.fromCharCode(65 + (index % 26));
    const target = node.querySelector(".icon-box, .home-service-icon, .kitchen-feature > span");
    if (!target) return;
    target.textContent = target.classList.contains("icon-box") ? letter : value;
  }

  function updateItemNode(node, item, index) {
    node.hidden = false;
    node.dataset.cmsItem = String(index);
    setItemCounter(node, index);

    const titleTarget = node.querySelector('[data-cms-field="itemTitle"], h3, h4, strong') || (node.matches("a") ? node : null);
    text(titleTarget, item.title, { allowEmpty: true });
    text(node.querySelector('[data-cms-field="itemText"], p, .item-text, .home-metric span, .kitchen-stat span, small'), item.text, { allowEmpty: true });

    const image = node.querySelector('[data-cms-field="itemImage"], img');
    if (image && item.imageUrl) image.src = item.imageUrl;
    if (image && isString(item.imageAlt)) image.alt = item.imageAlt.trim();

    const link = node.matches("a") ? node : node.querySelector("a");
    if (link && item.linkUrl) link.href = item.linkUrl;
    if (link && item.linkLabel) text(link, item.linkLabel, { allowEmpty: true });
  }

  function createItemFromTemplate(section, candidates, index) {
    const template = candidates[candidates.length - 1];
    if (template) {
      const clone = template.cloneNode(true);
      clone.hidden = false;
      clone.dataset.cmsClonedItem = "true";
      template.parentElement?.append(clone);
      candidates.push(clone);
      return clone;
    }

    const container = itemContainer(section, candidates);
    const card = createItemCard({}, false);
    card.dataset.cmsClonedItem = "true";
    container.append(card);
    candidates.push(card);
    return card;
  }

  function applyItems(section, items) {
    if (!Array.isArray(items)) return;
    const candidates = itemCandidates(section);
    items.forEach((item, index) => {
      const node = candidates[index] || createItemFromTemplate(section, candidates, index);
      updateItemNode(node, item && typeof item === "object" ? item : {}, index);
    });
    candidates.slice(items.length).forEach((node) => {
      node.hidden = true;
    });
  }

  function applyContent(section, content) {
    if (!content || typeof content !== "object") return;
    if (!textField(section, "eyebrow", content.eyebrow)) text(section.querySelector(".eyebrow"), content.eyebrow);
    if (!textField(section, "title", content.title)) text(section.querySelector("h1, h2"), content.title);
    if (!textField(section, "body", content.body)) updateParagraphs(section, content.body);
    const image = field(section, "imageUrl") || section.querySelector("img");
    if (image && content.imageUrl) image.src = content.imageUrl;
    if (image && isString(content.imageAlt)) image.alt = content.imageAlt.trim();
    const button = field(section, "buttonLabel") || section.querySelector(".btn, .hero-actions a, .kitchen-cta a, a.button");
    if (button && content.buttonLabel) text(button, content.buttonLabel, { allowEmpty: true });
    if (button && content.buttonUrl) button.href = content.buttonUrl;
    applyItems(section, content.items);
  }

  function createItemCard(item, withImage) {
    const article = document.createElement("article");
    article.className = "cms-card reveal";
    if (withImage && item.imageUrl) {
      const img = document.createElement("img");
      img.dataset.cmsField = "itemImage";
      img.src = item.imageUrl;
      img.alt = item.imageAlt || item.title || "";
      article.append(img);
    }
    if (item.title) {
      const h3 = document.createElement("h3"); h3.dataset.cmsField = "itemTitle"; h3.textContent = item.title; article.append(h3);
    }
    if (item.text) {
      const p = document.createElement("p"); p.dataset.cmsField = "itemText"; p.textContent = item.text; article.append(p);
    }
    if (item.linkUrl) {
      const a = document.createElement("a"); a.href = item.linkUrl; a.textContent = item.linkLabel || "المزيد"; article.append(a);
    }
    return article;
  }

  function createGeneratedSection(sectionData) {
    const content = sectionData.content || {};
    const section = document.createElement("section");
    section.dataset.cmsSection = sectionData.sectionKey;
    section.dataset.cmsGenerated = "true";
    section.className = "section cms-generated-section";

    const container = document.createElement("div");
    container.className = "container";
    section.append(container);

    if (sectionData.sectionType === "hero") section.className = "page-hero cms-generated-section";
    if (sectionData.sectionType === "call_to_action") section.className = "kitchen-cta cms-generated-section";
    if (sectionData.sectionType === "metrics") section.className = "home-metrics-band cms-generated-section";

    const heading = document.createElement("div");
    heading.className = "section-heading centered-heading reveal";
    if (content.eyebrow) { const span = document.createElement("span"); span.className = "eyebrow"; span.dataset.cmsField = "eyebrow"; span.textContent = content.eyebrow; heading.append(span); }
    if (content.title) { const h2 = document.createElement(sectionData.sectionType === "hero" ? "h1" : "h2"); h2.dataset.cmsField = "title"; h2.textContent = content.title; heading.append(h2); }
    if (content.body) { const p = document.createElement("p"); p.dataset.cmsField = "body"; p.textContent = content.body; heading.append(p); }

    if (sectionData.sectionType === "text_and_image") {
      container.className = "container split cms-split";
      const copy = document.createElement("div"); copy.className = "section-copy reveal"; copy.append(...heading.childNodes);
      if (content.imageUrl) { const media = document.createElement("div"); media.className = "kitchen-media reveal"; const img = document.createElement("img"); img.src = content.imageUrl; img.alt = content.imageAlt || content.title || ""; media.append(img); container.append(media, copy); }
      else container.append(copy);
    } else if (["cards", "image_cards", "gallery", "logo_grid", "metrics"].includes(sectionData.sectionType)) {
      container.append(heading);
      const grid = document.createElement("div");
      grid.className = sectionData.sectionType === "metrics" ? "cms-metrics-grid" : sectionData.sectionType === "gallery" ? "cms-gallery-grid" : "cms-cards-grid";
      grid.dataset.cmsList = "items";
      (content.items || []).forEach((item, index) => {
        const card = createItemCard(item, ["image_cards", "gallery", "logo_grid"].includes(sectionData.sectionType));
        card.dataset.cmsItem = String(index);
        grid.append(card);
      });
      container.append(grid);
    } else {
      container.append(heading);
    }

    if (content.buttonLabel && content.buttonUrl) {
      const a = document.createElement("a"); a.className = "btn btn-primary cms-section-button"; a.href = content.buttonUrl; a.textContent = content.buttonLabel; container.append(a);
    }
    return section;
  }

  function applyPageMeta(page) {
    if (page.seoTitle) document.title = page.seoTitle;
    if (page.seoDescription) {
      let meta = document.querySelector('meta[name="description"]');
      if (!meta) { meta = document.createElement("meta"); meta.name = "description"; document.head.append(meta); }
      meta.content = page.seoDescription;
    }
  }

  function applySections(sections) {
    const main = document.querySelector("main");
    if (!main) return;
    const known = new Map([...main.querySelectorAll(":scope > section[data-cms-section]")].map((node) => [node.dataset.cmsSection, node]));
    const ordered = [];
    sections.forEach((sectionData) => {
      let node = known.get(sectionData.sectionKey);
      if (!node) node = createGeneratedSection(sectionData);
      node.hidden = !sectionData.isVisible;
      applyContent(node, sectionData.content);
      ordered.push(node);
    });
    ordered.forEach((node) => main.append(node));
    known.forEach((node, key) => {
      if (!sections.some((section) => section.sectionKey === key)) node.hidden = true;
    });
  }

  async function init() {
    const slug = getPageSlug();
    if (!slug) return;
    try {
      const apiUrl = `/api/cms/pages/${encodeURIComponent(slug)}?cms=${Date.now()}`;
      const response = await fetch(apiUrl, {
        cache: "no-store",
        headers: { Accept: "application/json", "Cache-Control": "no-cache" }
      });
      if (!response.ok) return;
      const data = await response.json();
      if (!data?.page || !Array.isArray(data.sections)) return;
      applyPageMeta(data.page);
      applySections(data.sections);
      document.documentElement.classList.add("cms-ready");
      document.dispatchEvent(new CustomEvent("nooha:cms-ready", { detail: data }));
    } catch {
      document.documentElement.classList.add("cms-fallback");
    }
  }


  if ("BroadcastChannel" in window) {
    const updates = new BroadcastChannel("nooha-cms-updates");
    updates.addEventListener("message", (event) => {
      const message = event.data;
      if (message?.type === "published" && message.slug === getPageSlug()) {
        window.location.reload();
      }
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();

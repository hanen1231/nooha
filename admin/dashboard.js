const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const sectionTemplates = [
  { type: "hero", name: "واجهة رئيسية", icon: "▰", content: { eyebrow: "نوهة", title: "عنوان رئيسي", body: "اكتب وصفًا مختصرًا للسكشن." } },
  { type: "text", name: "نص تعريفي", icon: "¶", content: { title: "عنوان السكشن", body: "اكتب المحتوى هنا." } },
  { type: "text_and_image", name: "نص وصورة", icon: "▣", content: { title: "عنوان السكشن", body: "اكتب المحتوى هنا.", imageUrl: "", imageAlt: "" } },
  { type: "cards", name: "بطاقات", icon: "▦", content: { title: "عنوان البطاقات", items: [{ title: "بطاقة 1", text: "وصف البطاقة" }, { title: "بطاقة 2", text: "وصف البطاقة" }, { title: "بطاقة 3", text: "وصف البطاقة" }] } },
  { type: "image_cards", name: "بطاقات صور", icon: "▧", content: { title: "عنوان البطاقات", items: [{ title: "عنصر 1", text: "وصف", imageUrl: "" }, { title: "عنصر 2", text: "وصف", imageUrl: "" }] } },
  { type: "metrics", name: "أرقام وإحصائيات", icon: "%", content: { title: "أرقامنا", items: [{ title: "+100", text: "عدد العملاء" }, { title: "+20", text: "مشروعًا" }, { title: "24/7", text: "دعم وتشغيل" }] } },
  { type: "gallery", name: "معرض صور", icon: "▥", content: { title: "معرض الصور", items: [{ imageUrl: "", imageAlt: "صورة 1" }, { imageUrl: "", imageAlt: "صورة 2" }] } },
  { type: "call_to_action", name: "دعوة للتواصل", icon: "→", content: { eyebrow: "تواصل معنا", title: "هل تحتاج إلى خدمتنا؟", body: "فريقنا جاهز لدراسة احتياجك.", buttonLabel: "تواصل معنا", buttonUrl: "/contact.html" } }
];

const sectionTypeLabels = Object.fromEntries(sectionTemplates.map((item) => [item.type, item.name]));
Object.assign(sectionTypeLabels, {
  form_and_text: "نموذج ونص",
  announcement: "شريط إعلان",
  logo_grid: "شعارات وشركاء"
});

const cmsUpdates = "BroadcastChannel" in window ? new BroadcastChannel("nooha-cms-updates") : null;

function freshPublicUrl(url) {
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}cms=${Date.now()}`;
}

const state = {
  session: null,
  pages: [],
  currentPage: null,
  sections: [],
  media: [],
  settings: {},
  settingsLoaded: false,
  orderDirty: false,
  editingSectionId: null,
  selectedTemplate: sectionTemplates[0].type,
  loading: false
};

const nodes = {
  message: $("#global-message"),
  email: $("#admin-email"),
  role: $("#admin-role"),
  pagesList: $("#pages-list"),
  pageSearch: $("#page-search"),
  overviewPages: $("#overview-pages"),
  sectionsList: $("#sections-list"),
  sectionsLoading: $("#sections-loading"),
  pageEmpty: $("#page-empty"),
  pageEditor: $("#page-editor-content"),
  currentPageName: $("#current-page-name"),
  currentPageStatus: $("#current-page-status"),
  currentPageDescription: $("#current-page-description"),
  previewLink: $("#preview-page-link"),
  openSiteLink: $("#open-site-link"),
  saveOrder: $("#save-order-button"),
  publishPage: $("#publish-page-button"),
  discardDraft: $("#discard-draft-button"),
  unpublishedAlert: $("#unpublished-alert"),
  statPages: $("#stat-pages"),
  statSections: $("#stat-sections"),
  statPending: $("#stat-pending"),
  statVisible: $("#stat-visible"),
  pageSectionsCount: $("#page-sections-count"),
  pageVisibleCount: $("#page-visible-count"),
  pagePendingCount: $("#page-pending-count"),
  mediaGrid: $("#media-grid"),
  mediaDialogGrid: $("#media-dialog-grid"),
  settingsForm: $("#site-settings-form"),
  settingsEditor: $("#settings-editor"),
  settingsLoading: $("#settings-loading"),
  settingsStatus: $("#settings-status-badge"),
  settingsPendingNote: $("#settings-pending-note"),
  settingsDiscard: $("#settings-discard-button"),
  settingsPublish: $("#settings-publish-button")
};

function showMessage(text, type = "error") {
  nodes.message.textContent = text;
  nodes.message.className = `global-message ${text ? "visible" : ""} ${type}`;
  if (text) window.setTimeout(() => { if (nodes.message.textContent === text) showMessage(""); }, 5000);
}

function apiError(body, fallback) {
  const code = body?.error?.code;
  const messages = {
    cms_page_not_found: "تعذر العثور على الصفحة.",
    cms_section_not_found: "السكشن المطلوب غير موجود.",
    invalid_section_order: "ترتيب السكاشن غير صالح.",
    page_exists: "يوجد صفحة بنفس الرابط المختصر.",
    invalid_page: "تحقق من بيانات الصفحة.",
    invalid_section: "تحقق من بيانات السكشن.",
    last_section: "لا يمكن حذف آخر سكشن في الصفحة.",
    cms_publish_verification_failed: "فشل التحقق من المحتوى المنشور. لم يتم اعتماد النشر.",
    cms_site_setting_not_found: "إعداد الموقع المطلوب غير موجود.",
    invalid_site_setting: "تحقق من بيانات إعدادات الموقع.",
    cms_settings_publish_verification_failed: "فشل التحقق من إعدادات الموقع بعد النشر."
  };
  return messages[code] || fallback;
}

function hasPendingChanges() {
  return state.orderDirty || state.sections.some((section) => section.hasUnpublishedChanges);
}

function comparableJson(value) {
  return JSON.stringify(value && typeof value === "object" ? value : {});
}

async function verifyPublishedPage(page, sections) {
  const response = await fetch(`/api/cms/pages/${encodeURIComponent(page.slug)}?cms=${Date.now()}`, {
    cache: "no-store",
    headers: { Accept: "application/json", "Cache-Control": "no-cache" }
  });
  const publicBody = await response.json().catch(() => ({}));
  if (!response.ok || !publicBody.ok || !Array.isArray(publicBody.sections)) {
    throw new Error("تعذر التحقق من استجابة الصفحة العامة بعد النشر.");
  }

  const visibleSections = sections.filter((section) => section.isVisible);
  const publicIds = publicBody.sections.map((section) => section.id);
  const expectedIds = visibleSections.map((section) => section.id);
  if (publicIds.join("|") !== expectedIds.join("|")) {
    throw new Error("الصفحة العامة لا تعرض ترتيب السكاشن المنشور بعد.");
  }

  visibleSections.forEach((section, index) => {
    const publicSection = publicBody.sections[index];
    if (comparableJson(publicSection?.content) !== comparableJson(section.publishedContent)) {
      throw new Error(`لم يتم التحقق من محتوى السكشن: ${section.displayName}`);
    }
  });
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, {
    credentials: "same-origin",
    ...options,
    headers: { Accept: "application/json", ...(options.headers || {}) }
  });
  const body = await response.json().catch(() => ({}));
  if (response.status === 401) {
    window.location.replace("/admin/login");
    throw new Error("unauthorized");
  }
  return { response, body };
}

async function loadSession() {
  const { response, body } = await fetchJson("/api/admin/session");
  if (!response.ok || !body.authenticated) return false;
  state.session = body.user;
  nodes.email.textContent = body.user.email;
  nodes.role.textContent = body.user.role === "owner" ? "المالك" : body.user.role;
  return true;
}

function setView(view) {
  $$(".nav-item").forEach((item) => item.classList.toggle("active", item.dataset.view === view));
  $$(".view-panel").forEach((panel) => panel.classList.toggle("active", panel.dataset.panel === view));
  const titles = { overview: "لوحة التحكم", pages: "الصفحات والمحتوى", media: "مكتبة الصور", settings: "إعدادات الموقع" };
  $("#view-title").textContent = titles[view] || "لوحة التحكم";
  if (view === "settings" && !state.settingsLoaded) {
    loadSiteSettings().catch((error) => showMessage(error.message));
  }
}

function updateStats() {
  const pageCount = state.pages.length;
  const sectionCount = state.pages.reduce((sum, page) => sum + (page.sectionCount || 0), 0);
  const pendingCount = state.pages.reduce((sum, page) => sum + (page.pendingSectionCount || 0), 0);
  const visibleCount = state.pages.reduce((sum, page) => sum + (page.visibleSectionCount || 0), 0);
  nodes.statPages.textContent = String(pageCount);
  nodes.statSections.textContent = String(sectionCount);
  nodes.statPending.textContent = String(pendingCount);
  nodes.statVisible.textContent = String(visibleCount);
}

function pageStatusLabel(status) {
  return status === "published" ? "منشورة" : status === "draft" ? "مسودة" : "مؤرشفة";
}

function renderOverviewPages() {
  nodes.overviewPages.replaceChildren();
  state.pages.slice(0, 6).forEach((page) => {
    const button = document.createElement("button");
    button.className = "overview-page-row";
    button.type = "button";
    button.innerHTML = `<span class="page-file-icon">▤</span><span><strong></strong><small></small></span><span class="status-badge ${page.status}"></span>`;
    $("strong", button).textContent = page.displayName;
    $("small", button).textContent = `${page.sectionCount} سكشن`;
    $(".status-badge", button).textContent = pageStatusLabel(page.status);
    button.addEventListener("click", () => { setView("pages"); selectPage(page.slug); });
    nodes.overviewPages.append(button);
  });
}

function renderPagesList(filter = "") {
  nodes.pagesList.replaceChildren();
  const query = filter.trim().toLowerCase();
  const pages = state.pages.filter((page) => `${page.displayName} ${page.slug}`.toLowerCase().includes(query));
  pages.forEach((page) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "page-list-item";
    button.classList.toggle("active", state.currentPage?.slug === page.slug);
    button.innerHTML = `<span class="page-file-icon">▤</span><span class="page-list-copy"><strong></strong><small></small></span><span class="page-count"></span><span class="page-draft-dot" hidden>مسودة</span>`;
    $("strong", button).textContent = page.displayName;
    $("small", button).textContent = page.slug;
    $(".page-count", button).textContent = String(page.sectionCount || 0);
    $(".page-draft-dot", button).hidden = !(page.pendingSectionCount > 0);
    button.addEventListener("click", () => selectPage(page.slug));
    nodes.pagesList.append(button);
  });
}

async function loadPages({ keepSelection = true } = {}) {
  const { response, body } = await fetchJson("/api/admin/cms/pages");
  if (!response.ok) throw new Error(apiError(body, "تعذر تحميل الصفحات."));
  const currentSlug = keepSelection ? state.currentPage?.slug : null;
  state.pages = body.pages || [];
  updateStats();
  renderOverviewPages();
  renderPagesList(nodes.pageSearch.value);
  if (currentSlug && state.pages.some((page) => page.slug === currentSlug)) await selectPage(currentSlug, false);
}

function sectionIcon(type) {
  return ({ hero: "▰", text: "¶", text_and_image: "▣", form_and_text: "▱", announcement: "!", cards: "▦", image_cards: "▧", metrics: "%", logo_grid: "◇", gallery: "▥", call_to_action: "→" })[type] || "▤";
}

function renderPageSummary() {
  const visible = state.sections.filter((section) => section.isVisible).length;
  const pending = state.sections.filter((section) => section.hasUnpublishedChanges).length;
  const hasPending = hasPendingChanges();
  nodes.pageSectionsCount.textContent = String(state.sections.length);
  nodes.pageVisibleCount.textContent = String(visible);
  nodes.pagePendingCount.textContent = String(pending);
  nodes.currentPageName.textContent = state.currentPage.displayName;
  nodes.currentPageStatus.textContent = pageStatusLabel(state.currentPage.status);
  nodes.currentPageStatus.className = `status-badge ${state.currentPage.status}`;
  nodes.currentPageDescription.textContent = state.currentPage.seoDescription || `الرابط: ${state.currentPage.publicUrl}`;
  const previewUrl = freshPublicUrl(state.currentPage.publicUrl);
  nodes.previewLink.href = previewUrl;
  nodes.openSiteLink.href = previewUrl;
  nodes.publishPage.classList.toggle("attention", hasPending);
  nodes.unpublishedAlert.hidden = !hasPending;
  nodes.discardDraft.hidden = !hasPending;
}

function renderSections() {
  nodes.sectionsList.replaceChildren();
  state.sections.forEach((section, index) => {
    const card = document.createElement("article");
    card.className = `section-card ${section.isVisible ? "" : "hidden-section"}`;
    card.dataset.sectionId = section.id;
    card.innerHTML = `
      <div class="drag-area"><span class="drag-handle">⋮⋮</span><strong>${index + 1}</strong></div>
      <div class="section-symbol"></div>
      <div class="section-copy"><div class="section-title-line"><h3></h3><span class="section-type"></span><span class="draft-badge" hidden>غير منشور</span></div><p></p></div>
      <div class="section-actions">
        <label class="switch"><input type="checkbox" data-action="visibility"><span></span><em></em></label>
        <button class="icon-button" data-action="up" type="button" title="تحريك لأعلى">↑</button>
        <button class="icon-button" data-action="down" type="button" title="تحريك لأسفل">↓</button>
        <button class="button button-secondary compact" data-action="edit" type="button">تعديل</button>
        <button class="icon-button danger" data-action="delete" type="button" title="حذف">×</button>
      </div>`;
    $(".section-symbol", card).textContent = sectionIcon(section.sectionType);
    $("h3", card).textContent = section.displayName;
    $(".section-type", card).textContent = sectionTypeLabels[section.sectionType] || section.sectionType;
    $(".section-copy p", card).textContent = section.sectionKey;
    $(".draft-badge", card).hidden = !section.hasUnpublishedChanges;
    const checkbox = $('input[data-action="visibility"]', card);
    checkbox.checked = section.isVisible;
    $(".switch em", card).textContent = section.isVisible ? "ظاهر" : "مخفي";
    $('button[data-action="up"]', card).disabled = index === 0;
    $('button[data-action="down"]', card).disabled = index === state.sections.length - 1;
    nodes.sectionsList.append(card);
  });
  nodes.saveOrder.disabled = !state.orderDirty;
  renderPageSummary();
}

async function selectPage(slug, rerenderList = true) {
  nodes.pageEmpty.hidden = true;
  nodes.pageEditor.hidden = false;
  nodes.sectionsLoading.hidden = false;
  nodes.sectionsList.hidden = true;
  const { response, body } = await fetchJson(`/api/admin/cms/pages/${encodeURIComponent(slug)}`);
  if (!response.ok) throw new Error(apiError(body, "تعذر تحميل الصفحة."));
  state.currentPage = body.page;
  state.sections = body.sections || [];
  state.orderDirty = false;
  nodes.sectionsLoading.hidden = true;
  nodes.sectionsList.hidden = false;
  renderSections();
  if (rerenderList) renderPagesList(nodes.pageSearch.value);
}

function moveSection(id, direction) {
  const index = state.sections.findIndex((section) => section.id === id);
  const next = index + direction;
  if (index < 0 || next < 0 || next >= state.sections.length) return;
  const copy = [...state.sections];
  const [moved] = copy.splice(index, 1);
  copy.splice(next, 0, moved);
  state.sections = copy;
  state.orderDirty = true;
  renderSections();
}

async function saveOrder() {
  const { response, body } = await fetchJson(`/api/admin/cms/pages/${state.currentPage.slug}/sections/order`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sectionIds: state.sections.map((section) => section.id) })
  });
  if (!response.ok) throw new Error(apiError(body, "تعذر حفظ الترتيب."));
  state.currentPage = body.page;
  state.sections = body.sections;
  state.orderDirty = false;
  renderSections();
  showMessage("تم حفظ ترتيب السكاشن.", "success");
}

async function toggleVisibility(section, checked) {
  const { response, body } = await fetchJson(`/api/admin/cms/sections/${section.id}/visibility`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ isVisible: checked })
  });
  if (!response.ok) throw new Error(apiError(body, "تعذر تحديث حالة الظهور."));
  Object.assign(section, body.section);
  renderSections();
  await loadPages({ keepSelection: false });
  renderPagesList(nodes.pageSearch.value);
  showMessage(checked ? "تم إظهار السكشن." : "تم إخفاء السكشن.", "success");
}

function itemRow(item = {}) {
  const row = document.createElement("div");
  row.className = "item-editor-row";
  row.innerHTML = `
    <div class="item-row-top"><strong>عنصر</strong><button type="button" class="remove-item">حذف</button></div>
    <div class="form-grid two-columns">
      <label>العنوان<input data-item="title" maxlength="240"></label>
      <label>النص<input data-item="text" maxlength="1500"></label>
      <label>الصورة<div class="input-action"><input data-item="imageUrl" maxlength="1000"><button type="button" class="choose-item-image">اختيار</button></div></label>
      <label>وصف الصورة<input data-item="imageAlt" maxlength="300"></label>
      <label>نص الرابط<input data-item="linkLabel" maxlength="160"></label>
      <label>الرابط<input data-item="linkUrl" maxlength="1000"></label>
    </div>`;
  $$('[data-item]', row).forEach((input) => { input.value = item[input.dataset.item] || ""; });
  $(".remove-item", row).addEventListener("click", () => row.remove());
  $(".choose-item-image", row).addEventListener("click", () => openMediaPicker($('[data-item="imageUrl"]', row)));
  return row;
}

function populateSectionTypeSelect() {
  const select = $("#section-type");
  select.replaceChildren();
  Object.entries(sectionTypeLabels).forEach(([value, label]) => {
    const option = document.createElement("option"); option.value = value; option.textContent = label; select.append(option);
  });
}

function openSectionEditor(section) {
  state.editingSectionId = section.id;
  const content = section.draftContent || {};
  $("#section-dialog-title").textContent = `تعديل: ${section.displayName}`;
  $("#section-display-name").value = section.displayName || "";
  $("#section-type").value = section.sectionType;
  ["eyebrow", "title", "body", "imageUrl", "imageAlt", "buttonLabel", "buttonUrl"].forEach((field) => {
    $(`#section-${field.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}`).value = content[field] || "";
  });
  const editor = $("#items-editor"); editor.replaceChildren();
  (content.items || []).forEach((item) => editor.append(itemRow(item)));
  $("#section-dialog").showModal();
}

function collectItems() {
  return $$(".item-editor-row", $("#items-editor")).map((row) => {
    const item = {};
    $$('[data-item]', row).forEach((input) => { item[input.dataset.item] = input.value.trim(); });
    return item;
  });
}

async function saveSection(event) {
  event.preventDefault();
  const section = state.sections.find((item) => item.id === state.editingSectionId);
  if (!section) return;
  const content = {
    eyebrow: $("#section-eyebrow").value,
    title: $("#section-title").value,
    body: $("#section-body").value,
    imageUrl: $("#section-image-url").value,
    imageAlt: $("#section-image-alt").value,
    buttonLabel: $("#section-button-label").value,
    buttonUrl: $("#section-button-url").value,
    items: collectItems()
  };
  const { response, body } = await fetchJson(`/api/admin/cms/sections/${section.id}/content`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ displayName: $("#section-display-name").value, sectionType: $("#section-type").value, content })
  });
  if (!response.ok) throw new Error(apiError(body, "تعذر حفظ السكشن."));
  Object.assign(section, body.section);
  $("#section-dialog").close();
  renderSections();
  await loadPages({ keepSelection: false });
  renderPagesList(nodes.pageSearch.value);
  showMessage("تم حفظ مسودة السكشن. اضغط نشر التغييرات لإظهارها في الموقع.", "success");
}

async function publishCurrentPage() {
  nodes.publishPage.disabled = true;
  nodes.publishPage.textContent = "جار التحقق...";
  try {
    const { response, body } = await fetchJson(`/api/admin/cms/pages/${state.currentPage.slug}/publish`, { method: "POST" });
    if (!response.ok) throw new Error(apiError(body, "تعذر نشر الصفحة."));
    await verifyPublishedPage(body.page, body.sections || []);
    state.currentPage = body.page;
    state.sections = body.sections;
    renderSections();
    await loadPages({ keepSelection: false });
    renderPagesList(nodes.pageSearch.value);
    cmsUpdates?.postMessage({ type: "published", slug: state.currentPage.slug, publishedAt: Date.now() });
    renderPageSummary();
    showMessage("تم نشر الصفحة والتحقق من المحتوى العام.", "success");
  } finally {
    nodes.publishPage.disabled = false;
    nodes.publishPage.textContent = "نشر التغييرات";
  }
}

async function discardCurrentDraft() {
  if (!state.currentPage || !hasPendingChanges()) return;
  const { response, body } = await fetchJson(`/api/admin/cms/pages/${state.currentPage.slug}/discard`, { method: "POST" });
  if (!response.ok) throw new Error(apiError(body, "تعذر إلغاء التغييرات غير المنشورة."));
  state.currentPage = body.page;
  state.sections = body.sections;
  state.orderDirty = false;
  renderSections();
  await loadPages({ keepSelection: false });
  renderPagesList(nodes.pageSearch.value);
  showMessage("تم إلغاء المسودة والرجوع إلى آخر نسخة منشورة.", "success");
}

async function deleteSection(section) {
  if (!window.confirm(`حذف سكشن «${section.displayName}»؟ لا يمكن التراجع عن العملية.`)) return;
  const { response, body } = await fetchJson(`/api/admin/cms/sections/${section.id}`, { method: "DELETE" });
  if (!response.ok) throw new Error(apiError(body, "تعذر حذف السكشن."));
  state.sections = state.sections.filter((item) => item.id !== section.id);
  renderSections();
  await loadPages({ keepSelection: false });
  renderPagesList(nodes.pageSearch.value);
  showMessage("تم حذف السكشن.", "success");
}

function renderTemplateGrid() {
  const grid = $("#template-grid"); grid.replaceChildren();
  sectionTemplates.forEach((template) => {
    const label = document.createElement("label");
    label.className = "template-card";
    label.innerHTML = `<input type="radio" name="template" value="${template.type}"><span class="template-icon">${template.icon}</span><strong>${template.name}</strong><small>قالب جاهز قابل للتعديل</small>`;
    const input = $("input", label); input.checked = template.type === state.selectedTemplate;
    input.addEventListener("change", () => { state.selectedTemplate = template.type; $$(".template-card").forEach((card) => card.classList.toggle("selected", $("input", card).checked)); });
    label.classList.toggle("selected", input.checked);
    grid.append(label);
  });
}

async function addSection(event) {
  event.preventDefault();
  const template = sectionTemplates.find((item) => item.type === state.selectedTemplate);
  const { response, body } = await fetchJson(`/api/admin/cms/pages/${state.currentPage.slug}/sections`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sectionType: template.type, displayName: template.name, content: template.content })
  });
  if (!response.ok) throw new Error(apiError(body, "تعذر إضافة السكشن."));
  state.currentPage = body.page;
  state.sections = body.sections;
  $("#template-dialog").close();
  renderSections();
  await loadPages({ keepSelection: false });
  renderPagesList(nodes.pageSearch.value);
  showMessage("تمت إضافة السكشن كمسودة.", "success");
}

async function createPage(event) {
  event.preventDefault();
  const payload = {
    displayName: $("#new-page-name").value,
    slug: $("#new-page-slug").value,
    seoTitle: $("#new-page-seo-title").value,
    seoDescription: $("#new-page-description").value
  };
  const { response, body } = await fetchJson("/api/admin/cms/pages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!response.ok) throw new Error(apiError(body, "تعذر إنشاء الصفحة."));
  $("#page-dialog").close();
  $("#page-form").reset();
  await loadPages({ keepSelection: false });
  setView("pages");
  await selectPage(body.page.slug);
  showMessage("تم إنشاء الصفحة. عدّل محتواها ثم انشرها.", "success");
}

function openPageSettings() {
  $("#settings-page-name").value = state.currentPage.displayName || "";
  $("#settings-seo-title").value = state.currentPage.seoTitle || "";
  $("#settings-seo-description").value = state.currentPage.seoDescription || "";
  $("#settings-page-status").value = state.currentPage.status;
  $("#page-settings-dialog").showModal();
}

async function savePageSettings(event) {
  event.preventDefault();
  const { response, body } = await fetchJson(`/api/admin/cms/pages/${state.currentPage.slug}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      displayName: $("#settings-page-name").value,
      seoTitle: $("#settings-seo-title").value,
      seoDescription: $("#settings-seo-description").value,
      status: $("#settings-page-status").value
    })
  });
  if (!response.ok) throw new Error(apiError(body, "تعذر حفظ إعدادات الصفحة."));
  state.currentPage = body.page;
  state.sections = body.sections;
  $("#page-settings-dialog").close();
  await loadPages({ keepSelection: false });
  renderPagesList(nodes.pageSearch.value);
  renderSections();
  showMessage("تم حفظ إعدادات الصفحة.", "success");
}


function settingValue(id, value) {
  const input = $(id);
  if (input) input.value = typeof value === "string" ? value : "";
}

function settingsLinkRow(item = {}) {
  const row = document.createElement("div");
  row.className = "settings-link-row";
  row.innerHTML = `
    <span class="settings-link-move"><button type="button" data-move-setting-link="up" aria-label="تحريك لأعلى">↑</button><button type="button" data-move-setting-link="down" aria-label="تحريك لأسفل">↓</button></span>
    <label><span>اسم الرابط</span><input data-field="label" maxlength="160"></label>
    <label><span>المسار أو الرابط</span><input data-field="url" maxlength="1000" dir="ltr"></label>
    <button class="icon-button danger" data-remove-setting-link type="button" aria-label="حذف الرابط">×</button>`;
  $('[data-field="label"]', row).value = item.label || "";
  $('[data-field="url"]', row).value = item.url || "";
  return row;
}

function renderSettingsLinks(container, items) {
  container.replaceChildren();
  (Array.isArray(items) ? items : []).forEach((item) => container.append(settingsLinkRow(item)));
}

function readSettingsLinks(container) {
  return $$(".settings-link-row", container).map((row) => ({
    label: $('[data-field="label"]', row).value.trim(),
    url: $('[data-field="url"]', row).value.trim()
  })).filter((item) => item.label && item.url);
}

function hasPendingSiteSettings() {
  return Object.values(state.settings).some((setting) => setting?.hasUnpublishedChanges);
}

function renderSiteSettingsStatus() {
  const pending = hasPendingSiteSettings();
  nodes.settingsStatus.textContent = pending ? "مسودة غير منشورة" : "منشورة";
  nodes.settingsStatus.className = `status-badge ${pending ? "draft" : "published"}`;
  nodes.settingsPendingNote.textContent = pending
    ? "هناك تعديلات محفوظة كمسودة. اضغط نشر حتى تظهر للزوار."
    : "الإعدادات المنشورة تظهر في جميع صفحات الموقع.";
  nodes.settingsDiscard.hidden = !pending;
  nodes.settingsPublish.disabled = !pending;
  nodes.settingsPublish.textContent = pending
    ? "\u0646\u0634\u0631 \u0627\u0644\u0645\u0633\u0648\u062f\u0629"
    : "\u0644\u0627 \u062a\u0648\u062c\u062f \u0645\u0633\u0648\u062f\u0629 \u0644\u0644\u0646\u0634\u0631";
  nodes.settingsPublish.classList.toggle("attention", pending);
}

function fillSiteSettingsForm() {
  const header = state.settings.header?.draftContent || {};
  const footer = state.settings.footer?.draftContent || {};
  const contact = state.settings.contact?.draftContent || {};

  settingValue("#settings-site-name", header.siteName);
  settingValue("#settings-site-tagline", header.siteTagline);
  settingValue("#settings-logo-url", header.logoUrl);
  settingValue("#settings-logo-alt", header.logoAlt);
  renderSettingsLinks($("#settings-nav-items"), header.navItems);

  settingValue("#settings-footer-summary", footer.summary);
  settingValue("#settings-footer-copyright", footer.copyright);
  settingValue("#settings-footer-secondary", footer.secondaryText);
  renderSettingsLinks($("#settings-quick-links"), footer.quickLinks);
  renderSettingsLinks($("#settings-kitchen-links"), footer.kitchenLinks);

  settingValue("#settings-contact-email", contact.email);
  settingValue("#settings-contact-phone-display", contact.phoneDisplay);
  settingValue("#settings-contact-phone", contact.phone);
  settingValue("#settings-contact-whatsapp", contact.whatsappNumber);
  settingValue("#settings-contact-address", contact.address);
  settingValue("#settings-contact-hours", contact.workingHours);
  settingValue("#settings-contact-instagram", contact.instagramUrl);
  settingValue("#settings-contact-snapchat", contact.snapchatUrl);
  renderSiteSettingsStatus();
}

async function loadSiteSettings() {
  nodes.settingsLoading.hidden = false;
  nodes.settingsEditor.hidden = true;
  const { response, body } = await fetchJson("/api/admin/cms/settings");
  if (!response.ok) throw new Error(apiError(body, "تعذر تحميل إعدادات الموقع."));
  state.settings = Object.fromEntries((body.settings || []).map((setting) => [setting.key, setting]));
  state.settingsLoaded = true;
  fillSiteSettingsForm();
  nodes.settingsLoading.hidden = true;
  nodes.settingsEditor.hidden = false;
}

function siteSettingsPayloads() {
  return {
    header: {
      siteName: $("#settings-site-name").value,
      siteTagline: $("#settings-site-tagline").value,
      logoUrl: $("#settings-logo-url").value,
      logoAlt: $("#settings-logo-alt").value,
      navItems: readSettingsLinks($("#settings-nav-items"))
    },
    footer: {
      summary: $("#settings-footer-summary").value,
      copyright: $("#settings-footer-copyright").value,
      secondaryText: $("#settings-footer-secondary").value,
      quickLinks: readSettingsLinks($("#settings-quick-links")),
      kitchenLinks: readSettingsLinks($("#settings-kitchen-links"))
    },
    contact: {
      email: $("#settings-contact-email").value,
      phoneDisplay: $("#settings-contact-phone-display").value,
      phone: $("#settings-contact-phone").value,
      whatsappNumber: $("#settings-contact-whatsapp").value,
      address: $("#settings-contact-address").value,
      workingHours: $("#settings-contact-hours").value,
      instagramUrl: $("#settings-contact-instagram").value,
      snapchatUrl: $("#settings-contact-snapchat").value
    }
  };
}

async function saveSiteSettings(event) {
  event.preventDefault();
  const payloads = siteSettingsPayloads();
  const results = await Promise.all(Object.entries(payloads).map(([key, content]) => fetchJson(`/api/admin/cms/settings/${key}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content })
  })));
  const failed = results.find(({ response }) => !response.ok);
  if (failed) throw new Error(apiError(failed.body, "تعذر حفظ إعدادات الموقع."));
  await loadSiteSettings();
  showMessage("تم حفظ إعدادات الموقع كمسودة.", "success");
}

async function verifyPublishedSiteSettings() {
  const response = await fetch(`/api/cms/settings?cms=${Date.now()}`, {
    cache: "no-store",
    headers: { Accept: "application/json", "Cache-Control": "no-cache" }
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok || !body.ok || !body.settings) {
    throw new Error("تعذر التحقق من إعدادات الموقع العامة بعد النشر.");
  }
  Object.entries(state.settings).forEach(([key, setting]) => {
    if (comparableJson(body.settings[key]) !== comparableJson(setting.publishedContent)) {
      throw new Error(`لم يتم التحقق من نشر إعداد: ${setting.displayName}`);
    }
  });
}

async function publishSiteSettings() {
  if (!hasPendingSiteSettings()) {
    showMessage("\u0644\u0627 \u062a\u0648\u062c\u062f \u0645\u0633\u0648\u062f\u0629 \u0625\u0639\u062f\u0627\u062f\u0627\u062a \u062a\u062d\u062a\u0627\u062c \u0625\u0644\u0649 \u0627\u0644\u0646\u0634\u0631.");
    return;
  }

  const confirmed = window.confirm(
    "\u0633\u064a\u062a\u0645 \u0646\u0634\u0631 \u0645\u0633\u0648\u062f\u0629 \u0625\u0639\u062f\u0627\u062f\u0627\u062a \u0627\u0644\u0645\u0648\u0642\u0639 \u0648\u0625\u0638\u0647\u0627\u0631\u0647\u0627 \u0644\u0644\u0632\u0648\u0627\u0631. \u0647\u0644 \u062a\u0631\u064a\u062f \u0627\u0644\u0645\u062a\u0627\u0628\u0639\u0629\u061f"
  );

  if (!confirmed) return;

  const { response, body } = await fetchJson("/api/admin/cms/settings/publish", { method: "POST" });
  if (!response.ok) throw new Error(apiError(body, "تعذر نشر إعدادات الموقع."));
  state.settings = Object.fromEntries((body.settings || []).map((setting) => [setting.key, setting]));
  await verifyPublishedSiteSettings();
  fillSiteSettingsForm();
  cmsUpdates?.postMessage({ type: "settings-published", publishedAt: Date.now() });
  showMessage("تم نشر إعدادات الموقع والتحقق منها.", "success");
}

async function discardSiteSettings() {
  if (!window.confirm("إلغاء جميع تعديلات إعدادات الموقع والرجوع إلى آخر نسخة منشورة؟")) return;
  const { response, body } = await fetchJson("/api/admin/cms/settings/discard", { method: "POST" });
  if (!response.ok) throw new Error(apiError(body, "تعذر إلغاء مسودة الإعدادات."));
  state.settings = Object.fromEntries((body.settings || []).map((setting) => [setting.key, setting]));
  fillSiteSettingsForm();
  showMessage("تم إلغاء مسودة إعدادات الموقع.", "success");
}

async function loadMedia() {
  const response = await fetch("/admin/media-manifest.json", { credentials: "same-origin" });
  state.media = response.ok ? await response.json() : [];
  renderMedia(state.media, nodes.mediaGrid, null);
}

function renderMedia(media, container, targetInput) {
  container.replaceChildren();
  media.slice(0, 250).forEach((item) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "media-card";
    button.innerHTML = `<img loading="lazy"><span></span>`;
    $("img", button).src = item.path;
    $("img", button).alt = item.name;
    $("span", button).textContent = item.name;
    if (targetInput) button.addEventListener("click", () => { targetInput.value = item.path; $("#media-dialog").close(); });
    container.append(button);
  });
}

function openMediaPicker(targetInput) {
  state.mediaTarget = targetInput;
  $("#media-dialog-search").value = "";
  renderMedia(state.media, nodes.mediaDialogGrid, targetInput);
  $("#media-dialog").showModal();
}

function filterMedia(value, container, targetInput = null) {
  const query = value.trim().toLowerCase();
  renderMedia(state.media.filter((item) => item.name.toLowerCase().includes(query)), container, targetInput);
}

async function logout() {
  await fetchJson("/api/admin/logout", { method: "POST" });
  window.location.replace("/admin/login");
}

function bindEvents() {
  $$(".nav-item").forEach((button) => button.addEventListener("click", () => setView(button.dataset.view)));
  $$('[data-go-pages]').forEach((button) => button.addEventListener("click", () => setView("pages")));
  $("#logout-button").addEventListener("click", () => logout().catch((error) => showMessage(error.message)));
  nodes.pageSearch.addEventListener("input", () => renderPagesList(nodes.pageSearch.value));
  nodes.saveOrder.addEventListener("click", () => saveOrder().catch((error) => showMessage(error.message)));
  nodes.publishPage.addEventListener("click", () => publishCurrentPage().catch((error) => showMessage(error.message)));
  nodes.discardDraft.addEventListener("click", () => discardCurrentDraft().catch((error) => showMessage(error.message)));
  $("#page-settings-button").addEventListener("click", openPageSettings);
  $("#add-section-button").addEventListener("click", () => { renderTemplateGrid(); $("#template-dialog").showModal(); });
  $("#new-page-button").addEventListener("click", () => $("#page-dialog").showModal());
  $("#rail-new-page").addEventListener("click", () => $("#page-dialog").showModal());
  $("#section-form").addEventListener("submit", (event) => saveSection(event).catch((error) => showMessage(error.message)));
  $("#page-form").addEventListener("submit", (event) => createPage(event).catch((error) => showMessage(error.message)));
  $("#page-settings-form").addEventListener("submit", (event) => savePageSettings(event).catch((error) => showMessage(error.message)));
  nodes.settingsForm.addEventListener("submit", (event) => saveSiteSettings(event).catch((error) => showMessage(error.message)));
  nodes.settingsPublish.addEventListener("click", () => publishSiteSettings().catch((error) => showMessage(error.message)));
  nodes.settingsDiscard.addEventListener("click", () => discardSiteSettings().catch((error) => showMessage(error.message)));
  $("#choose-settings-logo").addEventListener("click", () => openMediaPicker($("#settings-logo-url")));
  $("#settings-add-nav").addEventListener("click", () => $("#settings-nav-items").append(settingsLinkRow()));
  $("#settings-add-quick-link").addEventListener("click", () => $("#settings-quick-links").append(settingsLinkRow()));
  $("#settings-add-kitchen-link").addEventListener("click", () => $("#settings-kitchen-links").append(settingsLinkRow()));
  nodes.settingsForm.addEventListener("click", (event) => {
    const remove = event.target.closest("[data-remove-setting-link]");
    if (remove) {
      remove.closest(".settings-link-row")?.remove();
      return;
    }
    const move = event.target.closest("[data-move-setting-link]");
    const row = move?.closest(".settings-link-row");
    if (!move || !row) return;
    if (move.dataset.moveSettingLink === "up" && row.previousElementSibling) {
      row.parentElement.insertBefore(row, row.previousElementSibling);
    }
    if (move.dataset.moveSettingLink === "down" && row.nextElementSibling) {
      row.parentElement.insertBefore(row.nextElementSibling, row);
    }
  });
  $("#template-form").addEventListener("submit", (event) => addSection(event).catch((error) => showMessage(error.message)));
  $("#add-item-button").addEventListener("click", () => $("#items-editor").append(itemRow()));
  $("#choose-image-button").addEventListener("click", () => openMediaPicker($("#section-image-url")));
  $("#media-search").addEventListener("input", (event) => filterMedia(event.target.value, nodes.mediaGrid));
  $("#media-dialog-search").addEventListener("input", (event) => filterMedia(event.target.value, nodes.mediaDialogGrid, state.mediaTarget));
  $$('[data-close-dialog]').forEach((button) => button.addEventListener("click", () => $(`#${button.dataset.closeDialog}`).close()));

  nodes.sectionsList.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-action]");
    if (!button) return;
    const card = button.closest(".section-card");
    const section = state.sections.find((item) => item.id === card.dataset.sectionId);
    if (!section) return;
    if (button.dataset.action === "up") moveSection(section.id, -1);
    if (button.dataset.action === "down") moveSection(section.id, 1);
    if (button.dataset.action === "edit") openSectionEditor(section);
    if (button.dataset.action === "delete") deleteSection(section).catch((error) => showMessage(error.message));
  });

  nodes.sectionsList.addEventListener("change", (event) => {
    const input = event.target.closest('input[data-action="visibility"]');
    if (!input) return;
    const card = input.closest(".section-card");
    const section = state.sections.find((item) => item.id === card.dataset.sectionId);
    if (!section) return;
    input.disabled = true;
    toggleVisibility(section, input.checked).catch((error) => { input.checked = !input.checked; showMessage(error.message); }).finally(() => { input.disabled = false; });
  });
}

async function init() {
  try {
    populateSectionTypeSelect();
    bindEvents();
    if (!(await loadSession())) return window.location.replace("/admin/login");
    await Promise.all([loadPages({ keepSelection: false }), loadMedia()]);
    if (state.pages.length) await selectPage(state.pages[0].slug);
  } catch (error) {
    if (error.message !== "unauthorized") showMessage(error.message || "تعذر تشغيل لوحة التحكم.");
  }
}

document.addEventListener("DOMContentLoaded", init);

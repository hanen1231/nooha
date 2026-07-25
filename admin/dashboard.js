const emailNode = document.querySelector("#admin-email");
const roleNode = document.querySelector("#admin-role");
const messageNode = document.querySelector("#dashboard-message");
const logoutButton = document.querySelector("#logout-button");
const reloadButton = document.querySelector("#reload-sections-button");
const saveOrderButton = document.querySelector("#save-order-button");
const sectionsList = document.querySelector("#sections-list");
const sectionsLoading = document.querySelector("#sections-loading");
const pageNameNode = document.querySelector("#cms-page-name");
const pageStatusNode = document.querySelector("#cms-page-status");
const pageDescriptionNode = document.querySelector("#cms-page-description");
const sectionsCountNode = document.querySelector("#cms-sections-count");
const visibleCountNode = document.querySelector("#cms-visible-count");
const hiddenCountNode = document.querySelector("#cms-hidden-count");

const sectionTypeLabels = {
  video_hero: "فيديو رئيسي",
  image: "صورة",
  hero: "واجهة رئيسية",
  form_and_text: "نموذج ونص",
  announcement: "إعلان",
  cards: "بطاقات",
  metrics: "إحصائيات",
  logo_grid: "شعارات",
  image_cards: "بطاقات صور",
  icon_grid: "أيقونات",
  text_and_image: "نص وصورة",
  call_to_action: "دعوة للتواصل"
};

const state = {
  page: null,
  sections: [],
  orderDirty: false,
  loading: false
};

function setMessage(text, type = "error") {
  messageNode.textContent = text;
  messageNode.classList.toggle("success", type === "success");
}

function clearMessage() {
  setMessage("");
}

function setLoading(isLoading) {
  state.loading = isLoading;
  reloadButton.disabled = isLoading;
  saveOrderButton.disabled = isLoading || !state.orderDirty;
  sectionsList.setAttribute("aria-busy", String(isLoading));
  sectionsLoading.hidden = !isLoading;
}

function getErrorMessage(body, fallback) {
  const code = body?.error?.code;

  if (code === "cms_page_not_found") {
    return "لم يتم العثور على إعداد الصفحة الرئيسية في قاعدة المحتوى.";
  }

  if (code === "invalid_section_order") {
    return "تعذر حفظ الترتيب لأن قائمة السكاشن غير مكتملة.";
  }

  if (code === "cms_section_not_found") {
    return "السكشن المطلوب لم يعد موجودًا. حدّث القائمة وحاول مرة أخرى.";
  }

  return fallback;
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, {
    credentials: "same-origin",
    ...options,
    headers: {
      Accept: "application/json",
      ...(options.headers || {})
    }
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

  if (!response.ok || !body.authenticated) {
    window.location.replace("/admin/login");
    return false;
  }

  emailNode.textContent = body.user.email;
  roleNode.textContent = body.user.role;
  return true;
}

function updatePageSummary() {
  const visibleCount = state.sections.filter((section) => section.isVisible).length;
  const hiddenCount = state.sections.length - visibleCount;

  sectionsCountNode.textContent = String(state.sections.length);
  visibleCountNode.textContent = String(visibleCount);
  hiddenCountNode.textContent = String(hiddenCount);

  if (!state.page) {
    return;
  }

  pageNameNode.textContent = state.page.displayName;
  pageStatusNode.textContent = state.page.status === "published" ? "منشورة" : state.page.status;
  pageStatusNode.classList.remove("status-badge-muted");
  pageDescriptionNode.textContent = state.page.seoDescription || `ملف الصفحة: ${state.page.fileName}`;
}

function createActionButton(label, action, sectionId, disabled = false) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "icon-button";
  button.textContent = label;
  button.dataset.action = action;
  button.dataset.sectionId = sectionId;
  button.disabled = disabled;
  return button;
}

function createSectionCard(section, index) {
  const article = document.createElement("article");
  article.className = "section-card";
  article.dataset.sectionId = section.id;
  article.classList.toggle("section-card-hidden", !section.isVisible);

  const orderColumn = document.createElement("div");
  orderColumn.className = "section-order-column";

  const orderNumber = document.createElement("span");
  orderNumber.className = "section-order-number";
  orderNumber.textContent = String(index + 1);
  orderColumn.append(orderNumber);
  orderColumn.append(createActionButton("↑", "move-up", section.id, index === 0));
  orderColumn.append(createActionButton("↓", "move-down", section.id, index === state.sections.length - 1));

  const content = document.createElement("div");
  content.className = "section-card-content";

  const titleRow = document.createElement("div");
  titleRow.className = "section-title-row";

  const title = document.createElement("h3");
  title.textContent = section.displayName;

  const typeBadge = document.createElement("span");
  typeBadge.className = "section-type-badge";
  typeBadge.textContent = sectionTypeLabels[section.sectionType] || section.sectionType;

  titleRow.append(title, typeBadge);

  const key = document.createElement("p");
  key.className = "section-key";
  key.textContent = section.sectionKey;

  const note = document.createElement("p");
  note.className = "section-note";
  note.textContent = "تعديل النصوص والصور الخاصة بهذا السكشن سيضاف في الخطوة التالية.";

  content.append(titleRow, key, note);

  const controls = document.createElement("div");
  controls.className = "section-card-controls";

  const toggleLabel = document.createElement("label");
  toggleLabel.className = "visibility-toggle";

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = section.isVisible;
  checkbox.dataset.action = "toggle-visibility";
  checkbox.dataset.sectionId = section.id;

  const toggleText = document.createElement("span");
  toggleText.textContent = section.isVisible ? "ظاهر" : "مخفي";

  toggleLabel.append(checkbox, toggleText);

  const editButton = document.createElement("button");
  editButton.type = "button";
  editButton.className = "secondary-button compact-button";
  editButton.textContent = "تعديل المحتوى";
  editButton.disabled = true;
  editButton.title = "سيتم تفعيل محرر المحتوى في الخطوة التالية";

  controls.append(toggleLabel, editButton);
  article.append(orderColumn, content, controls);

  return article;
}

function renderSections() {
  sectionsList.replaceChildren();

  if (state.sections.length === 0) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = "لا توجد سكاشن مسجلة لهذه الصفحة.";
    sectionsList.append(empty);
  } else {
    state.sections.forEach((section, index) => {
      sectionsList.append(createSectionCard(section, index));
    });
  }

  updatePageSummary();
  saveOrderButton.disabled = state.loading || !state.orderDirty;
}

async function loadHomePage() {
  clearMessage();
  setLoading(true);

  try {
    const { response, body } = await fetchJson("/api/admin/cms/pages/home");

    if (!response.ok) {
      throw new Error(getErrorMessage(body, "تعذر تحميل محتوى الصفحة الرئيسية."));
    }

    state.page = body.page;
    state.sections = Array.isArray(body.sections) ? body.sections : [];
    state.orderDirty = false;
    renderSections();
  } catch (error) {
    if (error.message !== "unauthorized") {
      setMessage(error.message || "تعذر تحميل محتوى الصفحة الرئيسية.");
    }
  } finally {
    setLoading(false);
  }
}

function moveSection(sectionId, direction) {
  const currentIndex = state.sections.findIndex((section) => section.id === sectionId);
  const nextIndex = currentIndex + direction;

  if (currentIndex < 0 || nextIndex < 0 || nextIndex >= state.sections.length) {
    return;
  }

  const nextSections = [...state.sections];
  const [movedSection] = nextSections.splice(currentIndex, 1);
  nextSections.splice(nextIndex, 0, movedSection);

  state.sections = nextSections;
  state.orderDirty = true;
  clearMessage();
  renderSections();
}

async function updateVisibility(sectionId, isVisible, checkbox) {
  const section = state.sections.find((item) => item.id === sectionId);

  if (!section) {
    return;
  }

  checkbox.disabled = true;
  clearMessage();

  try {
    const { response, body } = await fetchJson(
      `/api/admin/cms/sections/${encodeURIComponent(sectionId)}/visibility`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ isVisible })
      }
    );

    if (!response.ok) {
      throw new Error(getErrorMessage(body, "تعذر تحديث حالة ظهور السكشن."));
    }

    section.isVisible = body.section?.isVisible ?? isVisible;
    renderSections();
    setMessage(isVisible ? "تم إظهار السكشن." : "تم إخفاء السكشن.", "success");
  } catch (error) {
    checkbox.checked = !isVisible;
    setMessage(error.message || "تعذر تحديث حالة ظهور السكشن.");
  } finally {
    checkbox.disabled = false;
  }
}

async function saveOrder() {
  if (!state.orderDirty || state.loading) {
    return;
  }

  saveOrderButton.disabled = true;
  reloadButton.disabled = true;
  clearMessage();

  try {
    const { response, body } = await fetchJson("/api/admin/cms/pages/home/sections/order", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        sectionIds: state.sections.map((section) => section.id)
      })
    });

    if (!response.ok) {
      throw new Error(getErrorMessage(body, "تعذر حفظ ترتيب السكاشن."));
    }

    state.sections = Array.isArray(body.sections) ? body.sections : state.sections;
    state.orderDirty = false;
    renderSections();
    setMessage("تم حفظ ترتيب السكاشن.", "success");
  } catch (error) {
    setMessage(error.message || "تعذر حفظ ترتيب السكاشن.");
  } finally {
    reloadButton.disabled = false;
    saveOrderButton.disabled = !state.orderDirty;
  }
}

sectionsList.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");

  if (!button) {
    return;
  }

  if (button.dataset.action === "move-up") {
    moveSection(button.dataset.sectionId, -1);
  }

  if (button.dataset.action === "move-down") {
    moveSection(button.dataset.sectionId, 1);
  }
});

sectionsList.addEventListener("change", (event) => {
  const checkbox = event.target.closest('input[data-action="toggle-visibility"]');

  if (!checkbox) {
    return;
  }

  updateVisibility(checkbox.dataset.sectionId, checkbox.checked, checkbox);
});

reloadButton.addEventListener("click", () => {
  loadHomePage();
});

saveOrderButton.addEventListener("click", () => {
  saveOrder();
});

logoutButton.addEventListener("click", async () => {
  logoutButton.disabled = true;
  clearMessage();

  try {
    await fetchJson("/api/admin/logout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({})
    });
    window.location.replace("/admin/login");
  } catch {
    setMessage("تعذر تسجيل الخروج الآن.");
    logoutButton.disabled = false;
  }
});

async function initializeDashboard() {
  const authenticated = await loadSession();

  if (authenticated) {
    await loadHomePage();
  }
}

initializeDashboard().catch(() => {
  setMessage("تعذر تشغيل لوحة التحكم الآن.");
});

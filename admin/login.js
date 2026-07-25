const form = document.querySelector("#login-form");
const message = document.querySelector("#login-message");
const submitButton = document.querySelector("#login-submit");

function setMessage(text, isSuccess = false) {
  message.textContent = text;
  message.classList.toggle("success", isSuccess);
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
  return { response, body };
}

async function prepareLoginPage() {
  const setupStatus = await fetchJson("/api/admin/setup-status");
  if (setupStatus.response.ok && setupStatus.body.setupRequired) {
    window.location.replace("/admin/setup");
    return;
  }

  const session = await fetchJson("/api/admin/session");
  if (session.response.ok && session.body.authenticated) {
    window.location.replace("/admin");
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  setMessage("");
  submitButton.disabled = true;

  const formData = new FormData(form);
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");

  if (!email || !password) {
    setMessage("أدخل البريد الإلكتروني وكلمة المرور.");
    submitButton.disabled = false;
    return;
  }

  try {
    const { response } = await fetchJson("/api/admin/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      setMessage(response.status === 429 ? "تم إيقاف المحاولة مؤقتًا. حاول لاحقًا." : "تعذر تسجيل الدخول. تحقق من البيانات.");
      return;
    }

    window.location.replace("/admin");
  } catch {
    setMessage("حدث خطأ غير متوقع. حاول مرة أخرى.");
  } finally {
    submitButton.disabled = false;
  }
});

prepareLoginPage().catch(() => {
  setMessage("تعذر التحقق من حالة الدخول الآن.");
});

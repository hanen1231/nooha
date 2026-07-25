const form = document.querySelector("#setup-form");
const message = document.querySelector("#setup-message");
const submitButton = document.querySelector("#setup-submit");

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

async function prepareSetupPage() {
  const { response, body } = await fetchJson("/api/admin/setup-status");
  if (response.ok && body.setupRequired === false) {
    window.location.replace("/admin/login");
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  setMessage("");
  submitButton.disabled = true;

  const formData = new FormData(form);
  const email = String(formData.get("email") || "").trim();
  const setupToken = String(formData.get("setupToken") || "");
  const password = String(formData.get("password") || "");
  const confirmPassword = String(formData.get("confirmPassword") || "");

  if (!setupToken) {
    setMessage("أدخل رمز الإعداد.");
    submitButton.disabled = false;
    return;
  }

  if (password.length < 12 || password.length > 128) {
    setMessage("كلمة المرور يجب أن تكون بين 12 و128 حرفًا.");
    submitButton.disabled = false;
    return;
  }

  if (password !== confirmPassword) {
    setMessage("كلمتا المرور غير متطابقتين.");
    submitButton.disabled = false;
    return;
  }

  try {
    const { response } = await fetchJson("/api/admin/setup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, setupToken, password })
    });

    if (!response.ok) {
      setMessage(response.status === 409 ? "تم إعداد المدير مسبقًا." : "تعذر إكمال الإعداد. تحقق من الرمز والبيانات.");
      return;
    }

    setMessage("تم إنشاء المدير. سيتم تحويلك إلى تسجيل الدخول.", true);
    window.location.replace("/admin/login");
  } catch {
    setMessage("حدث خطأ غير متوقع. حاول مرة أخرى.");
  } finally {
    submitButton.disabled = false;
  }
});

prepareSetupPage().catch(() => {
  setMessage("تعذر التحقق من حالة الإعداد الآن.");
});

const emailNode = document.querySelector("#admin-email");
const roleNode = document.querySelector("#admin-role");
const message = document.querySelector("#dashboard-message");
const logoutButton = document.querySelector("#logout-button");

function setMessage(text) {
  message.textContent = text;
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

async function loadSession() {
  const { response, body } = await fetchJson("/api/admin/session");
  if (!response.ok || !body.authenticated) {
    window.location.replace("/admin/login");
    return;
  }

  emailNode.textContent = body.user.email;
  roleNode.textContent = body.user.role;
}

logoutButton.addEventListener("click", async () => {
  logoutButton.disabled = true;
  setMessage("");

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

loadSession().catch(() => {
  window.location.replace("/admin/login");
});

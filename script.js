// ----------------------------
// Smooth Scroll Helper

// ----------------------------
function scrollToId(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

document.getElementById("applyNow")?.addEventListener("click", () =>
  scrollToId("application")
);

function startApplication(type) {
  if (type) localStorage.setItem("loan_type", type);
  scrollToId("application");
  showToast("🚀 Starting application for " + (type || "selected") + " loan");
}

// ---------Loan Calculator-------------------
function revealOnScroll() {
  const reveals = document.querySelectorAll(".reveal");
  for (let el of reveals) {
    const windowHeight = window.innerHeight;
    const elementTop = el.getBoundingClientRect().top;
    if (elementTop < windowHeight - 100) {
      el.classList.add("active");
    }
  }
}
window.addEventListener("scroll", revealOnScroll);

// Dark Mode Toggle
// ----------------------------
const themeToggle = document.getElementById("themeToggle");
const themeIcon = document.getElementById("themeIcon");

if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark");
  if (themeIcon) themeIcon.textContent = "☀️";
}

themeToggle?.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  const isDark = document.body.classList.contains("dark");
  themeIcon.textContent = isDark ? "☀️" : "🌙";
  localStorage.setItem("theme", isDark ? "dark" : "light");
});

// ----------------------------
// Consent Modal
// ----------------------------
const consentModal = document.getElementById("consentModal");
document
  .getElementById("consentOpen")
  ?.addEventListener("click", () =>
    consentModal.setAttribute("aria-hidden", "false")
  );
document
  .getElementById("consentClose")
  ?.addEventListener("click", () =>
    consentModal.setAttribute("aria-hidden", "true")
  );
document
  .getElementById("consentDecline")
  ?.addEventListener("click", () =>
    consentModal.setAttribute("aria-hidden", "true")
  );
document.getElementById("consentAgree")?.addEventListener("click", () => {
  consentModal.setAttribute("aria-hidden", "true");
  localStorage.setItem("consentGiven", "true");
  showToast("✅ You agreed to electronic consent. You may now proceed.");
});

// ----------------------------
// Toast Notification
// ----------------------------
function showToast(message) {
  const toast = document.createElement("div");
  toast.textContent = message;
  toast.className = "toast-message";
  document.body.appendChild(toast);

  setTimeout(() => toast.classList.add("show"), 100);
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 500);
  }, 4000);
}

// ----------------------------
// Login Modal
// ----------------------------
const loginModal = document.getElementById("loginModal");
document
  .getElementById("loginBtn")
  ?.addEventListener("click", () =>
    loginModal.setAttribute("aria-hidden", "false")
  );
document
  .getElementById("loginClose")
  ?.addEventListener("click", () =>
    loginModal.setAttribute("aria-hidden", "true")
  );
document
  .getElementById("loginCancel")
  ?.addEventListener("click", () =>
    loginModal.setAttribute("aria-hidden", "true")
  );

function fakeLogin(e) {
  e.preventDefault();
  const user = document.getElementById("username").value.trim();
  const pass = document.getElementById("password").value.trim();

  if (user === "admin" && pass === "1234") {
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("loggedUser", user);
    showToast(`✅ Welcome back, ${user}!`);
    loginModal.setAttribute("aria-hidden", "true");
    window.location.href = "dashboard.html";
  } else {
    showToast("❌ Invalid username or password");
  }
  return false;
}

// Auto close modal (ESC + outside click)
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    document.querySelectorAll(".modal").forEach((m) =>
      m.setAttribute("aria-hidden", "true")
    );
  }
});
document.querySelectorAll(".modal").forEach((modal) => {
  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.setAttribute("aria-hidden", "true");
  });
});

// ----------------------------
// Multi-Step Loan Form
// ----------------------------
const loanForm = document.getElementById("loanForm");
const steps = document.querySelectorAll(".form-step");
const progressSteps = document.querySelectorAll(".progress-step");
const progressBar = document.querySelector(".progress-bar"); // optional progress line
const nextBtns = document.querySelectorAll(".next");
const prevBtns = document.querySelectorAll(".prev");

let formStep = 0;

// Update steps + progress bar
function updateFormSteps() {
  steps.forEach((s, i) => s.classList.toggle("active", i === formStep));
  progressSteps.forEach((p, i) => p.classList.toggle("active", i <= formStep));

  if (progressBar) {
    progressBar.style.width =
      ((formStep + 1) / steps.length) * 100 + "%";
  }
}

// Validate required fields before going next
function validateStep(stepIndex) {
  const inputs = steps[stepIndex].querySelectorAll("input, select, textarea");
  for (let input of inputs) {
    if (input.hasAttribute("required") && !input.value.trim()) {
      showToast("⚠️ Please fill out all required fields");
      input.focus();
      return false;
    }
  }
  return true;
}

nextBtns.forEach((btn) =>
  btn.addEventListener("click", () => {
    if (validateStep(formStep) && formStep < steps.length - 1) {
      formStep++;
      updateFormSteps();
    }
  })
);
prevBtns.forEach((btn) =>
  btn.addEventListener("click", () => {
    if (formStep > 0) {
      formStep--;
      updateFormSteps();
    }
  })
);

// Save draft on input
loanForm?.addEventListener("input", () => {
  const formData = new FormData(loanForm);
  localStorage.setItem(
    "loan_draft",
    JSON.stringify(Object.fromEntries(formData.entries()))
  );
});

// Final Submit
loanForm?.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!validateStep(formStep)) return;

  const data = Object.fromEntries(new FormData(loanForm).entries());
  data.date = new Date().toLocaleString();

  const apps = JSON.parse(localStorage.getItem("applications") || "[]");
  apps.push(data);
  localStorage.setItem("applications", JSON.stringify(apps));

  showToast("✅ Application Submitted Successfully!");
  loanForm.reset();
  localStorage.removeItem("loan_draft");
  formStep = 0;
  updateFormSteps();
});

// Restore draft
window.addEventListener("DOMContentLoaded", () => {
  const draft = JSON.parse(localStorage.getItem("loan_draft") || "{}");
  Object.entries(draft).forEach(([k, v]) => {
    if (loanForm[k]) loanForm[k].value = v;
  });

  const loanType = localStorage.getItem("loan_type");
  if (loanType && loanForm?.reason) {
    loanForm.reason.value = loanType;
  }
  updateFormSteps();
});

// ----------------------------
// Session Protection (Optional)
// ----------------------------
if (window.location.pathname.includes("dashboard.html")) {
  if (localStorage.getItem("isLoggedIn") !== "true") {
    showToast("⚠️ Please login first");
    window.location.href = "index.html";
  }
}

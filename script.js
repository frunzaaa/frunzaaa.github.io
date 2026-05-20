// ===========================
// NECAZ SOFTWARE — admin & helpers
// ===========================

// IMPORTANT: This is a simple "password" for basic blocking.
// Anyone who looks at the code can see it. DO NOT use important passwords here.
// For real security you need a backend.
const ADMIN_PASSWORD = "floricel";
const ADMIN_KEY = "necaz_admin";

function esteAdmin() {
  return localStorage.getItem(ADMIN_KEY) === "yes";
}

function loginAdmin() {
  const input = document.getElementById('admin-password');
  if (!input) return;
  if (input.value === ADMIN_PASSWORD) {
    localStorage.setItem(ADMIN_KEY, "yes");
    location.reload();
  } else {
    alert("Wrong password.");
    input.value = "";
  }
}

function logoutAdmin() {
  if (!confirm("Are you sure you want to exit admin mode?")) return;
  localStorage.removeItem(ADMIN_KEY);
  location.reload();
}

// anti-XSS helper for user text
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function formateazaData(timestamp) {
  const luni = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const d = new Date(timestamp);
  return `${d.getDate().toString().padStart(2, '0')} ${luni[d.getMonth()]} ${d.getFullYear()}`;
}
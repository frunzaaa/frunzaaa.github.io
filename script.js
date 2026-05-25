// Parola simpla pentru blocare de baza. Vizibila in cod - nu folosi parole importante aici.
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
    if (window.necazAdmin && window.necazAdmin.porneșteHeartbeat) {
      window.necazAdmin.porneșteHeartbeat();
    }
    location.reload();
  } else {
    alert("Wrong password.");
    input.value = "";
  }
}

function logoutAdmin() {
  if (!confirm("Are you sure you want to exit admin mode?")) return;
  localStorage.removeItem(ADMIN_KEY);
  if (window.necazAdmin) {
    if (window.necazAdmin.opresteHeartbeat) window.necazAdmin.opresteHeartbeat();
    if (window.necazAdmin.marcheazaOffline) window.necazAdmin.marcheazaOffline();
  }
  setTimeout(() => location.reload(), 300);
}

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
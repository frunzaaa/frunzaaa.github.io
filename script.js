function esteAdmin() {
  return window.necazAdmin && window.necazAdmin.esteAdmin && window.necazAdmin.esteAdmin();
}

async function loginAdmin() {
  const emailInput = document.getElementById('admin-email');
  const passInput = document.getElementById('admin-password');
  if (!emailInput || !passInput) return;

  const email = emailInput.value.trim();
  const parola = passInput.value;

  if (!email || !parola) {
    alert("Enter email and password.");
    return;
  }

  if (!window.necazAdmin || !window.necazAdmin.login) {
    alert("Authentication not ready. Please wait a moment and try again.");
    return;
  }

  const rezultat = await window.necazAdmin.login(email, parola);
  if (rezultat.ok) {
    location.reload();
  } else {
    alert("Login failed. Check your email and password.");
    passInput.value = "";
  }
}

async function logoutAdmin() {
  if (!confirm("Are you sure you want to exit admin mode?")) return;
  if (window.necazAdmin && window.necazAdmin.logout) {
    await window.necazAdmin.logout();
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
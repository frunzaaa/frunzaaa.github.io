// =====================================================
// NECAZ SOFTWARE — Firebase status sync
// =====================================================
// Functioneaza pe toate paginile:
//  - Citeste statusul admin la fiecare 60 sec
//  - Daca timestamp-ul ultimului heartbeat e mai vechi de 90 sec → offline
//  - Daca utilizatorul e admin pe pagina aia, scrie heartbeat la fiecare 30 sec
//  - Cand iese din admin (logout), scrie status "offline"
// =====================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore, doc, setDoc, onSnapshot, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ====== CONFIGURATIA FIREBASE ======
const firebaseConfig = {
  apiKey: "AIzaSyAiRu-qtxFlZQyqSYfDSyQMbEPseFtVuO4",
  authDomain: "necaz-software.firebaseapp.com",
  projectId: "necaz-software",
  storageBucket: "necaz-software.firebasestorage.app",
  messagingSenderId: "1055961660317",
  appId: "1:1055961660317:web:844b28d89e89c6ebe10d74"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// expun global pentru blog.html (care si el foloseste Firebase)
window.firebaseApp = app;
window.firebaseDb = db;

const STATUS_DOC = doc(db, 'meta', 'adminStatus');
const OFFLINE_THRESHOLD_MS = 90 * 1000; // 90 secunde fara heartbeat = offline

// ===== ASCULTA SCHIMBARI DE STATUS (toate paginile) =====
function updateStatusUI(isOnline) {
  const navStatus = document.querySelectorAll('.nav-status');
  navStatus.forEach(ns => {
    ns.classList.toggle('admin-online', isOnline);
    const txt = ns.querySelector('span:last-child');
    if (txt) txt.textContent = isOnline ? 'admin online' : 'drinking coffee';
  });
}

function checkIfOnline(lastHeartbeat) {
  if (!lastHeartbeat) return false;
  const now = Date.now();
  const last = lastHeartbeat.toDate ? lastHeartbeat.toDate().getTime() : lastHeartbeat;
  return (now - last) < OFFLINE_THRESHOLD_MS;
}

// asculta status-ul in timp real
let cachedHeartbeat = null;
onSnapshot(STATUS_DOC, (snap) => {
  if (snap.exists()) {
    const data = snap.data();
    cachedHeartbeat = data.lastHeartbeat;
    updateStatusUI(checkIfOnline(cachedHeartbeat));
  } else {
    updateStatusUI(false);
  }
}, (err) => {
  console.warn('Status sync error:', err);
});

// re-evalueaza la fiecare 60 sec (in caz ca heartbeat-ul nu se mai actualizeaza)
setInterval(() => {
  updateStatusUI(checkIfOnline(cachedHeartbeat));
}, 60 * 1000);

// ===== HEARTBEAT (doar daca esti admin) =====
async function trimiteHeartbeat() {
  try {
    await setDoc(STATUS_DOC, {
      lastHeartbeat: serverTimestamp()
    }, { merge: true });
  } catch (err) {
    console.warn('Heartbeat error:', err);
  }
}

async function marcheazaOffline() {
  try {
    // setam un timestamp foarte vechi ca sa fie sigur tratat ca offline
    await setDoc(STATUS_DOC, {
      lastHeartbeat: new Date(2000, 0, 1) // 1 ian 2000
    }, { merge: true });
  } catch (err) {
    console.warn('Offline mark error:', err);
  }
}

// pornește heartbeat-ul daca utilizatorul e admin
let heartbeatInterval = null;

function porneșteHeartbeat() {
  if (heartbeatInterval) return;
  trimiteHeartbeat();
  heartbeatInterval = setInterval(trimiteHeartbeat, 30 * 1000);
}

function opresteHeartbeat() {
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
    heartbeatInterval = null;
  }
}

// expun functiile global ca sa fie chemate din blog.html (login/logout admin)
window.necazAdmin = {
  porneșteHeartbeat,
  opresteHeartbeat,
  marcheazaOffline
};

// daca esteAdmin() exista si returneaza true, pornim heartbeat-ul
function tryStartHeartbeat() {
  if (typeof esteAdmin === 'function' && esteAdmin()) {
    porneșteHeartbeat();
  }
}

// asteapta sa fie incarcat script.js (care defineste esteAdmin)
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', tryStartHeartbeat);
} else {
  tryStartHeartbeat();
}

// cand utilizatorul inchide tab-ul, daca era admin → marcheaza offline
window.addEventListener('beforeunload', () => {
  if (heartbeatInterval) {
    // best-effort: incercam sa marcam offline, dar nu e garantat
    marcheazaOffline();
  }
});
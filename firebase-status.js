import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore, doc, setDoc, onSnapshot, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

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

window.firebaseApp = app;
window.firebaseDb = db;

const STATUS_DOC = doc(db, 'meta', 'adminStatus');
const OFFLINE_THRESHOLD_MS = 90 * 1000;

function formateazaLastActive(ts) {
  if (!ts) return '';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  const luni = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'];
  const zi = d.getDate();
  const luna = luni[d.getMonth()];
  const an = d.getFullYear();
  const ora = d.getHours().toString().padStart(2, '0');
  const minut = d.getMinutes().toString().padStart(2, '0');
  return `on ${zi} ${luna} ${an} at ${ora}:${minut}`;
}

function updateStatusUI(isOnline, lastActive) {
  const navStatus = document.querySelectorAll('.nav-status');
  navStatus.forEach(ns => {
    ns.classList.toggle('admin-online', isOnline);
    const txt = ns.querySelector('span:last-child');
    if (txt) txt.textContent = isOnline ? 'admin online' : 'drinking coffee';

    let lastEl = ns.querySelector('.last-active');
    if (isOnline) {
      if (lastEl) lastEl.remove();
    } else if (lastActive) {
      if (!lastEl) {
        lastEl = document.createElement('span');
        lastEl.className = 'last-active';
        ns.appendChild(lastEl);
      }
      lastEl.textContent = 'last active ' + formateazaLastActive(lastActive);
    }
  });
}

function checkIfOnline(lastHeartbeat) {
  if (!lastHeartbeat) return false;
  const now = Date.now();
  const last = lastHeartbeat.toDate ? lastHeartbeat.toDate().getTime() : lastHeartbeat;
  return (now - last) < OFFLINE_THRESHOLD_MS;
}

let cachedHeartbeat = null;
let cachedLastActive = null;
onSnapshot(STATUS_DOC, (snap) => {
  if (snap.exists()) {
    const data = snap.data();
    cachedHeartbeat = data.lastHeartbeat;
    cachedLastActive = data.lastActive;
    updateStatusUI(checkIfOnline(cachedHeartbeat), cachedLastActive);
  } else {
    updateStatusUI(false, null);
  }
}, (err) => {
  console.warn('Status sync error:', err);
});

setInterval(() => {
  updateStatusUI(checkIfOnline(cachedHeartbeat), cachedLastActive);
}, 60 * 1000);

async function trimiteHeartbeat() {
  try {
    await setDoc(STATUS_DOC, {
      lastHeartbeat: serverTimestamp(),
      lastActive: serverTimestamp()
    }, { merge: true });
  } catch (err) {
    console.warn('Heartbeat error:', err);
  }
}

async function marcheazaOffline() {
  try {
    await setDoc(STATUS_DOC, {
      lastHeartbeat: new Date(2000, 0, 1),
      lastActive: serverTimestamp()
    }, { merge: true });
  } catch (err) {
    console.warn('Offline mark error:', err);
  }
}

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

window.necazAdmin = {
  porneșteHeartbeat,
  opresteHeartbeat,
  marcheazaOffline
};

function tryStartHeartbeat() {
  if (typeof esteAdmin === 'function' && esteAdmin()) {
    porneșteHeartbeat();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', tryStartHeartbeat);
} else {
  tryStartHeartbeat();
}

window.addEventListener('beforeunload', () => {
  if (heartbeatInterval) {
    marcheazaOffline();
  }
});
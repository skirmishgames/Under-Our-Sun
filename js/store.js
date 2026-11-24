// Browser storage: IndexedDB for missions, localStorage for small settings.
import { normaliseMission, uid } from './data/schema.js?v=028b51ca';

const DB_NAME = 'uos-missions';
const STORE = 'missions';
let dbp = null;

function db() {
  if (!dbp) {
    dbp = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => {
        const d = req.result;
        if (!d.objectStoreNames.contains(STORE)) d.createObjectStore(STORE, { keyPath: 'id' });
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }
  return dbp;
}

function tx(mode, fn) {
  return db().then(d => new Promise((resolve, reject) => {
    const t = d.transaction(STORE, mode);
    const st = t.objectStore(STORE);
    let result;
    Promise.resolve(fn(st)).then(r => { result = r; });
    t.oncomplete = () => resolve(result);
    t.onerror = () => reject(t.error);
    t.onabort = () => reject(t.error);
  }));
}

function reqP(r) { return new Promise((res, rej) => { r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); }); }

export async function listMissions() {
  const all = await tx('readonly', st => reqP(st.getAll()));
  return (all || []).map(normaliseMission).sort((a, b) => String(b.updated).localeCompare(String(a.updated)));
}

export async function getMission(id) {
  const m = await tx('readonly', st => reqP(st.get(id)));
  return m ? normaliseMission(m) : null;
}

export async function saveMission(m) {
  m.updated = new Date().toISOString();
  await tx('readwrite', st => reqP(st.put(JSON.parse(JSON.stringify(m)))));
  return m;
}

export async function deleteMission(id) {
  await tx('readwrite', st => reqP(st.delete(id)));
}

// ---------- backup ----------

export function exportPayload(missions) {
  return {
    format: 'uos-missions',
    version: 1,
    exported: new Date().toISOString(),
    missions: missions.map(m => JSON.parse(JSON.stringify(m)))
  };
}

export function downloadJson(obj, filename) {
  const blob = new Blob([JSON.stringify(obj, null, 1)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
}

// Accepts a backup file or a single mission. Imports clash-free copies.
export async function importJson(text) {
  let data;
  try { data = JSON.parse(text); } catch { throw new Error('That file is not valid JSON.'); }
  const list = Array.isArray(data) ? data : data && Array.isArray(data.missions) ? data.missions : data && data.parts ? [data] : null;
  if (!list) throw new Error('No missions found in that file.');
  const existing = new Set((await listMissions()).map(m => m.id));
  const imported = [];
  for (const raw of list) {
    const m = normaliseMission(raw);
    if (existing.has(m.id)) m.id = uid('m');
    existing.add(m.id);
    await saveMission(m);
    imported.push(m);
  }
  return imported;
}

// ---------- settings ----------

export function getSetting(key, fallback) {
  try {
    const v = localStorage.getItem('uos.' + key);
    return v === null ? fallback : JSON.parse(v);
  } catch { return fallback; }
}

export function setSetting(key, value) {
  try { localStorage.setItem('uos.' + key, JSON.stringify(value)); } catch { /* storage unavailable */ }
}

export function slug(s) {
  return String(s || 'mission').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'mission';
}

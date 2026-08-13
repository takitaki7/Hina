"use strict";

/* ------------------------------------------------------------------ *
 * Hina — a calm new tab (Liquid Glass edition).
 * Everything runs on-device. No backend, no network, no accounts.
 * State lives in chrome.storage.local (falls back to localStorage
 * so the page also works when opened directly as a web demo).
 * ------------------------------------------------------------------ */

const ENGINES = {
  google: { label: "Google", url: "https://www.google.com/search?q=" },
  bing: { label: "Bing", url: "https://www.bing.com/search?q=" },
  duckduckgo: { label: "DuckDuckGo", url: "https://duckduckgo.com/?q=" },
  ecosia: { label: "Ecosia", url: "https://www.ecosia.org/search?q=" },
  brave: { label: "Brave", url: "https://search.brave.com/search?q=" },
};

const DEFAULTS = {
  name: "",
  lang: "en", // English-first; users can switch to Auto / 日本語 / Español
  engine: "google",
  bg: { mode: "preset", preset: "sky", c1: "#7db9f0", c2: "#eaf6ff" },
  links: [
    { name: "Gmail", url: "https://mail.google.com" },
    { name: "YouTube", url: "https://youtube.com" },
    { name: "GitHub", url: "https://github.com" },
    { name: "Calendar", url: "https://calendar.google.com" },
    { name: "Maps", url: "https://maps.google.com" },
  ],
  focusText: "",                            // an intention you can edit anytime
  todos: [],
  notes: "",
  toggles: { dial: true, clock24: true, seconds: false, chime: true },
  firstRunDone: false,
};

/* ---------- storage abstraction ---------- */
const hasChrome = typeof chrome !== "undefined" && chrome.storage && chrome.storage.local;
const store = {
  get() {
    return new Promise((resolve) => {
      if (hasChrome) {
        chrome.storage.local.get("dawn", (r) => resolve(r.dawn || {}));
      } else {
        try { resolve(JSON.parse(localStorage.getItem("dawn") || "{}")); }
        catch { resolve({}); }
      }
    });
  },
  set(data) {
    if (hasChrome) chrome.storage.local.set({ dawn: data });
    else localStorage.setItem("dawn", JSON.stringify(data));
  },
};

/* ---------- app state ---------- */
let S = {};
let T = I18N.en;
const $ = (id) => document.getElementById(id);
const todayKey = () => new Date().toISOString().slice(0, 10);
const dayKey = (offset) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
};

function save() { store.set(S); }

/* ---------- init ---------- */
(async function init() {
  const saved = await store.get();
  S = deepMerge(structuredClone(DEFAULTS), saved);
  if (!S.focusText && saved.focus && saved.focus.text) S.focusText = saved.focus.text; // migrate old shape
  if (S.bg.mode !== "custom" && !PALETTES[S.bg.preset]) { S.bg.mode = "preset"; S.bg.preset = "sky"; } // drop removed presets/auto
  applyLang();
  renderAll();
  startClock();
  wireEvents();
  wireGlass();
  maybeOnboard();
})();

/* ---------- liquid-glass cursor light ---------- */
function wireGlass() {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) return;
  document.querySelectorAll(".glass").forEach((el) => {
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${((e.clientX - r.left) / r.width) * 100}%`);
      el.style.setProperty("--my", `${((e.clientY - r.top) / r.height) * 100}%`);
    });
    el.addEventListener("pointerleave", () => {
      el.style.setProperty("--mx", "50%");
      el.style.setProperty("--my", "0%");
    });
  });
}

function deepMerge(base, over) {
  for (const k in over) {
    if (over[k] && typeof over[k] === "object" && !Array.isArray(over[k])) {
      base[k] = deepMerge(base[k] || {}, over[k]);
    } else if (over[k] !== undefined) {
      base[k] = over[k];
    }
  }
  return base;
}

/* ---------- language ---------- */
function applyLang() {
  const code = resolveLang(S.lang);
  T = I18N[code];
  document.documentElement.lang = code;
}
function activeLangCode() { return resolveLang(S.lang); }

/* ---------- render ---------- */
function renderAll() {
  renderStaticText();
  renderClock();
  renderGreeting();
  renderFocus();
  renderSearch();
  renderDial();
  renderTodoCount();
}

function renderStaticText() {
  $("focusInput").placeholder = T.focusPlaceholder;
  $("searchInput").placeholder = T.searchPlaceholder;
  $("todoTitle").textContent = T.todoTitle;
  $("todoInput").placeholder = T.todoAdd;
  $("todoEmpty").textContent = T.todoEmpty;
  $("pomoTitle").textContent = T.pomoTitle;
  $("pomoReset").textContent = T.pomoReset;
  $("pomoLabel").textContent = T.pomoLabel;
  $("notesTitle").textContent = T.notesTitle;
  $("notesLabel").textContent = T.notesTitle;
  $("setTitle").textContent = T.setTitle;
  $("setNameLabel").textContent = T.setName;
  $("setName").placeholder = T.setNamePlaceholder;
  $("setEngineLabel").textContent = T.setEngine;
  $("setLangLabel").textContent = T.setLang;
  $("setThemeLabel").textContent = T.setTheme;
  $("ccTopLabel").textContent = T.ccTop;
  $("ccBotLabel").textContent = T.ccBot;
  $("setLinksLabel").textContent = T.setLinks;
  $("privacyNote").textContent = T.privacy;
  $("obTitle").textContent = T.ob_title;
  $("obSub").textContent = T.ob_sub;
  $("obName").placeholder = T.ob_placeholder;
  $("obGo").textContent = T.ob_go;
  $("obSkip").textContent = T.ob_skip;
  const modes = document.querySelectorAll("#pomoPanel .seg");
  if (modes[0]) modes[0].textContent = T.m_focus;
  if (modes[1]) modes[1].textContent = T.m_short;
  if (modes[2]) modes[2].textContent = T.m_long;
  if (!pomo.running) $("pomoStart").textContent = T.pomoStart;
}

/* ---------- clock + theme ---------- */
let clockTimer = null;
let clockAlign = null;
function scheduleClock() {
  clearInterval(clockTimer);
  clearTimeout(clockAlign);
  renderClock();
  if (S.toggles.seconds) {
    clockTimer = setInterval(() => { renderClock(); renderGreeting(); }, 1000);
  } else {
    const now = new Date();
    const ms = (60 - now.getSeconds()) * 1000 - now.getMilliseconds();
    clockAlign = setTimeout(() => {
      renderClock(); renderGreeting();
      clockTimer = setInterval(() => { renderClock(); renderGreeting(); }, 60000);
    }, ms);
  }
}
function startClock() { scheduleClock(); }

function renderClock() {
  const now = new Date();
  let h = now.getHours();
  if (!S.toggles.clock24) { h = h % 12 || 12; }
  const hh = S.toggles.clock24 ? String(h).padStart(2, "0") : String(h);
  const mm = String(now.getMinutes()).padStart(2, "0");
  let t = `${hh}:${mm}`;
  if (S.toggles.seconds) t += `:${String(now.getSeconds()).padStart(2, "0")}`;
  $("clock").textContent = t;
  $("date").textContent = now.toLocaleDateString(activeLangCode(), T.dateFmt);
  applyTheme();
}

/* ---------- background palette ----------
   Each palette: { s: [3 gradient stops], tone: "light" | "dark" }.
   Light palettes flip the UI to dark text for readability. */
const PALETTES = {
  white: { s: ["#e9eef5", "#f5f8fc", "#ffffff"], tone: "light" },
  sky:   { s: ["#79b8f2", "#a9d8f2", "#e9f6ff"], tone: "light" },
  pink:  { s: ["#ff9ec6", "#ffc7e0", "#fff1f7"], tone: "light" },
  black: { s: ["#08080c", "#141420", "#232532"], tone: "dark" },
};
const PALETTE_ORDER = ["white", "sky", "pink", "black"];

function hexToRgb(h) { h = h.replace("#", ""); return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)); }
function rgbToHex(a) { return "#" + a.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join(""); }
function rgbToHsl([r, g, b]) {
  r /= 255; g /= 255; b /= 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b); let h, s, l = (mx + mn) / 2;
  if (mx === mn) { h = s = 0; }
  else { const d = mx - mn; s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
    switch (mx) { case r: h = (g - b) / d + (g < b ? 6 : 0); break; case g: h = (b - r) / d + 2; break; default: h = (r - g) / d + 4; } h /= 6; }
  return [h * 360, s * 100, l * 100];
}
function hslToRgb([h, s, l]) {
  h /= 360; s /= 100; l /= 100; let r, g, b;
  if (s === 0) { r = g = b = l; }
  else { const q = l < 0.5 ? l * (1 + s) : l + s - l * s; const p = 2 * l - q;
    const f = (t) => { if (t < 0) t += 1; if (t > 1) t -= 1; if (t < 1 / 6) return p + (q - p) * 6 * t; if (t < 1 / 2) return q; if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6; return p; };
    r = f(h + 1 / 3); g = f(h); b = f(h - 1 / 3); }
  return [r * 255, g * 255, b * 255];
}
function adjust(hex, dL, dS, dH = 0) {
  let [h, s, l] = rgbToHsl(hexToRgb(hex));
  h = (h + dH + 360) % 360; s = Math.max(0, Math.min(100, s + dS)); l = Math.max(0, Math.min(100, l + dL));
  return rgbToHex(hslToRgb([h, s, l]));
}
function mixHex(a, c, t) { const A = hexToRgb(a), C = hexToRgb(c); return rgbToHex(A.map((v, i) => v + (C[i] - v) * t)); }
function deriveBlobs([a, b, c]) { return [adjust(c, 6, 22, 4), adjust(b, 2, 18, -12), adjust(c, 14, 14, 16), adjust(a, 24, 20, 8)]; }

function luminance(hex) {
  const [r, g, b] = hexToRgb(hex).map((v) => {
    v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function toneForStops(s) {
  const avg = (luminance(s[0]) + luminance(s[1]) + luminance(s[2])) / 3;
  return avg > 0.5 ? "light" : "dark";
}
function paletteFor(bg) {
  if (bg.mode === "custom") { const s = [bg.c1, mixHex(bg.c1, bg.c2, 0.5), bg.c2]; return { s, tone: toneForStops(s) }; }
  return PALETTES[bg.preset] || PALETTES.sky;
}
function applyTheme() {
  const p = paletteFor(S.bg);
  const r = document.documentElement.style;
  r.setProperty("--bg1", p.s[0]); r.setProperty("--bg2", p.s[1]); r.setProperty("--bg3", p.s[2]);
  deriveBlobs(p.s).forEach((cl, i) => r.setProperty(`--blob${i + 1}`, cl));
  document.documentElement.dataset.tone = p.tone;
}

function renderGreeting() {
  const h = new Date().getHours();
  let g;
  if (h >= 5 && h < 12) g = T.g_morning;
  else if (h >= 12 && h < 18) g = T.g_afternoon;
  else if (h >= 18 && h < 23) g = T.g_evening;
  else g = T.g_night;
  $("greeting").textContent = S.name ? `${g}, ${S.name}.` : `${g}.`;
}

/* ---------- focus (an always-editable intention) ---------- */
function renderFocus() {
  const el = $("focusInput");
  if (document.activeElement !== el) el.value = S.focusText || "";
}

/* ---------- search ---------- */
function renderSearch() { $("engineBadge").textContent = ENGINES[S.engine].label; }

function runSearch(q) {
  q = q.trim();
  if (!q) return;
  if (isUrl(q)) { location.href = /^https?:\/\//i.test(q) ? q : "https://" + q; return; }
  location.href = ENGINES[S.engine].url + encodeURIComponent(q);
}
function isUrl(s) {
  if (/\s/.test(s)) return false;
  return /^https?:\/\//i.test(s) || /^[\w-]+(\.[\w-]+)+.*$/.test(s);
}

/* ---------- speed dial ---------- */
function renderDial() {
  const dial = $("dial");
  dial.innerHTML = "";
  dial.hidden = !S.toggles.dial;
  if (!S.toggles.dial) return;
  S.links.forEach((l) => {
    const a = document.createElement("a");
    a.href = normalizeUrl(l.url);
    const tile = document.createElement("div");
    tile.className = "tile";
    tile.textContent = (l.name || l.url).trim().charAt(0).toUpperCase();
    const span = document.createElement("span");
    span.textContent = l.name || hostOf(l.url);
    a.append(tile, span);
    dial.append(a);
  });
}
function normalizeUrl(u) { return /^https?:\/\//i.test(u) ? u : "https://" + u; }
function hostOf(u) { try { return new URL(normalizeUrl(u)).hostname.replace(/^www\./, ""); } catch { return u; } }

/* ---------- todo ---------- */
function renderTodoCount() {
  const open = S.todos.filter((t) => !t.done).length;
  $("todoCount").textContent = open > 0 ? `${open}` : T.todoCountZero;
}
function renderTodoList() {
  const ul = $("todoList");
  ul.innerHTML = "";
  $("todoEmpty").hidden = S.todos.length > 0;
  S.todos.forEach((t) => {
    const li = document.createElement("li");
    if (t.done) li.classList.add("done");
    const check = document.createElement("div");
    check.className = "check";
    check.innerHTML = CHECK_SVG;
    check.onclick = () => { t.done = !t.done; save(); renderTodoList(); renderTodoCount(); };
    const txt = document.createElement("span");
    txt.className = "txt";
    txt.textContent = t.text;
    const del = document.createElement("button");
    del.className = "del";
    del.textContent = "✕";
    del.onclick = () => { S.todos = S.todos.filter((x) => x.id !== t.id); save(); renderTodoList(); renderTodoCount(); };
    li.append(check, txt, del);
    ul.append(li);
  });
}

/* ---------- pomodoro (auto-cycling focus / break) ---------- */
const RING_CIRC = 2 * Math.PI * 52; // r=52 in the SVG
const SVG_ATTR = 'viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"';
const SOUND_ON = `<svg ${SVG_ATTR}><path d="M11 5 6 9H2v6h4l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M19.5 5.5a9 9 0 0 1 0 13"/></svg>`;
const SOUND_OFF = `<svg ${SVG_ATTR}><path d="M11 5 6 9H2v6h4l5 4z"/><path d="M22 9l-6 6"/><path d="M16 9l6 6"/></svg>`;
const CHECK_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l4 4L19 7"/></svg>`;
const pomo = {
  focusMin: 25, breakMin: 5, longBreakMin: 15,
  phase: "focus", sessions: 0,
  total: 25 * 60, remaining: 25 * 60,
  running: false, timer: null,
};

function phaseMinutes() {
  if (pomo.phase === "break") return pomo.sessions % 4 === 0 ? pomo.longBreakMin : pomo.breakMin;
  return pomo.focusMin;
}
function renderPomo() {
  const mmss = `${String(Math.floor(pomo.remaining / 60)).padStart(2, "0")}:${String(pomo.remaining % 60).padStart(2, "0")}`;
  $("pomoTime").textContent = mmss;
  $("pomoStart").textContent = pomo.running ? T.pomoPause : T.pomoStart;
  $("pomoPhase").textContent = pomo.phase === "break" ? T.pomoBreak : T.pomoFocus;
  const frac = pomo.total ? pomo.remaining / pomo.total : 0;
  $("ringFill").style.strokeDashoffset = String(RING_CIRC * (1 - frac));
  $("pomoMute").innerHTML = S.toggles.chime ? SOUND_ON : SOUND_OFF;
  $("pomoMute").title = S.toggles.chime ? T.pomoSoundOn : T.pomoSoundOff;
  renderPomoDots();
  // surface the live countdown on the main page (bottom-right pill)
  const pill = $("pomoBtn");
  if (pomo.running) {
    $("pomoLabel").textContent = mmss;
    pill.classList.add("running");
  } else {
    $("pomoLabel").textContent = T.pomoLabel;
    pill.classList.remove("running");
  }
}
function renderPomoDots() {
  const box = $("pomoDots");
  box.innerHTML = "";
  const filled = pomo.sessions % 4; // completed focus blocks in the current cycle
  for (let i = 0; i < 4; i++) {
    const d = document.createElement("span");
    d.className = "dot" + (i < filled ? " on" : "");
    box.append(d);
  }
}
function pomoTick() {
  if (pomo.remaining <= 0) { pomoAdvance(); return; }
  pomo.remaining--;
  renderPomo();
}
function pomoAdvance() {
  chime();
  if (pomo.phase === "focus") {
    pomo.sessions++;
    pomo.phase = "break";
    flashTitle(T.pomoDone);
  } else {
    pomo.phase = "focus";
  }
  pomo.total = phaseMinutes() * 60;
  pomo.remaining = pomo.total;
  renderPomo(); // the running interval keeps the next phase going automatically
}
function pomoToggle() {
  if (pomo.running) { pomoStop(); return; }
  ensureAudio(); // unlock audio inside this user gesture so the chime can play later
  pomo.running = true;
  pomo.timer = setInterval(pomoTick, 1000);
  renderPomo();
}
function ensureAudio() {
  if (!S.toggles.chime) return;
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === "suspended") audioCtx.resume();
  } catch { /* no audio */ }
}
function pomoStop() { pomo.running = false; clearInterval(pomo.timer); pomo.timer = null; renderPomo(); }
function pomoReset() {
  pomoStop();
  pomo.phase = "focus"; pomo.sessions = 0;
  pomo.total = phaseMinutes() * 60; pomo.remaining = pomo.total;
  renderPomo();
}

/* gentle two-note chime via WebAudio — no asset, no network */
let audioCtx = null;
function chime() {
  if (!S.toggles.chime) return;
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    const ctx = audioCtx;
    const t0 = ctx.currentTime;
    [880, 1318.5].forEach((f, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine";
      o.frequency.value = f;
      o.connect(g); g.connect(ctx.destination);
      const t = t0 + i * 0.18;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.16, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
      o.start(t); o.stop(t + 0.55);
    });
  } catch { /* audio unavailable — silent */ }
}

let titleTimer = null;
function flashTitle(msg) {
  document.title = "🔔 " + msg;
  clearTimeout(titleTimer);
  titleTimer = setTimeout(() => (document.title = "Hina"), 6000);
}

/* ---------- notes ---------- */
let notesTimer = null;
function renderNotes() {
  $("notesArea").value = S.notes || "";
  $("notesArea").placeholder = T.notesPlaceholder;
  $("notesSaved").textContent = "";
}
function saveNotes() {
  S.notes = $("notesArea").value;
  save();
  $("notesSaved").textContent = T.notesSaved;
  clearTimeout(notesTimer);
  notesTimer = setTimeout(() => ($("notesSaved").textContent = ""), 1500);
}

/* ---------- settings ---------- */
function renderSettings() {
  $("setName").value = S.name;
  $("setEngine").value = S.engine;
  $("setLang").value = S.lang;
  renderPalette();
  renderLinkEditor();
  renderToggles();
}

/* ---------- background palette picker ---------- */
function bgActive(key) {
  if (key === "custom") return S.bg.mode === "custom";
  return S.bg.mode === "preset" && S.bg.preset === key;
}
function renderPalette() {
  const box = $("palette");
  box.innerHTML = "";
  const swatch = (key, stops, label) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "swatch" + (bgActive(key) ? " active" : "");
    b.style.background = `linear-gradient(145deg, ${stops[0]}, ${stops[1]} 50%, ${stops[2]})`;
    b.title = key;
    if (label) { const s = document.createElement("span"); s.className = "lbl"; s.textContent = label; b.append(s); }
    b.addEventListener("click", () => selectPalette(key));
    box.append(b);
  };
  PALETTE_ORDER.forEach((k) => swatch(k, PALETTES[k].s));
  swatch("custom", [S.bg.c1, mixHex(S.bg.c1, S.bg.c2, 0.5), S.bg.c2], "✎");
  $("customRow").hidden = S.bg.mode !== "custom";
  $("ccTop").value = S.bg.c1;
  $("ccBot").value = S.bg.c2;
}
function selectPalette(key) {
  if (key === "custom") S.bg.mode = "custom";
  else { S.bg.mode = "preset"; S.bg.preset = key; }
  save();
  applyTheme();
  renderPalette();
}
// live update while dragging the color pickers (don't rebuild the inputs)
function markCustomActive() {
  const sws = document.querySelectorAll("#palette .swatch");
  sws.forEach((b) => b.classList.remove("active"));
  const custom = sws[sws.length - 1];
  if (custom) {
    custom.classList.add("active");
    custom.style.background =
      `linear-gradient(145deg, ${S.bg.c1}, ${mixHex(S.bg.c1, S.bg.c2, 0.5)} 50%, ${S.bg.c2})`;
  }
}
function renderLinkEditor() {
  const box = $("linkEditor");
  box.innerHTML = "";
  S.links.forEach((l, i) => {
    const row = document.createElement("div");
    row.className = "link-row";
    const name = document.createElement("span");
    name.className = "lr-name";
    name.textContent = l.name || hostOf(l.url);
    const url = document.createElement("span");
    url.className = "lr-url";
    url.textContent = l.url;
    const del = document.createElement("button");
    del.textContent = "✕";
    del.onclick = () => { S.links.splice(i, 1); save(); renderLinkEditor(); renderDial(); };
    row.append(name, url, del);
    box.append(row);
  });
}
const TOGGLE_KEYS = [
  { key: "dial", label: () => T.setLinks },
  { key: "clock24", label: () => T.tg_clock24 },
  { key: "seconds", label: () => T.tg_seconds },
  { key: "chime", label: () => T.tg_chime },
];
function renderToggles() {
  const box = $("toggles");
  box.innerHTML = "";
  TOGGLE_KEYS.forEach(({ key, label }) => {
    const row = document.createElement("label");
    row.className = "toggle";
    const span = document.createElement("span");
    span.textContent = label();
    const input = document.createElement("input");
    input.type = "checkbox";
    input.checked = !!S.toggles[key];
    input.onchange = () => {
      S.toggles[key] = input.checked;
      save();
      renderDial();
      if (key === "seconds") scheduleClock();
      else renderClock();
    };
    row.append(span, input);
    box.append(row);
  });
}

/* ---------- panels ---------- */
function openPanel(id) {
  closePanels();
  $(id).hidden = false;
  $("scrim").hidden = false;
}
function closePanels() {
  ["todoPanel", "pomoPanel", "settingsPanel", "notesPanel"].forEach((id) => ($(id).hidden = true));
  $("scrim").hidden = true;
}

/* ---------- onboarding ---------- */
function maybeOnboard() {
  if (S.firstRunDone) return;
  $("onboard").hidden = false;
  setTimeout(() => $("obName").focus(), 300);
}
function finishOnboard(name) {
  if (name && name.trim()) { S.name = name.trim(); renderGreeting(); }
  S.firstRunDone = true;
  save();
  $("onboard").hidden = true;
  $("focusInput").focus();
}

/* ---------- events ---------- */
function wireEvents() {
  // focus — an intention you can write and edit anytime
  let focusTimer = null;
  $("focusInput").addEventListener("input", () => {
    S.focusText = $("focusInput").value;
    clearTimeout(focusTimer);
    focusTimer = setTimeout(save, 400);
  });
  $("focusInput").addEventListener("keydown", (e) => {
    if (e.key === "Enter") { S.focusText = $("focusInput").value; save(); $("focusInput").blur(); }
  });
  $("focusInput").addEventListener("blur", () => { S.focusText = $("focusInput").value; save(); });

  // search
  $("searchForm").addEventListener("submit", (e) => { e.preventDefault(); runSearch($("searchInput").value); });

  // todo
  $("todoBtn").addEventListener("click", () => { renderTodoList(); openPanel("todoPanel"); });
  $("todoForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const v = $("todoInput").value.trim();
    if (!v) return;
    S.todos.push({ id: Date.now().toString(36), text: v, done: false });
    $("todoInput").value = "";
    save();
    renderTodoList();
    renderTodoCount();
  });

  // pomodoro
  $("pomoBtn").addEventListener("click", () => { renderPomo(); openPanel("pomoPanel"); });
  $("pomoStart").addEventListener("click", pomoToggle);
  $("pomoReset").addEventListener("click", pomoReset);
  $("pomoMute").addEventListener("click", () => { S.toggles.chime = !S.toggles.chime; save(); renderPomo(); });
  document.querySelectorAll("#pomoPanel .seg").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("#pomoPanel .seg").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      pomo.focusMin = Number(btn.dataset.min);
      pomoReset();
    });
  });

  // notes (auto-saved)
  $("notesBtn").addEventListener("click", () => { renderNotes(); openPanel("notesPanel"); setTimeout(() => $("notesArea").focus(), 60); });
  $("notesArea").addEventListener("input", saveNotes);

  // settings
  $("openSettings").addEventListener("click", () => { renderSettings(); openPanel("settingsPanel"); });
  $("setName").addEventListener("input", () => { S.name = $("setName").value; save(); renderGreeting(); });
  $("setEngine").addEventListener("change", () => { S.engine = $("setEngine").value; save(); renderSearch(); });
  $("setLang").addEventListener("change", () => { S.lang = $("setLang").value; save(); applyLang(); renderAll(); });
  $("ccTop").addEventListener("input", () => { S.bg.c1 = $("ccTop").value; S.bg.mode = "custom"; save(); applyTheme(); markCustomActive(); });
  $("ccBot").addEventListener("input", () => { S.bg.c2 = $("ccBot").value; S.bg.mode = "custom"; save(); applyTheme(); markCustomActive(); });

  $("linkAddForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const name = $("linkName").value.trim();
    const url = $("linkUrl").value.trim();
    if (!url) return;
    S.links.push({ name: name || hostOf(url), url });
    $("linkName").value = "";
    $("linkUrl").value = "";
    save();
    renderLinkEditor();
    renderDial();
  });

  // onboarding
  $("obForm").addEventListener("submit", (e) => { e.preventDefault(); finishOnboard($("obName").value); });
  $("obSkip").addEventListener("click", () => finishOnboard(""));

  // close controls
  document.querySelectorAll("[data-close]").forEach((b) => b.addEventListener("click", closePanels));
  $("scrim").addEventListener("click", closePanels);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closePanels(); });

  // "/" focuses search like power users expect
  document.addEventListener("keydown", (e) => {
    if (e.key === "/" && document.activeElement === document.body) {
      e.preventDefault();
      $("searchInput").focus();
    }
  });
}

"use strict";

/* ------------------------------------------------------------------ *
 * Dawn — a calm new tab.
 * Everything runs on-device. No backend, no network, no accounts.
 * State lives in chrome.storage.local (falls back to localStorage
 * so the page also works when opened directly during development).
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
  lang: "auto",
  engine: "google",
  theme: "time",
  links: [
    { name: "Gmail", url: "https://mail.google.com" },
    { name: "YouTube", url: "https://youtube.com" },
    { name: "GitHub", url: "https://github.com" },
    { name: "Calendar", url: "https://calendar.google.com" },
    { name: "Maps", url: "https://maps.google.com" },
  ],
  focus: { date: "", text: "" },
  todos: [],
  toggles: { quote: true, dial: true },
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
let T = I18N.en; // active translation table
const $ = (id) => document.getElementById(id);
const todayKey = () => new Date().toISOString().slice(0, 10);

function save() { store.set(S); }

/* ---------- init ---------- */
(async function init() {
  const saved = await store.get();
  S = deepMerge(structuredClone(DEFAULTS), saved);
  applyLang();
  renderAll();
  startClock();
  wireEvents();
})();

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
  renderQuote();
  renderTodoCount();
}

function renderStaticText() {
  $("focusAsk").textContent = T.focusAsk;
  $("focusInput").placeholder = T.focusPlaceholder;
  $("focusLabel").textContent = T.focusLabel;
  $("focusClear").textContent = T.focusClear;
  $("searchInput").placeholder = T.searchPlaceholder;
  $("todoTitle").textContent = T.todoTitle;
  $("todoInput").placeholder = T.todoAdd;
  $("todoEmpty").textContent = T.todoEmpty;
  $("pomoTitle").textContent = T.pomoTitle;
  $("pomoReset").textContent = T.pomoReset;
  $("pomoLabel").textContent = T.pomoLabel;
  $("setTitle").textContent = T.setTitle;
  $("setNameLabel").textContent = T.setName;
  $("setName").placeholder = T.setNamePlaceholder;
  $("setEngineLabel").textContent = T.setEngine;
  $("setLangLabel").textContent = T.setLang;
  $("setThemeLabel").textContent = T.setTheme;
  $("setLinksLabel").textContent = T.setLinks;
  $("privacyNote").textContent = T.privacy;
  const modes = document.querySelectorAll("#pomoPanel .mode");
  if (modes[0]) modes[0].textContent = T.m_focus;
  if (modes[1]) modes[1].textContent = T.m_short;
  if (modes[2]) modes[2].textContent = T.m_long;
  if (!pomo.running) $("pomoStart").textContent = T.pomoStart;
}

/* ---------- clock + theme ---------- */
function startClock() {
  renderClock();
  // tick to the top of the next minute, then every minute
  const now = new Date();
  const ms = (60 - now.getSeconds()) * 1000 - now.getMilliseconds();
  setTimeout(() => {
    renderClock();
    renderGreeting();
    setInterval(() => { renderClock(); renderGreeting(); }, 60000);
  }, ms);
}

function renderClock() {
  const now = new Date();
  const h = now.getHours();
  const m = now.getMinutes();
  $("clock").textContent = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  $("date").textContent = now.toLocaleDateString(activeLangCode(), T.dateFmt);
  applyTheme();
}

function applyTheme() {
  const bg = $("bg");
  bg.className = "bg";
  let cls;
  if (S.theme === "aurora") cls = "t-aurora";
  else if (S.theme === "dusk") cls = "t-dusk";
  else if (S.theme === "forest") cls = "t-forest";
  else if (S.theme === "mono") cls = "t-mono";
  else cls = timeClass(new Date().getHours());
  bg.classList.add(cls);
}

function timeClass(h) {
  if (h >= 5 && h < 8) return "t-dawn";
  if (h >= 8 && h < 16) return "t-day";
  if (h >= 16 && h < 19) return "t-golden";
  if (h >= 19 && h < 22) return "t-dusk";
  return "t-night";
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

/* ---------- focus ---------- */
function renderFocus() {
  const active = S.focus.date === todayKey() && S.focus.text;
  $("focusInput").hidden = !!active;
  $("focusAsk").hidden = !!active;
  $("focusDone").hidden = !active;
  if (active) $("focusText").textContent = S.focus.text;
  else $("focusInput").value = "";
}

/* ---------- search ---------- */
function renderSearch() {
  $("engineBadge").textContent = ENGINES[S.engine].label;
}

function runSearch(q) {
  q = q.trim();
  if (!q) return;
  if (isUrl(q)) {
    location.href = /^https?:\/\//i.test(q) ? q : "https://" + q;
    return;
  }
  location.href = ENGINES[S.engine].url + encodeURIComponent(q);
}

function isUrl(s) {
  if (/\s/.test(s)) return false;
  return /^https?:\/\//i.test(s) || /^[\w-]+(\.[\w-]+)+.*$/.test(s);
}

/* ---------- speed dial ---------- */
const TILE_COLORS = ["#6366f1", "#0ea5e9", "#10b981", "#f59e0b", "#ef4444", "#ec4899", "#8b5cf6", "#14b8a6"];
function colorFor(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return TILE_COLORS[h % TILE_COLORS.length];
}

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
    tile.style.background = colorFor(l.name || l.url);
    tile.textContent = (l.name || l.url).trim().charAt(0).toUpperCase();
    const span = document.createElement("span");
    span.textContent = l.name || hostOf(l.url);
    a.append(tile, span);
    dial.append(a);
  });
}

function normalizeUrl(u) { return /^https?:\/\//i.test(u) ? u : "https://" + u; }
function hostOf(u) { try { return new URL(normalizeUrl(u)).hostname.replace(/^www\./, ""); } catch { return u; } }

/* ---------- quote ---------- */
function renderQuote() {
  const q = $("quote");
  q.hidden = !S.toggles.quote;
  if (!S.toggles.quote) return;
  const list = QUOTES[activeLangCode()] || QUOTES.en;
  // deterministic per day so it feels intentional, not random noise
  const seed = Number(todayKey().replace(/-/g, ""));
  q.textContent = list[seed % list.length];
}

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
    check.textContent = "✓";
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

/* ---------- pomodoro ---------- */
const pomo = { min: 25, remaining: 25 * 60, running: false, timer: null };

function renderPomo() {
  const m = Math.floor(pomo.remaining / 60);
  const s = pomo.remaining % 60;
  $("pomoTime").textContent = `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  $("pomoStart").textContent = pomo.running ? T.pomoPause : T.pomoStart;
}

function pomoTick() {
  if (pomo.remaining <= 0) {
    pomoStop();
    $("pomoTime").textContent = T.pomoDone;
    flashTitle(T.pomoDone);
    return;
  }
  pomo.remaining--;
  renderPomo();
}

function pomoToggle() {
  if (pomo.running) { pomoStop(); return; }
  pomo.running = true;
  pomo.timer = setInterval(pomoTick, 1000);
  renderPomo();
}
function pomoStop() {
  pomo.running = false;
  clearInterval(pomo.timer);
  renderPomo();
}
function pomoReset() {
  pomoStop();
  pomo.remaining = pomo.min * 60;
  renderPomo();
}

let titleTimer = null;
function flashTitle(msg) {
  document.title = "🔔 " + msg;
  clearTimeout(titleTimer);
  titleTimer = setTimeout(() => (document.title = "Dawn"), 6000);
}

/* ---------- settings ---------- */
function renderSettings() {
  $("setName").value = S.name;
  $("setEngine").value = S.engine;
  $("setLang").value = S.lang;
  $("setTheme").value = S.theme;
  renderLinkEditor();
  renderToggles();
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
  { key: "quote", label: () => "Quote" },
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
    input.onchange = () => { S.toggles[key] = input.checked; save(); renderDial(); renderQuote(); };
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
  ["todoPanel", "pomoPanel", "settingsPanel"].forEach((id) => ($(id).hidden = true));
  $("scrim").hidden = true;
}

/* ---------- events ---------- */
function wireEvents() {
  // focus
  $("focusInput").addEventListener("keydown", (e) => {
    if (e.key === "Enter" && $("focusInput").value.trim()) {
      S.focus = { date: todayKey(), text: $("focusInput").value.trim() };
      save();
      renderFocus();
    }
  });
  $("focusClear").addEventListener("click", () => {
    S.focus = { date: "", text: "" };
    save();
    renderFocus();
    $("focusInput").focus();
  });

  // search
  $("searchForm").addEventListener("submit", (e) => {
    e.preventDefault();
    runSearch($("searchInput").value);
  });

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
  document.querySelectorAll("#pomoPanel .mode").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("#pomoPanel .mode").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      pomo.min = Number(btn.dataset.min);
      pomoReset();
    });
  });

  // settings
  $("openSettings").addEventListener("click", () => { renderSettings(); openPanel("settingsPanel"); });
  $("setName").addEventListener("input", () => { S.name = $("setName").value; save(); renderGreeting(); });
  $("setEngine").addEventListener("change", () => { S.engine = $("setEngine").value; save(); renderSearch(); });
  $("setLang").addEventListener("change", () => { S.lang = $("setLang").value; save(); applyLang(); renderAll(); });
  $("setTheme").addEventListener("change", () => { S.theme = $("setTheme").value; save(); applyTheme(); });
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

  // close controls
  document.querySelectorAll("[data-close]").forEach((b) => b.addEventListener("click", closePanels));
  $("scrim").addEventListener("click", closePanels);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closePanels(); });

  // focus the search on "/" like power users expect
  document.addEventListener("keydown", (e) => {
    if (e.key === "/" && document.activeElement === document.body) {
      e.preventDefault();
      $("searchInput").focus();
    }
  });
}

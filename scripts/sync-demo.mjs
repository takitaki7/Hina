// Copies the static Hina extension files into public/dawn so Vercel serves a
// live web demo at /dawn. The extension/ folder is the single source of truth;
// this script keeps public/dawn in sync. It runs before `next build` (see
// vercel.json) and can be run manually via `npm run sync:demo`.
//
// No dependencies — pure Node fs. The extension already falls back from
// chrome.storage to localStorage, so it runs unchanged as a plain web page.

import { mkdir, copyFile, rm } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = join(root, "extension");
const dest = join(root, "public", "dawn");

const FILES = [
  "newtab.html",
  "newtab.css",
  "newtab.js",
  "i18n.js",
  "icons/icon32.png",
  "icons/icon128.png",
  "fonts/inter.woff2",
];

await rm(dest, { recursive: true, force: true });
for (const f of FILES) {
  const to = join(dest, f);
  await mkdir(dirname(to), { recursive: true });
  await copyFile(join(src, f), to);
}
console.log(`[sync-demo] copied ${FILES.length} files → public/dawn`);

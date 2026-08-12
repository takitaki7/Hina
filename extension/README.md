# Dawn — a calm new tab 🌅

**Start every new tab with a breath of focus.**

Dawn replaces Chrome's new‑tab page with a calm, **Liquid‑Glass** dashboard: a
big clock, a living time‑of‑day gradient, a daily *one focus* with a completion
**streak**, quick search, speed‑dial links, a to‑do list, and a Pomodoro timer.
It's **English‑first** (with 日本語 and Español built in) and everything runs
**100% on your device** — no account, no server, no tracking.

![Dawn](./store/screenshot-1.png)

The interface is built on Apple's **Liquid Glass** design language —
translucent, refractive panels with specular edges, a moving mesh‑gradient
backdrop, and glass that catches the light. See `store/` for more screenshots
(focus streak, Pomodoro ring, settings, onboarding).

---

## Why this is built the way it is

The brief was blunt: a globally appealing Chrome extension that is **cheap
enough for a solo developer to run for almost nothing**, and **shaped to be
acquired**. Every design decision below serves one of those two goals.

### Operating cost ≈ $0 / month

| Concern | Choice | Cost |
| --- | --- | --- |
| Backend | **None.** All state in `chrome.storage.local` | $0 |
| Data / analytics | **None collected.** Nothing leaves the browser | $0 |
| Assets | Gradients are pure CSS; quotes/icons are bundled | $0 |
| Search | Sends the query straight to the user's chosen engine | $0 |
| Hosting | The Chrome Web Store hosts the package | $0 |

There is literally nothing to scale. One user or ten million users cost the
developer the same: nothing. The only recurring expense is the one‑time
**$5 Chrome Web Store developer registration**.

### Why it's acquisition‑shaped (the ~¥100M thesis)

New‑tab extensions are one of the most reliably **acquired** categories in the
browser‑extension market, and the reason is structural, not lucky:

1. **A default‑search surface is a real, transferable asset.** Every search a
   user runs from the box is monetizable — search partners (Bing/Yahoo
   syndication, Ecosia‑style revenue share, etc.) pay per‑query for default
   placement. An acquirer buys predictable search revenue plus the install
   base that generates it. Dawn keeps the engine switch front‑and‑center and
   defaults to Google so the surface is clean to re‑point post‑acquisition.
2. **New‑tab = daily active by definition, and Dawn engineers the habit.**
   Retention is the metric acquirers underwrite. A new‑tab page is already
   opened dozens of times a day with zero re‑engagement spend — and the daily
   **focus streak** (🔥) gives users a reason to *come back and complete
   something*, turning passive opens into a habit loop. Onboarding captures a
   first name on install for instant personalization. Higher D1/D30 retention
   is exactly what lifts the acquisition multiple.
3. **Premium surface signals quality.** The Liquid‑Glass design makes the
   product feel like a shippable, brandable asset rather than a hobby script —
   it demos well to an acquirer and to a review team.
4. **Zero liabilities to inherit.** No servers, no PII, no GDPR data‑processing
   footprint, no cloud bill. Diligence is trivial and the asset is clean —
   exactly what makes a small ($0.5–1M) tuck‑in acquisition easy to close.
5. **English‑first, global‑ready.** Targets the highest‑value English‑speaking
   ad/search markets by default, with i18n already in place so the install base
   isn't locked to one market.

In short: **cheap to run, sticky by construction, clean to buy.** That is the
combination that turns a modest install base into a low‑seven‑figure
acquisition.

> This is a strategy explainer, not a promise. Outcomes depend on execution,
> distribution, and the market. Building it well is step one.

---

## Features

- **Liquid‑Glass UI** — translucent refractive panels, specular edges, an
  animated mesh‑gradient backdrop, and a light‑catching sheen on hover
- **Clock & date** with a gradient that shifts through dawn → day → golden hour → dusk → night
- **Today's one focus** — a single intention that resets each day, with a
  **completion streak (🔥)** that rewards coming back
- **Warm onboarding** — a one‑time welcome that personalizes the greeting
- **Quick search** — Google / Bing / DuckDuckGo / Ecosia / Brave, URL‑aware
- **Speed dial** — your favorite links as glossy tiles (fully editable)
- **To‑do list** — lightweight, local, always a click away
- **Pomodoro timer** — 25 / 5 / 15‑minute sessions with a glass progress ring
- **Daily quote** — a gentle nudge, bundled offline
- **Themes** — follow the time of day, or pick Aurora / Dusk / Forest / Mono
- **English‑first**, with 日本語 and Español built in (switchable any time)
- **Privacy by design** — no accounts, no network calls, no analytics

Keyboard: press <kbd>/</kbd> to jump to search, <kbd>Esc</kbd> to close panels.

---

## Live web demo (Vercel)

A Chrome extension isn't a website, so it doesn't appear on Vercel on its own.
But Dawn is plain static HTML/CSS/JS and already falls back from
`chrome.storage` to `localStorage`, so it runs unchanged as a web page.

The build copies the static files into `public/dawn/` (see
`scripts/sync-demo.mjs`, run automatically before `next build`), and a rewrite
in `next.config.mjs` serves it at:

```
https://<your-vercel-domain>/dawn
```

`extension/` stays the single source of truth — edit there, and the demo
re-syncs on the next build (or run `npm run sync:demo` locally).

## Install (developer / unpacked)

1. Open `chrome://extensions`
2. Enable **Developer mode** (top‑right)
3. Click **Load unpacked** and select this `extension/` folder
4. Open a new tab 🎉

Works in any Chromium browser (Chrome, Edge, Brave, Arc, Opera).

## Project layout

```
extension/
  manifest.json      Manifest V3, permission: storage only
  newtab.html/css/js The whole app (no build step, no dependencies)
  i18n.js            Local translation tables (add a language = add a key)
  quotes.js          Bundled quotes per language
  _locales/          Store name/description in en, ja, es
  icons/             16 / 32 / 48 / 128 px
```

No framework, no bundler, no `npm install`. Edit a file, reload the extension.

## Roadmap toward the acquisition thesis

- [ ] Ship to the Chrome Web Store, ASO for "new tab / focus / productivity"
- [ ] Add optional weather/greeting (still keyless where possible)
- [ ] Add more languages (the i18n table makes this a copy‑paste)
- [ ] Track only local, opt‑in aggregate counts if a metric is ever needed
- [ ] Add Edge Add‑ons + Firefox builds to widen the install base

## Privacy

Dawn stores your name, focus, to‑dos, links and preferences **only** in your
browser via `chrome.storage.local`. It makes **no network requests** of its
own. Searches and link clicks navigate to the destination *you* chose, exactly
as typing them into the address bar would.

## License

MIT.

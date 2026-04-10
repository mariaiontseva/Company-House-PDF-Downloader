# DocSpace UK — Editorial Redesign & Search Fixes

**Date:** April 2026  
**Scope:** Full visual redesign of `index.html` (landing, company detail, officer detail) + complete rewrite of search infrastructure to work around a broken `fetchWithWorker` function.

---

## 1. Design System

### 1.1 Typography

| Role | Font | Source | Variable |
|---|---|---|---|
| Display / editorial serif | **Fraunces** | Google Fonts (variable: `opsz` 9–144, `wght` 300–900, `SOFT` 0–100) | `--serif` |
| Body / UI sans | **Geist** | Google Fonts (300–700) | `--sans` |
| Data labels / buttons / eyebrows | **Geist Mono** | Google Fonts (400–600), fallback `JetBrains Mono`, `IBM Plex Mono` | `--mono` |

Loaded via one combined `<link>`:
```
https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght,SOFT@0,9..144,300..900,0..100;1,9..144,300..900,0..100&family=Geist:wght@300..700&family=Geist+Mono:wght@400..600&family=JetBrains+Mono:wght@400;500&display=swap
```

Inter/IBM Plex (previous stack) is completely replaced.

### 1.2 Color Palette

Warm paper/ink editorial palette inspired by Financial Times / Bloomberg print.

```css
--paper:      #f3ede1;   /* warm ivory background */
--paper-2:    #ebe3d1;   /* hover / strata */
--paper-deep: #e3d8bf;   /* deeper well */
--ink:        #0d1117;   /* near-black, cool */
--ink-2:      #2a2f38;   /* subhead */
--ink-mute:   #6e6858;   /* warm muted */
--ink-faint:  #8d8777;   /* very faint */
--rule:       rgba(13, 17, 23, .14);   /* hairline */
--rule-2:     rgba(13, 17, 23, .32);   /* stronger hairline */
--signal:     #ae2b17;   /* classic editorial red */
--signal-soft:#d55638;
--gold:       #8a6d2c;   /* restrained amber accent */
```

Also used directly: `#d41a0b` (bright hero eyebrow), `#8a1f0e` (officer eyebrow), `#2f7d3e` (success green), `#fffaf0` (lighter paper for hero search input).

### 1.3 Backgrounds & Texture

- SVG noise grain overlay via `body::before` with `mix-blend-mode: multiply`, opacity `0.32`.
- Radial vignette `body::after` for subtle depth.
- Paper base on everything; no glass-morph, no backdrop-filter blur, no gradients.

### 1.4 Layout Principles

- **Hairline dividers** (`1px solid var(--rule)` / `rule-2`) instead of shadows/borders.
- **Square corners** (`border-radius: 0` or `2px` max) — no rounded pills.
- **Tight ligature spacing** on serif (`letter-spacing: -0.025em` on titles).
- **Wide tracking** on mono labels (`letter-spacing: 0.14–0.22em`).
- **Editorial rhythm**: eyebrow (mono, uppercase, signal red) → large serif title → sans body.

---

## 2. Landing Page (`index.html`)

### 2.1 Sticky Nav
- Logo: three editorial bars (ink / signal red / gold) + "DocSpace" in Fraunces.
- Search input: `paper-2` bg, recolored magnifier icon in warm `#6e6858`, padding `10px 20px 10px 44px` to clear icon.
- Auth button hidden (`#navAuthContainer { display: none }`).

### 2.2 Hero
- Eyebrow `UK BUSINESS INTELLIGENCE` in Geist Mono 12px, weight 700, bright red `#d41a0b`, `z-index: 101` to sit above grain overlay (critical — grain was dulling the color via multiply blend).
- Hero title: Fraunces variable, `font-size: clamp(52px, 8.4vw, 124px)`, `wght 360`, `SOFT 30`, `letter-spacing: -0.028em`. Single line, no `<br>`, no italic.
- Description: Geist 18px, `ink-2` color, max-width 640px.
- Hero padding: `44px / 48px` top (halved from original 88/96), eyebrow `margin-bottom: 32px`.

### 2.3 Hero Search Input (`#exploreCompanyName`)
- Size: **22px Geist Medium**, padding `32px 32px 32px 80px`.
- Border: `2.5px solid var(--ink)` (thicker, always visible).
- Background: `#fffaf0` (lighter than paper).
- Inline magnifier icon SVG, left 32px, signal red stroke-width 2.
- Hover: red border + `#fffdf4` bg. Focus: ink border + pure white bg.
- **No box-shadow** (previous `0 2px 0 0 var(--ink)` was creating a phantom double-line under the input).

### 2.4 Feature Ribbon (Bulk Export, Timeline View, etc.)
- Scrolling horizontal list, mask-image fade on edges.
- Each badge: transparent bg, `1.5px solid rule-2` border, square corners, **13px Geist Mono**, padding `14px 20px`, icon 16px signal red.
- Gap between badges: 14px.
- No top border on the ribbon.

### 2.5 Search Card → Dissolved
The original `.search-container` was a glass card with tab navigation (Explore / Bulk PDF Download). Now:
- Card background, border, shadow, all padding: **removed** (`background: transparent`, `border: none`).
- Tab navigation: `display: none` (only Explore is functional).
- `#searchTab` (Bulk PDF tab pane): `display: none`.
- All Railway-dependent content hidden: Oldest/Newest toggles, Active Only / Has Charges switches, industry filter, company list, "Connecting to Railway Database" spinner, "Create Account for More" button.
- `#resultsContainer`, `#companyCard`, `#progressContainer`: `display: none`.

### 2.6 Marketing Section (Why DocSpace / Who Uses DocSpace)
- Section eyebrow: `§ II · The Dossier` in mono signal red, with hairline.
- Column eyebrows: `i · Capabilities` and `ii · Readership`.
- Column titles (`Why DocSpace?`, `Who Uses DocSpace?`): Fraunces 44px variable.
- **Why list (`.feature-item`)**: numbered via CSS counter `decimal-leading-zero` (01, 02, 03…) in mono signal, hairline dividers.
- **Who list (`.user-list`)**: 2-column editorial grid, hardcoded `"1. "` / `"2. "` prefixes removed from HTML, CSS counter `userlist` generates them. Rules on user-items: `.info-section-single .user-item { background: transparent; border: none; border-radius: 0; box-shadow: none; border-bottom: 1px solid rule; border-right: 1px solid rule }` — nukes leftover purple rounded-corner card styling from original dark theme.
- User item titles: Fraunces 20px serif.

### 2.7 Footer
- Editorial logo with three bars + Fraunces "DocSpace UK".
- Links: `Oldest PLC Companies · FAQ · Contact` (removed Terms / Privacy / API Access).
- Contact → `mailto:mahin84@gmail.com`.
- Copyright: `© 2025–2026 DocSpace UK — Companies House Document Download Service` (with en-dash).
- Footer links: mono uppercase 10.5px, wide tracking, hover → signal red.

---

## 3. Company Detail Page (`#companyModal`)

### 3.1 Container
- Modal backdrop: paper background (was `rgba(15, 23, 42, 0.95)` dark navy), no backdrop-filter.
- Card: flat paper, no border/shadow/glass, max-width 1180px.

### 3.2 Header
- Eyebrow `§ DOSSIER · COMPANY RECORD` in mono signal.
- Company title (`LOBSTER LIMITED`): Fraunces `clamp(40px, 6vw, 72px)`, weight 380, Title Case (not uppercase).
- Badges row (Dissolved / 11337023 / ltd / Retail & Trade): outline mono uppercase pills, square corners. `.active-badge` → green `#2f7d3e`, `.dissolved` → signal red.
- Risk badge: ink bg with colored dot indicator (low=green, medium=gold, high=signal).

### 3.3 Stats Grid (6 cells)
- Single row of 6 columns with hairline top/bottom + vertical dividers.
- Numbers (`7`, `1`, `19`, `0`): **Fraunces 56px thin**, letter-spacing -0.03em. Zero / risk values use signal red.
- Labels (`YEARS OLD`, `OFFICERS`, `FILINGS`, `CHARGES`, `ACCOUNTS`, `CONFIRMATION STATEMENT`): mono uppercase 10px, wide tracking.
- Stat detail: Geist sans 12px, `ink-faint`.
- Download link: mono red with red underline.

### 3.4 Tab Navigation (Overview / People & Control / Finance / Charges & Securities / Filing History / Risk Insights)
- `.tabs-container` and `.tabs-nav`: flat transparent, `border-bottom: 1px solid var(--ink)`.
- Tab buttons: mono 12.5px, weight 500, letter-spacing `.18em`, uppercase, padding `16px 4px`, margin-right 32px.
- Active tab: `border-bottom: 2px solid var(--signal)`.
- Card-header border-bottom removed to eliminate duplicate hairline above tabs.
- Unified `#companyModal .tab-pane { padding: 36px 0 0 }` so every tab has consistent top gap for its h3.

### 3.5 Overview Tab
- `h3` "Company Overview": Fraunces 28px serif.
- `.data-item` rows (Industry, Employees, Website, etc.): mono uppercase label, Geist sans value, dashed hairline dividers.
- **AI Analysis block** (`#aiSnippet`): restored from earlier hide. Wrapper border-top nuked (was creating double hairline). Icon stroke flipped from `#a5b4fc` (lavender) to signal red. Header "AI ANALYSIS" styled as mono eyebrow signal red. Text: Geist sans 14px.
- **Address + Map block**: Google Maps replaced with **OpenStreetMap** via iframe embed. Implementation: `window.initializeAddressMap` overridden at runtime to geocode the address via Nominatim (`https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=gb&q=…`) then inject an iframe with `https://www.openstreetmap.org/export/embed.html?bbox=…&marker=…`. Container: 280px height, ink hairline border, `grayscale(.3) contrast(1.05)` filter for editorial feel. Shows "LOADING MAP…" placeholder while geocoding and "MAP UNAVAILABLE" if geocode fails.

### 3.6 People & Control Tab
All rendered via a JS template literal with inline styles — had to target via attribute selectors like `[style*="background"]`, `[style*="#22c55e"]` since classes are sparse.

- Section headers (`Directors & Officers`, `People with Significant Control`): Fraunces 22px serif, flex layout with count badges pushed right, hairline bottom.
- **Count badges** (`.people-count-badge`): ink bg, paper text, mono 13px 600, square. Had to use `-webkit-text-fill-color` and aggressive specificity because JS injects a later `<style>` block overriding my rules.
- **Person cards** (`.person-card`, `.psc-card`): paper bg, `1px solid rule-2`, square, padding `22px 24px 56px 24px` (bottom reserved for button).
- **Name badges row** (name + role pills): flex justify-between, hairline bottom.
- **Officer name** (`COMLEY, DAVID JAMES`): Geist sans 15px 600 uppercase.
- **Role badges** (`DIRECTOR`, `PERSON WITH SIGNIFICANT CONTROL`): inline-styled spans with `background: #6366f1` / `#10b981` → overridden via `.name-badges-row > span[style*="background"]` to `transparent` bg, `1px solid ink` border, mono uppercase.
- **Info rows** (RESIDENCE / AGE / ADDRESS): label (mono mute) + value (sans ink), dashed hairline dividers. Targeted via `.info-row div > span:first-child` and `:last-child` to reach inside the nested flex div.
- **Control pills** (25-50% shares, 25-50% voting, etc.): targeted via `span[style*="#22c55e"]`, `#10b981`, `#f59e0b`, `#ef4444`, `#64748b` → all flipped to outline ink, critical ones to signal red.
- **"View director" button** (top-right magnifier to go to officer detail): repositioned to `bottom: 16px; right: 20px`, label "View" added via `::before`, ink outline hover-inverts to paper-on-ink.

### 3.7 Finance Tab
Dedicated class-based overrides for the finance dashboard (which uses a separate stylesheet block):

- `.finance-chart-wrapper`, `.finance-chart-container`, `.finance-details`, `.finance-metric-card`: paper bg, `1px solid rule-2`, no backdrop-filter, no radius.
- `.chart-title` ("Net Assets, Total Assets & Total Liabilities"): Fraunces 18px.
- `.chart-legend` labels: mono mute uppercase.
- `.finance-metrics-grid`: unified grid with internal hairlines instead of separate cards.
- `.metric-title` (TOTAL ASSETS, NET ASSETS, TOTAL LIABILITIES): mono uppercase 10px.
- `.metric-main-value` (£0, £0, -£0): **Fraunces 44px thin**.
- `.metric-change` (Decreased by £140K (-100%)): mono uppercase with positive green / negative signal red.
- Canvas chart: `filter: grayscale(.15) contrast(1.05)` for editorial grayscale look.
- `.performance-summary p.success/warning` pills: outline borders instead of filled.

### 3.8 Risk Insights Tab
- Each `.data-item` is a bordered editorial card (`1px solid rule-2`, paper bg, 24×28 padding).
- Section headers (OVERALL RISK SCORE, KEY STRENGTHS, RISK FACTORS, ANALYSIS SUMMARY) — mono uppercase wide tracking, hairline bottom. Default signal red, `[style*="#22c55e"]` → green, `[style*="#ef4444"]` → signal.
- **Overall Risk Score value**: Fraunces 56px thin, editorial giant number.
- Analysis bullet list: Geist sans 14px line-height 1.7.

### 3.9 Universal Dark→Paper Flip
Catches any residual dark glass-morph / inline color style in any tab pane:
```css
#companyModal .tab-pane [style*="rgba(30, 41, 59"],
#companyModal .tab-pane [style*="rgba(15, 23, 42"],
/* ... */ { background: paper; border: 1px solid rule-2; }

#companyModal .tab-pane [style*="#ffffff"],
#companyModal .tab-pane [style*="#e2e8f0"] { color: var(--ink); }
```

### 3.10 Timeline (Company Timeline sidebar)
- Vertical hairline line in paper-mute instead of purple.
- Dots: ink circles with paper 2px inner border + ink outer ring. Variants: `.appointment` / `.accounts` → ink, `.resignation` / `.dissolution` → signal, `.funding` → gold.
- Dates: mono uppercase signal red.
- Titles: Geist sans 15px 600 ink.
- Descriptions: Geist sans 13px ink-mute.

---

## 4. Officer Detail Page (`#officerPage`)

Full editorial redesign mirroring the company page.

### 4.1 Header
- Eyebrow `§ DOSSIER · OFFICER RECORD` mono red, hairline bottom.
- Officer name (`Sergei ILCHENKO`): Fraunces 72px thin (was purple bold).
- "Born: December 1964" subtitle: Geist sans 14px mute.
- Status badges (Active Director / Russian / Director): outline mono pills, Active variant green.

### 4.2 Stats Grid (4 boxes)
- `1 APPOINTMENTS`, `2 YEARS ACTIVE`, `1 COMPANIES`, `0 RESIGNED`.
- Fraunces 56px thin numbers, mono uppercase labels, sans faint details.
- Hairline grid with internal dividers.

### 4.3 Tab Navigation (Overview / Appointments / Network)
- Same editorial mono style as company page.
- Red underline on active tab.

### 4.4 Personal Information
- `.data-item` rows (FULL NAME / DATE OF BIRTH / NATIONALITY / COUNTRY OF RESIDENCE / OCCUPATION): mono uppercase label, Geist sans 16px 500 ink value, hairline dividers.

### 4.5 Career Timeline
- Vertical ink hairline with editorial dots (ink by default).
- Dates: mono uppercase dark red `#8a1f0e`.
- Titles: Geist sans 15px 600.
- Companies: sans 13px mute.
- **Probable Match items** (related officers' companies): purple `#a78bfa` text and purple dashed connector `rgba(99, 102, 241, 0.3)` flipped via `[style*="#a78bfa"]` etc. → ink-mute. Purple dots (`#8b5cf6`, `#6366f1`) → ink.
- "Officer: Dean SHEEHAN →" link: mono red with red underline, hover ink.

### 4.6 Related Officers Section
- Lavender banner (`rgba(99, 102, 241, 0.1)`) → transparent with ink hairline.
- Officer cards (`rgba(148, 163, 184, 0.05)`) → paper with ink-rule-2.
- Active company mini-tiles (`rgba(52, 211, 153, 0.05)`) → paper-2 with hairline.
- Purple chevron SVG (`stroke="#6366f1"`) → ink via attribute selector.
- Green "director" text → darker green `#2f7d3e`.
- Company links (`a[href^="#company/"]`): ink sans 600, hover red with red underline.
- Section labels (`ACTIVE COMPANIES (2)`, `PREVIOUS COMPANIES`): mono uppercase wide tracking.

### 4.7 Career Summary Cards
- `#officer-summary > div`: paper with ink hairline.
- Label (`CURRENT POSITIONS`): mono uppercase.
- Number value: Fraunces 44px thin.

---

## 5. Search Infrastructure

This was the biggest non-visual change.

### 5.1 The Original Bug
The existing `fetchWithWorker(url, apiKey)` function (defined at line ~9844 of `index.html`) was throwing `"Failed to fetch"` from the browser despite the worker being reachable (curl from terminal → HTTP 200). It powered both the nav search and the Explore filter. Without it, **no search worked at all**.

Debugging via an on-page diagnostic panel revealed:
- ✅ Direct `fetch()` to the worker URL worked
- ✅ `XMLHttpRequest` to the same URL worked  
- ✅ CORS headers were present
- ✅ No service worker was registered
- ❌ `fetchWithWorker()` (which uses `URLSearchParams` to build the query + `Accept: application/json` header) — consistently failed

Exact cause never fully confirmed, but the failing path used `new URLSearchParams({ url, apiKey }).toString()` concatenated to the worker base without a trailing slash, i.e. `https://worker.dev?url=…`. The working path used `encodeURIComponent()` and `/?url=…` (with slash).

### 5.2 The Fix — Monkey-Patch `window.fetchWithWorker`
A small IIFE at the end of `<body>` overrides the global:

```js
const WORKER = 'https://blue-flower-d40f.mahin84.workers.dev';
const KEY    = '22aefa40-ee9e-47c0-b40a-2dd3c03165c6';

async function patchedFetchWithWorker(url, apiKey) {
  const k = apiKey || KEY;
  const proxyUrl = WORKER + '/?url=' + encodeURIComponent(url) + '&apiKey=' + encodeURIComponent(k);
  return fetch(proxyUrl);
}

window.fetchWithWorker = patchedFetchWithWorker;
// + DOMContentLoaded + load + setTimeout installs for safety
```

Because `fetchWithWorker` is a top-level function declaration in the main classic `<script>`, it's exposed on `window`. Overriding `window.fetchWithWorker` is picked up by all later references (`handleNavSearch`, `filterExploreCompanies`, etc.) via global scope chain resolution at call time.

Three routes now use the same patched function: **nav search**, **hero search**, **explore filter**.

### 5.3 Hero Search (`#exploreCompanyName`)
Added because the original page had no autocomplete on the big explore input (it only live-filtered the Railway explore list, which is also down).

A second IIFE at the end of `<body>`:
1. Finds `#exploreCompanyName`
2. Creates a dropdown element `#hero-autocomplete` inside the autocomplete wrapper
3. On `input` event, debounces 260ms, then calls `heroProxyJSON()` for companies and officers in parallel
4. `heroProxyJSON` calls `window.fetchWithWorker()` (same as nav) — so if nav search works, this works too
5. Renders results using the same pattern as the nav dropdown (serif titles, mono labels, paper bg, ink border, editorial pills)
6. Click on a result: `selectNavCompany()` / `selectNavOfficer()` → navigates to `#company/{n}` / `#officer/{id}`
7. Enter key → picks first result. Esc → closes. Outside click → closes.

### 5.4 Dropdown Styling
Both `#nav-autocomplete` and `#hero-autocomplete`:
- `max-height: 440px / 520px`, `overflow-y: auto` (fixes the earlier issue where `overflow: hidden` on the parent card was clipping results).
- Editorial paper background, ink border, `0 2px 0 0 ink` + `0 20px 40px -20px` shadow.
- Thin scrollbar (`scrollbar-width: thin`, color rule-2).
- Item: hairline divider, paper-2 hover, cursor pointer.
- **Company title**: Geist sans 14/17px 600 (not serif, per user feedback — serifs on dropdown names looked crowded).
- **Company details** (number + status): Geist Mono 10px uppercase wide tracking.
- **Sanctions placeholder span** (empty `#sanctions-${number}` span): hidden via `.autocomplete-item .company-status:empty { display: none }` — it was appearing as an empty bordered box after the ACTIVE badge.

### 5.5 Nav Search Fix
The original navbar had a search icon positioned via `::before` on `.nav-search-container` with `padding-left: 48px` on the input to clear it. My initial CSS override killed that padding, causing the icon to overlap the placeholder. Restored with `padding: 10px 20px 10px 44px` + recolored the SVG icon stroke from `#64748b` (cool gray) to warm `#6e6858`.

---

## 6. Favicon

Created a new `favicon.svg`:
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect width="64" height="64" rx="8" fill="#f3ede1"/>
  <rect x="10" y="18" width="12" height="28" fill="#0d1117" rx="1"/>
  <rect x="26" y="10" width="12" height="36" fill="#ae2b17" rx="1"/>
  <rect x="42" y="22" width="12" height="24" fill="#8a6d2c" rx="1"/>
</svg>
```

Three editorial bars (ink / signal red / gold) on paper, matching the nav logo.

**Chrome's favicon cache is aggressive**. Attempts to force a refresh:
1. First: overwrote `/logo.svg` — Chrome kept the old purple cached.
2. Then: added `?v=…` cache-bust param — still cached.
3. Then: data URI in `<link rel="icon">` — still cached (Chrome caches by origin).
4. Finally: created a **brand-new file** at `/favicon.svg?v=3` that Chrome had never seen before, AND added `<link rel="shortcut icon">` in addition to `<link rel="icon">`. Also updated `manifest.json` to reference only the new path.

If after deploy the tab still shows the old icon, the user should: open in incognito, or DevTools → Application → Storage → Clear site data, or quit Chrome entirely and reopen.

---

## 7. Known Limitations

- **Railway backend is down** — the Explore tab's "Connecting to Railway Database… Attempt X of 50" loop is hidden via CSS. When Railway is restored, un-hide `#exploreTab > form + div`, `#companyListExplore`, and `.tab-navigation` to bring back the original filtering UX.
- **Finance £0 display** — the financial parser correctly extracts data from filed accounts. Dissolved companies (like `LOBSTER LIMITED`) show £0 because their latest filing is a dormant / cessation account with zero values. Active trading companies will show real numbers.
- **Google Maps deprecated** — replaced with OpenStreetMap via Nominatim geocode + OSM embed iframe. No API key needed. Rate-limited by Nominatim's fair-use policy (~1 request/second), which is fine for individual company pages but would need a paid geocoding service for bulk usage.
- **Specificity battles** — many elements are rendered by JS template literals with inline styles. The CSS in this redesign leans heavily on attribute selectors like `[style*="#6366f1"]` and `[style*="rgba(30, 41, 59"]` to target and override those inline colors. This is fragile: if the source colors change in JS, the overrides need updating.

---

## 8. Files Modified

| File | Change |
|---|---|
| `index.html` | ~1000 lines of new CSS in `<style id="forensic-redesign">`; hero title `<em>` removed; footer links trimmed + mailto; new favicon links; hero search patch script; monkey-patch for `fetchWithWorker`; OpenStreetMap map initializer |
| `logo.svg` | Overwritten with three-bar editorial version (paper bg, ink/red/gold bars) |
| `favicon.svg` | New file — same three-bar design, dedicated favicon path |
| `manifest.json` | Background color → paper, theme color → signal red, icons → only `/favicon.svg?v=3` |
| `REDESIGN_NOTES.md` | This document |

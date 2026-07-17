# SIX RINGS — Project Handoff (CLAUDE.md)

An NBA draft-dynasty browser game. Spin to land on random draft classes, sign one
player per spin (5 total), then simulate 15 seasons and try to win more championships
than Michael Jordan's 6. Inspired by 82-0.com and HoopsMatic's "73-9" game.

**Current build:** `index.html` at the repo root — a single self-contained HTML file
(React + ReactDOM + the compiled game code all inlined, no external requests at runtime).
The original component source is preserved as `six-rings-latest.jsx` for reference/editing.

---

## How to run / where this needs to go

The deliverable is now a **single static `index.html` file** at the repo root. It has
zero build step and zero runtime network dependencies — React and ReactDOM are vendored
(bundled) directly into the file, and the JSX was pre-compiled to plain JavaScript ahead
of time, so nothing needs to be installed or downloaded to run it.

- **Open locally:** double-click `index.html`, or open it directly in any browser.
- **Host it free:** enable GitHub Pages on this repo (Settings → Pages → deploy from the
  `main`/default branch, root folder) and it's a public URL with no other setup.
- Any other static host (Netlify, Vercel, S3, etc.) also works as-is — it's just one file.

### Editing workflow
`index.html` is a **generated/bundled file** — don't hand-edit the game logic inside it.
Instead edit `six-rings-latest.jsx` (the readable source), then regenerate `index.html`
by re-running the same compile step (strip the `import`/`export` lines, run through Babel
with the React JSX preset, and re-embed alongside the vendored React/ReactDOM UMD builds).

### Tech stack / constraints
- **React** (functional component, hooks: `useState`, `useRef`, `useEffect`), vendored
  locally (React 18 production UMD builds) — no CDN, no `npm install` needed to run.
- **No external UI libraries.** All styling is a single inline `<style>` block with plain
  CSS (no Tailwind, no CSS modules). Fonts loaded via Google Fonts `@import`:
  Anton (display), Inter (body), IBM Plex Mono (data/labels). This is the one remaining
  network request the page makes; if that's ever undesirable, self-host the font files.
- **No browser storage APIs** (localStorage/sessionStorage). All state is in-memory React
  state. This was an artifact constraint; keep it unless intentionally changed.
- **No backend.** Everything (data, sim, optimizer) runs client-side. Share feature is
  clipboard text only — no image card, no server.
- Self-contained: all player data, coach data, simulation, and rendering live in the one file.

---

## Design goals & philosophy

- **Replayable "bored at work" game.** Every run differs (randomized spins, development
  rolls, sim variance). Fun and shareable over realistic-but-tedious.
- **7 rings = the ceiling flex** ("you beat Jordan"): achievable but hard, needs a great
  draft + luck. A solid team should realistically bank **1–2 rings most runs**.
- **Smart roster construction is rewarded** over raw star-stacking (see redundancy penalty).
- **Coaching is upside-only** — a good scheme fit / pedigree helps; a bad fit never
  penalizes you. Don't reintroduce coaching penalties.

---

## Data model

### Draft classes — 58 total, **1969–2026**, ~953 players
`DRAFT_CLASSES` is an array of `{ year, players: [...] }`, sorted oldest→newest, each
class sorted by pick number. Each player object:

```js
{ name: "Stephen Curry", pick: 7, pos: ["G"], scoring: 96, playmaking: 88,
  rebounding: 42, defense: 58, ovr: 97 /*, floor: 0.83, grade: "A-" */ }
```

- **`pos`**: eligible slots, e.g. `["G"]`, `["F","C"]`, `["G","F"]`.
- **Four skills** (`scoring`, `playmaking`, `rebounding`, `defense`), 0–99, peak values.
- **`ovr`**: peak 2K-style overall (the single displayed rating). Legends rated at
  prime peak (Kareem 99, LeBron 99, Jordan excluded, Bird 98, Shaq 98, Duncan 97, etc.).
  OVR is stored explicitly, NOT computed from skills (a weighted-average formula was tried
  and rejected because it dragged elite specialists down — Curry read as 70).
- **`floor`** (young players only): low end of a per-run development roll `rand(floor, 1)`.
  Higher floor = more reliably reaches ceiling.
- **`grade`** (2022–2026 classes only): visible potential letter (A+ … D). Grade maps
  deterministically to `floor` via `GRADE_FLOOR`:
  `A+ .92, A .88, A- .83, B+ .78, B .73, B- .68, C+ .62, C .55, C- .48, D .42`.
  Keep grade and floor in sync if editing.

**Important data rules:**
- **Michael Jordan is intentionally absent** from the 1984 class (pick #3 left empty) —
  he is the target to beat, never draftable.
- **No duplicate player names** anywhere (validated). Each class has **no duplicate pick
  numbers** internally, and every class has **≥2 players eligible at each of G/F/C** so a
  class can never "go dead" for a position.
- **Grades exist only for 2022–2026.** 2019–2021 players have a `floor` (residual variance)
  but no visible grade (treated as established vets). Pre-2019 players have neither.
- Known corrections already applied: Stephon Marbury moved to 1996 (was wrongly 1997);
  duplicate Vlade Divac removed (kept in 1989); Tony Parker (2001 #28) added.
- Young-player OVRs (2019+) are projected ceilings, the most opinion-based ratings — the
  likeliest thing to tweak if a rating feels off.

### Coaches — 15, Phil Jackson era (1989) onward
`COACHES` array. Each: `{ name, system, blurb, favored: [skill, skill], rings }`.
`favored` = the two skill categories the system rewards. `rings` = real head-coaching
championships, drives the pedigree bonus. (Spoelstra is 2, not 3 — the 3rd was as an
assistant and doesn't count.)

---

## Core mechanics

### Draft flow (phases)
`modeSelect → coachSelect → draft → ready → simming → results`
- **modeSelect**: shows "HOW TO PLAY" rules + Easy/Hard choice. Picking a mode sets
  `mode` and **triggers `spinCoach()`** (see coach-spin note below).
- **coachSelect**: coach wheel auto-spins once and lands; "LOCK IN & DRAFT" advances.
  **No re-roll** (was removed by request).
- **draft**: 5 spins. Each spin lands on a random remaining class (removed from pool, no
  repeats). You sign one eligible player. Multi-position players prompt a slot choice.
  A "dead" class (no eligible player) allows a free re-spin.
- **ready**: "Your five" locked; simulate button.
- **simming → results**: 15-season sim animates, then results.

### Roster constraints
- **2 guards, 2 forwards, 1 center** (`SLOT_NEED = { G: 2, F: 2, C: 1 }`).
- **Pick-number lock (global):** no two rostered players may share a `pick` number, even
  across different years/classes. Drafting a #1 overall removes every other #1 from the
  board. This is a core strategic constraint — forces drafting late-pick steals
  (Jokić #41, Draymond #35, Manu #57).

### Difficulty modes
- **Easy**: all ratings (OVR, skill bars, potential grade) visible while drafting.
- **Hard**: OVR, bars, and grade are **hidden** (masked as "?") during the draft; you pick
  on names/reputation alone. Everything reveals once the five is locked (ready/results).
- **Impossible**: everything Hard hides, **plus the player's name**. During the draft you
  only see position and real pick number (e.g. "G #7") — nothing else. Multi-position slot
  choice still works (referenced by pick number instead of name). Reveals everything once
  the five is locked, same as Hard. Uses the **exact same simulation math** as Easy/Hard —
  the difficulty is purely informational, not a harder win curve. Don't add mode-specific
  odds tuning for Impossible without discussing it first.
  The draft board is always **sorted by real pick number** (#1 first) in every mode, so it
  reads like a real draft board rather than a power ranking, and rewards players who know
  actual draft history — this is deliberately consistent across modes, not just Hard.
- `StatBlock` takes a `hidden` prop for the "?" masking. All three modes share the same
  player pool — mode only changes *display/order*, not the data.

---

## Simulation model (the math)

Per run, each player gets a development roll `roll = floor ? rand(floor,1) : 1`.
For each of 15 years (`CURVE` = career arc, rookie ramp → prime plateau → decline):

- **Team talent** = Σ `ovr * roll * curve[year]` across the five.
- **Redundancy penalty**: sum each skill category across the five (`skill * roll * curve`);
  for any category total below `REDUND_THRESHOLD` (310), subtract shortfall × `REDUND_WEIGHT`
  (0.15). This punishes lopsided rosters (e.g. five scorers, no defense) and rewards balance.
- **Coach bonus** (flat points, upside-only): `fitPts = clamp((favoredAvg - otherAvg)/32, 0, 12)`
  + pedigree points by rings (`5+ → 9, 3–4 → 6, 1–2 → 3, 0 → 0`). Hidden from the UI.
- **Rating** = talent − shortfall + coachBonus.
- **Win probability** that year = `logistic((rating - WIN_THRESHOLD) / WIN_SCALE)`,
  with `WIN_THRESHOLD = 444`, `WIN_SCALE = 29`. Win is a random draw vs that probability
  (smooth curve — deliberately replaced an older hard "best-of-29-opponents" threshold that
  created an all-or-nothing difficulty cliff).

### Calibration (verified via Monte Carlo, keep it here)
- Elite five (e.g. Curry/Kobe/LeBron/Malone/Shaq): ~6 rings avg, **7+ ~36%** of runs.
- Good all-star five: ~1.5 avg, wins ≥1 ring ~82% of runs.
- Weak role-player five: ~0.35 avg (usually shut out).
- Balanced team clearly beats a same-OVR lopsided team (redundancy working).

**If you change any of `WIN_THRESHOLD`, `WIN_SCALE`, `REDUND_THRESHOLD`, `REDUND_WEIGHT`,
the coach bonus caps, or many OVRs — re-run a Monte Carlo** (simulate a few representative
lineups a few thousand times) and confirm the distribution above still roughly holds before
shipping. This has been the discipline the whole project; don't eyeball it.

---

## Results screen features

- **Verdict headline** by ring count (7+ dynasty / 6 tied / 4–5 HOF / 1–3 real champ / 0 bust).
- **Recap (`buildRecap`)** for **2+ rings**: data-driven, ~5–7 sentences. Picks a narrative
  angle from what actually happened (one-man-show, slow-build-late, peaked-early, balanced
  machine, no-window). Names the actual best/second player and their roles, cites real
  title years and peak-rating year, weaves in coach fit. Randomized phrasing so repeat runs
  differ. Do NOT revert this to a fixed 4-sentence template.
- **Roast (`buildRoast`)** for **0–1 rings only**: an insulting recap. Mixes shots at
  specific players (names the lowest-OVR pick and its draft slot) AND at the GM/player
  ("five guys allergic to defense"). 0 rings is harsher than 1. Randomized lines.
- **"Best five you could've built" (`computeBestLineup`)**: always shown below the recap.
  Computes the **optimal legal 2G/2F/1C** from the **exact classes the player landed on**
  (`roster.map(p => p.classYear)`), respecting the pick-number lock, maximizing peak rating
  (`evaluatePeakTeam` = talent − redundancy + coach fit). Searches top-14 candidates per
  position (talent dominates; verified always returns a legal, collision-free team). If the
  player already drafted the optimum, it flips to a "YOU DRAFTED THE OPTIMAL FIVE" note.

---

## Visual / UX design language

- Dark arena aesthetic: bg `#0D1117` / `#161B22`, gold accent `#D9A441`, red `#C1443A`,
  cream text `#EDE6D6`, muted `#8B96A5`, teal `#7FA6A3`.
- Fonts: **Anton** (big display/headlines/OVR numbers), **Inter** (body), **IBM Plex Mono**
  (stats, labels, pick numbers).
- Championship "rafter banners" fill gold per title year during the sim animation.
- **Player stat display (`StatBlock`)**: prominent OVR number + small 4-bar skill chart
  (gold=scoring, teal=playmaking, red=rebounding, blue=defense). A legend explains the bars;
  a "POT A-" badge marks prospect potential grades.
- **Formatting gotcha (already hit once):** don't put raw text + `<b>` tags as *direct
  children* of a `display:flex` container — flexbox turns each text fragment and each `<b>`
  into its own gap-separated flex item and the layout shatters. Wrap multi-part text in a
  single child `<div>`/`<span>` (this is how the "HOW TO PLAY" rules are structured now).

---

## Editing workflow notes (how this was built)

- Large data changes were done by **parsing the `DRAFT_CLASSES` block with Python, editing
  in Python, and regenerating the block** — far safer than hand-editing hundreds of player
  lines. Reuse that approach for bulk player/rating changes.
- After any data or math change, validate: brace/paren/bracket balance, no duplicate names,
  every class has ≥2 per position and unique picks, grade↔floor consistency, Jordan absent.
- Keep the file a single self-contained component unless intentionally splitting for a build.

---

## Known open items / possible next steps

- **Deploy to Vercel** (scaffold the React project, push, connect) — the main pending infra task.
- Optional: literal full 30-deep first round per class (currently ~13–21 notable players per
  class; deliberately not every forgettable pick). Big data add if ever wanted.
- Optional polish: share-as-image card; sound; mobile spacing pass; per-run seed for
  reproducible shares.
- Young-player (2019+) OVRs/grades are the most subjective ratings — revisit if any feel off.

---

## One-line pitch for a fresh session

"Continue building SIX RINGS, a single-file React NBA draft-dynasty game
(`six-rings-latest.jsx`): spin 5 draft classes (1969–2026, ~953 players, Jordan excluded),
draft 2G/2F/1C under a global pick-number lock, simulate 15 seasons via an OVR-driven model
(redundancy penalty + upside-only coach bonus + logistic win curve calibrated so 7 rings is
hard-but-real), with Easy/Hard modes, a data-driven recap that roasts you on 0–1 ring runs,
and a 'best five you could've built' optimizer. Keep it self-contained, no browser storage,
and re-run a Monte Carlo after any balance change."

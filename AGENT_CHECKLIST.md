# Agent Checklist

**Read this before making any code change.** Applies to all AI assistants (Claude, GPT, Gemini, Cursor, Copilot, Codex, etc.) and humans alike.

This file is the single source of truth for "what must I remember when touching this repo." It is intentionally short and scannable. The deeper architectural conventions live in `AGENTS.md`.

**Live Laboratory:** [https://vishvavariya.github.io/algovision](https://vishvavariya.github.io/algovision)

If a rule here conflicts with `AGENTS.md`, this checklist wins for the conflicting item.

---

## 0. Before you write code

- [ ] Read the existing route/file you're about to change. Do not assume the pattern.
- [ ] Check the user's actual ask. Don't bundle drive-by refactors. One change at a time unless asked.
- [ ] Look at recent commits (`git log --oneline -20`) to learn the project's style.
- [ ] If your change spans 3+ files or 30+ lines, write down the plan in chat first and confirm.
- [ ] Never edit `.env`, `.env.local`, or anything matching `*serviceAccount*.json`. Never commit secrets. Never read or echo the contents of these files in chat.

---

## 0.5 Context + token discipline

Use fewer tokens without lowering the quality of the final work.

- [ ] Read only the files needed for the change, then stop exploring once the local pattern is clear.
- [ ] Prefer targeted `rg`, focused file slices, and short summaries over dumping whole files into chat.
- [ ] Do not restate obvious tool output. Report decisions, blockers, and verification results.
- [ ] Keep plans short and proportional. Use a checklist only when it helps execution.
- [ ] Preserve output quality: concise does not mean vague, skipped verification, or unpolished UI.

---

## 1. Analytics (mandatory for any user-facing change)

Every new interactive element must emit a GA event. No exceptions.

- [ ] New button / link / form / modal trigger → call `gtag.track('<feature>_<action>', { event_category, event_label, ... })`.
- [ ] **Use `gtag.track()`, not `gtag.event()`.** The legacy `event()` helper is being phased out.
- [ ] Event names: lowercase + underscores, `<feature>_<action>` or `<feature>_<object>_<action>`. Examples: `coin_flip_share`, `pomodoro_focus_session_complete`, `sky_spy_flight_select`.
- [ ] **Never send raw user input as `event_label`.** Free-text searches, emails, prompts, custom URLs → send `query_length`, a hash, or a category instead.
- [ ] Errors and failures get an event too: `<feature>_<action>_failed` with a 80-char-truncated reason.
- [ ] When state changes (loading → success / error), emit one terminal event, not noise on every render.
- [ ] Events for repeat actions (typing, scrolling) should debounce or threshold — don't ship spam.

**Funnels — every route should be measurable end to end:**

- [ ] **Init** event when the route's main component mounts (`<route>_init`). Fires once per session via `useRef`.
- [ ] **Engagement** event when the user does the core thing (boost, flip, swap, ignite, select). Distinguish first-time engagement from subsequent.
- [ ] **Completion** event when a meaningful unit ends (focus session done, distance milestone, flight inspected, company opened).
- [ ] **Share** event for any share affordance — auto via `<ShareButton>`.
- [ ] **Failure / error** events for GPU disabled, audio unlock fail, API failure, geolocation denied. Use `event_category: 'system'` or `'error'`.

**Recommended event params:**

- `event_category`: `navigation` | `interaction` | `engagement` | `system` | `error` | `social`
- `event_label`: short, non-sensitive (route name, model id, vote kind, hostname, error code)
- `value`: numeric only
- Custom params: snake_case (`model_id`, `coin_id`, `duration_seconds`, `comment_length`, `has_contact`)

**Auto-tracking (already wired — don't duplicate):**

- `lib/analyticsAuto.ts` ships `click_outbound`, `contact_click`, `copy_content`, `scroll_depth`, `time_on_page_milestone`, `visibility_change`, `exception`. Don't re-emit these.
- `components/WebVitalsReporter.tsx` ships `web_vital` for LCP / INP / CLS / FCP / TTFB.
- `lib/gtag.ts` already attaches `page_location`, `page_path`, `page_title`, `send_to`. Don't duplicate.

**Don't:**

- Don't fire events on every keystroke. Threshold (e.g. `if (val.length > 2)`) and only on meaningful change.
- Don't send PII (email, full freeform comments, custom user URLs).
- Don't include user-controlled URLs as `event_label`.
- Don't use `gtag.event()` in new code.

Reference: `lib/gtag.ts`, `lib/analyticsAuto.ts`, `AGENTS.md` Analytics section.

---



---

## 3. Virality / share

Any route that produces a **shareable artifact** (a result, a selection, a state) must surface a share affordance.

- [ ] Use the shared `<ShareButton />` from `components/ShareButton.tsx` — do not roll your own.
- [ ] Pass `text`, `eventName: '<feature>_share'`, `eventParams` with relevant ids.
- [ ] If the route has selectable state (chosen item, mode, character, car), **persist that state in URL params** so a shared link lands on the same content. Read params on mount, write via `history.replaceState` on change.

---

## 4. Tests

- [ ] If you add or change a component, add a smoke test under `<route>/__tests__/` or `lib/__tests__/`.
- [ ] If you add a hook with side effects (timers, fetch, audio), test the cleanup path.
- [ ] If you fix a bug, add a regression test that fails without your fix.
- [ ] Run `npm test` before claiming done. All 98+ tests must pass. Failing tests are not "fine to fix later."
- [ ] If a test breaks because of an intentional ARIA / role change you made, update the test to match the new semantic — do not weaken the semantic to satisfy the old test.

---

## 5. Accessibility

- [ ] Icon-only buttons get an `aria-label`.
- [ ] Tab-style controls get `role="tab"` + `aria-selected={isActive}`. Same for `option`, `row`, `gridcell`.
- [ ] Live regions (vote streams, score updates, chat) get `role="log"` or `aria-live="polite"`.
- [ ] Keyboard: every interactive element must be reachable by Tab and activatable by Enter / Space.
- [ ] `:focus-visible` ring must be present. The global rule in `app/globals.css` covers most cases; don't override it without a replacement.
- [ ] No `<div onClick>` for interactive elements — use `<button>`.
- [ ] Modals trap focus and close on `Esc`.
- [ ] Color contrast: text ≥ 4.5:1 vs. background. White-on-pastel and grey-on-grey are common offenders.

---

## 5.5 UI design quality

Before shipping a UI, pressure-test it like a tiny product, not a template.

- [ ] Ask: what is the user's main action, and can they do it in the first screen without reading instructions?
- [ ] Ask: what feeling belongs to this route — playful, precise, cinematic, cozy, intense — and do layout, motion, copy, and color all support it?
- [ ] Ask: what makes this interface specific to this idea? Add one memorable, useful detail instead of generic decoration.
- [ ] Prefer route-specific visual language over reusable sameness unless the element is truly global.
- [ ] Design the boring states too: loading, empty, error, disabled, success, slow network, reduced motion.
- [ ] Make controls feel tactile: clear affordance, pressed state, focus state, disabled state, and no surprise layout shift.
- [ ] Remove anything that looks nice but makes scanning, tapping, reading, or completing the core action worse.

---

## 6. Mobile / responsive

**Screen size matrix.** Test at every one of these:

| Size | Why it matters |
|---|---|
| 320 × 568 | iPhone SE 1st gen, lower bound. If it works here, it works everywhere. |
| 360 × 640 | Median Android. |
| 390 × 844 | iPhone 14/15 portrait, notch / Dynamic Island present. |
| 412 × 915 | Pixel + most large Androids. |
| 768 × 1024 | iPad portrait. |
| 1024 × 768 | iPad landscape. |
| 1280 × 800 | Small laptop. |
| 1440 × 900 | MacBook 13". |
| 1920 × 1080 | Desktop default. |
| 2560+ | Ultra-wide, 4K. Don't let columns stretch unbounded. |

**Orientation.** Both **portrait** and **landscape** for every mobile size. iPhone landscape often has `max-height: 414px` — short. Test that explicitly with `@media (max-height: 500px)` or measured via `window.innerHeight`.

- [ ] Test at **320 px width** and **414 px height (landscape)** at minimum. Most bugs hide there.
- [ ] Mobile landscape: fixed bottom bars must not eat the cockpit. Use `@media (max-height: 640px)` to compress headers/footers.
- [ ] Touch targets ≥ **44 × 44 px** (`min-h-[44px] min-w-[44px]`). Sliders / range inputs need a thumb of similar size; bump them to 22 px on `(hover: none)`.
- [ ] Every hover effect must have a touch/keyboard equivalent (`active`, pressed, selected, or `focus-visible`). Do not hide essential information or controls behind hover-only UI.
- [ ] Use `env(safe-area-inset-*)` for **every element within 16 px of any edge**. Use the `--safe-top`/`--safe-bottom`/`--safe-left`/`--safe-right` CSS vars already wired in `globals.css`. Notched phones in landscape have non-zero `--safe-left/right`.
- [ ] iOS home bar: any fixed bottom button needs `padding-bottom: calc(<base> + var(--safe-bottom))`.
- [ ] Avoid hard-coded px font sizes. Use `clamp(min, vw, max)` for fluid typography.
- [ ] Avoid `100vh` — it breaks on iOS Safari. Use `100dvh` (dynamic), `100svh` (smallest), or measured height.
- [ ] Honor `prefers-reduced-motion`. Heavy animations (CRT flicker, shake, parallax) must drop to `animation: none` under it.
- [ ] Honor `prefers-color-scheme` if the route has a dark/light variant. Avoid flashes of unstyled content (FOUC) by setting body bg in inline `<style>` in `src/app/layout.tsx`.
- [ ] No horizontal page scroll. `body { overflow-x: hidden; }` is set globally; don't undo it.
- [ ] Foldables / tablets: nothing should assume single-column or two-column. Use container queries (`@container`) when an element's own width matters more than the viewport.
- [ ] Pinch-zoom must still work for accessibility. Don't `user-scalable=no`.
- [ ] iOS form inputs auto-zoom if `font-size < 16px`. Use `font-size: 16px` minimum on inputs to suppress.

---

## 7. Hydration safety

Never call these in render output that affects markup:

- [ ] `Math.random()`
- [ ] `Date.now()` / `new Date()` formatting
- [ ] `window`, `document`, `navigator`
- [ ] Locale-dependent formatting (`toLocaleString` etc.) without a fixed locale.

If a visual must randomize, render a deterministic initial state and randomize in `useEffect`.

---

## 8. Performance

- [ ] Heavy components (3D scenes, large client libs) → `dynamic(() => import(...), { ssr: false })`.
- [ ] Default to **server components**. Add `'use client'` only when needed.
- [ ] Three.js: dispose `geometry`, `material`, `texture` on unmount. R3F handles most, custom objects don't.
- [ ] Web Audio: stop sources, close contexts when appropriate. Singleton `AudioContext` patterns are fine — but always clean up event listeners on unmount.
- [ ] `useEffect` cleanup: every `addEventListener`, `setTimeout`, `setInterval`, `requestAnimationFrame`, `AbortController` must have a matching teardown.
- [ ] Don't mount large lists without virtualization. Don't fetch in render.

---

## 9. SEO + social

When you add a public route:

- [ ] Add an entry to `seoPages` in `lib/seo.ts` (path, title, description, keywords, ogLabel, ogTheme).
- [ ] Add the OG theme key to `src/app/og/route.tsx` themes map (otherwise it falls back to `home`).
- [ ] Use `createPageMetadata('<key>')` from the route's `page.tsx`.
- [ ] Add the route to `src/app/sitemap.ts` (or rely on `seoPages`). Verify `lastModified`, `priority`, `changeFrequency` make sense.
- [ ] If the route should not be indexed, set `robots: { index: false, follow: true }`.
- [ ] Visible page text must contain the phrases the metadata targets — don't game keywords with hidden text.
- [ ] Exactly **one `<h1>`** per page. Headings descend in order — don't jump h2 → h4.
- [ ] Every `<img>` has meaningful `alt` text (decorative images: `alt=""`).
- [ ] Every `<a target="_blank">` has `rel="noopener noreferrer"`.
- [ ] Dynamic routes implement `generateMetadata` — never let a `[param]` page inherit a generic title.
- [ ] When practical, dynamic routes implement `generateStaticParams` for known entities.
- [ ] Add JSON-LD via `<StructuredData>` for the most-fitting schema:
  - **Tool / game / toy** → `WebApplication`
  - **Browsable list** → `CollectionPage` + `ItemList`
  - **Article / story** → `Article` + `BreadcrumbList`
  - **Site root** → `WebSite` + `Person` (already in `src/app/layout.tsx`)
- [ ] Don't lie in schema. No fake `FAQPage`, `Review`, or `AggregateRating` if the UI doesn't render them.
- [ ] Canonical URL via `alternates.canonical` — clean path, no query params.
- [ ] Twitter cards: `summary_large_image` (already default in `createSeoMetadata`).
- [ ] Open Graph image: per-route theme via `/og?theme=<key>`. Confirm it renders by hitting the URL in a browser.
- [ ] After deploy: verify `/sitemap.xml` lists the new route, `/robots.txt` lists the sitemap, page source has `<title>` + canonical + JSON-LD.
- [ ] If the page is for a real entity (person, place, product) but uses a generic title, you've already lost. Be specific.

---

## 10. Privacy + security

- [ ] No `NEXT_PUBLIC_*` for anything sensitive. If a value can leak, it will.
- [ ] No raw user input in analytics events (see §1).
- [ ] No `dangerouslySetInnerHTML` for any string that came from user input or a remote source.
- [ ] Don't log PII or auth tokens. Don't log full request bodies.
- [ ] API routes set explicit cache headers (`Cache-Control: no-store` for mutating or per-user data).
- [ ] Validate every `POST` body — never trust shape or types.
- [ ] Error responses don't leak stack traces.

---

## 11. Build + ship

Before you say "done":

- [ ] `npm run build` passes (no TypeScript errors, no failed pages).
- [ ] `npm test` passes.
- [ ] **Pre-commit hooks (ESLint + Tests) are enabled and passing.** Never use `--no-verify`.
- [ ] No new console errors or React warnings in dev (open the browser, click around, check the console).
- [ ] No new hydration warnings.
- [ ] If the change is UI, you actually opened it in a browser. Type-checks aren't UX-checks.
- [ ] Diff is reviewable: no unrelated formatting noise, no dead code, no committed `console.log`.

---

## 12. Tour guide / first-run UX

If your route has a non-obvious interaction (drag, charge, tap-and-hold, gesture, novel layout), add a tour.

- [ ] Use the existing `TourOverlay` pattern (`components/TourOverlay.tsx`) or per-route `Tour.tsx` component (see `app/coin-flip/components/Tour.tsx`, `app/toodles/Tour.tsx`).
- [ ] Tour fires on **first visit only**. Persist completion in `localStorage` (`<route>_tour_complete`).
- [ ] Provide a **manual re-trigger** (subtle "?" button, watermark, or footer link) for users who want to re-see it.
- [ ] Max **5 steps**. Each step ≤ 1 sentence. Skip-everything button visible from step 1.
- [ ] Track `<route>_tour_open`, `<route>_tour_step_next`, `<route>_tour_skip`, `<route>_tour_complete` via `gtag.track`.
- [ ] Tour never blocks core UI permanently. Esc closes it. Backdrop tap closes it.
- [ ] On mobile, the tour cards must not exceed `min(90vw, 400px)`. They must move out of the way of the element they describe.
- [ ] Don't auto-trigger the tour on every route change. First visit per route, period.

---

## 13. Loading, empty, error states

Every async surface needs three states. No blank-then-pop.

- [ ] **Loading state** — appears within 100 ms if the work takes > 300 ms. Skeleton shapes match the eventual layout. No spinning circles in the middle of nothing.
- [ ] **Empty state** — friendly copy + an action ("nothing yet — try a flip" → tap-to-flip hint). Never just whitespace.
- [ ] **Error state** — human message ("can't reach radar — retrying"), retry button if applicable, the route stays usable in degraded mode.
- [ ] Heavy 3D / WebGL routes: render a deterministic placeholder until the canvas mounts. Use `<GPUAlert />` for hardware acceleration warnings.
- [ ] API failures fire an analytics event (`<feature>_<action>_failed` with truncated reason).
- [ ] Network offline: detect via `navigator.onLine` + `online`/`offline` listeners. Show a thin toast, not a full-screen blocker.
- [ ] Suspense boundaries wrap dynamic imports. Provide a meaningful fallback, not `null`.

---

## 14. Forms

- [ ] Every input has a `<label>` (or `aria-label` if visually hidden).
- [ ] `autoComplete` set correctly (`name`, `email`, `tel`, `off` for one-off fields).
- [ ] `inputmode` set for numeric/decimal/email/url inputs on mobile (better keyboards).
- [ ] `required`, `minLength`, `maxLength`, `pattern` on the input — even when you also validate in JS. The browser's native UX is better than yours.
- [ ] Submit on `Enter` from any input in the form.
- [ ] Disable the submit button only **while submitting**. Don't lock it pre-submit; it confuses people.
- [ ] Show validation errors inline next to the field, not as a global toast.
- [ ] **Don't lose typed text** if the submit fails. Keep state until success or explicit reset.
- [ ] Validate on the server too — never trust the client. Sanitize lengths and types before write.
- [ ] Consent / privacy notes near the submit, not buried in a footer.

---

## 15. Performance budgets

Targets per route (measured on a mid-tier mobile device, throttled 4G):

- [ ] **LCP** < 2.5 s
- [ ] **INP** < 200 ms
- [ ] **CLS** < 0.1
- [ ] **TTFB** < 0.8 s
- [ ] Client JS for the route < **250 KB** gzipped. Check the build output for outliers.
- [ ] Run a Lighthouse mobile audit on each new public route. Aim for **≥ 90** on Performance, Accessibility, Best Practices, SEO before merging.
- [ ] No layout thrash (`offsetWidth`/`getBoundingClientRect` inside `requestAnimationFrame` loops over hundreds of elements).
- [ ] Animate only `transform` and `opacity` — not `top`/`left`/`width`/`height`.
- [ ] `will-change` only on actively animating elements; remove it when the animation ends. Permanent `will-change` causes memory bloat.
- [ ] Use `<Image>` from `next/image` for raster images. Set `priority` only on the LCP image. Set explicit `sizes`.

Web Vitals are already reported via `components/WebVitalsReporter.tsx`. Don't break it.

---

## 16. Z-index hierarchy

Maintain a stable tower. Don't sprinkle `z-[9999]` everywhere.

| Layer | z-index | Examples |
|---|---|---|
| Background | 0 | Page background, doodles |
| Content | 1–9 | Cards, sections |
| Sticky bars | 10–20 | Topbars, sidebars |
| Tooltips | 50 | Hover hints |
| Dropdowns / popovers | 60–80 | Menus, panels |
| Toasts / FeedbackPrompt | 100–120 | Bottom-right pills |
| Modals / dialogs | 200 | Confirm dialogs, FeedbackModal |
| Tour overlays | 300 | First-run guidance |
| Critical alerts | 10000 | GPUAlert |

If you reach for `z-[9999]`, you've made a mistake somewhere lower in the tree.

---

## 17. Internationalization & locale

- [ ] `<html lang="en">` is set in `src/app/layout.tsx`. If you add languages, switch to per-route `lang`.
- [ ] All number / date formatting uses a fixed locale string (`en-US`, etc.) to avoid hydration drift.
- [ ] No hard-coded English strings in shared components if the site might localize. Wrap user-facing copy in a function or constants module that's easy to swap.
- [ ] RTL: don't assume LTR for icon directions, transforms, or `margin-left`. Prefer logical properties (`margin-inline-start`).

---

## 18. .gitignore — what stays out of the repo

The canonical list lives in `.gitignore`. Keep that file and this section in sync.

### Always ignore

- [ ] **Dependencies** — `node_modules/`, `.pnp*`, `.yarn/*` (with allowlisted subfolders), `jspm_packages/`, `bower_components/`.
- [ ] **Build output** — `.next/`, `out/`, `build/`, `dist/`, `.vercel/`, `.netlify/`, `.turbo/`, `.swc/`, `.rollup.cache/`, `storybook-static/`, `*.tsbuildinfo`, `next-env.d.ts.bak`.
- [ ] **Test / coverage / profiling** — `coverage/`, `*.lcov`, `playwright-report/`, `playwright/.cache/`, `test-results/`, `e2e-results/`, `cypress/screenshots/`, `cypress/videos/`, `.nyc_output/`, `*.cpuprofile`, `*.heapprofile`, `*.heapsnapshot`.
- [ ] **Environment / secrets** — `.env`, `.env.*` (with `!.env.example` allowlisted), `*serviceAccount*.json`, `firebase-adminsdk-*.json`, `*.pem`, `*.key`, `*.crt`, `*.p12`, `*.pfx`, `secrets.json`, `*.secrets.json`, `.netrc`.
- [ ] **Local-only application data** — file-based fallbacks for dev mode: `.newsletter/`, `.ai-battle/`, `.feedback/`. Add a new dot-prefixed folder for any new dev fallback.
- [ ] **Logs** — `logs/`, `*.log`, `npm-debug.log*`, `yarn-*.log*`, `pnpm-debug.log*`, `lerna-debug.log*`.
- [ ] **Editor / IDE** — `.idea/`, `.fleet/`, `.zed/`, `.history/`, `*.sublime-workspace`, `*.swp`, `*.swo`, `*~`. For VS Code, ignore `.vscode/*` but allow shared `extensions.json`, `settings.json`, `launch.json`, `tasks.json`.
- [ ] **AI assistant caches (personal)** — `.cursor/`, `.aider*`, `.codeium/`, `.continue/`, `.claude/settings.local.json`. Do **not** ignore `AGENTS.md`, `AGENT_CHECKLIST.md`, or the project-shared `CLAUDE.md` if you have one.
- [ ] **OS noise** — macOS (`.DS_Store`, `.AppleDouble`, `.Spotlight-V100`, `.Trashes`, `.fseventsd`, `.TemporaryItems`), Windows (`Thumbs.db`, `Desktop.ini`, `$RECYCLE.BIN/`, `*.lnk`), Linux (`.directory`, `.Trash-*`, `.nfs*`).
- [ ] **Caches** — `.cache/`, `.parcel-cache/`, `.eslintcache`, `.stylelintcache`.
- [ ] **Patch / merge residue** — `*.rej`, `*.orig`, `*.patch.bak`.
- [ ] **Temp files** — `*.tmp`, `*.temp`, `.tmp/`, `tmp/`, `scratch/`.
- [ ] **Tool noise** — `.sentryclirc`, bundle-analyzer reports.

### Never ignore

- ❌ **Lockfiles** — `package-lock.json`, `yarn.lock`, `pnpm-lock.yaml`. They're the reproducibility contract.
- ❌ **`.env.example`** — public template the team needs.
- ❌ **`AGENTS.md`, `AGENT_CHECKLIST.md`, `README.md`, `CLAUDE.md`** — shared documentation.
- ❌ **Source code, tests, public assets used at runtime, schema migrations, fixture data the app loads.**
- ❌ Editor config the team agrees on (`.editorconfig`, allowlisted `.vscode/` files).

### Rules of thumb

- [ ] If you create a new local-only data folder (file fallback for some service in dev), name it dot-prefixed (`.foo/`) and add it to `.gitignore` in the same commit.
- [ ] If you add a new env var, add a placeholder to `.env.example` in the same change. The actual value goes in `.env.local`.
- [ ] If something is already tracked but should be ignored, run `git rm --cached <path>` then add the rule. Confirm the rm with the user — it's destructive for shared files.
- [ ] If a file appears in `git status` after every command and isn't yours, it's probably an editor / OS file. Add it to `.gitignore` rather than `.git/info/exclude` so the whole team benefits.
- [ ] After editing `.gitignore`, run `git ls-files --ignored --exclude-standard -c` to confirm no tracked file accidentally matches a new rule.

---

## 19. Don'ts

- ❌ Don't add a dependency without explicit user OK. Most "I need a library" needs are 30 lines of code.
- ❌ Don't reformat files you didn't otherwise touch.
- ❌ Don't add emojis to source files unless the user asks for them. (UI copy, analytics events, comments — all no.)
- ❌ Don't add comments that explain *what* the code does. Only *why* — and only when the why is non-obvious.
- ❌ Don't mock the database or Firebase in tests that are supposed to validate the storage path.
- ❌ Don't use `--no-verify`, `--no-gpg-sign`, or otherwise bypass commit hooks.
- ❌ Don't `git push --force` on `main`. Don't `rm -rf` anything outside the workspace.
- ❌ Don't claim a task done if a step in this checklist failed. Say what failed and why.

---

## 20. When in doubt

Ask the user before doing something irreversible, expensive, or visible to others. The cost of a question is low; the cost of an unwanted side effect is high.

If you're stuck between two reasonable options, present both with one-line tradeoffs and let the user pick. Don't silently pick the safer one and pretend it was obvious.

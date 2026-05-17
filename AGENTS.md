# Agent Guide

> **Before any code change, also read [`AGENT_CHECKLIST.md`](./AGENT_CHECKLIST.md).** It is the universal pre-change checklist for every AI assistant (Claude, GPT, Gemini, Cursor, Copilot, Codex, etc.) and humans. This guide covers architecture and conventions; the checklist covers the gates each change must pass.

This repo is `algovision` (AlgoVision sandbox), a standalone Next.js App Router site for highly designed interactive algorithm visualizations. Each experiment can have its own visual language and interaction model.

**Live Laboratory:** [https://vishvavariya.github.io/algovision](https://vishvavariya.github.io/algovision)

## First Principles

- Read the existing route and nearby files before editing.
- Keep route-specific design close to the route.
- Keep shared code shared only when it is genuinely reused.
- Prefer small, focused changes over broad cleanup.
- Do not reorganize unrelated folders unless the task asks for it.
- Do not overwrite user changes in a dirty worktree.

## Maintaining Agent Guidance

Update these instructions when a durable preference or workflow rule is learned, but keep the guidance curated.

- Repo-wide preferences belong in root `AGENTS.md` or `AGENT_CHECKLIST.md`.
- Feature-specific preferences should live close to that feature or route, such as `app/<project>/AGENTS.md`, a colocated README, or concise route-local notes when that is the least surprising place.
- Do not promote one-off feedback, temporary experiments, or a single styling tweak into global guidance.
- When a preference could apply at multiple scopes, choose the narrowest scope that will help the next agent make the right call.
- Mention any guidance updates in the final response so the user knows what became durable.

## Project Structure

Use this pattern for new route-level experiments:

```txt
src/app/<project>/
  page.tsx
  layout.tsx              optional, route-specific metadata or wrappers
  loading.tsx             optional, route-specific loading UI
  components/             page-specific UI and visual pieces
  data/                   optional, route-specific static data
  hooks/                  optional, route-specific client hooks
  utils/                  optional, route-specific pure helpers
```

Use root-level folders (under `src/`) this way:

```txt
src/components/           only global UI reused across routes
src/lib/                  shared domain logic, API helpers, analytics, SEO
src/data/                 shared or large static datasets
src/types/                shared TypeScript types
public/                   static assets served by URL
src/app/api/              API routes
```

Good examples:

- `src/app/algovision/components/VisualizerCanvas.tsx` is route-specific UI.
- `src/lib/seo.ts` stays in `lib` because both SEO config and components use it.
- `src/components/GoogleAnalytics.tsx` and analytics helpers in `src/lib/gtag.ts` are global.

For this standalone repo, prefer colocation under `src/app/` or `src/components/` as appropriate.

## Naming Conventions

Use predictable names so future agents can find things quickly.

- Routes and folders: kebab-case, e.g. `ai-battle`, `new-tool`, `visual-lab`.
- React components: PascalCase, e.g. `AiBattleArena.tsx`, `ProjectApp.tsx`, `ControlPanel.tsx`.
- Hooks: camelCase with `use`, e.g. `useVoteQueue.ts`, `useProjectState.ts`.
- Pure helpers: camelCase functions in `utils.ts` or a specific helper file.
- Shared domain files in `lib`: camelCase by feature, e.g. `aiBattleStore.ts`, `newsletter.ts`.
- Tests: colocate where the repo already does, usually `__tests__/*.test.ts` or `*.test.tsx`.
- Constants: uppercase only for true constants, e.g. `SITE_URL`, `MAX_ITEMS`; otherwise prefer descriptive camelCase.
- Route-specific folders inside `app/<project>` should be plain names like `components`, `hooks`, `utils`, and `data`. Do not use `_components` unless the user asks for that convention.

Prefer names that describe product intent, not implementation mechanics. For example, `VoteStream.tsx` is better than `AnimatedList.tsx`.

## Route Files

Keep `src/app/page.tsx` thin:

- export metadata
- add route-level structured data when useful
- render the main project component
- avoid large client logic directly in `page.tsx`

If the page needs client state, put it in a colocated client component:

```tsx
import { ProjectApp } from './components/ProjectApp'

export default function ProjectPage() {
  return <ProjectApp />
}
```

## Design Style

This site is playful, tactile, and polished. New projects should feel custom, not templated.

- Match the specific route's design language before adding new patterns.
- Avoid generic landing pages when the route should be a usable tool or toy.
- Use dense, useful controls for tools; use more expressive UI for playful experiments.
- Do not add decorative effects that make text hard to read or controls hard to use.
- Avoid badge/pill piles that feel gimmicky; small metadata surfaces should have clear hierarchy, useful context, and a reason to exist.
- Keep text inside buttons and cards from overflowing on mobile.
- Avoid nested cards and unnecessary wrapper panels.
- Prefer purposeful motion with Framer Motion over random animation everywhere.

## Metadata, SEO, And Social

Central SEO config lives in `lib/seo.ts`.

When adding a route:

- add an entry to `seoPages`
- use `createPageMetadata('<key>')`
- add the route to `app/sitemap.ts` if it is not already driven by `seoPages`
- use `StructuredData` for WebApplication, CollectionPage, Article, or BreadcrumbList when appropriate
- keep browser/tab titles short when requested, but keep descriptions useful

Do not add fake FAQ or HowTo schema unless the visible page content genuinely supports it.

SEO checklist for every public route:

- The route has a concise browser title.
- The route has a specific `description`, not a generic site description.
- `alternates.canonical` points at the clean canonical path.
- Open Graph and Twitter metadata are present through `createPageMetadata`.
- If the route is indexable, it appears in `sitemap.xml`.
- If the route creates many static subpages, generate stable sitemap entries for each important page.
- If a page should not rank, add `robots: { index: false, follow: true }`.
- Dynamic/parameter pages should implement `generateMetadata` and, when practical, `generateStaticParams`.
- Visible page content should include the actual phrases the metadata targets. Do not rely on keywords alone.
- Social preview images should use the `/og` endpoint unless the project has a better custom image.

Structured data guidance:

- Use `WebApplication` for tools, toys, games, and interactive apps.
- Use `CollectionPage` plus `ItemList` for browsable collections.
- Use `Article` and `BreadcrumbList` for crawlable story/detail pages.
- Keep schema truthful. If the UI does not show FAQ content, do not add `FAQPage`.
- Escape JSON-LD through `StructuredData`; do not write raw script tags by hand in every route.

SEO files to update when needed:

- `src/lib/seo.ts`
- `src/app/sitemap.ts`
- `src/app/robots.ts`
- `src/app/og/route.tsx`
- `src/app/manifest.ts`

## Analytics

Use `lib/gtag.ts` helpers instead of calling `window.gtag` directly.

- Use `gtag.event(...)` for existing legacy call sites.
- Use `gtag.track(...)` for new call sites.
- Keep event names stable and lowercase with underscores.
- Include useful labels/values, but never send sensitive user input.
- Avoid tracking every tiny interaction if it will create noise.
- Let `lib/gtag.ts` attach page context and `send_to`; do not duplicate that logic.
- Prefer one event at meaningful workflow points over many low-signal events.

Global GA wiring is in:

- `src/components/GoogleAnalytics.tsx`
- `src/components/WebVitalsReporter.tsx`
- `src/lib/analyticsAuto.ts`
- `src/lib/gtag.ts`

GA event naming conventions:

```txt
<feature>_<action>
<feature>_<object>_<action>
```

Examples:

- `home_project_click`
- `pivot_open_company`
- `pivot_filter_category`
- `pomodoro_focus_session_complete`
- `ai_battle_boost`
- `newsletter_subscribe_success`
- `not_found_shortcut_click`

Recommended event params:

- `event_category`: broad group such as `navigation`, `interaction`, `engagement`, or `error`.
- `event_label`: short, non-sensitive label such as project name, model id, filter name, or route.
- `value`: numeric value only.
- Custom params: use snake_case, e.g. `model_id`, `percent_scrolled`, `metric_name`.

Do not send:

- email addresses
- freeform task text
- full custom URLs entered by users
- long search queries if they could contain personal information
- secrets or environment values

Key events worth preserving:

- newsletter success
- completed focus sessions
- AI Battle boosts or streak thresholds
- 404/not-found hits
- outbound/contact clicks
- Web Vitals through the `web_vital` event

## Hydration Safety

Do not call variable browser-only APIs during server/client render if the output affects markup:

- `Math.random()`
- `Date.now()`
- `new Date()` formatting
- `window`, `document`, `navigator`
- locale-dependent formatting

If a visual should randomize, render a deterministic initial state and randomize in `useEffect`, or make the component client-only in a way that does not mismatch server HTML.

## Testing And Verification

Before finishing code changes, run:

```bash
npm run build
npm test
```

**Pre-commit hooks (Husky)** are configured to run `eslint` and `vitest` automatically. Do not bypass them with `--no-verify`.

For docs-only changes, tests are optional; say clearly if they were not run.

For frontend changes, inspect the route in a browser when possible, especially mobile-sized layouts and interactive controls.

Production-ready checklist:

- `npm run build` passes.
- `npm test` passes, unless the change is docs-only.
- **Pre-commit hooks are enabled and passing.**
- No new hydration warnings in the browser console.
- No TypeScript or lint errors from the build.
- New public routes are in SEO config and sitemap.
- New non-indexable routes explicitly set `robots.index = false`.
- Analytics events use `gtag.track`/`gtag.event`, not `window.gtag`.
- Interactive controls have accessible labels when text is not visible.
- Mobile layout has no overlapping text, clipped controls, or horizontal scroll.
- Buttons and links do not accidentally nest invalid interactive elements.
- Remote images/videos used by a page have fallbacks or graceful error states.
- API routes set appropriate cache headers, runtime, and error responses.
- Server-only secrets are never exposed through `NEXT_PUBLIC_*`.
- Local-only generated files are not committed.

For AI Battle production smoke tests, also check:

- `/api/ai-battle` returns the expected Firebase/local storage mode.
- `/api/ai-battle/catalog?q=claude&limit=3` returns catalog results.
- `/api/ai-battle/sync-models` requires the admin token.
- Boosts update optimistically on the page and eventually sync.

For SEO verification after deployment:

- Open `/sitemap.xml` and confirm new URLs exist.
- Open `/robots.txt` and confirm sitemap is listed.
- Inspect page source for `<title>`, canonical URL, description, OG tags, and JSON-LD.
- Submit or refresh the sitemap in Google Search Console for important changes.

## Content Tone

Copy should feel human, playful, and concise. Avoid bland SaaS phrasing. Each project can have its own personality, but keep UI labels clear enough that users know what to do.

## When Unsure

Prefer the least surprising local pattern:

1. Route-specific visual code goes under `app/<project>/components`.
2. Shared product/domain logic goes under `lib`.
3. Truly reusable UI goes under `components`.
4. Static assets go under `public`.
5. Data that non-code editors may update goes under `data`.

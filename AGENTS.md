# DentalSoft — Agent Guide

Local-first dental clinic EMR. French UI (FR-FR), DA currency, Electron-style desktop app served as a web app. No cloud services — never introduce SaaS/network dependencies.

## Stack

| Layer | Tech |
|---|---|
| Client | React 19 + Vite 7 + TypeScript 5.6, Tailwind CSS v4, Radix/shadcn, framer-motion |
| Routing / data | wouter, TanStack Query (`client/src/hooks/use-api.ts` is the single API layer) |
| Server | Express 4 + Drizzle ORM + PostgreSQL (`@neondatabase/serverless` driver) |
| Validation | Zod end-to-end (`shared/schema.ts`, drizzle-zod) |
| Auth | passport-local + bcryptjs + JWT + express-session |

## Commands

```bash
npm run dev          # tsx server/index.ts → http://localhost:5000
npm run build        # client (vite) + server (esbuild) → dist/
npx tsc --noEmit     # type check — MUST pass with 0 errors before any delivery
npm run db:push      # drizzle-kit push schema changes
```

## Verification Loop (mandatory after every change)

1. `npx tsc --noEmit` → 0 errors
2. `npm run build` → success (~2828 modules)
3. Restart detached server, then verify HTTP 200 on `http://localhost:5000`
4. Dev login: seeded in `server/seed.ts` (see QA protocol in docs)

## Environment Notes

- Agent shell is **Windows PowerShell 5.1**: no `&&`, no `head`, no `rg` on PATH.
- Use the `workdir` parameter instead of `cd`; quote paths containing spaces (`C:\htdocs\DentalSoft 31052026`).
- Restart pattern: `cmd /c "cd /d <root> && taskkill /F /IM node.exe ... ; start /min node dist/index.cjs"`

## Non-Negotiable Conventions

Full rules live in `docs/03_DEVELOPMENT_RULES.md` and `docs/DENTALSOFT_AI_MASTER_RULES.md`. Highlights agents violate most:

- Currency is **DA** — never `$`. UI language is **French** — never English strings in UI.
- Local-first only — no cloud APIs, no telemetry, no external CDNs at runtime.
- Components ≤ 400 lines; use design tokens from `client/src/index.css` (cyan primary #0891B2, DM Sans).
- Shared components exist for a reason: `StatusBadge` (expects capitalized statuses), `PageStatCard`, `PremiumCard`, `EmptyState`. Do not inline replacements.
- No placeholders, mock data, or dead buttons.

## Daily ECC Skills (load every session)

`react-patterns` · `react-performance` · `frontend-patterns` · `vite-patterns` · `postgres-patterns` · `api-design` · `error-handling` · `coding-standards` · `healthcare-emr-patterns` · `verification-loop`

## Delegation Agents

`typescript-reviewer` · `react-reviewer` · `database-reviewer` · `architect` · `code-reviewer`

For anything else, use the library router: `.opencode/skills/skill-library/SKILL.md`

## Docs Map

| Doc | Contents |
|---|---|
| `docs/00_MASTER_HANDOVER.md` | Current state, how to resume work |
| `docs/01_PROJECT_OVERVIEW.md` | Product scope and modules |
| `docs/02_MASTER_ARCHITECTURE.md` | System architecture |
| `docs/03_DEVELOPMENT_RULES.md` | Coding rules, forbidden patterns |
| `docs/04_UI_UX_GUIDELINES.md` | Design system and UI standards |
| `docs/05_PATIENT_WORKSPACE_SPEC.md` | Patient workspace spec |
| `docs/06_DATABASE_RULES.md` | Schema and migration rules |
| `docs/07_QA_PROTOCOL.md` | Test/verification protocol |
| `docs/08_ROADMAP.md` | Planned work |
| `docs/09_MASTER_PROMPT.md` | Master prompt for AI sessions |
| `docs/DENTALSOFT_AI_MASTER_RULES.md` | Exhaustive AI rulebook |

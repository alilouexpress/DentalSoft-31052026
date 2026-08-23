---
name: skill-library
description: Router for LIBRARY-tier ECC skills in DentalSoft. Use when a task matches a keyword below but no DAILY skill covers it — load the referenced global skill on demand instead of keeping it always-loaded. DAILY skills are listed in the root AGENTS.md and need no router.
---

# Skill Library — DentalSoft

Two tiers:

- **DAILY** (always loaded): listed in root `AGENTS.md`. Do not re-index here.
- **LIBRARY** (this file): useful but not every-session. Load the referenced skill only when its trigger appears.

Library skills live in the global ECC install (`~/.opencode/skills/<name>/SKILL.md`). Read that SKILL.md before applying any workflow below.

## Healthcare Compliance

| Trigger | Load |
|---|---|
| HIPAA, PHI, patient data protection audit | `hipaa-compliance` |
| PHI handling in code (logging, storage, export) | `healthcare-phi-compliance` |
| Clinical decision support logic | `healthcare-cdss-patterns` |

Note: DentalSoft is local-first; these apply to data-handling reviews, not architecture changes.

## UI Craft

| Trigger | Load |
|---|---|
| Design system audit, token consistency | `design-system` |
| WCAG, contrast, keyboard nav, screen readers | `frontend-a11y`, `accessibility` |
| Polish pass: spacing, motion, micro-interactions | `make-interfaces-feel-better`, `impeccable` |
| Motion/animation work beyond framer-motion basics | `motion-foundations`, `motion-patterns` |
| Visual QA in browser | `browser-qa` |

These were DAILY during the 2026 premium redesign phase — demoted after. Re-promote if a new design phase starts.

## Testing (BLOCKED until test stack exists)

| Trigger | Load |
|---|---|
| Adding vitest/jest/playwright to the repo | `react-testing`, `tdd-workflow`, `e2e-testing` |
| Regression strategy for AI-written code | `ai-regression-testing` |

Do not load these for normal tasks: repo has **zero test files and no runner** (`package.json` has no test script). First action under this trigger is installing vitest, then promoting this group to DAILY.

## Off-Stack (do NOT load)

django/laravel/springboot/quarkus/fastapi/nestjs/vue/nuxt/angular/nextjs/kotlin/swift/rust/go/php/perl/dotnet/cpp/flutter/android/react-native families — zero matching source files in this repo. If the stack ever changes, update root `AGENTS.md` first.

## Ops & Misc

| Trigger | Load |
|---|---|
| Docs drift between sessions | `living-docs-governance` |
| Pre-launch readiness review | `production-audit` |
| Trimming global skill install | `config-gc`, `skill-stocktake` |
| Git branching/commit conventions debate | `git-workflow` |

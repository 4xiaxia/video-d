# teaching-cut-cleanroom — Overview

> **Navigation aid.** This article shows WHERE things live (routes, models, files). Read actual source files before implementing new features or making changes.

**teaching-cut-cleanroom** is a typescript project built with raw-http.

## Scale

12 API routes · 61 UI components · 161 library files · 9 middleware layers · 58 environment variables

## Subsystems

- **[Cosyvoice-gateway](./cosyvoice-gateway.md)** — 1 routes — touches: auth
- **[Ontology-studio](./ontology-studio.md)** — 6 routes — touches: auth, cache
- **[Zeabur-server](./zeabur-server.md)** — 5 routes — touches: auth, payment

**UI:** 61 components (react) — see [ui.md](./ui.md)

**Libraries:** 161 files — see [libraries.md](./libraries.md)

## High-Impact Files

Changes to these files have the widest blast radius across the codebase:

- `src\domain\teachingProject.ts` — imported by **63** files
- `历史\skills 要用啊\graphify\src\types.ts` — imported by **42** files
- `历史\skills 要用啊\graphify\src\export.ts` — imported by **26** files
- `历史\skills 要用啊\graphify\src\git.ts` — imported by **19** files
- `历史\skills 要用啊\graphify\src\flows.ts` — imported by **19** files
- `历史\skills 要用啊\graphify\src\review-store.ts` — imported by **18** files

## Required Environment Variables

- `ANTHROPIC_API_KEY` — `历史\skills 要用啊\graphify\tests\llm-execution.test.ts`
- `CLAUDE_CONFIG_DIR` — `历史\skills 要用啊\graphify\src\cli.ts`
- `CLAUDE_HOME` — `scripts\audit-local-order.mjs`
- `CLEANROOM_CHROMIUM_PATH` — `scripts\debug-browser-monitor.mjs`
- `CLEANROOM_PORTABLE_DIST` — `scripts\smoke-portable-playwright-math.mjs`
- `CLEANROOM_PROBLEM` — `scripts\live-fill-and-generate.mjs`
- `CLEANROOM_SMOKE_URL` — `scripts\live-fill-and-generate.mjs`
- `CLEANROOM_TARGET_URL` — `scripts\debug-browser-monitor.mjs`
- `CODEX_HOME` — `scripts\audit-local-order.mjs`
- `COHERE_API_KEY` — `历史\skills 要用啊\graphify\tests\llm-execution.test.ts`
- `CONTINUITY_STACK_CONFIG` — `scripts\audit-local-order.mjs`
- `COSYVOICE_GATEWAY_HOST` — `scripts\cosyvoice-gateway.mjs`
- _...43 more_

---
_Back to [index.md](./index.md) · Generated 2026-06-05_
# Zeabur-server

> **Navigation aid.** Route list and file locations extracted via AST. Read the source files listed below before implementing or modifying this subsystem.

The Zeabur-server subsystem handles **5 routes** and touches: auth, payment.

## Routes

- `ALL` `/api/health` [auth, payment] `[inferred]`
  `scripts\zeabur-server.mjs`
- `ALL` `/api/feishu/board-script/import` [auth, payment] `[inferred]`
  `scripts\zeabur-server.mjs`
- `ALL` `/api/feishu/board-script/import/latest` [auth, payment] `[inferred]`
  `scripts\zeabur-server.mjs`
- `ALL` `/api/agent/script-board` [auth, payment] `[inferred]`
  `scripts\zeabur-server.mjs`
- `ALL` `/api/` [auth, payment] `[inferred]`
  `scripts\zeabur-server.mjs`

## Source Files

Read these before implementing or modifying this subsystem:
- `scripts\zeabur-server.mjs`

---
_Back to [overview.md](./overview.md)_
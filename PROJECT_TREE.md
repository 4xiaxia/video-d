# Project Tree

更新时间：2026-06-07 04:27:13 +08:00

说明：这是关键工程树，不展开 `node_modules`、`dist`、`历史/` 等噪音目录。需要全量文件时用 `rg --files`。

```text
D:/video-dev-cleanroom
├── AGENTS.md
├── PROJECT_STATE.md
├── ENGINEERING_LOG.md
├── DECISIONS.md
├── ARCHITECTURE.md
├── KNOWN_ISSUES.md
├── PROJECT_TREE.md
├── CHANGE_TREE变更树.md
├── 真相路标-当前唯一入口.md
├── 认知图-核心逻辑动态图.md
├── ABC字段函数前端映射表.md
├── package.json
├── vite.config.mjs
├── .claude/
│   └── desktop-tools/
│       └── continuity-weapon/
│           ├── continuity-audit.ps1
│           ├── continuity-doctor.ps1
│           ├── continuity-install-project.ps1
│           ├── continuity-install-system-skill.ps1
│           ├── continuity-stack.sample.json
│           └── 秩序专武说明书.md
├── scripts/
│   ├── check-continuity-docs.mjs
│   ├── audit-local-order.mjs
│   ├── continuity-stack.config.json
│   ├── script-agent-rows-contract.mjs
│   ├── zeabur-server.mjs
│   ├── check-board-boundaries.mjs
│   ├── check-board-handwriting-support.mjs
│   ├── check-script-agent-rows-contract.mjs
│   ├── smoke-ui-workbench.mjs
│   └── smoke-recording-focus-mode.mjs
└── src/
    ├── App.tsx
    ├── main.tsx
    ├── stage.css
    ├── agent/
    ├── components/
    │   └── CoursewareSegmentChrome.tsx
    ├── config/
    ├── domain/
    ├── modules/
    │   ├── boardSticker/
    │   │   ├── mathBoardText.ts
    │   │   ├── boardTextDisplayRoute.ts
    │   │   └── renderBoardTextStickerImage.ts
    │   ├── timeline-factory/
    │   ├── stageRecorder/
    │   └── speechText/
    ├── protocols/
    ├── services/
    │   └── scriptAgentGatewayClient.ts
    ├── store/
    ├── ui/
    └── workflow/
```

## 当前关键入口

- 分片 chrome 模块：`src/components/CoursewareSegmentChrome.tsx`
- C 普通文本主路：`src/components/BoardHandwritingStickerContent.tsx`
- C 普通文本录制：`src/components/AutoHandwritingLayer.tsx`
- 当前舞台公共入口：`src/components/StagePreview.tsx`
- 当前舞台生产链：`src/components/LegacyStagePreview.tsx` -> `src/components/DrawboardStage.tsx` -> `src/components/AutoHandwritingLayer.tsx`
- Konva 迁移 proof：`src/components/KonvaRecordingSurface.tsx`、`src/standalone/KonvaProofPage.tsx`
- C 普通文本路由：`src/modules/boardSticker/mathBoardText.ts`
- 板书显示路由：`src/modules/boardSticker/boardTextDisplayRoute.ts`
- 备用 PNG 渲染：`src/modules/boardSticker/renderBoardTextStickerImage.ts`
- 第二步 rows 合同：`scripts/script-agent-rows-contract.mjs`
- 第二步本地网关：`vite.config.mjs`
- 第二步 Node 网关：`scripts/zeabur-server.mjs`
- 当前真相入口：`真相路标-当前唯一入口.md`
- 结构脑图：`认知图-核心逻辑动态图.md`
- 时间线变更树：`CHANGE_TREE变更树.md`
- 秩序专武：`.claude/desktop-tools/continuity-weapon/`

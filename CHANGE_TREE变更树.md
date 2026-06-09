# Change Tree

## 2026-06-09
- `src/components/StagePreview.tsx`
  恢复为实体舞台入口，直接组合 `DrawboardStage`、`AutoHandwritingLayer`、`StagePreviewToolbar`。
- `scripts/check-drawboard-component-boundaries.mjs`
  同步当前 canvas 合成录制链、`enhancedChildren` 子层插槽和工具条位置。
- `scripts/check-board-boundaries.mjs`
  纳入 `StagePreview` 文案源，守护 C 素材分区容器 + 文档流段落。
- `scripts/check-board-clips-merge.mjs`
  portable Node 缺失时 fallback，并补临时 ESM import 修补。
- `scripts/check-board-event-clips.mjs`
  portable Node 缺失时 fallback，并补临时 ESM import 修补。
- `scripts/check-board-events.mjs`
  portable Node 缺失时 fallback。
- `scripts/check-tts-batch-jobs.mjs`
  portable Node 缺失时 fallback。

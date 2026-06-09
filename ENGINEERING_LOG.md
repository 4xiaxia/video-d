# Engineering Log

## 工作单元 #2026-06-09-01 当前项目 xray 与守护链修复

### 背景
用户要求旧内容勿用，重新 xray 当前项目并修 bug。本轮从当前文件系统、源码和命令输出建立事实。

### 复现
- `npm run typecheck` 初始通过。
- `npm run check:board-boundaries` 初始失败：缺少 `整张画布都是 C 素材演绎区` 等同步文案源。
- `node scripts/check-drawboard-component-boundaries.mjs` 初始失败：`StagePreview` 是转发壳，守护无法看到 `DrawboardStage` 组合。
- `npm run check:board-clips-merge`、`check:board-event-clips`、`check:board-events` 初始失败：硬编码 `runtime/node/node.exe`，当前机器不存在。

### 根因
- `src/components/StagePreview.tsx` 只有 re-export，真实实现藏在 `LegacyStagePreview.tsx`，破坏公共入口守护定位。
- 画布组件和录制链已演进为 canvas 合成录制，但 `check-drawboard-component-boundaries.mjs` 仍检查旧的 `targetRef` 录制方式。
- 当前 C 素材实现已是分区容器 + 文档流段落，`check-board-boundaries.mjs` 仍要求旧的单贴纸 resize 文案。
- 多个临时编译检查脚本未像其他脚本一样在 portable Node 缺失时 fallback。

### 改动
- `src/components/StagePreview.tsx` 恢复为实体组件，直接组合舞台、自动板书层和录制工具条。
- 更新 `scripts/check-drawboard-component-boundaries.mjs`，检查当前 canvas 合成录制链、`enhancedChildren` 子层插槽和工具条实际位置。
- 更新 `scripts/check-board-boundaries.mjs`，纳入 `StagePreview` 文案源，并守护分区容器 + `<p>` 文档流实现。
- 更新 `scripts/check-board-clips-merge.mjs`、`scripts/check-board-event-clips.mjs`、`scripts/check-board-events.mjs`、`scripts/check-tts-batch-jobs.mjs`，portable Node 缺失时使用 `process.execPath`。
- 补齐临时编译产物的 ESM import 扩展名修补。

### 验证
- `node scripts/check-drawboard-component-boundaries.mjs`：通过。
- `npm run check:board-boundaries`：通过。
- `npm run check:board-clips-merge`：通过。
- `npm run check:board-event-clips`：通过。
- `npm run check:board-events`：通过。
- `npm run check:tts-batch-jobs`：通过。
- `npm run typecheck`：通过。
- `npm run build`：通过。
- `npm run check:all`：通过。

### 接力棒（下一个单元从这里开始）
继续修 bug 时先问清具体症状或直接跑目标 smoke。当前守护基线已恢复为绿色；不要把工作树里大量既有删除文件当成本轮改动处理。

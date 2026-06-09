# Project State

## 基本信息
- 项目：`D:\video-dev-cleanroom`
- 当前任务：重新 xray 当前项目并修复当前可复现 bug。
- 当前事实源：当前源码、当前脚本、当前命令输出；未使用旧连续性记录作为依据。

## 当前状态
- `StagePreview` 公共入口已恢复为实体组件，直接组合 `DrawboardStage`、`AutoHandwritingLayer`、`StagePreviewToolbar`。
- 画布守护脚本已同步当前真实录制链：`StagePreview` 收集 base/content/overlay canvas，`StageRecorderControl` 做 canvas 合成录制。
- `check-board-boundaries` 已同步当前 C 素材分区容器 + 文档流段落实现，不再要求旧的单贴纸 resize handle 文案。
- 若缺少 `runtime/node/node.exe`，相关检查脚本会回落到 `process.execPath`。

## 验证
- `npm run typecheck`：通过。
- `node scripts/check-drawboard-component-boundaries.mjs`：通过。
- `npm run build`：通过。
- `npm run check:all`：通过。

## 下一步（接力棒）
- 下一轮如果继续修 UI bug，先用当前 `check:all` 作为基线。
- 当前工作树有大量既有删除/搬移痕迹，不属于本轮修复；不要误回滚。
- 如需验证视觉表现，优先跑相关 `smoke:*` 或启动 Vite 后用浏览器检查画布。

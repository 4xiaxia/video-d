# Decisions

## 2026-06-09：当前事实源优先
- 决策：本轮不使用旧连续性内容作为依据，只使用当前源码和命令输出。
- 原因：用户明确要求“旧的内容勿用，重新 xray 项目”。

## 2026-06-09：StagePreview 必须是可检查公共入口
- 决策：`src/components/StagePreview.tsx` 保持实体组件，不再只是 re-export。
- 原因：公共入口需要显式呈现 `DrawboardStage`、`AutoHandwritingLayer`、录制工具条的组合边界，便于守护脚本检查。

## 2026-06-09：检查脚本允许 portable Node 缺失 fallback
- 决策：临时编译检查脚本在 `runtime/node/node.exe` 不存在时使用 `process.execPath`。
- 原因：当前机器无 portable Node；硬编码路径会让可验证逻辑在本机不可运行。

## 2026-06-09：C 素材当前形态为分区容器 + 文档流
- 决策：守护当前 C 素材实现为 `board-zone-container` 分区容器和段落式 C 贴纸，不恢复旧 per-sticker resize handle。
- 原因：当前源码已明确采用分区容器 + 文档流路线，本轮不回滚用户已有改动。

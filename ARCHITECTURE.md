# Architecture

## 当前主流程
- `App.tsx` 组装资源面板、`StagePreview`、时间线、检查器。
- `StagePreview` 是舞台公共入口，读取 canvas、problemText、boardClips、playheadMs，并组合录制工具条。
- `DrawboardStage` 负责课件舞台壳、底图 canvas、分区 chrome、问题区域、金手指层和 C 子层插槽。
- `AutoHandwritingLayer` 负责 C1 自动板书 actor，将 board clips 显示到分区容器内，并暴露 C 内容录制 canvas。
- `StageRecorderControl` 通过 `useCanvasRecorder` 合成 base/content/overlay canvas 录制。
- 时间线工厂将 TTS board events 映射为 board clips，并填充 C 初始视觉字段。

## 文档与连续性架构
- `PROJECT_STATE.md` 保存当前事实、验证和下一棒。
- `ENGINEERING_LOG.md` 保存可追溯工作单元。
- `DECISIONS.md` 保存工程决策与理由。
- `ARCHITECTURE.md` 保存主流程和模块边界。
- `KNOWN_ISSUES.md` 保存已知陷阱和处理方式。
- `PROJECT_TREE.md` 保存关键结构，不做噪声全量树。
- `CHANGE_TREE变更树.md` 保存变更树。

## 关键边界
- A 轨音频、B 时间、C 视觉字段仍按 ABC 边界分工。
- `DrawboardStage` 不直接拥有 A/B/C 业务数据，只提供画布房子和子层插槽。
- `AutoHandwritingLayer` 不拥有 A 音频、TTS、store 或 timeline factory。
- 检查脚本必须可在无 portable Node 的当前机器运行。

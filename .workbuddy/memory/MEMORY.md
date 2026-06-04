# 项目长期记忆

## 板书留场语义（2026-06-04）

- 项目本质：直播仿板书在线解题；正常板书逻辑是“写完留在黑板上”，不是写完消失。
- C 板书内容自然播放完毕后默认应 stay 在画布上，直到被后续逻辑/用户操作明确处理。
- B 时间切片仍保留拖动控制能力：拖动 B 可控制 C 的站场/显示时长。
- 正确交互：播放完的切片末尾显示 lock 小图标；默认锁定 stay。点击 lock 解锁后，允许拖动 B 来控制 C 内容站场时长。
- 之前 `STATIC_HOLD_DURATION_MS = 1000` 的 1 秒宽限方案是认知偏差：它把“板书长期留场”误解成“播放结束后短暂缓冲”。后续修复应撤掉/替换该语义。
- 2026-06-04 已按代码实现纠偏：`TimelineClip.hideAtMs?: number` 表示显式下台截止时间；未设置 `hideAtMs` 时 C 默认 stay；设置后 playhead 到点隐藏。`AutoHandwritingLayer` 使用 `isBoardClipVisibleAtPlayhead(playheadMs, startMs, hideAtMs)`，不再使用 1 秒 static hold。默认 lock 时不拖 B，unlock 后写入/调整 `hideAtMs`。
# 项目长期记忆

## 铁律：每个值必须有来路去处（2026-06-04）

改代码前四问：
1. **这个值从哪一环继承？**
2. **当前层有没有重新定义第二套？**
3. **DOM / Canvas / Konva / 录制是否都在消费同一个来源？**
4. **如果这个值不是继承来的，还算不算 workflow？**

审查标准：哪里来、用途是什么、传递什么参数、承接来源。运行逻辑有且只能有一个，清晰明确的。答不清楚来源的值→不允许进入主线。

## 板书留场语义（2026-06-04）

- 项目本质：直播仿板书在线解题；正常板书逻辑是“写完留在黑板上”，不是写完消失。
- C 板书内容自然播放完毕后默认应 stay 在画布上，直到被后续逻辑/用户操作明确处理。
- B 时间切片仍保留拖动控制能力：拖动 B 可控制 C 的站场/显示时长。
- 正确交互：播放完的切片末尾显示 lock 小图标；默认锁定 stay。点击 lock 解锁后，允许拖动 B 来控制 C 内容站场时长。
- 之前 `STATIC_HOLD_DURATION_MS = 1000` 的 1 秒宽限方案是认知偏差：它把“板书长期留场”误解成“播放结束后短暂缓冲”。后续修复应撤掉/替换该语义。
- 2026-06-04 已按代码实现纠偏：`TimelineClip.hideAtMs?: number` 表示显式下台截止时间；未设置 `hideAtMs` 时 C 默认 stay；设置后 playhead 到点隐藏。`AutoHandwritingLayer` 使用 `isBoardClipVisibleAtPlayhead(playheadMs, startMs, hideAtMs)`，不再使用 1 秒 static hold。默认 lock 时不拖 B，unlock 后写入/调整 `hideAtMs`。

## B/C 职责边界 + 内容流水线（2026-06-04）

- **B 只管时间**：每个语音切片对应的 C 在画布上呆多久。`startMs/endMs/hideAtMs` 全在 B 域。
- **C 内容在第二步就已决定**：`ScriptAgentTableEditor` 的 `boardSlice` 列就是用户内容编辑入口（金手指）。Agent 生成 → 用户可改 boardSlice → compiler 投影到 C。
- **站位由 chainKey 标签决定**：`template-open`→problem(题目区) / `template-pre`→analysis(分析区) / `step-N`→solution(解答区，右半) / `template-end`→summary(总结区)。四区边界在 `COURSEWARE_ZONE_BOUNDS`。C 不发明内容、不决定站位。
- **C 五可调**：速度(`drawSpeed`) / 位置(`xPercent/yPercent`) / 大小(`widthPercent/fontSize`) / 字体(当前仅项目级) / 内容(`boardSlice`在第二步编辑)。
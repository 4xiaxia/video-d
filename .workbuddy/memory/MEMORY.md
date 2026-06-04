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

## C 层交互模型：播放 / 拖拽 / 金手指 / 画笔（2026-06-04）

> 以下关系不可混淆，Konva 迁移后也必须保持等价。

### 模式一：off — C 可交互

```
toolMode = 'off'
  └─ GoldenFingerCanvasLayer pointerEvents = 'none'  ← 事件穿透
       └─ CStickerFrame 收到 onPointerDown
            ├─ 选中 → onSelectBoardClip(clipId)
            ├─ 冻结 reveal 进度 → frozenRevealRef
            ├─ move 拖拽 → startDrag({ mode: 'move' })
            │    └─ useBoardStickerDragController
            │         └─ pointermove → createBoardStickerMovePatch(xPercent/yPercent)
            │         └─ pointerup → onUpdateBoardClip(clipId, patch)  ← 写 ABC base
            │
            └─ resize 拖拽 → startDrag({ mode: 'resize' })
                 └─ onResizePointerDown (resize handle)
                      └─ createBoardStickerUniformResizePatch(widthPercent/fontSize)
                      └─ onUpdateBoardClip(clipId, patch)  ← 写 ABC base
```

**关键行为**：
- C 贴片可点击选中 → 右侧 Inspector 面板显示
- C 贴片可拖拽移动 → 写 xPercent/yPercent
- C 贴片可拖拽右下角 resize → 写 widthPercent + fontSize 联动缩放
- 拖拽时 reveal 进度冻结在按下那一刻的进度（不随 playhead 变化）
- yPercent 受 `constrainYPercentToZone` 约束，不能漂移到其他区域

### 模式二：pen / eraser / highlight / circle / cross — C 冻结，金手指接管

```
toolMode = 'pen' | 'eraser' | 'highlight' | 'circle' | 'cross'
  └─ GoldenFingerCanvasLayer pointerEvents = 'auto'  ← 事件拦截
       └─ CStickerFrame 收不到任何事件（C 层冻结）
       └─ GoldenFingerCanvasLayer 独占所有 pointer 事件
            ├─ pen → 自由手绘 (freehand drawing)
            ├─ eraser → 擦除已有笔迹
            ├─ highlight → 半透明宽笔（荧光笔，alpha=0.35）
            ├─ circle → 两点椭圆标注
            └─ cross → 两点叉叉标注
       
       所有笔迹存储：GoldenFinger 内部 React state (overlay strokes)
       ❌ 绝不写 TimelineClip / ABC base / boardSlice
       ❌ 绝不写 store
```

**金手指铁律**：overlay 画笔层只写在 overlay canvas 上，**永不碰 ABC base 数据**。这是换 Konva 也不变的原则。

### 模式切换

```
BoardStageToolOverlay（工具栏）
  └─ onChangeToolMode(mode)
       └─ LegacyStagePreview.setState(activeToolMode)
            └─ DrawboardStage.props.activeToolMode
                 └─ GoldenFingerCanvasLayer: pointerEvents 切换
                 └─ DrawboardStage overlayContainer: pointerEvents 切换
```

### 录制三层合成

```
useCanvasRecorder.startRecording(base, content, overlay)
  └─ 创建隐藏 compositionCanvas（1920×1080 全分辨率）
  └─ compositionCanvas.captureStream(30fps)
  └─ appendActiveVoiceAudioTracks (从 <audio> 抓音轨)
  └─ rAF 逐帧合成：
       ctx.drawImage(baseCanvas, 0, 0)      ← CanvasRecordingSurface（底板+标签+题文）
       ctx.drawImage(contentCanvas, 0, 0)    ← AutoHandwritingLayer.recordingCanvas（C 板书）
       ctx.drawImage(snapshotCanvas, 0, 0)   ← GoldenFingerCanvasLayer（标注覆盖层）
  └─ MediaRecorder → Blob → 下载

声音：getActiveVoiceAudioElement() → audio.captureStream().getAudioTracks() → videoStream.addTrack()
```

### 坐标与站位

```
chainKey                       → zone         → 区域边界
template-open                  → problem      → top: 2.4% ~ 22.4%
template-pre                   → analysis     → top: 24% ~ 46%
step-N                         → solution     → top: 2.4% ~ 72.4%（最大）
template-end                   → summary      → top: 74% ~ 98%

C 贴片 xPercent/yPercent 是画布百分比坐标。
constrainYPercentToZone 保证拖拽不越区。
DOM 标签和 Canvas 录制标签共用 COURSEWARE_ZONE_BOUNDS（同源坐标）。
```
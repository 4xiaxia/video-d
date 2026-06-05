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

## 页面预览 / 录制底板同源（2026-06-05）

- `DrawboardStage` 当前结构：DOM 标签/题文负责页面预览；`CanvasRecordingSurface` 仅作录制 base canvas。
- 页面层通过 `.canvas-recording-surface { opacity: 0; pointer-events: none; position: absolute; z-index: 0; }` 隐藏录制底板，避免人眼重影；录制合成仍读取该 canvas 像素。
- “页面缩放版”和“录制完整尺寸版”是同一真相的不同消费者，不应复制第二套内容逻辑。


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

## 甲方降配后的板书方案（2026-06-05）

- 原“SVG/逐笔轨迹”方案不删除，作为甲方反悔时的备用路线冻结保存。
- 当前主线降配为：**手写字体 + 普通文本输入 + 逐字 reveal**。
- 除“不再依赖 SVG/逐笔 path”外，其他既有逻辑不变：速度、时间、留场、B/C 职责、站位、拖拽缩放、录制合成都沿用原方案。
- `boardSlice` 仍是唯一内容真相；用户输入正常文本，渲染层用手写字体显示。
- reveal 单位从笔画/路径切换为字符；仍继承既有 `drawSpeed` / `startMs` / `endMs` / `hideAtMs`。
- 当前优先级：冻结旧 SVG 路线 → 新建/切换文本 reveal 渲染路线 → 保持外部行为不变。
- 文本输入必须走“最土的普通多行文本”路线：第三步板书内容怎么换行，C 就怎么换行显示；`\n` 是排版真相，不能在渲染层压成一行。
- 排版只做基础参数：`fontSize`、`lineHeight`、文本行数组、手写字体；不要做复杂智能排版。优先人工换行，必要时只做越界兜底。
- 截图确认：左侧第三步板书内容与右侧 C 控制处排版是对的；错误发生在“写入页面/舞台渲染”环节，说明页面渲染层压扁了换行或没有按多行文本绘制。
- 标签布局不要框死：标签可拖动，也可按内容块自适应流动；默认可根据板书文本块测量结果，把分区标签放在内容块旁边，容器边距/间隔先按 3px 处理，不引入复杂布局系统。

## 当前压缩断点：C 板书降配与文档纠偏（2026-06-05）

- 当前任务不是继续大改 Konva，而是先把真相文档压实，防止旧“SVG/逐笔轨迹/CSS reveal/Konva clip+tween”口径继续误导施工。
- 甲方降配后的唯一主线：`boardSlice` 普通多行文本 → 保留用户换行 `\n` → 手写字体显示 → 按字符逐字 reveal → 页面缩放版与录制全尺寸版消费同一参数。
- 旧路线：SVG/path/逐笔轨迹冻结备用，不删除、不作为当前施工依据。
- 文档待纠偏文件：`真相路标-当前唯一入口.md`、`认知图-核心逻辑动态图.md`、`ABC字段函数前端映射表.md`、`CHANGE_TREE变更树.md`。
- 代码待查重点：页面/舞台渲染层为什么把第三步正确的多行 `boardSlice` 写错；优先查换行保留、`lineHeight`、文本块 bbox、标签与内容块 3px 自适应关系。
- Agent 实时排版矫正只能是兜底：检测越界/压线/遮挡，给建议或轻量调 `fontSize/xPercent/yPercent/widthPercent`；不能偷偷改 `boardSlice`，尤其不能改用户换行。
- 最低风险施工顺序：先不引入 Agent，只埋未来矫正线；先保留多行文本真相，再测文本块 bbox，再让标签默认跟随 bbox + 3px，最后才做标签拖动 manual override。
- 施工纪律：夏夏很害怕改错，宁可慢也必须安全。每次变更都要小步、可回退、先说明目标和边界；代码/文档变更后必须写 `CHANGE_TREE变更树.md` 记录目标、改动文件、验证和下一枝入口。

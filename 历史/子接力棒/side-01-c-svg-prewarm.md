# side-01-c-svg-prewarm

时间：2026-05-19 02:20

## 本次 side 任务目标

- 设计并钉住 `TTS ready results + board events -> C asset prewarm queue`
- 把 C 本体 / 展示分层写成可执行合同
- 为后续 `SVG/path renderer` 提供干净输入，不先急着接渲染

## 任务

- 设计 `TTS ready results + board events -> C asset prewarm queue`

## 边界

- 只改：C 预生成设计、缓存键、失效规则、资料链
- 不碰：A/B 主真相、播放时钟已完成刀、GoldenFinger 顶层画笔

## 入口文件

- `当前短便签_小白板救回_2026-05-18.md`
- `当前唯一真相_ABC_Canvas_GoldenFinger_2026-05-17.md`
- `（借鉴的地方必读）REFERENCE_ASSET_EVIDENCE_CHAIN.md`
- `当前主线_任务树与子接力棒中心_2026-05-19.md`

## 需要的 skill

- `xiaxia-continuity`
- `improve-codebase-architecture`

## 需要的检查

- 当前先读代码、梳理合同，不先乱改

## side 素材包

### 当前代码入口

- `src/components/VoiceWorkspace.tsx`
- `src/modules/timeline-factory/createBoardEventsFromTtsUnits.ts`
- `src/modules/timeline-factory/mapBoardEventsToTimelineClips.ts`
- `src/modules/boardSticker/renderBoardTextStickerImage.ts`
- `src/domain/teachingProject.ts`

### 当前真相锚点

- 现在主链只有：
  - `VoiceWorkspace -> requestCosyVoiceSentences`
  - `applyTtsSentenceResults`
  - `createBoardEventsFromTtsUnits`
  - `applyBoardEventsToTimeline`
- 当前没有正式 `C SVG asset` 预生成主链
- 当前字体转 SVG / path 不是主流程自动产物
- `C 本体变了才重生成，展示变了不重生成`

### 外部参考素材

- `stroke2vec`
  - 作用：笔画/笔顺元数据参考
- `cw2vec`
  - 作用：笔画序列特征参考
- `svg-drawing-board-main`
  - 作用：SVG/path 与形状绘制参考
- `SVGFourierManimAnimation-main`
  - 作用：SVG path 轨迹算法参考

### 本 side 只需要回答的问题

1. `C asset prewarm queue` 的输入是什么
2. `C asset prewarm queue` 的输出是什么
3. 哪些字段进入 `fingerprint`
4. 哪些字段不能触发重生成

### 本次 side 必须产出

1. `prewarm queue` 输入合同
2. `prewarm queue` 输出合同
3. `fingerprint` 字段表
4. `regenerate / no-regenerate` 判定表
5. `side` 结束接力棒报告

### 本 side 禁止走偏

- 不把预生成混进播放时钟修复
- 不碰 GoldenFinger 顶层画笔
- 不引第二套真相 store
- 不把外部参考仓库直接搬进主线

## 当前状态

- 开工中

## 结果

- 已完成第一步：技术栈分层与参考原理整理
- 已完成第二步：项目内参数桥接与 `side-01` 控件责任表
- 已完成第三步：`系统初始真相 / 世界线金手指 override` 防乱口径

## 当前工作记录（第一步）

### 技术栈分层表

| 层 | 负责什么 | 当前有 | 当前缺 |
| --- | --- | --- | --- |
| A/B/C 现有主链 | `scriptText -> TTS -> BoardEvent -> TimelineClip(board) -> StagePreview` | A 轨 TTS、B 窗口、C 当前展示层 | 正式 C SVG asset 主链 |
| 预生成层 | `text/font -> svg/path -> stroke meta -> C asset` | boardSlice / board event / scriptText 已有 | 字体转 SVG、笔画笔顺元数据、C prewarm queue |
| 资产层 | 保存 C 本体、fingerprint、revealPlan | `TimelineClip(kind=board)` 带部分 C 展示字段 | 正式 `C asset` 结构 |
| 播放层 | A 时钟 + B 窗口 + C reveal | 这里只确认下游确实存在这层 | consume-only 的逐笔 reveal 播放留给 `side-02` |
| 编辑层 | 改属性并判断是否重生成 | 右侧已有基础 C 属性编辑 | regenerate / no-regenerate 规则未正式落地 |

### 参考拆分表

| 参考项目 | 能借什么 | 放在哪一层 | 不能借什么 |
| --- | --- | --- | --- |
| `handwritten_tracing-main` | 字体/字形导出 SVG、单字 glyph 产物 | 预生成层 | 不能直接当运行时播放器 |
| `stroke2vec` | 笔画数、笔画序列、stroke id | 预生成层 / stroke meta | 不能生成 SVG/path |
| `cw2vec` | 笔画结构先验、节奏辅助 | stroke meta / reveal 顺序辅助 | 不能生成真实手写路径 |
| `SVGFourierManimAnimation-main` | SVG path 读取、曲线/采样算法参考 | path 分段 / 算法层 | 不能直接当当前 runtime |

### 原理链路表

| 阶段 | 输入 | 输出 | 是否已实现 |
| --- | --- | --- | --- |
| 文稿切句 | `scriptText` | `TtsSentenceUnit[]` | 已实现 |
| A 轨生成 | `TtsSentenceUnit[]` | `TtsSentenceResult[]` | 已实现 |
| B 事件生成 | `TtsSentenceUnit[] + TtsSentenceResult[]` | `BoardEvent[]` | 已实现 |
| B 写回时间轴 | `BoardEvent[]` | `TimelineClip(kind=board)[]` | 已实现 |
| C 预生成 | `boardSlice/text/font` | `svg/path + stroke meta + C asset` | 未实现 |
| B/C 绑定 | `BoardEvent + C asset` | 可播放的 B<->C 关系 | 未实现 |
| 白板播放 | `A 时钟 + B 窗口 + C asset` | 逐笔 reveal 的 C 播放 | 未实现 |

### 当前结论

- side-01 当前只负责把 `prewarm queue / fingerprint / regenerate gate` 这层上游合同钉住，不展开下游 renderer consume。
- 当前最接近上游资产生成的参考是 `handwritten_tracing-main`。
- `stroke2vec / cw2vec` 适合做笔画笔顺元数据层，不适合冒充 SVG/path 主方案。
- 运行时不该现场做字体转 SVG；应先预生成，再播放时描红 reveal。
- 播放消费层只在这里留接口边界，不在本 side 展开；具体播放 consume 路线移交 `side-02`。

## 当前工作记录（第二步）

### 项目内参数桥接表

| 当前来源 | 当前字段 | 现在在哪 | 未来接到哪 | 用来干什么 | 备注 |
| --- | --- | --- | --- | --- | --- |
| `TtsSentenceUnit` | `id` | `splitScriptIntoTtsSentenceUnits()` | `CAssetPrewarmQueue.sentenceId` | 让预生成任务能对回句子 | 当前已现役 |
| `TtsSentenceUnit` | `chainKey` | `splitScriptIntoTtsSentenceUnits()` | `CAssetPrewarmQueue.chainKey` / `BoardEventToCBinding.chainKey` | 把 A/B/C 对齐到同一条材料链 | 当前已现役 |
| `TtsSentenceUnit` | `order` | `splitScriptIntoTtsSentenceUnits()` | `CAssetPrewarmQueue.sentenceOrder` | 队列排序、默认落位顺序 | 当前已现役 |
| `TtsSentenceUnit` | `text` | `splitScriptIntoTtsSentenceUnits()` | `CAssetBodyInput.rawSentenceText` | 保留句子原文 | 当前已现役 |
| `TtsSentenceUnit` | `speechText` | `splitScriptIntoTtsSentenceUnits()` | 不进入 C 本体 | 只给 TTS 用 | 不应混进 C fingerprint |
| `TtsSentenceUnit` | `boardMarkerTexts[]` | `splitScriptIntoTtsSentenceUnits()` | `CAssetPrewarmQueue.markerTexts[]` | 板书内容源文本 | 当前已现役 |
| `TtsSentenceUnit` | `boardMarkerChainKeys[]` | `splitScriptIntoTtsSentenceUnits()` | `CAssetPrewarmQueue.markerChainKeys[]` | 多 marker 时逐个对齐链路 | 当前已现役 |
| `TtsSentenceUnit` | `estimatedDurationMs` | `splitScriptIntoTtsSentenceUnits()` | `CAssetPrewarmQueue.estimatedDurationMs` | TTS 未回前给预热优先级/默认 reveal 时长 | 当前已现役 |
| `TtsSentenceResult` | `sentenceId` | `requestCosyVoiceSentences()` 结果 | `BoardEventToCBinding.sentenceId` | 让 TTS 结果和 C 资产落回同一句 | 当前已现役 |
| `TtsSentenceResult` | `chainKey` | `VoiceWorkspace.tsx` 二次补入 | `BoardEventToCBinding.chainKey` | 防止只靠 sentenceId 对齐偏 | 当前已现役 |
| `TtsSentenceResult` | `durationMs` | `createBoardEventsFromTtsUnits()` | `PlaybackConsumerInput.revealBudgetMs` | 估算逐笔 reveal 总时长 | 当前已现役 |
| `TtsSentenceResult` | `timingJson` | `applyTtsSentenceResults()` | `PlaybackConsumerInput.voiceTimingRef` | 后续逐句/逐片段细化同步 | 当前已写入 asset，但未进入 C |
| `TtsSentenceResult` | `audioUrl` | `applyTtsSentenceResults()` | 不进入 C 本体 | 只给 A 轨音频 | 不应混进 C fingerprint |
| `BoardEvent` | `id` | `createBoardEventsFromTtsUnits()` | `BoardEventToCBinding.boardEventId` | 绑定某条 B 事件与某条 C 资产 | 当前已现役 |
| `BoardEvent` | `chainKey` | `createBoardEventsFromTtsUnits()` | `BoardEventToCBinding.chainKey` | 对齐材料链 | 当前已现役 |
| `BoardEvent` | `sentenceId` | `createBoardEventsFromTtsUnits()` | `BoardEventToCBinding.sentenceId` | 对齐到同句资产 | 当前已现役 |
| `BoardEvent` | `text` | `createBoardEventsFromTtsUnits()` | `CAssetBodyInput.markerText` | 单个 C 素材真正要画的文本 | 当前已现役 |
| `BoardEvent` | `startMs/endMs` | `createBoardEventsFromTtsUnits()` | `BoardEventToCBinding.startMs/endMs` | B 窗口 | 当前已现役 |
| `TimelineClip(kind=board)` | `label` | `mapBoardEventsToTimelineClips()` / inspector | `CAssetDisplayPatch.label` | 当前混合态里兼任 C 文本显示 | 以后应拆到 C 本体/草稿层 |
| `TimelineClip(kind=board)` | `xPercent/yPercent` | `mapBoardEventsToTimelineClips()` / inspector | `CAssetDisplayPatch.position` | 只影响摆放 | 不应触发重生成 |
| `TimelineClip(kind=board)` | `widthPercent/fontSize` | `mapBoardEventsToTimelineClips()` / inspector | `CAssetDisplayPatch.box` | 只影响显示盒和默认字号 | 当前先视为展示层；后续若改成重新排版再复核 |
| `TimelineClip(kind=board)` | `drawSpeed` | `mapBoardEventsToTimelineClips()` / inspector | `PlaybackConsumerInput.drawSpeed` | 只调 reveal 快慢 | 不应触发重生成 |
| `TimelineClip(kind=board)` | `sourceRef` | `mapBoardEventsToTimelineClips()` | `BoardEventToCBinding.sourceSentenceId` | 当前存的是 `sentenceId` | 当前已现役 |
| `TimelineClip(kind=board)` | `sourceStartMs/sourceEndMs` | `mapBoardEventsToTimelineClips()` | `PlaybackConsumerInput.sourceWindow` | A source 锚点 | 当前已现役 |
| `TimelineClip(kind=board)` | `revealStartMs/revealEndMs` | `mapBoardEventsToTimelineClips()` | `PlaybackConsumerInput.revealWindow` | C 动态独舞窗口 | 当前已现役 |
| `project.stage.canvas` | `boardFontFamily/boardFontName/boardFontUrl` | `TeachingProject.stage.canvas` | `CAssetBodyInput.fontPreset` | 预生成选字体 | 改字体应触发重生成 |
| `project.stage.canvas` | `boardFontSize` | `TeachingProject.stage.canvas` | `CAssetDisplayPatch.defaultFontSize` | 默认展示字号 | 当前更像展示层，不直接进 body fingerprint |

### 桥接后的字段分层

#### 1. C 本体字段

- `markerText`
- `chainKey`
- `fontPreset`
- `strokeMetaVersion`
- `layoutMode`
- `glyphPlan`

这些字段一旦变化，`C asset` 应重生成。

#### 2. C 展示字段

- `xPercent`
- `yPercent`
- `widthPercent`
- `fontSize`
- `drawSpeed`
- `startMs`
- `endMs`
- `revealStartMs`
- `revealEndMs`

这些字段变化时，默认只改显示/播放，不重生成 `C asset`。

### side-01 控件责任表

| 什么控件 | 干什么的 | 负责什么 | 不负责什么 | 影响关系 | 来源依据、受什么影响 | 参数字段 | 对应的前端 | 控件名称 | 是否唯一 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `CAssetPrewarmQueue` | 把 TTS 切句和板书 marker 变成待生成的 C 任务队列 | 收集 `TtsSentenceUnit + BoardEvent`，去重、排序、分发到 builder | 不负责 SVG 生成、不负责播放、不负责写时间轴 | `TtsSentenceUnit[] + BoardEvent[] -> PrewarmTask[]` | 受 `VoiceWorkspace.tsx`、`splitScriptIntoTtsSentenceUnits.ts`、`createBoardEventsFromTtsUnits.ts` 影响 | `sentenceId` `chainKey` `order` `markerTexts[]` `markerChainKeys[]` `estimatedDurationMs` `boardEventId` `markerText` | 当前前端无独立 UI；后续可挂到 `VoiceWorkspace` 生成状态区 | `C 预热队列` | 逻辑唯一 |
| `CAssetBuilder` | 把单条文本任务生成为可描红的 C 资产 | 做 `text/font -> svg/path -> strokeMeta -> revealPlanSeed` | 不负责 B 时间、不负责舞台摆放、不负责播放时钟 | `PrewarmTask -> CAssetDraft` | 受字体配置、参考仓库、未来 SVG/path 算法实现影响 | `markerText` `fontPreset` `strokeMetaVersion` `layoutMode` `estimatedDurationMs` | 当前无前端；后续偏模块实现 | `C 资产生成器` | 逻辑唯一 |
| `CAssetFingerprint` | 决定一条 C 是否需要重生成 | 只计算本体签名、比较新旧签名 | 不负责实际生成、不负责展示 patch、不负责时间轴 | `CAssetBodyInput -> fingerprint` | 受 `project.stage.canvas.boardFont*`、`markerText`、未来 stroke meta 版本影响 | `markerText` `chainKey` `boardFontName` `boardFontFamily` `boardFontUrl` `strokeMetaVersion` `layoutMode` | 无前端；偏 store / asset contract | `C 指纹` | 逻辑唯一 |
| `CAssetRegenerateGate` | 按规则拦住不该重生成的编辑 | 判断“本体变了 / 只是展示变了” | 不负责生成 SVG、不负责播放 | `patch + oldFingerprint -> regenerate?` | 受 `BoardClipInspector` 可编辑字段和 `BoardClipPatch` 边界影响 | 本体侧：`label/markerText` `fontPreset`；展示侧：`xPercent` `yPercent` `widthPercent` `fontSize` `drawSpeed` `startMs` `endMs` | `BoardClipInspector` / `StagePreview` 拖拽编辑 | `C 重生成闸门` | 逻辑唯一 |
| `BoardEventToCBinding` | 把 B 事件和 C 资产真正绑起来 | 用 `boardEventId/sentenceId/chainKey` 建 B<->C 关系，并对下游暴露消费输入 | 不负责生成字形、不负责播放渲染实现 | `BoardEvent + CAsset -> BoundBoardPlaybackUnit` | 受 `createBoardEventsFromTtsUnits.ts`、`mapBoardEventsToTimelineClips.ts` 当前混合态影响 | `boardEventId` `sentenceId` `chainKey` `startMs` `endMs` `sourceRef` `assetId` | 当前无独立前端；由时间轴/舞台消费 | `B/C 绑定器` | 逻辑唯一 |

### 当前参数衔接结论

1. 现有主链里最适合接 `CAssetPrewarmQueue` 的入口，不是 store，而是 `VoiceWorkspace.tsx` 在 `readyResults + boardEvents` 都到齐之后。
2. 现有 `TimelineClip(kind=board)` 仍然是 B/C 混住的过渡壳，所以 side-01 只能先写“桥接合同”，不能假装已经有正式 `C asset`。
3. 现阶段最稳的重生成规则是：
   - `label/markerText`、字体来源、stroke meta 版本变了：重生成
   - `x/y/width/fontSize/drawSpeed/start/end/reveal window` 变了：默认不重生成
4. `speechText`、`audioUrl` 只服务 A/TTS，不应混进 `C fingerprint`。
5. `timingJson` 应在后续作为细粒度同步参考进入播放消费层，而不是进入 C 本体层。
6. 播放消费层本身不在本 side 展开；本 side 只负责把可消费的输入边界留给 `side-02`。

## 当前工作记录（第三步）

### 防乱知识点：系统初始真相 vs 世界线金手指

这一段是 side-01 后续所有合同的前置原则。

#### 1. 三层不要混

| 层 | 是什么 | 负责什么 | 不负责什么 |
| --- | --- | --- | --- |
| `system base` | 系统初始真相 | 先生成一条默认能跑的 A/B/C 世界线 | 不因为用户偶尔修调就改写生成规则 |
| `golden-finger override` | 世界线金手指 | 用户后期拖动、修改、精调 | 不倒灌成系统默认规则 |
| `playback consumer` | 播放消费层 | 播放时读取 `base + override` 的合成结果 | 不临场改写 A/B/C 真相 |

#### 2. 当前代码里的归属

##### A：系统初始真相

- `A` 是主时钟和 source 锚点。
- 当前关键字段是：
  - `sourceStartMs`
  - `sourceEndMs`
- 它们是 C 动态生成窗口的原始来源。

##### B：系统初始真相 + 用户金手指入口

- `B` 的系统级身份是显示窗口。
- 当前关键字段是：
  - `startMs`
  - `endMs`
- 当前正式人工入口在 `VoiceTrack`。
- 所以：
  - `B` 管 C 的显示时刻
  - `B` 管 C 的显示时长
  - `B` 不直接改 C 的内容和外观

##### C：系统初始真相 + 用户金手指入口

- `C` 的系统级身份是画布演员。
- 当前关键字段分两类：

1. 动态生成时间段
   - `revealStartMs`
   - `revealEndMs`

2. C 可调属性
   - `label`
   - `xPercent`
   - `yPercent`
   - `widthPercent`
   - `fontSize`
   - `drawSpeed`

#### 3. 当前最容易乱的点

##### C 的动态生成时间段不是独立第一入口

- 当前 `revealStartMs/revealEndMs` 更像：
  - `A source ∩ B display` 的归一化结果
- 它不是现在右侧独立手调的主责任字段。
- 当前右侧 inspector 会读取它做预览，但确认时不把 timing 当成 C 面板正式写回重点。

##### 用户拖动画布属于金手指 override

- 用户在画布上拖动 C
- 用户在右侧改位置、大小、速度、内容
- 用户在音轨上拉 B 的开始/结束

这些都属于：

- `golden-finger override`

不是：

- `system base`

#### 4. 一定不能说错的规则

1. 用户拖了位置，不代表系统默认布局规则变了。
2. 用户改了速度，不代表系统初始演绎规则变了。
3. 用户拉了 B，不代表 A source 规则变了。
4. 不是每次用户都调整，所以系统默认规则必须稳定独立存在。
5. `override` 只能覆盖表现，不能污染系统生成规则。

#### 5. side-01 后续合同统一口径

后面所有合同都按这两个桶写：

##### `system base`

- A source
- B display
- C initial content
- C default layout
- C default reveal asset

##### `golden-finger override`

- B：`startMs/endMs` 人工精调
- C：`label/xPercent/yPercent/widthPercent/fontSize/drawSpeed` 人工修调

#### 6. 一句钉住的话

系统负责先生成一条能跑的世界线；用户金手指只做局部改命，不改天命规则。

## 回主线后要同步

- `当前主线_任务树与子接力棒中心_2026-05-19.md`
- `当前短便签_小白板救回_2026-05-18.md`
- `当前唯一真相_ABC_Canvas_GoldenFinger_2026-05-17.md`

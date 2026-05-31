# side-01-c-svg-prewarm-materials

时间：2026-05-19 02:22

用途：给 `side-01-c-svg-prewarm` 直接开工的素材包。

## 一句话目标

把这件事想清楚：

- `TTS ready results + board events -> C asset prewarm queue`

不是先写代码，不是先接渲染。

## 先读顺序

1. `../当前主线_任务树与子接力棒中心_2026-05-19.md`
2. `../当前短便签_小白板救回_2026-05-18.md`
3. `../当前唯一真相_ABC_Canvas_GoldenFinger_2026-05-17.md`
4. `../（借鉴的地方必读）REFERENCE_ASSET_EVIDENCE_CHAIN.md`
5. `side-01-c-svg-prewarm.md`

## 当前已确认事实

- 白板是底层容器
- GoldenFinger 是顶层画笔层
- A 是主时钟
- B 是寿命窗口
- C 是画布演员 / 素材
- 当前没有正式 C SVG 预生成主链
- 当前字体转 SVG / path 不在自动主流程
- 本体变了才重生成，展示变了不重生成

## 本 side 要收的字段

### 可能进入本体 fingerprint

- 文本内容
- 颜色参数
- 字体 / 字形源
- 笔画方案版本

### 明确不进入本体 fingerprint

- `xPercent`
- `yPercent`
- `widthPercent`
- `scale`
- `z-index`
- `drawSpeed`
- `B startMs/endMs`
- `A playhead/seek`

## 建议输出

这次 side 最低交付不要求代码，至少要交：

1. `prewarm queue` 输入输出合同
2. `fingerprint` 字段表
3. `regenerate / no-regenerate` 判定表
4. 播放阶段 consume 路线

## 相关代码候选

- `src/components/VoiceWorkspace.tsx`
- `src/modules/timeline-factory/createBoardEventsFromTtsUnits.ts`
- `src/modules/timeline-factory/mapBoardEventsToTimelineClips.ts`
- `src/modules/boardReveal/getBoardRevealProgress.ts`
- `src/modules/boardSticker/renderBoardTextStickerImage.ts`
- `src/domain/teachingProject.ts`

## 外部参考候选

- `stroke2vec`
- `cw2vec`
- `svg-drawing-board-main`
- `SVGFourierManimAnimation-main`
- `visualization-guidebook-master`

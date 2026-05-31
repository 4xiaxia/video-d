# side-02-svg-path-renderer

时间：2026-05-19 02:26

## 本次 side 任务目标

- 先做 `SVG/path renderer` 的预读和 consume 路线预备
- 只整理 renderer 需要吃什么输入、reveal 接入点在哪
- 不提前拍板正式资产结构，不急着写运行时代码

## 任务

- 设计并验证 `SVG/path renderer` 如何只读消费预生成素材

## 边界

- 只改：renderer consume 路线、reveal 接入点、渲染边界
- 不碰：A/B 真相、GoldenFinger、播放时钟修复、预生成合同主口径

## 入口文件

- `当前主线_任务树与子接力棒中心_2026-05-19.md`
- `当前短便签_小白板救回_2026-05-18.md`
- `当前唯一真相_ABC_Canvas_GoldenFinger_2026-05-17.md`
- `side-01-c-svg-prewarm.md`

## 需要的 skill

- `prototype`
- `improve-codebase-architecture`

## 需要的检查

- 当前只做预读，不跑运行时代码检查

## 本次 side 允许做什么

- 读 `side-01` 现有草案
- 整理 renderer consume 输入
- 整理 reveal 接入点
- 写预备性路由和边界说明

## 本次 side 不允许做什么

- 不反写 `side-01` 主合同
- 不提前定稿 `C asset` 正式结构
- 不把草案冒充主线真相
- 不写“已经可用”的运行时结论
- 不碰 A/B 真相和 GoldenFinger

## 当前状态

- 预读中

## 结果

- 已接收 `side-01` 留下的播放消费输入边界
- 当前由本 side 接手 `renderer consume / reveal` 路线，不反写 `side-01`

## 从 side-01 接过来的输入边界

### 当前代码入口

- `src/modules/boardReveal/getBoardRevealProgress.ts`
- `src/components/StagePreview.tsx`
- `src/domain/teachingProject.ts`

### 下游播放参考

- `svg-draw-motion-main`
  - 用于：SVG parser、animator、draw effects、timeline 组织
- `visualization-guidebook-master`
  - 用于：clip / mask / path drawing / reveal 基础手法

### consume 输入占位

- `PlaybackConsumerInput.revealBudgetMs`
- `PlaybackConsumerInput.voiceTimingRef`
- `PlaybackConsumerInput.drawSpeed`
- `PlaybackConsumerInput.sourceWindow`
- `PlaybackConsumerInput.revealWindow`

### 待 side-02 展开的事

- renderer consume 路线
- reveal 接入点
- 播放时如何只读消费 `BoundBoardPlaybackUnit + CAsset`

### 本 side 仍不能越界

- 不反写 `side-01` 主合同
- 不提前定稿正式 `C asset` 结构
- 不把 consume 草案当主线真相

## 回主线后要同步

- `当前主线_任务树与子接力棒中心_2026-05-19.md`
- `当前短便签_小白板救回_2026-05-18.md`
- `当前唯一真相_ABC_Canvas_GoldenFinger_2026-05-17.md`

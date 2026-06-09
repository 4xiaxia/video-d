# 2026-06-07 需求 & 诊断 & 错误清单

> 记录时间：2026-06-07 23:30
> 性质：甲方需求 + 代码诊断 + 错误清单
> 状态：逐行代码实证，非臆测
> 配套：`CHANGE_TREE变更树.md` / `真相路标-当前唯一入口.md` / `认知图-核心逻辑动态图.md`

---

## 一、甲方需求（来自夏夏转述）

1. **不再使用 PNG**：板书不再渲染为 PNG 图片，改为手写字体直接输出。
2. **概念更新**：画布标签 = 分片的内容（即写哪里）。**标签 + 弹性容器 = 板书分片**，分片里面放板书内容（流动盒子）。
   - 四个标签代表四个容器，在画布上流动布局。
   - 容器大小 = 板书该区块的文本段落实时测量的大小 + **10px 边距**。
   - 点击标签可以拖动**整个文本容器块和块内的板书内容**。
   - 建议封装以便复用。
3. **画布弃用 tldraw**。
4. 当前板书的符号栏、字体引用、容器布局都是乱的，只有标签对了。
5. 题目区是对的。

---

## 二、代码现状诊断（逐行实证）

### 诊断方法

全仓逐文件 `grep` + `import` 链追踪 + 逐行读关键函数，不靠记忆、不靠猜测。

### 2.1 主舞台链

```
App.tsx → StagePreview(re-export) → LegacyStagePreview → DrawboardStage
  ├─ CanvasRecordingSurface (Canvas2D 录制底图)
  ├─ CoursewareSegmentChrome (标签+容器 chrome)
  ├─ AutoHandwritingLayer (C 逐笔)
  │   ├─ BoardTextSticker → CStickerFrame
  │   │   ├─ BoardHandwritingStickerContent (<span> 手写字体)
  │   │   └─ BoardMathStickerContent (FormulaText/KaTeX)
  │   └─ KonvaBoardContentRecordingSurface (Konva 录制内容层)
  └─ GoldenFingerCanvasLayer (金手指 overlay)
```

### 2.2 概念：标签 + 弹性容器 = 板书分片

**标签：** `coursewareZoneLayout.ts:40-45` 硬编码映射 ✅
```
problem:'题目'  analysis:'分析'  solution:'解答'  summary:'总结'
```
通过 `CoursewareSegmentChrome.tsx` 渲染为 `<div class="courseware-label">`。

**容器 bbox 计算：** `coursewareZoneLayout.ts:90-125` `createZoneBoxFromRects`
- 从 DOM 中 `querySelectorAll('.board-text-sticker--zone-{key}')` 获取所有 sticker rect
- 取 union bbox (min left/top, max right/bottom)
- 加 `ZONE_PADDING_PX = 5` 边距 (line 49)

**容器 DOM：** `CoursewareSegmentChrome.tsx:26-38`
```tsx
<div className="courseware-zone-box"
     aria-hidden="true"           // 纯视觉，不是 flow 容器
     style={{ left, top, width, height }}  // 来自 zoneBox DOM 测量
/>
```

**标签拖动：** `DrawboardStage.tsx:184-200` `startLabelDrag`
- `labelOverrides` 只存 `{ leftRatio, topRatio }`
- `zoneBoxes` useMemo (line 128-143) 中 `labelOverrides` 仅覆盖 `labelLeftRatio/labelTopRatio`
- **容器坐标永远来自 DOM bbox 自动测量，不跟随标签拖动**

### 2.3 PNG 路线

`renderBoardTextStickerImage.ts` (267行) 和 `renderBoardMathStickerImage.ts` (172行)：
- 全仓 **零 import**（仅在 `boardSticker/index.ts:1-3` barrel export 中）
- 新链路：`BoardHandwritingStickerContent → <span style={{fontFamily,...}}>`，直接 DOM 文本渲染
- 录制链路：`KonvaBoardContentRecordingSurface → Konva <Text>`，不是 PNG

### 2.4 tldraw 退场

- `TldrawStagePreview.tsx` / `TldrawProofPage.tsx` → 已挪 `src/_deprecated/`
- `main.tsx` tldraw-proof 路由已摘除
- **残留：** `BoardPreviewCard.tsx` 仍 `import { Tldraw } from 'tldraw'`（侧边栏预览卡）
- **残留：** `abcToTldrawShapes.ts` 仍被 BoardPreviewCard 引用 `resolveTldrawStageSize`
- **残留：** `styles.css` 14 行 `tldraw-proof-*` CSS（死 CSS，对应已挪走的 TldrawProofPage）

### 2.5 CSS 现状

| 组件 class | CSS 存在？ |
|-----------|-----------|
| `side-tool-dock/card/icon/copy` | ✅ 1927-1990 |
| `board-preview-card/canvas-wrap` | ✅ 2042-2066 |
| `board-stage-tool-*` (12 个 class) | ❌ 全零 |
| `board-text-sticker` (8 个 class) | ❌ 全零 |
| `courseware-label` / `courseware-zone-box` / `courseware-board-area` / `courseware-problem-area` | ❌ 全零 |
| `stage-canvas--courseware` / `drawboard-stage-shell` / `canvas-recording-surface` | ❌ 全零 |

---

## 三、错误清单

### ❌ 错误 1：标签拖动只动标签不动容器

- **文件：** `src/components/DrawboardStage.tsx`
- **位置：** `startLabelDrag` (line 184-200) + `zoneBoxes` useMemo (line 128-143)
- **现象：** 标签拖动后 `labelOverrides` 只更新 `labelLeftRatio/labelTopRatio`，容器坐标 `leftRatio/topRatio` 来自 `autoZoneBoxes`（DOM 测量），不跟随标签移动
- **期望：** 点击标签拖动整个容器块和块内的板书内容一起移动

### ❌ 错误 2：容器 padding 是 5px，需求是 10px

- **文件：** `src/modules/canvasStage/coursewareZoneLayout.ts`
- **位置：** line 49 `const ZONE_PADDING_PX = 5`
- **现象：** 容器边距是 5px
- **期望：** 甲方要求 10px

### ❌ 错误 3：容器不是弹性流动盒子

- **文件：** `src/components/CoursewareSegmentChrome.tsx`
- **位置：** line 26-38
- **现象：** 容器 div 是 `aria-hidden="true"` 的纯视觉虚线框，没有 `position:relative`、没有 `overflow`、不能作为内容容器
- **期望：** 弹性容器包裹板书内容，支持流动布局

### ❌ 错误 4：`$` 符号混排残留（数学护栏断裂）

- **文件：** `src/modules/boardSticker/boardTextDisplayRoute.ts` + `mathBoardText.ts`
- **现象：**
  - 纯外裹 `$...$` 可以正常剥离（`stripOuterMathDelimiters` 生效）
  - **内嵌混排**如 `"计算 $18\div(3+3)\times2$ 的结果"` → `$` 存活到 KaTeX 渲染层，显示为乱码
- **根因：** `stripSimpleBoardMathDelimiters` 的 `tokens.length===1` 条件拒绝了混排场景
- **复现路径：**
  ```
  resolveBoardTextDisplayRoute("计算 $18\\div(3+3)\\times2$ 的结果")
    → normalizeElementaryBoardHandwritingText 不匹配（非纯外裹）
    → stripSimpleBoardMathDelimiters 不匹配（token>1）
    → isBoardTextSupportedByHandwritingFont → $ 不在白名单 → false
    → hasBoardMath → $ 匹配 → true
    → formula, text="计算 $18\\div(3+3)\\times2$ 的结果"  🔴 $ 存活
  ```

### ❌ 错误 5：`normalizeHandwritingDisplayText` 把转换好的 Unicode 符号退化

- **文件：** `src/modules/boardSticker/mathBoardText.ts`
- **位置：** line 245-249
- **现象：**
  - `normalizeElementaryBoardHandwritingText` 做了 `\times→×`, `\div→÷` 等 40+ 条 LaTeX→Unicode 映射
  - `normalizeHandwritingDisplayText` 又无条件把 `×→x`, `÷→·` 回退成 ASCII fallback
  - `HANDWRITING_EXTRA_SYMBOLS` 白名单明明含 `× ÷` → 手写字体支持
- **根因：** fallback 无条件执行，不检查字体是否真的不支持

### ❌ 错误 6：CSS 全部缺失

- **文件：** `src/styles.css`
- **现象：** 所有新增组件的 class 无任何样式规则
  - `board-text-sticker` 系列 8 个 class：无样式
  - `courseware-label` / `courseware-zone-box` / `courseware-board-area` / `courseware-problem-area`：无样式
  - `board-stage-tool-*` 系列 12 个 class：无样式
  - `stage-canvas--courseware` / `drawboard-stage-shell` / `canvas-recording-surface`：无样式
- **后果：** 标签靠 inline style 定位所以能看见文字，但无背景/圆角/颜色。工具条按钮、C 板书贴纸、容器框、录制底图全部无视觉样式。

### ❌ 错误 7：PNG 旧路线尸体挂载

- **文件：** `src/modules/boardSticker/index.ts` line 1-3
- **现象：** `export { renderBoardTextStickerImage }` 和 `export { renderBoardMathStickerImage }` 仍在公共 barrel 接口中
- **证据：** 全仓零 import，无人调用
- **影响：** 仅 barrel 噪音，不影响运行时

### ❌ 错误 8：tldraw 死 CSS

- **文件：** `src/styles.css` ~14 行
- **内容：** `tldraw-proof-page` / `tldraw-proof-sidebar` 等
- **证据：** `TldrawProofPage.tsx` 已挪 `_deprecated/`，main.tsx 路由已摘除

### ❌ 错误 9：BoardPreviewCard 仍依赖 tldraw

- **文件：** `src/components/BoardPreviewCard.tsx`
- **现象：** 仍 `import { Tldraw, createShapeId, toRichText } from 'tldraw'` + `import 'tldraw/tldraw.css'`
- **引用链：** `VoiceWorkspace.tsx → BoardPreviewCard → tldraw + abcToTldrawShapes`
- **影响：** tldraw 包仍在主构建中（侧边栏预览卡使用完整 tldraw 引擎）

---

## 四、修复优先级

| 优先级 | 编号 | 动作 | 文件 | 风险 |
|--------|------|------|------|------|
| 🔴 P0 | #6 | 补 CSS（所有缺失类名） | `styles.css` | 仅视觉，不改逻辑 |
| 🔴 P0 | #4 | 修 `$` 混排残留 | `mathBoardText.ts` / `boardTextDisplayRoute.ts` | 护栏修复 |
| 🔴 P0 | #5 | 修 `normalizeHandwritingDisplayText` 符号退化 | `mathBoardText.ts:245-249` | 护栏修复 |
| 🔴 P0 | #7 | 删 barrel 噪音（PNG export） | `boardSticker/index.ts:1-3` | 零 import，无风险 |
| 🔴 P0 | #8 | 删 tldraw 死 CSS | `styles.css` | 死 CSS，无风险 |
| 🟡 P1 | #2 | padding 5→10px | `coursewareZoneLayout.ts:49` | 一行改动 |
| 🟡 P2 | #1 | 标签拖动联动容器 | `DrawboardStage.tsx` + `CoursewareSegmentChrome.tsx` | 需重构拖动逻辑 |
| 🟡 P2 | #3 | 容器改成弹性流动盒子 | `CoursewareSegmentChrome.tsx` | 需重构容器结构 |
| 🟡 P3 | #9 | BoardPreviewCard 去 tldraw 化 | `BoardPreviewCard.tsx` | 需重写预览卡 |

---

## 五、技术债务（不阻塞当前）

| 编号 | 问题 | 详情 |
|------|------|------|
| T1 | `KonvaRecordingSurface` 不接 `zoneBoxes` | 用静态 `COURSEWARE_LABEL_*` 固定坐标，与 DOM 侧动态 `zoneBoxes` 不一致 |
| T2 | `goldenFingerOverlays` 字段是空壳 | `teachingProject.ts` 定义但 GoldenFingerCanvasLayer 用内部 state，不走 store |
| T3 | `abcToTldrawShapes.ts` 等 BoardPreviewCard 去 tldraw 化后可挪 |

---

## 六、已验证通过的项

| 项目 | 证据 |
|------|------|
| typecheck | `tsc --noEmit` 零错误 |
| 手写字体渲染链路 | `BoardHandwritingStickerContent` → `<span style={{fontFamily}}>` ✅ |
| 数学公式渲染链路 | `BoardMathStickerContent` → `FormulaText(KaTeX)` ✅ |
| 录制内容层 | `KonvaBoardContentRecordingSurface` → Konva `<Text>` ✅ |
| 题目区数据源 | `problemText.summary` → `DrawboardStage` → `MathText` ✅ |
| 数学符号双路由 | `speechText/`(耳朵) ↔ `boardSticker/`(眼睛) ✅ |
| `STATIC_HOLD_DURATION_MS` | 全仓零引用，已清 ✅ |
| `COURSEWARE_ZONE_BOUNDS` / `constrainYPercent` | 全仓零引用，已清 ✅ |

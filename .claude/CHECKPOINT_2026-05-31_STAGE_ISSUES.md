---
name: 2026-05-31-stage-fourth-step-issues
description: 夏夏指出的第四步舞台具体问题诊断
date: 2026-05-31
status: in_progress
---

## 问题诊断

### 问题1：画布文字没有按照标签领地站位

**现象：**
- 画布上的文字（C 板书内容）没有尊重标签（chrome）给定的领地
- 标签是具体的四区划分（题目/分析/解答/总结）
- 当前没有对应关系

**根源链路：**
```
第二步生成板书时 → 埋下粗鄙（groupKey 四区分区）
                ↓
第三步预览时 → 标签已知道哪一位 C 的站位
                ↓
第四步播放时 → C 应该按标签领地渲染
                ❌ 目前没对应
```

**数据真相源：**
- `rows[].section` → `chainKey` → 决定四区分区
- `layoutPreviewDraft.items[].groupKey` → 强制四区标签：题目/分析/解答/总结
- `TimelineClip.label` → C 演员文本
- `xPercent/yPercent/widthPercent` → C 站位（百分比坐标）

**问题的本质：**
- 标签（chrome）是四区底板，只画底板不碰 ABC 数据
- 但当前 C 文字的渲染位置没有约束在标签给定的领地内
- 相当于标签和内容的映射关系断了

**需要检查的代码路径：**
- `DrawboardStage.tsx` — C 内容渲染是否读取 section/chainKey 来定位
- `AutoHandwritingLayer` — 逐笔渲染是否尊重区域边界
- `boardStageChrome.ts` 或类似 — 四区标签的几何定义
- 从 `TimelineClip` 到舞台渲染的映射链

---

### 问题2：B 播放完毕，C 默认躺平不下台

**现象：**
- B 寿命窗口(endMs)到了，C 应该消失或者被拖走
- 目前 C 默认躺在舞台不动（带个默认 lock）
- 用户可以手动点击拉长，改变 C 在舞台停留的时长

**需求理解：**
```
正常流程：
  B 寿命到 → C 消失/被拖走 ✅ 预期行为
  
当前行为：
  B 寿命到 → C 躺在舞台不动（被 lock 住了）
  用户手动拉长 → 改变停留时长
  
需求：
  用户可以点击 C → 显式选择"继续留场"
  或者说：B 寿命到后，用户可以手动"延长舞台停留时长"
```

**数据真相源：**
- `TimelineClip.startMs/endMs` — B 寿命窗口（由 A 真实时长生成，非 UI 随意写）
- `drawSpeed` — C 逐笔演绎速度，**不改 A/B**
- C 消失策略 — 当前不清楚是在哪层决定的

**问题的本质：**
- B 寿命窗口应该是 C 的控制信号
- 但目前 B 到期后，C 的行为是"默认 lock 躺平"而不是"根据 B 状态自动消失"
- 需要明确：这个"lock"是 UI 状态，还是数据状态？

**用户需求的映射：**
```
当 B 播放完毕(endMs 到达)时：
  C 默认躺平不下台(lock 住) → 用户可以点击改变
  
意思是：
  1. C 在 B 寿命内正常逐笔显现 ✅
  2. B 寿命到 → C 停止逐笔，但保持可见 ✅
  3. 用户可以手动 unlock + 拉长时长 → 改变 C 在舞台的停留时长 ✅
```

**需要检查的代码路径：**
- `StagePlayback.tsx` 或类似 — 播放逻辑对 B 寿命的响应
- `TimelineClipBlock` — 时间线上 C 块的交互(拖拽/拉长)
- `AutoHandwritingLayer` — 当 B 时间到达后，C 的渲染状态
- `useTeachingEditorStore` 中 C 消失策略的字段定义

---

## 问题1的根本原因

### 代码链路审计

**第二步生成到第四步的映射链：**

```
ScriptAgentTableEditor (rows)
  ├─ rows[].section = "开场读题" / "分析题目" / "解题环节" / "梳理总结"
  └─ rows[].boardSlice = C 板书内容

              ↓ (归一化)

createRowChainKey(rows, row)
  └─ chainKey = "template-open" / "template-pre" / "step-1" / "template-end"

              ↓ (编译成 TimelineClip)

TimelineClip {
  id, label, xPercent, yPercent, widthPercent, fontSize, drawSpeed,
  startMs, endMs, chainKey,  ← chainKey 有，但 section 没有！
  revealStartMs, revealEndMs
}

              ↓ (渲染)

AutoHandwritingLayer
  └─ BoardTextSticker
    └─ CStickerFrame 
      ├─ left: `${xPercent}%`     ← 用户 UI 上手动拖放的绝对坐标
      ├─ top: `${yPercent}%`      ← 用户 UI 上手动拖放的绝对坐标
      └─ width: `${widthPercent}%` ← 用户 UI 上手动拖放的宽度
```

**问题所在：**
- `TimelineClip` 有 `chainKey`，知道自己是"template-open"还是"step-1"
- 但 `AutoHandwritingLayer` 完全不读 `chainKey` 来约束位置
- 四区标签（chrome）已经画好了（题目/分析/解答/总结），定义在 `coursewareChrome.ts`
- **但 C 文字的 xPercent/yPercent 没有被约束到对应四区的领地内**

**四区标签的几何定义已有（在 coursewareChrome.ts）：**
```
COURSEWARE_LABEL_TOP_RATIOS = {
  problem: 0.024,      ← 题目区在 2.4% 高度
  analysis: 0.24,      ← 分析区在 24% 高度
  solution: 0.024,     ← 解答区在 2.4% 高度
  summary: 0.74,       ← 总结区在 74% 高度
}
```

**缺失的是：** 从 chainKey 反推四区的范围，然后约束 C 的位置

### 修复步骤

1. **在 TimelineClip 中补充 section 或 sectionRegion 字段**
   - 或者从 chainKey 反推出四区信息
   - 因为 chainKey → section 的映射是确定的（见 createRowChainKey）

2. **在 AutoHandwritingLayer 中添加位置约束逻辑**
   - 读取 C 的 chainKey
   - 查询对应四区的几何约束（顶部/底部/宽度）
   - 将用户设置的 xPercent/yPercent 限制在该四区范围内
   - 或者提供"自动吸附到四区"的功能

3. **可选：调整 UI 交互**
   - 当用户在画布上拖放 C 文字时，自动吸附到对应四区
   - 或者显示四区边界，让用户清楚地看到可拖放的范围

## 问题2的根本原因

### 代码链路审计

**当前 B 寿命到期的行为：**

```
AutoHandwritingLayer.tsx:62
  ├─ visibleBoardClips = boardClips.filter(
  │    (clip) => isPlayheadInsideTimelineWindowWithPinnedEnd(playheadMs, clip.startMs, clip.endMs)
  │  )
  │
  └─ isPlayheadInsideTimelineWindowWithPinnedEnd
       └─ return playheadMs >= startMs && playheadMs <= endMs
            ↑                                            ↑
            B 开始                                  B 结束（包含边界）
```

**问题所在：**
- 用 `isPlayheadInsideTimelineWindowWithPinnedEnd` 判断可见性
- 这个函数名说得很清楚：**pinnedEnd = 钉住尾部**
- 当 `playheadMs === endMs` 时，还是返回 true（C 还可见）
- 当 `playheadMs > endMs` 时，返回 false（C 消失）

**用户需求映射：**
```
正常流程：
  playheadMs < endMs → C 逐笔显现 ✅ 当前行为正确
  playheadMs === endMs → C 写完，停在舞台 ✅ 当前行为正确（pinnedEnd）
  playheadMs > endMs → C 应该怎样？
                      
当前行为：
  playheadMs > endMs → C 从 visibleBoardClips 中过滤掉，消失
  
用户需求（根据夏夏描述）：
  playheadMs > endMs → C 默认"躺平不下台"（带个 lock）
                      用户可以手动点击拉长时长（修改 endMs）
                      改成"继续留场"的新时长
```

### 问题的深层理解

这不是 bug，而是**业务需求没被编码**。

当前代码的设计是：
- B 的 `endMs` 是"C 应该存在"的时间窗口的终点
- 超过这个时间，C 就应该消失

但用户的需求是：
- B 的 `endMs` 是"C 演绎完毕"的标记
- 演绎完毕后，C **可以选择继续留场**
- 这个"继续留场"的决定应该由用户在时间线上手动拉长

### 修复步骤

1. **修改 C 的可见性规则**
   - 当 `playheadMs > endMs` 时，**不过滤掉 C**，而是改变 C 的状态
   - 状态从"逐笔演绎中"→"演绎完毕，静态显示"
   - 这样 C 就不会从舞台消失

2. **在 TimelineClip 上补充状态字段（可选）**
   - 或者在 UI state 中记录"这个 C 已经演绎完毕，处于留场状态"
   - 用于区分"还在演绎"vs"演绎完毕，留场中"

3. **时间线交互改进**
   - 用户可以在时间线上拖拽 C 块的右边界来拉长 `endMs`
   - 当 `endMs` 被拉长后，C 的"留场时长"自动延伸
   - 这样就实现了"默认躺平 + 用户可手动拉长"的需求

### 当前代码的"pinnedEnd"设计意图

从函数名 `isPlayheadInsideTimelineWindowWithPinnedEnd` 来看，设计者确实想表达"钉住末尾"，即：
- 当 playhead 到达 endMs 时，C 还应该保持可见
- 这是对 reveal progress 的冻结（见 AutoHandwritingLayer.tsx:95-99 的 frozenRevealRef）

但目前的实现只冻结了 revealProgress（逐笔速度），没有改变可见性的边界。需要加一层逻辑来处理"超过 endMs"的情况。

---

## 下一步行动

**优先级：问题1 > 问题2**

1. 读 `DrawboardStage.tsx` + `AutoHandwritingLayer` — 理清 C 渲染如何约束到四区
2. 读 `boardStageChrome.ts` 或类似 — 四区标签几何定义
3. 读 `StagePlayback` — B 寿命到期后 C 的当前逻辑
4. 读时间线交互代码 — 用户如何拉长 C 时长

**不动前三步，只在第四步舞台层改。**

---

## 相关文件索引

### 舞台渲染链
- `src/components/StagePreview.tsx` — 公共入口
- `src/components/LegacyStagePreview.tsx` — 舞台容器
- `src/components/DrawboardStage.tsx` — 舞台布局与 C 渲染
- `src/modules/canvasStage/AutoHandwritingLayer` — 逐笔渲染层
- `src/modules/canvasStage/boardStageChrome.ts` — 四区标签几何

### 时间线交互链
- `src/components/TeachingTimeline.tsx` — 时间线主体
- `src/components/TimelineClipBlock` — 单个 C 块的交互
- `src/modules/stagePlayback/StagePlayback.tsx` — 播放逻辑

### 数据状态链
- `src/store/useTeachingEditorStore.ts` — C 状态管理
- `src/domain/teachingProject.ts` — `TimelineClip` 数据结构
- `src/domain/globalRules.ts` — ABC 规则定义

---

**状态：开始诊断，等待代码走读。**

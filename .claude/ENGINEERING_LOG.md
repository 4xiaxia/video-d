---
title: ENGINEERING_LOG.md
description: 每个工作单元的完整记录（背景、思路、步骤、代码变更、发现、验收）
lastUpdate: 2026-06-04
---

# 工程日志

记录所有工作单元的完整上下文，便于 agent 接力。

---

## [纠偏] 第四步问题2语义修正 (2026-06-04)

> 本日志下方 2026-05-31 诊断保留历史现场，但问题2旧口径已被覆盖。

### 当前正确口径

- 项目是直播仿板书在线解题；C 板书自然播放完成后默认应留在画布上。
- `STATIC_HOLD_DURATION_MS = 1000` / “B 结束后 C 多留 1 秒”是错误理解。
- `pinnedEndMs` / “留场时长”方案不得直接按 2026-05-31 文档施工，必须先重审是否会制造第二套时间真相。
- 正确方向：默认 lock 留场；unlock 后 B 控制 C 站场/显示时长。

### 当前接力

- 已同步 `PROJECT_STATE.md` / `PROJECT_COGNITION.md` / 根目录真相文档。
- 下一步只读扫描 B 拖动、clip end、timeline UI、lock 接入点，再出最小改动方案。

---

## [工作单元] 第四步舞台问题诊断 (2026-05-31)

### 背景

夏夏反馈两个舞台渲染问题：
1. **C 文字没有按标签领地站位** — 四区标签已画，但 C 内容位置没被约束
2. **B 播放完毕，C 默认躺平不下台** — B 寿命到期后，C 应该继续显示（当前立即消失）

### 思路

采用**代码链路审计法**：
- 追踪用户需求 → 数据结构 → 渲染逻辑 → 当前代码实现
- 在每个环节找"断点"或"缺失"

### 步骤

#### 1. 审计问题1的代码链路

```
ScriptAgentTableEditor (前三步输出)
  rows[].section = "开场读题" / "分析题目" / "解题环节" / "梳理总结"
  
  ↓ 编译到 TimelineClip
  
TimelineClip {
  chainKey = "template-open" / "template-pre" / "step-1" / "template-end"
  xPercent, yPercent, widthPercent ← 用户在时间线拖放设置的坐标
}

  ↓ 渲染
  
AutoHandwritingLayer.tsx:62
  visibleBoardClips = filter(clip => isPlayheadInsideTimelineWindowWithPinnedEnd(...))
  
  ↓ 逐个渲染
  
BoardTextSticker.tsx → CStickerFrame.tsx
  style={{ left: `${xPercent}%`, top: `${yPercent}%`, ... }}
```

**发现：** TimelineClip 有 chainKey，但 AutoHandwritingLayer 没有用它来约束位置。

#### 2. 查看四区标签的几何定义

文件：`src/modules/canvasStage/coursewareChrome.ts`

```typescript
COURSEWARE_LABEL_TOP_RATIOS = {
  problem: 0.024,      // 题目区顶部 2.4%
  analysis: 0.24,      // 分析区顶部 24%
  solution: 0.024,     // 解答区顶部 2.4%（右半边）
  summary: 0.74,       // 总结区顶部 74%
}
```

**发现：** 四区范围已定义，但没有对应的"高度/底部"定义。

#### 3. 审计问题2的代码链路

文件：`src/modules/timeline/timelineWindow.ts`

```typescript
function isPlayheadInsideTimelineWindowWithPinnedEnd(playheadMs, startMs, endMs) {
  return playheadMs >= startMs && playheadMs <= endMs;
  //                                              ↑ 包含 endMs
}
```

用在 `AutoHandwritingLayer.tsx:62`：

```typescript
visibleBoardClips = boardClips.filter(
  (clip) => isPlayheadInsideTimelineWindowWithPinnedEnd(playheadMs, clip.startMs, clip.endMs)
)
```

**问题流程：**
- `playheadMs <= endMs` → filter 返回 true → C 可见 ✅
- `playheadMs > endMs` → filter 返回 false → C 被过滤掉 ❌

**发现：** 当前设计是"B 到期就消失"，但用户需要"B 到期后继续留场"。

#### 4. 反推 chainKey → section 的映射

文件：`src/modules/abcChain/abcChainKey.ts`

```typescript
createRowChainKey(rows, row) {
  if (row.section === SCRIPT_SECTION.OPENING) return 'template-open';
  if (row.section === SCRIPT_SECTION.ANALYSIS) return 'template-pre';
  if (row.section === SCRIPT_SECTION.SOLVING) return `step-${stepIndex}`;
  if (row.section === SCRIPT_SECTION.SUMMARY) return 'template-end';
}
```

**映射关系确立：**
- `template-open` ← OPENING（题目区）
- `template-pre` ← ANALYSIS（分析区）
- `step-N` ← SOLVING（解答区）
- `template-end` ← SUMMARY（总结区）

### 代码发现

#### TimelineClip 的当前定义

文件：`src/domain/teachingProject.ts`

```typescript
export type TimelineClip = {
  id: string;
  trackId: string;
  kind: TimelineClipKind;
  chainKey?: string;  ← 有这个
  label: string;
  startMs: number;
  endMs: number;
  xPercent?: number;
  yPercent?: number;
  widthPercent?: number;
  // ... 还有其他字段，但没有 pinnedEndMs 或 section
}
```

#### 四区范围的当前定义状态

`coursewareChrome.ts` 中只有顶部坐标，没有高度或底部坐标。

### 根本原因总结

**问题1：**
- ✅ 四区标签已定义（顶部坐标）
- ✅ chainKey 已生成（知道属于哪个四区）
- ❌ 但没有将 chainKey 用来约束 C 的渲染位置
- ❌ 缺少"四区的完整几何范围"定义（底部/高度）

**问题2：**
- ✅ 当前有 TimelineClip.startMs 和 endMs
- ✅ 有 `isPlayheadInsideTimelineWindowWithPinnedEnd` 函数
- ❌ 但这个函数的"pinnedEnd"只作用于边界包含，不改变消失逻辑
- ❌ 缺少"演绎完毕后的留场时长"的数据模型

### 修复方案

已在 `FIX_PLAN_2026-05-31.md` 中详细写出。简要如下：

**问题1 修复：**
- 补充四区的完整几何范围定义
- 在 AutoHandwritingLayer 中添加约束逻辑
- 推荐方案：自动吸附到四区

**问题2 修复：**
- 补充 TimelineClip.pinnedEndMs 字段
- 修改可见性过滤逻辑
- 推荐方案：引入两个时间端点

### 文件改动清单（待审批）

#### 问题1
- `src/modules/canvasStage/coursewareChrome.ts` — 补充四区范围定义
- `src/components/AutoHandwritingLayer.tsx` — 添加约束逻辑

#### 问题2
- `src/domain/teachingProject.ts` — 补充 pinnedEndMs 字段
- `src/components/AutoHandwritingLayer.tsx` — 改可见性过滤
- `src/store/compilation/*` — 更新编译逻辑（生成 pinnedEndMs）

### 验收清单

- [ ] 问题1：C 自动吸附到对应四区，不能拖出边界
- [ ] 问题2：B 到期后，C 继续显示，用户可拉长留场时长
- [ ] typecheck ✅
- [ ] 完整播放流程测试 ✅
- [ ] 不影响前三步和金手指层

### 决策项

等夏夏确认：
- 问题1：选择方案 A（自动吸附）还是 A+B（吸附+冗余字段）？
- 问题2：选择方案 A（超时）/ B（标志位）/ C（两端点）？

见 `DECISION_CHECKPOINT_2026-05-31.md`

### 时间统计

- 代码审计：~45 分钟
- 根本原因分析：~20 分钟
- 方案设计：~30 分钟
- 文档写作：~25 分钟
- **总计：~120 分钟**

### 关键理解

1. **问题不在底层渲染** — CStickerFrame / BoardTextSticker 都没问题
2. **问题在业务逻辑层** — AutoHandwritingLayer 的过滤/约束不完整
3. **数据结构设计缺陷** — TimelineClip 缺两个关键字段（section/pinnedEndMs）
4. **chainKey 是"黄金线索"** — 它已经把 section 信息编码了，只需解码并使用

### 后续观点

修复后建议的长期工作（不在本轮）：
- CSS 散值收敛（2479 行 styles.css）
- 参数覆盖层补全
- 金手指/录屏真正解耦
- tldraw 完全清理

---

**状态：等夏夏决策。不动代码。**

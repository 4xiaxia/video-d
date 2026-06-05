---
title: ENGINEERING_LOG.md
description: 每个工作单元的完整记录（背景、思路、步骤、代码变更、发现、验收）
lastUpdate: 2026-06-05
---

# 工程日志

记录所有工作单元的完整上下文，便于 agent 接力。

---

## [边界] 文档噪音收口与真相源层级固定 (2026-06-05)

### 背景

用户要求先清理噪音，明确更新记录和文档边界，再进入代码修复。

### 已做

- 新增根层 `DECISIONS.md`，记录当前真相源层级、唯一主线、排除项和下一刀。
- 追加 `.workbuddy/memory/2026-06-05.md`，把本轮性质标为“文档噪音边界收口，未改业务代码”。
- 更新 `CHANGE_TREE变更树.md`，新增本工作单元记录。
- 更新本文件与 `.claude/PROJECT_STATE.md`，明确 `.claude` 是辅助接力镜像，不是最高真相源。

### 当前边界

- 最高真相源：`.workbuddy/memory`。
- 根目录 MD 是项目施工真相层：`DECISIONS.md`、核心真相文档、`CHANGE_TREE变更树.md`。
- `.claude` 只做旧足迹辅助和 SessionStart 镜像。
- 下一刀只围绕 `src/modules/boardSticker/mathBoardText.ts` 的普通手写文本换行保留。

### 验证

纯文档边界收口，未运行业务测试。

---

## [整理] 根层明显噪音隔离与 ignore 收口 (2026-06-05)

### 背景

用户建议先把特别明显的噪音清理掉，避免后续修 C 多行换行时被根层本地文件和临时目录干扰；用户补充“不确定的文件放到历史文件夹”。

### 已做

- 只处理未跟踪、非主源码链、明显本地/临时性质的项目。
- 新建隔离目录：`历史/uncertain-2026-06-05-cleanup/`。
- 移入隔离目录：
  - `.claude/settings.local.json`
  - `.claude/worktrees/`
  - `.tmp-board-events-check/`
  - `.tmp-board-handwriting-support-check/`
  - `mcp/`
  - `skills/`
- 更新 `.gitignore`：
  - 忽略 `.env` / `.env.*`，保留 `.env.example`
  - 忽略 `.claude/settings.local.json`
  - 忽略 `dist/`、`logs/`、`.tmp-*/`
  - 忽略 `历史/uncertain-*/`

### 边界

- 未删除不确定文件，只移动到历史隔离区。
- 没移动 `PROJECT_XRAY_SCAN_2026-06-05.md`，因为它是当前 X-ray 报告并已被接力文档引用。
- 没处理已跟踪的 `dist/`、`.tmp-cosyvoice-smoke/`、`.tmp-ui-smoke/`、`logs/` 历史内容；本次只收口后续噪音视图，不做危险清仓。
- `历史/skills 要用啊/graphify` 是主仓 gitlink 嵌套仓；主仓可用 `git status --ignore-submodules=dirty` 避免显示内部脏状态。

### 验证

```text
git status --ignore-submodules=dirty --untracked-files=all ✅
git check-ignore -v .claude/settings.local.json .tmp-board-events-check/x 历史/uncertain-2026-06-05-cleanup/settings.local.json ✅
Test-Path 原根层候选项均为 False ✅
```

### 下一步

回到主线：只读定位 `boardSlice` 普通多行文本换行被压扁的位置，优先检查 `mathBoardText.ts` 空白归一链路。

---

## [扫描] 全仓 X-ray 对齐：页面 / 组件 / API / SOP (2026-06-05)

### 背景

用户要求不按经验主义猜测，而是至少四层深挖项目，重点读 MD，梳理页面数量、页面内容/样式/组件、前后端 API 设计位置与触发条件，并绘制 SOP。

### 走读范围

- 根目录核心文档：`真相路标-当前唯一入口.md`、`认知图-核心逻辑动态图.md`、`ABC字段函数前端映射表.md`、`落地项目开发说明明细文档-代码直敲版.md`、`CHANGE_TREE变更树.md`。
- 接力文档：`.claude/PROJECT_STATE.md`、`.claude/ENGINEERING_LOG.md`、`.claude/PROJECT_COGNITION.md`、`.workbuddy/memory/2026-06-05.md`。
- 代码主链：`main.tsx`、`App.tsx`、`store/useTeachingEditorStore.ts`、`domain/*`、`workflow/*`、`components/*`、`modules/*`、`services/*`、`vite.config.mjs`、`scripts/zeabur-server.mjs`。
- proof 页面：`CStickerStandalonePage`、`DrawboardCoreStandalonePage`、`DrawboardHybridPrototypePage`、`KonvaProofPage`。

### 实证结论

- 页面数量：主工作台 1 个；active standalone 4 个；tldraw deprecated 2 个。
- 主工作台结构：顶部状态/配置/归档，左侧 Workflow，中央 `StagePreview + TeachingTimeline`，右侧 Inspector，Agent modal，Settings drawer。
- API：前端只通过 `services/*GatewayClient` 调同源网关；Vite dev 网关比 Zeabur server 完整，生产缺 OCR/TTS/LayoutPreview。
- A/B/C：A 轨真实 duration 是主时钟；B 站场窗口由 A 返回后生成；C 是板书演员，默认写完留场，显式 `hideAtMs` 才下台。
- 当前技术债：`BoardPreviewCard` 仍活用 tldraw；`mathBoardText.ts` 空白压缩是 C 多行文本换行丢失的高危点；VoiceTrack 数字 B 控件与 lock 语义需复核。

### 产物

- 新增：`PROJECT_XRAY_SCAN_2026-06-05.md`。
- 同步：`PROJECT_STATE.md`、本日志、`CHANGE_TREE变更树.md`。

### 验证

```text
npm run typecheck                         ✅
node scripts/check-abc-architecture.mjs   ✅
node scripts/check-board-boundaries.mjs   ✅
```

### 下一步

1. 按当前真相路标，先修 C 普通多行文本换行保留。
2. 再做 `BoardPreviewCard` 去 tldraw 化。
3. 生产部署前补齐 Zeabur API parity。

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

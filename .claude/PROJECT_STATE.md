---
title: PROJECT_STATE.md
description: 当前阶段、已确认设计、边界、下一步接力点
lastUpdate: 2026-05-31
---

# 项目状态快照

**当前日期：** 2026-05-31  
**当前阶段：** 第四步舞台问题诊断完成，等待决策批准

---

## 📌 核心问题

### 问题1：C 文字没有按标签领地站位
- **状态：** 根本原因已诊断 ✅
- **影响范围：** 舞台渲染层（AutoHandwritingLayer）
- **决策点：** 选择方案 A 还是 A+B
- **相关文档：** `FIX_PLAN_2026-05-31.md` § 问题1 / `DECISION_CHECKPOINT_2026-05-31.md` § 问题1

### 问题2：B 播放完毕，C 默认躺平不下台
- **状态：** 根本原因已诊断 ✅
- **影响范围：** 可见性过滤逻辑 + 数据模型
- **决策点：** 选择方案 A / B / C
- **相关文档：** `FIX_PLAN_2026-05-31.md` § 问题2 / `DECISION_CHECKPOINT_2026-05-31.md` § 问题2

---

## 🎯 关键决策（待确认）

| 问题 | 方案 | 改动范围 | 风险 | 选择状态 |
|------|------|--------|------|--------|
| 1 | A | coursewareChrome + AutoHandwritingLayer | 低 | ⏳ 等待 |
| 1 | B | + teachingProject.ts | 低 | ⏳ 等待 |
| 2 | A | AutoHandwritingLayer only | 低 | ⏳ 等待 |
| 2 | B | + teachingProject.ts | 低 | ⏳ 等待 |
| 2 | C | + 编译逻辑 | 中 | ⏳ 等待 |

**决策文档：** `DECISION_CHECKPOINT_2026-05-31.md`

---

## 📚 已确认的设计

### ABC 三轨世界观（不变）
- **A 轨：** 语音主轴（锁定，本轮无改动）
- **B 轨：** 寿命/显示窗口（需改进的部分）
- **C 轨：** 画布演员（需改进的部分）
- **来源：** `src/domain/globalRules.ts`

### 四区分区（不变）
- 开场读题 (题目区)
- 分析题目 (分析区)
- 解题环节 (解答区)
- 梳理总结 (总结区)
- **来源：** `SCRIPT_SECTION` in `globalRules.ts`

### chainKey 映射（已验证）
```
section ─────────────────→ chainKey
"开场读题"              template-open
"分析题目"              template-pre
"解题环节"              step-1/step-2/...
"梳理总结"              template-end
```
- **来源：** `src/modules/abcChain/abcChainKey.ts`

### 舞台渲染链（已审计）
```
TimelineClip 
  ├─ chainKey (知道四区)
  ├─ xPercent/yPercent/widthPercent (用户拖放坐标)
  └─ startMs/endMs (B 生命周期)
    ↓
AutoHandwritingLayer (过滤 + 约束)
    ↓
BoardTextSticker → CStickerFrame (渲染)
```
- **文件：** `src/components/AutoHandwritingLayer.tsx` (line 62)
- **状态：** 过滤逻辑不完整 ⚠️

---

## 🔍 边界确认

### 本轮修复的边界（只在第四步）
- ✅ `AutoHandwritingLayer.tsx` — 过滤和约束逻辑
- ✅ `coursewareChrome.ts` — 四区范围补充
- ✅ `teachingProject.ts` — TimelineClip 新字段（条件式）
- ✅ 编译逻辑 — 生成新字段（条件式）

### 不涉及的（前三步 + 其他）
- ❌ ScriptAgentTableEditor — 前三步输入，本轮不改
- ❌ 金手指 overlay — 独立层，本轮不改
- ❌ CSS 样式体系 — 长期工作，本轮不改
- ❌ 时间线交互 — 已可用，本轮验证即可

---

## 📋 下一步接力点

### 当前卡点（阻塞）
**等待：** 夏夏确认两个问题各选哪个方案

### 一旦确认，执行顺序
```
第1步：改 coursewareChrome.ts
  └─ 补充四区的完整几何范围定义

第2步：改 teachingProject.ts（如方案 B/C）
  └─ 补充 section 或 pinnedEndMs 字段

第3步：改 AutoHandwritingLayer.tsx
  ├─ 问题1：添加约束逻辑
  └─ 问题2：改可见性过滤

第4步：改编译逻辑（如方案需要）
  └─ 生成新字段

第5步：测试验收
  ├─ typecheck ✅
  ├─ 完整播放流程
  ├─ 舞台拖放交互
  └─ 不影响前三步
```

### 预期工作量
- 代码改动：~2-3 小时（方案 C 最复杂）
- 测试验收：~1-2 小时
- 文档更新：~0.5 小时
- **总计：~4-5.5 小时**

---

## 📁 相关文件清单

### 诊断文档（本轮生成）
- ✅ `CHECKPOINT_2026-05-31_STAGE_ISSUES.md` — 根本原因分析
- ✅ `FIX_PLAN_2026-05-31.md` — 完整技术方案（3 个方案 per 问题）
- ✅ `DECISION_CHECKPOINT_2026-05-31.md` — 决策检查清单（快速 review）
- ✅ `ENGINEERING_LOG.md` — 工程日志（代码审计路径）
- ✅ `PROJECT_STATE.md` — 本文件

### 源代码文件（待改）
- `src/modules/canvasStage/coursewareChrome.ts` — ⭐ 四区范围定义
- `src/components/AutoHandwritingLayer.tsx` — ⭐ 核心改动点
- `src/domain/teachingProject.ts` — 数据结构补充（条件式）
- `src/domain/globalRules.ts` — 只读参考
- `src/modules/abcChain/abcChainKey.ts` — 只读参考

### 相关但不改的文件
- `src/components/BoardTextSticker.tsx` — 验证即可
- `src/components/CStickerFrame.tsx` — 验证即可
- `src/modules/timeline/timelineWindow.ts` — 只读参考

---

## 🎓 关键学习点

1. **chainKey 是"黄金线索"**
   - 它已经编码了 section 信息
   - 只需解码并使用，不需要冗余存储

2. **"pinnedEnd"的含义**
   - 当前函数名 `isPlayheadInsideTimelineWindowWithPinnedEnd` 只作用于边界包含
   - 没有改变过滤逻辑
   - 需要补充"留场时长"的概念

3. **四区标签是"客观约束"**
   - 不是"建议"，而是应该硬约束 C 的位置
   - 目前四区标签和 C 各自为政

4. **数据模型缺陷不在渲染层**
   - CStickerFrame 的渲染代码是对的
   - 问题在于上层的"过滤"和"约束"逻辑

---

## 📊 工作统计

### 本轮诊断投入
- 代码审计：45 分钟
- 根本原因分析：20 分钟
- 方案设计：30 分钟
- 文档写作：25 分钟
- **小计：120 分钟**

### 累计文档量
- 诊断文档：~1500 行
- 工程日志：~250 行
- 项目状态：本文件

---

## 🚀 状态信号

| 信号 | 状态 | 备注 |
|------|------|------|
| 根本原因 | ✅ 已诊断 | 两个问题都清楚了 |
| 方案设计 | ✅ 已完成 | 每个问题 2-3 个方案 |
| 决策 | ⏳ 等待 | 夏夏确认选择 |
| 代码改动 | ⏹️ 未开始 | 等决策通过 |
| 测试验收 | ⏹️ 未开始 | 改完再测 |

---

## 💬 给下一个 Agent 的接力备忘

如果因为 context compaction 我不在了，下一个 Agent 继续时：

1. **首先读这个文件** — 了解当前在哪个卡点
2. **然后看决策清单** — 确认夏夏已经选择了哪个方案
3. **最后看修复方案** — 按照选择的方案改代码
4. **工程日志是完整审计路径** — 如需回溯原因

---

**最后更新：2026-05-31 诊断完成**  
**下一步等待：夏夏的方案确认**

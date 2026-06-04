---
title: PROJECT_STATE.md
description: 当前阶段、已确认设计、边界、下一步接力点
lastUpdate: 2026-06-04
---

# 项目状态快照

**当前日期：** 2026-06-04  
**当前阶段：** 问题1已修复；问题2代码语义已纠偏，待用户视角播放验收  
**当前结论：** 已撤掉 `STATIC_HOLD_DURATION_MS = 1000` 错误口径，改为“C 默认留场；只有显式 `hideAtMs` 才下台”。

---

## 一、当前真实进度

| 问题 | 当前状态 | 说明 | 相关提交/工作区 |
|---|---|---|---|
| 问题1：C 文字没有按标签领地站位 | ✅ 已修复 | 根据 `chainKey` 反推四区，约束 C 位置 | `ba7b7fb` |
| 问题2：B 播放完毕后 C 消失 | ✅ 代码已纠偏 | C 可见性改为 `startMs + optional hideAtMs`；无 `hideAtMs` 默认 stay | 当前未提交工作区 |

---

## 二、问题2语义纠偏结论

### 已废弃错误口径

之前把需求理解成：

> B 播放结束后，C 不要立刻消失，额外留场 1 秒。

对应错误实现已撤掉：

- `src/modules/timeline/timelineWindow.ts`
  - 删除 `STATIC_HOLD_DURATION_MS = 1000`
  - 删除 `isPlayheadInsideTimelineWindowWithStaticHold(...)`
- `src/components/AutoHandwritingLayer.tsx`
  - 不再用 static hold 过滤 C 可见性

### 当前正确口径

项目本质是：**直播仿板书在线解题 / 高仿在线直播板书解题录屏**。

正常板书逻辑：

- 板书写完后应该留在黑板上
- “播放完成”只表示 C 的 reveal / 演绎结束
- 不表示 C 内容下台
- C 自然播放完毕后，默认 stay 在画布上

### 当前代码语义

| 字段/状态 | 行为 |
|---|---|
| `startMs` | C 开始上台 / 开始可见 |
| `revealStartMs/revealEndMs` | C 动态书写演绎窗口 |
| `hideAtMs === undefined` | 默认 lock：C 写完继续 stay |
| `hideAtMs` 有值 | unlock 后的显式截止时间：到点隐藏 |
| B 拖动 | 仅在 unlock 后写入/调整隐藏截止时间 |

---

## 三、ABC 三轨当前语义

| 轨道 | 名称 | 当前正确语义 |
|---|---|---|
| A | 语音轨 | 语音主轴 / source 时间来源 |
| B | 站场控制轨 | 控制 C 何时上台；解锁后才控制 C 下台截止时间 |
| C | 角色轨 | 画布演员 / 板书内容；自然播放完成后默认 stay |

关键规则：

- B 不能隐式改写 C 的书写速度
- B 不能默认让已写完的板书消失
- C 的 reveal 完成 ≠ C 的可见性结束
- C 的可见性结束只能来自显式语义：`hideAtMs`

---

## 四、本轮代码影响面

### 已修改

1. `src/modules/timeline/timelineWindow.ts`
   - 新增 `isBoardClipVisibleAtPlayhead(playheadMs, startMs, hideAtMs?)`
   - 保留通用 `[startMs, endMs)` 活跃窗口函数给 A/B 时间轴使用

2. `src/domain/teachingProject.ts`
   - `TimelineClip` 新增可选字段 `hideAtMs?: number`

3. `src/components/AutoHandwritingLayer.tsx`
   - C 可见性改为读取 `startMs + hideAtMs?`
   - 没有 `hideAtMs` 时默认持续可见

4. `src/store/useTeachingEditorStore.ts`
   - B timing 更新 `endMs` 时同步写入 `hideAtMs`
   - 未显式隐藏时保留 `hideAtMs === undefined`

5. `src/components/TimelineClipBlock.tsx`
   - clip 末尾 pin 改成 lock/unlock 入口
   - 默认 lock 不允许拖动 B 改站场时长
   - 点击/按下 lock 后写入 `hideAtMs = clip.endMs`，进入 unlock 可拖动状态

6. `src/modules/tldrawStage/abcToTldrawShapes.ts`
   - 历史 tldraw 适配层同步使用新 C 可见性契约，避免第二套旧口径

7. 相关脚本 / 文案 / 规则
   - 更新 `check-timeline-window-contract.mjs`
   - 更新 `smoke-board-end-pin-visible.mjs`
   - 同步 `globalRules.ts`、责任表、UI 提示文案

---

## 五、验证结果

已通过：

```text
tsc --noEmit ✅
check-timeline-window-contract ✅
smoke-board-end-pin-visible ✅
```

未通过但非本轮直接改动：

```text
check-board-boundaries ❌
```

失败点：`Courseware stage edge must stay thin, pale, and rounded instead of a heavy iframe-like border.`  
该检查在舞台边框规则处提前失败，与本轮 `hideAtMs / C 默认留场` 主链无直接关系；后续需单独处理或确认是否为既有约束漂移。

---

## 六、下一步接力点

### 用户视角验收

- [ ] 自然播放到 C reveal 完成后，C 继续 stay 在画布上
- [ ] 默认 lock 状态下，B 自然结束不让 C 消失
- [ ] 点击 lock 后进入 unlock，B 可拖动控制 C 下台时间
- [ ] 有 `hideAtMs` 后，playhead 到点后 C 隐藏
- [ ] 问题1四区位置约束不回退

### 禁止项

- ❌ 不再把“留场”理解成固定 1 秒缓冲
- ❌ 不让 C 在自然播放完毕后默认消失
- ❌ 不在渲染层硬造第二套时间真相
- ❌ 不改 A/B/C 基本语义
- ❌ 不碰前三步主链

---

**最后更新：2026-06-04 20:10**  
**下一步：启动页面做用户视角播放验收。**

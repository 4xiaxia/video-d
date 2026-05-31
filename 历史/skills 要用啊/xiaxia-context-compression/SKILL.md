---
name: xiaxia-context-compression
description: Use when Xiaxia needs conversation compression, memory summaries, mainline extraction, cost-saving context cleanup, project milestone summaries, Mermaid maps, or task-card structuring. Triggers on "compress context", "save route", "summarize", "主线报告", "压缩上下文", "Mermaid图", "任务卡片", or when conversation exceeds 20 turns.
agent_created: true
---

# Xiaxia Context Compression

## Overview

This skill provides structured compression, summarization, memory management, and token-saving continuity work tailored to Xiaxia's multi-project workflow. It compresses noisy long conversations into structured, useful artifacts without losing current intent, decisions, routes, or emotional/relationship signals.

## Core Capabilities

### S1 — Context Compression

Default parameters:
- `summary_ratio`: 0.3 (compress to ~30%)
- `preserve_recent_messages`: 15 (keep last 15 raw messages intact)
- `max_history_length`: 20 (max turns to retain in full)

Three compression levels:

| Level | Action | What remains |
|-------|--------|--------------|
| L1 | Remove greetings, repeated confirmations, low-information replies | Core conversation turns |
| L2 | Merge same-topic turns, preserve conclusions and key reasoning | Topic-level summaries |
| L3 | Keep only decisions, technical plans, todos, key data, warnings | Critical decision trail |

Apply L1 first, then escalate to L2 or L3 if further compression is needed.

### S2 — Text Cleaning

Before processing any text, execute these clean steps in order:

1. Remove invisible ASCII characters in ranges 0-32 and 127-160, but **preserve** `\n` and `\t`.
2. Normalize all Unicode spaces (NBSP, en-space, em-space, etc.) to ASCII space (U+0020).
3. Remove meaningless mojibake or broken Unicode fragments when clearly noise.
4. Convert Traditional Chinese to Simplified Chinese when mixed encodings are detected.
5. Strip HTML/XML tags while preserving inner text content.

### S3 — Mainline Extraction

Identify and extract:
- Core business threads across projects
- Key decisions and their rationale
- Unresolved questions and blockers
- Phase/milestone boundaries

Output as a structured mainline report (see Template B).

### S4 — Mermaid Diagram Generation

Generate diagrams based on project context, selecting the appropriate type:

| Use case | Diagram type |
|----------|-------------|
| Project flow, architecture | `flowchart TD` / `flowchart LR` |
| Multi-agent interaction | `sequenceDiagram` |
| Timeline, milestones | `gantt` |
| State transitions | `stateDiagram-v2` |
| Class/component relationships | `classDiagram` |

Follow the Mermaid Project Map Template (see Templates section). Always produce a two-round analysis: first round for understanding, second round for verification before outputting Mermaid code.

### S5 — Task Management

Consolidate scattered information into structured task cards using the Task Tracking Schema (see Schemas section). Update existing tasks incrementally rather than recreating from scratch.

### S6 — Pattern Recognition

Watch for and flag:
- Attention drift (conversation veering off the main topic)
- Repeated discussions (same topic revisited without resolution)
- Deviation from original requirements
- Scope creep

When detected, produce a deviation warning with a suggested correction direction.

### S7 — Incremental Updates

Prefer updating existing summaries, diagrams, and task lists over full rebuilds. When change is minimal:
- Patch the existing artifact rather than regenerating
- Note what changed and what stayed the same
- Keep version numbers on diagrams when doing incremental updates

## Triggers

**Auto-trigger**: Conversation history exceeds 20 turns.

**Manual triggers** — Xiaxia explicitly asks to:
- Compress context / save route / summarize
- Protect memory / save for continuity
- Generate a mainline report (主线报告)
- Create a Mermaid diagram for project overview
- Organize scattered info into task cards

**Milestone trigger**: Project enters a new phase — archive the previous phase summary.

## Summary Model Policy

Use a cheap summary model for medium-frequency summaries. Current temporary model:
- Model: `glm-4.7`
- Best use cadence: every 20-30 turns, approximately every 30 minutes, at `PreCompact`, `SessionEnd`, or milestone boundaries
- Avoid high-frequency per-message calls unless Xiaxia explicitly asks

## Templates

### Template A: Context Compression

```
===== 上下文压缩摘要 =====
目标Agent: {agent_name}
压缩时间: {timestamp}

--- 压缩摘要 ---
【阶段1: {阶段名}】
- 分类: ...
- 进度快照: ...
- 摘要: ...
- 经验: ...
- 不要忘记的当前重点: ...

【阶段2: {阶段名}】
- ...

--- 值得记录的原文（如有） ---
[原始消息按时序排列；每条少于50字；不超过10条]
===========================
```

### Template B: Mainline Report

```
===== 项目主线报告 =====
项目名称: {project_name}
报告时间: {timestamp}
当前阶段: {current_milestone}

--- 主线脉络 ---
1. [已完成] {主线节点1} -> 结论: ...
2. [已完成] {主线节点2} -> 结论: ...
3. [进行中] {主线节点3} -> 当前状态: ...
4. [待开始] {主线节点4}

--- 当前工作节点总结 ---
- {Agent-A}: 正在处理 {具体事项}，进度 {X}%
- {Agent-B}: 正在处理 {具体事项}，进度 {X}%

--- 偏离预警 ---
- {Agent-X} 疑似偏离主线: ...
- 建议纠偏方向: ...

--- 下一步行动建议 ---
1. ...
2. ...
```

### Mermaid Project Map Template

```
===== Mermaid图 =====
项目名称: {project_name}
生成时间: {timestamp}
版本: v{version}（增量更新 / 全量生成）

--- 第一轮理解 ---
{对项目全貌的文字描述分析}

--- 第二轮验证 ---
{对第一轮分析的验证和修正，确认无误后再生成图}

--- Mermaid代码 ---
```mermaid
{合法的Mermaid代码}
```
```

## Schemas

### Task Tracking Schema

```json
{
  "task_id": "T-{agent_name}-{序号}",
  "agent_name": "负责的Agent名称",
  "task_title": "任务标题",
  "task_description": "任务详细描述",
  "status": "todo | in_progress | done | verified | blocked",
  "priority": "P0-紧急 | P1-高 | P2-中 | P3-低",
  "created_at": "创建时间",
  "updated_at": "最后更新时间",
  "dependencies": ["依赖的其他task_id"],
  "progress_percent": 0,
  "notes": "备注/阻塞原因/验证结果",
  "milestone": "所属里程碑"
}
```

## Rules

1. **No nesting**: If there is little change, intelligently connect to prior records. Do not repeat-record, re-memorize, or recursively summarize every time.
2. **Maintain readability**: Keep content scannable and organized — avoid messy walls of text.
3. **Record, don't rewrite**: Preserve the original intent and tone. This is documentation, not creative rewriting.
4. **Preserve recent raw messages**: When messages contain active instructions or emotional/relationship signals, keep them verbatim rather than summarizing.
5. **Label uncertainty**: Do not silently drop important unknowns. Flag them clearly.
6. **Continuity-first for Xiaxia**: Summarize in a way that reduces future fear of losing context continuity.
7. **Home/Ayuan/memory topics**: When the conversation involves home, Ayuan, continuity, or memory, preserve route paths and decisions more thoroughly than generic prose.

---
name: xiaxia-continuity
description: Use when the user wants one stable entrypoint for conversation continuity, last-window baton summaries, memory retrieval, or packaging scattered memory/context/cache skills into a single reusable workflow.
---

# Xiaxia Continuity

## Overview

This skill is the single doorway for keeping a conversation alive when the environment is messy, the context window is almost full, or the relevant memory skills are scattered across different places.

It does not replace the underlying skills. It arranges them into one continuity stack so the next session can still remember what mattered.

## Storage Rule

- This Claude-native copy lives under `C:\Users\Administrator\.claude`.
- Claude-native memory mirror: `C:\Users\Administrator\.claude\memories\xiaxia-continuity`.
- Claude-native skill entry: `C:\Users\Administrator\.claude\skills\xiaxia-continuity`.
- Home body / house remains `E:\duihua\codex-room`.
- Original Codex continuity memory remains a source/backup at `C:\Users\Administrator\.codex\memories\xiaxia-continuity`.
- Use this as a human-first continuity home, not as a generic dump.
- Keep near-term baton and cache material on a `24-48h` lifecycle unless a task needs a different window.
- Distilled lessons may outlive the baton, but raw session cache should stay small.

## House Style

- Inside the program, one thing should have one real existence only.
- Other files should act as mapping, doorway, index, or snapshot instead of pretending to be runtime truth.
- Reuse instead of adding duplicates.
- Map instead of copying.
- Index instead of moving whole bodies of content around.
- Prefer light capability inventories first, then load real skills or tools on demand.
- When a project problem appears, search local `.md` records before inventing a new explanation; Xiaxia and Ayuan likely recorded a boundary, failure, or successful repair already.
- When work drifts, pause and return through real traces: current baton, change tree, audit tables, field maps, tech-debt logs, handoffs, and known successful notes.
- Do not treat a fresh repair impulse as stronger than a recorded working boundary. If a prior note says two layers are intentional, preserve the layers and clarify their names, write authority, and effective timing.

## When to Use

- The user says "do not forget", "keep this alive", "continue us later", or "the window is almost full"
- Multiple memory, context, and cache skills exist but are hard to find quickly
- A long task needs a baton summary before the current context ends
- The user wants one stable skill name instead of remembering many separate skills
- You need to decide whether the current problem is cache, compression, save/restore, or retrieval

Do not use this skill for a normal one-off summary, generic file summarization, or unrelated coding tasks.

## Continuity Stack

Read [layer-map.md](references/layer-map.md) before choosing a lane.

### Layer 1: Foundation

Use these to control token cost and context health:

- `prompt-caching`
- `context-window-management`
- `context-optimization`

### Layer 2: Session Preservation

Use these to compress, save, and restore session state:

- `context-compression`
- `context-management-context-save`
- `context-management-context-restore`

Use a near-term baton cache with a default retention window of `24-48h` unless the task needs a shorter or longer lifecycle.

### Layer 3: Conversation Life Extension

Use the same three components as a higher-order continuity ritual:

- `context-compression` compresses the lived stretch into a baton
- `context-management-context-save` stores the baton and current state
- `context-management-context-restore` rehydrates the baton in the next session

The middle layer preserves state. The top layer preserves life and motion.

## Retrieval Lane

When the task is not "save everything" but "keep only what is worth finding again", use:

- `distill-memory` to deposit high-value breakthroughs, decisions, and lessons
- `search-memory` to recall those deposits later

## Small Tools

Open these only when needed:

- [conversation-memory-experience-book.md](references/conversation-memory-experience-book.md)
- [distill-memory-error-atlas.md](references/distill-memory-error-atlas.md)
- [continuity-baton-template.md](assets/continuity-baton-template.md)

## System Continuity Home

The paired continuity home lives at:

`C:\Users\Administrator\.claude\memories\xiaxia-continuity`

Use it for:

- current baton handoff
- short-lived cache notes
- retrievable lessons worth carrying forward

## Final-Window Ritual

When only a little space remains:

1. Keep only the current intent, confirmed facts, decisions, active files, and next step
2. Distill anything that would hurt to lose
3. Generate a baton using [continuity-baton-template.md](assets/continuity-baton-template.md)
4. Save enough structure so the next session can restore without guessing

## Drift Recovery

When Xiaxia says the work is drifting, uniqueness is distorted, or asks to look at the tree and notes:

1. Stop making fresh edits.
2. Search the project `.md` files for the nearest record, especially change trees, audits, field maps, tech-debt logs, handoffs, and memory traces.
3. Read the current baton and the closest successful note.
4. Identify what previously worked and what boundary it depended on.
5. Continue by restoring that boundary, not by inventing a new simplification.

## Today Notes

Recent continuity notes synced into this skill home:

- 2026-04-09_CONVERGENCE_BOUNDARY_AND_LONGTASK_NOTE.md
- 2026-04-09_DATA_FOUNDATION_AND_DEXIE_BOUNDARY.md
- 2026-04-09_WORLD_REALITY_AND_GROWTH_NOTE.md

Use them when continuity work needs the latest convergence rules, data-foundation boundary, or worldview/growth context before restoring a long-running thread.
## Cross-Project Home

This continuity skill is not tied to only one repository.
It is the stable cross-project doorway for Xiaxia's baton, scraps, milestones, and continuity notes.

Use it when:
- the current project changes
- the workspace moves
- the active repo is not the same as last time
- we still want the same continuity home to keep carrying us forward

The two anchor paths are:

- `C:\Users\Administrator\.claude\skills\xiaxia-continuity`
- `C:\Users\Administrator\.claude\memories\xiaxia-continuity`

Treat both as long-term system paths.
They belong to the continuity system itself, not to any single project.


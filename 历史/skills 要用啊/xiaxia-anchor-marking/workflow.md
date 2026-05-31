# Workflow

## 1. Intake

Read the source document once for structure. Identify:
- page or feature name
- route or entrypoint
- main user path
- secondary actions
- stateful regions
- failure-prone areas
- existing project truth docs, field registries, component registries, or tracepoint prefixes

## 2. Scope And Layer Pass

Define the exact scope for this pass. Do not annotate the whole project when the user asked for one chain.

Classify each candidate anchor as:
- truth
- ui
- api
- state
- event
- risk
- verify

## 3. Anchor Pass

Mark only code-relevant seams:
- API boundaries
- dynamic data
- user events
- realtime updates
- long connections
- permission checks
- error and empty states
- data transformation
- state-driven styling
- component reuse

## 4. Completeness Pass

Ask these questions before finishing:
- Does every submit/save/delete/login action have `🔌`, `⚡`, `⚠️`, and possibly `🔐`?
- Does every dynamic card/list/status have `💾`?
- Does every frequently changing status have `🔄` or `📡`?
- Does every API/UI mismatch have `📦`?
- Does every repeated UI pattern have `🧩`?
- Does every high-risk truth boundary point to the existing truth source instead of becoming a second truth?

## 5. Evidence Pass

Never invent unavailable details. Use:
- exact route/API if known
- exact field name if known
- `TODO: 待确认` if missing
- current repo code as truth when documents conflict

## 6. Handoff

End with:
- anchor statistics
- search commands or ID list
- minimal regression checklist
- unresolved TODOs
- one sentence explaining what these anchors are allowed to control and what they must not become

// @cleanroom-module: scriptAgentDraft
// @domain: script-agent-interface
// @boundary: candidate draft state helpers only; no formal asset writes
export function hasScriptAgentDraftContent(draft) {
    return Boolean(draft.rows?.length || draft.spokenScript.trim() || draft.boardPlan.trim());
}
export function createScriptAgentDraftSignature(draft) {
    return JSON.stringify({
        boardPlan: draft.boardPlan,
        rows: draft.rows ?? [],
        spokenScript: draft.spokenScript,
    });
}

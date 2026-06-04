// @boundary: A Track Production Kit script rows output only.
// Converts current candidate rows to Protocol ScriptRowDraft without touching TTS, stage, B/C timeline, or board rendering.
import { normalizeScriptAgentTableRows } from '../scriptAgentTable/normalizeScriptAgentTableDraft';
export function createATrackScriptRowsOutput(rows) {
    return {
        rows: normalizeScriptAgentTableRows(rows).map(toProtocolScriptRow),
    };
}
export function createATrackScriptRowsOutputFromDraft(draft) {
    return createATrackScriptRowsOutput(draft.rows);
}
function toProtocolScriptRow(row) {
    return {
        boardSlice: row.boardSlice,
        id: row.id,
        section: row.section,
        stepLabel: row.stepLabel,
        voiceText: row.voiceText,
    };
}

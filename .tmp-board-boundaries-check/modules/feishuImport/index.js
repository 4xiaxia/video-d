// @cleanroom-module: feishuImport
// @domain: third-party-import/feishu-bitable
// @depends: ScriptAgentDraft
// @io-input: FeishuBoardScriptRecord
// @io-output: FeishuBoardScriptImport
// @fields-in: problemText, boardScriptText, speechMarkedScript, sourceRecordId
// @fields-out: problemText, draft.spokenScript, draft.boardPlan, sourceRecordId
// @boundary: data normalization only; no HTTP, no token, no UI, no TTS, no timeline mutation
export function normalizeFeishuBoardScriptRecord(record) {
    const problemText = normalizeText(record.problemText);
    const boardScriptText = normalizeText(record.boardScriptText);
    const speechMarkedScript = normalizeText(record.speechMarkedScript);
    return {
        draft: {
            boardPlan: boardScriptText,
            spokenScript: speechMarkedScript || boardScriptText,
        },
        problemText,
        sourceRecordId: normalizeOptionalText(record.sourceRecordId),
    };
}
export function hasUsableFeishuBoardScriptRecord(record) {
    const normalizedRecord = normalizeFeishuBoardScriptRecord(record);
    return Boolean(normalizedRecord.problemText && (normalizedRecord.draft.boardPlan || normalizedRecord.draft.spokenScript));
}
function normalizeText(value) {
    return (value ?? '').replace(/\r\n/g, '\n').trim();
}
function normalizeOptionalText(value) {
    const normalizedValue = normalizeText(value);
    return normalizedValue || undefined;
}

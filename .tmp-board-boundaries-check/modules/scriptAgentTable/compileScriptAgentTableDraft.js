import { createAbcChainLabels, isBoardMaterialChainKey } from '../abcChain/abcChainKey';
import { normalizeScriptAgentTableRows } from './normalizeScriptAgentTableDraft';
export function compileScriptAgentTableDraft(tableDraft) {
    const rows = normalizeScriptAgentTableRows(tableDraft.rows);
    const spokenScript = rows.map((row) => compileSpokenSegment(row)).filter(Boolean).join('<br>');
    const boardPlan = rows
        .filter((row) => row.boardSlice && isBoardMaterialChainKey(row.chainKey))
        .map((row) => {
        const labels = createAbcChainLabels(row.chainKey);
        return `${labels.b}/${labels.c}：${row.boardSlice}`;
    })
        .join('\n');
    return {
        boardPlan,
        rows,
        spokenScript,
    };
}
function compileSpokenSegment(row) {
    const voiceText = stripTrailingPunctuation(row.voiceText);
    const boardSlice = row.boardSlice.trim();
    const shouldProjectBoardSlice = isBoardMaterialChainKey(row.chainKey);
    if (!shouldProjectBoardSlice) {
        return row.voiceText.trim();
    }
    if (!voiceText && boardSlice) {
        return `<b>${boardSlice}</b>`;
    }
    if (!boardSlice) {
        return row.voiceText.trim();
    }
    // voiceText 和 boardSlice 分离：boardSlice 只在 <b> 标记里，不拼进语音
    if (voiceText.includes(boardSlice)) {
        return voiceText.replace(boardSlice, `<b>${boardSlice}</b>`);
    }
    return `${voiceText}<b>${boardSlice}</b>`;
}
function stripTrailingPunctuation(text) {
    return text.trim().replace(/[。；;，,、\s]+$/u, '');
}

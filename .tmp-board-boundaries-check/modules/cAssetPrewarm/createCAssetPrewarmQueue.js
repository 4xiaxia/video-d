export function createCAssetPrewarmQueue({ boardEvents, canvas, readyResults, units, }) {
    const unitsById = new Map(units.map((unit) => [unit.id, unit]));
    const readyResultsBySentenceId = new Map(readyResults.map((result) => [result.sentenceId, result]));
    return boardEvents.map((event) => {
        const unit = unitsById.get(event.sentenceId);
        const readyResult = readyResultsBySentenceId.get(event.sentenceId);
        const markerText = event.text.trim();
        const rawSentenceText = unit?.text?.trim() || markerText;
        const estimatedDurationMs = Math.max(0, Math.round(unit?.estimatedDurationMs ?? readyResult?.durationMs ?? event.endMs - event.startMs));
        const revealBudgetMs = Math.max(0, Math.round(readyResult?.durationMs ?? estimatedDurationMs));
        return {
            id: `casset-prewarm-${event.id}`,
            boardEventId: event.id,
            chainKey: event.chainKey,
            estimatedDurationMs,
            fingerprint: createCAssetPrewarmFingerprint({
                chainKey: event.chainKey,
                fontFamily: canvas.boardFontFamily,
                fontName: canvas.boardFontName,
                fontUrl: canvas.boardFontUrl,
                markerText,
            }),
            fontFamily: canvas.boardFontFamily,
            fontName: canvas.boardFontName,
            fontUrl: canvas.boardFontUrl,
            markerText,
            rawSentenceText,
            revealBudgetMs,
            sentenceId: event.sentenceId,
            status: 'queued',
        };
    });
}
function createCAssetPrewarmFingerprint({ chainKey, fontFamily, fontName, fontUrl, markerText, }) {
    return [chainKey ?? '', markerText, fontName, fontFamily, fontUrl].join('::');
}

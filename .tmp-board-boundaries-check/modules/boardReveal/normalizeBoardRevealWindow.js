export function normalizeBoardRevealWindow({ displayEndMs, displayStartMs, patch, previousDisplayEndMs, previousDisplayStartMs, previousRevealEndMs, previousRevealStartMs, sourceEndMs, sourceStartMs, }) {
    let revealStartMs = patch.revealStartMs ?? previousRevealStartMs;
    let revealEndMs = patch.revealEndMs ?? previousRevealEndMs;
    const safeSourceStartMs = Math.max(0, sourceStartMs);
    const safeSourceEndMs = Math.max(safeSourceStartMs + 1, sourceEndMs);
    const displayStartChanged = patch.startMs !== undefined && patch.startMs !== previousDisplayStartMs;
    const displayEndChanged = patch.endMs !== undefined && patch.endMs !== previousDisplayEndMs;
    const revealChanged = patch.revealStartMs !== undefined || patch.revealEndMs !== undefined;
    if (displayStartChanged || displayEndChanged) {
        return createRevealWindowFromSourceIntersection({
            displayEndMs,
            displayStartMs,
            sourceEndMs: safeSourceEndMs,
            sourceStartMs: safeSourceStartMs,
        });
    }
    if (revealChanged) {
        const revealBounds = createRevealWindowFromSourceIntersection({
            displayEndMs,
            displayStartMs,
            sourceEndMs: safeSourceEndMs,
            sourceStartMs: safeSourceStartMs,
        });
        revealStartMs = clampNumber(revealStartMs, revealBounds.revealStartMs, revealBounds.revealEndMs - 1);
        revealEndMs = clampNumber(revealEndMs, revealStartMs + 1, revealBounds.revealEndMs);
    }
    return {
        revealEndMs,
        revealStartMs,
    };
}
function createRevealWindowFromSourceIntersection({ displayEndMs, displayStartMs, sourceEndMs, sourceStartMs, }) {
    const overlapStartMs = Math.max(displayStartMs, sourceStartMs);
    const overlapEndMs = Math.min(displayEndMs, sourceEndMs);
    if (overlapStartMs < overlapEndMs) {
        return {
            revealEndMs: overlapEndMs,
            revealStartMs: overlapStartMs,
        };
    }
    if (displayStartMs >= sourceEndMs) {
        return {
            revealEndMs: displayStartMs,
            revealStartMs: displayStartMs,
        };
    }
    return {
        revealEndMs: displayEndMs,
        revealStartMs: displayEndMs,
    };
}
function clampNumber(value, min, max) {
    if (!Number.isFinite(value)) {
        return min;
    }
    return Math.min(max, Math.max(min, value));
}

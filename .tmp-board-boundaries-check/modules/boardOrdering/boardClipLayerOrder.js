export function compareBoardClipLayerOrder(left, right) {
    return (compareNumber(readBoardLayerAnchorMs(left), readBoardLayerAnchorMs(right)) ||
        compareNumber(readChainStepIndex(left.chainKey), readChainStepIndex(right.chainKey)) ||
        compareNumber(readSentenceIndex(left.sourceRef), readSentenceIndex(right.sourceRef)) ||
        compareNumber(readBoardLayerEndAnchorMs(left), readBoardLayerEndAnchorMs(right)) ||
        left.id.localeCompare(right.id));
}
function readBoardLayerAnchorMs(clip) {
    return readFiniteNumber(clip.sourceStartMs) ?? readFiniteNumber(clip.revealStartMs) ?? readFiniteNumber(clip.startMs) ?? 0;
}
function readBoardLayerEndAnchorMs(clip) {
    return readFiniteNumber(clip.sourceEndMs) ?? readFiniteNumber(clip.revealEndMs) ?? readFiniteNumber(clip.endMs) ?? 0;
}
function readChainStepIndex(chainKey) {
    if (chainKey === 'template-open') {
        return -300;
    }
    if (chainKey === 'template-pre') {
        return -200;
    }
    const stepMatch = chainKey?.match(/^step-(\d+)$/);
    if (stepMatch) {
        return Number.parseInt(stepMatch[1], 10);
    }
    if (chainKey === 'template-end') {
        return 1000000;
    }
    return Number.POSITIVE_INFINITY;
}
function readSentenceIndex(sourceRef) {
    const match = sourceRef?.match(/^tts-sentence-(\d+)$/);
    return match ? Number.parseInt(match[1], 10) : Number.POSITIVE_INFINITY;
}
function readFiniteNumber(value) {
    return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}
function compareNumber(left, right) {
    return left === right ? 0 : left - right;
}

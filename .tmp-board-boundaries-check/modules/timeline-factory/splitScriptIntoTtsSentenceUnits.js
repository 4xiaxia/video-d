// @cleanroom-module: timeline-factory
// @domain: tts-audio-pipeline
// @slot: timeline-factory/script-splitter
// @depends: TtsSentenceUnit
// @feature-branch: tts-audio-pipeline
// @feature-branch: script-sync-marker
// @feature-branch: board-audio-alignment
// @route-impact: none
import { prepareAliyunMathSpeechText } from '../speechText/aliyunMathSpeechText';
const boldBoardMarkerPattern = /<b>([\s\S]*?)<\/b>/gi;
const pairedBoardMarkerPattern = /\.{7}([\s\S]*?)\.{7}/g;
const legacyBoardMarkerPattern = /►([\s\S]*?)◄/g;
const brBoundaryPattern = /<br\s*\/?>/i;
const defaultCharsPerSecond = 4.2;
export function stripBoardMarkersForTts(text) {
    return text
        .replace(boldBoardMarkerPattern, '')
        .replace(pairedBoardMarkerPattern, '')
        .replace(legacyBoardMarkerPattern, '')
        .replace(/[►◄]/g, '')
        .replace(/\.{7}/g, '');
}
export function splitScriptIntoTtsSentenceUnits(scriptText, options = {}) {
    const normalizedText = scriptText.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
    if (!normalizedText) {
        return {
            markerCount: 0,
            plainTtsText: '',
            units: [],
        };
    }
    // 按 <br> 拆句——在去标记之前拆，保证标记落在正确句子内
    const rawSegments = splitIntoSegments(normalizedText);
    const chainKeys = options.chainKeys ?? [];
    const units = [];
    const allMarkerTexts = [];
    for (let index = 0; index < rawSegments.length; index += 1) {
        const segment = rawSegments[index];
        // 从句段中提取板书标记文本（标记内是 boardSlice，提取后从语音中删掉）
        const boardMarkerTexts = collectBoardMarkerTexts(segment);
        boardMarkerTexts.forEach((m) => allMarkerTexts.push(m));
        // 去标记后的纯语音文本
        const cleanSpeech = stripBoardMarkersForTts(segment);
        if (!cleanSpeech) {
            continue;
        }
        const chainKey = chainKeys[index];
        const speechText = prepareAliyunMathSpeechText(cleanSpeech);
        units.push({
            boardMarkerText: boardMarkerTexts[0],
            boardMarkerChainKeys: chainKey ? boardMarkerTexts.map(() => chainKey) : undefined,
            boardMarkerTexts,
            chainKey,
            estimatedDurationMs: estimateDurationMs(speechText, options.maxEstimatedDurationMs),
            hasBoardMarker: boardMarkerTexts.length > 0,
            id: `tts-sentence-${String(units.length + 1).padStart(3, '0')}`,
            order: units.length + 1,
            speechText,
            text: cleanSpeech,
        });
    }
    return {
        markerCount: allMarkerTexts.length,
        plainTtsText: units.map((unit) => unit.speechText).join('\n'),
        units,
    };
}
function splitIntoSegments(text) {
    if (brBoundaryPattern.test(text)) {
        return text
            .split(/<br\s*\/?>/i)
            .map((segment) => normalizeWhitespace(segment))
            .filter(Boolean);
    }
    const single = normalizeWhitespace(text);
    return single ? [single] : [];
}
function collectBoardMarkerTexts(text) {
    return [
        ...[...text.matchAll(boldBoardMarkerPattern)].map((match) => normalizeWhitespace(match[1])),
        ...[...text.matchAll(pairedBoardMarkerPattern)].map((match) => normalizeWhitespace(match[1])),
        ...[...text.matchAll(legacyBoardMarkerPattern)].map((match) => normalizeWhitespace(match[1])),
    ].filter(Boolean);
}
function normalizeWhitespace(text) {
    return text.replace(/[\t ]+/g, ' ').trim();
}
function estimateDurationMs(sentence, maxEstimatedDurationMs = 60000) {
    const estimatedMs = Math.ceil((sentence.length / defaultCharsPerSecond) * 1000);
    return Math.min(Math.max(estimatedMs, 800), maxEstimatedDurationMs);
}

// @cleanroom-module: boardTextDisplayRoute
// @domain: board-sticker-rendering
// @boundary: single C display route only; A/TTS math delimiters must not decide C font rendering
// Components ask this router instead of branching on hasBoardMath directly.
import { hasBoardMath, isBoardTextSupportedByHandwritingFont, normalizeElementaryBoardHandwritingText, normalizeHandwritingDisplayText, stripSimpleBoardMathDelimiters, } from './mathBoardText.js';
export function resolveBoardTextDisplayRoute(text) {
    const elementaryHandwritingText = normalizeElementaryBoardHandwritingText(text);
    if (elementaryHandwritingText !== text) {
        return {
            kind: 'handwriting',
            text: normalizeHandwritingDisplayText(elementaryHandwritingText),
        };
    }
    const handwritingText = stripSimpleBoardMathDelimiters(text);
    if (handwritingText !== text) {
        return {
            kind: 'handwriting',
            text: normalizeHandwritingDisplayText(handwritingText),
        };
    }
    if (isBoardTextSupportedByHandwritingFont(text)) {
        return {
            kind: 'handwriting',
            text: normalizeHandwritingDisplayText(text),
        };
    }
    if (hasBoardMath(text)) {
        return {
            kind: 'formula',
            text,
        };
    }
    return {
        kind: 'handwriting',
        text: normalizeHandwritingDisplayText(text),
    };
}

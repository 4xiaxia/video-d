// @cleanroom-module: boardTextDisplayRoute
// @domain: board-sticker-rendering
// @boundary: single C display route only; A/TTS math delimiters must not decide C font rendering
// Components ask this router instead of branching on hasBoardMath directly.

import {
  hasBoardMath,
  isBoardTextSupportedByHandwritingFont,
  normalizeElementaryBoardHandwritingText,
  normalizeHandwritingDisplayText,
  stripSimpleBoardMathDelimiters,
} from './mathBoardText';

export type BoardTextDisplayRoute =
  | {
      kind: 'handwriting';
      text: string;
    }
  | {
      kind: 'formula';
      text: string;
    };

export function resolveBoardTextDisplayRoute(text: string): BoardTextDisplayRoute {
  // Step 0: Try full-line LaTeX→Unicode conversion (handles pure $...$ wrapping too)
  const elementaryHandwritingText = normalizeElementaryBoardHandwritingText(text);
  if (elementaryHandwritingText !== text) {
    return {
      kind: 'handwriting',
      text: normalizeHandwritingDisplayText(elementaryHandwritingText),
    };
  }

  // Step 1: Try simple $ stripping (for pure $...$ or $$...$$ wrapping)
  const handwritingText = stripSimpleBoardMathDelimiters(text);
  if (handwritingText !== text) {
    return {
      kind: 'handwriting',
      text: normalizeHandwritingDisplayText(handwritingText),
    };
  }

  // Step 2: SAFETY NET — $ must never render as literal text on the board.
  // When inline $...$ survives the earlier steps (mixed text+math like
  // "计算 $x^2+y^2$ 的答案"), strip all $ characters and retry.
  // @cleanroom-fix 2026-06-07: $ 混排残留护栏断裂修复
  const dollarStripped = text.replace(/\$/g, '').trim();
  if (dollarStripped && dollarStripped !== text) {
    const retryElementary = normalizeElementaryBoardHandwritingText(dollarStripped);
    if (retryElementary !== dollarStripped) {
      return {
        kind: 'handwriting',
        text: normalizeHandwritingDisplayText(retryElementary),
      };
    }
    if (isBoardTextSupportedByHandwritingFont(dollarStripped)) {
      return {
        kind: 'handwriting',
        text: normalizeHandwritingDisplayText(dollarStripped),
      };
    }
    if (hasBoardMath(dollarStripped)) {
      return {
        kind: 'formula',
        text: dollarStripped,
      };
    }
    return {
      kind: 'handwriting',
      text: normalizeHandwritingDisplayText(dollarStripped),
    };
  }

  // Step 3: Check if native handwriting font supports the text
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

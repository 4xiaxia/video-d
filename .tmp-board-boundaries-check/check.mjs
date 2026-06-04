import { normalizeBoardFontUrl } from './modules/boardFont/boardFontConfig.js';
import { getBoardRevealProgress } from './modules/boardReveal/getBoardRevealProgress.js';
import { normalizeBoardRevealWindow } from './modules/boardReveal/normalizeBoardRevealWindow.js';
import { createBoardDisplayTimingDragPatch, normalizeBoardDisplayWindow } from './modules/boardTiming/boardDisplayTiming.js';
import { resolveBoardStickerPluginState } from './modules/boardSticker/boardStickerPluginContract.js';
import { resolveBoardTextDisplayRoute } from './modules/boardSticker/boardTextDisplayRoute.js';
import { hasBoardMath, isBoardTextSupportedByHandwritingFont, tokenizeBoardText } from './modules/boardSticker/mathBoardText.js';
import { createBoardStickerUniformResizePatch, createBoardStickerUniformScalePatch, normalizeBoardStickerVisualPatch } from './modules/boardSticker/boardStickerGeometry.js';

import { normalizeVoiceAudioSeekSeconds } from './modules/audioPlayback/voiceAudioSeek.js';

import { resolveVoicePlaybackStart } from './modules/audioPlayback/voicePlaybackStart.js';

const sameSource = normalizeBoardRevealWindow({
  displayStartMs: 1200, displayEndMs: 3600,
  previousDisplayStartMs: 1200, previousDisplayEndMs: 3600,
  previousRevealStartMs: 1200, previousRevealEndMs: 3600,
  sourceStartMs: 1200, sourceEndMs: 3600,
  patch: {},
});
if (sameSource.revealStartMs !== 1200 || sameSource.revealEndMs !== 3600) throw new Error('initial reveal must stay aligned to A source');
const extendedB = normalizeBoardRevealWindow({
  displayStartMs: 1200, displayEndMs: 6200,
  previousDisplayStartMs: 1200, previousDisplayEndMs: 3600,
  previousRevealStartMs: 1200, previousRevealEndMs: 3600,
  sourceStartMs: 1200, sourceEndMs: 3600,
  patch: { endMs: 6200 },
});
if (extendedB.revealStartMs !== 1200 || extendedB.revealEndMs !== 3600) throw new Error('B tail beyond A must not stretch C reveal speed');
const movedBInsideA = normalizeBoardRevealWindow({
  displayStartMs: 2000, displayEndMs: 5000,
  previousDisplayStartMs: 1200, previousDisplayEndMs: 3600,
  previousRevealStartMs: 1200, previousRevealEndMs: 3600,
  sourceStartMs: 1200, sourceEndMs: 3600,
  patch: { startMs: 2000, endMs: 5000 },
});
if (movedBInsideA.revealStartMs !== 2000 || movedBInsideA.revealEndMs !== 3600) throw new Error('C dynamic window must be A source intersect B display');
const afterSourceB = normalizeBoardRevealWindow({
  displayStartMs: 4200, displayEndMs: 6200,
  previousDisplayStartMs: 1200, previousDisplayEndMs: 3600,
  previousRevealStartMs: 1200, previousRevealEndMs: 3600,
  sourceStartMs: 1200, sourceEndMs: 3600,
  patch: { startMs: 4200, endMs: 6200 },
});
if (afterSourceB.revealStartMs !== 4200 || afterSourceB.revealEndMs !== 4200) throw new Error('B fully after A must keep C completed/static, not animate inside old A source');
if (getBoardRevealProgress({ playheadMs: 4200, revealStartMs: afterSourceB.revealStartMs, revealEndMs: afterSourceB.revealEndMs }) !== 1) throw new Error('zero-duration completed reveal must be complete at B start');
const beforeSourceB = normalizeBoardRevealWindow({
  displayStartMs: 100, displayEndMs: 900,
  previousDisplayStartMs: 1200, previousDisplayEndMs: 3600,
  previousRevealStartMs: 1200, previousRevealEndMs: 3600,
  sourceStartMs: 1200, sourceEndMs: 3600,
  patch: { startMs: 100, endMs: 900 },
});
if (beforeSourceB.revealStartMs !== 900 || beforeSourceB.revealEndMs !== 900) throw new Error('B fully before A must not animate inside old A source');
if (getBoardRevealProgress({ playheadMs: 500, revealStartMs: beforeSourceB.revealStartMs, revealEndMs: beforeSourceB.revealEndMs }) !== 0) throw new Error('zero-duration pending reveal must stay unwritten before its anchor');
const manualReveal = normalizeBoardRevealWindow({
  displayStartMs: 2000, displayEndMs: 3200,
  previousDisplayStartMs: 2000, previousDisplayEndMs: 3200,
  previousRevealStartMs: 2000, previousRevealEndMs: 3200,
  sourceStartMs: 1200, sourceEndMs: 3600,
  patch: { revealStartMs: 1000, revealEndMs: 5000 },
});
if (manualReveal.revealStartMs !== 2000 || manualReveal.revealEndMs !== 3200) throw new Error('manual C reveal window must clamp to A source intersect B display');
const defaultMidpointProgress = getBoardRevealProgress({ playheadMs: 2400, revealStartMs: 1200, revealEndMs: 3600 });
const earlyDefaultProgress = getBoardRevealProgress({ playheadMs: 1800, revealStartMs: 1200, revealEndMs: 3600 });
if (!(earlyDefaultProgress > 0.7 && earlyDefaultProgress < 1 && defaultMidpointProgress === 1)) throw new Error('default C reveal must be fast enough for handwriting-first playback');
const fastProgress = getBoardRevealProgress({ playheadMs: 2400, revealStartMs: 1200, revealEndMs: 3600, drawSpeed: 2 });
const slowProgress = getBoardRevealProgress({ playheadMs: 2400, revealStartMs: 1200, revealEndMs: 3600, drawSpeed: 0.5 });
if (!(fastProgress > 0.85 && fastProgress <= 1)) throw new Error('drawSpeed above 1 must make C reveal visibly faster inside the same A/B window');
if (!(slowProgress > 0 && slowProgress < 0.2)) throw new Error('drawSpeed below 1 must make C reveal visibly slower inside the same A/B window');
const displayWindow = normalizeBoardDisplayWindow({ startMs: -500, endMs: -100 });
if (displayWindow.startMs !== 0 || displayWindow.endMs !== 100) throw new Error('B display window must clamp to valid survival interval');
const dragPatch = createBoardDisplayTimingDragPatch({ currentClientX: 150, durationMs: 1000, laneWidth: 100, mode: 'range', originEndMs: 400, originStartMs: 200, pointerX: 100 });
if (dragPatch.startMs !== 700 || dragPatch.endMs !== 900) throw new Error('B drag patch must preserve clip width for range move');
const visualPatch = normalizeBoardStickerVisualPatch({ drawSpeed: 9, fontSize: 200, widthPercent: 200, xPercent: -10, yPercent: 120 });
if (visualPatch.drawSpeed !== 4 || visualPatch.fontSize !== 96 || visualPatch.widthPercent !== 90 || visualPatch.xPercent !== 0 || visualPatch.yPercent !== 100) throw new Error('C visual patch must clamp in boardSticker module');
const defaultVisualPatch = normalizeBoardStickerVisualPatch({});
if (defaultVisualPatch.xPercent !== 50 || defaultVisualPatch.yPercent !== 56 || defaultVisualPatch.widthPercent !== 34) throw new Error('C visual defaults must stay in boardSticker module');
const resizePatch = createBoardStickerUniformResizePatch({ areaWidth: 1000, currentClientX: 600, fallbackFontSize: 40, originClientX: 500, originFontSize: 40, originWidthPercent: 40 });
if (resizePatch.widthPercent !== 50 || resizePatch.fontSize !== 50) throw new Error('C resize must scale width and fontSize together');
const scalePatch = createBoardStickerUniformScalePatch({ fallbackFontSize: 40, originFontSize: 40, originWidthPercent: 40, scalePercent: 150 });
if (scalePatch.widthPercent !== 60 || scalePatch.fontSize !== 60) throw new Error('C overall scale must derive width and fontSize together');
const minScalePatch = createBoardStickerUniformScalePatch({ fallbackFontSize: 40, originFontSize: 40, originWidthPercent: 40, scalePercent: 1 });
if (minScalePatch.widthPercent !== 8 || minScalePatch.fontSize !== 12) throw new Error('C overall scale must clamp through boardSticker rules');
if (normalizeVoiceAudioSeekSeconds(2500) !== 2.5) throw new Error('A audio seek must convert playhead offset to seconds');
if (normalizeVoiceAudioSeekSeconds(-500) !== 0) throw new Error('A audio seek must clamp negative offsets to zero');
const voiceStartInside = resolveVoicePlaybackStart(2500, [{ id: 'a1', kind: 'audio', label: 'A1', startMs: 1000, endMs: 4000, trackId: 'track-voice', sourceRef: 'voice.mp3' }]);
if (!voiceStartInside || voiceStartInside.offsetMs !== 1500 || voiceStartInside.playheadMs !== 2500) throw new Error('A playback must resume from the dragged playhead inside the active voice clip');
const voiceStartGap = resolveVoicePlaybackStart(4500, [{ id: 'a1', kind: 'audio', label: 'A1', startMs: 1000, endMs: 4000, trackId: 'track-voice', sourceRef: 'voice-1.mp3' }, { id: 'a2', kind: 'audio', label: 'A2', startMs: 6000, endMs: 8000, trackId: 'track-voice', sourceRef: 'voice-2.mp3' }]);
if (!voiceStartGap || voiceStartGap.clip.id !== 'a2' || voiceStartGap.offsetMs !== 0 || voiceStartGap.playheadMs !== 6000) throw new Error('A playback from a voice gap must advance to the next A clip, not restart from the first clip');
const voiceStartAfterTail = resolveVoicePlaybackStart(9000, [{ id: 'a1', kind: 'audio', label: 'A1', startMs: 1000, endMs: 4000, trackId: 'track-voice', sourceRef: 'voice.mp3' }]);
if (voiceStartAfterTail !== null) throw new Error('A playback after the final voice tail must not restart from the first clip');
if (normalizeBoardFontUrl('') !== '') throw new Error('empty board font URL must not fall back to external stylesheet');
if (normalizeBoardFontUrl('not-a-url') !== '') throw new Error('invalid board font URL must not fall back to external stylesheet');
if (hasBoardMath('25×4=100') || hasBoardMath('1200÷100=12')) throw new Error('plain numeric arithmetic must stay in C handwriting font, not KaTeX');
if (!isBoardTextSupportedByHandwritingFont('y=2x+1')) throw new Error('C handwriting font must support linear letter-number expressions');
if (!isBoardTextSupportedByHandwritingFont('a+b=5') || !isBoardTextSupportedByHandwritingFont('x=12')) throw new Error('C handwriting font must support simple letters, digits, and operators');
if (!isBoardTextSupportedByHandwritingFont('f(x)=x^2+1')) throw new Error('linear function expressions must stay available to C handwriting font route');
const plainArithmeticTokens = tokenizeBoardText('25×4=100')[0];
if (plainArithmeticTokens.length !== 1 || plainArithmeticTokens[0].kind !== 'text') throw new Error('plain numeric arithmetic must tokenize as handwriting text');
if (!hasBoardMath('$25×4=100$')) throw new Error('explicit simple arithmetic still needs the display tokenizer to strip speech-protection delimiters');
if (!hasBoardMath('函数 f(x)=x^2+1')) throw new Error('function expressions may be math-detected before C route chooses handwriting');
if (hasBoardMath('函数 y=2x+1')) throw new Error('linear expressions supported by the C font must stay in C handwriting');
if (!hasBoardMath('\\sin x+\\cos x=1')) throw new Error('LaTeX function commands must render as board math');
const explicitTokens = tokenizeBoardText('$25×4=100$')[0];
if (explicitTokens.length !== 1 || explicitTokens[0].kind !== 'text' || explicitTokens[0].text !== '25×4=100') throw new Error('explicit simple arithmetic must strip speech-protection delimiters and stay in C handwriting text');
const explicitFormulaTokens = tokenizeBoardText('$\\frac{1}{2}+\\frac{1}{3}$')[0];
if (explicitFormulaTokens.length !== 1 || explicitFormulaTokens[0].kind !== 'math' || !explicitFormulaTokens[0].latex.includes('\\frac')) throw new Error('explicit complex formulas must still render as math');
const speechProtectedArithmeticRoute = resolveBoardTextDisplayRoute('$25×4=100$');
if (speechProtectedArithmeticRoute.kind !== 'handwriting' || speechProtectedArithmeticRoute.text !== '25×4=100') throw new Error('A speech-protected simple arithmetic must render through C handwriting route without dollar delimiters');
const speechProtectedFormulaRoute = resolveBoardTextDisplayRoute('$\\frac{1}{2}+\\frac{1}{3}$');
if (speechProtectedFormulaRoute.kind !== 'formula') throw new Error('A speech-protected complex formula must still render through C formula route');
const parenTokens = tokenizeBoardText('\\(= \\frac{5}{8}\\)')[0];
if (parenTokens.length !== 1 || parenTokens[0].kind !== 'math' || parenTokens[0].latex !== '= \\frac{5}{8}') throw new Error('explicit paren math must strip delimiters into one math token');
const bracketTokens = tokenizeBoardText('解：\\[f(x)=x^2+1\\]')[0];
if (!bracketTokens.some((token) => token.kind === 'text' && token.text.includes('解')) || !bracketTokens.some((token) => token.kind === 'text' && token.text.includes('f(x)'))) throw new Error('explicit bracket linear function must keep text and strip math delimiters for C handwriting');
const mixedTokens = tokenizeBoardText('函数 f(x)=x^2+1')[0];
if (mixedTokens.length !== 1 || mixedTokens[0].kind !== 'text' || !mixedTokens[0].text.includes('函数 f(x)')) throw new Error('mixed font-supported function text must stay as one C handwriting text token');
const numericFunctionRoute = resolveBoardTextDisplayRoute('函数 y=2x+1');
if (numericFunctionRoute.kind !== 'handwriting') throw new Error('C font-supported numeric function text must stay in handwriting route');
if (numericFunctionRoute.text !== '函数 y=2x+1') throw new Error('C font-supported numeric function text must stay unchanged in handwriting route');
const linearExpressionRoute = resolveBoardTextDisplayRoute('y=2x+1');
if (linearExpressionRoute.kind !== 'handwriting' || linearExpressionRoute.text !== 'y=2x+1') throw new Error('plain linear expressions must stay in C handwriting route');
const speechProtectedLinearRoute = resolveBoardTextDisplayRoute('$y=2x+1$');
if (speechProtectedLinearRoute.kind !== 'handwriting' || speechProtectedLinearRoute.text !== 'y=2x+1') throw new Error('speech-protected linear expressions must strip delimiters and stay in C handwriting route');
const letterArithmeticRoute = resolveBoardTextDisplayRoute('a+b=5');
if (letterArithmeticRoute.kind !== 'handwriting' || letterArithmeticRoute.text !== 'a+b=5') throw new Error('simple letter arithmetic must stay in C handwriting route');
const structuralFormulaRoute = resolveBoardTextDisplayRoute('函数 f(x)=x^2+1');
if (structuralFormulaRoute.kind !== 'handwriting') throw new Error('font-supported function expressions must use the C handwriting route');
const pluginState = resolveBoardStickerPluginState({ text: '$y=2x+1$', visual: { fontSize: 999, widthPercent: 999, xPercent: -20 } });
if (pluginState.pluginId !== 'board-sticker-c-canvas') throw new Error('portable boardSticker plugin id must stay stable');
if (pluginState.displayRoute.kind !== 'handwriting' || pluginState.displayRoute.text !== 'y=2x+1') throw new Error('portable boardSticker plugin state must expose the centralized display route');
if (pluginState.visual.fontSize !== 96 || pluginState.visual.widthPercent !== 90 || pluginState.visual.xPercent !== 0) throw new Error('portable boardSticker plugin state must expose normalized C visual geometry');
console.log('[board-boundaries] passed');

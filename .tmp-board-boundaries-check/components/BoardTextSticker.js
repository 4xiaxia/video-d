import { jsx as _jsx } from "react/jsx-runtime";
// @cleanroom-component: BoardTextSticker
// @domain: board-sticker-rendering
// @slot: center-stage/c-canvas-sticker
// @depends: TimelineClip(kind=board).label/xPercent/yPercent/widthPercent, StageCanvasConfig.boardFontFamily, CStickerFrame, BoardHandwritingStickerContent, BoardMathStickerContent
// @io-input: text, xPercent, yPercent, widthPercent, fontFamily, fontSize, fontLoadKey, dragging/selected state
// @io-output: onPointerDown, onResizePointerDown
// @boundary: C sticker composition only; frame and content renderers stay separate, B owns timing, A owns audio
// @content-contract: renders only C-layer board content derived from upstream boardSlice/clip data; never stage chrome labels or problem-area text.
import { memo } from 'react';
import { resolveBoardTextDisplayRoute } from '../modules/boardSticker';
import { BoardHandwritingStickerContent } from './BoardHandwritingStickerContent';
import { BoardMathStickerContent } from './BoardMathStickerContent';
import { CStickerFrame } from './CStickerFrame';
function BoardTextStickerInner({ color, fontFamily, fontLoadKey, fontSize, isDragging, isSelected, onPointerDown, onResizePointerDown, revealProgress, stackIndex, text, widthPercent, xPercent, yPercent, }) {
    const displayRoute = resolveBoardTextDisplayRoute(text);
    const contentKind = displayRoute.kind;
    return (_jsx(CStickerFrame, { color: color, contentKind: contentKind, fontSize: fontSize, isDragging: isDragging, isSelected: isSelected, onPointerDown: onPointerDown, onResizePointerDown: onResizePointerDown, revealProgress: revealProgress, stackIndex: stackIndex, text: text, widthPercent: widthPercent, xPercent: xPercent, yPercent: yPercent, children: contentKind === 'formula' ? (_jsx(BoardMathStickerContent, { color: color, text: displayRoute.text })) : (_jsx(BoardHandwritingStickerContent, { color: color, fontFamily: fontFamily, fontLoadKey: fontLoadKey, fontSize: fontSize, text: displayRoute.text })) }));
}
export const BoardTextSticker = memo(BoardTextStickerInner, areBoardTextStickerPropsEqual);
function areBoardTextStickerPropsEqual(previous, next) {
    return (previous.color === next.color &&
        previous.fontFamily === next.fontFamily &&
        previous.fontLoadKey === next.fontLoadKey &&
        previous.fontSize === next.fontSize &&
        previous.isDragging === next.isDragging &&
        previous.isSelected === next.isSelected &&
        previous.revealProgress === next.revealProgress &&
        previous.stackIndex === next.stackIndex &&
        previous.text === next.text &&
        previous.widthPercent === next.widthPercent &&
        previous.xPercent === next.xPercent &&
        previous.yPercent === next.yPercent);
}

import { DEFAULT_BOARD_FONT_SIZE, normalizeBoardFontSize } from '../boardFont/boardFontConfig.js';
import { DEFAULT_BOARD_DRAW_SPEED } from '../boardReveal/boardRevealConfig.js';
export const DEFAULT_BOARD_STICKER_X_PERCENT = 50;
export const DEFAULT_BOARD_STICKER_Y_PERCENT = 56;
export const DEFAULT_BOARD_STICKER_WIDTH_PERCENT = 34;
const MIN_BOARD_STICKER_WIDTH_PERCENT = 8;
const MAX_BOARD_STICKER_WIDTH_PERCENT = 90;
export function clampBoardStickerPercent(value, fallback = 0) {
    return clampNumber(value ?? fallback, 0, 100);
}
export function clampBoardStickerWidthPercent(value) {
    return clampNumber(value ?? DEFAULT_BOARD_STICKER_WIDTH_PERCENT, MIN_BOARD_STICKER_WIDTH_PERCENT, MAX_BOARD_STICKER_WIDTH_PERCENT);
}
export function getBoardStickerFontSize(value, fallback = DEFAULT_BOARD_FONT_SIZE) {
    return normalizeBoardFontSize(value ?? fallback);
}
export function getBoardStickerDrawSpeed(value) {
    return clampNumber(value ?? DEFAULT_BOARD_DRAW_SPEED, 0.1, 4);
}
export function normalizeBoardStickerVisualPatch({ drawSpeed, fontSize, widthPercent, xPercent, yPercent, }) {
    return {
        drawSpeed: getBoardStickerDrawSpeed(drawSpeed),
        fontSize: getBoardStickerFontSize(fontSize),
        widthPercent: clampBoardStickerWidthPercent(widthPercent),
        xPercent: clampBoardStickerPercent(xPercent, DEFAULT_BOARD_STICKER_X_PERCENT),
        yPercent: clampBoardStickerPercent(yPercent, DEFAULT_BOARD_STICKER_Y_PERCENT),
    };
}
export function createBoardStickerUniformResizePatch({ areaWidth, currentClientX, fallbackFontSize, originClientX, originFontSize, originWidthPercent, }) {
    const safeAreaWidth = Math.max(1, areaWidth);
    const safeOriginWidthPercent = clampBoardStickerWidthPercent(originWidthPercent);
    const safeOriginFontSize = getBoardStickerFontSize(originFontSize, fallbackFontSize);
    const deltaPercent = ((currentClientX - originClientX) / safeAreaWidth) * 100;
    const widthPercent = clampBoardStickerWidthPercent(safeOriginWidthPercent + deltaPercent);
    const uniformScale = widthPercent / safeOriginWidthPercent;
    return {
        fontSize: getBoardStickerFontSize(safeOriginFontSize * uniformScale, fallbackFontSize),
        widthPercent,
    };
}
export function createBoardStickerUniformScalePatch({ fallbackFontSize, originFontSize, originWidthPercent, scalePercent, }) {
    const safeOriginWidthPercent = clampBoardStickerWidthPercent(originWidthPercent);
    const safeOriginFontSize = getBoardStickerFontSize(originFontSize, fallbackFontSize);
    const uniformScale = clampNumber(scalePercent, 20, 220) / 100;
    return {
        fontSize: getBoardStickerFontSize(safeOriginFontSize * uniformScale, fallbackFontSize),
        widthPercent: clampBoardStickerWidthPercent(safeOriginWidthPercent * uniformScale),
    };
}
export function createBoardStickerMovePatch({ areaHeight, areaWidth, currentClientX, currentClientY, originClientX, originClientY, originXPercent, originYPercent, }) {
    return {
        xPercent: clampBoardStickerPercent(originXPercent + (((currentClientX - originClientX) / Math.max(1, areaWidth)) * 100), DEFAULT_BOARD_STICKER_X_PERCENT),
        yPercent: clampBoardStickerPercent(originYPercent + (((currentClientY - originClientY) / Math.max(1, areaHeight)) * 100), DEFAULT_BOARD_STICKER_Y_PERCENT),
    };
}
function clampNumber(value, min, max) {
    if (!Number.isFinite(value)) {
        return min;
    }
    return Math.min(max, Math.max(min, value));
}

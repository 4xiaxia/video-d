// @deprecated 2026-06-07: renderBoardTextStickerImage / renderBoardMathStickerImage 已退场 (PNG→手写字体)
// 文件保留在 boardSticker/ 目录作为历史参考，barrel 不再导出
export {
  BOARD_STICKER_PLUGIN_ID,
  resolveBoardStickerPluginState,
} from './boardStickerPluginContract';
export type { BoardStickerPluginInput, BoardStickerPluginState } from './boardStickerPluginContract';
export { resolveBoardTextDisplayRoute } from './boardTextDisplayRoute';
export type { BoardTextDisplayRoute } from './boardTextDisplayRoute';
export { useBoardStickerDragController } from './useBoardStickerDragController';
export {
  hasBoardMath,
  isBoardTextSupportedByHandwritingFont,
  normalizeBoardMathText,
  normalizeElementaryBoardHandwritingText,
  normalizeHandwritingDisplayText,
  stripSimpleBoardMathDelimiters,
  tokenizeBoardText,
} from './mathBoardText';
export type { BoardTextToken } from './mathBoardText';
export {
  clampBoardStickerPercent,
  clampBoardStickerWidthPercent,
  createBoardStickerMovePatch,
  createBoardStickerUniformResizePatch,
  createBoardStickerUniformScalePatch,
  DEFAULT_BOARD_STICKER_WIDTH_PERCENT,
  DEFAULT_BOARD_STICKER_X_PERCENT,
  DEFAULT_BOARD_STICKER_Y_PERCENT,
  getBoardStickerFontSize,
  getBoardStickerDrawSpeed,
  normalizeBoardStickerVisualPatch,
} from './boardStickerGeometry';
export type {
  BoardStickerUniformResizeInput,
  BoardStickerUniformResizePatch,
  BoardStickerUniformScaleInput,
  BoardStickerVisualPatch,
} from './boardStickerGeometry';

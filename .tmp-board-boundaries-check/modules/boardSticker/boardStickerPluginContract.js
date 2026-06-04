// @cleanroom-module: boardStickerPluginContract
// @domain: portable-board-sticker-plugin
// @boundary: public plugin contract only; no React, no DOM, no A audio, no B timing, no storage
import { resolveBoardTextDisplayRoute } from './boardTextDisplayRoute.js';
import { normalizeBoardStickerVisualPatch } from './boardStickerGeometry.js';
export const BOARD_STICKER_PLUGIN_ID = 'board-sticker-c-canvas';
export function resolveBoardStickerPluginState({ text, visual = {}, }) {
    return {
        displayRoute: resolveBoardTextDisplayRoute(text),
        pluginId: BOARD_STICKER_PLUGIN_ID,
        text,
        visual: normalizeBoardStickerVisualPatch(visual),
    };
}

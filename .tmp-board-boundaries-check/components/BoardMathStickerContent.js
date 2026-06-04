import { jsx as _jsx } from "react/jsx-runtime";
// @cleanroom-component: BoardMathStickerContent
// @domain: board-sticker-rendering/math
// @slot: center-stage/c-canvas-sticker/math
// @depends: FormulaText, boardSticker/mathBoardText
// @boundary: math content renderer only; does not own C frame geometry, handwriting PNG rendering, A timing, or B display
import { FormulaText } from './FormulaText';
export function BoardMathStickerContent({ color, text }) {
    return (_jsx(FormulaText, { as: "span", className: "board-text-sticker__formula", classNamePrefix: "board-text-sticker", rootClassName: "", style: { color }, children: text }));
}

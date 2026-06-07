// @cleanroom-component: BoardHandwritingStickerContent
// @domain: board-sticker-rendering/handwriting
// @slot: center-stage/c-canvas-sticker/handwriting
// @depends: renderBoardTextStickerImage
// @io-input: text, fontFamily, fontSize, fontLoadKey
// @io-output: transparent handwriting image or fallback text
// @boundary: handwriting content renderer only; does not own C frame geometry, math rendering, A timing, or B display
// @font-contract: uses the board handwriting font family only; never render system chrome text such as stage labels or problem-area copy here.

import { normalizeBoardFontSize } from '../modules/boardFont/boardFontConfig';

export function BoardHandwritingStickerContent({
  color,
  fontFamily,
  fontSize,
  text,
}: {
  color: string;
  fontFamily: string;
  fontLoadKey: string;
  fontSize: number;
  text: string;
}) {
  const resolvedFontSize = normalizeBoardFontSize(fontSize);

  return (
    <span
      className="board-text-sticker__text-content"
      style={{
        fontFamily,
        fontSize: resolvedFontSize,
        color,
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
        display: 'inline-block'
      }}
    >
      {text}
    </span>
  );
}

// @cleanroom-component: BoardHandwritingStickerContent
// @domain: board-sticker-rendering/handwriting
// @slot: center-stage/c-canvas-sticker/handwriting
// @depends: native DOM text layout
// @io-input: text, fontFamily, fontSize, fontLoadKey
// @io-output: realtime handwriting text
// @boundary: handwriting content renderer only; does not own C frame geometry, math rendering, A timing, B display, or PNG generation
// @font-contract: uses the board handwriting font family only; never render system chrome text such as stage labels or problem-area copy here.

import { normalizeBoardFontSize } from '../modules/boardFont/boardFontConfig';

export function BoardHandwritingStickerContent({
  color,
  fontFamily,
  fontLoadKey: _fontLoadKey,
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
      className="board-text-sticker__live-text"
      data-render-mode="realtime-text"
      style={{
        color,
        fontFamily,
        fontSize: `${resolvedFontSize}px`,
      }}
    >
      {text}
    </span>
  );
}

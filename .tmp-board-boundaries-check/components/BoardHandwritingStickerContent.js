import { jsx as _jsx } from "react/jsx-runtime";
// @cleanroom-component: BoardHandwritingStickerContent
// @domain: board-sticker-rendering/handwriting
// @slot: center-stage/c-canvas-sticker/handwriting
// @depends: renderBoardTextStickerImage
// @io-input: text, fontFamily, fontSize, fontLoadKey
// @io-output: transparent handwriting image or fallback text
// @boundary: handwriting content renderer only; does not own C frame geometry, math rendering, A timing, or B display
// @font-contract: uses the board handwriting font family only; never render system chrome text such as stage labels or problem-area copy here.
import { useEffect, useState } from 'react';
import { normalizeBoardFontSize } from '../modules/boardFont/boardFontConfig';
import { renderBoardTextStickerImage } from '../modules/boardSticker';
export function BoardHandwritingStickerContent({ color, fontFamily, fontLoadKey, fontSize, text, }) {
    const [stickerImage, setStickerImage] = useState(null);
    const resolvedFontSize = normalizeBoardFontSize(fontSize);
    useEffect(() => {
        let isCancelled = false;
        void renderBoardTextStickerImage(text, {
            color,
            fontFamily,
            fontSize: resolvedFontSize,
        }).then((nextImage) => {
            if (!isCancelled) {
                setStickerImage(nextImage);
            }
        });
        return () => {
            isCancelled = true;
        };
    }, [color, fontFamily, fontLoadKey, resolvedFontSize, text]);
    return stickerImage ? (_jsx("img", { alt: "", className: "board-text-sticker__image", draggable: false, src: stickerImage.dataUrl })) : (_jsx("span", { className: "board-text-sticker__fallback", children: text }));
}

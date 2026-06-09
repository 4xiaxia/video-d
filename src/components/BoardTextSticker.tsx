// @cleanroom-component: BoardTextSticker
// @domain: board-sticker-rendering
// @slot: center-stage/c-canvas-sticker
// @depends: TimelineClip(kind=board).label, StageCanvasConfig.boardFontFamily, CStickerFrame, BoardHandwritingStickerContent, BoardMathStickerContent
// @io-input: text, fontFamily, fontSize, fontLoadKey, selected state
// @io-output: onClick for selection
// @boundary: C sticker composition only; frame and content renderers stay separate, B owns timing, A owns audio
// @content-contract: renders only C-layer board content derived from upstream boardSlice/clip data; never stage chrome labels or problem-area text.
// @xiaxia-2026-06-08 返璞归真：板书是文本段落，在分区容器内按文档流排列

import { memo } from 'react';
import type { MouseEventHandler } from 'react';
import { resolveBoardTextDisplayRoute } from '../modules/boardSticker';
import type { CoursewareZoneKey } from '../modules/canvasStage/coursewareZoneLayout';
import { BoardHandwritingStickerContent } from './BoardHandwritingStickerContent';
import { BoardMathStickerContent } from './BoardMathStickerContent';
import { CStickerFrame } from './CStickerFrame';

type BoardTextStickerProps = {
  color: string;
  fontFamily: string;
  fontLoadKey: string;
  fontSize: number;
  isSelected: boolean;
  onClick: MouseEventHandler<HTMLParagraphElement>;
  revealProgress: number;
  text: string;
  zoneKey: CoursewareZoneKey;
};

function BoardTextStickerInner({
  color,
  fontFamily,
  fontLoadKey,
  fontSize,
  isSelected,
  onClick,
  revealProgress,
  text,
  zoneKey,
}: BoardTextStickerProps) {
  const displayRoute = resolveBoardTextDisplayRoute(text);
  const contentKind = displayRoute.kind;

  return (
    <CStickerFrame
      color={color}
      contentKind={contentKind}
      fontSize={fontSize}
      isSelected={isSelected}
      onClick={onClick}
      revealProgress={revealProgress}
      text={text}
      zoneKey={zoneKey}
    >
      {contentKind === 'formula' ? (
        <BoardMathStickerContent color={color} text={displayRoute.text} />
      ) : (
        <BoardHandwritingStickerContent
          color={color}
          fontFamily={fontFamily}
          fontLoadKey={fontLoadKey}
          fontSize={fontSize}
          text={displayRoute.text}
        />
      )}
    </CStickerFrame>
  );
}

export const BoardTextSticker = memo(BoardTextStickerInner, areBoardTextStickerPropsEqual);

function areBoardTextStickerPropsEqual(previous: BoardTextStickerProps, next: BoardTextStickerProps) {
  return (
    previous.color === next.color &&
    previous.fontFamily === next.fontFamily &&
    previous.fontLoadKey === next.fontLoadKey &&
    previous.fontSize === next.fontSize &&
    previous.isSelected === next.isSelected &&
    previous.revealProgress === next.revealProgress &&
    previous.text === next.text &&
    previous.zoneKey === next.zoneKey
  );
}

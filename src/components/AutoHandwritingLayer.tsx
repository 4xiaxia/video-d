// @@COMP_HANDWRITING ⚠️ BREAKPOINT: C 自动手写 reveal 核心层；拖拽冻结/曲线偏置/源时间 vs 显示时间判定
// @cleanroom-component: AutoHandwritingLayer
// @domain: drawboard-stage/c1-auto-handwriting
// @slot: drawboard-stage/c1-actor-layer
// @depends: TimelineClip(kind=board), StageCanvasConfig.boardFontFamily, BoardTextSticker, react-konva
// @io-input: boardClips, playheadMs, selectedBoardClipId, boardFontLoadKey
// @io-output: onSelectBoardClip, onUpdateBoardClip(C visual x/y/width/fontSize)
// @boundary: C1 automatic board actor only; B timing and A audio stay outside this component
// @recording-contract: C content recording uses Konva Text canvas; ordinary C is realtime text, not PNG or hand-written Canvas2D fillText.
// @interaction-contract: C click/drag/resize remains here even when golden-finger mode is off; this layer receives input because top overlay is pointer-transparent in off mode
// @c-stage-copy: 整张画布都是 C 素材演绎区

import { useEffect, useMemo, useRef, useState } from 'react';
import { Group, Layer, Stage, Text } from 'react-konva';
import type { StageCanvasConfig, TimelineClip } from '../domain/teachingProject';
import { getBoardRevealProgress } from '../modules/boardReveal';
import { compareBoardClipLayerOrder } from '../modules/boardOrdering';
import type { CoursewareZoneKey } from '../modules/canvasStage/coursewareZoneLayout';
import { getZoneNameFromChainKey } from '../modules/canvasStage/coursewareZoneLayout';
import {
  DEFAULT_BOARD_STICKER_WIDTH_PERCENT,
  DEFAULT_BOARD_STICKER_X_PERCENT,
  DEFAULT_BOARD_STICKER_Y_PERCENT,
  getBoardStickerFontSize,
  resolveBoardTextDisplayRoute,
  useBoardStickerDragController,
} from '../modules/boardSticker';
import { isBoardClipVisibleAtPlayhead } from '../modules/timeline/timelineWindow';
import { BoardTextSticker } from './BoardTextSticker';
import type { BoardClipPatch } from './drawboardStageTypes';

const RECORDING_TEXT_LINE_HEIGHT_RATIO = 1.35;
const RECORDING_TEXT_PADDING_X = 4;
const RECORDING_TEXT_PADDING_Y = 2;

export function AutoHandwritingLayer({
  boardClips,
  boardFontLoadKey,
  boardFontSize,
  canvas,
  isPlaying,
  playheadMs,
  selectedBoardClipId,
  zoneOffsets,
  onRecordingCanvasReady,
  onSelectBoardClip,
  onUpdateBoardClip,
}: {
  boardClips: TimelineClip[];
  boardFontLoadKey: string;
  boardFontSize: number;
  canvas: StageCanvasConfig;
  /** @xiaxia-2026-06-08 编辑态(非播放)显示全部板书且 reveal=1，让人先看排版；播放态才按播放头时间过滤/逐字 reveal */
  isPlaying: boolean;
  playheadMs: number;
  selectedBoardClipId: string | null;
  /** @cleanroom-fix 2026-06-07: 分片标签拖动偏移(百分比)，贴纸跟随容器一起挪 */
  zoneOffsets?: Partial<Record<CoursewareZoneKey, { xPct: number; yPct: number }>>;
  onRecordingCanvasReady?: (canvas: HTMLCanvasElement | null) => void;
  onSelectBoardClip: (clipId: string) => void;
  onUpdateBoardClip: (clipId: string, patch: BoardClipPatch) => void;
}) {
  const boardAreaRef = useRef<HTMLDivElement | null>(null);
  const frozenRevealRef = useRef<{ clipId: string; progress: number } | null>(null);
  const [recordingAreaMetrics, setRecordingAreaMetrics] = useState<RecordingBoardAreaMetrics | null>(null);
  const { draggingClipId, getPreviewPatch, startDrag } = useBoardStickerDragController({
    fallbackFontSize: boardFontSize,
    onCommitPatch: onUpdateBoardClip,
  });
  // z-index follows the original A/C writing anchor, not the draggable B lifetime.
  const visibleBoardClips = useMemo(() => {
    return boardClips
      // 编辑态显示全部分片；播放态才按播放头时间窗口过滤
      .filter((clip) => !isPlaying || isBoardClipVisibleAtPlayhead(playheadMs, clip.startMs, clip.hideAtMs))
      .sort(compareBoardClipLayerOrder);
  }, [boardClips, isPlaying, playheadMs]); // 使用useMemo缓存结果

  useEffect(() => {
    if (!draggingClipId) {
      frozenRevealRef.current = null;
    }
  }, [draggingClipId]);

  const recordingBoardClips = useMemo(() => {
    return visibleBoardClips.map((clip) => {
      const previewPatch = getPreviewPatch(clip.id);
      // 编辑态板书已"写完留场"显示全文(reveal=1)；播放态才按播放头逐字 reveal
      const liveRevealProgress = isPlaying ? readBoardClipRevealProgress(clip, playheadMs) : 1;
      const revealProgress =
        draggingClipId === clip.id && frozenRevealRef.current?.clipId === clip.id
          ? frozenRevealRef.current.progress
          : liveRevealProgress;
      const displayRoute = resolveBoardTextDisplayRoute(clip.label.trim());
      const zoneName = getZoneNameFromChainKey(clip.chainKey);
      const zoneOffset = zoneOffsets?.[zoneName];

      return {
        color: clip.color ?? '#111111',
        fontSize: getBoardStickerFontSize(previewPatch?.fontSize ?? clip.fontSize, boardFontSize),
        revealProgress,
        text: displayRoute.text,
        widthPercent: previewPatch?.widthPercent ?? clip.widthPercent ?? DEFAULT_BOARD_STICKER_WIDTH_PERCENT,
        xPercent: (previewPatch?.xPercent ?? clip.xPercent ?? DEFAULT_BOARD_STICKER_X_PERCENT) + (zoneOffset?.xPct ?? 0),
        yPercent: (previewPatch?.yPercent ?? clip.yPercent ?? DEFAULT_BOARD_STICKER_Y_PERCENT) + (zoneOffset?.yPct ?? 0),
      };
    });
  }, [boardFontSize, draggingClipId, getPreviewPatch, isPlaying, playheadMs, visibleBoardClips, zoneOffsets]);

  useEffect(() => {
    let frameId = 0;

    const measure = () => {
      const nextMetrics = readRecordingBoardAreaMetrics(boardAreaRef.current, canvas);
      setRecordingAreaMetrics((current) => (areRecordingAreaMetricsEqual(current, nextMetrics) ? current : nextMetrics));
    };

    const scheduleMeasure = () => {
      window.cancelAnimationFrame(frameId);
      frameId = window.requestAnimationFrame(measure);
    };

    scheduleMeasure();

    const resizeObserver = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(scheduleMeasure) : null;
    const boardArea = boardAreaRef.current;
    const stageElement = boardArea?.closest('.stage-canvas');
    if (boardArea) {
      resizeObserver?.observe(boardArea);
    }
    if (stageElement instanceof HTMLElement) {
      resizeObserver?.observe(stageElement);
    }
    window.addEventListener('resize', scheduleMeasure);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener('resize', scheduleMeasure);
      resizeObserver?.disconnect();
    };
  }, [canvas, recordingBoardClips.length]);

  return (
    <>
      <div className="courseware-board-area" ref={boardAreaRef}>
        {visibleBoardClips.length
          ? visibleBoardClips.map((clip, index) => {
          const previewPatch = getPreviewPatch(clip.id);
          const color = clip.color ?? '#111111';
          const fontSize = getBoardStickerFontSize(previewPatch?.fontSize ?? clip.fontSize, boardFontSize);
          const widthPercent = previewPatch?.widthPercent ?? clip.widthPercent ?? DEFAULT_BOARD_STICKER_WIDTH_PERCENT;
          const xPercent = previewPatch?.xPercent ?? clip.xPercent ?? DEFAULT_BOARD_STICKER_X_PERCENT;
          const yPercent = previewPatch?.yPercent ?? clip.yPercent ?? DEFAULT_BOARD_STICKER_Y_PERCENT;
          const zoneName = getZoneNameFromChainKey(clip.chainKey);
          // @cleanroom-fix 2026-06-07: 贴纸跟随分片容器一起挪
          const zoneOffset = zoneOffsets?.[zoneName];
          const effectiveXPercent = zoneOffset ? xPercent + zoneOffset.xPct : xPercent;
          const effectiveYPercent = zoneOffset ? yPercent + zoneOffset.yPct : yPercent;

          // 编辑态板书已"写完留场"显示全文(reveal=1)；播放态才按播放头逐字 reveal
          const liveRevealProgress = isPlaying ? readBoardClipRevealProgress(clip, playheadMs) : 1;
          const revealProgress =
            draggingClipId === clip.id && frozenRevealRef.current?.clipId === clip.id
              ? frozenRevealRef.current.progress
              : liveRevealProgress;

          return (
            <BoardTextSticker
              color={color}
              isDragging={draggingClipId === clip.id}
              isSelected={selectedBoardClipId === clip.id}
              key={clip.id}
              onPointerDown={(event) => {
                const areaRect = boardAreaRef.current?.getBoundingClientRect();
                if (!areaRect) {
                  return;
                }
                event.preventDefault();
                event.currentTarget.setPointerCapture(event.pointerId);
                frozenRevealRef.current = {
                  clipId: clip.id,
                  progress: liveRevealProgress,
                };
                onSelectBoardClip(clip.id);
                startDrag({
                  areaRect,
                  clipId: clip.id,
                  mode: 'move',
                  originClientX: event.clientX,
                  originClientY: event.clientY,
                  originFontSize: getBoardStickerFontSize(clip.fontSize, boardFontSize),
                  originXPercent: clip.xPercent ?? DEFAULT_BOARD_STICKER_X_PERCENT,
                  originYPercent: clip.yPercent ?? DEFAULT_BOARD_STICKER_Y_PERCENT,
                  originWidthPercent: clip.widthPercent ?? DEFAULT_BOARD_STICKER_WIDTH_PERCENT,
                });
              }}
              onResizePointerDown={(event) => {
                const areaRect = boardAreaRef.current?.getBoundingClientRect();
                if (!areaRect) {
                  return;
                }
                event.preventDefault();
                event.stopPropagation();
                const resizeHandle = event.currentTarget;
                if (resizeHandle.parentElement instanceof HTMLButtonElement) {
                  resizeHandle.parentElement.setPointerCapture(event.pointerId);
                }
                frozenRevealRef.current = {
                  clipId: clip.id,
                  progress: liveRevealProgress,
                };
                onSelectBoardClip(clip.id);
                startDrag({
                  areaRect,
                  clipId: clip.id,
                  mode: 'resize',
                  originClientX: event.clientX,
                  originClientY: event.clientY,
                  originFontSize: getBoardStickerFontSize(clip.fontSize, boardFontSize),
                  originXPercent: clip.xPercent ?? DEFAULT_BOARD_STICKER_X_PERCENT,
                  originYPercent: clip.yPercent ?? DEFAULT_BOARD_STICKER_Y_PERCENT,
                  originWidthPercent: clip.widthPercent ?? DEFAULT_BOARD_STICKER_WIDTH_PERCENT,
                });
              }}
              stackIndex={index}
              fontFamily={canvas.boardFontFamily}
              fontLoadKey={boardFontLoadKey}
              fontSize={fontSize}
              revealProgress={revealProgress}
              text={clip.label.trim()}
              widthPercent={widthPercent}
              xPercent={effectiveXPercent}
              yPercent={effectiveYPercent}
              zoneKey={zoneName}
            />
          );
          })
          : null}
      </div>
      <KonvaBoardContentRecordingSurface
        canvas={canvas}
        clips={recordingBoardClips}
        fontFamily={canvas.boardFontFamily}
        metrics={recordingAreaMetrics}
        onCanvasReady={onRecordingCanvasReady}
      />
    </>
  );
}

type RecordingBoardAreaMetrics = {
  height: number;
  left: number;
  scaleY: number;
  top: number;
  width: number;
};

type RecordingBoardClip = {
  color: string;
  fontSize: number;
  revealProgress: number;
  text: string;
  widthPercent: number;
  xPercent: number;
  yPercent: number;
};

function KonvaBoardContentRecordingSurface({
  canvas,
  clips,
  fontFamily,
  metrics,
  onCanvasReady,
}: {
  canvas: StageCanvasConfig;
  clips: RecordingBoardClip[];
  fontFamily: string;
  metrics: RecordingBoardAreaMetrics | null;
  onCanvasReady?: (canvas: HTMLCanvasElement | null) => void;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const canvasElement = containerRef.current?.querySelector('canvas') as HTMLCanvasElement | null;
    onCanvasReady?.(canvasElement);
    return () => onCanvasReady?.(null);
  }, [canvas.height, canvas.width, onCanvasReady]);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      data-canvas-recording-surface="konva-c-content"
      style={{
        height: 1,
        left: 0,
        opacity: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        position: 'absolute',
        top: 0,
        width: 1,
      }}
    >
      <Stage height={canvas.height} width={canvas.width}>
        <Layer listening={false}>
          {metrics
            ? clips.map((clip, index) => {
              const layout = createKonvaTextLayout(clip, metrics);
              const progress = Math.min(1, Math.max(0, Number.isFinite(clip.revealProgress) ? clip.revealProgress : 1));

              return (
                <Group
                  key={`${index}-${clip.text}`}
                  clipHeight={layout.height}
                  clipWidth={layout.width * progress}
                  clipX={layout.left}
                  clipY={layout.top}
                >
                  <Text
                    fill={clip.color}
                    fontFamily={fontFamily}
                    fontSize={layout.fontSize}
                    height={layout.height}
                    lineHeight={RECORDING_TEXT_LINE_HEIGHT_RATIO}
                    padding={layout.padding}
                    text={clip.text}
                    width={layout.width}
                    wrap="char"
                    x={layout.left}
                    y={layout.top}
                  />
                </Group>
              );
            })
            : null}
        </Layer>
      </Stage>
    </div>
  );
}

function readRecordingBoardAreaMetrics(
  boardArea: HTMLDivElement | null,
  canvas: StageCanvasConfig,
): RecordingBoardAreaMetrics | null {
  const stageElement = boardArea?.closest('.stage-canvas');
  const stageRect = stageElement?.getBoundingClientRect();
  const areaRect = boardArea?.getBoundingClientRect();
  if (!stageRect || !areaRect || stageRect.width <= 0 || stageRect.height <= 0 || areaRect.width <= 0 || areaRect.height <= 0) {
    return null;
  }

  const scaleX = canvas.width / stageRect.width;
  const scaleY = canvas.height / stageRect.height;

  return {
    height: areaRect.height * scaleY,
    left: (areaRect.left - stageRect.left) * scaleX,
    scaleY,
    top: (areaRect.top - stageRect.top) * scaleY,
    width: areaRect.width * scaleX,
  };
}

function areRecordingAreaMetricsEqual(
  previous: RecordingBoardAreaMetrics | null,
  next: RecordingBoardAreaMetrics | null,
) {
  if (!previous || !next) {
    return previous === next;
  }

  return (
    previous.height === next.height &&
    previous.left === next.left &&
    previous.scaleY === next.scaleY &&
    previous.top === next.top &&
    previous.width === next.width
  );
}

function createKonvaTextLayout(clip: RecordingBoardClip, metrics: RecordingBoardAreaMetrics) {
  const width = metrics.width * (clip.widthPercent / 100);
  const fontSize = Math.max(1, clip.fontSize * metrics.scaleY);
  const padding = Math.max(1, RECORDING_TEXT_PADDING_X * metrics.scaleY);
  const lineHeightPx = fontSize * RECORDING_TEXT_LINE_HEIGHT_RATIO;
  const textHeight = estimateKonvaTextHeight(clip.text, fontSize, width - padding * 2) + RECORDING_TEXT_PADDING_Y * metrics.scaleY * 2;
  const height = Math.max(lineHeightPx, textHeight);
  // @xiaxia-2026-06-08 左上角定位：xPercent/yPercent 是内容左上角(与 DOM 去掉 translate 后一致)，
  // 不再 -width/2 / -height/2 回中心。DOM 与录制同一套左上角坐标系。
  const left = metrics.left + metrics.width * (clip.xPercent / 100);
  const top = metrics.top + metrics.height * (clip.yPercent / 100);

  return {
    fontSize,
    height,
    left,
    padding,
    top,
    width,
  };
}

function estimateKonvaTextHeight(text: string, fontSize: number, maxWidth: number) {
  const averageCharWidth = Math.max(1, fontSize);
  const charsPerLine = Math.max(1, Math.floor(Math.max(1, maxWidth) / averageCharWidth));

  const lineCount = text
    .split('\n')
    .reduce((count, line) => count + Math.max(1, Math.ceil(Array.from(line || ' ').length / charsPerLine)), 0);

  return lineCount * fontSize * RECORDING_TEXT_LINE_HEIGHT_RATIO;
}

function readBoardClipRevealProgress(
  clip: TimelineClip,
  playheadMs: number,
) {
  return getBoardRevealProgress({
    drawSpeed: clip.drawSpeed,
    playheadMs,
    revealEndMs: clip.revealEndMs ?? clip.sourceEndMs ?? clip.endMs,
    revealStartMs: clip.revealStartMs ?? clip.sourceStartMs ?? clip.startMs,
  });
}

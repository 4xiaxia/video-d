// @@COMP_HANDWRITING
// @cleanroom-component: AutoHandwritingLayer
// @domain: drawboard-stage/c1-auto-handwriting
// @slot: drawboard-stage/c1-actor-layer
// @depends: TimelineClip(kind=board), StageCanvasConfig.boardFontFamily, BoardTextSticker, react-konva
// @io-input: boardClips, playheadMs, selectedBoardClipId, boardFontLoadKey
// @io-output: onSelectBoardClip, onUpdateBoardClip(C visual fontSize)
// @boundary: C1 automatic board actor only; B timing and A audio stay outside this component
// @recording-contract: C content recording uses Konva Text canvas; ordinary C is realtime text, not PNG or hand-written Canvas2D fillText.
// @xiaxia-2026-06-08 返璞归真：板书内容按分区容器+文档流<p>排列，就是PPT排版。
//   容器可整体拖动（PPT移动文本框），内容在容器内按顺序排，一行写完换行再一行。

import { useEffect, useMemo, useRef, useState } from 'react';
import { Group, Layer, Stage, Text } from 'react-konva';
import type { StageCanvasConfig, TimelineClip } from '../domain/teachingProject';
import { getBoardRevealProgress } from '../modules/boardReveal';
import { compareBoardClipLayerOrder } from '../modules/boardOrdering';
import type { CoursewareZoneKey } from '../modules/canvasStage/coursewareZoneLayout';
import { COURSEWARE_ZONE_KEYS, getZoneNameFromChainKey } from '../modules/canvasStage/coursewareZoneLayout';
import {
  getBoardStickerFontSize,
  resolveBoardTextDisplayRoute,
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
  /** 分片标签拖动偏移(百分比)，容器跟随一起挪 */
  zoneOffsets?: Partial<Record<CoursewareZoneKey, { xPct: number; yPct: number }>>;
  onRecordingCanvasReady?: (canvas: HTMLCanvasElement | null) => void;
  onSelectBoardClip: (clipId: string) => void;
  onUpdateBoardClip: (clipId: string, patch: BoardClipPatch) => void;
}) {
  const boardAreaRef = useRef<HTMLDivElement | null>(null);
  const [recordingAreaMetrics, setRecordingAreaMetrics] = useState<RecordingBoardAreaMetrics | null>(null);

  // 编辑态显示全部；播放态按播放头过滤
  const visibleBoardClips = useMemo(() => {
    return boardClips
      .filter((clip) => !isPlaying || isBoardClipVisibleAtPlayhead(playheadMs, clip.startMs, clip.hideAtMs))
      .sort(compareBoardClipLayerOrder);
  }, [boardClips, isPlaying, playheadMs]);

  // 按 zone 分组——每个分区是一个容器，里面的板书按顺序排
  const clipsByZone = useMemo(() => {
    const groups: Record<CoursewareZoneKey, TimelineClip[]> = {
      problem: [],
      analysis: [],
      solution: [],
      summary: [],
    };
    for (const clip of visibleBoardClips) {
      const zone = getZoneNameFromChainKey(clip.chainKey);
      groups[zone].push(clip);
    }
    return groups;
  }, [visibleBoardClips]);

  // 录制用数据
  const recordingBoardClips = useMemo(() => {
    return visibleBoardClips.map((clip) => {
      const liveRevealProgress = isPlaying ? readBoardClipRevealProgress(clip, playheadMs) : 1;
      const displayRoute = resolveBoardTextDisplayRoute(clip.label.trim());
      const zoneName = getZoneNameFromChainKey(clip.chainKey);
      const zoneOffset = zoneOffsets?.[zoneName];

      return {
        color: clip.color ?? '#111111',
        fontSize: getBoardStickerFontSize(clip.fontSize, boardFontSize),
        revealProgress: liveRevealProgress,
        text: displayRoute.text,
        widthPercent: clip.widthPercent ?? 100,
        xPercent: (clip.xPercent ?? 0) + (zoneOffset?.xPct ?? 0),
        yPercent: (clip.yPercent ?? 0) + (zoneOffset?.yPct ?? 0),
      };
    });
  }, [boardFontSize, isPlaying, playheadMs, visibleBoardClips, zoneOffsets]);

  // 测量录制区域
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
        {COURSEWARE_ZONE_KEYS.map((zoneKey) => {
          const zoneClips = clipsByZone[zoneKey];
          if (!zoneClips.length) return null;

          const zoneOffset = zoneOffsets?.[zoneKey];
          const offsetStyle = zoneOffset
            ? { transform: `translate(${zoneOffset.xPct}%, ${zoneOffset.yPct}%)` }
            : undefined;

          return (
            <div
              key={zoneKey}
              className={`board-zone-container board-zone-container--${zoneKey}`}
              data-zone={zoneKey}
              style={offsetStyle}
            >
              {zoneClips.map((clip) => {
                const liveRevealProgress = isPlaying ? readBoardClipRevealProgress(clip, playheadMs) : 1;
                const fontSize = getBoardStickerFontSize(clip.fontSize, boardFontSize);
                const zoneName = getZoneNameFromChainKey(clip.chainKey);

                return (
                  <BoardTextSticker
                    color={clip.color ?? '#111111'}
                    fontFamily={canvas.boardFontFamily}
                    fontLoadKey={boardFontLoadKey}
                    fontSize={fontSize}
                    isSelected={selectedBoardClipId === clip.id}
                    key={clip.id}
                    onClick={() => onSelectBoardClip(clip.id)}
                    revealProgress={liveRevealProgress}
                    text={clip.label.trim()}
                    zoneKey={zoneName}
                  />
                );
              })}
            </div>
          );
        })}
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

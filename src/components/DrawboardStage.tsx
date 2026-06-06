// @cleanroom-component: DrawboardStage
// @domain: drawboard-stage
// @slot: center-stage/drawboard-home
// @depends: StageCanvasConfig, TeachingAsset(problemText)
// @io-input: canvas, problemText, boardFontSize, children layers
// @io-output: rendered stage container for recording
// @boundary: layout/recording house only; does not own A audio, B timing, or C1/C2 internals
// @content-contract: courseware labels and problem text are non-handwriting chrome, rendered with the system font stack; handwriting board content lives in child C layers only.

import type { CSSProperties, ReactNode, RefObject } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { StageCanvasConfig, TeachingAsset } from '../domain/teachingProject';
import { createCoursewareChromeStyleVars } from '../modules/canvasStage/coursewareChrome';
import type { CoursewareZoneBoxRecord, CoursewareZoneKey } from '../modules/canvasStage/coursewareZoneLayout';
import {
  buildCoursewareZoneBoxesFromDom,
  COURSEWARE_ZONE_KEYS,
  createFallbackCoursewareZoneBoxes,
} from '../modules/canvasStage/coursewareZoneLayout';
import type { BoardStageToolMode, StageRecordingCanvases } from './drawboardStageTypes';
import { BoardStageToolOverlay } from './BoardStageToolOverlay';
import { CanvasRecordingSurface } from './CanvasRecordingSurface';
import { GoldenFingerCanvasLayer, type GoldenFingerCanvasLayerHandle } from './GoldenFingerCanvasLayer';
import { MathText } from './MathText';

export function DrawboardStage({
  activeToolMode,
  boardFontSize,
  canvas,
  children,
  onClearGoldenFinger,
  onChangeStrokeColor,
  onChangeStrokeWidth,
  onChangeToolMode,
  onGoldenFingerLayerReady,
  onRecordingCanvasesReady,
  onUndoGoldenFinger,
  problemText,
  stageRef,
  strokeColor,
  strokeWidth,
}: {
  activeToolMode: BoardStageToolMode;
  boardFontSize: number;
  canvas: StageCanvasConfig;
  children: ReactNode;
  onClearGoldenFinger?: () => void;
  onChangeStrokeColor?: (color: string) => void;
  onChangeStrokeWidth?: (width: number) => void;
  onChangeToolMode?: (mode: BoardStageToolMode) => void;
  onGoldenFingerLayerReady?: (handle: GoldenFingerCanvasLayerHandle | null) => void;
  /** 暴露底图 canvas + 金手指 canvas 给录制模块做合成录制 */
  onRecordingCanvasesReady?: (canvases: Omit<StageRecordingCanvases, 'content'> | null) => void;
  onUndoGoldenFinger?: () => void;
  problemText: TeachingAsset | undefined;
  stageRef: RefObject<HTMLDivElement | null>;
  strokeColor: string;
  strokeWidth: number;
}) {
  const problemSummary = problemText?.summary.trim();
  const [baseCanvasEl, setBaseCanvasEl] = useState<HTMLCanvasElement | null>(null);
  const [autoZoneBoxes, setAutoZoneBoxes] = useState<CoursewareZoneBoxRecord>(() => createFallbackCoursewareZoneBoxes());
  const [draggingZoneKey, setDraggingZoneKey] = useState<CoursewareZoneKey | null>(null);
  const [labelOverrides, setLabelOverrides] = useState<Partial<Record<CoursewareZoneKey, { leftRatio: number; topRatio: number }>>>({});
  const dragStateRef = useRef<{
    key: CoursewareZoneKey;
    originClientX: number;
    originClientY: number;
    originLeftRatio: number;
    originTopRatio: number;
  } | null>(null);
  const overlayContainerRef = useRef<HTMLDivElement | null>(null);
  /** 画笔层是否需要拦截事件：pen/eraser/highlight/circle/cross 时拦截，off 时穿透给 C 层 */
  const canDrawOverlay = activeToolMode !== 'off';

  /** callback ref 替代 useRef + useEffect 中间层，直接通知父组件 GoldenFinger handle 就绪 */
  const goldenFingerCallbackRef = useCallback(
    (handle: GoldenFingerCanvasLayerHandle | null) => {
      onGoldenFingerLayerReady?.(handle);
    },
    [onGoldenFingerLayerReady],
  );

  // 收集底图 canvas 和金手指 canvas，向上通知录制模块
  const syncRecordingCanvases = useCallback(() => {
    const overlayCanvas = overlayContainerRef.current?.querySelector('.golden-finger-canvas-layer') as HTMLCanvasElement | null;
    if (baseCanvasEl && overlayCanvas) {
      onRecordingCanvasesReady?.({ base: baseCanvasEl, overlay: overlayCanvas });
    }
  }, [baseCanvasEl, onRecordingCanvasesReady]);

  useEffect(() => {
    syncRecordingCanvases();
  }, [syncRecordingCanvases]);

  useEffect(() => {
    const stageElement = stageRef.current;
    if (!stageElement) {
      return;
    }

    const frameId = window.requestAnimationFrame(() => {
      const stageRect = stageElement.getBoundingClientRect();
      const problemRect = stageElement.querySelector('.stage-problem-text')?.getBoundingClientRect() ?? null;
      const stickerRectsByZone = Object.fromEntries(
        COURSEWARE_ZONE_KEYS.map((zoneKey) => [
          zoneKey,
          Array.from(stageElement.querySelectorAll(`.board-text-sticker--zone-${zoneKey}`)).map((node) =>
            node.getBoundingClientRect(),
          ),
        ]),
      ) as Parameters<typeof buildCoursewareZoneBoxesFromDom>[0]['stickerRectsByZone'];

      const nextZoneBoxes = buildCoursewareZoneBoxesFromDom({
        problemRect,
        stageRect,
        stickerRectsByZone,
      });

      setAutoZoneBoxes((current) => (areZoneBoxesEqual(current, nextZoneBoxes) ? current : nextZoneBoxes));
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [children, problemSummary, stageRef]);

  const zoneBoxes = useMemo(() => {
    const nextBoxes = createFallbackCoursewareZoneBoxes();
    for (const zoneKey of COURSEWARE_ZONE_KEYS) {
      const box = autoZoneBoxes[zoneKey];
      const override = labelOverrides[zoneKey];
      nextBoxes[zoneKey] = override
        ? {
            ...box,
            labelAnchor: 'left',
            labelLeftRatio: override.leftRatio,
            labelTopRatio: override.topRatio,
          }
        : box;
    }
    return nextBoxes;
  }, [autoZoneBoxes, labelOverrides]);

  useEffect(() => {
    if (!draggingZoneKey) {
      return;
    }

    const handlePointerMove = (event: PointerEvent) => {
      const dragState = dragStateRef.current;
      const stageElement = stageRef.current;
      if (!dragState || !stageElement) {
        return;
      }

      const stageRect = stageElement.getBoundingClientRect();
      setLabelOverrides((current) => ({
        ...current,
        [dragState.key]: {
          leftRatio: clampRatio(
            dragState.originLeftRatio + ((event.clientX - dragState.originClientX) / Math.max(1, stageRect.width)),
          ),
          topRatio: clampRatio(
            dragState.originTopRatio + ((event.clientY - dragState.originClientY) / Math.max(1, stageRect.height)),
          ),
        },
      }));
    };

    const handlePointerUp = () => {
      dragStateRef.current = null;
      setDraggingZoneKey(null);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [draggingZoneKey, stageRef]);

  const startLabelDrag = useCallback(
    (zoneKey: CoursewareZoneKey, event: React.PointerEvent<HTMLDivElement>) => {
      const zoneBox = zoneBoxes[zoneKey];
      dragStateRef.current = {
        key: zoneKey,
        originClientX: event.clientX,
        originClientY: event.clientY,
        originLeftRatio: zoneBox.labelLeftRatio,
        originTopRatio: zoneBox.labelTopRatio,
      };
      event.preventDefault();
      event.stopPropagation();
      event.currentTarget.setPointerCapture(event.pointerId);
      setDraggingZoneKey(zoneKey);
    },
    [zoneBoxes],
  );

  return (
    <div className="drawboard-stage-shell">
      <BoardStageToolOverlay
        activeColor={strokeColor}
        activeStrokeWidth={strokeWidth}
        activeToolMode={activeToolMode}
        onChangeColor={(color) => onChangeStrokeColor?.(color)}
        onChangeStrokeWidth={(width) => onChangeStrokeWidth?.(width)}
        onChangeToolMode={(mode) => onChangeToolMode?.(mode)}
        onClear={() => onClearGoldenFinger?.()}
        onUndo={() => onUndoGoldenFinger?.()}
      />
      <div
        ref={stageRef}
        className="stage-canvas stage-canvas--courseware"
        style={{
          ...createCoursewareChromeStyleVars(canvas),
          aspectRatio: `${canvas.width} / ${canvas.height}`,
          background: canvas.background,
          '--board-font-size': `${boardFontSize}px`,
          '--board-handwriting-font': canvas.boardFontFamily,
        } as CSSProperties}
      >
        <CanvasRecordingSurface
          canvas={canvas}
          onCanvasReady={setBaseCanvasEl}
          problemSummary={problemSummary}
          zoneBoxes={zoneBoxes}
        />
        {Object.values(zoneBoxes).map((zoneBox) =>
          zoneBox.hasContent ? (
            <div
              key={zoneBox.key}
              aria-hidden="true"
              className="courseware-zone-box"
              style={{
                left: `${zoneBox.leftRatio * 100}%`,
                top: `${zoneBox.topRatio * 100}%`,
                width: `${zoneBox.widthRatio * 100}%`,
                height: `${zoneBox.heightRatio * 100}%`,
              }}
            />
          ) : null,
        )}
        <div
          className="courseware-label courseware-label--problem"
          data-dragging={draggingZoneKey === 'problem'}
          data-anchor={zoneBoxes.problem.labelAnchor}
          onPointerDown={(event) => startLabelDrag('problem', event)}
          style={{
            left: `${zoneBoxes.problem.labelLeftRatio * 100}%`,
            top: `${zoneBoxes.problem.labelTopRatio * 100}%`,
          }}
        >
          {zoneBoxes.problem.label}
        </div>
        <div
          className="courseware-label courseware-label--analysis"
          data-dragging={draggingZoneKey === 'analysis'}
          data-anchor={zoneBoxes.analysis.labelAnchor}
          onPointerDown={(event) => startLabelDrag('analysis', event)}
          style={{
            left: `${zoneBoxes.analysis.labelLeftRatio * 100}%`,
            top: `${zoneBoxes.analysis.labelTopRatio * 100}%`,
          }}
        >
          {zoneBoxes.analysis.label}
        </div>
        <div
          className="courseware-label courseware-label--solution"
          data-dragging={draggingZoneKey === 'solution'}
          data-anchor={zoneBoxes.solution.labelAnchor}
          onPointerDown={(event) => startLabelDrag('solution', event)}
          style={{
            left: `${zoneBoxes.solution.labelLeftRatio * 100}%`,
            top: `${zoneBoxes.solution.labelTopRatio * 100}%`,
          }}
        >
          {zoneBoxes.solution.label}
        </div>
        <div
          className="courseware-label courseware-label--summary"
          data-dragging={draggingZoneKey === 'summary'}
          data-anchor={zoneBoxes.summary.labelAnchor}
          onPointerDown={(event) => startLabelDrag('summary', event)}
          style={{
            left: `${zoneBoxes.summary.labelLeftRatio * 100}%`,
            top: `${zoneBoxes.summary.labelTopRatio * 100}%`,
          }}
        >
          {zoneBoxes.summary.label}
        </div>
        <div className="courseware-problem-area">
          {problemSummary ? (
            <MathText as="p" className="stage-problem-text">
              {problemSummary}
            </MathText>
          ) : null}
        </div>
        {children}
        <div ref={overlayContainerRef} style={{ position: 'absolute', inset: 0, zIndex: 2, pointerEvents: canDrawOverlay ? 'auto' : 'none' }}>
          <GoldenFingerCanvasLayer
            ref={goldenFingerCallbackRef}
            activeToolMode={activeToolMode}
            strokeColor={strokeColor}
            strokeWidth={strokeWidth}
          />
        </div>
      </div>
    </div>
  );
}

function areZoneBoxesEqual(previous: CoursewareZoneBoxRecord, next: CoursewareZoneBoxRecord) {
  return COURSEWARE_ZONE_KEYS.every((zoneKey) => {
    const before = previous[zoneKey];
    const after = next[zoneKey];
    return (
      before.hasContent === after.hasContent &&
      before.heightRatio === after.heightRatio &&
      before.labelAnchor === after.labelAnchor &&
      before.labelLeftRatio === after.labelLeftRatio &&
      before.labelTopRatio === after.labelTopRatio &&
      before.leftRatio === after.leftRatio &&
      before.topRatio === after.topRatio &&
      before.widthRatio === after.widthRatio
    );
  });
}

function clampRatio(value: number) {
  return Math.min(0.98, Math.max(0, value));
}

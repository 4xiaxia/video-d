// @cleanroom-component: DrawboardStage
// @domain: drawboard-stage
// @slot: center-stage/drawboard-home
// @depends: StageCanvasConfig, TeachingAsset(problemText)
// @io-input: canvas, problemText, boardFontSize, children layers
// @io-output: rendered stage container for recording
// @boundary: layout/recording house only; does not own A audio, B timing, or C1/C2 internals
// @content-contract: courseware labels and problem text are non-handwriting chrome, rendered with the system font stack; handwriting board content lives in child C layers only.

import type { CSSProperties, ReactNode, RefObject } from 'react';
import { Children, cloneElement, isValidElement, useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import { CoursewareSegmentChrome } from './CoursewareSegmentChrome';
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
  // @xiaxia-stage-problem-truth: stage problem chrome reads problemText.summary only; opening boardSlice never overrides this node.
  const problemSummary = problemText?.summary.trim();
  const [baseCanvasEl, setBaseCanvasEl] = useState<HTMLCanvasElement | null>(null);
  const [autoZoneBoxes, setAutoZoneBoxes] = useState<CoursewareZoneBoxRecord>(() => createFallbackCoursewareZoneBoxes());
  const [draggingZoneKey, setDraggingZoneKey] = useState<CoursewareZoneKey | null>(null);
  const [labelOverrides, setLabelOverrides] = useState<Partial<Record<CoursewareZoneKey, {
    leftRatio: number;
    topRatio: number;
    /** @cleanroom-fix 2026-06-07: 标签拖动联动容器全家挪 */
    containerLeftRatio: number;
    containerTopRatio: number;
  }>>>({});
  const dragStateRef = useRef<{
    key: CoursewareZoneKey;
    originClientX: number;
    originClientY: number;
    originLeftRatio: number;
    originTopRatio: number;
    originContainerLeftRatio: number;
    originContainerTopRatio: number;
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
            // @cleanroom-fix 2026-06-07: 容器坐标跟随标签拖动一起挪
            leftRatio: override.containerLeftRatio,
            topRatio: override.containerTopRatio,
          }
        : box;
    }
    return nextBoxes;
  }, [autoZoneBoxes, labelOverrides]);

  // @cleanroom-fix 2026-06-07: 计算标签拖动产生的分片偏移量(百分比)，
  // 传递给 C 贴纸层(AutoHandwritingLayer)，使贴纸跟随容器一起挪
  const zoneOffsets = useMemo(() => {
    const offsets: Partial<Record<CoursewareZoneKey, { xPct: number; yPct: number }>> = {};
    for (const zoneKey of COURSEWARE_ZONE_KEYS) {
      const override = labelOverrides[zoneKey];
      if (override) {
        const originBox = autoZoneBoxes[zoneKey];
        offsets[zoneKey] = {
          xPct: (override.containerLeftRatio - originBox.leftRatio) * 100,
          yPct: (override.containerTopRatio - originBox.topRatio) * 100,
        };
      }
    }
    return offsets;
  }, [autoZoneBoxes, labelOverrides]);

  const enhancedChildren = useMemo(() => {
    return Children.map(children, (child) => {
      if (isValidElement(child) && child.type && typeof child.type !== 'string') {
        return cloneElement(child as React.ReactElement<any>, { zoneOffsets });
      }
      return child;
    });
  }, [children, zoneOffsets]);

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
      const deltaLeftRatio = (event.clientX - dragState.originClientX) / Math.max(1, stageRect.width);
      const deltaTopRatio = (event.clientY - dragState.originClientY) / Math.max(1, stageRect.height);
      setLabelOverrides((current) => ({
        ...current,
        [dragState.key]: {
          leftRatio: clampRatio(dragState.originLeftRatio + deltaLeftRatio),
          topRatio: clampRatio(dragState.originTopRatio + deltaTopRatio),
          // @cleanroom-fix 2026-06-07: 容器坐标跟随标签拖动一起挪
          containerLeftRatio: clampRatio(dragState.originContainerLeftRatio + deltaLeftRatio),
          containerTopRatio: clampRatio(dragState.originContainerTopRatio + deltaTopRatio),
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
        // @cleanroom-fix 2026-06-07: 记录容器初始位置，拖动时联动
        originContainerLeftRatio: zoneBox.leftRatio,
        originContainerTopRatio: zoneBox.topRatio,
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
        {COURSEWARE_ZONE_KEYS.map((zoneKey) => (
          <CoursewareSegmentChrome
            key={zoneKey}
            isDragging={draggingZoneKey === zoneKey}
            onLabelPointerDown={(event) => startLabelDrag(zoneKey, event)}
            zoneBox={zoneBoxes[zoneKey]}
          />
        ))}
        <div
          className="courseware-problem-area"
          data-agent-anchor="stage-problem-area"
          data-agent-truth-field="problemText.summary"
          data-role="problem-truth-render"
        >
          {problemSummary ? (
            <MathText
              as="p"
              className="stage-problem-text"
              data-agent-anchor="stage-problem-text"
              data-agent-truth-field="problemText.summary"
              data-role="problem-truth-render-text"
            >
              {problemSummary}
            </MathText>
          ) : null}
        </div>
        {enhancedChildren}
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

// @cleanroom-component: CanvasRecordingSurface
// @domain: canvas-recording-stage
// @slot: drawboard-stage/canvas-recording-foundation
// @depends: StageCanvasConfig, drawCoursewareStageFrame
// @io-input: canvas
// @io-output: real HTMLCanvasElement recording surface
// @boundary: Canvas recording surface only; does not own A audio, B timing, C1/C2 actors, or editor state

import { useEffect, useRef } from 'react';
import type { StageCanvasConfig } from '../domain/teachingProject';
import type { CoursewareZoneBoxRecord } from '../modules/canvasStage/coursewareZoneLayout';
import { drawCoursewareStageFrame } from '../modules/canvasStage/drawCoursewareStageFrame';

export function CanvasRecordingSurface({
  canvas,
  onCanvasReady,
  problemSummary,
  zoneBoxes,
}: {
  canvas: StageCanvasConfig;
  /** 暴露底图 canvas DOM 元素，供合成录制使用 */
  onCanvasReady?: (el: HTMLCanvasElement | null) => void;
  problemSummary?: string;
  zoneBoxes?: CoursewareZoneBoxRecord;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const recordingCanvas = canvasRef.current;
    const context = recordingCanvas?.getContext('2d');
    if (!recordingCanvas || !context) {
      return;
    }

    recordingCanvas.width = canvas.width;
    recordingCanvas.height = canvas.height;
    drawCoursewareStageFrame(context, canvas, problemSummary, zoneBoxes);
  }, [canvas, problemSummary, zoneBoxes]);

  useEffect(() => {
    onCanvasReady?.(canvasRef.current);
    return () => onCanvasReady?.(null);
  }, [onCanvasReady]);

  return (
    <canvas
      aria-hidden="true"
      className="canvas-recording-surface"
      data-canvas-recording-surface="foundation"
      ref={canvasRef}
    />
  );
}

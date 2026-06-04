import { jsx as _jsx } from "react/jsx-runtime";
// @cleanroom-component: CanvasRecordingSurface
// @domain: canvas-recording-stage
// @slot: drawboard-stage/canvas-recording-foundation
// @depends: StageCanvasConfig, drawCoursewareStageFrame
// @io-input: canvas
// @io-output: real HTMLCanvasElement recording surface
// @boundary: Canvas recording surface only; does not own A audio, B timing, C1/C2 actors, or editor state
import { useEffect, useRef } from 'react';
import { drawCoursewareStageFrame } from '../modules/canvasStage/drawCoursewareStageFrame';
export function CanvasRecordingSurface({ canvas, onCanvasReady, problemSummary, }) {
    const canvasRef = useRef(null);
    useEffect(() => {
        const recordingCanvas = canvasRef.current;
        const context = recordingCanvas?.getContext('2d');
        if (!recordingCanvas || !context) {
            return;
        }
        recordingCanvas.width = canvas.width;
        recordingCanvas.height = canvas.height;
        drawCoursewareStageFrame(context, canvas, problemSummary);
    }, [canvas, problemSummary]);
    useEffect(() => {
        onCanvasReady?.(canvasRef.current);
        return () => onCanvasReady?.(null);
    }, [onCanvasReady]);
    return (_jsx("canvas", { "aria-hidden": "true", className: "canvas-recording-surface", "data-canvas-recording-surface": "foundation", ref: canvasRef }));
}

import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useEffect, useRef, useState } from 'react';
import { createCoursewareChromeStyleVars } from '../modules/canvasStage/coursewareChrome';
import { BoardStageToolOverlay } from './BoardStageToolOverlay';
import { CanvasRecordingSurface } from './CanvasRecordingSurface';
import { GoldenFingerCanvasLayer } from './GoldenFingerCanvasLayer';
import { MathText } from './MathText';
export function DrawboardStage({ activeToolMode, boardFontSize, canvas, children, onClearGoldenFinger, onChangeStrokeColor, onChangeStrokeWidth, onChangeToolMode, onGoldenFingerLayerReady, onRecordingCanvasesReady, onUndoGoldenFinger, problemText, stageRef, strokeColor, strokeWidth, }) {
    const problemSummary = problemText?.summary.trim();
    const [baseCanvasEl, setBaseCanvasEl] = useState(null);
    const overlayContainerRef = useRef(null);
    /** 画笔层是否需要拦截事件：pen/eraser/highlight/circle/cross 时拦截，off 时穿透给 C 层 */
    const canDrawOverlay = activeToolMode !== 'off';
    /** callback ref 替代 useRef + useEffect 中间层，直接通知父组件 GoldenFinger handle 就绪 */
    const goldenFingerCallbackRef = useCallback((handle) => {
        onGoldenFingerLayerReady?.(handle);
    }, [onGoldenFingerLayerReady]);
    // 收集底图 canvas 和金手指 canvas，向上通知录制模块
    const syncRecordingCanvases = useCallback(() => {
        const overlayCanvas = overlayContainerRef.current?.querySelector('.golden-finger-canvas-layer');
        if (baseCanvasEl && overlayCanvas) {
            onRecordingCanvasesReady?.({ base: baseCanvasEl, overlay: overlayCanvas });
        }
    }, [baseCanvasEl, onRecordingCanvasesReady]);
    useEffect(() => {
        syncRecordingCanvases();
    }, [syncRecordingCanvases]);
    return (_jsxs("div", { className: "drawboard-stage-shell", children: [_jsx(BoardStageToolOverlay, { activeColor: strokeColor, activeStrokeWidth: strokeWidth, activeToolMode: activeToolMode, onChangeColor: (color) => onChangeStrokeColor?.(color), onChangeStrokeWidth: (width) => onChangeStrokeWidth?.(width), onChangeToolMode: (mode) => onChangeToolMode?.(mode), onClear: () => onClearGoldenFinger?.(), onUndo: () => onUndoGoldenFinger?.() }), _jsxs("div", { ref: stageRef, className: "stage-canvas stage-canvas--courseware", style: {
                    ...createCoursewareChromeStyleVars(canvas),
                    aspectRatio: `${canvas.width} / ${canvas.height}`,
                    background: canvas.background,
                    '--board-font-size': `${boardFontSize}px`,
                    '--board-handwriting-font': canvas.boardFontFamily,
                }, children: [_jsx(CanvasRecordingSurface, { canvas: canvas, onCanvasReady: setBaseCanvasEl, problemSummary: problemSummary }), _jsx("div", { className: "courseware-label courseware-label--problem", children: "\u9898\u76EE" }), _jsx("div", { className: "courseware-label courseware-label--analysis", children: "\u5206\u6790" }), _jsx("div", { className: "courseware-label courseware-label--solution", children: "\u89E3\u7B54" }), _jsx("div", { className: "courseware-label courseware-label--summary", children: "\u603B\u7ED3" }), _jsx("div", { className: "courseware-problem-area", children: problemSummary ? (_jsx(MathText, { as: "p", className: "stage-problem-text", children: problemSummary })) : null }), children, _jsx("div", { ref: overlayContainerRef, style: { position: 'absolute', inset: 0, zIndex: 2, pointerEvents: canDrawOverlay ? 'auto' : 'none' }, children: _jsx(GoldenFingerCanvasLayer, { ref: goldenFingerCallbackRef, activeToolMode: activeToolMode, strokeColor: strokeColor, strokeWidth: strokeWidth }) })] })] }));
}

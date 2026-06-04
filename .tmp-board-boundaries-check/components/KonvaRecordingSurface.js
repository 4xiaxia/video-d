import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// @cleanroom-component: KonvaRecordingSurface
// @domain: canvas-recording-stage
// @slot: drawboard-stage/canvas-recording-foundation (Konva)
// @depends: StageCanvasConfig, react-konva
// @io-input: canvas config, problem text summary
// @io-output: Konva Stage canvas element (for recording capture)
// @boundary: Canvas recording surface only; does not own A audio, B timing, C1/C2 actors, or editor state
// @truth-contract: 标签坐标取自 COURSEWARE_ZONE_BOUNDS，与 DOM .courseware-label 同源。
// @migration: 替换 CanvasRecordingSurface（Canvas2D 手绘版），Konva 统一渲染路径。
import React, { useEffect, useRef } from 'react';
import { Layer, Rect, Stage, Text } from 'react-konva';
import { COURSEWARE_LABEL_HEIGHT_RATIO, COURSEWARE_LABEL_LEFT_RATIOS, COURSEWARE_LABEL_TOP_RATIOS, COURSEWARE_LABEL_WIDTH_RATIO, COURSEWARE_PROBLEM_LEFT_RATIO, COURSEWARE_PROBLEM_MAX_WIDTH_RATIO, COURSEWARE_PROBLEM_TOP_RATIO, COURSEWARE_SYSTEM_FONT_FAMILY, resolveProblemFontSize, } from '../modules/canvasStage/coursewareChrome';
const LABEL_BG = '#59cee5';
const LABEL_TEXT = '#ffffff';
const PROBLEM_TEXT = '#243247';
const FRAME_STROKE = '#59cee5';
const ZONE_LABELS = [
    { key: 'problem', text: '题目' },
    { key: 'analysis', text: '分析' },
    { key: 'solution', text: '解答' },
    { key: 'summary', text: '总结' },
];
export function KonvaRecordingSurface({ canvas, onCanvasReady, problemSummary, }) {
    const stageContainerRef = useRef(null);
    const labelWidth = canvas.width * COURSEWARE_LABEL_WIDTH_RATIO;
    const labelHeight = canvas.height * COURSEWARE_LABEL_HEIGHT_RATIO;
    const labelRadius = Math.max(4, labelHeight * 0.28);
    const labelFontSize = Math.max(14, labelHeight * 0.48);
    const problemFontSize = resolveProblemFontSize(canvas);
    const problemMaxWidth = Math.min(canvas.width * COURSEWARE_PROBLEM_MAX_WIDTH_RATIO, 520 * (canvas.width / 1120));
    const problemLeft = canvas.width * COURSEWARE_PROBLEM_LEFT_RATIO;
    const problemTop = canvas.height * COURSEWARE_PROBLEM_TOP_RATIO;
    const frameStrokeWidth = Math.max(8, canvas.width * 0.007);
    useEffect(() => {
        const stageContainer = stageContainerRef.current;
        if (!stageContainer) {
            onCanvasReady?.(null);
            return;
        }
        const canvasEl = stageContainer.querySelector('canvas');
        onCanvasReady?.(canvasEl);
    }, [onCanvasReady]);
    return (_jsx("div", { ref: stageContainerRef, "aria-hidden": "true", "data-canvas-recording-surface": "konva-foundation", children: _jsx(Stage, { height: canvas.height, width: canvas.width, children: _jsxs(Layer, { listening: false, children: [_jsx(Rect, { fill: canvas.background || '#ffffff', height: canvas.height, width: canvas.width, x: 0, y: 0 }), _jsx(Rect, { height: canvas.height - frameStrokeWidth, stroke: FRAME_STROKE, strokeWidth: frameStrokeWidth, width: canvas.width - frameStrokeWidth, x: frameStrokeWidth / 2, y: frameStrokeWidth / 2 }), ZONE_LABELS.map(({ key, text }) => (_jsxs(React.Fragment, { children: [_jsx(Rect, { cornerRadius: labelRadius, fill: LABEL_BG, height: labelHeight, width: labelWidth, x: canvas.width * COURSEWARE_LABEL_LEFT_RATIOS[key], y: canvas.height * COURSEWARE_LABEL_TOP_RATIOS[key] }), _jsx(Text, { align: "center", fill: LABEL_TEXT, fontFamily: "sans-serif", fontSize: labelFontSize, fontStyle: "bold", height: labelHeight, text: text, verticalAlign: "middle", width: labelWidth, x: canvas.width * COURSEWARE_LABEL_LEFT_RATIOS[key], y: canvas.height * COURSEWARE_LABEL_TOP_RATIOS[key] })] }, key))), problemSummary?.trim() ? (_jsx(Text, { fill: PROBLEM_TEXT, fontFamily: COURSEWARE_SYSTEM_FONT_FAMILY, fontSize: problemFontSize, fontStyle: "600", lineHeight: 1.46, text: problemSummary.trim(), width: problemMaxWidth, x: problemLeft, y: problemTop })) : null] }) }) }));
}

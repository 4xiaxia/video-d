import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// @cleanroom-component: KonvaProofPage
// @domain: standalone-prototype
// @route: standalone=konva-proof
// @depends: StageCanvasConfig, TimelineClip(kind=board), boardReveal/getBoardRevealProgress, boardStickerGeometry defaults, react-konva
// @boundary: proof-of-capability only; validates Konva content-layer rendering against current project truth, does not rewrite the main workflow
import { Button, Card, Input, Slider, Space, Tag, Typography } from 'antd';
import { useMemo, useState } from 'react';
import { Group, Layer, Rect, Stage, Text } from 'react-konva';
import { getBoardRevealProgress } from '../modules/boardReveal/getBoardRevealProgress';
import { DEFAULT_BOARD_DRAW_SPEED } from '../modules/boardReveal/boardRevealConfig';
import { DEFAULT_BOARD_STICKER_WIDTH_PERCENT, DEFAULT_BOARD_STICKER_X_PERCENT, DEFAULT_BOARD_STICKER_Y_PERCENT, getBoardStickerFontSize, } from '../modules/boardSticker/boardStickerGeometry';
import { COURSEWARE_LABEL_HEIGHT_RATIO, COURSEWARE_LABEL_LEFT_RATIOS, COURSEWARE_LABEL_TOP_RATIOS, COURSEWARE_LABEL_WIDTH_RATIO, COURSEWARE_PROBLEM_LEFT_RATIO, COURSEWARE_PROBLEM_MAX_WIDTH_RATIO, COURSEWARE_PROBLEM_TOP_RATIO, COURSEWARE_SYSTEM_FONT_FAMILY, resolveProblemFontSize, } from '../modules/canvasStage/coursewareChrome';
import { createBoardTypographyConfig, DEFAULT_BOARD_FONT_NAME, DEFAULT_BOARD_FONT_URL, } from '../modules/boardFont/boardFontConfig';
const { Text: AntText, Title } = Typography;
const PROOF_CANVAS = {
    background: '#ffffff',
    ...createBoardTypographyConfig({
        boardFontName: DEFAULT_BOARD_FONT_NAME,
        boardFontSize: 42,
        boardFontUrl: DEFAULT_BOARD_FONT_URL,
    }),
    height: 720,
    preset: 'landscape-720p',
    width: 1280,
};
const SAMPLE_PROBLEM_TEXT = '例题：一辆车 2 小时行驶 120 公里，平均每小时行驶多少公里？';
const SAMPLE_LABELS = [
    '120 ÷ 2 = 60',
    '先算总路程，再算每小时\n120÷2=60',
    'x = 3\ny = 2×3+1 = 7',
];
function createDemoClip(label) {
    return {
        color: '#171717',
        drawSpeed: DEFAULT_BOARD_DRAW_SPEED,
        endMs: 14000,
        fontSize: 42,
        id: 'konva-proof-clip-1',
        kind: 'board',
        label,
        revealEndMs: 9000,
        revealStartMs: 0,
        sourceEndMs: 9000,
        sourceStartMs: 0,
        startMs: 0,
        trackId: 'track-board',
        widthPercent: 48,
        xPercent: 58,
        yPercent: 56,
    };
}
export function KonvaProofPage() {
    const [playheadMs, setPlayheadMs] = useState(3000);
    const [boardLabel, setBoardLabel] = useState(SAMPLE_LABELS[0]);
    const [clip, setClip] = useState(() => createDemoClip(SAMPLE_LABELS[0]));
    const boardFontSize = getBoardStickerFontSize(clip.fontSize, PROOF_CANVAS.boardFontSize);
    const revealProgress = getBoardRevealProgress({
        drawSpeed: clip.drawSpeed,
        playheadMs,
        revealEndMs: clip.revealEndMs ?? clip.sourceEndMs ?? clip.endMs,
        revealStartMs: clip.revealStartMs ?? clip.sourceStartMs ?? clip.startMs,
    });
    const visibleText = useMemo(() => {
        const sourceText = clip.label.trim();
        const visibleLength = Math.max(1, Math.ceil(sourceText.length * revealProgress));
        return sourceText.slice(0, visibleLength);
    }, [clip.label, revealProgress]);
    const boardX = PROOF_CANVAS.width * ((clip.xPercent ?? DEFAULT_BOARD_STICKER_X_PERCENT) / 100);
    const boardY = PROOF_CANVAS.height * ((clip.yPercent ?? DEFAULT_BOARD_STICKER_Y_PERCENT) / 100);
    const boardWidth = PROOF_CANVAS.width * ((clip.widthPercent ?? DEFAULT_BOARD_STICKER_WIDTH_PERCENT) / 100);
    const problemFontSize = resolveProblemFontSize(PROOF_CANVAS);
    const updateLabel = (nextLabel) => {
        setBoardLabel(nextLabel);
        setClip((current) => ({ ...current, label: nextLabel }));
    };
    const handleDragEnd = (event) => {
        const node = event.target;
        const nextXPercent = (node.x() / PROOF_CANVAS.width) * 100;
        const nextYPercent = (node.y() / PROOF_CANVAS.height) * 100;
        setClip((current) => ({
            ...current,
            xPercent: Number(nextXPercent.toFixed(2)),
            yPercent: Number(nextYPercent.toFixed(2)),
        }));
    };
    return (_jsxs("div", { className: "drawboard-standalone-page konva-proof-page", children: [_jsxs("header", { className: "drawboard-standalone-page__header", children: [_jsx(Title, { level: 4, children: "Konva \u5185\u5BB9\u5C42 Proof" }), _jsx(AntText, { type: "secondary", children: "\u53EA\u9A8C\u8BC1\u7B2C\u56DB\u6B65\u5185\u5BB9\u5C42\u627F\u8F7D\uFF1A\u56DB\u533A\u6807\u7B7E\u3001\u9898\u76EE\u533A\u3001C \u677F\u4E66 reveal\u3001\u62D6\u62FD\u4F4D\u7F6E\u6620\u5C04\u3002" })] }), _jsx(Card, { className: "drawboard-standalone-page__controls", title: "Konva Proof \u63A7\u5236\u53F0", children: _jsxs("div", { className: "drawboard-standalone-grid", children: [_jsxs("label", { children: ["\u5F53\u524D\u677F\u4E66", _jsx(Input.TextArea, { autoSize: { minRows: 2, maxRows: 4 }, onChange: (event) => updateLabel(event.target.value), value: boardLabel })] }), _jsxs("label", { children: ["\u8FDB\u5EA6 ", playheadMs, "ms", _jsx(Slider, { max: 14000, min: 0, onChange: (value) => setPlayheadMs(Array.isArray(value) ? value[0] : value), value: playheadMs })] }), _jsxs(Space, { size: 8, wrap: true, children: [_jsx(Button, { onClick: () => updateLabel(SAMPLE_LABELS[0]), children: "\u793A\u4F8B 1" }), _jsx(Button, { onClick: () => updateLabel(SAMPLE_LABELS[1]), children: "\u793A\u4F8B 2" }), _jsx(Button, { onClick: () => updateLabel(SAMPLE_LABELS[2]), children: "\u793A\u4F8B 3" })] }), _jsxs("div", { className: "drawboard-standalone-row", children: [_jsxs(Tag, { color: "blue", children: ["reveal: ", Math.round(revealProgress * 100), "%"] }), _jsxs(Tag, { color: "default", children: ["x: ", Math.round(clip.xPercent ?? 0), "%"] }), _jsxs(Tag, { color: "default", children: ["y: ", Math.round(clip.yPercent ?? 0), "%"] }), _jsxs(Tag, { color: "default", children: ["width: ", Math.round(clip.widthPercent ?? 0), "%"] }), _jsxs(Tag, { color: "default", children: ["font: ", boardFontSize, "px"] })] })] }) }), _jsx("div", { className: "konva-proof-stage-wrap", children: _jsx(Stage, { className: "konva-proof-stage", height: PROOF_CANVAS.height, width: PROOF_CANVAS.width, children: _jsxs(Layer, { children: [_jsx(Rect, { cornerRadius: 0, fill: PROOF_CANVAS.background, height: PROOF_CANVAS.height, stroke: "#59cee5", strokeWidth: 8, width: PROOF_CANVAS.width, x: 0, y: 0 }), [
                                ['题目', COURSEWARE_LABEL_LEFT_RATIOS.problem, COURSEWARE_LABEL_TOP_RATIOS.problem],
                                ['分析', COURSEWARE_LABEL_LEFT_RATIOS.analysis, COURSEWARE_LABEL_TOP_RATIOS.analysis],
                                ['解答', COURSEWARE_LABEL_LEFT_RATIOS.solution, COURSEWARE_LABEL_TOP_RATIOS.solution],
                                ['总结', COURSEWARE_LABEL_LEFT_RATIOS.summary, COURSEWARE_LABEL_TOP_RATIOS.summary],
                            ].map(([label, leftRatio, topRatio]) => {
                                const x = PROOF_CANVAS.width * leftRatio;
                                const y = PROOF_CANVAS.height * topRatio;
                                const width = PROOF_CANVAS.width * COURSEWARE_LABEL_WIDTH_RATIO;
                                const height = PROOF_CANVAS.height * COURSEWARE_LABEL_HEIGHT_RATIO;
                                return (_jsxs(Group, { x: x, y: y, children: [_jsx(Rect, { cornerRadius: 6, fill: "#59cee5", height: height, width: Math.max(width * 0.72, 56) }), _jsx(Text, { align: "center", fill: "#ffffff", fontFamily: COURSEWARE_SYSTEM_FONT_FAMILY, fontSize: 12, fontStyle: "bold", height: height, text: label, verticalAlign: "middle", width: Math.max(width * 0.72, 56), x: 0, y: 0 })] }, label));
                            }), _jsx(Text, { fill: "#243247", fontFamily: COURSEWARE_SYSTEM_FONT_FAMILY, fontSize: problemFontSize, fontStyle: "600", lineHeight: 1.46, text: SAMPLE_PROBLEM_TEXT, width: Math.min(PROOF_CANVAS.width * COURSEWARE_PROBLEM_MAX_WIDTH_RATIO, 520 * (PROOF_CANVAS.width / 1120)), x: PROOF_CANVAS.width * COURSEWARE_PROBLEM_LEFT_RATIO, y: PROOF_CANVAS.height * COURSEWARE_PROBLEM_TOP_RATIO }), _jsx(Text, { draggable: true, fill: clip.color ?? '#171717', fontFamily: PROOF_CANVAS.boardFontFamily, fontSize: boardFontSize, lineHeight: 1.35, onDragEnd: handleDragEnd, text: visibleText, width: boardWidth, x: boardX, y: boardY })] }) }) })] }));
}

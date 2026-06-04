import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// @cleanroom-component: DrawboardCoreStandalonePage
// @domain: standalone-prototype
// @slot: full-page
// @depends: AutoHandwritingLayer, DrawboardStage
// @route-impact: standalone=drawboard-core
import { Button, Card, Input, Slider, Space, Tag, Typography } from 'antd';
import { useCallback, useMemo, useRef, useState } from 'react';
import { AutoHandwritingLayer } from '../components/AutoHandwritingLayer';
import { DrawboardStage } from '../components/DrawboardStage';
import { createBoardTypographyConfig, DEFAULT_BOARD_FONT_NAME, DEFAULT_BOARD_FONT_URL, } from '../modules/boardFont/boardFontConfig';
import { DEFAULT_BOARD_DRAW_SPEED } from '../modules/boardReveal/boardRevealConfig';
const { Text, Title } = Typography;
const STANDALONE_CANVAS = {
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
const STANDALONE_PROBLEM_TEXT = {
    id: 'standalone-problem',
    kind: 'problemText',
    source: 'manual',
    status: 'ready',
    summary: '例题：一辆车 2 小时行驶 120 公里，平均每小时行驶多少公里？',
    title: '单体预览题干',
};
const CREATE_DEMO_CLIP = (label) => ({
    color: '#171717',
    drawSpeed: DEFAULT_BOARD_DRAW_SPEED,
    endMs: 14000,
    fontSize: 42,
    id: 'standalone-clip-1',
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
});
const SAMPLE_LABELS = [
    '120 ÷ 2 = 60',
    '25×4=100\n1200÷100=12',
    'A: 已知 y=2x+1\nB: 求 x=3 时 y 的值',
];
export function DrawboardCoreStandalonePage() {
    const stageRef = useRef(null);
    const goldenFingerLayerRef = useRef(null);
    const [activeToolMode, setActiveToolMode] = useState('off');
    const [strokeColor, setStrokeColor] = useState('#111111');
    const [strokeWidth, setStrokeWidth] = useState(5);
    const [selectedBoardClipId, setSelectedBoardClipId] = useState('standalone-clip-1');
    const [playheadMs, setPlayheadMs] = useState(3000);
    const [boardLabel, setBoardLabel] = useState(SAMPLE_LABELS[0]);
    const [boardClips, setBoardClips] = useState(() => [CREATE_DEMO_CLIP(SAMPLE_LABELS[0])]);
    const boardFontLoadKey = useMemo(() => `standalone-drawboard:${STANDALONE_CANVAS.boardFontUrl}:${STANDALONE_CANVAS.boardFontFamily}`, []);
    // 稳定化回调引用，避免每次渲染触发 DrawboardStage useEffect 空转
    const handleGoldenFingerReady = useCallback((handle) => {
        goldenFingerLayerRef.current = handle;
    }, []);
    const patchBoardClip = (clipId, patch) => {
        setBoardClips((previous) => previous.map((clip) => (clip.id === clipId ? { ...clip, ...patch } : clip)));
    };
    const updateLabel = (nextLabel) => {
        setBoardLabel(nextLabel);
        setBoardClips((previous) => previous.map((clip) => (clip.id === 'standalone-clip-1' ? { ...clip, label: nextLabel } : clip)));
    };
    const clip = boardClips[0];
    return (_jsxs("div", { className: "drawboard-standalone-page", children: [_jsxs("header", { className: "drawboard-standalone-page__header", children: [_jsx(Title, { level: 4, children: "\u753B\u5E03+\u753B\u7B14\u5355\u4F53\u9875" }), _jsx(Text, { type: "secondary", children: "\u53EA\u9A8C\u753B\u5E03\u5C42\u548C\u91D1\u624B\u6307\u5C42\uFF0C\u4E0D\u5199\u5165 A/B/C \u4E3B\u94FE\u3002" })] }), _jsx(Card, { className: "drawboard-standalone-page__controls", title: "\u5355\u4F53\u63A7\u5236\u53F0", children: _jsxs("div", { className: "drawboard-standalone-grid", children: [_jsxs("label", { children: ["\u5F53\u524D\u6587\u672C", _jsx(Input.TextArea, { autoSize: { minRows: 2, maxRows: 4 }, onChange: (event) => updateLabel(event.target.value), value: boardLabel })] }), _jsxs("label", { children: ["\u8FDB\u5EA6 ", playheadMs, "ms", _jsx(Slider, { max: 14000, min: 0, onChange: (value) => setPlayheadMs(Array.isArray(value) ? value[0] : value), value: playheadMs })] }), _jsxs(Space, { size: 8, wrap: true, children: [_jsx(Button, { onClick: () => updateLabel(SAMPLE_LABELS[0]), children: "\u793A\u4F8B 1" }), _jsx(Button, { onClick: () => updateLabel(SAMPLE_LABELS[1]), children: "\u793A\u4F8B 2" }), _jsx(Button, { onClick: () => updateLabel(SAMPLE_LABELS[2]), children: "\u793A\u4F8B 3" })] }), _jsxs("div", { className: "drawboard-standalone-row", children: [_jsxs(Tag, { color: activeToolMode === 'off' ? 'blue' : 'default', children: ["\u6A21\u5F0F: ", activeToolMode] }), _jsxs(Tag, { color: "default", children: ["\u989C\u8272: ", strokeColor] }), _jsxs(Tag, { color: "default", children: ["\u7C97\u7EC6: ", strokeWidth] }), clip ? _jsxs(Tag, { color: "default", children: ["C\u4F4D\u7F6E: (", Math.round(clip.xPercent ?? 0), "%, ", Math.round(clip.yPercent ?? 0), "%)"] }) : null] })] }) }), _jsx(DrawboardStage, { activeToolMode: activeToolMode, boardFontSize: STANDALONE_CANVAS.boardFontSize, canvas: STANDALONE_CANVAS, onClearGoldenFinger: () => goldenFingerLayerRef.current?.clear(), onChangeStrokeColor: setStrokeColor, onChangeStrokeWidth: setStrokeWidth, onChangeToolMode: setActiveToolMode, onGoldenFingerLayerReady: handleGoldenFingerReady, onUndoGoldenFinger: () => goldenFingerLayerRef.current?.undo(), problemText: STANDALONE_PROBLEM_TEXT, stageRef: stageRef, strokeColor: strokeColor, strokeWidth: strokeWidth, children: _jsx(AutoHandwritingLayer, { boardClips: boardClips, boardFontLoadKey: boardFontLoadKey, boardFontSize: STANDALONE_CANVAS.boardFontSize, canvas: STANDALONE_CANVAS, playheadMs: playheadMs, selectedBoardClipId: selectedBoardClipId, onSelectBoardClip: setSelectedBoardClipId, onUpdateBoardClip: patchBoardClip }) })] }));
}

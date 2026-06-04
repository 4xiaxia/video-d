import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// @cleanroom-component: DrawboardHybridPrototypePage
// @domain: standalone-prototype
// @slot: full-page
// @depends: AutoHandwritingLayer, DrawboardStage, FloatingToolDock
// @route-impact: standalone=drawboard-hybrid
import { Button, Input, Slider, Space, Tag, Typography } from 'antd';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AutoHandwritingLayer } from '../components/AutoHandwritingLayer';
import { DrawboardStage } from '../components/DrawboardStage';
import { FloatingToolDock } from '../components/FloatingToolDock';
import { createBoardTypographyConfig, DEFAULT_BOARD_FONT_NAME, DEFAULT_BOARD_FONT_URL, } from '../modules/boardFont/boardFontConfig';
import { DEFAULT_BOARD_DRAW_SPEED } from '../modules/boardReveal/boardRevealConfig';
const { Text, Title } = Typography;
const SHELL_OPTIONS = [
    { description: '底部大面板 + 右侧 dock', label: '虎板', value: 'tiger' },
    { description: '右侧工具优先', label: 'Dock', value: 'dock' },
    { description: '尽量少打扰', label: '专注', value: 'focus' },
];
const PROTOTYPE_CANVAS = {
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
const PROTOTYPE_PROBLEM_TEXT = {
    id: 'prototype-problem',
    kind: 'problemText',
    source: 'manual',
    status: 'ready',
    summary: '例题：一辆车 2 小时行驶 120 公里，平均每小时行驶多少公里？',
    title: '混合原型题干',
};
function createDemoClip(label) {
    return {
        color: '#171717',
        drawSpeed: DEFAULT_BOARD_DRAW_SPEED,
        endMs: 14000,
        fontSize: 42,
        id: 'prototype-clip-1',
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
const SAMPLE_LABELS = [
    '120 ÷ 2 = 60',
    '25×4=100\n1200÷100=12',
    'A: 已知 y=2x+1\nB: 求 x=3 时 y 的值',
];
export function DrawboardHybridPrototypePage() {
    const stageRef = useRef(null);
    const goldenFingerLayerRef = useRef(null);
    const [shell, setShell] = useState(() => readShellFromSearch(window.location.search));
    const [activeToolMode, setActiveToolMode] = useState('off');
    const [strokeColor, setStrokeColor] = useState('#111111');
    const [strokeWidth, setStrokeWidth] = useState(5);
    const [selectedBoardClipId, setSelectedBoardClipId] = useState('prototype-clip-1');
    const [playheadMs, setPlayheadMs] = useState(3000);
    const [boardLabel, setBoardLabel] = useState(SAMPLE_LABELS[0]);
    const [boardClips, setBoardClips] = useState(() => [createDemoClip(SAMPLE_LABELS[0])]);
    const boardFontLoadKey = useMemo(() => `prototype-drawboard:${PROTOTYPE_CANVAS.boardFontUrl}:${PROTOTYPE_CANVAS.boardFontFamily}`, []);
    // 稳定化回调引用，避免每次渲染触发 DrawboardStage useEffect 空转
    const handleGoldenFingerReady = useCallback((handle) => {
        goldenFingerLayerRef.current = handle;
    }, []);
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        params.set('standalone', 'drawboard-hybrid');
        params.set('shell', shell);
        window.history.replaceState(null, '', `${window.location.pathname}?${params.toString()}`);
    }, [shell]);
    const patchBoardClip = (clipId, patch) => {
        setBoardClips((previous) => previous.map((clip) => (clip.id === clipId ? { ...clip, ...patch } : clip)));
    };
    const updateLabel = (nextLabel) => {
        setBoardLabel(nextLabel);
        setBoardClips((previous) => previous.map((clip) => (clip.id === 'prototype-clip-1' ? { ...clip, label: nextLabel } : clip)));
    };
    const clip = boardClips[0];
    return (_jsxs("div", { className: `drawboard-hybrid-prototype drawboard-hybrid-prototype--${shell}`, children: [_jsxs("header", { className: "drawboard-hybrid-prototype__header", children: [_jsxs("div", { className: "drawboard-hybrid-prototype__header-copy", children: [_jsx(Title, { level: 4, children: "\u864E\u677F\u6DF7\u5408\u539F\u578B" }), _jsx(Text, { type: "secondary", children: "\u5168\u5C4F\u753B\u5E03 + \u60AC\u6D6E\u5DE5\u5177\u6761 + \u53F3\u4FA7\u5FEB\u6377 dock\uFF0C\u5148\u770B\u5F62\u6001\uFF0C\u4E0D\u78B0\u4E3B\u8F74\u3002" })] }), _jsxs("div", { className: "drawboard-hybrid-prototype__header-tags", children: [_jsxs(Tag, { color: "blue", children: ["shell: ", shell] }), _jsxs(Tag, { children: ["\u5DE5\u5177: ", activeToolMode] }), _jsxs(Tag, { children: ["\u64AD\u653E: ", Math.round(playheadMs / 100) / 10, "s"] })] })] }), _jsxs("main", { className: "drawboard-hybrid-prototype__stage-shell", children: [_jsx(DrawboardStage, { activeToolMode: activeToolMode, boardFontSize: PROTOTYPE_CANVAS.boardFontSize, canvas: PROTOTYPE_CANVAS, onClearGoldenFinger: () => goldenFingerLayerRef.current?.clear(), onChangeStrokeColor: setStrokeColor, onChangeStrokeWidth: setStrokeWidth, onChangeToolMode: setActiveToolMode, onGoldenFingerLayerReady: handleGoldenFingerReady, onUndoGoldenFinger: () => goldenFingerLayerRef.current?.undo(), problemText: PROTOTYPE_PROBLEM_TEXT, stageRef: stageRef, strokeColor: strokeColor, strokeWidth: strokeWidth, children: _jsx(AutoHandwritingLayer, { boardClips: boardClips, boardFontLoadKey: boardFontLoadKey, boardFontSize: PROTOTYPE_CANVAS.boardFontSize, canvas: PROTOTYPE_CANVAS, playheadMs: playheadMs, selectedBoardClipId: selectedBoardClipId, onSelectBoardClip: setSelectedBoardClipId, onUpdateBoardClip: patchBoardClip }) }), _jsxs("section", { className: `drawboard-hybrid-prototype__float-card drawboard-hybrid-prototype__float-card--${shell}`, children: [_jsxs("div", { className: "drawboard-hybrid-prototype__float-head", children: [_jsxs("div", { children: [_jsx("strong", { children: "\u60AC\u6D6E\u63A7\u5236\u53F0" }), _jsx("small", { children: SHELL_OPTIONS.find((option) => option.value === shell)?.description })] }), _jsx(Space, { size: 6, wrap: true, children: SHELL_OPTIONS.map((option) => (_jsx(Button, { onClick: () => setShell(option.value), type: shell === option.value ? 'primary' : 'default', children: option.label }, option.value))) })] }), _jsx("div", { className: "drawboard-hybrid-prototype__float-toolbar", children: null /* 画笔工具已移入 DrawboardStage 画布内部 */ }), _jsxs("div", { className: "drawboard-hybrid-prototype__float-body", children: [_jsxs("label", { children: ["C \u6587\u672C", _jsx(Input.TextArea, { autoSize: { minRows: 2, maxRows: 4 }, onChange: (event) => updateLabel(event.target.value), value: boardLabel })] }), _jsxs("label", { children: ["\u64AD\u653E\u4F4D\u7F6E ", playheadMs, "ms", _jsx(Slider, { max: 14000, min: 0, onChange: (value) => setPlayheadMs(Array.isArray(value) ? value[0] : value), value: playheadMs })] }), _jsxs(Space, { size: 8, wrap: true, children: [_jsx(Button, { onClick: () => updateLabel(SAMPLE_LABELS[0]), children: "\u793A\u4F8B 1" }), _jsx(Button, { onClick: () => updateLabel(SAMPLE_LABELS[1]), children: "\u793A\u4F8B 2" }), _jsx(Button, { onClick: () => updateLabel(SAMPLE_LABELS[2]), children: "\u793A\u4F8B 3" })] }), _jsxs("div", { className: "drawboard-hybrid-prototype__chips", children: [_jsxs(Tag, { color: shell === 'focus' ? 'gold' : 'blue', children: ["shell: ", shell] }), _jsxs(Tag, { children: ["\u6A21\u5F0F: ", activeToolMode] }), _jsxs(Tag, { children: ["\u989C\u8272: ", strokeColor] }), _jsxs(Tag, { children: ["\u7C97\u7EC6: ", strokeWidth] }), clip ? _jsxs(Tag, { children: ["C\u4F4D\u7F6E: (", Math.round(clip.xPercent ?? 0), "%, ", Math.round(clip.yPercent ?? 0), "%)"] }) : null] })] })] }), shell !== 'focus' ? _jsx(FloatingToolDock, {}) : null] })] }));
}
function readShellFromSearch(search) {
    const value = new URLSearchParams(search).get('shell');
    if (value === 'dock' || value === 'focus' || value === 'tiger') {
        return value;
    }
    return 'tiger';
}

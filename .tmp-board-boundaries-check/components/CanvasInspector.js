import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
// @cleanroom-component: CanvasInspector
// @domain: inspector/canvas
// @slot: right-inspector/canvas-card
// @depends: StageCanvasConfig
// @io-input: canvas
// @io-output: draft canvas -> explicit apply -> onUpdateCanvas(canvas)
// @fields: canvas.preset, canvas.width, canvas.height, canvas.background
// @boundary: Canvas stage/paper settings only; C actor typography lives in CurrentProjectBoardFontInspector
import { useEffect, useState } from 'react';
import { Button, Collapse, Input, InputNumber, Select, Space, Tag, Typography } from 'antd';
const { Text } = Typography;
const canvasPresets = [
    { height: 1080, label: '横屏 16:9｜1920×1080', value: 'landscape-1080p', width: 1920 },
    { height: 720, label: '横屏 16:9｜1280×720', value: 'landscape-720p', width: 1280 },
    { height: 768, label: '课堂 4:3｜1024×768', value: 'classic-4-3', width: 1024 },
    { height: 1920, label: '竖屏 9:16｜1080×1920', value: 'portrait-1080p', width: 1080 },
    { height: 1080, label: '方屏 1:1｜1080×1080', value: 'square-1080', width: 1080 },
    { height: 1080, label: '自定义', value: 'custom', width: 1920 },
];
export function CanvasInspector({ canvas, onUpdateCanvas, }) {
    const [draftCanvas, setDraftCanvas] = useState(canvas);
    useEffect(() => {
        setDraftCanvas(canvas);
    }, [canvas]);
    const selectedPreset = canvasPresets.find((preset) => preset.value === draftCanvas.preset) ?? canvasPresets[0];
    const ratioText = formatRatio(draftCanvas.width, draftCanvas.height);
    const hasDraftChanges = JSON.stringify(draftCanvas) !== JSON.stringify(canvas);
    return (_jsx(Collapse, { className: "zone-card zone-inspector canvas-inspector-collapse", defaultActiveKey: [], items: [
            {
                children: (_jsxs("div", { className: "canvas-inspector", children: [_jsxs(Text, { type: "secondary", children: ["\u821E\u53F0\u8F93\u51FA\u6BD4\u4F8B\uFF1A", ratioText] }), _jsxs("label", { className: "inspector-field", children: [_jsx(Text, { strong: true, children: "\u767D\u677F\u89C4\u683C" }), _jsx(Select, { options: canvasPresets.map((preset) => ({ label: preset.label, value: preset.value })), onChange: (value) => {
                                        const preset = canvasPresets.find((item) => item.value === value) ?? selectedPreset;
                                        setDraftCanvas({
                                            ...draftCanvas,
                                            height: preset.height,
                                            preset: preset.value,
                                            width: preset.width,
                                        });
                                    }, value: selectedPreset.value })] }), _jsxs("div", { className: "inspector-field-grid", children: [_jsxs("label", { className: "inspector-field", children: [_jsx(Text, { strong: true, children: "\u5BBD\u5EA6" }), _jsx(InputNumber, { max: 3840, min: 360, onChange: (value) => setDraftCanvas({
                                                ...draftCanvas,
                                                preset: 'custom',
                                                width: normalizeNumber(value, draftCanvas.width),
                                            }), step: 10, value: draftCanvas.width })] }), _jsxs("label", { className: "inspector-field", children: [_jsx(Text, { strong: true, children: "\u9AD8\u5EA6" }), _jsx(InputNumber, { max: 3840, min: 360, onChange: (value) => setDraftCanvas({
                                                ...draftCanvas,
                                                height: normalizeNumber(value, draftCanvas.height),
                                                preset: 'custom',
                                            }), step: 10, value: draftCanvas.height })] })] }), _jsxs("label", { className: "inspector-field", children: [_jsx(Text, { strong: true, children: "\u80CC\u666F\u753B\u5E03\u989C\u8272" }), _jsx(Input, { onChange: (event) => setDraftCanvas({
                                        ...draftCanvas,
                                        background: event.target.value,
                                    }), value: draftCanvas.background })] }), _jsxs(Space, { children: [_jsx(Button, { disabled: !hasDraftChanges, onClick: () => onUpdateCanvas(draftCanvas), type: "primary", children: "\u5E94\u7528\u5230\u5F53\u524D\u5DE5\u7A0B" }), _jsx(Button, { disabled: !hasDraftChanges, onClick: () => setDraftCanvas(canvas), children: "\u653E\u5F03\u4FEE\u6539" })] }), _jsx(Text, { type: "secondary", children: "\u8FD9\u91CC\u53EA\u8BBE\u7F6E\u5F55\u5C4F\u821E\u53F0\u7684\u7EB8\u5F20\u6BD4\u4F8B\u3001\u8F93\u51FA\u5C3A\u5BF8\u548C\u80CC\u666F\u8272\uFF1BC \u7D20\u6750\u5B57\u4F53\u3001\u5B57\u53F7\u548C\u4E66\u5199\u901F\u5EA6\u5728 C \u63A7\u5236\u533A\u5904\u7406\u3002" })] })),
                extra: _jsx(Tag, { color: "cyan", children: ratioText }),
                key: 'canvas-size',
                label: '画布变量 / 录屏舞台',
            },
        ] }));
}
function formatRatio(width, height) {
    const divisor = gcd(width, height);
    return `${Math.round(width / divisor)}:${Math.round(height / divisor)}`;
}
function gcd(left, right) {
    return right === 0 ? Math.max(1, left) : gcd(right, left % right);
}
function normalizeNumber(value, fallback) {
    if (typeof value === 'number' && !Number.isNaN(value)) {
        return value;
    }
    if (typeof value === 'string' && value.trim()) {
        const parsedValue = Number(value);
        return Number.isNaN(parsedValue) ? fallback : parsedValue;
    }
    return fallback;
}

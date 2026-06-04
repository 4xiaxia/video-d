import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// @cleanroom-component: BoardClipInspectorSections
// @domain: inspector
// @slot: right-inspector
// @depends: TeachingProject.timeline.clips
// @route-impact: App shell only
import { EditOutlined } from '@ant-design/icons';
import { Button, Input, InputNumber, Slider, Space, Tag, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { MathText } from '../MathText';
const { Text } = Typography;
const BOARD_CLIP_COLOR_SWATCHES = ['#111111', '#1d4ed8', '#dc2626', '#16a34a', '#7c3aed'];
export function BoardClipLightGroup({ children, dataAnchor, title, }) {
    return (_jsxs("section", { className: "inspector-light-group", "data-anchor": dataAnchor, children: [_jsx(Text, { className: "inspector-light-group-title", strong: true, children: title }), _jsx("div", { className: "inspector-light-group-body", children: children })] }));
}
export function BoardClipContentSection({ clipId, label, onChange, }) {
    const [isEditing, setIsEditing] = useState(false);
    useEffect(() => {
        setIsEditing(false);
    }, [clipId]);
    return (_jsxs("section", { className: "inspector-section", "data-anchor": "bc-c-content-panel-001", children: [_jsxs("div", { className: "inspector-section-header", children: [_jsx(Text, { className: "inspector-section-title", strong: true, children: "\u5F53\u524D\u7D20\u6750\u5185\u5BB9" }), _jsx(Button, { icon: _jsx(EditOutlined, {}), onClick: () => setIsEditing((current) => !current), size: "small", type: "text", children: "\u4FEE\u6539" })] }), isEditing ? (_jsxs("label", { className: "inspector-field", children: [_jsx(Text, { type: "secondary", children: "\u8FD9\u6BB5\u7D20\u6750\u5199\u4EC0\u4E48" }), _jsx(Input.TextArea, { autoFocus: true, autoSize: { minRows: 3, maxRows: 6 }, className: "math-editor-input", onBlur: () => setIsEditing(false), onChange: (event) => onChange(event.target.value), value: label })] })) : (_jsx("button", { className: "inspector-content-preview", onClick: () => setIsEditing(true), type: "button", children: _jsx(MathText, { as: "span", children: label || '当前素材还没有内容。' }) }))] }));
}
export function BoardClipBindingHintSection({ displayEndMs, displayStartMs, revealEndMs, revealStartMs, sourceEndMs, sourceStartMs, }) {
    return (_jsxs("section", { className: "inspector-section", "data-anchor": "bc-c-binding-hint-panel-001", children: [_jsx(Text, { className: "inspector-section-title", strong: true, children: "\u5F53\u524D\u7D20\u6750\u6620\u5C04\u5173\u8054" }), _jsxs("div", { className: "inspector-readonly-list", children: [_jsxs("div", { children: [_jsx(Text, { strong: true, children: "\u8BB2\u89E3\u97F3\u9891" }), _jsx(Text, { type: "secondary", children: formatMsRange(sourceStartMs, sourceEndMs) })] }), _jsxs("div", { children: [_jsx(Text, { strong: true, children: "\u7D20\u6750\u65F6\u957F" }), _jsx(Text, { type: "secondary", children: formatMsRange(displayStartMs, displayEndMs) })] }), _jsxs("div", { children: [_jsx(Text, { strong: true, children: "\u4E66\u5199\u65F6\u6BB5" }), _jsx(Text, { type: "secondary", children: formatMsRange(revealStartMs, revealEndMs) })] })] }), _jsx(Text, { type: "secondary", children: "\u8FD9\u91CC\u4F1A\u4E00\u8D77\u663E\u793A\u8BB2\u89E3\u3001\u7D20\u6750\u65F6\u957F\u548C\u5B9E\u9645\u4E66\u5199\u65F6\u6BB5\uFF0C\u65B9\u4FBF\u4F60\u5BF9\u9F50\u3002" })] }));
}
export function BoardClipSkinSection({ draft, onChange, onScaleChange, scalePercent, }) {
    return (_jsxs("section", { className: "inspector-section", "data-anchor": "bc-c-skin-panel-001", "data-legacy-anchor": "bc-c-position-size-panel-001", children: [_jsx(Text, { className: "inspector-section-title", strong: true, children: "C \u5916\u89C2" }), _jsxs("label", { className: "inspector-field", children: [_jsx(Text, { strong: true, children: "\u5B57\u53F7 / \u5BBD\u5EA6\u8054\u52A8" }), _jsx(InputNumber, { max: 220, min: 20, onChange: onScaleChange, step: 5, suffix: "%", value: scalePercent }), _jsx(Text, { type: "secondary", children: "\u8054\u52A8\u7F29\u653E\uFF1A\u5B57\u53F7\u548C\u6362\u884C\u5BBD\u5EA6\u540C\u65F6\u53D8\u5316\uFF0C\u4E0D\u62C9\u4F38\u624B\u5199\u56FE\u50CF\u3002" })] }), _jsxs("label", { className: "inspector-field", children: [_jsx(Text, { strong: true, children: "C \u5B57\u53F7" }), _jsx(InputNumber, { max: 96, min: 12, onChange: (value) => onChange({ fontSize: normalizeNumber(value, draft.fontSize) }), step: 1, suffix: "px", value: draft.fontSize })] }), _jsxs("label", { className: "inspector-field", children: [_jsx(Text, { strong: true, children: "\u5B57\u4F53\u989C\u8272" }), _jsx("div", { className: "inspector-color-swatch-row", children: BOARD_CLIP_COLOR_SWATCHES.map((color) => (_jsx("button", { "aria-label": `C color ${color}`, className: "inspector-color-swatch", "data-selected": draft.color === color ? 'true' : 'false', onClick: () => onChange({ color }), style: { backgroundColor: color }, type: "button" }, color))) }), _jsx(Text, { type: "secondary", children: "\u6CBF\u7528\u753B\u5E03\u58A8\u8272" })] })] }));
}
export function BoardClipCanvasPositionSection({ draft, onChange, }) {
    return (_jsxs("section", { className: "inspector-section", "data-anchor": "bc-c-canvas-position-panel-001", children: [_jsx(Text, { className: "inspector-section-title", strong: true, children: "C \u7AD9\u4F4D" }), _jsxs("div", { className: "inspector-field-grid", children: [_jsxs("label", { className: "inspector-field", children: [_jsx(Text, { strong: true, children: "\u6A2A\u5411\u4F4D\u7F6E" }), _jsx(InputNumber, { max: 100, min: 0, onChange: (value) => onChange({ xPercent: normalizeNumber(value, draft.xPercent) }), step: 1, suffix: "%", value: draft.xPercent })] }), _jsxs("label", { className: "inspector-field", children: [_jsx(Text, { strong: true, children: "\u7EB5\u5411\u4F4D\u7F6E" }), _jsx(InputNumber, { max: 100, min: 0, onChange: (value) => onChange({ yPercent: normalizeNumber(value, draft.yPercent) }), step: 1, suffix: "%", value: draft.yPercent })] })] }), _jsxs("label", { className: "inspector-field", children: [_jsx(Text, { strong: true, children: "\u6362\u884C\u5BBD\u5EA6" }), _jsx(InputNumber, { max: 90, min: 8, onChange: (value) => onChange({ widthPercent: normalizeNumber(value, draft.widthPercent) }), step: 1, suffix: "%", value: draft.widthPercent }), _jsx(Text, { type: "secondary", children: "\u4EC5\u6539\u6362\u884C\u76D2\uFF0C\u5B57\u53F7\u4E0D\u53D8\uFF1B\u6587\u5B57\u53EF\u80FD\u91CD\u65B0\u6392\u7248\u3002\u914D\u5408\u201C\u5B57\u53F7 / \u5BBD\u5EA6\u8054\u52A8\u201D\u8C03\u6574\u6574\u4F53\u5360\u4F4D\u3002" })] })] }));
}
export function BoardClipDrawFeelSection({ drawSpeed, onChange, }) {
    return (_jsxs("section", { className: "inspector-section", "data-anchor": "bc-c-draw-feel-panel-001", children: [_jsxs("label", { className: "inspector-field", children: [_jsx(Text, { strong: true, children: "C \u4E66\u5199\u901F\u5EA6" }), _jsxs(Space, { align: "center", size: 10, children: [_jsx(Slider, { marks: {
                                    0.5: '慢',
                                    1: '正常',
                                    2: '快',
                                    3: '很快',
                                }, max: 4, min: 0.1, onChange: (value) => onChange(value), step: 0.1, style: { width: 180 }, value: drawSpeed }), _jsx(InputNumber, { max: 4, min: 0.1, onChange: (value) => onChange(normalizeNumber(value, drawSpeed)), step: 0.1, value: drawSpeed })] })] }), _jsx(Text, { type: "secondary", children: "\u53EA\u5F71\u54CD C \u5728 A source \u2229 B display \u5185\u7684 reveal \u5FEB\u6162\uFF1B\u4E0D\u6539 A \u8BED\u97F3\uFF0C\u4E0D\u6539 B \u5BFF\u547D\u3002B \u53EA\u7BA1\u4E0A\u53F0\u548C\u89E3\u9501\u540E\u7684\u4E0B\u53F0\u622A\u6B62\u65F6\u95F4\uFF1B\u9ED8\u8BA4 C \u5199\u5B8C\u7EE7\u7EED\u7559\u573A\uFF0CC \u4E66\u5199\u5FEB\u6162\u5728\u201CC \u6F14\u7ECE\u201D\u91CC\u5355\u72EC\u8C03\u6574\uFF0C\u4E0D\u53CD\u5199 A/B\u3002" })] }));
}
export function BoardClipFontGapSection() {
    return (_jsxs("section", { className: "inspector-section", "data-anchor": "bc-c-font-gap-panel-001", children: [_jsx(Text, { className: "inspector-section-title", strong: true, children: "\u5B57\u4F53 URL" }), _jsxs("div", { className: "inspector-readonly-list", children: [_jsxs("div", { children: [_jsx(Text, { strong: true, children: "\u5F15\u7528\u5176\u4ED6\u5B57\u4F53" }), _jsx(Tag, { color: "blue", children: "\u8D70\u753B\u5E03\u53D8\u91CF" })] }), _jsx(Text, { type: "secondary", children: "\u5F53\u524D per-clip color \u5DF2\u5165\u6B63\u5F0F\u72B6\u6001\u94FE\uFF0C\u4F46 per-clip fontUrl \u8FD8\u6CA1\u6709\u72EC\u7ACB\u5B57\u6BB5\u3002" })] })] }));
}
export function BoardClipInspectorActions({ hasDraftChanges, onConfirm, onReset, }) {
    return (_jsxs(Space, { className: "inspector-actions", children: [_jsx(Button, { disabled: !hasDraftChanges, onClick: onReset, children: "\u64A4\u9500" }), _jsx(Button, { disabled: !hasDraftChanges, onClick: onConfirm, type: "primary", children: "\u786E\u8BA4\u5E94\u7528" })] }));
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
function formatMsRange(startMs, endMs) {
    return `${Math.round(startMs)} ms - ${Math.round(endMs)} ms`;
}

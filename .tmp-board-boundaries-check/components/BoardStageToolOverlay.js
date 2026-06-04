import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
// @cleanroom-component: BoardStageToolOverlay
// @domain: drawboard-stage/golden-finger-tools
// @slot: drawboard-stage/tool-overlay（与 stage-canvas 同级，完全在录制区域之外）
// @depends: BoardStageToolMode
// @io-input: activeToolMode, activeColor
// @io-output: onChangeToolMode, onChangeColor
// @boundary: tool state only; no A/B/C mutation, no timeline writes
// @design: 隔层板模式
//   - 关闭态：画布上方只浮一个 "开启标注隔层板" 按钮，C 可自由拖拽
//   - 激活态：完整工具面板 + 隔层板header标识，GoldenFinger canvas 拦截所有指针事件形成透明隔离层
//   - 核心隐喻：像是在画布上盖了一层透明玻璃板，在板上标注不影响板下 C 的演绎
import { Button, ColorPicker, Drawer, Tooltip } from 'antd';
import { Circle, Eraser, Highlighter, PenLine, Palette, RotateCcw, ShieldCheck, Trash2, X } from 'lucide-react';
import { useState } from 'react';
const COLORS = ['#111111', '#d14343', '#246bfe', '#118a4f'];
const STROKE_WIDTH_OPTIONS = [3, 5, 8];
/** 工具定义：标签 + 图标 + 模式值 */
const TOOLS = [
    { icon: PenLine, label: '标注', mode: 'pen' },
    { icon: Eraser, label: '橡皮', mode: 'eraser' },
    { icon: Highlighter, label: '重点', mode: 'highlight' },
    { icon: Circle, label: '圈画', mode: 'circle' },
    { icon: X, label: '划掉', mode: 'cross' },
];
export function BoardStageToolOverlay({ activeColor, activeToolMode, activeStrokeWidth, onChangeColor, onChangeStrokeWidth, onChangeToolMode, onClear, onUndo, }) {
    const [settingsOpen, setSettingsOpen] = useState(false);
    /** 隔层板是否激活（任意标注工具开启即为激活） */
    const glassActive = activeToolMode !== 'off';
    return (_jsxs(_Fragment, { children: [_jsx("aside", { className: `board-stage-tool-overlay ${glassActive ? 'board-stage-tool-overlay--on' : 'board-stage-tool-overlay--off'}`, children: !glassActive ? (_jsx(Tooltip, { title: _jsxs("div", { style: { maxWidth: 200 }, children: [_jsx("div", { style: { fontWeight: 600, marginBottom: 4 }, children: "\u6807\u6CE8\u9694\u5C42\u677F" }), _jsx("div", { style: { fontSize: 12, lineHeight: 1.5 }, children: "\u5F00\u542F\u540E\u5728\u753B\u5E03\u4FA7\u8FB9\u6253\u5F00\u5DE5\u5177\u6761\uFF0C\u6807\u6CE8\u4E0D\u4F1A\u538B\u4F4F\u753B\u5E03\u672C\u4F53\u3002" })] }), children: _jsx(Button, { className: "board-stage-tool-button board-stage-tool-button--toggle", "aria-label": "\u5F00\u542F\u6807\u6CE8\u9694\u5C42\u677F", icon: _jsx(PenLine, { size: 16 }), onClick: () => onChangeToolMode('pen'), shape: "circle", type: "default" }) })) : (_jsxs("div", { className: "board-stage-tool-rail", role: "toolbar", "aria-label": "\u6807\u6CE8\u5DE5\u5177\u680F", children: [_jsxs("div", { className: "board-stage-tool-rail__badge", children: [_jsx(ShieldCheck, { size: 14 }), _jsx("span", { children: "\u9694\u5C42\u677F" })] }), TOOLS.map(({ icon: Icon, label, mode }) => (_jsx(Tooltip, { title: mode === 'pen' ? '自由标注画笔' : `${label}模式`, children: _jsx(Button, { "aria-label": label, className: "board-stage-tool-button", "data-testid": `gf-mode-${mode}`, icon: _jsx(Icon, { size: 16 }), onClick: () => onChangeToolMode(mode), shape: "circle", type: activeToolMode === mode ? 'primary' : 'default' }) }, mode))), _jsx(Tooltip, { title: "\u8BBE\u7F6E\u989C\u8272\u548C\u7C97\u7EC6", children: _jsx(Button, { "aria-label": "\u8BBE\u7F6E\u6807\u6CE8\u6837\u5F0F", className: "board-stage-tool-button", icon: _jsx(Palette, { size: 16 }), onClick: () => setSettingsOpen(true), shape: "circle" }) }), _jsx(Tooltip, { title: "\u64A4\u9500\u4E0A\u4E00\u7B14", children: _jsx(Button, { "aria-label": "\u64A4\u9500", className: "board-stage-tool-button", "data-testid": "gf-undo", icon: _jsx(RotateCcw, { size: 16 }), onClick: onUndo, shape: "circle" }) }), _jsx(Tooltip, { title: "\u6E05\u7A7A\u6240\u6709\u6807\u6CE8", children: _jsx(Button, { "aria-label": "\u6E05\u7A7A\u6240\u6709\u6807\u6CE8", className: "board-stage-tool-button", "data-testid": "gf-clear", icon: _jsx(Trash2, { size: 16 }), onClick: onClear, shape: "circle" }) }), _jsx(Tooltip, { title: "\u5173\u95ED\u9694\u5C42\u677F", children: _jsx(Button, { "aria-label": "\u5173\u95ED\u9694\u5C42\u677F", className: "board-stage-tool-button", icon: _jsx(X, { size: 16 }), onClick: () => onChangeToolMode('off'), shape: "circle", type: "default" }) })] })) }), _jsx(Drawer, { destroyOnHidden: true, onClose: () => setSettingsOpen(false), open: settingsOpen, placement: "right", title: "\u6807\u6CE8\u8BBE\u7F6E", width: 320, children: _jsxs("div", { className: "board-stage-settings-panel", children: [_jsxs("div", { className: "board-stage-settings-panel__section", children: [_jsx("strong", { children: "\u989C\u8272" }), _jsxs("div", { className: "board-stage-color-group", "aria-label": "\u6807\u6CE8\u989C\u8272", children: [COLORS.map((color) => (_jsx("button", { "aria-label": `颜色 ${color}`, className: "board-stage-color-swatch", "data-selected": activeColor === color ? 'true' : 'false', onClick: () => onChangeColor(color), style: { backgroundColor: color }, type: "button" }, color))), _jsx("div", { className: "board-stage-color-picker", children: _jsx(ColorPicker, { onChange: (value) => {
                                                    const hex = typeof value === 'string' ? value : value?.toHexString?.() ?? String(value);
                                                    onChangeColor(hex);
                                                }, size: "small", value: activeColor }) })] })] }), _jsxs("div", { className: "board-stage-settings-panel__section", children: [_jsx("strong", { children: "\u7C97\u7EC6" }), _jsx("div", { className: "board-stage-size-group", "aria-label": "\u6807\u6CE8\u7C97\u7EC6", children: STROKE_WIDTH_OPTIONS.map((width) => (_jsx("button", { "aria-label": `粗细 ${width}`, className: "board-stage-size-chip", "data-selected": activeStrokeWidth === width ? 'true' : 'false', onClick: () => onChangeStrokeWidth(width), type: "button", children: _jsx("span", { className: "board-stage-size-dot", style: { height: width, width } }) }, width))) })] })] }) })] }));
}

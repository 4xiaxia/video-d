import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// @cleanroom-component: CStickerStandalonePage
// @domain: standalone-prototype
// @slot: full-page
// @depends: BoardTextSticker
// @route-impact: standalone=c-sticker
import { Button, Input, Select, Slider, Space, Typography } from 'antd';
import { useMemo, useState } from 'react';
import { BoardTextSticker } from '../components/BoardTextSticker';
const { Text, Title } = Typography;
const FONT_OPTIONS = [
    { label: '平方乔木体', value: '"Xiaxia Qiaomu Board", "KaiTi", "STKaiti", serif' },
    { label: '陈雨洛雁体', value: '"ChenYuluoyan Board", "KaiTi", "STKaiti", serif' },
    { label: '楷体后备', value: '"KaiTi", "STKaiti", serif' },
];
const SAMPLE_TEXTS = [
    '25×4=100\n1200÷100=12',
    'A: 已知 y=2x+1\nB: 求 x=3 时 y 的值',
    '勾股定理：a^2+b^2=c^2',
];
const SAMPLE_FORMULA = 'f(x)=x^2+2x+1';
export function CStickerStandalonePage() {
    const [text, setText] = useState(SAMPLE_TEXTS[0]);
    const [fontFamily, setFontFamily] = useState(FONT_OPTIONS[0].value);
    const [fontSize, setFontSize] = useState(46);
    const [widthPercent, setWidthPercent] = useState(48);
    const [xPercent, setXPercent] = useState(50);
    const [yPercent, setYPercent] = useState(52);
    const [revealProgress, setRevealProgress] = useState(1);
    const [color, setColor] = useState('#171717');
    const fontLoadKey = useMemo(() => `standalone-${fontFamily}-${fontSize}`, [fontFamily, fontSize]);
    const asNumber = (value) => (Array.isArray(value) ? value[0] : value);
    return (_jsxs("div", { className: "c-standalone-page", children: [_jsxs("header", { className: "c-standalone-page__header", children: [_jsx(Title, { level: 4, children: "C \u5355\u4F53\u9884\u89C8" }), _jsx(Text, { type: "secondary", children: "\u4EC5\u9A8C\u8BC1 C \u8D34\u7247\u6E32\u67D3\u4E0E\u53EF\u8C03\u53C2\u6570\uFF0C\u4E0D\u8FDB\u5165\u4E3B\u94FE\u3002" })] }), _jsxs("section", { className: "c-standalone-page__controls", children: [_jsxs(Space, { size: 12, wrap: true, children: [_jsx(Button, { onClick: () => setText(SAMPLE_TEXTS[0]), children: "\u793A\u4F8B 1" }), _jsx(Button, { onClick: () => setText(SAMPLE_TEXTS[1]), children: "\u793A\u4F8B 2" }), _jsx(Button, { onClick: () => setText(SAMPLE_TEXTS[2]), children: "\u793A\u4F8B 3" }), _jsx(Button, { onClick: () => setText(SAMPLE_FORMULA), children: "\u516C\u5F0F\u8DEF\u7531" })] }), _jsx(Input.TextArea, { autoSize: { minRows: 2, maxRows: 5 }, onChange: (event) => setText(event.target.value), placeholder: "\u8F93\u5165\u8981\u9A8C\u8BC1\u7684 C \u6587\u672C", value: text }), _jsxs("div", { className: "c-standalone-grid", children: [_jsxs("label", { children: ["\u5B57\u4F53", _jsx(Select, { onChange: (value) => setFontFamily(value), options: FONT_OPTIONS, style: { width: 260 }, value: fontFamily })] }), _jsxs("label", { children: ["\u989C\u8272", _jsx(Input, { onChange: (event) => setColor(event.target.value), value: color })] }), _jsxs("label", { children: ["\u5B57\u53F7 ", fontSize, _jsx(Slider, { max: 96, min: 18, onChange: (value) => setFontSize(asNumber(value)), value: fontSize })] }), _jsxs("label", { children: ["\u5BBD\u5EA6% ", widthPercent, _jsx(Slider, { max: 88, min: 20, onChange: (value) => setWidthPercent(asNumber(value)), value: widthPercent })] }), _jsxs("label", { children: ["X% ", xPercent, _jsx(Slider, { max: 90, min: 10, onChange: (value) => setXPercent(asNumber(value)), value: xPercent })] }), _jsxs("label", { children: ["Y% ", yPercent, _jsx(Slider, { max: 88, min: 12, onChange: (value) => setYPercent(asNumber(value)), value: yPercent })] }), _jsxs("label", { children: ["\u663E\u9690\u8FDB\u5EA6 ", revealProgress.toFixed(2), _jsx(Slider, { max: 1, min: 0, onChange: (value) => setRevealProgress(asNumber(value)), step: 0.01, value: revealProgress })] })] })] }), _jsx("section", { className: "stage-canvas c-standalone-canvas", children: _jsx(BoardTextSticker, { color: color, fontFamily: fontFamily, fontLoadKey: fontLoadKey, fontSize: fontSize, isDragging: false, isSelected: true, onPointerDown: () => undefined, onResizePointerDown: () => undefined, revealProgress: revealProgress, stackIndex: 0, text: text, widthPercent: widthPercent, xPercent: xPercent, yPercent: yPercent }) })] }));
}

import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// @cleanroom-component: ProblemOcrCard
// @domain: teaching-assets
// @slot: left-sider/ocr-card
// @depends: future OCR result, TeachingProject.assets(problemText)
// @route-impact: App shell only
import { Button, Typography } from 'antd';
const { Text, Title } = Typography;
export function ProblemOcrCard() {
    return (_jsxs("section", { className: "problem-ocr-card", "aria-label": "\u9898\u76EE\u8BC6\u522B\u7ED3\u679C", children: [_jsx(Button, { block: true, className: "problem-ocr-button", size: "large", type: "default", children: "\u81EA\u52A8\u8BC6\u522B\u9898\u76EE" }), _jsxs("div", { className: "recognized-text-box", children: [_jsx(Title, { level: 5, children: "\u8BC6\u522B\u7ED3\u679C" }), _jsx(Text, { children: "\u8BC6\u522B\u7ED3\u679C\u6B63\u6587\uFF0C\u5982\u679C\u662F\u6CA1\u6709\u56FE\u7247\u7684\u9898\u76EE\uFF0C\u6587\u672C\u76F4\u63A5\u5165\u8FD9\u91CC\u3002" }), _jsxs("div", { className: "ocr-card-actions", children: [_jsx(Button, { size: "small", type: "text", children: "\u4FEE\u6539\u7F16\u8F91" }), _jsx(Button, { size: "small", type: "primary", children: "\u4E0B\u4E00\u6B65" })] })] })] }));
}

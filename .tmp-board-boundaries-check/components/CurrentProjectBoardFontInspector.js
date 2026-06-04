import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// @cleanroom-component: CurrentProjectBoardFontInspector
// @domain: inspector/c-current-font
// @slot: right-inspector/c-current-font-card
// @depends: StageCanvasConfig, BoardTypographyControlledFields
// @io-input: current project canvas typography fields
// @io-output: draft C default typography -> explicit apply -> onUpdateCanvas(canvas)
// @fields: canvas.boardFontName, canvas.boardFontSize, canvas.boardFontUrl, canvas.boardFontFamily
// @boundary: Current project C default typography only; not Canvas stage size/background, not per-clip C font fields
import { useEffect, useState } from 'react';
import { Button, Collapse, Space, Tag, Typography } from 'antd';
import { BoardTypographyControlledFields } from './BoardTypographyFields';
const { Text } = Typography;
export function CurrentProjectBoardFontInspector({ canvas, onUpdateCanvas, }) {
    const [draftCanvas, setDraftCanvas] = useState(canvas);
    useEffect(() => {
        setDraftCanvas(canvas);
    }, [canvas]);
    const hasDraftChanges = draftCanvas.boardFontName !== canvas.boardFontName ||
        draftCanvas.boardFontSize !== canvas.boardFontSize ||
        draftCanvas.boardFontUrl !== canvas.boardFontUrl ||
        draftCanvas.boardFontFamily !== canvas.boardFontFamily;
    return (_jsx(Collapse, { className: "zone-card zone-inspector current-project-board-font-collapse", defaultActiveKey: [], items: [
            {
                children: (_jsxs("div", { className: "canvas-inspector", children: [_jsx(Text, { type: "secondary", children: "\u5F53\u524D\u5DE5\u7A0B\u7684 C \u7D20\u6750\u9ED8\u8BA4\u4E66\u5199\u98CE\u683C\uFF1B\u5DF2\u9009\u4E2D\u7684\u5355\u4E2A C \u89D2\u8272\u5B57\u53F7\u4ECD\u5728\u53F3\u4FA7\u201C\u9009\u4E2D C \u89D2\u8272\u5185\u5BB9\u201D\u91CC\u8C03\u6574\u3002" }), _jsx(BoardTypographyControlledFields, { labelPrefix: "C \u9ED8\u8BA4", onChange: (patch) => setDraftCanvas({
                                ...draftCanvas,
                                ...patch,
                            }), value: draftCanvas }), _jsxs(Space, { children: [_jsx(Button, { disabled: !hasDraftChanges, onClick: () => onUpdateCanvas(draftCanvas), type: "primary", children: "\u5E94\u7528\u5230\u5F53\u524D\u5DE5\u7A0B" }), _jsx(Button, { disabled: !hasDraftChanges, onClick: () => setDraftCanvas(canvas), children: "\u653E\u5F03\u4FEE\u6539" })] }), _jsx(Text, { type: "secondary", children: "\u8FD9\u662F C \u7D20\u6750\u7684\u9ED8\u8BA4\u5B57\u4F53\u5165\u53E3\uFF0C\u4E0D\u6539\u53D8\u753B\u5E03\u5C3A\u5BF8\u3001\u80CC\u666F\u3001A \u8BED\u97F3\u6216 B \u5BFF\u547D\uFF1B\u5B57\u4F53\u5730\u5740\u53EF\u586B HTTPS \u5728\u7EBF\u5B57\u4F53 CSS\u3002" })] })),
                extra: _jsx(Tag, { color: "green", children: "C" }),
                key: 'current-project-board-font',
                label: 'C 默认字体 / 当前工程',
            },
        ] }));
}

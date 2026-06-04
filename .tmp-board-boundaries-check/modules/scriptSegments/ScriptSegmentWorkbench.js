import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// @cleanroom-component: ScriptSegmentWorkbench
// @domain: script-segmentation-preview
// @slot: script-board-summary + voice-workspace
// @depends: createScriptSegments
// @io-input: scriptText, optional onEditScript
// @io-output: visual A/B segment confirmation only
// @boundary: read-only projection; split/merge must edit original <br> text elsewhere
import { AudioOutlined, EditOutlined, FormOutlined } from '@ant-design/icons';
import { Button, Empty, Flex, Space, Statistic, Tag, Typography } from 'antd';
import { useMemo } from 'react';
import { FormulaText } from '../../components/FormulaText';
import { createScriptSegments } from './createScriptSegments';
import { readUserFacingSegmentLabel } from './scriptSegmentDisplayLabels';
import { countAllowedBoardMarkers, readAllowedBoardMarkers } from './scriptSegmentBoardMarkers';
const { Text } = Typography;
export function ScriptSegmentWorkbench({ actionLabel = '调整文稿', emptyText = '确认讲解稿后，会显示将生成的讲解片段。', maxVisibleSegments = 8, onEditScript, scriptChainKeys, scriptText, title = '生成前确认', }) {
    const segments = useMemo(() => createScriptSegments(scriptText, { chainKeys: scriptChainKeys }), [scriptChainKeys, scriptText]);
    const visibleSegments = segments.slice(0, maxVisibleSegments);
    const hiddenCount = Math.max(0, segments.length - visibleSegments.length);
    const boardMarkerCount = countAllowedBoardMarkers(segments);
    const estimatedSeconds = Math.round(segments.reduce((total, segment) => total + (segment.estimatedDurationMs ?? 0), 0) / 1000);
    // @xiaxia-c-candidate-copy: boardSlice markers are C material candidates before A audio and B lifetime generation.
    return (_jsxs("section", { className: "script-segment-workbench", "aria-label": title, children: [_jsxs(Flex, { className: "script-segment-workbench__head", align: "center", justify: "space-between", gap: 10, wrap: "wrap", children: [_jsxs(Space, { size: 8, wrap: true, children: [_jsx(Tag, { color: "geekblue", children: title }), _jsx(Text, { type: "secondary", children: "\u6309\u6362\u884C\u751F\u6210\u97F3\u9891\u7247\u6BB5" })] }), onEditScript ? (_jsx(Button, { icon: _jsx(EditOutlined, {}), onClick: onEditScript, size: "small", children: actionLabel })) : null] }), _jsxs("div", { className: "script-segment-workbench__stats", children: [_jsx(Statistic, { prefix: _jsx(AudioOutlined, {}), title: "\u8BB2\u89E3\u7247\u6BB5", value: segments.length, suffix: "\u6BB5" }), _jsx(Statistic, { prefix: _jsx(FormOutlined, {}), title: "\u677F\u4E66\u5019\u9009", value: boardMarkerCount, suffix: "\u4E2A" }), _jsx(Statistic, { title: "\u9884\u8BA1\u65F6\u957F", value: estimatedSeconds || 0, suffix: "\u79D2" })] }), segments.length ? (_jsxs("div", { className: "script-segment-workbench__list", children: [visibleSegments.map((segment, segmentIndex) => (_jsxs("article", { className: "script-segment-workbench__row", children: [_jsxs("div", { className: "script-segment-workbench__rail", children: [_jsx("span", { children: readUserFacingSegmentLabel(segment.chainKey, segmentIndex) }), _jsx("small", { children: segment.estimatedDurationMs ? `${Math.round(segment.estimatedDurationMs / 1000)}s` : '待测' })] }), _jsxs("div", { className: "script-segment-workbench__body", children: [_jsx(FormulaText, { as: "p", className: "script-segment-workbench__text", children: segment.text }), readAllowedBoardMarkers(segment).length ? (_jsx("div", { className: "script-segment-workbench__boards", children: readAllowedBoardMarkers(segment).map((marker, markerIndex) => (_jsx(Tag, { color: "purple", children: _jsx(FormulaText, { className: "script-segment-workbench__board-text", children: marker.text }) }, `${segment.id}-${markerIndex}`))) })) : (_jsx(Text, { className: "script-segment-workbench__plain", type: "secondary", children: "\u672C\u6BB5\u6CA1\u6709\u677F\u4E66\u5185\u5BB9" }))] })] }, segment.id))), hiddenCount ? (_jsxs(Text, { className: "script-segment-workbench__more", type: "secondary", children: ["\u8FD8\u6709 ", hiddenCount, " \u6BB5\u672A\u5C55\u5F00\uFF0C\u751F\u6210\u97F3\u9891\u65F6\u4F1A\u6309\u540C\u4E00\u89C4\u5219\u5904\u7406\u3002"] })) : null] })) : (_jsx(Empty, { description: emptyText, image: Empty.PRESENTED_IMAGE_SIMPLE }))] }));
}

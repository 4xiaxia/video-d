import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// @cleanroom-component: ScriptSegmentPreview
// @domain: script-segmentation-preview
// @slot: script-board-summary + voice-workspace
// @depends: createScriptSegments
// @io-input: scriptText
// @io-output: visual <br> segment preview only
// @boundary: read-only projection; no store writes, no TTS request, no B timeline generation
import { Alert, Empty, Flex, Space, Tag, Typography } from 'antd';
import { useMemo } from 'react';
import { FormulaText } from '../../components/FormulaText';
import { createScriptSegments } from './createScriptSegments';
import { readUserFacingSegmentLabel } from './scriptSegmentDisplayLabels';
import { countAllowedBoardMarkers, readAllowedBoardMarkers } from './scriptSegmentBoardMarkers';
const { Text } = Typography;
export function ScriptSegmentPreview({ emptyText = '暂无按换行生成的讲解片段。', maxVisibleSegments = 8, scriptChainKeys, scriptText, title = '智能断句预览', }) {
    const segments = useMemo(() => createScriptSegments(scriptText, { chainKeys: scriptChainKeys }), [scriptChainKeys, scriptText]);
    const visibleSegments = segments.slice(0, maxVisibleSegments);
    const hiddenCount = Math.max(0, segments.length - visibleSegments.length);
    const markerCount = countAllowedBoardMarkers(segments);
    // @xiaxia-c-candidate-copy: boardSlice markers are C material candidates, not a B/C timeline track.
    return (_jsxs("section", { className: "script-segment-preview", "aria-label": title, children: [_jsxs(Flex, { align: "center", className: "script-segment-preview__header", justify: "space-between", gap: 8, wrap: "wrap", children: [_jsxs(Space, { size: 6, wrap: true, children: [_jsx(Tag, { color: "blue", children: title }), _jsxs(Tag, { color: segments.length ? 'cyan' : 'default', children: [segments.length, " \u4E2A\u5206\u7247"] }), _jsxs(Tag, { color: markerCount ? 'purple' : 'default', children: [markerCount, " \u4E2A\u677F\u4E66\u5019\u9009"] })] }), _jsx(Text, { type: "secondary", children: "\u4EC5\u6309\u6362\u884C\u5206\u6BB5" })] }), _jsx(Alert, { className: "script-segment-preview__rule", message: "AI \u53EF\u4EE5\u5EFA\u8BAE\u65AD\u53E5\uFF1B\u6362\u884C\u4EE3\u8868\u4E00\u6B21\u660E\u663E\u505C\u987F\u548C\u4E00\u6BB5\u8BB2\u89E3\u97F3\u9891\uFF0C\u4E0D\u662F\u6BCF\u53E5\u8BDD\u90FD\u5207\u3002\u5206\u7247\u6570\u91CF\u6CA1\u6709\u56FA\u5B9A\u4E0A\u9650\uFF0C\u4EE5\u6B65\u9AA4\u6E05\u695A\u3001\u64AD\u653E\u8282\u594F\u81EA\u7136\u4E3A\u51C6\u3002", showIcon: true, type: "info" }), segments.length > 10 ? (_jsx(Alert, { className: "script-segment-preview__rule", message: `当前有 ${segments.length} 个分片。请确认每段都在讲一个清楚动作；如果只是口语过渡，可以合并相邻分片。`, showIcon: true, type: "info" })) : null, segments.length ? (_jsxs("div", { className: "script-segment-preview__list", children: [visibleSegments.map((segment, segmentIndex) => (_jsxs("article", { className: "script-segment-preview__item", children: [_jsxs(Flex, { align: "center", justify: "space-between", gap: 8, wrap: "wrap", children: [_jsxs(Space, { size: 6, wrap: true, children: [_jsx(Tag, { color: "gold", children: readUserFacingSegmentLabel(segment.chainKey, segmentIndex) }), readAllowedBoardMarkers(segment).length ? _jsxs(Tag, { color: "purple", children: ["\u542B\u677F\u4E66 ", readAllowedBoardMarkers(segment).length] }) : null] }), segment.estimatedDurationMs ? (_jsxs(Text, { type: "secondary", children: ["\u7EA6 ", Math.round(segment.estimatedDurationMs / 1000), " \u79D2"] })) : null] }), _jsx(FormulaText, { as: "p", className: "script-segment-preview__text", children: segment.text }), readAllowedBoardMarkers(segment).length ? (_jsx("div", { className: "script-segment-preview__markers", children: readAllowedBoardMarkers(segment).map((marker, markerIndex) => (_jsx(Tag, { color: "purple", children: _jsx(FormulaText, { className: "script-segment-preview__marker-text", children: marker.text }) }, `${segment.id}-${markerIndex}`))) })) : null] }, segment.id))), hiddenCount ? _jsxs(Text, { type: "secondary", children: ["\u8FD8\u6709 ", hiddenCount, " \u4E2A\u5206\u7247\u672A\u5C55\u5F00\uFF0C\u53EF\u5728\u8BED\u97F3\u6B65\u9AA4\u67E5\u770B\u5B8C\u6574\u5217\u8868\u3002"] }) : null] })) : (_jsx(Empty, { description: emptyText, image: Empty.PRESENTED_IMAGE_SIMPLE }))] }));
}

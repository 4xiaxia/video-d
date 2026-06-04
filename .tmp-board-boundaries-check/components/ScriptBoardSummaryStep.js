import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// @cleanroom-component: ScriptBoardSummaryStep
// @domain: script-agent-interface
// @slot: left-sider/script-board-summary-step
// @depends: TeachingProject.assets(scriptText/boardLayout), onOpenScriptAgent
// @feature-branch: script-agent-interface
// @feature-branch: script-board-combined-output
// ID: cleanroom-assets-script-board-step-001
// @io-input: scriptTextAsset, boardLayoutAsset, onOpenScriptAgent
// @io-output: onOpenScriptAgent()
// @route: left-sider/assets/script-board
// @fields: TeachingProject.assets(kind=scriptText), TeachingProject.assets(kind=boardLayout)
// @boundary: workflow step summary only; real editing stays in ScriptAgentWorkspace Drawer
import { EditOutlined, FileTextOutlined } from '@ant-design/icons';
import { Button, Card, Flex, Space, Tag, Typography } from 'antd';
import { useMemo } from 'react';
import { readScriptChainKeysSourceRef } from '../modules/abcChain/abcChainKey';
import { ScriptSegmentWorkbench } from '../modules/scriptSegments';
import { BoardPreviewCard } from './BoardPreviewCard';
import { MathText } from './MathText';
const { Text, Title } = Typography;
export function ScriptBoardSummaryStep({ boardLayoutAsset, canOpenAgent, onOpenScriptAgent, onGenerateScriptAgent, scriptTextAsset, layoutPreviewDraft, stageCanvas, }) {
    const scriptChainKeys = useMemo(() => readScriptChainKeysSourceRef(scriptTextAsset?.sourceRef), [scriptTextAsset?.sourceRef]);
    return (_jsxs("div", { className: "script-board-summary-step", children: [_jsx(Card, { size: "small", children: _jsxs(Flex, { align: "center", justify: "space-between", gap: 12, children: [_jsxs(Space, { children: [_jsx(FileTextOutlined, {}), _jsxs("div", { children: [_jsx(Title, { level: 5, children: "\u6587\u7A3F\u4E0E\u677F\u4E66" }), _jsx(Text, { type: "secondary", children: "\u5148\u786E\u8BA4\u5185\u5BB9\uFF0C\u518D\u751F\u6210\u97F3\u9891\u548C\u65F6\u95F4\u8F74\u3002" })] })] }), _jsxs(Space, { children: [_jsx(Button, { disabled: !canOpenAgent, icon: _jsx(EditOutlined, {}), onClick: onOpenScriptAgent, children: "\u6253\u5F00\u67E5\u770B" }), _jsx(Button, { disabled: !canOpenAgent, icon: _jsx(FileTextOutlined, {}), onClick: onGenerateScriptAgent, type: "primary", children: "\u91CD\u65B0\u751F\u6210" })] })] }) }), _jsxs(Card, { size: "small", children: [_jsxs(Flex, { align: "center", justify: "space-between", children: [_jsx(Tag, { color: "blue", children: "\u8BB2\u89E3\u7A3F" }), _jsx(Tag, { color: scriptTextAsset?.status === 'ready' ? 'green' : 'orange', children: scriptTextAsset?.status === 'ready' ? '已确认' : '待校准' })] }), _jsx(MathText, { as: "div", className: "script-board-summary-text", children: scriptTextAsset?.summary || '等待 Agent 生成讲解文稿。' }), _jsx(ScriptSegmentWorkbench, { actionLabel: "\u56DE Agent \u8C03\u6574", maxVisibleSegments: 5, onEditScript: canOpenAgent ? onOpenScriptAgent : undefined, scriptChainKeys: scriptChainKeys, scriptText: scriptTextAsset?.summary ?? '', title: "\u5206\u6BB5\u786E\u8BA4" })] }), _jsxs(Card, { size: "small", children: [_jsxs(Flex, { align: "center", justify: "space-between", children: [_jsx(Tag, { color: "blue", children: "\u677F\u4E66\u5019\u9009" }), _jsx(Tag, { color: boardLayoutAsset?.status === 'ready' ? 'green' : 'orange', children: boardLayoutAsset?.status === 'ready' ? '已确认' : '待校准' })] }), _jsx(MathText, { as: "div", className: "script-board-summary-text", children: boardLayoutAsset?.summary || '等待 Agent 生成板书候选。' })] }), _jsx(BoardPreviewCard, { draft: layoutPreviewDraft, stageCanvas: stageCanvas })] }));
}

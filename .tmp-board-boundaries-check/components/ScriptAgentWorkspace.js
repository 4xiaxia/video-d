import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// @cleanroom-component: ScriptAgentWorkspace
// @domain: script-agent-interface
// @slot: script-workspace
// @depends: TeachingProject.assets(problemText/scriptText/boardLayout), defaultConfig.scriptAgent, defaultConfig.vectorKb
// @feature-branch: script-agent-interface
// @feature-branch: agent-knowledge-base
// @feature-branch: vector-kb-interface
// @feature-branch: customer-agent-adapter
// @feature-branch: script-board-combined-output
// @feature-branch: script-sync-marker
// @feature-branch: board-plan-output
// @route-impact: App shell right/center workspace, future route: script-workspace
// ID: cleanroom-agent-script-workspace-001
// 💾 数据: problemText -> scriptText + boardLayout
// 🔌 事件: AgentReviewCard.apply -> onApplyDraft; rows table change/compile -> candidate edit; toolbar.apply -> formal draft
// 📦 转换: 候选 ScriptAgentDraft -> TeachingProject.assets(scriptText/boardLayout)
// @io-input: TeachingProject.assets(problemText/scriptText/boardLayout)
// @io-output: onApplyDraft(draft)
// @route: App Modal(title=文稿与 C 素材 Agent)
// @fields: problemText -> ScriptAgentDraft -> scriptText + boardLayout
// @api-needed: script-board-agent-api | trigger: user next / agent chat send | config: defaultConfig.scriptAgent + defaultConfig.vectorKb | output: ScriptAgentDraft
// @boundary: AntD Card/Input/Typography compose UI; candidate draft is not truth until apply; no TTS/timeline writes here
import { CheckOutlined, HighlightOutlined } from '@ant-design/icons';
import { Alert, Button, Card, Space, Splitter, Tag, Typography } from 'antd';
import { useState } from 'react';
import { AgentReviewCard } from './AgentReviewCard';
import { createScriptAgentDraftSignature, hasScriptAgentDraftContent } from '../modules/scriptAgentDraft';
import { ScriptAgentTableEditor } from '../modules/scriptAgentTable/ScriptAgentTableEditor';
const { Text, Title } = Typography;
export function ScriptAgentWorkspace({ autoApplyDraft, autoRunRequestId, assets, candidateDraft, scriptAgentConfig, onApplyDraft, onCandidateDraftChange, }) {
    const problemText = assets.find((asset) => asset.kind === 'problemText')?.summary ?? '';
    const candidateSignature = createScriptAgentDraftSignature(candidateDraft);
    const candidateRows = candidateDraft.rows ?? [];
    const [appliedSignature, setAppliedSignature] = useState('');
    const hasCandidateDraft = hasScriptAgentDraftContent(candidateDraft);
    const isCandidateApplied = hasCandidateDraft && appliedSignature === candidateSignature;
    const handleApplyCandidateDraft = () => {
        onApplyDraft(candidateDraft);
        setAppliedSignature(candidateSignature);
    };
    return (_jsx("section", { className: "script-agent-workspace", children: _jsxs(Splitter, { className: "script-agent-splitter", children: [_jsx(Splitter.Panel, { defaultSize: "38%", min: "360px", children: _jsxs("aside", { className: "script-agent-side", children: [_jsxs(Space, { align: "center", className: "script-agent-side-header", wrap: true, children: [_jsx(Title, { level: 5, children: "\u5BF9\u8BDD" }), scriptAgentConfig.modelName ? _jsx(Tag, { color: "green", children: scriptAgentConfig.modelName }) : null] }), _jsx(AgentReviewCard, { autoApplyDraft: autoApplyDraft, autoRunRequestId: autoRunRequestId, draft: candidateDraft, onCandidateDraftChange: onCandidateDraftChange, problemText: problemText, scriptAgentConfig: scriptAgentConfig, onApplyDraft: onApplyDraft })] }) }), _jsx(Splitter.Panel, { defaultSize: "62%", min: "700px", children: _jsxs("main", { className: "script-agent-preview-frame", children: [_jsx(FlexHeader, { autoApplyDraft: autoApplyDraft, hasCandidateDraft: hasCandidateDraft, isCandidateApplied: isCandidateApplied, onApplyCandidateDraft: handleApplyCandidateDraft, scriptAgentConfig: scriptAgentConfig }), _jsx("div", { className: "script-agent-main", children: _jsx(Card, { className: "script-field-card", extra: _jsx(Text, { type: "secondary", children: "\u53EF\u76F4\u63A5\u6539" }), size: "small", title: _jsxs(Space, { children: [_jsx(HighlightOutlined, {}), _jsx(Text, { strong: true, children: "\u8BB2\u89E3\u5207\u7247\u5019\u9009" }), _jsx(Tag, { color: "geekblue", children: "rows" })] }), children: _jsx(ScriptAgentTableEditor, { onCompile: (rows) => onCandidateDraftChange({
                                            boardPlan: '',
                                            rows,
                                            spokenScript: '',
                                        }), onChange: (rows) => onCandidateDraftChange({
                                            boardPlan: '',
                                            rows,
                                            spokenScript: '',
                                        }), rows: candidateRows }) }) })] }) })] }) }));
}
function FlexHeader({ autoApplyDraft, hasCandidateDraft, isCandidateApplied, onApplyCandidateDraft, scriptAgentConfig, }) {
    return (_jsxs(Card, { className: "script-agent-preview-toolbar", size: "small", children: [_jsxs(Space, { align: "center", className: "script-agent-preview-toolbar-inner", wrap: true, children: [_jsxs(Space, { wrap: true, children: [_jsx(Text, { strong: true, children: "\u8BB2\u89E3\u5207\u7247\u5019\u9009" }), _jsx(Tag, { color: autoApplyDraft ? 'red' : 'orange', children: autoApplyDraft ? '无人值守免审' : '人工确认' })] }), _jsx(Button, { disabled: !hasCandidateDraft || isCandidateApplied, icon: _jsx(CheckOutlined, {}), onClick: onApplyCandidateDraft, type: "primary", children: isCandidateApplied ? '已应用到正式稿' : '确认应用到正式稿' })] }), isCandidateApplied ? (_jsx(Alert, { className: "script-agent-apply-feedback", title: "\u5DF2\u5E94\u7528\uFF1A\u6587\u7A3F\u548C\u677F\u4E66\u5019\u9009\u5DF2\u5199\u5165\u6B63\u5F0F\u9884\u89C8\uFF0C\u53EF\u4EE5\u7EE7\u7EED\u751F\u6210\u8BED\u97F3\u548C\u65F6\u95F4\u8F74\u3002", showIcon: true, type: "success" })) : null] }));
}

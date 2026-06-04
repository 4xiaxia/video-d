import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// @cleanroom-component: ProblemWorkspace
// @domain: teaching-assets
// @slot: left-sider/problem-workspace
// @depends: TeachingProject.assets(problemImage/problemText/scriptText)
// @feature-branch: problem-text-edit
// @feature-branch: script-agent-interface
// ID: cleanroom-assets-problem-edit-001
// 💾 数据: problemText.summary -> ScriptAgentWorkspace problem context
// 🔌 事件: editable.onChange -> onUpdateProblemText; 讲解生成 -> onGenerateScriptAgent
// ⚠️ 边界: 这里只改题文，不生成 TTS，不写 timeline
// @io-input: imageAsset, textAsset, scriptTextAsset, onUpdateProblemText, onOpenScriptAgent, onGenerateScriptAgent
// @io-output: onUpdateProblemText(text), onOpenScriptAgent(), onGenerateScriptAgent()
// @route: App shell / left sider / assets problem tab
// @fields: TeachingProject.assets(kind=problemText), TeachingProject.assets(kind=scriptText).status
// @api-needed: recognition-ai-api | trigger: import/confirm problem image or text | output: TeachingProject.assets(kind=problemText)
// @boundary: problem text editing and agent entry only; no TTS, no board events, no timeline writes
import { EditOutlined } from '@ant-design/icons';
import { Alert, Button, Flex, Input, Space, Tag, Typography } from 'antd';
import { useState } from 'react';
import { MathText } from './MathText';
import { ProblemUploadPreview } from './ProblemUploadPreview';
const { Text } = Typography;
export function ProblemWorkspace({ boardSummary, hasConfirmedBoard, imageAsset, isRecognizingProblem, onConfirmProblemText, onGenerateScriptAgent, onImportProblemImage, onOpenScriptAgent, onUpdateProblemText, recognitionConfig, recognitionError, scriptTextAsset, textAsset, }) {
    const problemText = textAsset?.summary.trim() ?? '';
    const displayedProblemText = textAsset?.summary || '识别结果正文，如果是没有图片的题目，文本直接入这里。';
    const isProblemConfirmed = textAsset?.status === 'ready' && Boolean(problemText);
    const hasProblemText = Boolean(problemText);
    const [isEditingProblemText, setIsEditingProblemText] = useState(false);
    const handlePrimaryAction = () => {
        if (!hasProblemText)
            return;
        if (!isProblemConfirmed) {
            onConfirmProblemText();
        }
        onGenerateScriptAgent();
    };
    return (_jsxs("div", { className: "problem-workspace", children: [_jsxs("section", { className: "problem-intake-card", children: [_jsxs(Flex, { align: "center", className: "problem-intake-status", justify: "space-between", wrap: "wrap", children: [_jsx(Text, { strong: true, children: "\u9898\u76EE\u8F93\u5165" }), _jsxs(Space, { size: 6, wrap: true, children: [_jsx(Tag, { color: imageAsset ? 'blue' : 'default', children: imageAsset ? '图片已上传' : '等待上传' }), _jsx(Tag, { color: isRecognizingProblem ? 'processing' : 'default', children: isRecognizingProblem ? '识别中' : recognitionConfig.modelName })] })] }), _jsx(ProblemUploadPreview, { asset: imageAsset, boardSummary: boardSummary, hasConfirmedBoard: hasConfirmedBoard, onImportProblemImage: onImportProblemImage }), recognitionError ? _jsx(Alert, { showIcon: true, title: recognitionError, type: "error" }) : null] }), _jsxs("section", { className: "recognized-result-card", children: [_jsxs(Flex, { align: "center", justify: "space-between", children: [_jsx(Text, { className: "recognized-result-title", strong: true, children: "\u9898\u6587\u786E\u8BA4" }), _jsxs(Space, { size: 6, children: [_jsx(Tag, { color: isProblemConfirmed ? 'green' : 'orange', children: isProblemConfirmed ? '已确认' : '待确认' }), _jsx(Button, { icon: _jsx(EditOutlined, {}), onClick: () => setIsEditingProblemText((current) => !current), size: "small", type: "text", children: "\u4FEE\u6539" })] })] }), isEditingProblemText ? (_jsx(Input.TextArea, { autoFocus: true, autoSize: { minRows: 5, maxRows: 10 }, className: "recognized-result-text recognized-result-text--editor math-editor-input", onBlur: (event) => {
                            const nextFocused = event.relatedTarget;
                            if (nextFocused instanceof HTMLElement &&
                                nextFocused.closest('.recognized-result-card')) {
                                return;
                            }
                            setIsEditingProblemText(false);
                        }, onChange: (event) => onUpdateProblemText(event.target.value), value: textAsset?.summary ?? '' })) : (_jsx("button", { className: "recognized-result-text recognized-result-text--display", onClick: () => setIsEditingProblemText(true), type: "button", children: _jsx(MathText, { as: "span", children: displayedProblemText }) })), scriptTextAsset?.status === 'ready' ? (_jsxs("div", { className: "script-confirmed-tip", children: [_jsx(Tag, { color: "green", children: "\u6587\u7A3F\u5DF2\u5E94\u7528" }), _jsx(Text, { type: "secondary", children: "\u6587\u672C\u6846\u4ECD\u53EF\u624B\u5DE5\u7F16\u8F91\u3002" })] })) : null, _jsxs(Flex, { gap: 8, vertical: true, children: [_jsx(Text, { type: "secondary", children: "\u70B9\u51FB\u6B63\u6587\u5373\u53EF\u7F16\u8F91\uFF1B\u9605\u8BFB\u6001\u4FDD\u7559\u6570\u5B66\u516C\u5F0F\u663E\u793A\u3002" }), _jsx(Button, { block: true, className: "problem-primary-action", disabled: !hasProblemText, onClick: handlePrimaryAction, type: "primary", children: "\u8BB2\u89E3\u751F\u6210" }), _jsx(Button, { block: true, disabled: !isProblemConfirmed, onClick: onOpenScriptAgent, children: "\u6253\u5F00\u6587\u7A3F\u4E0E C \u7D20\u6750 Agent" })] }), !isProblemConfirmed ? (_jsx(Text, { className: "problem-merge-tip", type: "secondary", children: "\u5148\u786E\u8BA4\u9898\u6587\uFF0C\u624D\u80FD\u628A\u5B83\u4EA4\u7ED9\u6587\u7A3F\u6A21\u578B\u751F\u6210 rows \u8BB2\u89E3\u548C C \u7D20\u6750\u5019\u9009\u3002" })) : (_jsx(Text, { className: "problem-merge-tip", type: "secondary", children: "\u5DF2\u786E\u8BA4\u9898\u6587\u4F1A\u4F5C\u4E3A Agent \u7684\u6B63\u5F0F\u8F93\u5165\u3002" }))] }), _jsx(Text, { className: "problem-merge-tip", type: "secondary", children: "\u9898\u56FE\u548C\u9898\u6587\u4E8C\u5408\u4E00\uFF0C\u51CF\u5C11\u5360\u7528\u3002" })] }));
}

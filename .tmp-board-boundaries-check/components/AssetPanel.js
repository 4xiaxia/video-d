import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// @cleanroom-component: AssetPanel
// @domain: teaching-assets
// @slot: left-sider
// @depends: TeachingProject.assets, importProblemImage action, future recognition-ai-config
// @feature-branch: recognition-ai-config
// @feature-branch: problem-text-edit
// @feature-branch: script-agent-interface
// @feature-branch: agent-draft-apply
// @data-map: problemText -> ProblemWorkspace.recognized-result-text -> updateProblemText -> ScriptAgentWorkspace.problem-context-box
// @data-map: boardLayout -> ProblemUploadPreview.board-confirm-overlay -> applyScriptAgentDraft/updateBoardLayout
// @event-map: ProblemWorkspace.next -> onOpenScriptAgent -> App.scriptAgentOpen Drawer
// @route-impact: App shell only
// ID: cleanroom-assets-panel-root-001
// 💾 数据: TeachingProject.assets
// 🔌 事件: importProblemImage / updateProblemText / openScriptAgent
// 🧩 后续拆分: ProblemUploadPreview, ProblemWorkspace, VoiceWorkspace, AssetList
// @io-input: assets, onImportProblemImage, onOpenScriptAgent, onGenerateScriptAgent, onUpdateProblemText, onApplyBoardEventsToTimeline, onSyncCAssetPrewarmQueue
// @io-output: none direct; delegates child events upward
// @route: App shell / left sider / asset room
// @fields: TeachingProject.assets(problemImage/problemText/scriptText/boardLayout/voiceAudio/voiceTiming/exportResult), TeachingProject.timeline.clips(kind=board)
// @boundary: assembly only; no OCR, no real TTS; timeline write is delegated via explicit callback
import { CheckCircleFilled, ClockCircleFilled } from '@ant-design/icons';
import { Button, Card, Flex, message, Progress, Space, Tag, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { requestProblemTextRecognition } from '../services/recognitionGatewayClient';
import { getAssetWorkflowRailSteps, getAssetWorkflowStage, visibleWorkflowStepIds } from '../workflow/assetWorkflowFlow';
import { createAssetWorkflowSteps } from '../workflow/createAssetWorkflowSteps';
import { AssetWorkflowTabs } from './AssetWorkflowTabs';
const { Text, Title } = Typography;
export function AssetPanel({ assets, automationConfig, recognitionConfig, ttsConfig, scriptAgentConfig, scriptAgentCandidateDraft, layoutPreviewDraft, onImportProblemImage, onApplyBoardEventsToTimeline, onSyncCAssetPrewarmQueue, onApplyTtsSentenceResults, onSyncLayoutPreviewDraft, onApplyRecognizedProblemText, onConfirmProblemText, onGenerateScriptAgent, onOpenScriptAgent, onUpdateProblemText, stageCanvas, requestedWorkflowKey, requestedWorkflowRequestId, }) {
    const [messageApi, contextHolder] = message.useMessage();
    const [isRecognizingProblem, setIsRecognizingProblem] = useState(false);
    const [recognitionError, setRecognitionError] = useState('');
    const [activeWorkflowKey, setActiveWorkflowKey] = useState('problem');
    const readyAssets = assets.filter((asset) => asset.status === 'ready' || asset.status === 'done').length;
    const completionPercent = Math.round((readyAssets / Math.max(assets.length, 1)) * 100);
    const currentImage = assets.find((asset) => asset.kind === 'problemImage' && asset.sourceRef);
    const problemText = assets.find((asset) => asset.kind === 'problemText');
    const scriptText = assets.find((asset) => asset.kind === 'scriptText');
    const boardLayout = assets.find((asset) => asset.kind === 'boardLayout');
    const voiceAudio = assets.find((asset) => asset.kind === 'voiceAudio');
    const hasConfirmedBoard = Boolean(boardLayout?.summary?.trim()) && boardLayout?.status === 'ready';
    const isProblemConfirmed = problemText?.status === 'ready' && Boolean(problemText.summary.trim());
    const isScriptReady = scriptText?.status === 'ready' && Boolean(scriptText.summary.trim());
    const isBoardReady = boardLayout?.status === 'ready' && Boolean(boardLayout.summary.trim());
    const isVoiceReady = voiceAudio?.status === 'ready';
    const workflowReadiness = {
        hasConfirmedBoard,
        isBoardReady,
        isProblemConfirmed,
        isScriptReady,
        isVoiceReady,
    };
    const workflowStage = getAssetWorkflowStage(workflowReadiness);
    const railSteps = getAssetWorkflowRailSteps(workflowReadiness);
    useEffect(() => {
        if (requestedWorkflowKey) {
            setActiveWorkflowKey(requestedWorkflowKey);
        }
    }, [requestedWorkflowKey, requestedWorkflowRequestId]);
    const handleWorkflowPrimaryAction = () => {
        if (!isProblemConfirmed) {
            if (problemText?.summary.trim()) {
                onConfirmProblemText();
                setActiveWorkflowKey('scriptBoard');
                return;
            }
            setActiveWorkflowKey('problem');
            return;
        }
        setActiveWorkflowKey(workflowStage.targetKey);
        if (workflowStage.targetKey === 'scriptBoard' && (!isScriptReady || !isBoardReady)) {
            onOpenScriptAgent();
        }
    };
    const handleRecognizeProblemImage = async (file) => {
        if (recognitionConfig.provider === 'manual-first') {
            setRecognitionError('当前是手动优先模式，请直接编辑题文后确认。');
            return;
        }
        setIsRecognizingProblem(true);
        setRecognitionError('');
        try {
            const recognizedText = await requestProblemTextRecognition({
                config: recognitionConfig,
                imageFile: file,
            });
            if (automationConfig.mode === 'unattended') {
                onApplyRecognizedProblemText(recognizedText, true);
                onGenerateScriptAgent();
                messageApi.success('题图识别完成，已按自动免审模式进入文稿生成。');
            }
            else {
                onApplyRecognizedProblemText(recognizedText, false);
                messageApi.success('题图识别完成，请核对后确认题文。');
            }
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            setRecognitionError(errorMessage);
            messageApi.error(errorMessage);
        }
        finally {
            setIsRecognizingProblem(false);
        }
    };
    const handleImportProblemImage = (file) => {
        onImportProblemImage(file);
        if (recognitionConfig.provider !== 'manual-first') {
            void handleRecognizeProblemImage(file);
        }
    };
    const steps = createAssetWorkflowSteps({
        assets,
        ttsConfig,
        scriptAgentConfig,
        scriptAgentCandidateDraft,
        layoutPreviewDraft,
        currentImage,
        recognitionConfig,
        recognitionError,
        isRecognizingProblem,
        boardLayout,
        onImportProblemImage: handleImportProblemImage,
        onApplyBoardEventsToTimeline,
        onSyncCAssetPrewarmQueue,
        onApplyTtsSentenceResults,
        onSyncLayoutPreviewDraft,
        stageCanvas,
        onConfirmProblemText,
        onGenerateScriptAgent,
        onOpenScriptAgent,
        onUpdateProblemText,
        problemText,
        scriptText,
    });
    const visibleSteps = steps.filter((step) => visibleWorkflowStepIds.has(step.id));
    return (_jsxs(Card, { className: "workflow-card", title: "\u751F\u6210\u6D41\u7A0B", extra: _jsx(Tag, { color: "cyan", children: "Workflow" }), children: [contextHolder, _jsxs("div", { className: "workflow-hero", children: [_jsxs("div", { children: [_jsx(Text, { className: "workflow-eyebrow", children: "\u4E0B\u4E00\u6B65" }), _jsx(Title, { level: 4, children: workflowStage.title }), _jsx(Text, { type: "secondary", children: workflowStage.description })] }), _jsx(Button, { icon: workflowStage.actionIcon, onClick: handleWorkflowPrimaryAction, type: "primary", children: workflowStage.actionLabel })] }), _jsx("div", { className: "workflow-rail", children: railSteps.map((step, index) => (_jsxs("button", { className: [
                        'workflow-step',
                        activeWorkflowKey === step.key ? 'is-active' : '',
                        step.done ? 'is-done' : '',
                    ].filter(Boolean).join(' '), onClick: () => setActiveWorkflowKey(step.key), type: "button", children: [step.done ? _jsx(CheckCircleFilled, { className: "workflow-step-icon is-done" }) : _jsx(ClockCircleFilled, { className: "workflow-step-icon" }), _jsxs("span", { children: [_jsxs("strong", { children: [index + 1, ". ", step.label] }), _jsx("small", { children: step.note })] })] }, step.key))) }), _jsxs(Flex, { align: "center", className: "workflow-progress-row", gap: 10, children: [_jsx(Progress, { percent: completionPercent, showInfo: false, size: "small", status: "active" }), _jsxs(Space, { size: 4, children: [_jsx(Tag, { color: isProblemConfirmed ? 'green' : 'orange', children: isProblemConfirmed ? '题文已确认' : '待确认题文' }), _jsx(Tag, { color: isVoiceReady ? 'green' : 'default', children: isVoiceReady ? '可播放' : '待生成音频' })] })] }), _jsx(AssetWorkflowTabs, { activeKey: activeWorkflowKey, onActiveKeyChange: (key) => {
                    if (visibleWorkflowStepIds.has(key)) {
                        setActiveWorkflowKey(key);
                    }
                }, steps: visibleSteps })] }));
}

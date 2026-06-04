import { jsx as _jsx } from "react/jsx-runtime";
import { AssetList } from '../components/AssetList';
import { ProblemWorkspace } from '../components/ProblemWorkspace';
import { ScriptBoardSummaryStep } from '../components/ScriptBoardSummaryStep';
import { VoiceWorkspace } from '../components/VoiceWorkspace';
export function createAssetWorkflowSteps({ assets, ttsConfig, scriptAgentConfig, scriptAgentCandidateDraft, layoutPreviewDraft, stageCanvas, currentImage, recognitionConfig, recognitionError, isRecognizingProblem, onImportProblemImage, onApplyBoardEventsToTimeline, onSyncCAssetPrewarmQueue, onApplyTtsSentenceResults, onSyncLayoutPreviewDraft, onConfirmProblemText, onGenerateScriptAgent, onOpenScriptAgent, onUpdateProblemText, problemText, boardLayout, scriptText, }) {
    const isProblemConfirmed = problemText?.status === 'ready' && Boolean(problemText.summary.trim());
    return [
        {
            boundary: 'Edits and confirms problemText before opening chat or explicitly requesting script-board generation; no TTS or timeline writes.',
            events: ['onUpdateProblemText(text)', 'onConfirmProblemText()', 'onOpenScriptAgent()', 'onGenerateScriptAgent()'],
            id: 'problem',
            inputFields: ['TeachingProject.assets(kind=problemImage)', 'TeachingProject.assets(kind=problemText)'],
            outputFields: ['TeachingProject.assets(kind=problemText)'],
            render: () => (_jsx(ProblemWorkspace, { imageAsset: currentImage, isRecognizingProblem: isRecognizingProblem, boardSummary: boardLayout?.summary, hasConfirmedBoard: Boolean(boardLayout?.summary?.trim()) && boardLayout?.status === 'ready', recognitionError: recognitionError, recognitionConfig: recognitionConfig, onConfirmProblemText: onConfirmProblemText, onGenerateScriptAgent: onGenerateScriptAgent, onImportProblemImage: onImportProblemImage, onOpenScriptAgent: onOpenScriptAgent, onUpdateProblemText: onUpdateProblemText, scriptTextAsset: scriptText, textAsset: problemText })),
            routeSlot: 'left-sider/assets/problem',
            status: problemText?.status === 'ready' ? 'ready' : 'needsInput',
            title: '题目',
        },
        {
            boundary: 'Summarizes scriptText and boardLayout; opens Agent Drawer for real generation/editing.',
            events: ['onOpenScriptAgent()'],
            id: 'scriptBoard',
            inputFields: ['TeachingProject.assets(kind=problemText)', 'TeachingProject.assets(kind=scriptText)', 'TeachingProject.assets(kind=boardLayout)'],
            outputFields: ['TeachingProject.assets(kind=scriptText)', 'TeachingProject.assets(kind=boardLayout)'],
            render: () => (_jsx(ScriptBoardSummaryStep, { boardLayoutAsset: boardLayout, canOpenAgent: isProblemConfirmed, onOpenScriptAgent: onOpenScriptAgent, onGenerateScriptAgent: onGenerateScriptAgent, scriptTextAsset: scriptText, layoutPreviewDraft: layoutPreviewDraft, stageCanvas: stageCanvas })),
            routeSlot: 'left-sider/assets/script-board',
            status: scriptText?.status === 'ready' && boardLayout?.status === 'ready' ? 'ready' : 'needsInput',
            title: '文稿/C素材候选',
        },
        {
            boundary: 'Requests local CosyVoice gateway only; the browser never receives or stores DASHSCOPE_API_KEY.',
            events: ['requestCosyVoiceSentences(sentences)', 'onApplyTtsSentenceResults(results)', 'onApplyBoardEventsToTimeline(BoardEvent[])'],
            id: 'voiceAudio',
            inputFields: ['TeachingProject.assets(kind=voiceAudio)', 'TeachingProject.assets(kind=voiceTiming)'],
            outputFields: ['TeachingProject.timeline.clips(kind=board)', 'TeachingProject.timeline.durationMs'],
            render: () => (_jsx(VoiceWorkspace, { assets: assets, ttsConfig: ttsConfig, scriptAgentConfig: scriptAgentConfig, scriptAgentCandidateDraft: scriptAgentCandidateDraft, stageCanvas: stageCanvas, onApplyBoardEventsToTimeline: onApplyBoardEventsToTimeline, onSyncCAssetPrewarmQueue: onSyncCAssetPrewarmQueue, onApplyTtsSentenceResults: onApplyTtsSentenceResults, onSyncLayoutPreviewDraft: onSyncLayoutPreviewDraft })),
            routeSlot: 'left-sider/assets/voice',
            status: 'available',
            title: '音频A轨',
        },
        createAssetListStep('voiceTiming', '语音时序', assets, ['TeachingProject.assets(kind=voiceTiming)']),
        createAssetListStep('exportResult', '交付', assets, ['TeachingProject.assets(kind=exportResult)']),
        {
            boundary: 'Only displays every asset; does not mutate assets.',
            events: [],
            id: 'all',
            inputFields: ['TeachingProject.assets(*)'],
            outputFields: [],
            render: () => _jsx(AssetList, { assets: filterAssets(assets, 'all') }),
            routeSlot: 'left-sider/assets/all',
            status: 'available',
            title: '总览',
        },
    ];
}
function createAssetListStep(id, title, assets, inputFields) {
    return {
        boundary: 'Asset list display only; does not mutate assets.',
        events: [],
        id,
        inputFields,
        outputFields: [],
        render: () => _jsx(AssetList, { assets: filterAssets(assets, id) }),
        routeSlot: `left-sider/assets/${id}`,
        status: 'available',
        title,
    };
}
function filterAssets(assets, key) {
    if (key === 'all')
        return assets;
    if (key === 'problem')
        return assets.filter((asset) => asset.kind === 'problemImage' || asset.kind === 'problemText');
    if (key === 'scriptBoard')
        return assets.filter((asset) => asset.kind === 'scriptText' || asset.kind === 'boardLayout');
    return assets.filter((asset) => asset.kind === key);
}

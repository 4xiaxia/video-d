import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { CheckCircleFilled, ClockCircleFilled, MessageOutlined, SettingOutlined, VideoCameraOutlined } from '@ant-design/icons';
import { Button, ConfigProvider, Layout, Modal, Space, Spin, Tag, Tooltip, Typography } from 'antd';
import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppSettingsDrawer } from './components/AppSettingsDrawer';
import { AssetPanel } from './components/AssetPanel';
import { FloatingToolDock } from './components/FloatingToolDock';
import { InspectorPanel } from './components/InspectorPanel';
import { ProjectArchiveActions } from './components/ProjectArchiveActions';
import { StagePreview } from './components/StagePreview';
import { TeachingTimeline } from './components/TeachingTimeline';
import { importProjectFromLocalTaskFolder, saveProjectToLocalTaskFolder, selectDefaultLocalTaskFolder, } from './modules/localTaskArchive/localTaskArchive';
import { loadCurrentProjectSnapshot, loadLocalTaskSnapshot, loadRecentTaskSnapshots, saveCurrentProjectSnapshot, saveNamedProjectSnapshot, } from './modules/localTaskArchive/localTaskDb';
import { useTeachingEditorStore } from './store/useTeachingEditorStore';
import { appTheme } from './ui/theme';
import { readRuntimeConfigBox } from './config/runtimeConfigBox';
// @@COMP_APP @@COMP_PLAYBACK_WS
// ID: cleanroom-shell-layout-root-001
// 💾 数据: TeachingProject / defaultConfig through useTeachingEditorStore
// 🔌 事件: header actions -> Drawer open state / selected clip state
// 🧩 复用: AssetPanel + StagePreview + TeachingTimeline + InspectorPanel
// @c-candidate-waiting-copy: 等待 Agent 生成 C 素材候选
// ⚠️ BREAKPOINT: PlaybackWorkspace selector 曾触发无限更新，已拆为多个稳定 selector（d7d1936）
const { Header } = Layout;
const { Text, Title } = Typography;
const ScriptAgentWorkspace = lazy(() => import('./components/ScriptAgentWorkspace').then((module) => ({
    default: module.ScriptAgentWorkspace,
})));
export function App() {
    return (_jsx(ConfigProvider, { theme: appTheme, children: _jsx(EditorShell, {}) }));
}
function EditorShell() {
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [scriptAgentOpen, setScriptAgentOpen] = useState(false);
    const [scriptAgentOpenMode, setScriptAgentOpenMode] = useState('chat');
    const [scriptAgentGenerateRequestId, setScriptAgentGenerateRequestId] = useState(0);
    const [requestedWorkflowKey, setRequestedWorkflowKey] = useState(null);
    const [requestedWorkflowRequestId, setRequestedWorkflowRequestId] = useState(0);
    const [isAssetPanelCollapsed, setIsAssetPanelCollapsed] = useState(false);
    const [isRecordingFocusMode, setIsRecordingFocusMode] = useState(false);
    const [recentTaskSnapshots, setRecentTaskSnapshots] = useState([]);
    const assetPanelAutoCollapsedRef = useRef(false);
    const project = useTeachingEditorStore((state) => state.project);
    const pendingProject = useTeachingEditorStore((state) => state.pendingProject);
    const scriptAgentCandidateDraft = useTeachingEditorStore((state) => state.scriptAgentCandidateDraft);
    const layoutPreviewDraft = useTeachingEditorStore((state) => state.layoutPreviewDraft);
    const config = useTeachingEditorStore((state) => state.config);
    const runtimeConfig = readRuntimeConfigBox(config);
    const updateConfig = useTeachingEditorStore((state) => state.updateConfig);
    const automationConfig = runtimeConfig.automation;
    const recognitionConfig = runtimeConfig.recognition;
    const ttsConfig = runtimeConfig.tts;
    const updateSelectedBoardClip = useTeachingEditorStore((state) => state.updateSelectedBoardClip);
    const updateStageCanvas = useTeachingEditorStore((state) => state.updateStageCanvas);
    const workflowProject = pendingProject ?? project;
    const workflowAssets = workflowProject.assets;
    const problemText = project.assets.find((asset) => asset.kind === 'problemText');
    const workflowProblemText = workflowAssets.find((asset) => asset.kind === 'problemText');
    const workflowScriptText = workflowAssets.find((asset) => asset.kind === 'scriptText');
    const workflowBoardLayout = workflowAssets.find((asset) => asset.kind === 'boardLayout');
    const voiceAudio = project.assets.find((asset) => asset.kind === 'voiceAudio');
    const selectedClip = useTeachingEditorStore((state) => {
        const { clips } = state.project.timeline;
        return clips.find((clip) => clip.id === state.selectedClipId);
    });
    const isProblemConfirmed = problemText?.status === 'ready' && Boolean(problemText.summary.trim());
    const isWorkflowProblemConfirmed = workflowProblemText?.status === 'ready' && Boolean(workflowProblemText.summary.trim());
    const isScriptBoardReady = workflowScriptText?.status === 'ready' &&
        Boolean(workflowScriptText.summary.trim()) &&
        workflowBoardLayout?.status === 'ready' &&
        Boolean(workflowBoardLayout.summary.trim());
    const isVoiceReady = voiceAudio?.status === 'ready';
    const boardTimingClipCount = useTeachingEditorStore((state) => state.project.timeline.clips.filter((clip) => clip.kind === 'board').length);
    const isBTrackOnRail = isVoiceReady && boardTimingClipCount > 0;
    const importProblemImage = useTeachingEditorStore((state) => state.importProblemImage);
    const updateProblemText = useTeachingEditorStore((state) => state.updateProblemText);
    const applyRecognizedProblemText = useTeachingEditorStore((state) => state.applyRecognizedProblemText);
    const confirmProblemText = useTeachingEditorStore((state) => state.confirmProblemText);
    const applyScriptAgentDraft = useTeachingEditorStore((state) => state.applyScriptAgentDraft);
    const updateScriptAgentCandidateDraft = useTeachingEditorStore((state) => state.updateScriptAgentCandidateDraft);
    const applyBoardEventsToTimeline = useTeachingEditorStore((state) => state.applyBoardEventsToTimeline);
    const applyTtsSentenceResults = useTeachingEditorStore((state) => state.applyTtsSentenceResults);
    const syncCAssetPrewarmQueue = useTeachingEditorStore((state) => state.syncCAssetPrewarmQueue);
    const syncLayoutPreviewDraft = useTeachingEditorStore((state) => state.syncLayoutPreviewDraft);
    const restoreProjectSnapshot = useTeachingEditorStore((state) => state.restoreProjectSnapshot);
    const snapshotReadyRef = useRef(false);
    const refreshRecentTaskSnapshots = useCallback(async () => {
        setRecentTaskSnapshots(await loadRecentTaskSnapshots());
    }, []);
    useEffect(() => {
        let isActive = true;
        void loadCurrentProjectSnapshot().then(async (snapshot) => {
            if (!isActive) {
                return;
            }
            if (snapshot) {
                restoreProjectSnapshot(snapshot.project, { preservePendingProject: true, preserveScriptAgentCandidateDraft: true });
            }
            setRecentTaskSnapshots(await loadRecentTaskSnapshots());
            snapshotReadyRef.current = true;
        });
        return () => {
            isActive = false;
        };
    }, [refreshRecentTaskSnapshots, restoreProjectSnapshot]);
    useEffect(() => {
        if (!snapshotReadyRef.current) {
            return;
        }
        const saveTimer = window.setTimeout(() => {
            void saveCurrentProjectSnapshot(project);
        }, 500);
        return () => window.clearTimeout(saveTimer);
    }, [project]);
    useEffect(() => {
        if (!pendingProject) {
            return;
        }
        assetPanelAutoCollapsedRef.current = false;
        setIsAssetPanelCollapsed(false);
    }, [pendingProject]);
    useEffect(() => {
        if (!isBTrackOnRail || assetPanelAutoCollapsedRef.current) {
            return;
        }
        assetPanelAutoCollapsedRef.current = true;
        setIsAssetPanelCollapsed(true);
    }, [isBTrackOnRail]);
    const handleApplyScriptAgentDraft = (draft) => {
        // Trace point 8b: Trigger TTS workflow for A-track generation
        applyScriptAgentDraft(draft);
        syncLayoutPreviewDraft(null);
        // 静默异步中间格式过滤层 - 用户不可见
        import('./modules/ttsPreprocessor/index').then(({ createTtsFormatFilterLayer }) => {
            createTtsFormatFilterLayer(draft).then((filterResult) => {
                // 前端显示干净的板书内容（通过现有的applyScriptAgentDraft已经处理）
                // 后台静默处理阿里云TTS格式，用户看不到处理过程
                // ⚡ Trace point 8c: TTS格式过滤完成（静默处理，不输出用户数据到控制台）
                void filterResult.displayContent;
                void filterResult.ttsContent.units.length;
            }).catch((error) => {
                console.error('中间格式过滤层处理失败:', error);
                // 失败不影响正常流程，继续使用原有逻辑
            });
        }).catch((error) => {
            console.error('加载中间格式过滤层失败:', error);
        });
        setRequestedWorkflowKey('voiceAudio');
        setRequestedWorkflowRequestId((current) => current + 1);
        setScriptAgentOpen(false);
    };
    const handleOpenScriptAgentChat = () => {
        setScriptAgentOpenMode('chat');
        setScriptAgentOpen(true);
    };
    const handleGenerateScriptAgentDraft = () => {
        setScriptAgentOpenMode('generate');
        setScriptAgentGenerateRequestId((current) => current + 1);
        setScriptAgentOpen(true);
    };
    const handleSaveLocalTaskArchive = useCallback(async () => {
        const result = await saveProjectToLocalTaskFolder(project);
        if (result.rootDirectoryName && result.rootDirectoryName !== config.output.defaultSaveDirectoryLabel) {
            updateConfig({
                ...config,
                output: {
                    ...config.output,
                    defaultSaveDirectoryLabel: result.rootDirectoryName,
                },
            });
        }
        await saveCurrentProjectSnapshot(project);
        await saveNamedProjectSnapshot(project, result.folderName, {
            editRecords: result.archivePackage.editRecords,
            productManifest: result.archivePackage.productManifest,
        });
        await refreshRecentTaskSnapshots();
        return result;
    }, [config, project, refreshRecentTaskSnapshots, updateConfig]);
    const handleSetDefaultSaveDirectory = useCallback(async () => {
        const result = await selectDefaultLocalTaskFolder();
        updateConfig({
            ...config,
            output: {
                ...config.output,
                defaultSaveDirectoryLabel: result.directoryName,
            },
        });
        return result;
    }, [config, updateConfig]);
    const handleImportLocalTaskArchive = useCallback(async () => {
        const result = await importProjectFromLocalTaskFolder();
        restoreProjectSnapshot(result.project);
        await saveCurrentProjectSnapshot(result.project);
        await saveNamedProjectSnapshot(result.project, result.folderName, {
            editRecords: result.archivePackage.editRecords,
            productManifest: result.archivePackage.productManifest,
        });
        await refreshRecentTaskSnapshots();
        return result;
    }, [refreshRecentTaskSnapshots, restoreProjectSnapshot]);
    const handleRestoreLocalTaskSnapshot = useCallback(async (snapshotId) => {
        const snapshot = await loadLocalTaskSnapshot(snapshotId);
        if (!snapshot) {
            return false;
        }
        restoreProjectSnapshot(snapshot.project);
        await saveCurrentProjectSnapshot(snapshot.project);
        await refreshRecentTaskSnapshots();
        return true;
    }, [refreshRecentTaskSnapshots, restoreProjectSnapshot]);
    return (_jsxs(Layout, { className: isRecordingFocusMode ? 'app-shell app-shell--recording-focus' : 'app-shell', children: [_jsxs(Header, { className: "app-header", children: [_jsxs("div", { className: "app-title-block", children: [_jsx(Text, { className: "eyebrow", children: "Teaching AutoCut Cleanroom" }), _jsx(Title, { level: 2, children: project.title }), _jsxs("div", { className: "studio-status-strip", children: [_jsx(StatusPill, { isDone: true, label: "\u914D\u7F6E" }), _jsx(StatusPill, { isDone: isProblemConfirmed, label: "\u9898\u6587" }), _jsx(StatusPill, { isDone: isScriptBoardReady, label: "\u6587\u7A3F/C\u7D20\u6750\u5019\u9009" }), _jsx(StatusPill, { isDone: isVoiceReady, label: "A\u8F68" })] })] }), _jsxs(Space, { className: "app-command-bar", wrap: true, children: [_jsx(Tag, { color: "blue", children: "\u8F7B\u91CF\u5DE5\u4F5C\u53F0" }), _jsx(Button, { disabled: !isWorkflowProblemConfirmed, onClick: handleOpenScriptAgentChat, type: isWorkflowProblemConfirmed && !isScriptBoardReady ? 'primary' : 'default', children: "\u6587\u7A3F\u4E0E C \u7D20\u6750 Agent" }), _jsx(Button, { icon: _jsx(SettingOutlined, {}), onClick: () => setSettingsOpen(true), children: "\u914D\u7F6E" }), _jsx(ProjectArchiveActions, { defaultSaveDirectoryLabel: config.output.defaultSaveDirectoryLabel, onImportLocalTaskArchive: handleImportLocalTaskArchive, onRefreshLocalTaskSnapshots: refreshRecentTaskSnapshots, onRestoreLocalTaskSnapshot: handleRestoreLocalTaskSnapshot, onSaveLocalTaskArchive: handleSaveLocalTaskArchive, onSetDefaultSaveDirectory: handleSetDefaultSaveDirectory, recentTaskSnapshots: recentTaskSnapshots }), _jsx(Tooltip, { title: "\u5B8C\u6210\u64AD\u653E\u68C0\u67E5\u540E\u5F00\u653E", children: _jsx(Button, { disabled: true, icon: _jsx(VideoCameraOutlined, {}), type: "primary", children: "\u5F55\u5C4F\u4EA4\u4ED8" }) })] })] }), _jsxs("section", { className: isAssetPanelCollapsed ? 'workspace-grid workspace-grid--assets-collapsed' : 'workspace-grid', children: [_jsxs("aside", { className: "workspace-sider workspace-sider--assets", children: [_jsx(Button, { "aria-label": isAssetPanelCollapsed ? '展开流程面板' : '收起流程面板', className: "asset-panel-collapse-button", onClick: () => setIsAssetPanelCollapsed((current) => !current), shape: "circle", size: "small", children: isAssetPanelCollapsed ? '展' : '收' }), isAssetPanelCollapsed ? null : (_jsx(AssetPanel, { assets: workflowAssets, automationConfig: automationConfig, recognitionConfig: recognitionConfig, ttsConfig: ttsConfig, scriptAgentConfig: runtimeConfig.scriptAgent, scriptAgentCandidateDraft: scriptAgentCandidateDraft, layoutPreviewDraft: layoutPreviewDraft, onImportProblemImage: importProblemImage, onApplyBoardEventsToTimeline: applyBoardEventsToTimeline, onSyncCAssetPrewarmQueue: syncCAssetPrewarmQueue, onApplyTtsSentenceResults: applyTtsSentenceResults, onSyncLayoutPreviewDraft: syncLayoutPreviewDraft, onApplyRecognizedProblemText: applyRecognizedProblemText, onConfirmProblemText: confirmProblemText, onGenerateScriptAgent: handleGenerateScriptAgentDraft, onOpenScriptAgent: handleOpenScriptAgentChat, onUpdateProblemText: updateProblemText, stageCanvas: project.stage.canvas, requestedWorkflowKey: requestedWorkflowKey, requestedWorkflowRequestId: requestedWorkflowRequestId }))] }), _jsx("main", { className: "workspace-main", children: _jsx(PlaybackWorkspace, { onRecordingActiveChange: setIsRecordingFocusMode, problemText: problemText }) }), _jsx("aside", { className: "workspace-sider workspace-sider--inspector", children: _jsx(InspectorPanel, { canvas: project.stage.canvas, onUpdateBoardClip: updateSelectedBoardClip, onUpdateCanvas: updateStageCanvas, selectedClip: selectedClip }) })] }), _jsx(FloatingToolDock, {}), _jsx(Button, { className: "agent-chat-launcher", disabled: !isProblemConfirmed, icon: _jsx(MessageOutlined, {}), onClick: handleOpenScriptAgentChat, type: "primary", children: "\u6253\u5F00\u6587\u7A3F\u4E0E C \u7D20\u6750" }), _jsx(Modal, { footer: null, mask: { blur: true, closable: true, enabled: true }, onCancel: () => setScriptAgentOpen(false), open: scriptAgentOpen, title: "\u6587\u7A3F\u4E0E C \u7D20\u6750 Agent", width: "92vw", wrapClassName: "agent-chat-modal-wrap", children: _jsx("div", { className: "agent-chat-modal-body", children: _jsx(Suspense, { fallback: _jsxs("div", { className: "agent-drawer-loading", children: [_jsx(Spin, {}), _jsx(Text, { type: "secondary", children: "\u6B63\u5728\u6253\u5F00\u6587\u7A3F\u4E0E C \u7D20\u6750 Agent..." })] }), children: _jsx(ScriptAgentWorkspace, { autoApplyDraft: automationConfig.mode === 'unattended', autoRunRequestId: scriptAgentOpen && scriptAgentOpenMode === 'generate' ? scriptAgentGenerateRequestId : 0, assets: workflowAssets, candidateDraft: scriptAgentCandidateDraft, scriptAgentConfig: runtimeConfig.scriptAgent, onCandidateDraftChange: updateScriptAgentCandidateDraft, onApplyDraft: handleApplyScriptAgentDraft }) }) }) }), _jsx(AppSettingsDrawer, { config: config, onClose: () => setSettingsOpen(false), onSaveConfig: updateConfig, open: settingsOpen })] }));
}
function PlaybackWorkspace({ onRecordingActiveChange, problemText, }) {
    const canvas = useTeachingEditorStore((state) => state.project.stage.canvas);
    const clips = useTeachingEditorStore((state) => state.project.timeline.clips);
    const tracks = useTeachingEditorStore((state) => state.project.timeline.tracks);
    const selectedClipId = useTeachingEditorStore((state) => state.selectedClipId);
    const playheadMs = useTeachingEditorStore((state) => state.project.timeline.playheadMs);
    const livePlayheadMs = useTeachingEditorStore((state) => state.livePlayheadMs);
    const isPlaying = useTeachingEditorStore((state) => state.isPlaying);
    const setLiveTimelinePlayhead = useTeachingEditorStore((state) => state.setLiveTimelinePlayhead);
    const setPlayingState = useTeachingEditorStore((state) => state.setPlayingState);
    const setTimelinePlayhead = useTeachingEditorStore((state) => state.setTimelinePlayhead);
    const updateBoardClip = useTeachingEditorStore((state) => state.updateBoardClip);
    const updateBoardTiming = useTeachingEditorStore((state) => state.updateBoardTiming);
    const selectClip = useTeachingEditorStore((state) => state.selectClip);
    // ⚠️ BREAKPOINT: 播放时每帧触发 → boardClips/selectedBoardClipId 已 useMemo 化避免重建引用
    // ⚠️ BREAKPOINT: 卡顿热路径起点 — livePlayheadMs 变化 → 全链路重渲染 → CStickerFrame clip-path 每帧重绘
    // 详见 .codex/stutter-c-interaction-analysis.md
    const boardClips = useMemo(() => clips.filter((clip) => clip.kind === 'board'), [clips]);
    const selectedBoardClipId = useMemo(() => clips.find((clip) => clip.id === selectedClipId && clip.kind === 'board')?.id ?? null, [clips, selectedClipId]);
    const visiblePlayheadMs = livePlayheadMs ?? playheadMs;
    return (_jsxs(_Fragment, { children: [_jsx(StagePreview, { boardClips: boardClips, canvas: canvas, playheadMs: visiblePlayheadMs, problemText: problemText, selectedBoardClipId: selectedBoardClipId, onRecordingActiveChange: onRecordingActiveChange, onSelectBoardClip: selectClip, onUpdateBoardClip: updateBoardClip }), _jsx(TeachingTimeline, { boardTimingClips: boardClips, clips: clips, isPlaying: isPlaying, onSelectClip: selectClip, onSetPlaying: setPlayingState, onSetLivePlayhead: setLiveTimelinePlayhead, onSetPlayhead: setTimelinePlayhead, onUpdateBoardTiming: updateBoardTiming, playheadMs: visiblePlayheadMs, selectedClipId: selectedClipId, tracks: tracks })] }));
}
function StatusPill({ isDone, label }) {
    return (_jsxs("span", { className: isDone ? 'studio-status-pill is-done' : 'studio-status-pill', children: [isDone ? _jsx(CheckCircleFilled, {}) : _jsx(ClockCircleFilled, {}), label] }));
}

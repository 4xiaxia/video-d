import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// @@COMP_VOICE_WS ⚠️ BREAKPOINT: TTS ready → boardEvents → cAssetPrewarmQueue 触发点
// @cleanroom-component: VoiceWorkspace
// @domain: tts-audio-pipeline
// @slot: left-sider/voice-workspace
// @depends: TeachingProject.assets(scriptText/voiceAudio/voiceTiming), VoiceBatchStatusPanel
// ID: cleanroom-assets-voice-status-001
// 🔄 状态: TTS 批任务状态灯
// 💾 数据: voiceAudio / voiceTiming assets
// 🧩 复用: VoiceBatchStatusPanel + AssetList
// @feature-branch: board-events
// @io-input: assets, onApplyBoardEventsToTimeline, onSyncCAssetPrewarmQueue, onApplyTtsSentenceResults
// @io-output: TtsSentenceResult[] and BoardEvent[] through callbacks
// @route: App shell / left sider / assets voice tab
// @fields: TeachingProject.assets(kind=voiceAudio), TeachingProject.assets(kind=voiceTiming), TeachingProject.timeline.clips(kind=board)
// @adapter: local cosyvoice-gateway
// @event-map: scriptText -> local gateway -> voice assets + board events -> timeline clips
// @boundary: browser calls local Node gateway only; DASHSCOPE_API_KEY stays in Node/.env.local
import { AudioOutlined } from '@ant-design/icons';
import { Alert, Button, Card, Collapse, Flex, Space, Tag, Typography } from 'antd';
import { useMemo, useState } from 'react';
import { readScriptChainKeysSourceRef } from '../modules/abcChain/abcChainKey';
import { createCAssetPrewarmQueue } from '../modules/cAssetPrewarm';
import { createBoardEventsFromTtsUnits, splitScriptIntoTtsSentenceUnits } from '../modules/timeline-factory';
import { filterTtsUnitsBySentenceResults, isReadyTtsSentenceResult, sortTtsSentenceResultsBySentenceOrder } from '../modules/timeline-factory/orderTtsSentenceResults';
import { ScriptSegmentWorkbench } from '../modules/scriptSegments';
import { requestBoardLayoutPreview } from '../services/boardLayoutPreviewGatewayClient';
import { requestCosyVoiceSentences } from '../services/cosyvoiceGatewayClient';
import { AssetList } from './AssetList';
import { VoiceBatchStatusPanel } from './VoiceBatchStatusPanel';
const { Text } = Typography;
export function VoiceWorkspace({ assets, ttsConfig, scriptAgentConfig, scriptAgentCandidateDraft, onApplyBoardEventsToTimeline, onSyncCAssetPrewarmQueue, onApplyTtsSentenceResults, onSyncLayoutPreviewDraft, stageCanvas, }) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [isGeneratingLayoutPreview, setIsGeneratingLayoutPreview] = useState(false);
    const [error, setError] = useState('');
    const [layoutPreviewError, setLayoutPreviewError] = useState('');
    const [lastLayoutPreviewCount, setLastLayoutPreviewCount] = useState(null);
    const [lastResult, setLastResult] = useState(null);
    const scriptTextAsset = assets.find((asset) => asset.kind === 'scriptText');
    const problemTextAsset = assets.find((asset) => asset.kind === 'problemText');
    const scriptText = scriptTextAsset?.summary ?? '';
    const scriptChainKeys = useMemo(() => readScriptChainKeysSourceRef(scriptTextAsset?.sourceRef), [scriptTextAsset?.sourceRef]);
    const voiceAssets = assets.filter((asset) => asset.kind === 'voiceAudio' || asset.kind === 'voiceTiming');
    const storedVoiceAudioUrls = readStoredAssetLines(assets.find((asset) => asset.kind === 'voiceAudio')?.sourceRef);
    const storedVoiceTimingEntries = readStoredAssetLines(assets.find((asset) => asset.kind === 'voiceTiming')?.sourceRef);
    const storedResult = storedVoiceAudioUrls.length
        ? {
            failedCount: 0,
            readyCount: storedVoiceAudioUrls.length,
            requestIds: [],
        }
        : null;
    const visibleResult = lastResult ?? storedResult;
    const splitResult = useMemo(() => splitScriptIntoTtsSentenceUnits(scriptText, { chainKeys: scriptChainKeys }), [scriptChainKeys, scriptText]);
    const batches = useMemo(() => splitResult.units.map((unit) => ({
        audioTrackLabel: visibleResult ? '已入A轨' : undefined,
        id: `voice-batch-${unit.id}`,
        label: `第 ${unit.order} 段`,
        sentenceIds: [unit.id],
        status: isGenerating ? 'requesting' : visibleResult ? 'onTrack' : 'pending',
    })), [isGenerating, splitResult.units, visibleResult]);
    const handleGenerateRealTts = async () => {
        setError('');
        setLastResult(null);
        if (splitResult.units.length === 0) {
            setError('请先确认文稿，再生成 A 轨语音。');
            return;
        }
        setIsGenerating(true);
        try {
            const response = await requestCosyVoiceSentences(splitResult.units.map((unit) => ({
                estimatedDurationMs: unit.estimatedDurationMs,
                id: unit.id,
                order: unit.order,
                text: unit.speechText,
            })), ttsConfig);
            const resultsWithChainKeys = response.results.map((result) => ({
                ...result,
                chainKey: splitResult.units.find((unit) => unit.id === result.sentenceId)?.chainKey,
            }));
            const readyResults = sortTtsSentenceResultsBySentenceOrder(resultsWithChainKeys.filter((result) => result.status === 'ready' && isReadyTtsSentenceResult(result)));
            const failedResults = resultsWithChainKeys.filter((result) => result.status === 'failed' || result.error);
            onApplyTtsSentenceResults(resultsWithChainKeys);
            const boardEventUnits = filterTtsUnitsBySentenceResults(splitResult.units, readyResults);
            const boardEvents = createBoardEventsFromTtsUnits(boardEventUnits, readyResults);
            if (boardEvents.length) {
                onApplyBoardEventsToTimeline(boardEvents);
                onSyncCAssetPrewarmQueue(createCAssetPrewarmQueue({
                    boardEvents,
                    canvas: stageCanvas,
                    readyResults,
                    units: boardEventUnits,
                }));
            }
            setLastResult({
                failedCount: failedResults.length,
                readyCount: readyResults.length,
                requestIds: readyResults.map((result) => result.requestId).filter((requestId) => Boolean(requestId)),
            });
            if (failedResults.length) {
                setError(failedResults.map((result) => result.error).filter(Boolean).join('\n') || '部分分段生成失败。');
            }
        }
        catch (caughtError) {
            setError(caughtError instanceof Error ? caughtError.message : String(caughtError));
        }
        finally {
            setIsGenerating(false);
        }
    };
    const handleGenerateLayoutPreview = async () => {
        setLayoutPreviewError('');
        setLastLayoutPreviewCount(null);
        const rows = scriptAgentCandidateDraft.rows ?? [];
        const rowsWithBoardSlice = rows.filter((row) => row.boardSlice?.trim());
        if (!rowsWithBoardSlice.length) {
            setLayoutPreviewError('请先在第二步生成并确认包含板书候选的 rows。');
            return;
        }
        setIsGeneratingLayoutPreview(true);
        try {
            const preview = await requestBoardLayoutPreview({
                config: scriptAgentConfig,
                problemText: problemTextAsset?.summary ?? '',
                rows,
                stageCanvas,
            });
            onSyncLayoutPreviewDraft(preview);
            setLastLayoutPreviewCount(preview.items.length);
        }
        catch (caughtError) {
            setLayoutPreviewError(caughtError instanceof Error ? caughtError.message : String(caughtError));
        }
        finally {
            setIsGeneratingLayoutPreview(false);
        }
    };
    return (_jsxs("div", { className: "voice-workspace", children: [_jsx(Card, { className: "voice-action-card", size: "small", children: _jsxs(Flex, { gap: 10, vertical: true, children: [_jsxs(Space, { wrap: true, children: [_jsx(Tag, { color: "blue", children: "\u8BB2\u89E3\u97F3\u9891" }), _jsx(Tag, { color: "cyan", children: ttsConfig.voiceName })] }), _jsx(Text, { type: "secondary", children: "\u7B2C\u4E09\u6B65\u5148\u770B\u6574\u7248\u6392\u7248\u9884\u89C8\uFF0C\u518D\u51B3\u5B9A\u662F\u5426\u751F\u6210\u8BB2\u89E3\u97F3\u9891\u3002" }), _jsxs(Space.Compact, { block: true, children: [_jsx(Button, { block: true, disabled: !scriptAgentCandidateDraft.rows?.length, loading: isGeneratingLayoutPreview, onClick: handleGenerateLayoutPreview, children: "\u751F\u6210\u677F\u4E66\u6392\u7248\u9884\u89C8" }), _jsx(Button, { block: true, disabled: splitResult.units.length === 0, icon: _jsx(AudioOutlined, {}), loading: isGenerating, onClick: handleGenerateRealTts, type: "primary", children: "\u751F\u6210\u8BB2\u89E3\u97F3\u9891" })] }), visibleResult ? (_jsx(Alert, { showIcon: true, title: `${lastResult ? '生成完成' : '缓存已恢复'}：${visibleResult.readyCount} 段成功${visibleResult.failedCount ? `，${visibleResult.failedCount} 段失败` : ''}`, type: visibleResult.failedCount ? 'warning' : 'success' })) : null, error ? _jsx(Alert, { description: error, showIcon: true, title: "\u771F\u5B9E TTS \u8FD4\u56DE\u9519\u8BEF", type: "error" }) : null, layoutPreviewError ? _jsx(Alert, { description: layoutPreviewError, showIcon: true, title: "\u6392\u7248\u9884\u89C8\u751F\u6210\u5931\u8D25", type: "error" }) : null, lastLayoutPreviewCount !== null ? (_jsx(Alert, { showIcon: true, title: `排版预览已更新：${lastLayoutPreviewCount} 项`, type: "success" })) : null] }) }), _jsx(ScriptSegmentWorkbench, { emptyText: "\u6682\u65E0\u53EF\u751F\u6210\u97F3\u9891\u7684\u6362\u884C\u5206\u6BB5\u3002", maxVisibleSegments: 24, scriptChainKeys: scriptChainKeys, scriptText: scriptText, title: "\u97F3\u9891\u751F\u6210\u786E\u8BA4" }), _jsx(Collapse, { className: "voice-advanced-collapse", items: [
                    {
                        children: _jsx(VoiceBatchStatusPanel, { batches: batches, isRealGatewayReady: true }),
                        key: 'batches',
                        label: (_jsxs(Space, { size: 6, wrap: true, children: [_jsx(Text, { strong: true, children: "\u5904\u7406\u660E\u7EC6" }), _jsx(Text, { type: "secondary", children: "\u6BCF\u6BB5\u751F\u6210\u8FDB\u5EA6" }), _jsxs(Tag, { children: [batches.length, " \u6BB5"] })] })),
                    },
                    {
                        children: _jsx(AssetList, { assets: voiceAssets }),
                        key: 'assets',
                        label: (_jsxs(Space, { size: 6, wrap: true, children: [_jsx(Text, { strong: true, children: "\u6587\u4EF6" }), _jsx(Text, { type: "secondary", children: "\u97F3\u9891\u4E0E\u5BF9\u9F50\u6570\u636E" }), _jsxs(Tag, { color: storedVoiceAudioUrls.length ? 'green' : 'default', children: [storedVoiceAudioUrls.length, " \u97F3\u9891"] }), _jsxs(Tag, { color: storedVoiceTimingEntries.length ? 'blue' : 'default', children: [storedVoiceTimingEntries.length, " \u5BF9\u9F50"] })] })),
                    },
                ], size: "small" })] }));
}
function readStoredAssetLines(sourceRef) {
    return (sourceRef ?? '')
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean);
}

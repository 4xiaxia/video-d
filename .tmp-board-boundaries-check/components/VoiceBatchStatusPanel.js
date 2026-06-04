import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// @cleanroom-component: VoiceBatchStatusPanel
// @domain: voice-audio-timeline
// @slot: left-sider/voice-batch-status
// @depends: TtsBatchUiItem[], future TtsBatchJob, future TtsBatchResult
// @feature-branch: tts-audio-pipeline
// @feature-branch: voice-timing-json
// @feature-branch: board-audio-alignment
// @route-impact: App shell only, future route: task-review
// @api-needed: aliyun-tts-api | trigger: confirmed scriptText batches | output: voiceAudio URL/cache + voiceTiming JSON
import { CheckCircleFilled, ClockCircleFilled, CloseCircleFilled, LoadingOutlined, SoundFilled } from '@ant-design/icons';
import { Card, Empty, Flex, List, Progress, Space, Steps, Tag, Typography } from 'antd';
const { Text } = Typography;
const statusMeta = {
    audioReady: { icon: _jsx(CheckCircleFilled, {}), label: '生成成功', tone: 'green' },
    failed: { icon: _jsx(CloseCircleFilled, {}), label: '失败', tone: 'red' },
    jsonReady: { icon: _jsx(CheckCircleFilled, {}), label: 'json已获取', tone: 'blue' },
    onTrack: { icon: _jsx(SoundFilled, {}), label: '已音轨', tone: 'green' },
    pending: { icon: _jsx(ClockCircleFilled, {}), label: '等待', tone: 'default' },
    requesting: { icon: _jsx(LoadingOutlined, {}), label: '生成中', tone: 'processing' },
};
export function VoiceBatchStatusPanel({ batches = [], isRealGatewayReady = false, }) {
    const onTrackCount = batches.filter((batch) => batch.status === 'onTrack').length;
    const readyAudioCount = batches.filter((batch) => isAtLeast(batch.status, 'audioReady')).length;
    const progressPercent = batches.length ? Math.round((onTrackCount / batches.length) * 100) : 0;
    return (_jsxs(Card, { className: "voice-batch-card", size: "small", children: [_jsxs(Flex, { align: "center", justify: "space-between", children: [_jsxs(Space, { size: 6, children: [_jsx(Tag, { color: "blue", children: "\u97F3\u9891" }), _jsx(Text, { strong: true, children: "A \u8BED\u97F3\u97F3\u9891" })] }), _jsx(Tag, { color: isRealGatewayReady ? 'green' : 'volcano', children: isRealGatewayReady ? '真实网关' : '未接 API' })] }), _jsxs(Flex, { align: "center", className: "voice-batch-summary", gap: 8, children: [_jsx(Progress, { percent: progressPercent, showInfo: false, size: "small" }), _jsxs(Tag, { color: onTrackCount === batches.length && batches.length ? 'green' : 'orange', children: [onTrackCount, "/", batches.length, " \u5165A\u8F68"] })] }), batches.length ? (_jsx(List, { className: "voice-batch-list", dataSource: batches, renderItem: (batch) => (_jsxs(List.Item, { className: "voice-batch-list-item", children: [_jsx(List.Item.Meta, { description: _jsxs(Text, { type: "secondary", children: [batch.sentenceIds.join(' / '), batch.error ? ` · ${batch.error}` : ''] }), title: _jsxs(Space, { size: 6, children: [_jsx(Tag, { color: statusMeta[batch.status].tone, children: statusMeta[batch.status].icon }), _jsx(Text, { strong: true, children: batch.label }), batch.audioTrackLabel ? _jsx(Tag, { color: "green", children: batch.audioTrackLabel }) : null] }) }), _jsx(VoiceBatchStatusSteps, { batch: batch })] })) })) : (_jsx(Empty, { description: "\u786E\u8BA4\u6587\u7A3F\u540E\uFF0C\u4F1A\u6309 <br> \u751F\u6210 A \u8F68\u5206\u6BB5\u4EFB\u52A1\u3002", image: Empty.PRESENTED_IMAGE_SIMPLE })), _jsxs(Text, { className: "voice-batch-hint", type: "secondary", children: ["\u6309\u53E3\u64AD\u7A3F\u91CC\u7684 <br> \u5206\u6BB5\u8BF7\u6C42\u963F\u91CC\u4E91\uFF1BJSON \u8FD4\u56DE\u3001MP3 \u97F3\u9891\u3001\u5165 A \u8F68\u5206\u6B65\u70B9\u4EAE\u3002 \u5F53\u524D\u5DF2\u751F\u6210 MP3 ", readyAudioCount, " \u6BB5\u3002"] })] }));
}
function VoiceBatchStatusSteps({ batch }) {
    const isFailed = batch.status === 'failed';
    return (_jsx(Steps, { className: "voice-batch-steps", current: getStepCurrent(batch.status), items: [
            {
                status: isFailed ? 'error' : isAtLeast(batch.status, 'jsonReady') ? 'finish' : batch.status === 'requesting' ? 'process' : 'wait',
                title: 'JSON',
            },
            {
                status: isFailed ? 'error' : isAtLeast(batch.status, 'audioReady') ? 'finish' : batch.status === 'requesting' ? 'process' : 'wait',
                title: 'MP3',
            },
            {
                status: isFailed ? 'error' : batch.status === 'onTrack' ? 'finish' : 'wait',
                title: 'A轨',
            },
        ], labelPlacement: "vertical", size: "small" }));
}
function isAtLeast(current, target) {
    const order = ['pending', 'requesting', 'jsonReady', 'audioReady', 'onTrack'];
    return order.indexOf(current) >= order.indexOf(target);
}
function getStepCurrent(status) {
    if (status === 'onTrack') {
        return 2;
    }
    if (status === 'audioReady') {
        return 1;
    }
    return 0;
}

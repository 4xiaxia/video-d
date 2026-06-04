import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// @cleanroom-component: VoiceTrack
// @domain: voice-audio-timeline
// @slot: center-timeline/voice-track
// @depends: TeachingProject.timeline.tracks(kind=voice), TeachingProject.timeline.clips(kind=audio), TeachingProject.assets(voiceAudio/voiceTiming)
// @route-impact: App shell only, future route: task-review
// @boundary: A track audio display + B timing adjustment strip
import { SoundOutlined } from '@ant-design/icons';
import { InputNumber, Space, Tag, Typography } from 'antd';
import { TimelineTrackRow } from './TimelineTrackRow';
const { Text } = Typography;
export function VoiceTrack({ track, clips, boardTimingClips, durationMs, playheadMs, selectedClipId, onSelectClip, onUpdateBoardTiming, }) {
    const selectedBoardTimingClip = boardTimingClips.find((clip) => clip.id === selectedClipId);
    return (_jsxs("div", { className: "voice-track", children: [_jsx("div", { className: "voice-track-meta", children: _jsx(Tag, { color: "blue", icon: _jsx(SoundOutlined, {}), children: "\u8BB2\u89E3\u97F3\u9891" }) }), _jsx(TimelineTrackRow, { clips: clips, durationMs: durationMs, onSelectClip: onSelectClip, playheadMs: playheadMs, selectedClipId: selectedClipId, track: track }), selectedBoardTimingClip ? (_jsx("div", { className: "voice-track-b-timing", children: _jsxs(Space, { align: "center", className: "voice-track-b-timing-controls", size: 10, wrap: true, children: [_jsx(Tag, { color: "gold", children: "\u7D20\u6750\u65F6\u957F" }), _jsx(Text, { strong: true, children: "\u5F00\u59CB" }), _jsx(InputNumber, { min: 0, onChange: (value) => onUpdateBoardTiming(selectedBoardTimingClip.id, {
                                startMs: normalizeTimelineNumber(value, selectedBoardTimingClip.startMs),
                            }), step: 100, value: selectedBoardTimingClip.startMs }), _jsx(Text, { strong: true, children: "\u7ED3\u675F" }), _jsx(InputNumber, { min: selectedBoardTimingClip.startMs + 100, onChange: (value) => onUpdateBoardTiming(selectedBoardTimingClip.id, {
                                endMs: normalizeTimelineNumber(value, selectedBoardTimingClip.endMs),
                            }), step: 100, value: selectedBoardTimingClip.endMs })] }) })) : null] }));
}
function normalizeTimelineNumber(value, fallback) {
    if (typeof value === 'number' && Number.isFinite(value)) {
        return value;
    }
    if (typeof value === 'string' && value.trim()) {
        const parsedValue = Number(value);
        return Number.isFinite(parsedValue) ? parsedValue : fallback;
    }
    return fallback;
}

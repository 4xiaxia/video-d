import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { compareBoardClipLayerOrder } from '../modules/boardOrdering';
import { isPlayheadInsideTimelineWindow } from '../modules/timeline/timelineWindow';
import { TimelineClipBlock } from './TimelineClipBlock';
export function TimelineTrackRow({ track, clips, durationMs, playheadMs, selectedClipId, onSelectClip, onUpdateBoardTiming, }) {
    const safeDurationMs = Math.max(1000, durationMs);
    const sortedClips = [...clips].sort((left, right) => (track.kind === 'board'
        ? compareBoardClipLayerOrder(left, right)
        : left.startMs - right.startMs || left.id.localeCompare(right.id)));
    if (track.kind === 'board') {
        const laneCount = sortedClips.length;
        return (_jsxs("div", { className: "track-row track-row--board", children: [_jsx("div", { className: "track-label", children: readUserFacingTrackName(track) }), _jsx("div", { className: "board-sticker-stack", children: Array.from({ length: laneCount }, (_, laneIndex) => {
                        const laneClip = sortedClips[laneIndex];
                        return (_jsx("div", { className: "board-sticker-lane-row", children: _jsxs("div", { className: ['track-lane board-sticker-lane', laneClip ? '' : 'is-empty'].filter(Boolean).join(' '), children: [_jsx("span", { "aria-hidden": "true", className: "track-playhead", style: {
                                            left: `${(Math.min(safeDurationMs, Math.max(0, playheadMs)) / safeDurationMs) * 100}%`,
                                        } }), laneClip ? (_jsx(TimelineClipBlock, { clip: laneClip, durationMs: durationMs, isActive: isPlayheadInsideTimelineWindow(playheadMs, laneClip.startMs, laneClip.endMs), isSelected: laneClip.id === selectedClipId, layerIndex: laneIndex, onSelectClip: onSelectClip, onUpdateBoardTiming: onUpdateBoardTiming })) : null] }) }, laneClip?.id ?? `empty-board-lane-${laneIndex}`));
                    }) })] }));
    }
    return (_jsxs("div", { className: "track-row", children: [_jsx("div", { className: "track-label", children: readUserFacingTrackName(track) }), _jsxs("div", { className: "track-lane", children: [_jsx("span", { "aria-hidden": "true", className: "track-playhead", style: {
                            left: `${(Math.min(safeDurationMs, Math.max(0, playheadMs)) / safeDurationMs) * 100}%`,
                        } }), sortedClips.map((clip) => (_jsx(TimelineClipBlock, { clip: clip, durationMs: durationMs, isActive: isPlayheadInsideTimelineWindow(playheadMs, clip.startMs, clip.endMs), isSelected: clip.id === selectedClipId, onSelectClip: onSelectClip }, clip.id)))] })] }));
}
function readUserFacingTrackName(track) {
    return track.kind === 'board' ? '素材时长' : '讲解音频';
}

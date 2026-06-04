import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// @cleanroom-component: TimelineClipBlock
// @domain: teaching-timeline
// @slot: center-timeline/clip-block
// @depends: TeachingProject.timeline.clips
// @feature-branch: timeline-selection
// @feature-branch: board-audio-alignment
// @io-input: clip, isSelected, onSelectClip
// @io-output: onSelectClip(clip.id)
// @route: TeachingTimeline / track row / clip block
// @fields: TimelineClip.id, TimelineClip.kind, TimelineClip.label, TimelineClip.startMs, TimelineClip.endMs
// @boundary: clip display and B timing drag only; A voice clips remain read-only and C visual fields stay outside
// @route-impact: App shell only, future route: task-review
import { useEffect, useRef, useState } from 'react';
import { createBoardDisplayTimingDragPatch, } from '../modules/boardTiming';
import { readUserFacingSegmentLabelFromChainKey } from '../modules/scriptSegments/scriptSegmentDisplayLabels';
import { MathText } from './MathText';
export function TimelineClipBlock({ clip, durationMs, isActive, isSelected, layerIndex, onSelectClip, onUpdateBoardTiming, }) {
    const dragStateRef = useRef(null);
    const frameRef = useRef(null);
    const latestPreviewRef = useRef(null);
    const pendingPreviewRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [previewPatch, setPreviewPatch] = useState(null);
    const [rawClipTitle, rawClipSubtitle] = clip.label.split(/\r?\n/, 2);
    const clipTitle = clip.kind === 'audio' ? readUserFacingSegmentLabelFromChainKey(clip.chainKey) : rawClipTitle;
    const clipSubtitle = clip.kind === 'board' ? '' : rawClipSubtitle;
    const safeDurationMs = Math.max(1000, durationMs);
    const displayStartMs = previewPatch?.startMs ?? clip.startMs;
    const displayEndMs = previewPatch?.hideAtMs ?? previewPatch?.endMs ?? clip.hideAtMs ?? clip.endMs;
    const isBoardClipLocked = clip.kind === 'board' && clip.hideAtMs === undefined;
    const canDragTiming = clip.kind === 'board' && onUpdateBoardTiming && !isBoardClipLocked;
    const flushPreviewPatch = (nextPatch) => {
        pendingPreviewRef.current = nextPatch;
        latestPreviewRef.current = nextPatch;
        if (frameRef.current !== null) {
            return;
        }
        frameRef.current = window.requestAnimationFrame(() => {
            frameRef.current = null;
            setPreviewPatch(pendingPreviewRef.current);
        });
    };
    useEffect(() => {
        if (!isDragging) {
            return;
        }
        const handlePointerMove = (event) => {
            const dragState = dragStateRef.current;
            if (!dragState) {
                return;
            }
            flushPreviewPatch(createBoardDisplayTimingDragPatch({
                currentClientX: event.clientX,
                durationMs: dragState.durationMs,
                laneWidth: dragState.laneWidth,
                mode: dragState.mode,
                originEndMs: dragState.originEndMs,
                originStartMs: dragState.originStartMs,
                pointerX: dragState.pointerX,
            }));
        };
        const handlePointerUp = () => {
            const dragState = dragStateRef.current;
            if (dragState && latestPreviewRef.current) {
                onUpdateBoardTiming?.(dragState.clipId, latestPreviewRef.current);
            }
            dragStateRef.current = null;
            latestPreviewRef.current = null;
            pendingPreviewRef.current = null;
            setPreviewPatch(null);
            setIsDragging(false);
            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('pointerup', handlePointerUp);
        };
        window.addEventListener('pointermove', handlePointerMove);
        window.addEventListener('pointerup', handlePointerUp);
        return () => {
            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('pointerup', handlePointerUp);
        };
    }, [isDragging, onUpdateBoardTiming]);
    useEffect(() => () => {
        if (frameRef.current !== null) {
            window.cancelAnimationFrame(frameRef.current);
        }
    }, []);
    const startTimingDrag = (event, mode) => {
        if (!canDragTiming) {
            return;
        }
        const laneWidth = event.currentTarget.closest('.track-lane')?.getBoundingClientRect().width;
        if (!laneWidth) {
            return;
        }
        event.preventDefault();
        event.stopPropagation();
        onSelectClip(clip.id);
        dragStateRef.current = {
            clipId: clip.id,
            durationMs,
            laneWidth,
            mode,
            originEndMs: clip.endMs,
            originStartMs: clip.startMs,
            pointerX: event.clientX,
        };
        latestPreviewRef.current = null;
        pendingPreviewRef.current = null;
        setPreviewPatch(null);
        setIsDragging(true);
    };
    return (_jsxs("button", { className: [
            `clip clip--${clip.kind}`,
            isActive ? 'is-active' : '',
            isSelected ? 'selected' : '',
            canDragTiming ? 'clip--timing-draggable' : '',
            isDragging ? 'is-dragging' : '',
        ]
            .filter(Boolean)
            .join(' '), onClick: () => {
            if (!isDragging) {
                onSelectClip(clip.id);
            }
        }, onPointerDown: canDragTiming ? (event) => startTimingDrag(event, 'range') : undefined, style: {
            left: `${(displayStartMs / safeDurationMs) * 100}%`,
            zIndex: layerIndex === undefined ? undefined : 10 + layerIndex,
            width: `${Math.max(10, ((displayEndMs - displayStartMs) / safeDurationMs) * 100)}%`,
        }, type: "button", children: [canDragTiming ? (_jsx("span", { "aria-hidden": "true", className: "clip-resize-handle clip-resize-handle--start", onPointerDown: (event) => startTimingDrag(event, 'start') })) : null, _jsx(MathText, { className: "clip-title", children: clipTitle }), clipSubtitle ? _jsx(MathText, { className: "clip-subtitle", children: clipSubtitle }) : null, clip.kind === 'board' ? (_jsx("span", { "aria-label": isBoardClipLocked ? '板书已锁定：写完后保持可见，点击解锁截止时间' : '板书已解锁：到截止时间隐藏，点击恢复默认留场', "aria-pressed": isBoardClipLocked, className: ['clip-end-pin', isBoardClipLocked ? 'is-locked' : 'is-unlocked'].join(' '), onClick: (event) => {
                    event.preventDefault();
                    event.stopPropagation();
                }, onPointerDown: (event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    onUpdateBoardTiming?.(clip.id, {
                        hideAtMs: isBoardClipLocked ? clip.endMs : undefined,
                    });
                } })) : null, canDragTiming ? (_jsx("span", { "aria-hidden": "true", className: "clip-resize-handle clip-resize-handle--end", onPointerDown: (event) => startTimingDrag(event, 'end') })) : null] }));
}

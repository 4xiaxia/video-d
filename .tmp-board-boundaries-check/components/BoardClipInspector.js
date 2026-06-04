import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// @cleanroom-component: BoardClipInspector
// @domain: inspector/board-clip
// @slot: right-inspector/board-clip-card
// @depends: TimelineClip(kind=board)
// @io-input: selectedClip
// @io-output: onUpdateBoardClip
// @fields: BoardClipInspectorPatch from boardClipInspectorContract; read timing fields for mapping only
// @boundary: selected C material controls only; B timing lives in TeachingTimeline, no canvas size or A audio edits
// @c-drawspeed-boundary: C 书写速度由 C 书写速度控制，不由 B 寿命隐式改写
import { useEffect, useMemo, useState } from 'react';
import { Card, Empty, Tag, Typography } from 'antd';
import { normalizeBoardRevealWindow } from '../modules/boardReveal';
import { createBoardClipInspectorDraft, createBoardClipInspectorPatch, createBoardClipInspectorScalePatch, getBoardClipInspectorScalePercent, hasBoardClipInspectorDraftChanges, normalizeBoardClipInspectorDraft, } from './boardClipInspector/boardClipInspectorContract';
import { BoardClipBindingHintSection, BoardClipCanvasPositionSection, BoardClipContentSection, BoardClipDrawFeelSection, BoardClipFontGapSection, BoardClipInspectorActions, BoardClipLightGroup, BoardClipSkinSection, } from './boardClipInspector/BoardClipInspectorSections';
const { Text } = Typography;
export function BoardClipInspector({ defaultFontSize, selectedClip, onUpdateBoardClip, }) {
    // 当前数据模型里 B 寿命和 C 角色还同住 TimelineClip(kind='board')。
    // 右侧面板只把 board clip 当 C 角色编辑；B 寿命唯一入口留在时间轴。
    const selectedBoardClip = selectedClip?.kind === 'board' ? selectedClip : undefined;
    const selectedCClip = selectedBoardClip;
    const initialDraft = useMemo(() => createBoardClipInspectorDraft(selectedCClip, defaultFontSize), [defaultFontSize, selectedCClip]);
    const [draft, setDraft] = useState(initialDraft);
    const activeDraft = selectedBoardClip && draft?.clipId === selectedBoardClip.id ? draft : initialDraft;
    useEffect(() => {
        setDraft(initialDraft);
    }, [initialDraft]);
    const hasDraftChanges = hasBoardClipInspectorDraftChanges(activeDraft, selectedCClip, defaultFontSize);
    const scalePercent = getBoardClipInspectorScalePercent(activeDraft);
    const sourceStartMs = selectedCClip?.sourceStartMs ?? selectedCClip?.startMs ?? 0;
    const sourceEndMs = selectedCClip?.sourceEndMs ?? selectedCClip?.endMs ?? 0;
    const savedRevealStartMs = selectedCClip?.revealStartMs ?? sourceStartMs;
    const savedRevealEndMs = selectedCClip?.revealEndMs ?? sourceEndMs;
    // @xiaxia-inspector-preview: local timing patch only previews mapping; confirmDraft never sends it to store.
    const previewRevealWindow = selectedCClip && activeDraft
        ? normalizeBoardRevealWindow({
            displayEndMs: activeDraft.endMs,
            displayStartMs: activeDraft.startMs,
            patch: {
                endMs: activeDraft.endMs,
                startMs: activeDraft.startMs,
            },
            previousDisplayEndMs: selectedCClip.endMs,
            previousDisplayStartMs: selectedCClip.startMs,
            previousRevealEndMs: savedRevealEndMs,
            previousRevealStartMs: savedRevealStartMs,
            sourceEndMs,
            sourceStartMs,
        })
        : {
            revealEndMs: savedRevealEndMs,
            revealStartMs: savedRevealStartMs,
        };
    const updateDraft = (patch) => {
        setDraft((currentDraft) => {
            const baseDraft = selectedCClip && currentDraft?.clipId === selectedCClip.id ? currentDraft : initialDraft;
            return baseDraft ? normalizeBoardClipInspectorDraft({ ...baseDraft, ...patch }) : baseDraft;
        });
    };
    const updateScaleDraft = (value) => {
        const nextScalePercent = normalizeNumber(value, scalePercent);
        updateDraft(createBoardClipInspectorScalePatch(defaultFontSize, nextScalePercent));
    };
    const confirmDraft = () => {
        if (!activeDraft || !hasDraftChanges) {
            return;
        }
        const { clipId } = activeDraft;
        if (clipId !== selectedBoardClip?.id) {
            return;
        }
        // @xiaxia-inspector-boundary: C material panel reads B timing for mapping, but only writes C material fields.
        onUpdateBoardClip(createBoardClipInspectorPatch(activeDraft));
    };
    return (_jsx(Card, { className: "zone-card zone-inspector", extra: _jsx(Tag, { color: hasDraftChanges ? 'orange' : 'blue', children: hasDraftChanges ? '未确认' : selectedCClip ? '当前素材' : '素材面板' }), title: selectedCClip ? '选中 C 角色内容（当前素材内容）' : '素材内容', children: selectedCClip && activeDraft ? (_jsxs("div", { className: "board-clip-inspector", children: [_jsxs(BoardClipLightGroup, { dataAnchor: "bc-light-group-content-001", title: "\u663E\u793A\u5185\u5BB9", children: [_jsx(BoardClipContentSection, { clipId: selectedBoardClip.id, label: activeDraft.label, onChange: (label) => updateDraft({ label }) }), _jsx(BoardClipBindingHintSection, { displayEndMs: activeDraft.endMs, displayStartMs: activeDraft.startMs, revealEndMs: previewRevealWindow.revealEndMs, revealStartMs: previewRevealWindow.revealStartMs, sourceEndMs: sourceEndMs, sourceStartMs: sourceStartMs })] }), _jsxs(BoardClipLightGroup, { dataAnchor: "bc-light-group-skin-001", title: "C \u5916\u89C2", children: [_jsx(BoardClipSkinSection, { draft: activeDraft, onChange: updateDraft, onScaleChange: updateScaleDraft, scalePercent: scalePercent }), _jsx(BoardClipFontGapSection, {})] }), _jsx(BoardClipLightGroup, { dataAnchor: "bc-light-group-position-001", title: "C \u7AD9\u4F4D", children: _jsx(BoardClipCanvasPositionSection, { draft: activeDraft, onChange: updateDraft }) }), _jsx(BoardClipLightGroup, { dataAnchor: "bc-light-group-performance-001", title: "C \u6F14\u7ECE", children: _jsx(BoardClipDrawFeelSection, { drawSpeed: activeDraft.drawSpeed, onChange: (drawSpeed) => updateDraft({ drawSpeed }) }) }), _jsx(BoardClipInspectorActions, { hasDraftChanges: hasDraftChanges, onConfirm: confirmDraft, onReset: () => setDraft(initialDraft) }), _jsx(Text, { type: "secondary", children: "\u771F\u6B63\u4E66\u5199\u65F6\u6BB5\u4F1A\u8DDF\u7740\u8BB2\u89E3\u97F3\u9891\u548C\u7D20\u6750\u65F6\u957F\u4E00\u8D77\u53D8\u5316\uFF1B\u9ED8\u8BA4 C \u5199\u5B8C\u7EE7\u7EED\u7559\u573A\uFF0C\u53EA\u6709\u663E\u5F0F\u622A\u6B62\u65F6\u95F4\u624D\u9690\u85CF\u3002" })] })) : selectedClip ? (_jsx(Empty, { description: "\u9009\u62E9 C \u89D2\u8272\u540E\uFF0C\u8FD9\u91CC\u53EA\u7F16\u8F91 C \u7D20\u6750\u5185\u5BB9\u548C\u6837\u5F0F\uFF1BB \u5BFF\u547D\u8BF7\u5728\u65F6\u95F4\u8F74\u8C03\u6574\u3002", image: Empty.PRESENTED_IMAGE_SIMPLE })) : (_jsx(Empty, { description: "\u9009\u62E9 C \u89D2\u8272\u540E\uFF0C\u53EF\u8C03\u6574\u5185\u5BB9\u3001\u4F4D\u7F6E\u3001\u5927\u5C0F\u548C\u4E66\u5199\u901F\u5EA6\uFF1BB \u5BFF\u547D\u8BF7\u5728\u65F6\u95F4\u8F74\u8C03\u6574\u3002", image: Empty.PRESENTED_IMAGE_SIMPLE })) }));
}
function normalizeNumber(value, fallback) {
    if (typeof value === 'number' && !Number.isNaN(value)) {
        return value;
    }
    if (typeof value === 'string' && value.trim()) {
        const parsedValue = Number(value);
        return Number.isNaN(parsedValue) ? fallback : parsedValue;
    }
    return fallback;
}

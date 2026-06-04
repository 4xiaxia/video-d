import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// @cleanroom-component: BoardPreviewCard
// @domain: teaching-assets
// @slot: left-sider/board-preview
// @depends: CLayoutPreviewDraft, StageCanvasConfig, tldraw
// @route-impact: App shell only
import { useEffect, useMemo, useState } from 'react';
import { Tag, Typography } from 'antd';
import { createShapeId, Tldraw, toRichText } from 'tldraw';
import 'tldraw/tldraw.css';
import { resolveTldrawStageSize } from '../modules/tldrawStage/abcToTldrawShapes';
const { Text } = Typography;
const PREVIEW_SHAPE_IDS = {
    frame: createShapeId('layout-preview-frame'),
    title: createShapeId('layout-preview-title'),
};
export function BoardPreviewCard({ draft, stageCanvas, }) {
    const [editor, setEditor] = useState(null);
    const stageSize = useMemo(() => resolveTldrawStageSize(stageCanvas), [stageCanvas]);
    const draftKey = useMemo(() => draft?.items
        .map((item) => `${item.id}:${item.xPercent}:${item.yPercent}:${item.widthPercent}:${item.fontSize}:${item.stackIndex}`)
        .join('|') ?? '', [draft]);
    useEffect(() => {
        if (!editor)
            return;
        const stalePreviewShapeIds = editor
            .getCurrentPageShapes()
            .map((shape) => shape.id)
            .filter((shapeId) => String(shapeId).startsWith('shape:layout-preview-item-'));
        editor.run(() => {
            editor.deleteShapes([
                PREVIEW_SHAPE_IDS.frame,
                PREVIEW_SHAPE_IDS.title,
                ...stalePreviewShapeIds,
            ].filter((id) => editor.getShape(id)));
            if (!draft?.items.length) {
                return;
            }
            const sortedItems = [...draft.items].sort((a, b) => a.stackIndex - b.stackIndex || a.id.localeCompare(b.id));
            editor.createShapes([
                {
                    id: PREVIEW_SHAPE_IDS.frame,
                    type: 'geo',
                    x: 0,
                    y: 0,
                    props: {
                        geo: 'rectangle',
                        w: stageSize.width,
                        h: stageSize.height,
                        color: 'light-blue',
                        fill: 'none',
                        dash: 'draw',
                        size: 'xl',
                    },
                },
                {
                    id: PREVIEW_SHAPE_IDS.title,
                    type: 'text',
                    x: stageSize.width * 0.04,
                    y: stageSize.height * 0.04,
                    props: {
                        richText: toRichText('板书排版预览（临时）'),
                        size: 'm',
                        font: 'draw',
                        color: 'light-blue',
                        autoSize: true,
                    },
                },
                ...sortedItems.map((item) => ({
                    id: createShapeId(`layout-preview-item-${item.id}`),
                    type: 'text',
                    x: stageSize.width * (item.xPercent / 100),
                    y: stageSize.height * (item.yPercent / 100),
                    props: {
                        richText: toRichText(item.text),
                        size: resolvePreviewTextSize(item.fontSize),
                        font: 'draw',
                        color: 'black',
                        w: stageSize.width * (item.widthPercent / 100),
                        autoSize: false,
                    },
                })),
            ]);
            editor.zoomToBounds({ x: 0, y: 0, w: stageSize.width, h: stageSize.height }, { animation: { duration: 0 }, inset: 20 });
        }, { history: 'ignore' });
    }, [draft?.items.length, draftKey, editor, draft, stageSize.height, stageSize.width]);
    return (_jsxs("section", { className: "board-preview-card", "aria-label": "\u677F\u4E66\u9884\u89C8", children: [_jsx(Text, { strong: true, children: "\u677F\u4E66\u6392\u7248\u9884\u89C8" }), _jsx(Tag, { color: draft?.items.length ? 'green' : 'default', children: draft?.items.length ? `临时预览 ${draft.items.length} 项` : '暂无预览' }), draft?.items.length ? (_jsx("div", { className: "board-preview-canvas-wrap", "aria-label": "\u677F\u4E66\u6392\u7248\u9884\u89C8\u753B\u5E03", children: _jsx(Tldraw, { hideUi: true, onMount: setEditor, persistenceKey: "board-layout-preview-sidecard" }) })) : (_jsx("div", { className: "board-preview-placeholder", children: "\u6682\u65E0\u677F\u4E66\u9884\u89C8" })), _jsx(Text, { type: "secondary", children: "\u7528\u4E8E\u89C6\u89C9\u8BC4\u5BA1\uFF08\u4E34\u65F6\u6001\uFF09\uFF0C\u4E0D\u5199\u6B63\u5F0F C \u771F\u76F8\u3002" })] }));
}
function resolvePreviewTextSize(fontSize) {
    if (fontSize >= 46)
        return 'xl';
    if (fontSize >= 34)
        return 'l';
    if (fontSize >= 24)
        return 'm';
    return 's';
}

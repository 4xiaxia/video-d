import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// @domain: standalone-prototype
// @route: standalone=tldraw-proof
// @boundary: tldraw 框架验真页；只证明框架能力，不写入主线 ABC 状态。
// @deprecated: 2026-06-02 — tldraw 全线退场，此 proof 页无外部引用，已挪至 _deprecated/
import { useCallback, useMemo, useState } from 'react';
import { createShapeId, GeoShapeGeoStyle, Tldraw, toRichText, useValue, } from 'tldraw';
import 'tldraw/tldraw.css';
const PROOF_ROWS = [
    {
        section: 'read-problem',
        stepLabel: '开始读题',
        voiceText: '题目要求计算二十五乘四，再用一千二百除以结果。',
        boardSlice: '25 x 4 = 100',
        chainKey: 'read-problem-001',
    },
    {
        section: 'analysis',
        stepLabel: '分析题目',
        voiceText: '先求一组的数量，再把总量平均分。',
        boardSlice: '1200 ÷ 100 = 12',
        chainKey: 'analysis-001',
    },
    {
        section: 'step-1',
        stepLabel: '步骤1',
        voiceText: '乘法先完成，得到一百。',
        boardSlice: '所以每份是 12',
        chainKey: 'step-1-001',
    },
    {
        section: 'summary',
        stepLabel: '总结',
        voiceText: '答案是十二。',
        boardSlice: '答：12',
        chainKey: 'summary-001',
    },
];
const PROOF_SHAPE_IDS = [
    createShapeId('proof-frame'),
    createShapeId('proof-title'),
    createShapeId('proof-read-problem-label'),
    createShapeId('proof-read-problem-board'),
    createShapeId('proof-analysis-label'),
    createShapeId('proof-analysis-board'),
    createShapeId('proof-step-1-label'),
    createShapeId('proof-step-1-board'),
    createShapeId('proof-summary-label'),
    createShapeId('proof-summary-board'),
];
export function TldrawProofPage() {
    const [editor, setEditor] = useState(null);
    const [exportStatus, setExportStatus] = useState('未导出');
    const currentToolId = useValue('tldraw proof current tool', () => editor?.getCurrentToolId() ?? 'none', [editor]);
    const toolbarItems = useMemo(() => [
        { key: 'select', label: '选择', action: () => editor?.setCurrentTool('select') },
        { key: 'draw', label: '画笔', action: () => editor?.setCurrentTool('draw') },
        { key: 'eraser', label: '橡皮', action: () => editor?.setCurrentTool('eraser') },
        { key: 'text', label: '文字', action: () => editor?.setCurrentTool('text') },
        {
            key: 'rectangle',
            label: '矩形',
            action: () => {
                if (!editor)
                    return;
                editor.run(() => {
                    editor.setStyleForNextShapes(GeoShapeGeoStyle, 'rectangle');
                    editor.setCurrentTool('geo');
                });
            },
        },
        {
            key: 'oval',
            label: '圆形',
            action: () => {
                if (!editor)
                    return;
                editor.run(() => {
                    editor.setStyleForNextShapes(GeoShapeGeoStyle, 'oval');
                    editor.setCurrentTool('geo');
                });
            },
        },
    ], [editor]);
    const seedProofBoard = useCallback((mountedEditor) => {
        mountedEditor.run(() => {
            mountedEditor.deleteShapes(PROOF_SHAPE_IDS.filter((id) => mountedEditor.getShape(id)));
            mountedEditor.createShapes([
                {
                    id: PROOF_SHAPE_IDS[0],
                    type: 'geo',
                    x: 80,
                    y: 60,
                    props: {
                        geo: 'rectangle',
                        w: 1120,
                        h: 630,
                        color: 'light-blue',
                        fill: 'none',
                        dash: 'draw',
                        size: 'xl',
                    },
                },
                {
                    id: PROOF_SHAPE_IDS[1],
                    type: 'text',
                    x: 118,
                    y: 92,
                    props: {
                        richText: toRichText('ABC rows -> tldraw 画布 proof'),
                        size: 'l',
                        font: 'draw',
                        color: 'light-blue',
                        autoSize: true,
                    },
                },
                ...PROOF_ROWS.flatMap((row, index) => {
                    const y = 168 + index * 112;
                    return [
                        {
                            id: PROOF_SHAPE_IDS[2 + index * 2],
                            type: 'text',
                            x: 128,
                            y,
                            props: {
                                richText: toRichText(row.stepLabel),
                                size: 'm',
                                font: 'draw',
                                color: 'light-blue',
                                autoSize: true,
                            },
                        },
                        {
                            id: PROOF_SHAPE_IDS[3 + index * 2],
                            type: 'text',
                            x: 520,
                            y: y - 8,
                            props: {
                                richText: toRichText(row.boardSlice),
                                size: 'xl',
                                font: 'draw',
                                color: 'black',
                                autoSize: true,
                            },
                        },
                    ];
                }),
            ]);
            mountedEditor.zoomToBounds({ x: 60, y: 40, w: 1180, h: 690 }, { animation: { duration: 0 } });
            mountedEditor.setCurrentTool('draw');
        });
    }, []);
    const handleMount = useCallback((mountedEditor) => {
        setEditor(mountedEditor);
        seedProofBoard(mountedEditor);
    }, [seedProofBoard]);
    const handleReset = useCallback(() => {
        if (!editor)
            return;
        seedProofBoard(editor);
    }, [editor, seedProofBoard]);
    const handleExport = useCallback(async () => {
        if (!editor)
            return;
        const shapeIds = [...editor.getCurrentPageShapeIds()];
        if (shapeIds.length === 0) {
            setExportStatus('无形状可导出');
            return;
        }
        const { blob } = await editor.toImage(shapeIds, { format: 'png', background: true });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'tldraw-proof-board.png';
        link.click();
        URL.revokeObjectURL(url);
        setExportStatus(`已导出 ${shapeIds.length} 个形状`);
    }, [editor]);
    return (_jsxs("main", { className: "tldraw-proof-page", children: [_jsxs("aside", { className: "tldraw-proof-sidebar", "aria-label": "tldraw \u5916\u7F6E\u5DE5\u5177\u680F", children: [_jsx("div", { className: "tldraw-proof-sidebar__title", children: "tldraw proof" }), _jsxs("div", { className: "tldraw-proof-sidebar__meta", children: ["\u5F53\u524D\u5DE5\u5177\uFF1A", currentToolId] }), _jsx("div", { className: "tldraw-proof-toolbar", children: toolbarItems.map((item) => (_jsx("button", { className: "tldraw-proof-button", "data-active": currentToolId === item.key || (item.key === 'rectangle' && currentToolId === 'geo'), onClick: item.action, type: "button", children: item.label }, item.key))) }), _jsx("button", { className: "tldraw-proof-button tldraw-proof-button--primary", onClick: handleReset, type: "button", children: "\u91CD\u7F6E ABC \u6837\u4F8B" }), _jsx("button", { className: "tldraw-proof-button tldraw-proof-button--primary", onClick: handleExport, type: "button", children: "\u5BFC\u51FA PNG" }), _jsx("div", { className: "tldraw-proof-sidebar__meta", children: exportStatus }), _jsx("div", { className: "tldraw-proof-data", children: PROOF_ROWS.map((row) => (_jsxs("div", { className: "tldraw-proof-data__row", children: [_jsx("strong", { children: row.stepLabel }), _jsx("span", { children: row.boardSlice })] }, row.chainKey))) })] }), _jsx("section", { className: "tldraw-proof-canvas", "aria-label": "tldraw \u753B\u5E03\u533A\u57DF", children: _jsx(Tldraw, { hideUi: true, onMount: handleMount, persistenceKey: "tldraw-proof-page" }) })] }));
}

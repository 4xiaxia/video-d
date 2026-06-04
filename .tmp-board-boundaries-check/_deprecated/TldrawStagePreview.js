import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// @cleanroom-component: TldrawStagePreview
// @domain: stage-preview/framework-canvas
// @boundary: tldraw 框架舞台；读取现有 ABC 数据，不拥有 A/B/C 真相源。
// @deprecated: 2026-06-02 — tldraw 全线退场，此文件零外部引用，已挪至 _deprecated/
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button, Card, ColorPicker, Modal, Segmented, Slider, Space, Typography } from 'antd';
import { DefaultColorStyle, GeoShapeGeoStyle, Tldraw, useValue, } from 'tldraw';
import 'tldraw/tldraw.css';
import { TL_STAGE_SHAPE_IDS, resolveTldrawStageSize, syncAbcStageToTldraw } from '../modules/tldrawStage/abcToTldrawShapes';
import { StagePreviewToolbar } from '../components/StagePreviewToolbar';
const { Text } = Typography;
export function TldrawStagePreview({ boardClips, canvas, playheadMs, problemText, selectedBoardClipId, onRecordingActiveChange, onSelectBoardClip, onUpdateBoardClip, }) {
    const [editor, setEditor] = useState(null);
    const [activeToolMode, setActiveToolMode] = useState('off');
    const [strokeColor, setStrokeColor] = useState('#111111');
    const [strokeWidth, setStrokeWidth] = useState(5);
    const [boardShapeMeta, setBoardShapeMeta] = useState([]);
    const [recordingCanvas, setRecordingCanvas] = useState(null);
    const [emptyOverlayCanvas, setEmptyOverlayCanvas] = useState(null);
    const [isExpanded, setIsExpanded] = useState(false);
    const latestClipPatchRef = useRef('');
    const currentToolId = useValue('stage current tldraw tool', () => editor?.getCurrentToolId() ?? 'select', [editor]);
    const boardClipKey = useMemo(() => boardClips.map((clip) => [
        clip.id,
        clip.label,
        clip.startMs,
        clip.endMs,
        clip.xPercent,
        clip.yPercent,
        clip.widthPercent,
        clip.fontSize,
        clip.drawSpeed,
        clip.revealStartMs,
        clip.revealEndMs,
    ].join(':')).join('|'), [boardClips]);
    const stageSize = useMemo(() => resolveTldrawStageSize(canvas), [canvas]);
    const recordingCanvases = useMemo(() => (recordingCanvas && emptyOverlayCanvas ? { base: recordingCanvas, content: null, overlay: emptyOverlayCanvas } : null), [emptyOverlayCanvas, recordingCanvas]);
    useEffect(() => {
        if (!editor)
            return;
        const nextMeta = syncAbcStageToTldraw({
            boardClips,
            canvas,
            editor,
            playheadMs,
            problemText,
        });
        setBoardShapeMeta(nextMeta);
        window.requestAnimationFrame(() => {
            editor.zoomToBounds({ x: 0, y: 0, w: stageSize.width, h: stageSize.height }, { animation: { duration: 0 }, inset: 24 });
        });
    }, [boardClipKey, boardClips, canvas, editor, playheadMs, problemText, stageSize]);
    useEffect(() => {
        if (!editor)
            return;
        return editor.store.listen(() => {
            if (activeToolMode !== 'off') {
                const managedShapeIds = [
                    TL_STAGE_SHAPE_IDS.frame,
                    TL_STAGE_SHAPE_IDS.problemLabel,
                    TL_STAGE_SHAPE_IDS.analysisLabel,
                    TL_STAGE_SHAPE_IDS.solutionLabel,
                    TL_STAGE_SHAPE_IDS.summaryLabel,
                    TL_STAGE_SHAPE_IDS.problemText,
                    ...boardShapeMeta.map((item) => item.shapeId),
                ];
                const missingManagedShape = managedShapeIds.some((shapeId) => shapeId && !editor.getShape(shapeId));
                if (missingManagedShape) {
                    const repairedMeta = syncAbcStageToTldraw({
                        boardClips,
                        canvas,
                        editor,
                        playheadMs,
                        problemText,
                    });
                    setBoardShapeMeta(repairedMeta);
                    return;
                }
            }
            const selectedShape = editor.getOnlySelectedShape();
            const hit = boardShapeMeta.find((item) => item.shapeId === selectedShape?.id);
            if (hit && hit.clipId !== selectedBoardClipId) {
                onSelectBoardClip(hit.clipId);
            }
            if (hit && selectedShape && selectedShape.type === 'text') {
                const props = selectedShape.props;
                const patch = {
                    widthPercent: props.w ? (props.w / stageSize.width) * 100 : undefined,
                    xPercent: (selectedShape.x / stageSize.width) * 100,
                    yPercent: (selectedShape.y / stageSize.height) * 100,
                };
                const patchKey = `${hit.clipId}:${Math.round(patch.xPercent * 100)}:${Math.round(patch.yPercent * 100)}:${Math.round((patch.widthPercent ?? 0) * 100)}`;
                if (patchKey !== latestClipPatchRef.current) {
                    latestClipPatchRef.current = patchKey;
                    onUpdateBoardClip(hit.clipId, patch);
                }
            }
        }, { scope: 'all' });
    }, [activeToolMode, boardShapeMeta, boardClips, canvas, editor, onSelectBoardClip, onUpdateBoardClip, playheadMs, problemText, selectedBoardClipId, stageSize]);
    useEffect(() => {
        if (!editor || !selectedBoardClipId)
            return;
        const meta = boardShapeMeta.find((item) => item.clipId === selectedBoardClipId);
        if (meta) {
            editor.setSelectedShapes([meta.shapeId]);
        }
    }, [boardShapeMeta, editor, selectedBoardClipId]);
    const handleMount = useCallback((mountedEditor) => {
        setEditor(mountedEditor);
        mountedEditor.setCurrentTool('select');
    }, []);
    useEffect(() => {
        const canvasElement = document.createElement('canvas');
        const overlayElement = document.createElement('canvas');
        canvasElement.width = stageSize.width;
        canvasElement.height = stageSize.height;
        overlayElement.width = stageSize.width;
        overlayElement.height = stageSize.height;
        setRecordingCanvas(canvasElement);
        setEmptyOverlayCanvas(overlayElement);
        return () => {
            setRecordingCanvas(null);
            setEmptyOverlayCanvas(null);
        };
    }, [stageSize]);
    useEffect(() => {
        if (!editor || !recordingCanvas)
            return;
        let isCancelled = false;
        let timerId = 0;
        const context = recordingCanvas.getContext('2d');
        if (!context)
            return;
        const paintFrame = async () => {
            if (isCancelled)
                return;
            try {
                const shapeIds = [...editor.getCurrentPageShapeIds()];
                context.clearRect(0, 0, recordingCanvas.width, recordingCanvas.height);
                if (shapeIds.length) {
                    const { blob } = await editor.toImage(shapeIds, { format: 'png', background: true });
                    if (isCancelled)
                        return;
                    const image = await loadImageFromBlob(blob);
                    if (isCancelled)
                        return;
                    context.drawImage(image, 0, 0, recordingCanvas.width, recordingCanvas.height);
                }
            }
            catch {
                // 录制帧失败时跳过当前帧，下一帧继续。
            }
            finally {
                if (!isCancelled) {
                    timerId = window.setTimeout(paintFrame, 180);
                }
            }
        };
        void paintFrame();
        return () => {
            isCancelled = true;
            window.clearTimeout(timerId);
        };
    }, [editor, recordingCanvas]);
    const setTool = useCallback((mode) => {
        setActiveToolMode(mode);
        if (!editor)
            return;
        if (mode === 'pen' || mode === 'highlight' || mode === 'circle' || mode === 'cross') {
            editor.setStyleForNextShapes(DefaultColorStyle, resolveTldrawColor(strokeColor));
            editor.setCurrentTool('draw');
            return;
        }
        if (mode === 'eraser') {
            editor.setCurrentTool('eraser');
            return;
        }
        editor.setCurrentTool('select');
    }, [editor, strokeColor]);
    const setGeoTool = useCallback((geo) => {
        if (!editor)
            return;
        editor.run(() => {
            editor.setStyleForNextShapes(GeoShapeGeoStyle, geo);
            editor.setStyleForNextShapes(DefaultColorStyle, resolveTldrawColor(strokeColor));
            editor.setCurrentTool('geo');
        });
    }, [editor, strokeColor]);
    const handleExportPng = useCallback(async () => {
        if (!editor)
            return;
        const ids = [...editor.getCurrentPageShapeIds()];
        if (!ids.length)
            return;
        const { blob } = await editor.toImage(ids, { format: 'png', background: true });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'teaching-stage.png';
        link.click();
        URL.revokeObjectURL(link.href);
    }, [editor]);
    return (_jsxs(Card, { className: "zone-card zone-stage zone-stage--tldraw", title: "\u9884\u89C8\u821E\u53F0", extra: (_jsxs("div", { className: "tldraw-stage-card-actions", children: [_jsx(Button, { onClick: () => setIsExpanded(true), size: "small", type: "primary", children: "\u5C55\u5F00\u821E\u53F0" }), _jsx(StagePreviewToolbar, { onRecordingActiveChange: onRecordingActiveChange, recordingCanvases: recordingCanvases })] })), children: [_jsx(TldrawStageBody, { activeToolMode: activeToolMode, canvas: canvas, currentToolId: currentToolId, handleExportPng: handleExportPng, handleMount: handleMount, setGeoTool: setGeoTool, setStrokeColor: setStrokeColor, setStrokeWidth: setStrokeWidth, setTool: setTool, strokeColor: strokeColor, strokeWidth: strokeWidth }), _jsx(Modal, { className: "tldraw-stage-modal", footer: null, onCancel: () => setIsExpanded(false), open: isExpanded, title: `录屏舞台 ${canvas.width}×${canvas.height}`, width: "92vw", children: _jsx(TldrawStageBody, { activeToolMode: activeToolMode, canvas: canvas, currentToolId: currentToolId, expanded: true, handleExportPng: handleExportPng, handleMount: handleMount, setGeoTool: setGeoTool, setStrokeColor: setStrokeColor, setStrokeWidth: setStrokeWidth, setTool: setTool, strokeColor: strokeColor, strokeWidth: strokeWidth }) })] }));
}
function TldrawStageBody({ activeToolMode, canvas, currentToolId, expanded = false, handleExportPng, handleMount, setGeoTool, setStrokeColor, setStrokeWidth, setTool, strokeColor, strokeWidth, }) {
    return (_jsxs("div", { className: expanded ? 'tldraw-stage-shell tldraw-stage-shell--expanded' : 'tldraw-stage-shell', children: [_jsx("aside", { className: "tldraw-stage-toolbar", "aria-label": "\u821E\u53F0\u5DE5\u5177\u680F", children: _jsxs(Space, { orientation: "vertical", size: "small", children: [_jsx(Segmented, { block: true, onChange: (value) => setTool(value), options: [
                                { label: '选择', value: 'off' },
                                { label: '画笔', value: 'pen' },
                                { label: '橡皮', value: 'eraser' },
                            ], value: activeToolMode === 'eraser' || activeToolMode === 'pen' ? activeToolMode : 'off' }), _jsxs(Space.Compact, { block: true, children: [_jsx(Button, { onClick: () => setGeoTool('rectangle'), children: "\u77E9\u5F62" }), _jsx(Button, { onClick: () => setGeoTool('oval'), children: "\u5706\u5F62" })] }), _jsx(Button, { block: true, onClick: handleExportPng, children: "\u5BFC\u51FA PNG" }), _jsxs(Space, { orientation: "vertical", size: 4, children: [_jsx(Text, { type: "secondary", children: "\u989C\u8272" }), _jsx(ColorPicker, { onChange: (_, hex) => setStrokeColor(hex), showText: true, value: strokeColor })] }), _jsxs(Space, { orientation: "vertical", size: 4, children: [_jsx(Text, { type: "secondary", children: "\u7C97\u7EC6" }), _jsx(Slider, { max: 20, min: 1, onChange: setStrokeWidth, value: strokeWidth })] }), _jsxs(Text, { type: "secondary", children: ["\u5F53\u524D\uFF1A", currentToolId] })] }) }), _jsx("section", { className: "tldraw-stage-canvas", style: { aspectRatio: `${canvas.width} / ${canvas.height}`, background: canvas.background }, children: _jsx(Tldraw, { hideUi: true, onMount: handleMount, persistenceKey: expanded ? 'teaching-abc-stage-expanded' : 'teaching-abc-stage' }) })] }));
}
function resolveTldrawColor(color) {
    if (color === '#29d4ff')
        return 'light-blue';
    if (color === '#d00000' || color === '#ff0000')
        return 'red';
    if (color === '#008000' || color === '#00aa55')
        return 'green';
    if (color === '#0066ff')
        return 'blue';
    return 'black';
}
function loadImageFromBlob(blob) {
    return new Promise((resolve, reject) => {
        const url = URL.createObjectURL(blob);
        const image = new Image();
        image.onload = () => {
            URL.revokeObjectURL(url);
            resolve(image);
        };
        image.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error('tldraw stage recording frame failed.'));
        };
        image.src = url;
    });
}

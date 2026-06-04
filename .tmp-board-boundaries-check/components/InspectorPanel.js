import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { BoardClipInspector } from './BoardClipInspector';
import { BoardControlResponsibilitiesPanel } from './BoardControlResponsibilitiesPanel';
import { CanvasInspector } from './CanvasInspector';
import { CurrentProjectBoardFontInspector } from './CurrentProjectBoardFontInspector';
export function InspectorPanel({ canvas, selectedClip, onUpdateBoardClip, onUpdateCanvas, }) {
    return (_jsxs("section", { className: "inspector-stack", children: [_jsx(BoardControlResponsibilitiesPanel, {}), _jsx(CanvasInspector, { canvas: canvas, onUpdateCanvas: onUpdateCanvas }), _jsx(CurrentProjectBoardFontInspector, { canvas: canvas, onUpdateCanvas: onUpdateCanvas }), _jsx(BoardClipInspector, { defaultFontSize: canvas.boardFontSize, onUpdateBoardClip: onUpdateBoardClip, selectedClip: selectedClip })] }));
}

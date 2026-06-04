import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function CStickerFrame({ children, color, contentKind, fontSize, isDragging, isSelected, onPointerDown, onResizePointerDown, revealProgress, stackIndex, text, widthPercent, xPercent, yPercent, }) {
    const safeRevealProgress = clampRevealProgress(revealProgress);
    return (_jsxs("button", { "aria-label": `C 素材：${text}`, className: [
            'board-text-sticker',
            contentKind === 'formula' ? 'board-text-sticker--math' : '',
            isDragging ? 'is-dragging' : '',
            isSelected ? 'is-selected' : '',
        ].filter(Boolean).join(' '), onPointerDown: onPointerDown, style: {
            color,
            left: `${xPercent}%`,
            top: `${yPercent}%`,
            '--board-font-size': `${fontSize}px`,
            width: `${widthPercent}%`,
            zIndex: 10 + stackIndex,
        }, type: "button", children: [_jsx("span", { className: "board-text-sticker__write-ink", style: { clipPath: createRevealClipPath(safeRevealProgress) }, children: children }), isSelected ? (_jsx("span", { "aria-label": "\u8C03\u6574 C \u7D20\u6750\u5C3A\u5BF8", className: "board-text-sticker__resize-handle", onPointerDown: onResizePointerDown, role: "slider" })) : null] }));
}
function createRevealClipPath(progress) {
    const progressPercent = progress * 100;
    const topEdgePercent = clampPercent(progressPercent + (progress > 0 && progress < 1 ? 1.8 : 0));
    const bottomEdgePercent = clampPercent(progressPercent - (progress > 0 && progress < 1 ? 1.2 : 0));
    return `polygon(0 0, ${topEdgePercent}% 0, ${bottomEdgePercent}% 100%, 0 100%)`;
}
function clampPercent(value) {
    return Math.min(100, Math.max(0, value));
}
function clampRevealProgress(value) {
    if (!Number.isFinite(value)) {
        return 1;
    }
    return Math.min(1, Math.max(0, value));
}

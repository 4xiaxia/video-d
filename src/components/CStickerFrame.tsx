// @cleanroom-component: CStickerFrame
// @domain: board-sticker-rendering/frame
// @slot: center-stage/c-canvas-sticker/frame
// @depends: C visual fontSize/reveal state
// @io-input: frame geometry, selected state, revealProgress, children
// @io-output: click handler for selection, clipped content slot
// @boundary: C sticker frame only; does not decide handwriting vs math content rendering
// @xiaxia-2026-06-08 返璞归真：板书内容是文本段落<p>，在容器内按文档流排列，不是button散落抢位置

import type { CSSProperties, MouseEventHandler, ReactNode } from 'react';
import type { CoursewareZoneKey } from '../modules/canvasStage/coursewareZoneLayout';

export function CStickerFrame({
  children,
  color,
  contentKind,
  fontSize,
  isSelected,
  onClick,
  revealProgress,
  text,
  zoneKey,
}: {
  children: ReactNode;
  color: string;
  contentKind: 'handwriting' | 'formula';
  fontSize: number;
  isSelected: boolean;
  onClick: MouseEventHandler<HTMLParagraphElement>;
  revealProgress: number;
  text: string;
  zoneKey: CoursewareZoneKey;
}) {
  const safeRevealProgress = clampRevealProgress(revealProgress);

  return (
    <p
      aria-label={`C 素材：${text}`}
      className={[
        'board-text-sticker',
        `board-text-sticker--zone-${zoneKey}`,
        contentKind === 'formula' ? 'board-text-sticker--math' : '',
        isSelected ? 'is-selected' : '',
      ].filter(Boolean).join(' ')}
      data-agent-content-kind={contentKind}
      data-agent-zone={zoneKey}
      data-role="courseware-c-sticker"
      onClick={onClick}
      style={{
        color,
        '--board-font-size': `${fontSize}px`,
      } as CSSProperties}
    >
      <span
        className="board-text-sticker__write-ink"
        style={{ clipPath: createRevealClipPath(safeRevealProgress) }}
      >
        {children}
      </span>
    </p>
  );
}

function createRevealClipPath(progress: number) {
  const progressPercent = progress * 100;
  const topEdgePercent = clampPercent(progressPercent + (progress > 0 && progress < 1 ? 1.8 : 0));
  const bottomEdgePercent = clampPercent(progressPercent - (progress > 0 && progress < 1 ? 1.2 : 0));
  return `polygon(0 0, ${topEdgePercent}% 0, ${bottomEdgePercent}% 100%, 0 100%)`;
}

function clampPercent(value: number) {
  return Math.min(100, Math.max(0, value));
}

function clampRevealProgress(value: number) {
  if (!Number.isFinite(value)) {
    return 1;
  }

  return Math.min(1, Math.max(0, value));
}

import type { CSSProperties, ReactNode } from 'react';
import React from 'react';

export type BoardZoneName = 'problem' | 'analysis' | 'solution' | 'summary';

type BoardZoneContainerProps = {
  zoneName: BoardZoneName;
  label: string;
  xPercent: number;
  yPercent: number;
  widthPercent?: number;
  onPointerDown?: (e: React.PointerEvent<HTMLDivElement>) => void;
  children: ReactNode;
};

export function BoardZoneContainer({
  zoneName,
  label,
  xPercent,
  yPercent,
  widthPercent,
  onPointerDown,
  children,
}: BoardZoneContainerProps) {
  return (
    <div
      className={`board-zone-container board-zone-container--${zoneName}`}
      style={{
        position: 'absolute',
        left: `${xPercent}%`,
        top: `${yPercent}%`,
        width: widthPercent ? `${widthPercent}%` : 'auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        padding: '10px',
        boxSizing: 'border-box',
        touchAction: 'none',
      } as CSSProperties}

    >
      <div
        className={`courseware-label courseware-label--${zoneName}`}
        onPointerDown={onPointerDown}
        style={{
          position: 'relative',
          left: 'auto',
          top: 'auto',
          transform: 'none',
          marginBottom: '8px',
          cursor: 'grab',
          alignSelf: zoneName === 'solution' ? 'center' : 'flex-start'
        }}
      >
        {label}
      </div>
      <div className="board-zone-content" style={{ display: 'flex', flexDirection: 'column', width: '100%', position: 'relative' }}>
        {children}
      </div>
    </div>
  );
}

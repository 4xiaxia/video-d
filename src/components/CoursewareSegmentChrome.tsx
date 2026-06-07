// @cleanroom-component: CoursewareSegmentChrome
// @domain: drawboard-stage/courseware-segment-chrome
// @slot: center-stage/segment-label-container
// @depends: CoursewareZoneBox
// @io-input: measured segment box, label drag handler
// @io-output: flat stage chrome for segment label and optional content container
// @boundary: segment chrome only; does not render C board text, problem truth text, or mutate timeline data

import type { CSSProperties, PointerEventHandler } from 'react';
import type { CoursewareZoneBox } from '../modules/canvasStage/coursewareZoneLayout';

export function CoursewareSegmentChrome({
  isDragging,
  onLabelPointerDown,
  zoneBox,
}: {
  isDragging: boolean;
  onLabelPointerDown: PointerEventHandler<HTMLDivElement>;
  zoneBox: CoursewareZoneBox;
}) {
  const isProblemZone = zoneBox.key === 'problem';

  return (
    <>
      {zoneBox.hasContent && !isProblemZone ? (
        <div
          key={`${zoneBox.key}-container`}
          aria-hidden="true"
          className="courseware-zone-box"
          data-agent-anchor={`courseware-segment-container-${zoneBox.key}`}
          data-zone-key={zoneBox.key}
          style={{
            left: `${zoneBox.leftRatio * 100}%`,
            top: `${zoneBox.topRatio * 100}%`,
            width: `${zoneBox.widthRatio * 100}%`,
            height: `${zoneBox.heightRatio * 100}%`,
          }}
        />
      ) : null}
      <div
        className={`courseware-label courseware-label--${zoneBox.key}`}
        data-agent-anchor={isProblemZone ? 'stage-problem-label' : `courseware-segment-label-${zoneBox.key}`}
        data-agent-zone={zoneBox.key}
        data-anchor={zoneBox.labelAnchor}
        data-dragging={isDragging}
        data-role={isProblemZone ? 'problem-zone-label' : 'courseware-segment-label'}
        onPointerDown={onLabelPointerDown}
        style={{
          left: `${zoneBox.labelLeftRatio * 100}%`,
          top: `${zoneBox.labelTopRatio * 100}%`,
        } as CSSProperties}
      >
        {zoneBox.label}
      </div>
    </>
  );
}

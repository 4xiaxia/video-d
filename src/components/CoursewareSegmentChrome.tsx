// @cleanroom-component: CoursewareSegmentChrome
// @domain: drawboard-stage/courseware-segment-chrome
// @slot: center-stage/segment-label-container
// @depends: CoursewareZoneBox
// @io-input: measured segment box, label drag handler
// @io-output: flowing segment chrome = label pill + elastic container frame
// @boundary: segment chrome only; does not render C board text, problem truth text, or mutate timeline data
// @concept: 标签+弹性容器=板书分片（流动盒子），容器大小=文本块+10px边距
//           点击标签可拖动整个分片（标签+容器+板书内容通过 zoneOffsets 同步偏移）

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
      {/* 弹性容器框：大小=文本块+10px边距，流动布局中按内容实时撑开 */}
      {zoneBox.hasContent && !isProblemZone ? (
        <div
          key={`${zoneBox.key}-container`}
          className="courseware-zone-box"
          data-agent-anchor={`courseware-segment-container-${zoneBox.key}`}
          data-agent-zone={zoneBox.key}
          data-role="courseware-segment-container"
          data-zone-key={zoneBox.key}
          style={{
            left: `${zoneBox.leftRatio * 100}%`,
            top: `${zoneBox.topRatio * 100}%`,
            width: `${zoneBox.widthRatio * 100}%`,
            height: `${zoneBox.heightRatio * 100}%`,
          }}
        />
      ) : null}
      {/* 标签 pill：分片拖动句柄，拖动时联动容器+板书内容 */}
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

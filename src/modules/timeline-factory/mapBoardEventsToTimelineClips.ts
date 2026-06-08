// @@ABC_BOARD_EVENT_TO_CLIP
// @trace-index: src/CORE_TRACE_TAGS.md
// @cleanroom-module: timeline-factory
// @domain: board-audio-alignment
// @slot: timeline-factory/board-event-to-clip-mapper
// @depends: BoardEvent, TimelineClip
// @feature-branch: board-events
// @feature-branch: timeline-review-workflow
// @data-map: BoardEvent.text -> TimelineClip.label
// @data-map: BoardEvent.startMs/endMs -> TimelineClip.startMs/endMs
// @data-map: BoardEvent.startMs/endMs -> TimelineClip.sourceStartMs/sourceEndMs/revealStartMs/revealEndMs
// @data-map: BoardEvent.sentenceId -> TimelineClip.sourceRef
// ID: cleanroom-timeline-board-map-001
// @io-input: BoardEvent[], MapBoardEventsToTimelineClipsOptions
// @io-output: TimelineClip(kind=board)[]
// @route: timeline factory / timeline-review-workflow
// @fields: TeachingProject.timeline.clips(kind=board)
// @boundary: pure mapping only; no store writes, no UI mutation, no TTS request
// @b-c-separation: 当前过渡态：B轨时间属性和C轨视觉属性同住同一TimelineClip；目标态拆为BTimingClip+CVisualClip，但拆后仍必须ABC成组，不存在B-only

import type { BoardEvent, TimelineClip } from '../../domain/teachingProject';
import { DEFAULT_BOARD_DRAW_SPEED } from '../boardReveal/boardRevealConfig';
import { COURSEWARE_LABEL_LEFT_RATIOS, COURSEWARE_LABEL_TOP_RATIOS } from '../canvasStage/coursewareChrome';
import { getZoneNameFromChainKey } from '../canvasStage/coursewareZoneLayout';
import type { MapBoardEventsToTimelineClipsOptions } from './types';

const defaultBoardTrackId = 'track-board';
const defaultClipIdPrefix = 'clip-board';

// @xiaxia-2026-06-08 初始站位默认值：以该内容所属标签锚点为起点（标签+板书+边距=分片盒子）。
// 仅决定"用户未拖动时"的默认坐标；一旦被拖动，updateBoardClip 写入的新坐标覆盖此默认，本逻辑不参与。
// 贴纸已改为左上角定位(stage.css 去掉 translate、Konva 去掉 -width/2)，故 xPercent/yPercent
// 直接 = 标签左上角锚点，内容左缘对齐标签；同分区内按出现顺序纵向堆叠。
const INITIAL_LABEL_TO_CONTENT_GAP_PCT = 4; // 标签下方到首个内容的间距（标签高 + 约 10px 边距观感）
const INITIAL_ZONE_ROW_STEP_PCT = 13; // 同分区内每多一个内容向下堆叠的步进

export function mapBoardEventsToTimelineClips(
  boardEvents: BoardEvent[],
  options: MapBoardEventsToTimelineClipsOptions = {},
): TimelineClip[] {
  const trackId = options.trackId ?? defaultBoardTrackId;
  const clipIdPrefix = options.clipIdPrefix ?? defaultClipIdPrefix;
  const zoneRowCounters: Partial<Record<ReturnType<typeof getZoneNameFromChainKey>, number>> = {};

  return boardEvents.map((event, index) => {
    // B轨时间控制属性（对应TTS句子）
    const bTimingProperties = {
      chainKey: event.chainKey,
      endMs: event.endMs,
      id: `${clipIdPrefix}-${String(index + 1).padStart(3, '0')}`,
      kind: 'board' as const,
      label: event.text,
      revealEndMs: event.endMs,
      revealStartMs: event.startMs,
      sourceEndMs: event.endMs,
      sourceRef: event.sentenceId,
      sourceStartMs: event.startMs,
      startMs: event.startMs,
      trackId,
    };

    // C轨视觉属性（对应板书内容）：初始默认站位 = 标签锚点为起点，同分区按顺序纵向堆叠
    const zoneName = getZoneNameFromChainKey(event.chainKey);
    const rowInZone = zoneRowCounters[zoneName] ?? 0;
    zoneRowCounters[zoneName] = rowInZone + 1;
    const cVisualProperties = {
      xPercent: COURSEWARE_LABEL_LEFT_RATIOS[zoneName] * 100,
      yPercent:
        COURSEWARE_LABEL_TOP_RATIOS[zoneName] * 100 +
        INITIAL_LABEL_TO_CONTENT_GAP_PCT +
        rowInZone * INITIAL_ZONE_ROW_STEP_PCT,
      drawSpeed: readBoardDrawSpeed(),
    };

    // 合并B轨和C轨属性（暂时保持在一个TimelineClip中）
    return {
      ...bTimingProperties,
      ...cVisualProperties,
    };
  });
}

function readBoardDrawSpeed() {
  return DEFAULT_BOARD_DRAW_SPEED;
}

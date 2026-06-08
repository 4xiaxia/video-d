import {
  COURSEWARE_LABEL_LEFT_RATIOS,
  COURSEWARE_LABEL_TOP_RATIOS,
} from './coursewareChrome';

export const COURSEWARE_ZONE_KEYS = ['problem', 'analysis', 'solution', 'summary'] as const;
export type CoursewareZoneKey = typeof COURSEWARE_ZONE_KEYS[number];

export type CoursewareZoneLabelAnchor = 'left' | 'center';

export type CoursewareZoneBox = {
  hasContent: boolean;
  heightRatio: number;
  key: CoursewareZoneKey;
  label: string;
  labelAnchor: CoursewareZoneLabelAnchor;
  labelLeftRatio: number;
  labelTopRatio: number;
  leftRatio: number;
  topRatio: number;
  widthRatio: number;
};

export type CoursewareZoneBoxRecord = Record<CoursewareZoneKey, CoursewareZoneBox>;

type RectLike = {
  bottom: number;
  left: number;
  right: number;
  top: number;
};

type StageRectLike = {
  height: number;
  left: number;
  top: number;
  width: number;
};

const LABEL_TEXT: Record<CoursewareZoneKey, string> = {
  analysis: '分析',
  problem: '题目',
  solution: '解答',
  summary: '总结',
};

const LABEL_HEIGHT_PX = 22;
const LABEL_GAP_PX = 6;
const ZONE_PADDING_PX = 10;

export function buildCoursewareZoneBoxesFromDom({
  problemRect,
  stageRect,
  stickerRectsByZone,
}: {
  problemRect: RectLike | null;
  stageRect: StageRectLike;
  stickerRectsByZone: Partial<Record<CoursewareZoneKey, RectLike[]>>;
}): CoursewareZoneBoxRecord {
  const result = createFallbackCoursewareZoneBoxes();

  for (const key of COURSEWARE_ZONE_KEYS) {
    const rects = [...(stickerRectsByZone[key] ?? [])];
    if (key === 'problem' && problemRect) {
      rects.push(problemRect);
    }
    result[key] = createZoneBoxFromRects(key, rects, stageRect);
  }

  return result;
}

export function createFallbackCoursewareZoneBoxes(): CoursewareZoneBoxRecord {
  return {
    analysis: createFallbackCoursewareZoneBox('analysis'),
    problem: createFallbackCoursewareZoneBox('problem'),
    solution: createFallbackCoursewareZoneBox('solution'),
    summary: createFallbackCoursewareZoneBox('summary'),
  };
}

export function getZoneNameFromChainKey(chainKey: string | undefined): CoursewareZoneKey {
  // @xiaxia-2026-06-08 映射唯一性修复：chainKey 上游会产出带 purpose 后缀的
  // template-open-xxx / template-pre-analysis / template-end-summary（见 abcChainKey.ts）。
  // 原本只做精确等于，带后缀的分析/总结板书全掉进默认 solution，导致标签↔板书归错组。
  // 这里与 createAbcChainLabels / isBoardMaterialChainKey 用同一套前缀判定，保持唯一真相。
  if (chainKey === 'template-open' || chainKey?.startsWith('template-open-')) return 'problem';
  if (chainKey === 'template-pre' || chainKey?.startsWith('template-pre-')) return 'analysis';
  if (chainKey === 'template-end' || chainKey?.startsWith('template-end-')) return 'summary';
  if (chainKey?.startsWith('step-')) return 'solution';
  return 'solution';
}

function createZoneBoxFromRects(zoneKey: CoursewareZoneKey, rects: RectLike[], stageRect: StageRectLike): CoursewareZoneBox {
  if (!rects.length || stageRect.width <= 0 || stageRect.height <= 0) {
    return createFallbackCoursewareZoneBox(zoneKey);
  }

  let left = Number.POSITIVE_INFINITY;
  let top = Number.POSITIVE_INFINITY;
  let right = Number.NEGATIVE_INFINITY;
  let bottom = Number.NEGATIVE_INFINITY;

  for (const rect of rects) {
    left = Math.min(left, rect.left);
    top = Math.min(top, rect.top);
    right = Math.max(right, rect.right);
    bottom = Math.max(bottom, rect.bottom);
  }

  const leftPx = clamp(left - stageRect.left - ZONE_PADDING_PX, 0, stageRect.width);
  const topPx = clamp(top - stageRect.top - ZONE_PADDING_PX, 0, stageRect.height);
  const rightPx = clamp(right - stageRect.left + ZONE_PADDING_PX, 0, stageRect.width);
  const bottomPx = clamp(bottom - stageRect.top + ZONE_PADDING_PX, 0, stageRect.height);
  const labelTopPx = clamp(topPx - LABEL_HEIGHT_PX - LABEL_GAP_PX, 0, stageRect.height);

  return {
    hasContent: true,
    heightRatio: (bottomPx - topPx) / stageRect.height,
    key: zoneKey,
    label: LABEL_TEXT[zoneKey],
    labelAnchor: 'left',
    labelLeftRatio: leftPx / stageRect.width,
    labelTopRatio: labelTopPx / stageRect.height,
    leftRatio: leftPx / stageRect.width,
    topRatio: topPx / stageRect.height,
    widthRatio: (rightPx - leftPx) / stageRect.width,
  };
}

function createFallbackCoursewareZoneBox(zoneKey: CoursewareZoneKey): CoursewareZoneBox {
  return {
    hasContent: false,
    heightRatio: 0,
    key: zoneKey,
    label: LABEL_TEXT[zoneKey],
    labelAnchor: zoneKey === 'solution' ? 'center' : 'left',
    labelLeftRatio: COURSEWARE_LABEL_LEFT_RATIOS[zoneKey],
    labelTopRatio: COURSEWARE_LABEL_TOP_RATIOS[zoneKey],
    leftRatio: 0,
    topRatio: 0,
    widthRatio: 0,
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

// @cleanroom-module: drawCoursewareStageFrame
// @domain: canvas-recording-stage
// @depends: StageCanvasConfig width/height/background
// @io-input: CanvasRenderingContext2D, StageCanvasConfig, problem text summary
// @io-output: painted canvas recording foundation frame
// @boundary: render-only canvas foundation; does not read or mutate A audio, B timeline, C clips, or store
// @truth-contract: 标签坐标和题文坐标来自 COURSEWARE_ZONE_BOUNDS，与 DOM .courseware-label / .courseware-problem-area 同源。

import type { StageCanvasConfig } from '../../domain/teachingProject';
import {
  COURSEWARE_LABEL_HEIGHT_RATIO,
  COURSEWARE_LABEL_LEFT_RATIOS,
  COURSEWARE_LABEL_TOP_RATIOS,
  COURSEWARE_LABEL_WIDTH_RATIO,
  COURSEWARE_PROBLEM_LEFT_RATIO,
  COURSEWARE_PROBLEM_MAX_WIDTH_RATIO,
  COURSEWARE_PROBLEM_TOP_RATIO,
  COURSEWARE_SYSTEM_FONT_FAMILY,
  resolveProblemFontSize,
  wrapCoursewareSummaryText,
} from './coursewareChrome';
import type { CoursewareZoneBoxRecord } from './coursewareZoneLayout';
import { COURSEWARE_ZONE_KEYS, createFallbackCoursewareZoneBoxes } from './coursewareZoneLayout';

const LABEL_BG = '#59cee5';
const LABEL_TEXT = '#ffffff';
const PROBLEM_TEXT = '#243247';
const FRAME_STROKE = '#59cee5';

export function drawCoursewareStageFrame(
  context: CanvasRenderingContext2D,
  canvas: StageCanvasConfig,
  problemSummary = '',
  zoneBoxes: CoursewareZoneBoxRecord = createFallbackCoursewareZoneBoxes(),
) {
  context.save();
  context.setTransform(1, 0, 0, 1, 0, 0);
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = canvas.background || '#ffffff';
  context.fillRect(0, 0, canvas.width, canvas.height);
  drawCoursewareFrameChrome(context, canvas, zoneBoxes);
  drawProblemSummary(context, canvas, problemSummary);
  context.restore();
}

function drawCoursewareFrameChrome(
  context: CanvasRenderingContext2D,
  canvas: StageCanvasConfig,
  zoneBoxes: CoursewareZoneBoxRecord,
) {
  // 边框
  const lineWidth = Math.max(8, canvas.width * 0.007);
  context.strokeStyle = FRAME_STROKE;
  context.lineWidth = lineWidth;
  context.strokeRect(lineWidth / 2, lineWidth / 2, canvas.width - lineWidth, canvas.height - lineWidth);

  for (const zoneKey of COURSEWARE_ZONE_KEYS) {
    const zoneBox = zoneBoxes[zoneKey];
    if (zoneBox.hasContent) {
      drawZoneBox(context, canvas, zoneBox);
    }
    drawLabel(context, canvas, zoneBox.label, zoneBox.labelLeftRatio, zoneBox.labelTopRatio, zoneBox.labelAnchor);
  }
}

function drawLabel(
  context: CanvasRenderingContext2D,
  canvas: StageCanvasConfig,
  text: string,
  leftRatio: number,
  topRatio: number,
  anchor: 'left' | 'center',
) {
  const resolvedLabelWidth = Math.max(canvas.width * COURSEWARE_LABEL_WIDTH_RATIO, 56);
  const x = anchor === 'center'
    ? (canvas.width * leftRatio) - (resolvedLabelWidth / 2)
    : canvas.width * leftRatio;
  const y = canvas.height * topRatio;
  const w = resolvedLabelWidth;
  const h = canvas.height * COURSEWARE_LABEL_HEIGHT_RATIO;
  const borderRadius = Math.max(4, h * 0.28);
  const fontSize = Math.max(14, h * 0.48);

  // 背景圆角块
  context.fillStyle = LABEL_BG;
  roundedRect(context, x, y, w, h, borderRadius);
  context.fill();

  // 文字
  context.fillStyle = LABEL_TEXT;
  context.font = `700 ${fontSize}px sans-serif`;
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(text, x + w / 2, y + h / 2);
}

function drawZoneBox(
  context: CanvasRenderingContext2D,
  canvas: StageCanvasConfig,
  zoneBox: CoursewareZoneBoxRecord[keyof CoursewareZoneBoxRecord],
) {
  context.save();
  context.strokeStyle = 'rgba(72, 208, 235, 0.58)';
  context.lineWidth = 1;
  context.setLineDash([8, 5]);
  roundedRect(
    context,
    canvas.width * zoneBox.leftRatio,
    canvas.height * zoneBox.topRatio,
    canvas.width * zoneBox.widthRatio,
    canvas.height * zoneBox.heightRatio,
    8,
  );
  context.stroke();
  context.restore();
}

function drawProblemSummary(context: CanvasRenderingContext2D, canvas: StageCanvasConfig, problemSummary: string) {
  const text = problemSummary.trim();
  if (!text) {
    return;
  }

  const fontSize = resolveProblemFontSize(canvas);
  const lineHeight = fontSize * 1.46;
  const maxWidth = Math.min(canvas.width * COURSEWARE_PROBLEM_MAX_WIDTH_RATIO, 520 * (canvas.width / 1120));

  context.fillStyle = PROBLEM_TEXT;
  context.font = `600 ${fontSize}px ${COURSEWARE_SYSTEM_FONT_FAMILY}`;
  context.textAlign = 'left';
  context.textBaseline = 'top';

  const lines = wrapCoursewareSummaryText(context, text, maxWidth, 4);
  const left = canvas.width * COURSEWARE_PROBLEM_LEFT_RATIO;
  const top = canvas.height * COURSEWARE_PROBLEM_TOP_RATIO;

  for (let index = 0; index < lines.length; index += 1) {
    context.fillText(lines[index], left, top + index * lineHeight);
  }
}

function roundedRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  const resolvedRadius = Math.min(radius, width / 2, height / 2);
  context.beginPath();
  context.moveTo(x + resolvedRadius, y);
  context.arcTo(x + width, y, x + width, y + height, resolvedRadius);
  context.arcTo(x + width, y + height, x, y + height, resolvedRadius);
  context.arcTo(x, y + height, x, y, resolvedRadius);
  context.arcTo(x, y, x + width, y, resolvedRadius);
  context.closePath();
}

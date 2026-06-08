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
} from './coursewareChrome';

const LABEL_BG = '#59cee5';
const LABEL_TEXT = '#ffffff';
const PROBLEM_TEXT = '#243247';
const FRAME_STROKE = '#59cee5';

export function drawCoursewareStageFrame(
  context: CanvasRenderingContext2D,
  canvas: StageCanvasConfig,
  problemSummary = '',
) {
  context.save();
  context.setTransform(1, 0, 0, 1, 0, 0);
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = canvas.background || '#ffffff';
  context.fillRect(0, 0, canvas.width, canvas.height);
  drawCoursewareFrameChrome(context, canvas);
  drawProblemSummary(context, canvas, problemSummary);
  context.restore();
}

function drawCoursewareFrameChrome(context: CanvasRenderingContext2D, canvas: StageCanvasConfig) {
  // 边框
  const lineWidth = Math.max(8, canvas.width * 0.007);
  context.strokeStyle = FRAME_STROKE;
  context.lineWidth = lineWidth;
  context.strokeRect(lineWidth / 2, lineWidth / 2, canvas.width - lineWidth, canvas.height - lineWidth);
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

  const lines = wrapCanvasText(context, text, maxWidth, 4);
  const left = canvas.width * COURSEWARE_PROBLEM_LEFT_RATIO;
  const top = canvas.height * COURSEWARE_PROBLEM_TOP_RATIO;

  for (let index = 0; index < lines.length; index += 1) {
    context.fillText(lines[index], left, top + index * lineHeight);
  }
}

function wrapCanvasText(context: CanvasRenderingContext2D, text: string, maxWidth: number, maxLines: number) {
  const normalizedText = text.replace(/\s+/g, ' ');
  const result: string[] = [];
  let current = '';

  for (const char of normalizedText) {
    const next = current + char;
    if (current && context.measureText(next).width > maxWidth) {
      result.push(current);
      current = char.trimStart();
      if (result.length >= maxLines) {
        break;
      }
      continue;
    }
    current = next;
  }

  if (result.length < maxLines && current) {
    result.push(current);
  }

  if (result.length === maxLines && context.measureText(result[maxLines - 1]).width > maxWidth * 0.94) {
    result[maxLines - 1] = `${result[maxLines - 1].slice(0, -1)}...`;
  }

  return result;
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

// @cleanroom-module: drawCoursewareStageFrame
// @domain: canvas-recording-stage
// @depends: StageCanvasConfig width/height/background
// @io-input: CanvasRenderingContext2D, StageCanvasConfig
// @io-output: painted canvas recording foundation frame
// @boundary: render-only canvas foundation; does not read or mutate A audio, B timeline, C clips, or store
// @note: 标签和题文由 DOM 层渲染（DrawboardStage 的 .courseware-label / .courseware-problem-area），canvas 只画底板和边框。

import type { StageCanvasConfig } from '../../domain/teachingProject';

export function drawCoursewareStageFrame(
  context: CanvasRenderingContext2D,
  canvas: StageCanvasConfig,
  _problemSummary = '',
) {
  context.save();
  context.setTransform(1, 0, 0, 1, 0, 0);
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = canvas.background || '#ffffff';
  context.fillRect(0, 0, canvas.width, canvas.height);
  drawCoursewareFrameChrome(context, canvas);
  context.restore();
}

function drawCoursewareFrameChrome(context: CanvasRenderingContext2D, canvas: StageCanvasConfig) {
  context.strokeStyle = '#59cee5';
  context.lineWidth = Math.max(8, canvas.width * 0.007);
  context.strokeRect(
    context.lineWidth / 2,
    context.lineWidth / 2,
    canvas.width - context.lineWidth,
    canvas.height - context.lineWidth,
  );
}

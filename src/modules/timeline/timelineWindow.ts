export function isPlayheadInsideTimelineWindow(playheadMs: number, startMs: number, endMs: number) {
  return playheadMs >= startMs && playheadMs < endMs;
}

export function isPlayheadInsideTimelineWindowWithPinnedEnd(playheadMs: number, startMs: number, endMs: number) {
  return playheadMs >= startMs && playheadMs <= endMs;
}

/**
 * 问题2 修复：B 结束后，C 保持显示（静态留场）
 *
 * 机制：playheadMs > endMs 时，给予 STATIC_HOLD_DURATION_MS 的宽限期
 * 超过宽限期才真正隐藏，避免播放略过 endMs 时 C 立即消失的抖动感
 */
const STATIC_HOLD_DURATION_MS = 1000; // 1秒宽限期（可调）

export function isPlayheadInsideTimelineWindowWithStaticHold(
  playheadMs: number,
  startMs: number,
  endMs: number,
): boolean {
  // 在正常窗口内
  if (playheadMs >= startMs && playheadMs <= endMs) {
    return true;
  }

  // B 已结束，给予静态留场宽限期
  if (playheadMs > endMs && playheadMs <= endMs + STATIC_HOLD_DURATION_MS) {
    return true;
  }

  return false;
}

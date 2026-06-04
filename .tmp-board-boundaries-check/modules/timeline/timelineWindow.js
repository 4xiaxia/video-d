export function isPlayheadInsideTimelineWindow(playheadMs, startMs, endMs) {
    return playheadMs >= startMs && playheadMs < endMs;
}
/**
 * C 板书可见性：写完不等于下台。
 *
 * 产品语义：直播仿板书在线解题里，C 自然播放完成后默认 stay。
 * 只有显式传入 hideAtMs（解锁后的截止时间）时，才在该时间点隐藏。
 */
export function isBoardClipVisibleAtPlayhead(playheadMs, startMs, hideAtMs) {
    if (playheadMs < startMs) {
        return false;
    }
    if (hideAtMs !== undefined && playheadMs >= hideAtMs) {
        return false;
    }
    return true;
}

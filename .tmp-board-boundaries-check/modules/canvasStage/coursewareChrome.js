export const COURSEWARE_SYSTEM_FONT_FAMILY = 'Inter, "Microsoft YaHei", "PingFang SC", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
export const COURSEWARE_LABEL_LEFT_RATIO = 0.017;
export const COURSEWARE_LABEL_WIDTH_RATIO = 0.041;
export const COURSEWARE_LABEL_HEIGHT_RATIO = 0.026;
export const COURSEWARE_PROBLEM_LEFT_RATIO = 0.027;
export const COURSEWARE_PROBLEM_TOP_RATIO = 0.072;
export const COURSEWARE_PROBLEM_MAX_WIDTH_RATIO = 0.44;
export const COURSEWARE_LABEL_TOP_RATIOS = {
    problem: 0.024,
    analysis: 0.24,
    solution: 0.024,
    summary: 0.74,
};
export const COURSEWARE_LABEL_LEFT_RATIOS = {
    problem: COURSEWARE_LABEL_LEFT_RATIO,
    analysis: COURSEWARE_LABEL_LEFT_RATIO,
    solution: 0.5,
    summary: COURSEWARE_LABEL_LEFT_RATIO,
};
/** 四区域的完整边界定义（用于 C 位置约束）*/
export const COURSEWARE_ZONE_BOUNDS = {
    problem: { topRatio: 0.024, heightRatio: 0.2 }, // 题目区：顶部 2.4% ~ 22.4%
    analysis: { topRatio: 0.24, heightRatio: 0.22 }, // 分析区：顶部 24% ~ 46%
    solution: { topRatio: 0.024, heightRatio: 0.7 }, // 解答区：顶部 2.4% ~ 72.4%（最大区）
    summary: { topRatio: 0.74, heightRatio: 0.24 }, // 总结区：顶部 74% ~ 98%
};
export function createCoursewareChromeStyleVars(canvas) {
    return {
        '--courseware-label-problem-left': toPercent(COURSEWARE_LABEL_LEFT_RATIOS.problem),
        '--courseware-label-analysis-left': toPercent(COURSEWARE_LABEL_LEFT_RATIOS.analysis),
        '--courseware-label-solution-left': toPercent(COURSEWARE_LABEL_LEFT_RATIOS.solution),
        '--courseware-label-summary-left': toPercent(COURSEWARE_LABEL_LEFT_RATIOS.summary),
        '--courseware-label-problem-top': toPercent(COURSEWARE_LABEL_TOP_RATIOS.problem),
        '--courseware-label-analysis-top': toPercent(COURSEWARE_LABEL_TOP_RATIOS.analysis),
        '--courseware-label-solution-top': toPercent(COURSEWARE_LABEL_TOP_RATIOS.solution),
        '--courseware-label-summary-top': toPercent(COURSEWARE_LABEL_TOP_RATIOS.summary),
        '--courseware-problem-left': toPercent(COURSEWARE_PROBLEM_LEFT_RATIO),
        '--courseware-problem-top': toPercent(COURSEWARE_PROBLEM_TOP_RATIO),
        '--courseware-problem-width': toPercent(COURSEWARE_PROBLEM_MAX_WIDTH_RATIO),
        '--courseware-system-font': COURSEWARE_SYSTEM_FONT_FAMILY,
        '--stage-problem-font-size': `${resolveProblemFontSize(canvas)}px`,
    };
}
export function resolveProblemFontSize(canvas) {
    return Math.max(18, canvas.height * 0.014);
}
function toPercent(ratio) {
    return `${ratio * 100}%`;
}

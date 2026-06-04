import { jsx as _jsx } from "react/jsx-runtime";
// @cleanroom-component: assetWorkflowFlow
// @domain: workflow-orchestration
// @slot: left-sider-workflow
// @depends: TeachingProject.assets
// @route-impact: App shell only
import { ArrowRightOutlined, PlayCircleOutlined } from '@ant-design/icons';
export const visibleWorkflowStepIds = new Set(['problem', 'scriptBoard', 'voiceAudio', 'voiceTiming']);
export function getAssetWorkflowStage({ isBoardReady, isProblemConfirmed, isScriptReady, isVoiceReady, }) {
    if (!isProblemConfirmed) {
        return {
            actionIcon: _jsx(ArrowRightOutlined, {}),
            actionLabel: '核对题文',
            description: '上传图片会自动识别，也可以直接在题文框里输入或修改。',
            targetKey: 'problem',
            title: '先把题目确认下来',
        };
    }
    if (!isScriptReady || !isBoardReady) {
        return {
            actionIcon: _jsx(ArrowRightOutlined, {}),
            actionLabel: '打开文稿面板',
            description: '先把讲解稿和板书内容确认好，再进入音频生成。',
            targetKey: 'scriptBoard',
            title: '整理文稿和板书',
        };
    }
    if (!isVoiceReady) {
        return {
            actionIcon: _jsx(PlayCircleOutlined, {}),
            actionLabel: '生成讲解音频',
            description: '按确认后的讲解稿生成音频，供后面播放和对齐。',
            targetKey: 'voiceAudio',
            title: '生成讲解音频',
        };
    }
    return {
        actionIcon: _jsx(PlayCircleOutlined, {}),
        actionLabel: '播放调整',
        description: '边播放边检查素材时长和板书位置。',
        targetKey: 'voiceTiming',
        title: '检查播放并调整',
    };
}
export function getAssetWorkflowRailSteps({ hasConfirmedBoard, isBoardReady, isProblemConfirmed, isScriptReady, isVoiceReady, }) {
    return [
        { done: isProblemConfirmed, key: 'problem', label: '题目', note: isProblemConfirmed ? '已确认' : '上传/输入' },
        {
            done: isScriptReady && isBoardReady,
            key: 'scriptBoard',
            label: '文稿/板书',
            note: isScriptReady && isBoardReady ? '已确认' : '编辑',
        },
        { done: isVoiceReady, key: 'voiceAudio', label: '讲解音频', note: isVoiceReady ? '已生成' : '生成' },
        { done: isVoiceReady && hasConfirmedBoard, key: 'voiceTiming', label: '播放调整', note: '时间轴' },
    ];
}

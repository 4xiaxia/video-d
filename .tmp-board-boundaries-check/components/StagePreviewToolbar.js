import { jsx as _jsx } from "react/jsx-runtime";
// @cleanroom-component: StagePreviewToolbar
// @domain: stage-preview/chrome
// @slot: StagePreview.extra
// @depends: StageRecorderControl
// @io-input: recorder target ref
// @io-output: recording active state
// @boundary: top control chrome only; does not own stage rendering, A/B/C data, or timeline logic
// @note: 画笔工具面板已移入 DrawboardStage 画布内部，此处只保留录制控件
import { Space } from 'antd';
import { StageRecorderControl } from './StageRecorderControl';
export function StagePreviewToolbar({ onRecordingActiveChange, recordingCanvases, }) {
    return (_jsx(Space, { size: 8, children: _jsx(StageRecorderControl, { onRecordingActiveChange: onRecordingActiveChange, recordingCanvases: recordingCanvases }) }));
}

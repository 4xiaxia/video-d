import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// @cleanroom-component: StageRecorderControl
// @domain: delivery-recording
// @slot: StagePreview.extra
// @io-input: recordingCanvases(base+overlay) or targetRef(DOM element)
// @io-output: browser display recording file download
// @boundary: record/download controls only; does not drive timeline playback or convert formats
// @recording-strategy: 优先使用 canvas 合成录制（captureStream），次选屏幕录制（getDisplayMedia）
import { DownloadOutlined, StopOutlined, VideoCameraOutlined } from '@ant-design/icons';
import { Button, Space, Tooltip, Typography } from 'antd';
import { useEffect } from 'react';
import { useCanvasRecorder } from '../modules/stageRecorder/useCanvasRecorder';
const { Text } = Typography;
export function StageRecorderControl({ onRecordingActiveChange, recordingCanvases, }) {
    const { downloadRecording, error, recordingFile, startRecording, status, stopRecording } = useCanvasRecorder();
    const isRecording = status === 'recording';
    useEffect(() => {
        onRecordingActiveChange?.(isRecording);
    }, [isRecording, onRecordingActiveChange]);
    /** canvas 合成录制 */
    const handleStart = () => {
        if (isRecording) {
            stopRecording();
            return;
        }
        if (recordingCanvases) {
            void startRecording(recordingCanvases.base, recordingCanvases.content, recordingCanvases.overlay);
        }
    };
    const canRecord = !!recordingCanvases;
    return (_jsxs(Space, { className: "stage-recorder-control", size: 8, children: [_jsx(Tooltip, { title: canRecord ? '录制舞台画布合成视频' : '缺少录制画布，请刷新页面', children: _jsx(Button, { danger: isRecording, disabled: !canRecord, icon: isRecording ? _jsx(StopOutlined, {}) : _jsx(VideoCameraOutlined, {}), onClick: handleStart, size: "small", type: isRecording ? 'primary' : 'default', children: isRecording ? '停止' : '录制' }) }), recordingFile ? (_jsxs(Button, { icon: _jsx(DownloadOutlined, {}), onClick: downloadRecording, size: "small", type: "primary", children: ["\u4E0B\u8F7D", recordingFile.extension.toUpperCase()] })) : null, error ? (_jsx(Text, { className: "stage-recorder-error", type: "danger", children: error })) : null] }));
}

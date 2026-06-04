import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
// @cleanroom-component: ProblemUploadPreview
// @domain: teaching-assets
// @slot: left-sider/problem-import
// @depends: TeachingProject.assets(problemImage/boardLayout), importProblemImage action
// ID: cleanroom-assets-problem-import-001
// 💾 数据: problemImage.sourceRef + boardLayout.summary
// 🔌 事件: beforeUpload -> onImportProblemImage
// 🎨 状态: no image / has image / C material candidate overlay
// @io-input: asset, boardSummary, hasConfirmedBoard, onImportProblemImage
// @io-output: onImportProblemImage(file)
// @route: App shell / left sider / assets problem tab
// @fields: TeachingProject.assets(kind=problemImage), TeachingProject.assets(kind=boardLayout).summary
// @boundary: image import and preview only; does not edit problemText, scriptText, boardLayout, timeline
import { InboxOutlined } from '@ant-design/icons';
import { Tag, Upload } from 'antd';
import { MathText } from './MathText';
const { Dragger } = Upload;
export function ProblemUploadPreview({ asset, boardSummary, hasConfirmedBoard, onImportProblemImage, }) {
    return (_jsx(Dragger, { accept: "image/*", beforeUpload: (file) => {
            onImportProblemImage(file);
            return false;
        }, className: asset?.sourceRef ? 'problem-image-uploader has-image' : 'problem-image-uploader', maxCount: 1, showUploadList: false, children: asset?.sourceRef ? (_jsxs("div", { className: "upload-preview-frame", children: [_jsx("img", { alt: asset.title, src: asset.sourceRef }), _jsx(Tag, { className: "upload-preview-badge", color: "blue", children: "\u9884\u89C8\u56FE" }), hasConfirmedBoard ? (_jsxs("div", { className: "board-confirm-overlay", children: [_jsx(Tag, { color: "green", children: "C\u7D20\u6750\u5019\u9009\u5DF2\u751F\u6210" }), _jsx(MathText, { className: "board-confirm-overlay-text", children: boardSummary })] })) : null] })) : (_jsxs(_Fragment, { children: [_jsx("p", { className: "ant-upload-drag-icon", children: _jsx(InboxOutlined, {}) }), _jsx("p", { className: "ant-upload-text", children: "\u4E0A\u4F20/\u62D6\u5165\u9898\u76EE\u56FE\u7247" }), _jsx("p", { className: "ant-upload-hint", children: "\u672A\u63A5 API \u65F6\uFF0C\u5148\u7528\u672C\u5730\u9898\u56FE\u8DD1\u901A\u753B\u5E03\u548C\u7D20\u6750\u6D41\u3002" })] })) }));
}

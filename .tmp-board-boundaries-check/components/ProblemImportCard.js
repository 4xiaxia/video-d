import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// @cleanroom-component: ProblemImportCard
// @domain: teaching-assets
// @slot: left-sider/import-card
// @depends: importProblemImage action
// @route-impact: App shell only
import { InboxOutlined } from '@ant-design/icons';
import { Upload } from 'antd';
const { Dragger } = Upload;
export function ProblemImportCard({ onImportProblemImage }) {
    return (_jsxs(Dragger, { accept: "image/*", beforeUpload: (file) => {
            onImportProblemImage(file);
            return false;
        }, className: "problem-image-uploader", maxCount: 1, showUploadList: false, children: [_jsx("p", { className: "ant-upload-drag-icon", children: _jsx(InboxOutlined, {}) }), _jsx("p", { className: "ant-upload-text", children: "\u4E0A\u4F20/\u62D6\u5165\u9898\u76EE\u56FE\u7247" }), _jsx("p", { className: "ant-upload-hint", children: "\u672A\u63A5 API \u65F6\uFF0C\u5148\u7528\u672C\u5730\u9898\u56FE\u8DD1\u901A\u753B\u5E03\u548C\u7D20\u6750\u6D41\u3002" })] }));
}

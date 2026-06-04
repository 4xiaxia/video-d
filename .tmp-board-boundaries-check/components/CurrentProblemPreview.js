import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// @cleanroom-component: CurrentProblemPreview
// @domain: teaching-assets
// @slot: left-sider/current-problem-preview
// @depends: TeachingProject.assets(problemImage)
// @route-impact: App shell only
import { Flex, Tag, Typography } from 'antd';
const { Text } = Typography;
export function CurrentProblemPreview({ asset }) {
    return (_jsxs("section", { className: "current-problem-card", "aria-label": "\u5F53\u524D\u9898\u56FE", children: [_jsxs(Flex, { align: "center", justify: "space-between", children: [_jsx(Text, { strong: true, children: "\u5F53\u524D\u56FE\u7247" }), _jsx(Tag, { color: asset?.sourceRef ? 'green' : 'default', children: asset?.sourceRef ? '本地' : '等待上传' })] }), _jsx("div", { className: "current-problem-preview", children: asset?.sourceRef ? _jsx("img", { alt: asset.title, src: asset.sourceRef }) : _jsx("span", { children: "\u672A\u4E0A\u4F20\u9898\u56FE" }) }), _jsx(Text, { className: "current-problem-name", type: "secondary", children: asset?.title ?? '上传后，题图和题文会二合一显示。' })] }));
}

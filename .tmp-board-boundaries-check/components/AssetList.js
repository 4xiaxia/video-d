import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// @cleanroom-component: AssetList
// @domain: teaching-assets
// @slot: left-sider/asset-list
// @depends: TeachingProject.assets
// ID: cleanroom-assets-list-001
// 💾 数据: TeachingAsset[]
// 🎨 状态: asset.kind + asset.status -> tag label/color
// 🧩 复用: all asset tabs
// @io-input: assets
// @io-output: none
// @route: App shell / left sider / reusable asset list
// @fields: TeachingAsset.kind, TeachingAsset.status, TeachingAsset.title, TeachingAsset.summary, TeachingAsset.source, TeachingAsset.sourceRef
// @boundary: render only; does not mutate assets or call external services
import { Card, Flex, List, Tag, Typography } from 'antd';
import { assetKindLabels, assetStatusColors, assetStatusLabels } from './assetPanelMeta';
import { MathText } from './MathText';
const { Text, Title } = Typography;
export function AssetList({ assets }) {
    return (_jsx(List, { className: "asset-list", dataSource: assets, locale: { emptyText: '暂无素材' }, renderItem: (asset) => (_jsx(List.Item, { children: _jsxs(Card, { className: "asset-card", size: "small", children: [asset.kind === 'problemImage' && asset.sourceRef ? (_jsx("img", { alt: asset.title, className: "asset-card__thumb", src: asset.sourceRef })) : null, _jsxs(Flex, { align: "center", justify: "space-between", gap: 8, children: [_jsx(Tag, { color: "processing", children: assetKindLabels[asset.kind] }), _jsx(Tag, { color: assetStatusColors[asset.status], children: assetStatusLabels[asset.status] })] }), _jsx(Title, { className: "asset-title", level: 5, children: asset.title }), _jsx(Text, { type: "secondary", children: _jsx(MathText, { children: asset.summary }) }), _jsxs("div", { className: "asset-source", children: ["\u6765\u6E90\uFF1A", asset.source] })] }) })) }));
}

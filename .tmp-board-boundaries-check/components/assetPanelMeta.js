// @cleanroom-component: assetPanelMeta
// @domain: teaching-assets
// @slot: left-sider/asset-display-mapping
// ID: cleanroom-assets-meta-001
// @io-input: TeachingAssetKind, TeachingAssetStatus
// @io-output: label/color display metadata
// @route: App shell / left sider / asset list and tabs
// @fields: TeachingAsset.kind, TeachingAsset.status
// @boundary: display mapping only; no business status transitions
export const assetKindLabels = {
    problemImage: '题目',
    problemText: '题目',
    scriptText: '文稿',
    boardLayout: '板书',
    voiceAudio: '音频',
    voiceTiming: '时序',
    exportResult: '交付',
};
export const assetStatusLabels = {
    missing: '缺失',
    ready: '可用',
    needsReview: '待校准',
    done: '完成',
};
export const assetStatusColors = {
    missing: 'volcano',
    ready: 'green',
    needsReview: 'gold',
    done: 'blue',
};

import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// @cleanroom-component: FloatingToolDock
// @domain: inspector
// @slot: right-floating-dock
// @depends: local-ui-state, future TeachingProject.stage
// @io-input: none
// @io-output: future tool action events
// @route: App shell / stage floating tools
// @fields: future TeachingProject.stage tools/effects/background/fonts
// @boundary: visual shortcut dock only; current buttons do not mutate stage, do not open settings, do not call API
// @route-impact: App shell only
import { AppstoreOutlined, BgColorsOutlined, PictureOutlined, RadiusSettingOutlined, } from '@ant-design/icons';
const dockItems = [
    { key: 'effects', label: '动效', description: '描写、淡入、轻弹出', icon: _jsx(RadiusSettingOutlined, {}) },
    { key: 'stickers', label: '贴图素材', description: 'C 素材、图章、标记', icon: _jsx(PictureOutlined, {}) },
    { key: 'geometry', label: '几何图形', description: '线段、圆、角、坐标', icon: _jsx(AppstoreOutlined, {}) },
    { key: 'background', label: '画布背景', description: '课件边框、纸张、网格', icon: _jsx(BgColorsOutlined, {}) },
];
export function FloatingToolDock() {
    return (_jsx("aside", { "aria-label": "\u821E\u53F0\u5FEB\u6377\u5DE5\u5177", className: "side-tool-dock", children: dockItems.map((item) => (_jsxs("button", { className: "side-tool-card", type: "button", children: [_jsx("span", { className: "side-tool-icon", children: item.icon }), _jsxs("span", { className: "side-tool-copy", children: [_jsx("strong", { children: item.label }), _jsx("small", { children: item.description })] })] }, item.key))) }));
}

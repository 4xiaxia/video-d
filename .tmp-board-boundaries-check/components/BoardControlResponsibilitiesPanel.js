import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// @cleanroom-component: BoardControlResponsibilitiesPanel
// @domain: inspector/control-responsibilities
// @slot: right-inspector/read-only-control-index
// @depends: boardControlResponsibilities
// @io-input: static board control responsibility rows
// @io-output: read-only UI only
// @boundary: Never edits A/B/C data; all text comes from the single boardControlResponsibilities source.
import { Collapse, Space, Tag, Typography } from 'antd';
import { boardControlResponsibilities } from '../modules/boardControlLayers/boardControlResponsibilities';
const { Text } = Typography;
export function BoardControlResponsibilitiesPanel() {
    return (_jsx(Collapse, { className: "zone-card zone-inspector board-control-responsibilities-collapse", defaultActiveKey: [], items: [
            {
                children: (_jsx("div", { className: "board-control-responsibilities", "data-anchor": "abc-control-responsibilities-panel-001", children: boardControlResponsibilities.map((row) => (_jsxs("section", { className: "board-control-responsibility", "data-control-id": row.id, children: [_jsxs("div", { className: "board-control-responsibility__header", children: [_jsx(Text, { strong: true, children: row.component }), _jsx(Tag, { color: row.uniqueness.includes('唯一') ? 'blue' : 'orange', children: row.uniqueness })] }), _jsx(Text, { type: "secondary", children: row.purpose }), _jsxs("dl", { className: "board-control-responsibility__facts", children: [_jsxs("div", { children: [_jsx("dt", { children: "\u8D1F\u8D23" }), _jsx("dd", { children: row.owns })] }), _jsxs("div", { children: [_jsx("dt", { children: "\u4E0D\u8D1F\u8D23" }), _jsx("dd", { children: row.notOwns })] }), _jsxs("div", { children: [_jsx("dt", { children: "\u5F71\u54CD\u5173\u7CFB" }), _jsx("dd", { children: row.effect })] }), _jsxs("div", { children: [_jsx("dt", { children: "\u5BF9\u5E94\u524D\u7AEF" }), _jsx("dd", { children: row.frontend })] })] }), _jsx(Space, { size: [4, 4], wrap: true, children: row.fields.map((field) => (_jsx(Tag, { children: field }, `${row.id}-${field}`))) })] }, row.id))) })),
                extra: _jsxs(Tag, { color: "purple", children: [boardControlResponsibilities.length, " \u9879"] }),
                key: 'board-control-responsibilities',
                label: 'A/B/C 控制层职责表',
            },
        ] }));
}

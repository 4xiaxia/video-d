import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ArrowDownOutlined, ArrowUpOutlined, DeleteOutlined, PlusOutlined, TableOutlined } from '@ant-design/icons';
import { Button, Collapse, Input, Select, Space, Table, Tag, Tooltip, Typography } from 'antd';
import { createAbcChainLabels, isBoardMaterialChainKey } from '../abcChain/abcChainKey';
import { SCRIPT_SECTION, SCRIPT_SECTION_OPTIONS } from '../../domain/globalRules';
const { Text } = Typography;
const { TextArea } = Input;
// rows table workbench copy anchors:
// 讲解切片预览与编辑 / 添加切片 / 刷新候选稿 / 行切片 / 专业规则 / 分区 / 链路 / 步骤
// 板书素材（按分区） / A轴讲解内容（语音切片） / A 语音行和按分区允许的 C 素材候选 / 个 C 素材候选 / 操作
// A-template-open / A-template-pre / A-template-end
// 四连环：对话生成候选 rows / boardSlice 生成 C 素材候选 / A 返回真实时长后生成 B 寿命窗口 / C 再接排版和演绎资产
// 唯一身份只看 chainKey / 开场读题主身份是 A-template-open
// prompt/template 层同时保留 B-template-open / C-template-open 占位
// 分析题目 A-template-pre 和梳理总结 A-template-end 可按需要填写 C 素材候选
// 正式解题步骤才允许 A1/B1/C1
export function ScriptAgentTableEditor({ onChange, onCompile, rows, showRules = false, }) {
    const boardSliceCount = rows.filter((row) => row.boardSlice.trim() && isBoardMaterialChainKey(row.chainKey)).length;
    const voiceTextCount = rows.filter((row) => row.voiceText.trim()).length;
    const handleAddRow = (afterIndex = rows.length - 1) => {
        const nextRow = createEmptyRow(rows.length);
        const insertIndex = Math.max(0, afterIndex + 1);
        onChange([...rows.slice(0, insertIndex), nextRow, ...rows.slice(insertIndex)]);
    };
    if (!rows.length) {
        return (_jsxs("div", { className: "script-agent-table-workbench", children: [_jsx(ScriptAgentTableToolbar, { boardSliceCount: 0, onAddRow: () => handleAddRow(), onCompile: () => onCompile(rows), rowCount: 0, voiceTextCount: 0 }), _jsx(ScriptAgentRowsTable, { onAddRow: handleAddRow, onChange: onChange, rows: rows }), showRules ? _jsx(ScriptAgentTableRules, {}) : null] }));
    }
    return (_jsxs("div", { className: "script-agent-table-workbench", children: [_jsx(ScriptAgentTableToolbar, { boardSliceCount: boardSliceCount, onAddRow: () => handleAddRow(), onCompile: () => onCompile(rows), rowCount: rows.length, voiceTextCount: voiceTextCount }), _jsx(ScriptAgentRowsTable, { onAddRow: handleAddRow, onChange: onChange, rows: rows }), showRules ? _jsx(ScriptAgentTableRules, {}) : null] }));
}
function ScriptAgentRowsTable({ onAddRow, onChange, rows, }) {
    // @xiaxia-c-candidate-copy: allowed boardSlice is the editable C material candidate; compiler projects only allowed chainKey rows.
    return (_jsx(Table, { "aria-label": "\u8BB2\u89E3\u5207\u7247\u9884\u89C8\u4E0E\u7F16\u8F91", className: "script-agent-table", columns: createColumns(rows, onChange, onAddRow), dataSource: rows, locale: { emptyText: '等待 Agent 生成讲解切片。生成后会在这里展示，也可以先点“添加切片”手工填写。' }, pagination: false, rowKey: (row) => row.id, scroll: { x: 860 }, size: "small" }));
}
function createColumns(rows, onChange, onAddRow) {
    return [
        {
            dataIndex: 'section',
            key: 'section',
            render: (_value, row, index) => (_jsxs(Space, { className: "script-agent-table-section-cell", size: 6, children: [_jsx(Tooltip, { title: "\u5728\u8FD9\u4E00\u884C\u540E\u6DFB\u52A0\u5207\u7247", children: _jsx(Button, { "aria-label": "\u6DFB\u52A0\u5207\u7247", icon: _jsx(PlusOutlined, {}), onClick: () => onAddRow(index), size: "small", type: "text" }) }), _jsx(Select, { className: "script-agent-table-section", onChange: (section) => onChange(updateRow(rows, index, { section })), options: SCRIPT_SECTION_OPTIONS, size: "small", value: row.section || SCRIPT_SECTION.SOLVING })] })),
            title: '分区',
            width: 170,
        },
        {
            dataIndex: 'stepLabel',
            key: 'stepLabel',
            render: (_value, row, index) => (_jsx(Input, { className: "script-agent-table-step", onChange: (event) => onChange(updateRow(rows, index, { stepLabel: event.target.value })), placeholder: "\u6B65\u9AA4\u540D", size: "small", value: row.stepLabel })),
            title: '小标题',
            width: 150,
        },
        {
            dataIndex: 'boardSlice',
            key: 'boardSlice',
            render: (_value, row, index) => (_jsx(Input, { className: "script-agent-table-board-slice", onChange: (event) => onChange(updateRow(rows, index, { boardSlice: event.target.value })), placeholder: "\u8FD9\u4E00\u884C\u8981\u5199\u5230\u677F\u4E66\u3002", value: row.boardSlice })),
            title: '板书内容',
            width: 280,
        },
        {
            dataIndex: 'voiceText',
            key: 'voiceText',
            render: (_value, row, index) => (_jsx(TextArea, { autoSize: { minRows: 2, maxRows: 5 }, className: "math-editor-input script-agent-table-voice-text", onChange: (event) => onChange(updateRow(rows, index, { voiceText: event.target.value })), placeholder: "\u8FD9\u4E00\u884C\u8001\u5E08\u600E\u4E48\u8BB2\u3002", value: row.voiceText })),
            title: '讲解内容',
            width: 360,
        },
        {
            key: 'actions',
            render: (_value, _row, index) => (_jsxs(Space, { className: "script-agent-table-row-actions", size: 4, children: [_jsx(Tooltip, { title: "\u6DFB\u52A0\u5207\u7247", children: _jsx(Button, { icon: _jsx(PlusOutlined, {}), onClick: () => onAddRow(index), size: "small" }) }), _jsx(Tooltip, { title: "\u4E0A\u79FB", children: _jsx(Button, { disabled: index === 0, icon: _jsx(ArrowUpOutlined, {}), onClick: () => onChange(moveRow(rows, index, index - 1)), size: "small" }) }), _jsx(Tooltip, { title: "\u4E0B\u79FB", children: _jsx(Button, { disabled: index === rows.length - 1, icon: _jsx(ArrowDownOutlined, {}), onClick: () => onChange(moveRow(rows, index, index + 1)), size: "small" }) }), _jsx(Tooltip, { title: "\u5220\u9664", children: _jsx(Button, { danger: true, icon: _jsx(DeleteOutlined, {}), onClick: () => onChange(deleteRow(rows, index)), size: "small" }) })] })),
            title: '操作',
            width: 180,
        },
    ];
}
function ScriptAgentTableToolbar({ boardSliceCount, onAddRow, onCompile, rowCount, voiceTextCount, }) {
    return (_jsxs("div", { className: "script-agent-table-toolbar", children: [_jsxs(Space, { align: "center", wrap: true, children: [_jsx(TableOutlined, {}), _jsx(Text, { strong: true, children: "\u8BB2\u89E3\u5207\u7247\u9884\u89C8\u4E0E\u7F16\u8F91" })] }), _jsxs(Space, { align: "center", wrap: true, children: [_jsxs(Tag, { color: "geekblue", children: [rowCount, " \u884C\u5207\u7247"] }), _jsxs(Tag, { color: voiceTextCount ? 'blue' : 'default', children: [voiceTextCount, " \u6BB5\u8BB2\u89E3"] }), _jsxs(Tag, { color: boardSliceCount ? 'green' : 'default', children: [boardSliceCount, " \u4E2A C \u7D20\u6750\u5019\u9009"] }), _jsx(Button, { icon: _jsx(PlusOutlined, {}), onClick: onAddRow, size: "small", children: "\u6DFB\u52A0\u5207\u7247" }), _jsx(Button, { onClick: onCompile, size: "small", type: "primary", children: "\u5237\u65B0\u5019\u9009\u7A3F" })] })] }));
}
function ScriptAgentTableRules() {
    return (_jsx(Collapse, { className: "script-agent-table-rules", ghost: true, items: [
            {
                children: (_jsx("div", { className: "script-agent-table-rule", children: "\u56DB\u8FDE\u73AF\uFF1A\u5BF9\u8BDD\u751F\u6210\u5019\u9009 rows\uFF0CvoiceText \u751F\u6210 A \u8F68\u8BED\u97F3\uFF0CboardSlice \u751F\u6210 C \u7D20\u6750\u5019\u9009\uFF1BA \u8FD4\u56DE\u771F\u5B9E\u65F6\u957F\u540E\u751F\u6210 B \u5BFF\u547D\u7A97\u53E3\uFF0CC \u518D\u63A5\u6392\u7248\u548C\u6F14\u7ECE\u8D44\u4EA7\u3002\u552F\u4E00\u8EAB\u4EFD\u53EA\u770B chainKey\uFF1A \u5F00\u573A\u8BFB\u9898\u4E3B\u8EAB\u4EFD\u662F A-template-open\uFF1B\u4E3A\u9632\u540E\u7EED\u9519\u4F4D\uFF0Cprompt/template \u5C42\u540C\u65F6\u4FDD\u7559 B-template-open / C-template-open \u5360\u4F4D\uFF0C\u5F53\u524D boardSlice \u5FC5\u987B\u7559\u7A7A\uFF1B\u5206\u6790\u9898\u76EE A-template-pre \u548C\u68B3\u7406\u603B\u7ED3 A-template-end \u53EF\u6309\u9700\u8981\u586B\u5199 C \u7D20\u6750\u5019\u9009\uFF1B\u6B63\u5F0F\u89E3\u9898\u6B65\u9AA4\u624D\u5141\u8BB8 A1/B1/C1 \u9012\u589E\u3002Agent \u548C\u7528\u6237\u4E0D\u624B\u5199 <br>\u3001<b> \u6216 Markdown \u5206\u6BB5\u3002" })),
                key: 'rules',
                label: _jsx(Text, { type: "secondary", children: "\u8BF4\u660E" }),
            },
        ], size: "small" }));
}
function updateRow(rows, index, patch) {
    return rows.map((row, rowIndex) => (rowIndex === index ? { ...row, ...patch } : row));
}
function getRowMappingLabel(row) {
    const labels = createAbcChainLabels(row.chainKey);
    if (!row.chainKey || row.chainKey === 'unbound') {
        return `${labels.a}+${labels.b}+${labels.c}`;
    }
    if (row.chainKey === 'template-open') {
        return labels.a;
    }
    if (row.chainKey.startsWith('step-') || (row.boardSlice.trim() && isBoardMaterialChainKey(row.chainKey))) {
        return `${labels.a}+${labels.b}+${labels.c}`;
    }
    return labels.a;
}
function getRowMappingHint(row) {
    if (!row.chainKey || row.chainKey === 'unbound') {
        return row.boardSlice.trim()
            ? '未绑定 chainKey：不会伪装成正式 A/B/C 标签，请先选择明确分区后再生成正式素材。'
            : '未绑定 chainKey：当前只保留候选行，不生成正式 A/B/C 身份。';
    }
    if (row.section === SCRIPT_SECTION.OPENING) {
        return row.boardSlice.trim()
            ? '开场读题主身份是 A-template-open；为防后续错位，prompt/template 层同时保留 B-template-open / C-template-open 占位；这行 boardSlice 当前会被 compiler 忽略，请移到分析题目或正式步骤。'
            : '开场读题主身份是 A-template-open；为防后续错位，prompt/template 层同时保留 B-template-open / C-template-open 占位；当前 boardSlice 必须留空。';
    }
    if (row.section === SCRIPT_SECTION.ANALYSIS) {
        return row.boardSlice.trim()
            ? 'A-template-pre + B-template-pre/C-template-pre：强制保留占位符，支持具体用途标识如A-template-pre-analysis/B-template-pre-analysis/C-template-pre-analysis。'
            : 'A-template-pre / B-template-pre / C-template-pre：分析题目三轨占位保留对齐；需要上板时再填写 C 素材候选。';
    }
    if (row.section === SCRIPT_SECTION.SUMMARY) {
        return row.boardSlice.trim()
            ? 'A-template-end：梳理总结可填写 C 素材候选；A 返回真实时长后再生成 B 寿命。'
            : 'A-template-end / B-template-end / C-template-end：梳理总结三轨占位保留对齐；需要上板时再填写 C 素材候选。';
    }
    return row.boardSlice.trim()
        ? '正式解题步骤生成 A/B/C 数字链路，例如 A1/B1/C1，其中：\n• A1：语音主时钟和原始时间来源\n• B1：C1 的站场控制，负责上台；解锁后才提供下台截止时间\n• C1：画布演员，拥有内容、位置、字号、书写速度和演绎资产\n\nC1 自然播放完成后默认留场；只有显式截止时间才隐藏。C1 书写速度由 C 书写速度控制，不由 B 寿命隐式改写。'
        : '正式解题步骤缺少 boardSlice 时不会生成 B 寿命和 C 演员；通常需要补 C 素材候选。';
}
function createEmptyRow(index) {
    return {
        boardSlice: '',
        id: `manual-row-${Date.now()}-${index + 1}`,
        section: SCRIPT_SECTION.SOLVING,
        stepLabel: `第 ${index + 1} 步`,
        voiceText: '',
    };
}
function moveRow(rows, fromIndex, toIndex) {
    if (toIndex < 0 || toIndex >= rows.length) {
        return rows;
    }
    const nextRows = [...rows];
    const [movedRow] = nextRows.splice(fromIndex, 1);
    nextRows.splice(toIndex, 0, movedRow);
    return nextRows;
}
function deleteRow(rows, index) {
    return rows.filter((_, rowIndex) => rowIndex !== index);
}

import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// @cleanroom-component: AssetWorkflowTabs
// @domain: workflow-orchestration
// @slot: left-sider/asset-workflow-tabs
// @depends: WorkflowStepSdk[], AntD Tabs
// ID: cleanroom-assets-workflow-tabs-001
// @io-input: steps
// @io-output: active tab render only
// @route: App shell / left sider / asset room
// @fields: step.inputFields, step.outputFields
// @boundary: menu shell only; does not know step internals or mutate project
import { Tag, Typography } from 'antd';
import { useEffect } from 'react';
const { Text } = Typography;
export function AssetWorkflowTabs({ activeKey, onActiveKeyChange, steps, }) {
    const activeStep = steps.find((step) => step.id === activeKey) ?? steps[0];
    const activeStepId = activeStep?.id;
    useEffect(() => {
        if (activeStepId && activeStepId !== activeKey) {
            onActiveKeyChange(activeStepId);
        }
    }, [activeKey, activeStepId, onActiveKeyChange]);
    if (!activeStep) {
        return null;
    }
    return (_jsxs("section", { className: "asset-step-panel", children: [_jsxs("div", { className: "asset-step-panel-head", children: [_jsx(Text, { type: "secondary", children: "\u5F53\u524D\u6B65\u9AA4" }), _jsx(Tag, { color: "blue", children: activeStep.title })] }), _jsx("div", { className: "asset-step-panel-body", children: activeStep.render() })] }));
}

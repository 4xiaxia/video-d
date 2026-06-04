import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// @cleanroom-component: AppSettingsDrawer
// @domain: settings
// @slot: modal-layer
// @depends: defaultConfig, future persisted config, future recognition-ai-config
// @feature-branch: recognition-ai-config
// @feature-branch: automation-unattended-mode
// @io-input: open, config, onClose, onSaveConfig
// @io-output: onSaveConfig(config), onClose()
// @route: App shell / settings drawer
// @fields: defaultConfig.service, defaultConfig.recognition, defaultConfig.scriptAgent, defaultConfig.tts, defaultConfig.vectorKb, defaultConfig.automation, defaultConfig.stageDefaults, defaultConfig.typography, defaultConfig.effects, defaultConfig.output
// @boundary: AppConfig settings UI only; persists config reference values, does not store raw API keys, does not call external APIs
// @route-impact: App shell only, future route: settings
// @api-needed: settings-persistence-api | trigger: user saves config | output: persisted AppConfig without raw secrets
// @api-needed: recognition-ai-api config | trigger: problem import | output: OCR/problemText provider config
// @api-needed: script-agent-api config | trigger: script-board Agent | output: endpoint/model/apiKeyRef config
// @api-needed: vector-kb-api config | trigger: script Agent retrieval | output: provider/collection/topK config
import { Alert, Button, Descriptions, Drawer, Form, Input, InputNumber, Select, Space, Switch, Tabs, Tag, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { defaultConfig } from '../config/defaultConfig';
import { BoardTypographyFormFields } from './BoardTypographyFields';
const { Text } = Typography;
const { TextArea } = Input;
export function AppSettingsDrawer({ config, open, onClose, onSaveConfig, }) {
    const [form] = Form.useForm();
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    useEffect(() => {
        if (open) {
            form.setFieldsValue(config);
            setHasUnsavedChanges(false);
        }
    }, [config, form, open]);
    const handleFinish = (values) => {
        onSaveConfig(values);
        setHasUnsavedChanges(false);
        onClose();
    };
    return (_jsx(Drawer, { destroyOnHidden: true, extra: _jsx(Tag, { color: hasUnsavedChanges ? 'orange' : 'green', children: hasUnsavedChanges ? '有未保存修改' : '配置已同步' }), footer: _jsxs("div", { className: "settings-drawer-footer", children: [_jsx(Text, { type: "secondary", children: "\u4FEE\u6539\u914D\u7F6E\u540E\uFF0C\u9700\u8981\u70B9\u51FB\u786E\u8BA4\u4FDD\u5B58\u624D\u4F1A\u751F\u6548\u3002" }), _jsxs(Space, { children: [_jsx(Button, { onClick: () => {
                                form.setFieldsValue(config);
                                setHasUnsavedChanges(false);
                            }, children: "\u53D6\u6D88\u4FEE\u6539" }), _jsx(Button, { onClick: () => {
                                form.setFieldsValue(defaultConfig);
                                setHasUnsavedChanges(true);
                            }, children: "\u6062\u590D\u9ED8\u8BA4" }), _jsx(Button, { disabled: !hasUnsavedChanges, onClick: () => form.submit(), type: "primary", children: "\u786E\u8BA4\u4FDD\u5B58\u914D\u7F6E" })] })] }), onClose: onClose, open: open, placement: "right", size: 560, title: "\u5168\u5C40\u914D\u7F6E", children: _jsx(Form, { form: form, initialValues: config, layout: "vertical", onFinish: handleFinish, onValuesChange: () => setHasUnsavedChanges(true), children: _jsx(Tabs, { items: [
                    {
                        key: 'modelSwitchboard',
                        label: '模型总闸',
                        children: _jsx(ModelSwitchboardSettings, { form: form }),
                    },
                    {
                        key: 'api',
                        label: 'API',
                        children: _jsx(ApiSettings, {}),
                    },
                    {
                        key: 'recognition',
                        label: '识别模型',
                        children: _jsx(RecognitionSettings, {}),
                    },
                    {
                        key: 'agent',
                        label: '文稿模型',
                        children: _jsx(ScriptAgentSettings, {}),
                    },
                    {
                        key: 'knowledge',
                        label: '知识库',
                        children: _jsx(VectorKbSettings, {}),
                    },
                    {
                        key: 'tts',
                        label: '语音模型',
                        children: _jsx(TtsSettings, {}),
                    },
                    {
                        key: 'automation',
                        label: '审核闸门',
                        children: _jsx(AutomationSettings, {}),
                    },
                    {
                        key: 'canvas',
                        label: '画布',
                        children: _jsx(CanvasSettings, { form: form }),
                    },
                    {
                        key: 'typography',
                        label: 'C 素材默认',
                        children: _jsx(TypographySettings, {}),
                    },
                    {
                        key: 'effects',
                        label: 'C 素材动效',
                        children: _jsx(EffectSettings, {}),
                    },
                    {
                        key: 'files',
                        label: '保存',
                        children: _jsx(FileSettings, {}),
                    },
                ] }) }) }));
}
function ModelSwitchboardSettings({ form }) {
    return (_jsx(Form.Item, { noStyle: true, shouldUpdate: true, children: () => {
            const values = form.getFieldsValue(true);
            const recognition = values.recognition ?? defaultConfig.recognition;
            const scriptAgent = values.scriptAgent ?? defaultConfig.scriptAgent;
            const tts = values.tts ?? defaultConfig.tts;
            return (_jsxs("div", { children: [_jsx(Alert, { showIcon: true, type: "info", title: "\u5148\u9009\u6A21\u578B\u603B\u95F8\uFF0C\u518D\u8C03\u63D0\u793A\u8BCD", description: "\u771F\u5B9E\u4E1A\u52A1\u5F53\u524D\u5206\u4E09\u8DEF\uFF1A\u8BC6\u522B\u9898\u56FE/\u9898\u6587\u7684\u89C6\u89C9\u6A21\u578B\uFF0C\u751F\u6210 rows \u5019\u9009\u7684\u6587\u7A3F\u6A21\u578B\uFF08voiceText + boardSlice + A-template / A1/B1/C1 \u547D\u540D\u5408\u540C\uFF09\uFF0C\u751F\u6210 A \u8F68\u97F3\u9891\u7684\u8BED\u97F3\u6A21\u578B\u3002\u5BA2\u6237\u5B9A\u5236\u53EF\u4EE5\u4F7F\u7528\u5BA2\u6237\u81EA\u5DF1\u7684 key\uFF0C\u4F46\u660E\u6587 key \u5E94\u7531\u7BA1\u7406\u5458\u914D\u7F6E\u5230\u540E\u7AEF\u5BC6\u94A5\u7BA1\u7406\u6216\u672C\u5730\u7F51\u5173\u73AF\u5883\u53D8\u91CF\u91CC\uFF0C\u4E1A\u52A1\u524D\u7AEF\u53EA\u4FDD\u5B58\u5F15\u7528\u540D\u3002" }), _jsxs(Descriptions, { bordered: true, column: 1, size: "small", className: "settings-switchboard", children: [_jsx(Descriptions.Item, { label: "\u9898\u56FE/\u9898\u6587\u8BC6\u522B", children: _jsxs(Space, { wrap: true, children: [_jsx(Tag, { color: "blue", children: recognition.provider }), _jsx(Tag, { children: recognition.modelName || '未填写模型' }), _jsx(Tag, { children: recognition.apiKeyRef }), _jsx(Text, { type: "secondary", children: recognition.endpoint || '未填写 Endpoint' })] }) }), _jsx(Descriptions.Item, { label: "rows \u6587\u7A3F + C\u7D20\u6750\u5019\u9009", children: _jsxs(Space, { wrap: true, children: [_jsx(Tag, { color: "geekblue", children: scriptAgent.mode }), _jsx(Tag, { children: scriptAgent.modelName || '未填写模型' }), _jsx(Tag, { children: scriptAgent.apiKeyRef }), _jsx(Text, { type: "secondary", children: scriptAgent.endpoint || '未接外部 Agent Endpoint' })] }) }), _jsx(Descriptions.Item, { label: "A \u8F68\u8BED\u97F3", children: _jsxs(Space, { wrap: true, children: [_jsx(Tag, { color: "green", children: tts.provider }), _jsx(Tag, { children: tts.modelName }), _jsx(Tag, { children: tts.voiceName }), _jsx(Tag, { children: tts.apiKeyRef }), _jsx(Text, { type: "secondary", children: tts.endpoint })] }) })] }), _jsx(Text, { type: "secondary", children: "\u8FD9\u91CC\u4E0D\u4FDD\u5B58\u660E\u6587 Key\uFF0C\u4E5F\u4E0D\u628A\u914D\u7F6E\u663E\u793A\u6210\u8C03\u7528\u6210\u529F\uFF1B\u771F\u6B63\u7684\u8BC6\u522B\u3001Agent\u3001TTS \u8C03\u7528\u5FC5\u987B\u7531\u5404\u81EA\u6B65\u9AA4\u6309\u8FD9\u4EFD\u914D\u7F6E\u8D70\u7F51\u5173\u3002" })] }));
        } }));
}
// @xiaxia-settings-hint: Aliyun A-track fields here must stay paired with cosyvoiceGatewayClient and both CosyVoice gateways.
function TtsSettings() {
    return (_jsxs("div", { children: [_jsx(Form.Item, { label: "A \u8F68\u8BED\u97F3 Provider", name: ['tts', 'provider'], children: _jsx(Select, { options: [{ value: 'aliyun-cosyvoice', label: '阿里云 CosyVoice' }] }) }), _jsx(Form.Item, { label: "A \u8F68\u8BED\u97F3\u7F51\u5173", name: ['tts', 'endpoint'], children: _jsx(Input, { placeholder: "/api/tts/cosyvoice/sentences" }) }), _jsx(Form.Item, { label: "\u5BC6\u94A5\u5F15\u7528/\u73AF\u5883\u53D8\u91CF\u540D", name: ['tts', 'apiKeyRef'], extra: "\u5BA2\u6237\u5B9A\u5236\u65F6\u53EF\u6362\u6210\u5BA2\u6237\u7684\u5BC6\u94A5\u5F15\u7528\u540D\uFF1B\u660E\u6587 key \u7531\u7BA1\u7406\u5458\u914D\u7F6E\u5728\u540E\u7AEF\u6216\u672C\u5730\u7F51\u5173\u73AF\u5883\u4E2D\u3002", children: _jsx(Input, { placeholder: "DASHSCOPE_API_KEY" }) }), _jsx(Form.Item, { label: "\u8BED\u97F3\u6A21\u578B", name: ['tts', 'modelName'], children: _jsx(Input, { placeholder: "cosyvoice-v3-flash" }) }), _jsx(Form.Item, { label: "A \u8F68\u97F3\u8272", name: ['tts', 'voiceName'], children: _jsx(Input, { placeholder: "longanyang" }) }), _jsx(Form.Item, { label: "A \u8F68\u97F3\u9891\u683C\u5F0F", name: ['tts', 'format'], children: _jsx(Select, { options: [
                        { value: 'mp3', label: 'mp3' },
                        { value: 'wav', label: 'wav' },
                    ] }) }), _jsx(Form.Item, { label: "A \u8F68\u91C7\u6837\u7387", name: ['tts', 'sampleRate'], children: _jsx(InputNumber, { min: 8000, max: 48000, step: 50 }) }), _jsx(Form.Item, { label: "A \u8F68\u5B57\u7EA7\u65F6\u95F4\u6233", name: ['tts', 'wordTimestampEnabled'], valuePropName: "checked", children: _jsx(Switch, { checkedChildren: "\u5F00\u542F", unCheckedChildren: "\u5173\u95ED" }) }), _jsx(Tag, { color: "green", children: "real-tts-gateway" }), _jsx(Text, { type: "secondary", children: "\u5F53\u524D\u8BED\u97F3\u6B65\u9AA4\u8BFB\u53D6\u8FD9\u4EFD\u914D\u7F6E\uFF0C\u8BF7\u6C42\u540C\u6E90\u672C\u5730\u7F51\u5173\uFF1B\u771F\u5B9E\u5BC6\u94A5\u53EA\u7531 Node/Vite \u670D\u52A1\u4ECE\u672C\u5730\u73AF\u5883\u8BFB\u53D6\u3002" })] }));
}
function AutomationSettings() {
    return (_jsxs("div", { children: [_jsx(Form.Item, { label: "\u8FD0\u884C\u6A21\u5F0F", name: ['automation', 'mode'], children: _jsx(Select, { options: [
                        { value: 'manual-review', label: '人工审核模式（推荐）' },
                        { value: 'unattended', label: '自动化无人值守模式' },
                    ] }) }), _jsx(Form.Item, { label: "A \u8F68\u8BED\u97F3\u524D\u9700\u8981\u4EBA\u5DE5\u786E\u8BA4", name: ['automation', 'requireReviewBeforeTts'], valuePropName: "checked", children: _jsx(Switch, { checkedChildren: "\u9700\u8981", unCheckedChildren: "\u8DF3\u8FC7" }) }), _jsx(Form.Item, { label: "\u4E0A\u65F6\u95F4\u8F74\u524D\u9700\u8981\u4EBA\u5DE5\u786E\u8BA4", name: ['automation', 'requireReviewBeforeTimeline'], valuePropName: "checked", children: _jsx(Switch, { checkedChildren: "\u9700\u8981", unCheckedChildren: "\u8DF3\u8FC7" }) }), _jsx(Form.Item, { label: "\u5F55\u5C4F\u4EA4\u4ED8\u524D\u9700\u8981\u4EBA\u5DE5\u786E\u8BA4", name: ['automation', 'requireReviewBeforeRecording'], valuePropName: "checked", children: _jsx(Switch, { checkedChildren: "\u9700\u8981", unCheckedChildren: "\u8DF3\u8FC7" }) }), _jsx(Tag, { color: "purple", children: "automation-unattended-mode" }), _jsx(Text, { type: "secondary", children: "\u5F53\u524D\u53EA\u9884\u7559\u6A21\u5F0F\u5F00\u5173\u548C\u5BA1\u6838\u95F8\u95E8\uFF1B\u771F\u5B9E\u65E0\u4EBA\u503C\u5B88\u6267\u884C\u5FC5\u987B\u540E\u7EED\u63A5\u4EFB\u52A1\u961F\u5217\u3001\u9519\u8BEF\u4E2D\u65AD\u548C\u7ED3\u679C\u56DE\u586B\u3002" })] }));
}
function ApiSettings() {
    return (_jsxs("div", { children: [_jsx(Form.Item, { label: "\u670D\u52A1\u5730\u5740", name: ['service', 'baseUrl'], children: _jsx(Input, { placeholder: "\u540E\u7EED\u63A5\u5165\u672C\u5730\u670D\u52A1\u6216\u7F51\u5173" }) }), _jsx(Form.Item, { label: "Socket Path", name: ['service', 'socketPath'], children: _jsx(Input, { placeholder: "/socket.io" }) }), _jsx(Form.Item, { label: "\u98DE\u4E66\u56DE\u586B", name: ['feishu', 'enabled'], valuePropName: "checked", children: _jsx(Switch, { checkedChildren: "\u542F\u7528", unCheckedChildren: "\u5173\u95ED" }) }), _jsx(Form.Item, { label: "\u98DE\u4E66\u5BC6\u94A5 Header", name: ['feishu', 'webhookSecretHeader'], children: _jsx(Input, { placeholder: "X-Feishu-Webhook-Secret" }) }), _jsx(Text, { type: "secondary", children: "\u8FD9\u91CC\u540E\u7EED\u53EA\u8BFB\u5199\u552F\u4E00\u914D\u7F6E\u771F\u76F8\uFF0C\u4E0D\u5728\u7EC4\u4EF6\u91CC\u79C1\u85CF API Key\u3002\u5BA2\u6237\u81EA\u6709 key \u901A\u8FC7\u540E\u7AEF\u5BC6\u94A5\u7BA1\u7406\u6216\u672C\u5730\u7F51\u5173\u63A5\u5165\u3002" })] }));
}
function RecognitionSettings() {
    return (_jsxs("div", { children: [_jsx(Form.Item, { label: "\u89C6\u89C9\u6A21\u578B Provider", name: ['recognition', 'provider'], children: _jsx(Select, { options: [
                        { value: 'manual-first', label: '手动优先（未接 API）' },
                        { value: 'aliyun-qwen35b-vision', label: '阿里云百炼 Qwen3.6 Flash 视觉/文本' },
                        { value: 'aliyun-qwen-ocr', label: '阿里云百炼 Qwen OCR' },
                        { value: 'aliyun-qwen-vl', label: '阿里云百炼 Qwen VL 多模态' },
                        { value: 'bigmodel-vision', label: '智谱 BigModel 视觉模型' },
                        { value: 'custom-vision-api', label: '客户自有视觉 API' },
                    ] }) }), _jsx(Form.Item, { label: "\u89C6\u89C9 API Endpoint", name: ['recognition', 'endpoint'], children: _jsx(Input, { placeholder: "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions" }) }), _jsx(Form.Item, { label: "\u6A21\u578B\u540D", name: ['recognition', 'modelName'], children: _jsx(Input, { placeholder: "qwen3.6-flash" }) }), _jsx(Form.Item, { label: "\u9274\u6743 Header", name: ['recognition', 'authHeaderName'], children: _jsx(Input, { placeholder: "Authorization" }) }), _jsx(Form.Item, { label: "\u5BC6\u94A5\u5F15\u7528/\u73AF\u5883\u53D8\u91CF\u540D", name: ['recognition', 'apiKeyRef'], extra: "\u4E0D\u8981\u586B\u5199\u660E\u6587 key\uFF1B\u8FD9\u91CC\u586B\u5199\u540E\u7AEF\u6216\u672C\u5730\u7F51\u5173\u80FD\u8BFB\u53D6\u5230\u7684\u5F15\u7528\u540D\u3002", children: _jsx(Input, { placeholder: "DASHSCOPE_API_KEY" }) }), _jsx(Form.Item, { label: "\u7CFB\u7EDF\u63D0\u793A\u8BCD", name: ['recognition', 'promptSystem'], children: _jsx(TextArea, { autoSize: { minRows: 7, maxRows: 12 } }) }), _jsx(Form.Item, { label: "\u7528\u6237\u63D0\u793A\u8BCD\u6A21\u677F", name: ['recognition', 'promptUserTemplate'], children: _jsx(TextArea, { autoSize: { minRows: 2, maxRows: 5 } }) }), _jsx(Form.Item, { label: "\u8F93\u51FA\u5408\u540C", name: ['recognition', 'outputContract'], children: _jsx(Select, { mode: "multiple", options: [
                        { value: 'problemText', label: '题文' },
                        { value: 'givenConditions', label: '已知条件' },
                        { value: 'answerTarget', label: '求解目标' },
                        { value: 'mathSymbolProtection', label: '数学符号保护' },
                    ] }) }), _jsx(Form.Item, { label: "\u65E0\u56FE\u6587\u5B57\u9898\u5904\u7406", name: ['recognition', 'textMode'], children: _jsx(Select, { options: [
                        { value: 'same-frame', label: '进入同一个题目内容框' },
                        { value: 'manual-only', label: '仅手动编辑' },
                    ] }) }), _jsx(Form.Item, { label: "\u4E0A\u4F20\u540E\u81EA\u52A8\u8BC6\u522B\u9898\u56FE", name: ['recognition', 'autoNextAfterRecognized'], valuePropName: "checked", extra: "\u53EA\u81EA\u52A8\u53D1\u8D77\u8BC6\u522B\u5E76\u586B\u5165\u5019\u9009\u9898\u6587\uFF1B\u662F\u5426\u8DF3\u8FC7\u786E\u8BA4\u7531\u5BA1\u6838\u95F8\u95E8\u7EDF\u4E00\u63A7\u5236\u3002", children: _jsx(Switch, { checkedChildren: "\u81EA\u52A8\u8BC6\u522B", unCheckedChildren: "\u624B\u52A8\u8BC6\u522B" }) }), _jsx(Tag, { color: "blue", children: "recognition-ai-config" }), _jsx(Text, { type: "secondary", children: "\u8FD9\u91CC\u53EA\u4FDD\u5B58\u914D\u7F6E\u5F15\u7528\uFF0C\u4E0D\u4FDD\u5B58\u660E\u6587 API Key\u3002\u5BA2\u6237\u5B9A\u5236\u53EF\u4EE5\u7528\u5BA2\u6237\u81EA\u5DF1\u7684 key\uFF0C\u4F46\u771F\u5B9E\u8C03\u7528\u5FC5\u987B\u8D70\u672C\u5730\u670D\u52A1\u6216\u540E\u7AEF\u7F51\u5173\uFF0C\u907F\u514D\u5BC6\u94A5\u66B4\u9732\u5728\u524D\u7AEF\u3002" })] }));
}
// @xiaxia-settings-hint: vectorKb is saved config only until /api/agent/script-board accepts it; keep this UI marked as reserved.
function VectorKbSettings() {
    return (_jsxs("div", { children: [_jsx(Alert, { description: "\u8FD9\u91CC\u5148\u4FDD\u5B58 Agent \u68C0\u7D22\u914D\u7F6E\uFF1B\u5F53\u524D /api/agent/script-board \u8FD8\u6CA1\u6709\u8BFB\u53D6 vectorKb\uFF0C\u6240\u4EE5\u4E0D\u8981\u628A\u8FD9\u91CC\u7406\u89E3\u4E3A\u5DF2\u7ECF\u63A5\u901A\u77E5\u8BC6\u5E93\u68C0\u7D22\u3002", message: "\u9884\u7559\u914D\u7F6E\uFF1A\u4FDD\u5B58\u4F46\u4E0D\u53C2\u4E0E\u5F53\u524D Agent \u8BF7\u6C42", showIcon: true, type: "warning" }), _jsx(Form.Item, { label: "\u542F\u7528\u77E5\u8BC6\u5E93\u68C0\u7D22", name: ['vectorKb', 'enabled'], valuePropName: "checked", children: _jsx(Switch, { checkedChildren: "\u542F\u7528", unCheckedChildren: "\u5173\u95ED" }) }), _jsx(Form.Item, { label: "\u77E5\u8BC6\u5E93 Provider", name: ['vectorKb', 'provider'], children: _jsx(Select, { options: [
                        { value: 'none', label: '不使用' },
                        { value: 'builtin', label: '内置知识库' },
                        { value: 'local', label: '本地知识库' },
                        { value: 'external-vector-api', label: '外部向量 API' },
                        { value: 'customer-managed', label: '客户自管知识库' },
                    ] }) }), _jsx(Form.Item, { label: "\u77E5\u8BC6\u5E93 Endpoint", name: ['vectorKb', 'endpoint'], children: _jsx(Input, { placeholder: "https://example.com/vector/search" }) }), _jsx(Form.Item, { label: "\u5BC6\u94A5\u5F15\u7528/\u73AF\u5883\u53D8\u91CF\u540D", name: ['vectorKb', 'apiKeyRef'], extra: "\u53EA\u4FDD\u5B58\u5F15\u7528\u540D\uFF0C\u4E0D\u4FDD\u5B58\u660E\u6587 key\u3002", children: _jsx(Input, { placeholder: "VECTOR_KB_API_KEY" }) }), _jsx(Form.Item, { label: "Collection", name: ['vectorKb', 'collection'], children: _jsx(Input, { placeholder: "math-whiteboard" }) }), _jsx(Form.Item, { label: "Embedding \u6A21\u578B", name: ['vectorKb', 'embeddingModel'], children: _jsx(Input, { placeholder: "text-embedding-v4" }) }), _jsx(Form.Item, { label: "Top K", name: ['vectorKb', 'topK'], children: _jsx(InputNumber, { min: 1, max: 20, step: 1 }) }), _jsx(Tag, { color: "orange", children: "reserved-vector-kb-config" })] }));
}
function ScriptAgentSettings() {
    return (_jsxs("div", { children: [_jsx(Alert, { showIcon: true, type: "info", message: "Agent \u5BF9\u8BDD\u53C2\u6570\u5FC5\u987B\u8DDF\u968F A-template \u547D\u540D\u5408\u540C", description: "promptSystem\u3001promptUserTemplate\u3001outputContract \u90FD\u53EA\u670D\u52A1 rows \u5019\u9009\u7A3F\uFF1A\u5F00\u573A\u8BFB\u9898\u4E3B\u8EAB\u4EFD\u662F A-template-open\uFF1B\u4E3A\u9632\u540E\u7EED\u9519\u4F4D\uFF0Cprompt/template \u5C42\u540C\u65F6\u4FDD\u7559 B-template-open / C-template-open \u5360\u4F4D\uFF0C\u5F53\u524D boardSlice \u5FC5\u987B\u7559\u7A7A\uFF1B\u5206\u6790\u9898\u76EE\u548C\u68B3\u7406\u603B\u7ED3\u53EF\u6309\u9700\u8981\u586B\u5199 C \u7D20\u6750\u5019\u9009\uFF1B\u6B63\u5F0F\u6B65\u9AA4\u624D\u7528 A1/B1/C1\u3002", style: { marginBottom: 12 } }), _jsx(Form.Item, { label: "Agent \u6A21\u5F0F", name: ['scriptAgent', 'mode'], children: _jsx(Select, { options: [
                        { value: 'manual-template', label: '本地模板候选' },
                        { value: 'builtin-kb', label: '内置知识库' },
                        { value: 'external-agent-api', label: '阿里云百炼 / 外部 Agent API' },
                        { value: 'customer-agent', label: '客户自有 Agent' },
                    ] }) }), _jsx(Form.Item, { label: "Agent API Endpoint", name: ['scriptAgent', 'endpoint'], children: _jsx(Input, { placeholder: "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions" }) }), _jsx(Form.Item, { label: "\u6A21\u578B\u540D", name: ['scriptAgent', 'modelName'], children: _jsx(Input, { placeholder: "qwen3.6-flash" }) }), _jsx(Form.Item, { label: "\u9274\u6743 Header", name: ['scriptAgent', 'authHeaderName'], children: _jsx(Input, { placeholder: "Authorization" }) }), _jsx(Form.Item, { label: "\u5BC6\u94A5\u5F15\u7528/\u73AF\u5883\u53D8\u91CF\u540D", name: ['scriptAgent', 'apiKeyRef'], extra: "\u5BA2\u6237\u5B9A\u5236\u53EF\u4F7F\u7528\u5BA2\u6237\u81EA\u5DF1\u7684\u767E\u70BC\u6216\u6A21\u578B key\uFF1B\u8FD9\u91CC\u4FDD\u5B58\u5F15\u7528\u540D\uFF0C\u4E0D\u4FDD\u5B58\u660E\u6587\u3002", children: _jsx(Input, { placeholder: "DASHSCOPE_API_KEY" }) }), _jsx(Form.Item, { label: "\u7CFB\u7EDF\u63D0\u793A\u8BCD", name: ['scriptAgent', 'promptSystem'], extra: "\u5FC5\u987B\u5199\u660E rows \u5408\u540C\u548C A-template \u547D\u540D\u8FB9\u754C\uFF0C\u4E0D\u80FD\u9000\u56DE spokenScript/boardPlan \u6216\u5386\u53F2\u7F16\u53F7\u53E3\u5F84\u3002", children: _jsx(TextArea, { autoSize: { minRows: 10, maxRows: 18 } }) }), _jsx(Form.Item, { label: "\u7528\u6237\u63D0\u793A\u8BCD\u6A21\u677F", name: ['scriptAgent', 'promptUserTemplate'], extra: "\u6A21\u677F\u91CC\u8981\u4FDD\u7559 {{problemText}}\uFF0C\u5E76\u63D0\u9192\u5F00\u573A\u8BFB\u9898\u4E3B\u8EAB\u4EFD\u662F A-template-open\uFF1B\u4E3A\u9632\u540E\u7EED\u9519\u4F4D\uFF0Cprompt/template \u5C42\u540C\u65F6\u4FDD\u7559 B-template-open / C-template-open \u5360\u4F4D\uFF0C\u5F53\u524D boardSlice \u5FC5\u987B\u7559\u7A7A\uFF1B\u5206\u6790\u9898\u76EE\u548C\u68B3\u7406\u603B\u7ED3\u53EF\u6309\u9700\u8981\u586B\u5199 C \u7D20\u6750\u5019\u9009\uFF1B\u6B63\u5F0F\u6B65\u9AA4\u624D\u751F\u6210 A1/B1/C1\u3002", children: _jsx(TextArea, { autoSize: { minRows: 2, maxRows: 5 } }) }), _jsx(Form.Item, { label: "\u8F93\u51FA\u5408\u540C", name: ['scriptAgent', 'outputContract'], extra: "\u5F53\u524D\u53EA\u5141\u8BB8 rows\uFF1BboardSlice \u53EA\u662F C \u7D20\u6750\u5019\u9009\uFF0CA \u8FD4\u56DE\u771F\u5B9E\u65F6\u957F\u540E\u518D\u751F\u6210 B \u5BFF\u547D\uFF0C\u4E0D\u7531 Agent \u76F4\u63A5\u8F93\u51FA\u6B63\u5F0F A/B/C\u3002", children: _jsx(Select, { mode: "multiple", options: [
                        { value: 'rows', label: 'rows 表格候选（template 命名合同）' },
                    ] }) }), _jsx(Tag, { color: "geekblue", children: "script-agent-prompt" }), _jsx(Text, { type: "secondary", children: "Agent \u53EA\u4EA7 rows \u5019\u9009\u7A3F\uFF1B\u7528\u6237\u786E\u8BA4\u5E94\u7528\u540E\u624D\u5199\u5165\u6B63\u5F0F\u6587\u7A3F\u548C\u5141\u8BB8\u751F\u6210\u7684 C \u7D20\u6750\u5019\u9009\uFF0C\u518D\u8FDB\u5165 A \u8F68\u8BED\u97F3\u6B65\u9AA4\u3002" })] }));
}
const canvasPresetOptions = [
    { height: 1080, label: '横屏 16:9｜1920 × 1080', value: 'landscape-1080p', width: 1920 },
    { height: 720, label: '横屏 16:9｜1280 × 720', value: 'landscape-720p', width: 1280 },
    { height: 768, label: '课堂 4:3｜1024 × 768', value: 'classic-4-3', width: 1024 },
    { height: 1920, label: '竖屏 9:16｜1080 × 1920', value: 'portrait-1080p', width: 1080 },
    { height: 1080, label: '方屏 1:1｜1080 × 1080', value: 'square-1080', width: 1080 },
    { height: 1080, label: '自定义', value: 'custom', width: 1920 },
];
function CanvasSettings({ form }) {
    return (_jsxs("div", { children: [_jsx(Alert, { showIcon: true, type: "info", title: "\u8FD9\u91CC\u662F\u65B0\u5DE5\u7A0B\u9ED8\u8BA4\u503C", description: "\u8FD9\u91CC\u4FDD\u5B58\u65B0\u5DE5\u7A0B\u753B\u5E03\u89C4\u683C\u548C\u80CC\u666F\u9ED8\u8BA4\u503C\uFF1B\u5F53\u524D\u5DE5\u7A0B\u821E\u53F0\u5C3A\u5BF8\u5728\u53F3\u4FA7\u753B\u5E03\u9762\u677F\u8C03\u6574\uFF0C\u5F53\u524D C \u7D20\u6750\u5B57\u4F53\u5728\u201CC \u9ED8\u8BA4\u5B57\u4F53 / \u5F53\u524D\u5DE5\u7A0B\u201D\u8C03\u6574\u3002" }), _jsx(Form.Item, { label: "\u9ED8\u8BA4\u753B\u5E03\u89C4\u683C", name: ['stageDefaults', 'canvas', 'preset'], children: _jsx(Select, { options: canvasPresetOptions.map((option) => ({ label: option.label, value: option.value })), onChange: (value) => {
                        const preset = canvasPresetOptions.find((option) => option.value === value);
                        if (!preset || preset.value === 'custom') {
                            return;
                        }
                        form.setFieldsValue({
                            stageDefaults: {
                                ...form.getFieldValue('stageDefaults'),
                                canvas: {
                                    ...form.getFieldValue(['stageDefaults', 'canvas']),
                                    height: preset.height,
                                    preset: preset.value,
                                    width: preset.width,
                                },
                            },
                        });
                    } }) }), _jsxs("div", { className: "inspector-field-grid", children: [_jsx(Form.Item, { label: "\u9ED8\u8BA4\u5BBD\u5EA6", name: ['stageDefaults', 'canvas', 'width'], children: _jsx(InputNumber, { max: 3840, min: 360, step: 10 }) }), _jsx(Form.Item, { label: "\u9ED8\u8BA4\u9AD8\u5EA6", name: ['stageDefaults', 'canvas', 'height'], children: _jsx(InputNumber, { max: 3840, min: 360, step: 10 }) })] }), _jsx(Form.Item, { label: "\u9ED8\u8BA4\u80CC\u666F\u8272", name: ['stageDefaults', 'canvas', 'background'], children: _jsx(Input, { placeholder: "#ffffff" }) })] }));
}
function TypographySettings() {
    return (_jsxs("div", { children: [_jsx(Alert, { description: "\u4FDD\u5B58\u540E\u53EA\u5F71\u54CD\u4EE5\u540E\u65B0\u5EFA\u5DE5\u7A0B\u7684\u9ED8\u8BA4 C \u7D20\u6750\u5B57\u4F53\uFF1B\u4E0D\u4F1A\u8986\u76D6\u5F53\u524D\u821E\u53F0\u3002C \u7D20\u6750\u5B57\u4F53\u5730\u5740\u5141\u8BB8\u586B\u5199 HTTPS \u5728\u7EBF\u5B57\u4F53 CSS\uFF0C\u7559\u7A7A\u5219\u4F7F\u7528\u9879\u76EE\u5185\u7F6E/\u672C\u673A\u5B57\u4F53\u3002", message: "\u8FD9\u91CC\u662F\u65B0\u5DE5\u7A0B\u9ED8\u8BA4\u503C\uFF0C\u4E0D\u662F\u5F53\u524D\u5DE5\u7A0B\u5B57\u4F53\u5165\u53E3", showIcon: true, type: "info" }), _jsx(Form.Item, { label: "\u754C\u9762\u5B57\u4F53\u7B56\u7565\uFF08\u4E0D\u63A7\u5236 C \u7D20\u6750\uFF09", name: ['typography', 'globalFontPreset'], children: _jsx(Select, { options: [
                        { value: 'system', label: '系统默认' },
                        { value: 'math-first', label: '数学符号优先' },
                    ] }) }), _jsx(BoardTypographyFormFields, { helpText: "\u8FD9\u91CC\u53EA\u4FDD\u5B58\u4EE5\u540E\u65B0\u5EFA\u5DE5\u7A0B\u4F7F\u7528\u7684\u9ED8\u8BA4\u503C\uFF1B\u5F53\u524D\u5DE5\u7A0B\u8BF7\u5728\u53F3\u4FA7\u201CC \u9ED8\u8BA4\u5B57\u4F53 / \u5F53\u524D\u5DE5\u7A0B\u201D\u4E2D\u8C03\u6574\u5E76\u5E94\u7528\u3002\u5728\u7EBF\u5B57\u4F53\u8BF7\u586B HTTPS \u5B57\u4F53 CSS\u3002", labelPrefix: "\u65B0\u5DE5\u7A0B\u9ED8\u8BA4 C \u7D20\u6750", namePrefix: ['stageDefaults', 'canvas'] })] }));
}
function EffectSettings() {
    return (_jsxs("div", { children: [_jsx(Form.Item, { label: "\u9ED8\u8BA4 C \u7D20\u6750\u51FA\u73B0\u65B9\u5F0F", name: ['effects', 'boardRevealEffect'], children: _jsx(Select, { options: [
                        { value: 'write-on', label: '描写出现' },
                        { value: 'fade-in', label: '淡入' },
                        { value: 'pop', label: '轻弹出' },
                    ] }) }), _jsx(Form.Item, { label: "\u9884\u7559 C \u7D20\u6750\u900F\u660E\u5EA6\uFF08%\uFF09", name: ['effects', 'defaultStickerOpacity'], extra: "\u5F53\u524D\u53EA\u4FDD\u5B58\u9ED8\u8BA4\u914D\u7F6E\uFF0C\u4E0D\u6539\u53D8 A \u8F68 timing \u6216 B \u5BFF\u547D\u3002", children: _jsx(InputNumber, { min: 0, max: 100 }) })] }));
}
function FileSettings() {
    return (_jsxs("div", { children: [_jsx(Form.Item, { label: "\u9ED8\u8BA4\u4FDD\u5B58\u4F4D\u7F6E\u6807\u8BC6", name: ['output', 'defaultSaveDirectoryLabel'], children: _jsx(Input, { placeholder: "\u7531\u7528\u6237\u9009\u62E9\u7684\u4FDD\u5B58\u4F4D\u7F6E\u540D\u79F0\uFF0C\u4E0D\u5199\u6B7B\u672C\u673A\u8DEF\u5F84" }) }), _jsx(Form.Item, { label: "\u6587\u4EF6\u547D\u540D\u6A21\u677F", name: ['output', 'fileNameTemplate'], children: _jsx(Input, { placeholder: "{{projectTitle}}-{{date}}" }) }), _jsx(Form.Item, { label: "\u5F55\u5236\u683C\u5F0F", name: ['output', 'recordingFormat'], children: _jsx(Select, { options: [
                        { value: 'webm', label: 'WebM（浏览器原生）' },
                        { value: 'mp4', label: 'MP4（后续转码）' },
                    ] }) }), _jsxs("div", { className: "inspector-field-grid", children: [_jsx(Form.Item, { label: "\u5F55\u5236\u5E27\u7387", name: ['output', 'recordingFps'], children: _jsx(InputNumber, { max: 60, min: 12, step: 1 }) }), _jsx(Form.Item, { label: "\u5F55\u5236\u8D28\u91CF", name: ['output', 'recordingQuality'], children: _jsx(InputNumber, { max: 1, min: 0.1, step: 0.01 }) })] }), _jsx(Form.Item, { label: "\u5BFC\u51FA\u540E\u5199\u5165\u4EA4\u4ED8\u8BB0\u5F55", name: ['output', 'writeExportResultAsset'], valuePropName: "checked", children: _jsx(Switch, { checkedChildren: "\u5199\u5165", unCheckedChildren: "\u53EA\u4E0B\u8F7D" }) }), _jsx(Text, { type: "secondary", children: "\u8FD9\u91CC\u4FDD\u5B58\u5BFC\u51FA\u504F\u597D\uFF1B\u771F\u6B63\u7684\u5BFC\u51FA\u6587\u4EF6\u4EE5\u540E\u5199\u5165 exportResult\uFF0C\u4E0D\u6DF7\u5230 A \u8F68\u97F3\u9891\u91CC\u3002" })] }));
}

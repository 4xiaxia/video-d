import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// @cleanroom-component: AgentReviewCard
// @domain: script-agent-interface
// @slot: lower-left-agent-dock
// @depends: local draft state, future scriptAgent config, future vectorKb config
// @feature-branch: script-agent-interface
// @feature-branch: agent-review-card
// @feature-branch: agent-draft-apply
// @feature-branch: customer-agent-adapter
// @feature-branch: vector-kb-interface
// @io-input: ScriptAgentDraft
// @io-output: onApplyDraft(draft)
// @route: ScriptAgentWorkspace Drawer / agent conversation zone
// @fields: ScriptAgentDraft.rows -> compiler -> ScriptAgentDraft.spokenScript / ScriptAgentDraft.boardPlan
// @boundary: uses AntD Card/Avatar/Alert/Input/Button as UI base; no custom chat shell; does not write TeachingProject directly
// @route-impact: App shell only, future route: script-workspace
// @api-needed: script-agent-chat-api | trigger: send user revision message | output: candidate ScriptAgentDraft
import { RobotOutlined } from '@ant-design/icons';
import { Bubble, Sender } from '@ant-design/x';
import { XMarkdown } from '@ant-design/x-markdown';
import Latex from '@ant-design/x-markdown/plugins/Latex';
import { Alert, Avatar, Button, Flex, Space, Typography } from 'antd';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { hasScriptAgentDraftContent } from '../modules/scriptAgentDraft';
import { requestScriptAgentDraft } from '../services/scriptAgentGatewayClient';
const { Text } = Typography;
export function AgentReviewCard({ autoApplyDraft, autoRunRequestId, draft, onCandidateDraftChange, problemText, scriptAgentConfig, onApplyDraft, }) {
    const [prompt, setPrompt] = useState('');
    const [candidateDraft, setCandidateDraft] = useState(draft);
    const [isRequesting, setIsRequesting] = useState(false);
    const [error, setError] = useState('');
    const [chatMessages, setChatMessages] = useState(() => readStoredChatMessages());
    const autoRunRequestRef = useRef(0);
    const activeDraft = hasScriptAgentDraftContent(candidateDraft) ? candidateDraft : draft;
    useEffect(() => {
        setCandidateDraft(draft);
        setError('');
    }, [draft]);
    const hasCandidateRows = Boolean(activeDraft.rows?.length);
    const draftStatusText = hasCandidateRows
        ? '候选切片表格已生成或正在编辑；右侧表格是唯一候选编辑面，确认后才写入正式文稿和 C 素材候选。'
        : activeDraft.spokenScript || activeDraft.boardPlan
            ? autoApplyDraft
                ? '候选草稿已生成，并已按无人值守模式应用到正式预览。'
                : '候选草稿已生成。点击应用后才写入正式文稿和 C 素材候选。'
            : '打开对话不会自动发送题目；点击讲解生成或在这里发送消息后，候选结果才会更新。';
    useEffect(() => {
        writeStoredChatMessages(chatMessages);
    }, [chatMessages]);
    const handleRequestAgent = useCallback(async (revisionPrompt = prompt) => {
        if (!problemText.trim()) {
            return;
        }
        const submittedPrompt = revisionPrompt || '请基于已确认题文一步一步填写讲解切片表格候选。';
        setIsRequesting(true);
        setError('');
        setChatMessages((current) => [
            ...current,
            createChatMessage('user', submittedPrompt),
        ]);
        try {
            const nextDraft = await requestScriptAgentDraft({
                config: scriptAgentConfig,
                problemText,
                revisionPrompt,
            });
            setCandidateDraft(nextDraft);
            onCandidateDraftChange(nextDraft);
            setChatMessages((current) => [
                ...current,
                createChatMessage('ai', formatDraftReceipt(nextDraft)),
            ]);
            if (autoApplyDraft) {
                onApplyDraft(nextDraft);
            }
        }
        catch (requestError) {
            const errorMessage = requestError instanceof Error ? requestError.message : String(requestError);
            setError(errorMessage);
            setChatMessages((current) => [
                ...current,
                createChatMessage('ai', `请求失败：${errorMessage}`),
            ]);
        }
        finally {
            setIsRequesting(false);
        }
    }, [autoApplyDraft, onApplyDraft, onCandidateDraftChange, problemText, prompt, scriptAgentConfig]);
    useEffect(() => {
        if (!autoRunRequestId || autoRunRequestRef.current === autoRunRequestId || !problemText.trim()) {
            return;
        }
        autoRunRequestRef.current = autoRunRequestId;
        void handleRequestAgent('');
    }, [autoRunRequestId, handleRequestAgent, problemText]);
    const messages = useMemo(() => {
        const persistedItems = chatMessages.length
            ? chatMessages
            : [
                {
                    content: '已打开文稿与 C 素材 Agent。这里会保留本地聊天记录；打开窗口本身不会发送题目。',
                    key: 'system-ready',
                    role: 'ai',
                },
            ];
        if (isRequesting) {
            return [
                ...persistedItems,
                {
                    content: '正在生成回答，请稍等。',
                    key: 'agent-loading',
                    loading: true,
                    role: 'ai',
                },
            ];
        }
        return persistedItems;
    }, [chatMessages, isRequesting]);
    return (_jsxs("section", { className: "agent-review-card", children: [_jsxs(Space, { className: "agent-review-title", children: [_jsx(Avatar, { className: "agent-avatar", icon: _jsx(RobotOutlined, {}), shape: "square" }), _jsxs("span", { children: [_jsx(Text, { strong: true, children: "\u6587\u7A3F\u4E0E C \u7D20\u6750 Agent" }), _jsx(Text, { className: "agent-review-subtitle", type: "secondary", children: "\u5BF9\u8BDD\u8C03\u6574\uFF0C\u6EE1\u610F\u540E\u5E94\u7528" })] })] }), _jsx(Bubble.List, { autoScroll: true, className: "agent-chat-list", items: messages, role: {
                    ai: {
                        avatar: _jsx(Avatar, { className: "agent-avatar", icon: _jsx(RobotOutlined, {}), shape: "square" }),
                        contentRender: (content) => (_jsx(XMarkdown, { className: "agent-markdown math-markdown", config: { extensions: Latex() }, content: String(content), escapeRawHtml: true, openLinksInNewTab: true })),
                        placement: 'start',
                        variant: 'filled',
                    },
                    user: {
                        placement: 'end',
                        variant: 'outlined',
                    },
                } }), _jsx(Alert, { className: "agent-draft-preview", showIcon: true, title: draftStatusText, type: "info" }), error ? _jsx(Alert, { showIcon: true, title: error, type: "error" }) : null, _jsx(Text, { className: "agent-config-hint", type: "secondary", children: "\u5F53\u524D Agent \u63D0\u793A\u8BCD\u6765\u81EA\u5168\u5C40\u914D\u7F6E\uFF1B\u8FD4\u56DE\u7ED3\u679C\u4F1A\u8FDB\u5165\u53F3\u4FA7\u5207\u7247\u8868\u683C\u3002" }), _jsx(Sender, { autoSize: { minRows: 2, maxRows: 5 }, className: "agent-sender", loading: isRequesting, onCancel: () => setIsRequesting(false), onChange: setPrompt, onSubmit: (message) => {
                    setPrompt('');
                    void handleRequestAgent(message);
                }, placeholder: "\u4F8B\u5982\uFF1A\u8BED\u6C14\u518D\u6E29\u67D4\u4E00\u70B9\uFF1BC \u7D20\u6750\u5C11\u4E00\u4E9B\uFF1B\u6362\u6210\u521D\u4E2D\u53E3\u543B\u3002", value: prompt }), _jsxs(Flex, { className: "agent-review-actions", gap: 8, justify: "end", children: [_jsx(Button, { disabled: isRequesting || chatMessages.length === 0, onClick: () => setChatMessages([]), children: "\u6E05\u7A7A\u672C\u5730\u8BB0\u5F55" }), _jsx(Button, { disabled: !problemText.trim() || isRequesting, onClick: () => void handleRequestAgent(''), children: "\u91CD\u65B0\u751F\u6210" })] })] }));
}
const agentChatStorageKey = 'cleanroom-script-agent-chat-history-v2';
function createChatMessage(role, content) {
    return {
        content,
        key: `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        role,
    };
}
function readStoredChatMessages() {
    if (typeof window === 'undefined') {
        return [];
    }
    try {
        const rawValue = window.localStorage.getItem(agentChatStorageKey);
        const parsedValue = rawValue ? JSON.parse(rawValue) : [];
        if (!Array.isArray(parsedValue)) {
            return [];
        }
        return parsedValue.filter(isAgentChatHistoryItem).filter((message) => !isLegacyPreviewMessage(message.content));
    }
    catch {
        return [];
    }
}
function writeStoredChatMessages(messages) {
    if (typeof window === 'undefined') {
        return;
    }
    try {
        window.localStorage.setItem(agentChatStorageKey, JSON.stringify(messages.slice(-40)));
    }
    catch {
        // Local history is a convenience cache; failures should not block generation.
    }
}
function isAgentChatHistoryItem(value) {
    if (!value || typeof value !== 'object') {
        return false;
    }
    const candidate = value;
    return typeof candidate.key === 'string' && typeof candidate.content === 'string' && (candidate.role === 'ai' || candidate.role === 'user');
}
function formatDraftReceipt(draft) {
    if (draft.rows?.length) {
        return `已生成 ${draft.rows.length} 行讲解切片，内容已放到右侧表格编辑区。`;
    }
    const sections = [];
    if (draft.spokenScript.trim()) {
        sections.push('文案候选');
    }
    if (draft.boardPlan.trim()) {
        sections.push('C 素材候选');
    }
    return sections.length ? `已生成${sections.join('和')}，内容已放到右侧候选编辑区。` : 'Agent 已返回候选结果。';
}
function isLegacyPreviewMessage(content) {
    return [
        '### rows 表格候选',
        '### compiler 文案预览',
        '### 文案预览',
        '### 板书预览',
        '<br>',
        '<b>',
    ].some((legacyPreviewMarker) => content.includes(legacyPreviewMarker));
}

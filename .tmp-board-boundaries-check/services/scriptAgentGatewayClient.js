import { normalizeScriptAgentDraft } from '../modules/scriptAgentDraft';
export async function requestScriptAgentDraft({ config, problemText, revisionPrompt, }) {
    const normalizedProblemText = problemText.trim();
    if (!normalizedProblemText) {
        throw new Error('需要先确认题文。');
    }
    const response = await fetch('/api/agent/script-board', {
        body: JSON.stringify({
            config,
            problemText: normalizedProblemText,
            revisionPrompt: revisionPrompt.trim(),
        }),
        headers: {
            'Content-Type': 'application/json',
        },
        method: 'POST',
    });
    const payload = await readGatewayJson(response, 'Agent');
    if (!response.ok || payload.status !== 'ok' || !payload.draft) {
        throw new Error(payload.error?.message || `Agent 请求失败：HTTP ${response.status}`);
    }
    return normalizeScriptAgentDraft(payload.draft);
}
async function readGatewayJson(response, label) {
    const text = await response.text();
    if (!text.trim()) {
        throw new Error(`${label}接口返回空内容：HTTP ${response.status}`);
    }
    try {
        return JSON.parse(text);
    }
    catch {
        throw new Error(`${label}接口返回非 JSON 内容：HTTP ${response.status}`);
    }
}

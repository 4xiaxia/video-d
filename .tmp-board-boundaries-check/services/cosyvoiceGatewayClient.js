const defaultGatewayUrl = '';
export async function requestCosyVoiceSentences(sentences, config) {
    if (sentences.length === 0) {
        throw new Error('需要先确认口播文稿。');
    }
    const response = await fetch(resolveEndpoint(config.endpoint), {
        // @xiaxia-settings-hint: Keep this body aligned with AppSettingsDrawer tts.* and gateway normalizers.
        body: JSON.stringify({
            format: config.format,
            model: config.modelName,
            sampleRate: config.sampleRate,
            sentences,
            voice: config.voiceName,
            wordTimestampEnabled: config.wordTimestampEnabled,
        }),
        headers: {
            'Content-Type': 'application/json',
        },
        method: 'POST',
    });
    const payload = await response.json().catch(() => undefined);
    if (!response.ok) {
        const message = payload?.error?.message || `CosyVoice gateway failed: HTTP ${response.status}`;
        throw new Error(message);
    }
    return validateGatewayResponse(payload);
}
function getGatewayUrl() {
    return (import.meta.env.VITE_COSYVOICE_GATEWAY_URL || defaultGatewayUrl).replace(/\/$/, '');
}
function resolveEndpoint(endpoint) {
    if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
        return endpoint;
    }
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${getGatewayUrl()}${normalizedEndpoint}`;
}
function validateGatewayResponse(payload) {
    if (!payload || typeof payload !== 'object') {
        throw new Error('CosyVoice gateway returned an invalid response.');
    }
    const response = payload;
    if (!Array.isArray(response.results)) {
        throw new Error('CosyVoice gateway response is missing results.');
    }
    return {
        model: typeof response.model === 'string' ? response.model : '',
        results: response.results.map(validateResult),
        status: response.status === 'partial' ? 'partial' : 'ok',
        voice: typeof response.voice === 'string' ? response.voice : '',
    };
}
function validateResult(result) {
    if (!result || typeof result !== 'object') {
        throw new Error('CosyVoice gateway returned an invalid sentence result.');
    }
    const item = result;
    if (typeof item.sentenceId !== 'string' || !item.sentenceId) {
        throw new Error('CosyVoice sentence result is missing sentenceId.');
    }
    return {
        audioBytes: typeof item.audioBytes === 'number' ? item.audioBytes : undefined,
        audioUrl: typeof item.audioUrl === 'string' ? item.audioUrl : '',
        durationMs: typeof item.durationMs === 'number' ? item.durationMs : 0,
        error: typeof item.error === 'string' ? item.error : undefined,
        requestId: typeof item.requestId === 'string' ? item.requestId : undefined,
        sentenceId: item.sentenceId,
        status: item.status === 'failed' ? 'failed' : 'ready',
        text: typeof item.text === 'string' ? item.text : undefined,
        timingJson: typeof item.timingJson === 'string' ? item.timingJson : '',
    };
}

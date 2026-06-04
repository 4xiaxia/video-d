export async function requestProblemTextRecognition({ config, imageFile, }) {
    const imageDataUrl = await readFileAsDataUrl(imageFile);
    const response = await fetch('/api/recognition/problem-text', {
        body: JSON.stringify({
            config,
            imageDataUrl,
            imageName: imageFile.name,
        }),
        headers: {
            'Content-Type': 'application/json',
        },
        method: 'POST',
    });
    const payload = await readGatewayJson(response, '题图识别');
    if (!response.ok || payload.status !== 'ok' || !payload.problemText?.trim()) {
        throw new Error(payload.error?.message || `题图识别失败：HTTP ${response.status}`);
    }
    return payload.problemText.trim();
}
function readFileAsDataUrl(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.addEventListener('load', () => {
            if (typeof reader.result === 'string' && reader.result.startsWith('data:image/')) {
                resolve(reader.result);
                return;
            }
            reject(new Error('只支持图片文件识别。'));
        });
        reader.addEventListener('error', () => reject(reader.error ?? new Error('读取图片失败。')));
        reader.readAsDataURL(file);
    });
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

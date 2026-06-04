// @cleanroom-module: voiceAudioSeek
// @domain: voice-audio-playback
// @boundary: A audio seek preparation only; does not mutate B timing or C reveal state
export async function prepareVoiceAudioSeek({ audio, offsetMs, signal, source, }) {
    throwIfAborted(signal);
    if (audio.src !== source) {
        audio.src = source;
        audio.load();
    }
    await waitForAudioMetadata(audio, signal);
    throwIfAborted(signal);
    audio.currentTime = clampSeekSecondsToDuration(normalizeVoiceAudioSeekSeconds(offsetMs), audio.duration);
}
export function normalizeVoiceAudioSeekSeconds(offsetMs) {
    if (!Number.isFinite(offsetMs)) {
        return 0;
    }
    return Math.max(0, offsetMs / 1000);
}
function clampSeekSecondsToDuration(seekSeconds, durationSeconds) {
    if (!Number.isFinite(durationSeconds) || durationSeconds <= 0) {
        return seekSeconds;
    }
    return Math.min(seekSeconds, durationSeconds);
}
function waitForAudioMetadata(audio, signal) {
    if (audio.readyState >= 1) {
        return Promise.resolve();
    }
    return new Promise((resolve, reject) => {
        const cleanup = () => {
            audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
            audio.removeEventListener('error', handleError);
            signal?.removeEventListener('abort', handleAbort);
        };
        const handleLoadedMetadata = () => {
            cleanup();
            resolve();
        };
        const handleError = () => {
            cleanup();
            reject(new Error('A 轨音频文件无法读取，请重新生成或检查本地语音文件是否还在。'));
        };
        const handleAbort = () => {
            cleanup();
            reject(new Error('A 轨播放已取消。'));
        };
        audio.addEventListener('loadedmetadata', handleLoadedMetadata);
        audio.addEventListener('error', handleError);
        signal?.addEventListener('abort', handleAbort, { once: true });
        if (signal?.aborted) {
            handleAbort();
        }
    });
}
function throwIfAborted(signal) {
    if (signal?.aborted) {
        throw new Error('A 轨播放已取消。');
    }
}

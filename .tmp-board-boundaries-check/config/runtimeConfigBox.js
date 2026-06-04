export function readRuntimeConfigBox(config) {
    return {
        scriptAgent: config.scriptAgent,
        tts: config.tts,
        recognition: config.recognition,
        automation: config.automation,
        stageDefaults: config.stageDefaults,
        output: config.output,
    };
}

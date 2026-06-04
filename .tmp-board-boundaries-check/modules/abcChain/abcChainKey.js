import { SCRIPT_SECTION } from '../../domain/globalRules';
export function createTemplateChainKey(section, purpose) {
    if (section === SCRIPT_SECTION.OPENING) {
        return purpose ? `template-open-${purpose}` : 'template-open';
    }
    if (section === SCRIPT_SECTION.ANALYSIS) {
        return purpose ? `template-pre-${purpose}` : 'template-pre';
    }
    if (section === SCRIPT_SECTION.SUMMARY) {
        return purpose ? `template-end-${purpose}` : 'template-end';
    }
    return 'unbound';
}
export function createStepChainKey(stepIndex) {
    if (!Number.isFinite(stepIndex) || stepIndex < 1) {
        return 'unbound';
    }
    return `step-${Math.round(stepIndex)}`;
}
export function createRowChainKey(rows, row) {
    if (row.section !== SCRIPT_SECTION.SOLVING) {
        return createTemplateChainKey(row.section);
    }
    const stepIndex = rows.filter((candidate) => candidate.section === SCRIPT_SECTION.SOLVING).findIndex((candidate) => candidate.id === row.id) + 1;
    return createStepChainKey(stepIndex);
}
export function createAbcChainLabels(chainKey) {
    if (chainKey === 'template-open') {
        return {
            a: 'A-template-open',
            b: 'B-template-open',
            c: 'C-template-open',
        };
    }
    if (chainKey === 'template-pre') {
        return {
            a: 'A-template-pre',
            b: 'B-template-pre',
            c: 'C-template-pre',
        };
    }
    if (chainKey === 'template-end') {
        return {
            a: 'A-template-end',
            b: 'B-template-end',
            c: 'C-template-end',
        };
    }
    // Handle template with specific purpose (e.g., template-pre-analysis)
    const templateMatch = chainKey?.match(/^template-(open|pre|end)-(.+)$/);
    if (templateMatch) {
        const [, templateType, purpose] = templateMatch;
        return {
            a: `A-template-${templateType}-${purpose}`,
            b: `B-template-${templateType}-${purpose}`,
            c: `C-template-${templateType}-${purpose}`,
        };
    }
    const stepIndex = readStepIndex(chainKey);
    if (stepIndex === null) {
        return {
            a: 'A-unbound',
            b: 'B-unbound',
            c: 'C-unbound',
        };
    }
    return {
        a: `A${stepIndex}`,
        b: `B${stepIndex}`,
        c: `C${stepIndex}`,
    };
}
export function createAbcChainLabel(chainKey, layer) {
    return createAbcChainLabels(chainKey)[layer];
}
export function isBoardMaterialChainKey(chainKey) {
    return chainKey === 'template-open' || chainKey === 'template-pre' || chainKey === 'template-end' ||
        /^template-(open|pre|end)-/.test(chainKey || '') || readStepIndex(chainKey) !== null;
}
export function createScriptChainKeysSourceRef(rows) {
    if (!rows?.length) {
        return '';
    }
    return JSON.stringify({
        chainKeys: rows.map((row) => row.chainKey ?? ''),
        kind: 'script-agent-rows-v1',
    });
}
export function readScriptChainKeysSourceRef(sourceRef) {
    if (!sourceRef?.trim()) {
        return undefined;
    }
    try {
        const metadata = JSON.parse(sourceRef);
        if (!Array.isArray(metadata.chainKeys)) {
            return undefined;
        }
        return metadata.chainKeys.filter((chainKey) => typeof chainKey === 'string');
    }
    catch {
        return undefined;
    }
}
function readStepIndex(chainKey) {
    const match = chainKey?.match(/^step-(\d+)$/);
    if (!match) {
        return null;
    }
    const parsedIndex = Number.parseInt(match[1], 10);
    return Number.isFinite(parsedIndex) && parsedIndex > 0 ? parsedIndex : null;
}

// @@WORLD_A @@WORLD_B @@WORLD_C
// ABC 三轨世界观唯一真相源：A=语音主轴 / B=寿命窗口 / C=画布演员
// 金手指是最顶层 session-only overlay，不写 base A/B/C
/**
 * 全局规则和变量统一定义
 *
 * 这是项目中所有核心规则和变量的唯一真相源。
 * 任何地方需要引用这些规则和变量，都必须从这里导入，禁止硬编码。
 *
 * 修改规则时，只修改这个文件，所有引用会自动同步。
 */
// ============================================================================
// ABC三轨世界观定义
// ============================================================================
/**
 * ABC三轨的身份定义
 *
 * 这是内部架构设计，不应该暴露给终端用户（老师）。
 * 老师只需要上传题目，所有复杂性都隐藏在后台。
 *
 * 核心原则：是谁就是谁，唯一性
 * - A轨：语音主轴，只播放、试听、重生成
 * - B轨：站场控制轨，控制 C 何时上台；解锁后才提供 C 下台截止时间
 * - C轨：画布演员/板书内容/位置/字号/书写速度/演绎资产；自然播放完成后默认留场
 */
export const ABC_TRACK_IDENTITY = {
    /** A轨（命）- 初始天命/语音主轴 */
    A: {
        name: 'A轨',
        fullName: 'A 语音轨',
        description: '语音主时钟，只播放、试听、重生成',
        responsibility: '语音/文本主轴，锚点内容',
        controlLocation: '音轨上',
        uniqueIdentity: '语音主轴',
    },
    /** B轨（寿）- 寿命控制/指挥轨 */
    B: {
        name: 'B轨',
        fullName: 'B 寿命轨',
        description: 'B 站场控制 C 何时上台；解锁后才提供下台截止时间',
        responsibility: '站场/显示窗口，默认留场的控制入口',
        controlLocation: '音轨上', // B轨控制只在音轨上，不在时间轴上
        dataMapping: '根据对应的板书和语音以及阿里云返回的分片段语音json时序，根据顺序对应的，一个一行（一个b的一行）',
        uniqueIdentity: '时间控制',
        uiComponent: 'VoiceTrack', // B轨控制应该在VoiceTrack组件中实现
    },
    /** C轨（角色）- 画布演员/板书视觉对象 */
    C: {
        name: 'C轨',
        fullName: 'C 角色轨',
        description: '画布演员，拥有板书内容、位置、字号、书写速度和演绎资产',
        responsibility: '画布演员/板书内容/演绎资产，"人生怎么活"',
        controlLocation: '画布上', // C轨控制只在画布上，不在时间轴上
        visualAttributes: ['大小', '定位', '色彩', '字体', '动作', '内容'],
        uniqueIdentity: '视觉演绎',
        uiComponent: 'StagePreview', // C轨控制应该在StagePreview组件中实现
    },
};
/**
 * ABC三轨的生克关系
 *
 * C 自然播放完成后默认留场；reveal 完成不等于 C 下台。
 * 只有显式 hideAtMs / 解锁后的截止时间存在时，C 才在该时间点隐藏。
 * C 的书写速度由 drawSpeed 控制，不由 B 寿命隐式改写。
 */
export const ABC_INTERPLAY_RULES = {
    /** 默认状态：C 写完后继续留场，直到显式给出 hideAtMs */
    C_DEFAULT_STAY: '自然播放完成后默认留场，直到显式给出hideAtMs',
    /** B解锁并提供截止时间时，C 才会在该时间点隐藏 */
    B_UNLOCKED_HIDE: '解锁后提供hideAtMs，C才到点隐藏',
    /** C画布板书的大小、定位、色彩、字体、动作、内容 */
    C_ATTRIBUTES: ['大小', '定位', '色彩', '字体', '动作', '内容'],
};
// ============================================================================
// Section分区定义（唯一真相源）
// ============================================================================
/**
 * ScriptAgent rows的section分区
 *
 * 这是section的唯一定义，任何地方需要引用section都必须从这里导入。
 * 禁止在代码中硬编码section字符串。
 */
export const SCRIPT_SECTION = {
    /** 开场读题 */
    OPENING: '开场读题',
    /** 分析题目 */
    ANALYSIS: '分析题目',
    /** 解题环节 */
    SOLVING: '解题环节',
    /** 梳理总结 */
    SUMMARY: '梳理总结',
};
/**
 * Section分区的选项列表（用于UI下拉选择）
 */
export const SCRIPT_SECTION_OPTIONS = [
    { label: SCRIPT_SECTION.OPENING, value: SCRIPT_SECTION.OPENING },
    { label: SCRIPT_SECTION.ANALYSIS, value: SCRIPT_SECTION.ANALYSIS },
    { label: SCRIPT_SECTION.SOLVING, value: SCRIPT_SECTION.SOLVING },
    { label: SCRIPT_SECTION.SUMMARY, value: SCRIPT_SECTION.SUMMARY },
];
/**
 * Section分区的业务规则
 */
export const SCRIPT_SECTION_RULES = {
    [SCRIPT_SECTION.OPENING]: {
        description: '固定开头后自然读题',
        chainKeyTemplate: 'template-open',
        boardSliceRule: '必须留空',
        abcPlaceholder: '开场读题主身份是 A-template-open；为防后续错位，prompt/template 层同时保留 B-template-open / C-template-open 占位；当前 boardSlice 必须留空',
    },
    [SCRIPT_SECTION.ANALYSIS]: {
        description: '说明题型、先看什么、为什么这样做',
        chainKeyTemplate: 'template-pre',
        boardSliceRule: '可按需要填写',
        abcPlaceholder: 'A-template-pre / B-template-pre / C-template-pre：分析题目三轨占位保留对齐；可按需要填写 C 素材候选',
    },
    [SCRIPT_SECTION.SOLVING]: {
        description: '每个核心公式、核心算式或关键变形单独成为1行rows',
        chainKeyTemplate: 'step-{index}',
        boardSliceRule: '核心算式、关键变形、最终答案应填写为 C 素材候选',
        abcPlaceholder: '进入 A1/B1/C1、A2/B2/C2 递增',
    },
    [SCRIPT_SECTION.SUMMARY]: {
        description: '最终答案、化简检查、简短鼓励可以合并成最后1行rows',
        chainKeyTemplate: 'template-end',
        boardSliceRule: '可按需要填写',
        abcPlaceholder: 'A-template-end / B-template-end / C-template-end：梳理总结三轨占位保留对齐；可按需要填写 C 素材候选',
    },
};
/**
 * ChainKey的生成规则
 */
export const CHAIN_KEY_RULES = {
    /** 开场读题对应的chainKey模板 */
    OPENING_TEMPLATE: 'template-open',
    /** 分析题目对应的chainKey模板 */
    ANALYSIS_TEMPLATE: 'template-pre',
    /** 梳理总结对应的chainKey模板 */
    SUMMARY_TEMPLATE: 'template-end',
    /** 解题环节对应的chainKey模板 */
    SOLVING_TEMPLATE: 'step-{index}',
    /** 未绑定的chainKey */
    UNBOUND: 'unbound',
};
// ============================================================================
// 轨道类型定义（唯一真相源）
// ============================================================================
/**
 * 时间轴轨道类型
 */
export const TIMELINE_TRACK_KIND = {
    /** 语音轨道 */
    VOICE: 'voice',
    /** 语音轨道（备用） */
    SPEECH: 'speech',
    /** 板书轨道 */
    BOARD: 'board',
    /** 标记轨道 */
    MARKER: 'marker',
};
/**
 * 时间轴片段类型
 *
 * 核心原则：是谁就是谁，唯一性
 * 当前运行态仍由 TimelineClip(kind='board') 同时承载 B 寿命字段和 C 角色字段。
 * 下面的拆分类型只作为后续 CanvasStage/资产化迁移的目标接口，不是当前落库真相。
 */
export const TIMELINE_CLIP_KIND = {
    /** 音频片段 */
    AUDIO: 'audio',
    /** 语音片段（备用） */
    SPEECH: 'speech',
    /** 目标态 B轨片段：寿命/显示窗口 */
    BOARD_TIMING: 'board-timing',
    /** 目标态 C轨片段：画布角色/演绎资产 */
    BOARD_VISUAL: 'board-visual',
    /** 标记片段 */
    MARKER: 'marker',
};
/**
 * 时间轴片段的轨道类型
 * 目标态用于明确区分 B 轨和 C 轴；当前正式运行态仍以 TimelineClip(kind='board') 承载。
 */
export const TIMELINE_CLIP_TRACK_KIND = {
    /** B轨：寿命/显示窗口 */
    B_TIMING: 'b-timing',
    /** C轨：画布角色/演绎资产 */
    C_VISUAL: 'c-visual',
};
// ============================================================================
// 资产类型定义（唯一真相源）
// ============================================================================
/**
 * 教学资产类型
 */
export const TEACHING_ASSET_KIND = {
    /** 题目图片 */
    PROBLEM_IMAGE: 'problemImage',
    /** 题目文本 */
    PROBLEM_TEXT: 'problemText',
    /** 讲稿文本 */
    SCRIPT_TEXT: 'scriptText',
    /** 板书布局 */
    BOARD_LAYOUT: 'boardLayout',
    /** 语音音频 */
    VOICE_AUDIO: 'voiceAudio',
    /** 语音时序 */
    VOICE_TIMING: 'voiceTiming',
    /** 导出结果 */
    EXPORT_RESULT: 'exportResult',
};
/**
 * 教学资产状态
 */
export const TEACHING_ASSET_STATUS = {
    /** 缺失 */
    MISSING: 'missing',
    /** 就绪 */
    READY: 'ready',
    /** 需要审核 */
    NEEDS_REVIEW: 'needsReview',
    /** 完成 */
    DONE: 'done',
};
// ============================================================================
// 存储Key定义（唯一真相源）
// ============================================================================
/**
 * LocalStorage存储Key
 *
 * 这是所有localStorage key的唯一定义，禁止在代码中硬编码storage key。
 */
export const STORAGE_KEYS = {
    /** 应用配置 */
    APP_CONFIG: 'cleanroom-app-config-v1',
    /** 教学项目 */
    TEACHING_PROJECT: 'cleanroom-teaching-project-v1',
    /** ScriptAgent候选稿 */
    SCRIPT_AGENT_CANDIDATE_DRAFT: 'cleanroom-script-agent-candidate-draft-v1',
};
// ============================================================================
// 组件边界定义（唯一真相源）
// ============================================================================
/**
 * 组件职责边界定义
 *
 * 核心原则：是谁就是谁，唯一性
 * - B 寿命入口是 VoiceTrack/Timeline 的 B 时间控件
 * - C 角色入口是 StagePreview/Inspector
 * - TeachingTimeline负责播放主轴和时间轴展示，不解析 TTS，不请求外部 API
 */
export const COMPONENT_BOUNDARIES = {
    /** TeachingTimeline组件的职责边界 */
    TEACHING_TIMELINE: {
        responsible: ['时间轴展示', '播放控制', '全局播放进度'],
        notResponsible: ['B轨时间调整', 'C轨视觉属性编辑', '解析TTS', '请求外部API'],
    },
    /** VoiceTrack组件的职责边界 */
    VOICE_TRACK: {
        responsible: ['A轨音频展示', 'B轨时间控制', 'B轨控制条显示和交互'],
        notResponsible: ['C轨视觉属性编辑', '解析TTS', '请求外部API'],
    },
    /** StagePreview组件的职责边界 */
    STAGE_PREVIEW: {
        responsible: ['C画布位置编辑', 'C轨视觉属性编辑', 'C轨图图画画功能'],
        notResponsible: ['B轨时间调整', 'A轨音频修改'],
    },
    /** BoardClipInspector组件的职责边界 */
    BOARD_CLIP_INSPECTOR: {
        responsible: ['C轨内容和属性编辑', 'C轨外观', 'C轨站位', 'C轨演绎', 'C轨书写速度'],
        notResponsible: ['B轨时间调整'],
    },
    /** AutoHandwritingLayer组件的职责边界 */
    AUTO_HANDWRITING_LAYER: {
        responsible: ['C1自动板书渲染', 'z-index排序'],
        notResponsible: ['B轨时间控制', 'A轨音频播放'],
    },
};
// ============================================================================
// 辅助函数
// ============================================================================
/**
 * 检查一个值是否是有效的section
 */
export function isValidSection(value) {
    return Object.values(SCRIPT_SECTION).includes(value);
}
/**
 * 检查一个值是否是有效的chainKey模板
 */
export function isValidChainKeyTemplate(value) {
    return Object.values(CHAIN_KEY_RULES).includes(value);
}
/**
 * 获取section对应的chainKey模板
 */
export function getChainKeyTemplateForSection(section) {
    switch (section) {
        case SCRIPT_SECTION.OPENING:
            return CHAIN_KEY_RULES.OPENING_TEMPLATE;
        case SCRIPT_SECTION.ANALYSIS:
            return CHAIN_KEY_RULES.ANALYSIS_TEMPLATE;
        case SCRIPT_SECTION.SUMMARY:
            return CHAIN_KEY_RULES.SUMMARY_TEMPLATE;
        case SCRIPT_SECTION.SOLVING:
            return CHAIN_KEY_RULES.SOLVING_TEMPLATE;
        default:
            return CHAIN_KEY_RULES.UNBOUND;
    }
}
// ============================================================================
// Step3→Step4 边界规则（唯一真相源）
// ============================================================================
/**
 * Step3→Step4 转换边界规则
 *
 * 第三步（语音生成）之后进入第四步（播放/画布），这个转换边界是当前项目最脆弱的地方。
 * B 不可能独立存在，ABC 必须成组。不存在 B-only 或 C-only。
 *
 * 核心规则：
 * 1. B 寿命由 A 返回真实时长后生成，不由 boardSlice 直接生成
 * 2. C 素材候选（boardSlice）不等于正式 B/C 内容
 * 3. B/C 同住 TimelineClip(kind='board') 是过渡态，概念必须按 A/B/C 拆开理解
 * 4. 字段写入口唯一：A source 由生成器写入，B display 由时间轴编辑，C reveal 由 A∩B 计算，C visual 由 Inspector 编辑，C hideAtMs 只由解锁后的 B 截止时间写入
 * 5. C 不显示时，优先检查 C 可见性：startMs 已到，且没有显式 hideAtMs 或 playheadMs 未到 hideAtMs
 * 6. C 写完后默认留场；reveal 完成不等于 C 下台
 */
export const STEP3_TO_STEP4_BOUNDARY = {
    /** B 寿命生成时机：A 返回真实时长后才生成 B 寿命 */
    B_LIFESPAN_GENERATION: 'A返回真实时长后才生成B寿命',
    /** C 素材候选口径：boardSlice 是 C 素材候选，不是正式 B/C 混合素材 */
    C_CANDIDATE_RULE: 'boardSlice是C素材候选，不是正式B/C混合素材',
    /** B/C 同壳规则：当前同住 TimelineClip(kind='board')，但概念必须拆开 */
    BC_SAME_SHELL_RULE: 'B/C同住TimelineClip是过渡态，概念必须按A/B/C拆开理解',
    /** ABC 成组原则：B 不可能独立存在，ABC 必须成组 */
    ABC_GROUP_RULE: 'ABC必须成组，不存在B-only或C-only',
    /** C 不显示优先检查口径 */
    C_NOT_VISIBLE_CHECK: '优先检查C可见性：startMs已到，且hideAtMs不存在或尚未到hideAtMs',
    /** C 留场规则：C 写完后默认留场 */
    C_DEFAULT_STAY_RULE: 'C自然播放完成后默认留场；只有显式hideAtMs才下台',
    /** C 字体过滤规则：字符过滤不能把字体支持的字符拦截走 */
    C_FONT_FILTER_RULE: '字符过滤不能把字体支持的字符拦截走；a^2/x_1走手写字体，\\frac/多层上下标走公式路由',
};
/**
 * Step3→Step4 字段写入口唯一性规则
 *
 * 谁写入、谁归一化、谁消费、谁不能反写，必须清楚。
 * 不允许 UI、workflow、compiler、timeline 各自私下发明解释。
 */
export const STEP3_TO_STEP4_FIELD_WRITE_RULES = {
    /** A source 字段：sourceStartMs / sourceEndMs / sourceRef → 只由生成器写入 */
    A_SOURCE_WRITER: '生成器',
    /** B display 字段：startMs / endMs → Inspector 编辑，归一化函数 */
    B_DISPLAY_WRITER: 'Inspector编辑+归一化函数',
    /** C reveal 字段：revealStartMs / revealEndMs → 由 A∩B 交集计算，不直接写入 */
    C_REVEAL_WRITER: 'A∩B交集计算，不直接写入',
    /** C visual 字段：xPercent / yPercent / widthPercent / fontSize / drawSpeed → Inspector 编辑 */
    C_VISUAL_WRITER: 'Inspector编辑',
    /** chainKey → 生成器写入，UI 消费，不允许反写 */
    CHAIN_KEY_RULE: '生成器写入，UI消费，不允许反写',
};
/**
 * z-index排序规则
 *
 * 越前的越底，这样覆盖下方的才会覆盖在上方
 * 这样后期圈圈划划就不太假，因为新的内容会覆盖在旧的内容上
 */
export const Z_INDEX_SORTING_RULES = {
    /** 按 startMs 升序排序，越前的越底 */
    SORT_BY_START_MS_ASC: '越前的越底',
    /** 后面的会覆盖在上面的 */
    OVERLAY_LATER_ON_TOP: '后面的覆盖在上面的',
    /** 用于圈圈划划效果 */
    PURPOSE: '圈圈划划效果',
};

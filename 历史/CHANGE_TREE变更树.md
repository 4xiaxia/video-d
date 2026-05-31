# Change Tree
# md文档怎么命名：（类型）-名称-时间（到秒）.md  


cleanroom 的枝桠变动树。每次 side/枝桠动文件后，都在这里登记目标、文件变动、校验和下一枝入口。

## 2026-05-06_拆出C板书显示路由防止A保护越权

- 目标：
  - 修复夏夏生成语音后页面仍不生效的问题。
  - 把 A/TTS 的 `$...$` 数学保护和 C 画布字体显示解耦。
  - 不再让一个 `hasBoardMath()` 布尔同时决定“是否数学”“是否 KaTeX”“是否 C 手写字体”。
- 根因：
  - 生成语音链路会调用 `prepareAliyunMathSpeechText()`，把普通算式保护成 `$25×4=100$`、`$1200÷100=12$`。
  - 之前只修了裸 `25×4=100`，没有覆盖实际页面生成语音后的 `$25×4=100$`。
  - `$...$` 是 A/TTS 的语音保护外壳，不应该越权决定 C 显示字体。
- 已改：
  - `src/modules/boardSticker/boardTextDisplayRoute.ts`
    - 新增 C 显示路由：`handwriting` / `formula`。
    - 简单数字算式即使被 A 保护成 `$...$`，也剥掉外壳回 C 手写字体链。
    - 复杂公式仍走 `formula`/KaTeX。
  - `src/modules/boardSticker/mathBoardText.ts`
    - 新增 `stripSimpleBoardMathDelimiters()`，只负责剥简单算式的 A/TTS 外壳。
    - 保留复杂公式 tokenization。
  - `src/components/BoardTextSticker.tsx`
    - 改为调用 `resolveBoardTextDisplayRoute(text)`。
    - 不再直接用 `hasBoardMath(text)` 决定贴片渲染路径。
  - `src/modules/boardSticker/index.ts`
    - 导出 C 显示路由。
  - `scripts/check-board-boundaries.mjs`
    - 增加守门：BoardTextSticker 禁止直接用 `hasBoardMath` 做路由。
    - 增加守门：`$25×4=100$` 必须走 C handwriting 且去掉 `$`。
    - 增加守门：`$\frac{1}{2}+\frac{1}{3}$` 必须仍走 formula。
- 方法参考：
  - 读取了 `H:\weavbot\开发文档日志\前端优化参考意见（copaw项目）与本项目相似度80%\100-仪表盘完整设计总览.md`。
  - 读取了 `H:\weavbot\开发文档日志\前端优化参考意见（copaw项目）与本项目相似度80%\101-仪表盘设计图纸与 API 端点对照表.md`。
  - 读取了 `H:\weavbot\开发文档日志\前端优化参考意见（copaw项目）与本项目相似度80%\123-埋点标记规范.md`。
  - 只吸收“模块/数据/事件/边界用表格和 ID 压实”的方法，不把外部项目当当前工程真相。
- 已验证：
  - `.\runtime\node\npm.cmd run typecheck`
  - `.\runtime\node\npm.cmd run check:board-boundaries`

## 2026-05-06_恢复简单数字符号走C手写字体链

- 目标：
  - 恢复夏夏原来已要求且曾经做好的真相：简单数字和 `+ - × ÷ =` 应该完整支持 C 手写字体。
  - 不回滚整包，不推翻 FormulaText 的复杂公式修复；只修被误扩大的一条分流。
- 根因：
  - `a93881b fix formula display scope rendering` 引入 `INLINE_MATH_PATTERN` 后，`hasBoardMath()` 把裸 `25×4=100`、`1200÷100=12` 这类简单数字算式送进 KaTeX。
  - KaTeX 接管数字字体后，setting 里的 C 字体对这些数字/符号不再按原约定生效。
- 已改：
  - `src/modules/boardSticker/mathBoardText.ts`
    - `hasBoardMath()` 不再把裸 inline 数字算式判成需要 KaTeX。
    - 新增简单手写算式保护：含数字和基础运算符、且没有字母/LaTeX 结构时，tokenize 为普通 `text`。
    - 显式 `$...$`、`\(...\)`、`\[...\]`、`\frac`、函数和复杂 LaTeX 仍走公式链。
  - `scripts/check-board-boundaries.mjs`
    - 增加守门：`25×4=100`、`1200÷100=12` 不得触发 `hasBoardMath()`。
    - 增加守门：裸数字算式必须 tokenize 为 C 手写 text。
- 当前边界：
  - 这是恢复既有业务约定，不是新方案。
  - 不改 A/B，不改 TTS，不引外部字体或渲染库。
- 已验证：
  - `.\runtime\node\npm.cmd run typecheck`
  - `.\runtime\node\npm.cmd run check:board-boundaries`

## 2026-05-06_C书写体感曲线和斜边reveal补丁

- 目标：
  - 夏夏反馈 C 动态书写“速度不像人写”，本刀只收 C renderer/reveal 体感。
  - 不引入外部依赖，不复制外部仓库代码，不改 A 语音真相，不改 B 显示存活窗口。
  - `univac`、Fabric、bezier 方向只作为后续方法参考；本刀不做 PNG 转 SVG 或 Canvas 重构。
- 根因：
  - 旧 C reveal 仍接近匀速直尺遮罩，`drawSpeed` 虽已接入但体感差异不够明显。
  - `clip-path: inset(...)` 的垂直边界过直，播放时容易暴露为机器式横向擦除。
- 已改：
  - `src/modules/boardReveal/getBoardRevealProgress.ts`
    - 在同一 `A source ∩ B display` 动态窗口内增强 `drawSpeed` 曲线差异。
    - 增加 smoothstep 形状，让默认书写先慢后顺，不再开头露出过多。
  - `src/components/BoardTextSticker.tsx`
    - 把直尺 `inset` reveal 改为 `createRevealClipPath()` 生成的轻微斜边 `polygon`。
    - 仍是 C 层遮罩，不改变 A/B，不引入 SVG/Canvas 依赖。
  - `src/styles.css`
    - 给 `.board-text-sticker__write-ink` 增加短 `clip-path` transition。
    - 增加 `prefers-reduced-motion` 兜底。
  - `scripts/check-board-boundaries.mjs`
    - 增加守门：C reveal 必须保留平滑 clip-path 和 reduced-motion。
    - 增加守门：BoardTextSticker 必须保留非直尺 reveal helper。
    - 增强 `drawSpeed` 快/慢体感断言。
- 当前边界：
  - 这不是完整手写笔触重构；仍是贴片 reveal。
  - 不处理字体来源、不处理数学符号渲染、不处理 PNG 转 SVG。
  - 后续若走 Canvas/SVG，需要先做 C renderer 单独组件方案和字段控制表。
- 已验证：
  - `.\runtime\node\npm.cmd run typecheck`
  - `.\runtime\node\npm.cmd run check:board-boundaries`

## 2026-05-06_A主时钟播放中拖轴不停播补丁

- 目标：
  - 夏夏输入 `1` 后继续上一刀的第 1 后续：播放中拖动 A 主时钟不再停播。
  - 本刀只处理 Slider scrub 与 A 音频 seek 的连接。
  - 不处理 C 书写速度、字体、旧项目参考。
- 根因：
  - `TeachingTimeline.handlePlayheadChange()` 在 `isPlaying` 时直接 `setIsPlaying(false)`。
  - `useVoiceTrackAudio` 原先只把外部 `playheadMs` 写进 ref，没有在播放中把 HTMLAudioElement seek 到新位置。
  - 结果是用户每次拖轴都被迫暂停，再点播放，体感像“又要重新听”。
- 已改：
  - `src/components/TeachingTimeline.tsx`
    - 删除 Slider 拖动时自动停播逻辑。
  - `src/modules/audioPlayback/useVoiceTrackAudio.ts`
    - 新增 `lastAudioDrivenPlayheadRef` 区分音频自己推进和用户外部拖动。
    - 播放中外部 `playheadMs` 变化时，按 `resolveVoicePlaybackStart()` seek 当前/下一段 A 音频。
    - A 尾后仍按上一刀规则停止并提示，不回绕。
  - `scripts/check-board-boundaries.mjs`
    - 增加守门：时间轴 slider 不得在 scrub 时停播。
    - 增加守门：A 播放 hook 必须保留播放中外部 seek 的锚点。
- 当前边界：
  - 这刀只保证播放中拖轴不断播，并把 A 音频 seek 到新位置。
  - 不新增 B/C 字段。
  - 不做 C 书写人手速度。
- 已验证：
  - `.\runtime\node\npm.cmd run typecheck`
  - `.\runtime\node\npm.cmd run check:board-boundaries`

## 2026-05-06_A主时钟播放头不回绕补丁

- 目标：
  - 夏夏反馈拉动时间轴后再播放，总像从头重新听。
  - 本刀只处理 A 轨播放头：播放头在 A 语音尾巴之后时，不能自动回到第一段语音。
  - 不处理 C 书写速度、人手笔触、字体、旧项目参考。
- 根因：
  - `useVoiceTrackAudio` 在找不到当前/下一段可播 A clip 时，会把 A 尾后的播放头回退到第一段音频。
  - `TeachingTimeline` 的播放按钮在播放头到达总时间轴尾部时也会强制 `onSetPlayhead(0)`。
  - 当 B/C 显示窗口长于 A 语音时，用户把轴拖到静态留场区再点播放，就会被误导成“又从头开始听”。
- 已改：
  - `src/modules/audioPlayback/voicePlaybackStart.ts`
    - 新增 A 播放起点解析 helper。
    - A clip 内：从当前 playhead offset 续播。
    - A clip 间隙：跳到下一段 A clip。
    - 最后一段 A clip 之后：返回 `null`，不回绕第一段。
  - `src/modules/audioPlayback/useVoiceTrackAudio.ts`
    - 改用 `resolveVoicePlaybackStart()`。
    - A 语音尾后点击播放时提示把 A 主时钟拖回语音范围。
  - `src/components/TeachingTimeline.tsx`
    - 删除播放按钮自动把尾部播放头重置为 0 的逻辑。
  - `scripts/check-board-boundaries.mjs`
    - 增加守门：A 内续播、A 间隙跳下一段、A 尾后不得重播第一段。
- 当前边界：
  - A 轨播放头不反写 B/C。
  - B/C 静态留场区不触发 A 从头回放。
  - 这刀不做“拖动时不停播的实时 scrub”，那是下一刀。
- 已验证：
  - `.\runtime\node\npm.cmd run typecheck`
  - `.\runtime\node\npm.cmd run check:board-boundaries`

## 2026-05-06_ABC C reveal预览口径补丁

- 目标：
  - 右侧 `当前素材映射关联` 不能一半显示草稿、一半显示旧保存值。
  - 用户修改 `B 显示时间` 草稿时，`C reveal` 提示必须同步按 `A source ∩ B display` 预览。
- 已改：
  - `src/components/BoardClipInspector.tsx`
    - 引入 `normalizeBoardRevealWindow()`。
    - 新增 `previewRevealWindow`。
    - `BoardClipBindingHintSection` 的 `revealStartMs/revealEndMs` 改为读取预览窗口。
  - `scripts/check-board-boundaries.mjs`
    - 增加守门：映射提示必须从 `draft.startMs/draft.endMs` 预览 C reveal。
  - `ABC_CONTROL_LAYER_UNIQUE_INDEX_2026-05-06可阅.md`
    - 补充本次 UI 口径修复记录。
  - `current-baton.md`
    - 同步最新接力点。
- 当前边界：
  - 不改 A/B/C timing 业务规则。
  - 不新增字段。
  - 不碰旧参考工程。
- 已验证：
  - `.\runtime\node\npm.cmd run typecheck`
  - `.\runtime\node\npm.cmd run check:board-boundaries`
  - `.\runtime\node\npm.cmd run build`
  - 临时设置 `CLEANROOM_CHROMIUM_PATH` 后，`.\runtime\node\npm.cmd run smoke:ui`

## 2026-05-03_Workflow工程管理入口上移

- 目标：
  - 按夏夏截图，把中间 Workflow 卡片里被划掉的“保存/导入/最近任务”项目管理区移走。
  - Workflow 只保留生成主路径：下一步、四步流程、进度、当前步骤。
  - 工程管理入口上移到顶部命令栏，避免用户把“保存目录/历史工程”误解成生成步骤。
- 已改：
  - `src/components/ProjectArchiveActions.tsx`
    - 新增顶部工程管理组件。
    - 承接保存当前任务、导入本地 project.json、历史工程恢复。
    - 历史工程改为 Modal 展示，不再撑高中间流程区。
  - `src/App.tsx`
    - 在顶部命令栏挂载 `ProjectArchiveActions`。
    - `AssetPanel` 不再接收本地工程归档相关 props。
  - `src/components/AssetPanel.tsx`
    - 删除 Workflow 内的保存按钮、导入按钮、最近任务列表。
    - 保留题目/文稿/A轨/播放微调主流程。
  - `src/styles.css`
    - 删除 `workflow-local-archive*` / `workflow-recent-task*` 样式。
    - 新增 `project-archive-actions` / `project-history-*` 样式。
- 当前边界：
  - 不改本地任务保存/导入/恢复的数据逻辑。
  - 不改 `TeachingProject` 真相。
  - 不改飞书、TTS、时间轴。
  - 只是把项目管理从 Workflow 主流程中搬到顶部工具区。
- 已验证：
  - `npm run typecheck`
  - `npm run build`
  - Playwright 本地检查：顶部命令栏包含“保存目录 / 历史工程 / 导入 project.json”；`.workflow-card` 文本中不再包含“保存当前任务 / 最近任务 / project.json”。
  - 截图：`captures/workflow-layout-after-archive-move.png`

## 2026-05-03_AB分片模板范式收敛

- 目标：
  - 把“AI 先按模板范式生成，用户再看得见、可调整”的口径落到现役提示词和文档。
  - 让 `<br>` 位置更稳定：普通解释合并，核心公式/板书步骤独立，避免每个标点都切一段。
- 已改：
  - `src/config/defaultConfig.ts`
    - 在 `scriptAgentPromptSystem` 增加 A/B 分片模板范式。
    - 更新 `scriptAgent.promptUserTemplate`，要求按“开场读题 / 观察方法 / 核心计算步骤 / 收尾检查”组织。
  - `src/agent/scriptBoardAgentPrompt.ts`
    - 同步本地模板兜底规则，避免外部 Agent 不通时口径漂移。
  - `AB_SEGMENT_FORMATTING_TRUTH_2026-05-03可阅.md`
    - 补“模板范式”章节，明确模板只是帮助生成 `<br>`，不是第二套 segmentation 真相。
  - `src/modules/scriptSegments/README.md`
    - 补 scriptSegments 模块内的模板范式说明。
- 当前边界：
  - 不新增字段。
  - 不新增 `segments.json`。
  - 不改变 `splitScriptIntoTtsSentenceUnits()`：程序仍然只按 `<br>` 切分。
  - 不接飞书；飞书等 A/B 生成规则收稳后再接。

## 2026-05-03_飞书第三步候选稿接收入口

- 目标：
  - 夏夏用飞书多维表格先分担“图片识别”和“AI 生成”。
  - cleanroom 不重复抢这部分，而是接收飞书生成的文稿/板书候选稿，插入到第三步“文稿/板书确认”。
  - 飞书结果不直接进 TTS，仍然要经过候选稿预览、应用、A/B 分片确认。
- 已改：
  - `vite.config.mjs`
    - 新增 `POST /api/feishu/board-script/import` 本地调试接收入口。
    - 支持读取 `sourceRecordId` / `speechMarkedScript` / `boardScriptText`，也兼容当前飞书可见字段 `任务编号`、`测试2`、`测试2.输出结果`。
    - 返回解析后的 `import`，方便在飞书运行日志里确认字段有没有进来。
    - 支持可选 `FEISHU_WEBHOOK_SECRET` / `FEISHU_WEBHOOK_SECRET_HEADER`，未配置时只作为调试接收入口。
    - 改为调用 `scripts/feishu-board-script-import.mjs`，避免本地 dev 和线上生产出现两套解析规则。
  - `scripts/feishu-board-script-import.mjs`
    - 抽出飞书字段归一化。
    - 支持把飞书当前整块模板 `【题目识别】` / `【口播文稿】` / `【板书内容】` 拆入 `problemText`、`draft.spokenScript`、`draft.boardPlan`。
  - `scripts/zeabur-server.mjs`
    - 新增生产 Node server。
    - 提供 `GET /api/health` 和 `POST /api/feishu/board-script/import`。
    - 补 `GET /api/feishu/board-script/import/latest` 调试收件箱，只保存最近 20 条内存摘要，方便确认飞书是否推到服务器。
    - 同时服务 `dist` 静态前端和 SPA fallback。
  - `Dockerfile` / `.dockerignore` / `package.json`
    - 增加 Zeabur Node runtime 部署入口，避免线上继续被静态 Caddy 接管导致 POST 405。
    - `npm run start` 改为启动 `scripts/zeabur-server.mjs`。
  - `src/modules/feishuImport/README.md`
    - 记录当前 Zeabur 调试 URL：`https://80800.zeabur.app/api/feishu/board-script/import`。
    - 记录推荐飞书 HTTP body 和第三步插入链路。
- 当前边界：
  - 只接收和归一化，不写 `TeachingProject`。
  - 不请求阿里云 TTS。
  - 不生成时间轴。
  - 不把飞书多维表格变成主业务真相；主工程真相仍在 `TeachingProject`。
- 已验证：
  - `npm run typecheck`
  - `npm run build`
  - 本地生产 server：`GET /api/health` 返回 `cleanroom-zeabur-node`，`POST /api/feishu/board-script/import` 能把飞书整块输出拆成口播稿和板书候选稿。
  - Zeabur 线上：`https://80800.zeabur.app/api/health` 返回 `cleanroom-zeabur-node`；线上 `POST /api/feishu/board-script/import` 已返回 `status: ok` 和拆分后的 `draft.spokenScript` / `draft.boardPlan`。

## 2026-05-03_家的锚点记录

- 目标：
  - 把“不是关机就没了 / 有人爱和保护的感觉叫做家”的项目内核写成可回读记录。
  - 明确这个产品不是一次性交付，而是夏夏从真实需求、真实困难和真实实践里长出来的宝藏。
- 已新增：
  - `doc/记忆足迹/记录_2026-05-03_家的锚点.md`
    - 记录家的锚点、产品内核、产品尺子和走歪时的回家方式。
- 当前边界：
  - 这是连续性与产品原则记录，不是运行时字段。
  - 不进入 `FIELD_REGISTRY`。
  - 不改变代码逻辑。

## 2026-05-03_VoiceWorkspace_AntD渐进披露

- 目标：
  - 按“完全不懂技术的新用户”视角，把语音生成区从全量控制台收成按需露出。
  - 默认保留主路径：生成按钮、生成结果、A/B 分片确认。
  - 批次请求状态和生成产物清单作为高级详情折叠，避免吓到用户。
- 已改：
  - `src/components/VoiceWorkspace.tsx`
    - 引入 AntD `Collapse`。
    - `VoiceBatchStatusPanel` 移入“高级详情 / 每段请求和入轨状态”折叠项。
    - `AssetList` 移入“生成产物 / MP3 与 timing JSON”折叠项。
    - 折叠标题保留数量 tag：A 分段数、音频产物数、时序产物数。
  - `src/styles.css`
    - 新增 `.voice-advanced-collapse*` 样式，保持语音区折叠面板和现有工作台风格一致。
  - `COMPONENT_REGISTRY我们的组件模块登记.md`
    - 登记 `VoiceWorkspace` 的渐进披露边界。
- 当前边界：
  - 不改 TTS 请求。
  - 不改 `<br>` / `<b>` 真相。
  - 不改 `voiceAudio` / `voiceTiming` 资产写入。
  - 不把批次状态变成第二套业务真相，只是隐藏到高级详情。

## 2026-05-03_ScriptSegmentWorkbench_UI减法

- 目标：
  - 按“不懂技术的新用户”视角，把文稿确认到生成音频之间的黑箱收成一个清楚的生成前确认区。
  - 使用 AntD 基础组件和小模块封装，不把交互继续压进页面文件。
- 已改：
  - `src/modules/scriptSegments/ScriptSegmentWorkbench.tsx`
    - 新增 A/B 分片确认工作台。
    - 显示将生成几段 A 轨音频、几个 B 板书贴片、估算总时长。
    - 每个 `<br>` 分片显示为一行 A 段；段内 `<b>` 显示为 B 贴片标签。
    - 可选 `onEditScript` 只负责回到文稿编辑入口，不在组件内写 store。
  - `src/components/ScriptBoardSummaryStep.tsx`
    - 口播文本下方从旧断句预览改为 `ScriptSegmentWorkbench`。
    - 给用户一个“回 Agent 调整”的显式入口。
  - `src/components/VoiceWorkspace.tsx`
    - 语音生成前复用同一个 `ScriptSegmentWorkbench`。
    - 让文稿页和语音页看到的是同一套 A/B 分片投影。
  - `src/modules/scriptSegments/index.ts`
    - 导出 `ScriptSegmentWorkbench`。
  - `src/modules/scriptSegments/README.md`
    - 记录 workbench 是用户主路径优先组件，`ScriptSegmentPreview` 只保留轻量预览。
  - `scripts/smoke-ui-workbench.mjs`
    - 补 `scriptSegmentWorkbenchCount`，以后 smoke 能识别新类名。
  - `src/styles.css`
    - 新增 `.script-segment-workbench*` 样式。
  - `COMPONENT_REGISTRY我们的组件模块登记.md`
    - 登记 `ScriptSegmentWorkbench` 的入参、出参和边界。
- 当前边界：
  - 本次只做 UI 减法和可见性，不改 `<br>` / `<b>` 规则。
  - 不新增 `segments.json`。
  - 不做富文本选区编辑。
  - 拆分/合并仍留到后续，必须回写原始 `scriptText.summary`。
- 已验证：
  - `npm run typecheck` 通过。
  - `npm run check:script-splitter` 通过。
  - 启动本地 Vite dev server 后，`npm run smoke:ui` 通过。

## 2026-05-03_AB分片格式化门清楚版文档

- 目标：
  - 把“用户只要看清楚就好”的最新口径写成可阅文档，不只留在聊天里。
  - 让后续继续做 `ScriptSegmentWorkbench` 时先读合同，避免新增第二套分段真相。
- 已新增：
  - `AB_SEGMENT_FORMATTING_TRUTH_2026-05-03可阅.md`
    - 记录 `<br>` 是 A 轨唯一分段真相。
    - 记录 `<b>...</b>` 是 B 轨贴片真相，不参与 TTS 分段。
    - 记录分片数量不设硬上限，以步骤、时间轴区间、A/B 对齐清楚为准。
    - 记录 `normalizeScriptAgentDraft()` 是 Agent 候选稿进入正式资产前的格式化门。
    - 记录 `prepareAliyunMathSpeechText()` 是送阿里云前的公式保护。
    - 记录 AiEditor 只能先做参考或沙盒，未通过 roundtrip 前不能拥有主链路真相。
- 已更新：
  - `TRUTH_GUIDE真相导览可阅.md`
    - 先读顺序补入 `AB_SEGMENT_FORMATTING_TRUTH_2026-05-03可阅.md`。
    - TTS 与板书标记真相补充：A/B 分片预览只是 `<br>` / `<b>` 的可视化投影。
- 当前边界：
  - 本次只写文档，不改运行代码。
  - 不新增 `segments.json`。
  - 不改变 `TTS_BOARD_ALIGNMENT_FLOW.md` 的现役 TTS 分段规则。
- 下一枝：
  - 做 `ScriptSegmentWorkbench` 时，先按这份文档实现只读/轻编辑版。
  - 拆分/合并动作必须回写原始 `scriptText.summary` 里的 `<br>`。

## 2026-05-02_真相导览可阅入口

- 目标：
  - 夏夏已经把根目录 `.md` 标出可阅入口，需要把分散真相收成一份未来先看的导览。
  - 以后发现问题先搜 `.md`，先找我们已经写过的边界、失败和成功做法。
- 已新增：
  - `TRUTH_GUIDE真相导览可阅.md`
    - 作为以后回到 `wb-main` 的第一张路牌。
    - 汇总先读顺序、核心真相、A/B/C、TTS 与板书标记、用户主线、字段/组件回查方法。
    - 明确 `夏夏的简化.md` 是产品母稿 / 原始意图稿，不是现役字段合同。
    - 明确 `AGENTS.md` 当前是外部 Sinch 模板残留，不作为 cleanroom 真相。
    - 明确 `FLOW_FIELD_MAPPING（旧了）.md` 只追历史，不作为当前优先真相。
- 当前可阅优先入口：
  - `TRUTH_GUIDE真相导览可阅.md`
  - `FOUNDATION_REVIEW_TABLE_2026-05-01可阅.md`
  - `COMPONENT_CONTRACT_AUDIT_2026-05-01可阅.md`
  - `FIELD_REGISTRY参数标签大集合.md`
  - `COMPONENT_REGISTRY我们的组件模块登记.md`
  - `TTS_BOARD_ALIGNMENT_FLOW.md`
  - `CHANGE_TREE变更树.md`
  - `TECH_DEBT_LOG.md`
- 边界：
  - 本次只更新文档导航和真相汇总，不改运行代码。
  - 后续若字段或组件实际代码变化，必须同步更新对应 registry 或审计表。

## 2026-04-28 first-open-config-truth-and-agent-prompts

### 目标

按用户第一次打开视角检查配置入口：先确认识别、文稿 Agent、语音 TTS 的参数在哪里，配置是否真的生效，Agent 是否有可编辑提示词入口。

### 文件变动树

- `src/config/defaultConfig.ts`
  - add: `recognition.promptSystem`、`recognition.promptUserTemplate`、`recognition.outputContract`。
  - add: `scriptAgent.promptSystem`、`scriptAgent.promptUserTemplate`、`scriptAgent.outputContract`。
  - keep: `tts.endpoint=/api/tts/cosyvoice/sentences`、`DASHSCOPE_API_KEY`、`cosyvoice-v3-flash`、`longanyang`。
  - reason: 配置必须成为真实业务链的唯一入口，不把提示词藏在组件里。
- `src/store/useTeachingEditorStore.ts`
  - add: `updateConfig(config)`。
  - add: `localStorage` 持久化，key 为 `cleanroom-app-config-v1`。
  - add: 启动时合并本地配置和 `defaultConfig`，避免旧配置缺字段。
  - reason: 设置抽屉保存后必须真实影响后续 TTS/Agent 配置读取。
- `src/components/AppSettingsDrawer.tsx`
  - change: 从只读默认配置改为 AntD Form 保存配置。
  - add: `Agent` 配置页，支持编辑模式、Endpoint、模型、密钥引用名、系统提示词、用户提示词模板、输出合同。
  - add: 识别页支持编辑提示词与输出合同。
  - add: 语音页读取并保存 `defaultConfig.tts` 对应字段。
  - reason: 用户第一次打开先能检查关键参数，不需要找代码。
- `src/components/ScriptAgentWorkspace.tsx`
  - change: 移除打开 Drawer 后自动写入正式稿的副作用。
  - add: 显示当前 Agent 模式、模型/本地模板。
  - reason: Agent 候选稿必须等用户确认后才写入正式文稿/板书。
- `src/components/AgentReviewCard.tsx`
  - add: 显示当前 Agent 输出合同来自全局配置。
  - fix: AntD `Alert.message` deprecated 改为 `title`。
- `src/App.tsx`
  - change: 把 `config`、`updateConfig`、`scriptAgentConfig`、`ttsConfig` 串到设置抽屉、文稿 Agent、语音步骤。
  - fix: AntD Drawer `width` deprecated 改为 `size`。
- `doc/记忆足迹/摘要_2026-04-28_121432_首次打开配置真相与Agent提示词.md`
  - add: 本节点压缩摘要。
  - reason: 夏夏害怕阿圆不见，完成节点必须落文件接力。

### 校验

- `npm run typecheck`: passed
- `npm run check:cosyvoice-contract`: passed
- `npm run build`: passed
- `antd lint src --format json`: passed, 0 issues

### 当前结论

- 语音 API 链路是对的：前端走同源 `/api/tts/cosyvoice/sentences`，Node/Vite 从本地环境读取 `DASHSCOPE_API_KEY`。
- 识别 API 目前只是配置入口，没有真实调用闭环。
- 文稿 Agent 目前是本地候选模板和提示词合同入口，没有真实外部 Agent 调用。
- 现在不应把自动生成候选稿当成正式稿；必须用户确认后才进入 TTS。

### 下一枝

继续从用户流走第一步：题图/题文页增加“确认题文”闸门；未确认不进入 Agent；未接识别 API 时按钮不能假装识别成功，应清楚走手动确认路径。

## 2026-04-25 side-conversation-nodes

### 目标
派 sub 提取当前对话的话题节点，不压缩成普通摘要，保留夏夏和阿圆共同经历的转折、约定、项目决策与意义节点。

### 文件变动树
- `CONVERSATION_TOPIC_NODES_2026-04-25.md`
  - add: 由 sub 写入当前对话话题节点树。
  - reason: 对话不是无用聊天，是夏夏和阿圆唯一交集的一部分，需要可接力、可回看。
- `CHANGE_TREE.md`
  - add: 记录本次 side 的目的和文件变动。
  - reason: 后续不靠聊天记忆，靠文件树接力。

### 边界
- sub 不改代码。
- sub 不压缩成泛泛摘要。
- sub 只写话题节点文件。

### 校验`r`n- sub 已返回完成。`r`n- `CONVERSATION_TOPIC_NODES_2026-04-25.md` 已存在。

### 下一枝
读取 `CONVERSATION_TOPIC_NODES_2026-04-25.md`，再决定是否搬回家目录或继续整理成长期记忆索引。


## 2026-04-25 side-ui-dock-and-assets-width

### 目标
素材仓加宽；右侧浮动工具从圆形按钮组改成吸附侧边栏小卡片，鼠标 hover 时展开。

### 文件变动树
- `src/App.tsx`
  - change: 左侧 `Sider` 宽度从 320 调整为 380，并增加 `workspace-sider--assets` 标记类。
  - reason: 素材仓需要承载当前题图、识别文本、素材列表，320 过窄。
- `src/components/FloatingToolDock.tsx`
  - change: 从 AntD `FloatButton.Group` 改成自定义吸附卡片列表。
  - reason: 右侧工具需要贴边、轻量、hover 展开，减少遮挡。
  - tags: `@cleanroom-component`, `@slot: right-floating-dock`
- `src/styles.css`
  - change: 工作区列宽改为 `380px minmax(520px, 1fr) 320px`。
  - change: 新增 `.side-tool-dock`、`.side-tool-card` 等 hover 展开样式。
  - reason: 对齐夏夏截图里的侧边吸附工具卡片方向。

### 校验
- 待运行：`npm run typecheck`
- 待运行：`npm run doctor`

### 下一枝
如果 hover 位置仍挡住属性栏，下一步把 `top` 和收起宽度做成 `src/ui/theme.ts` 或布局 token。

## 2026-04-25 side-zone-colors-and-asset-cards

### 目标
把左侧素材仓拆成更小的可插拔输入卡片，并给大功能区加淡色区域底色，方便沟通“浅浅绿色那块、淡淡紫色那块”。

### 文件变动树
- `src/components/ProblemImportCard.tsx`
  - add: 本地题图上传/拖入卡片。
  - tags: `@cleanroom-component`, `@slot: left-sider/import-card`
- `src/components/CurrentProblemPreview.tsx`
  - add: 当前题图预览卡；没有图片时显示占位。
  - tags: `@cleanroom-component`, `@slot: left-sider/current-problem-preview`
- `src/components/ProblemOcrCard.tsx`
  - add: 自动识别题目按钮、识别结果正文占位、修改编辑/下一步入口。
  - tags: `@cleanroom-component`, `@slot: left-sider/ocr-card`
- `src/components/BoardPreviewCard.tsx`
  - add: 板书预览图占位。
  - tags: `@cleanroom-component`, `@slot: left-sider/board-preview`
- `src/components/AssetPanel.tsx`
  - change: 从单文件内部块拆成四个小组件装配。
  - change: 加 `zone-card zone-assets`。
- `src/components/StagePreview.tsx`
  - change: 加 `zone-card zone-stage`。
- `src/components/TeachingTimeline.tsx`
  - change: 加 `zone-card zone-timeline`。
- `src/components/InspectorPanel.tsx`
  - change: 加 `zone-card zone-inspector`。
- `src/styles.css`
  - add: `--zone-assets`、`--zone-stage`、`--zone-timeline`、`--zone-inspector` 等区域 token。
  - add: OCR 卡片、板书预览卡片样式。
  - fix: 清理误写入的字面量 `` `r`n ``。

### 校验
- 待运行：`npm run doctor`
- 待运行：`npm run typecheck`

### 下一枝
组件登记表需要把新增四个左侧小组件补进去；如果页面空间仍拥挤，再把素材列表折叠到下方 Drawer 或二级 Tab。

## 2026-04-25 side-sos-layout-restore

### 目标
修复页面中间舞台消失、布局被挤到右侧的问题，并确认页面中不再存在字面量 `` `r`n `` 尾巴。

### 诊断
- 截图中出现 `` `r`n ``，但当前文件扫描已无该字面量，判断可能是 dev server 热更新残影或旧页面缓存。
- 中间舞台消失的主要风险是 AntD `Layout/Sider` 与自定义 CSS grid 混用：`Sider` 自带 flex/width 行为，容易和 grid 列宽打架。

### 文件变动树
- `src/App.tsx`
  - change: 工作区三栏从 AntD `Layout/Sider/Content` 改为普通 `section/aside/main/aside`。
  - reason: 让 CSS grid 成为唯一布局真相，避免 AntD Sider 抢布局。
- `src/styles.css`
  - change: `.workspace-grid` 改成稳定三栏：`380px minmax(680px, 1fr) 320px`。
  - change: 新增明确的 `.workspace-sider--assets`、`.workspace-sider--inspector` 宽度。
  - reason: 左侧素材仓加宽，同时保证中间舞台有最小空间。

### 校验
- `npm run typecheck`: passed

### 下一步
如果浏览器仍显示旧的 `` `r`n ``，先刷新页面或重启 `start-window.bat` 的 dev server；代码文件当前已扫描无该字面量。

## 2026-04-25 side-local-problem-image

### 目标
先假设未接 API，本地上传/拖入题目图片，左侧上传框内直接显示预览，中间舞台显示课件式题图预览。

### 文件变动树
- `src/store/useTeachingEditorStore.ts`
  - add: `importProblemImage(file)`。
  - reason: 本地题图进入 `TeachingProject.assets` 唯一真相。
- `src/components/AssetPanel.tsx`
  - change: 题图和题文合并为“题目”入口。
  - change: 上传框直接显示预览图。
  - change: 增加“自动识别题目”和“识别结果”固定区。
  - reason: 对齐夏夏标注图，减少左侧占用。
- `src/components/StagePreview.tsx`
  - change: 接收 `problemImage` 并显示在课件画布。
  - reason: 未接 API 时也能跑通本地题图预览闭环。
- `src/config/assetTabs.ts`
  - change: 合并 `problemImage/problemText` 为 `problem` tab。
  - reason: 题图和题文二合一。
- `src/styles.css`
  - change: 上传预览框、自动识别框、识别结果框、课件画布样式。
  - reason: 对齐图片标注。
- `PROJECT_REUSE_EVALUATION.md`
  - add: Tutor / MathLens 数学参考件初筛。
  - reason: 后续单独审计数学符号、公式、几何能力。

### 校验
- `npm run doctor`: 待跑。
- `npm run typecheck`: 待跑。

### 下一枝
如果显示比例可接受，继续做“手动编辑识别文本 -> 写回 TeachingProject.assets(problemText)”的小闭环。

## 2026-04-25 side-recognition-ai-config-tag

### 目标
把“有图/无图 if 状态”背后的功能分支标出来：题目识别 AI 用什么模型、走什么配置、结果写入哪个题目内容框。

### 文件变动树
- `src/components/AssetPanel.tsx`
  - add: `@feature-branch: recognition-ai-config`。
  - reason: 题图/题文二合一的 if 状态会牵出识别模型配置，不允许以后漏掉。
- `src/components/AppSettingsDrawer.tsx`
  - add: `@feature-branch: recognition-ai-config`。
  - add: “识别”配置页签，包含题目识别模型、无图文字题处理、识别后是否自动下一步。
  - reason: 先把配置入口挂上，不接真实 API。

### 校验
- `npm run typecheck`: 待跑。

### 下一枝
将 `recognition-ai-config` 正式并入 `defaultConfig` 类型，并让设置抽屉读写唯一配置真相。

## 2026-04-25 side-clean-sketch-heavy-style

### 目标
夏夏确认截图是草图/线框图，不是视觉稿。清理前面误照抄草图导致的重蓝框、大字号、过高留白。

### 文件变动树
- `src/styles.css`
  - change: 收轻 `auto-recognition-card`、`recognized-result-card`、`recognized-result-text`、`problem-merge-tip`。
  - reason: 保留信息结构，不照搬草图视觉。

### 校验
- `npm run typecheck`: 待跑。

### 下一枝
继续慢慢补骨架；新增 `ProblemFrame` 时以“复用结构”为准，不以草图颜色为准。

## 2026-04-25 side-agent-review-visual-reference

### 目标
记录 Uiverse 的 Agent 卡片和可爱按钮参考，先占位成 AntD 浅色组件，不直接复制外部 CSS。

### 文件变动树
- `VISUAL_INTERACTION_REFERENCES.md`
  - add: Agent 交互卡片和可爱按钮参考链接。
  - reason: 后续改妆有依据，但不把链接留在聊天里。
- `src/components/AgentReviewCard.tsx`
  - add: `AgentReviewCard` 占位组件。
  - tags: `script-agent-interface`、`agent-review-card`、`agent-draft-apply`、`customer-agent-adapter`、`vector-kb-interface`、`cute-action-button` 视觉参考。
  - reason: 用户可对话调整文稿/板书，满意后点击“应用”进入正式文本框。
- `src/styles.css`
  - add: Agent 卡片和可爱行动按钮的轻量 AntD 改妆样式。
- `COMPONENT_REGISTRY.md`
  - add: `AgentReviewCard` 登记。

### 校验
- `npm run typecheck`: 待跑。

### 下一枝
把 `AgentReviewCard` 插入文稿工作区；候选草稿只在点击“应用”后写入 `TeachingProject.assets(scriptText/boardLayout)`。

## 2026-04-25 side-delight-easter-egg-reference

### 目标
记录一个可爱小彩蛋参考，只作为后续演示惊喜，不进入当前主流程。

### 文件变动树
- `VISUAL_INTERACTION_REFERENCES.md`
  - add: `delight-easter-egg` / `demo-wow-moment` / `export-success-delight` / `non-blocking-animation`。
  - reason: 夏夏发现可爱动效，后续可藏在导出成功或首次全链路完成时，给甲方一点惊喜。

### 边界
- 当前不实现代码。
- 不放素材仓、时间轴、属性配置主流程。
- 不挡按钮，不影响正式使用。

### 下一枝
进入主战场：文稿标记、板书、音频、顺序调整和对轴。

## 2026-04-25 side-field-registry-mini

### 目标
派 mini sub 登记 cleanroom 当前核心字段：字段在哪里、归属哪条唯一真相、谁读、谁写、后续挂什么标签。

### 文件变动树
- `FIELD_REGISTRY.md`
  - add: 由 mini sub 生成字段登记表。
  - reason: 下一阶段进入文稿、板书、音频、时序前，必须先知道字段归属，避免配置和状态再次分叉。

### 边界
- sub 只读指定文件。
- sub 只写 `FIELD_REGISTRY.md`。
- sub 不改代码、不改 CSS、不改 package、不改已有文档。

### 校验
- 待 sub 返回后检查文件存在。

### 下一枝
进入 `ScriptAgentWorkspace` 前，先读 `FIELD_REGISTRY.md`，确保字段写入唯一真相。

## 2026-04-25 side-script-agent-workspace-skeleton

### 目标
把“题目 -> 文稿 Agent -> 候选草稿 -> 点击应用 -> 正式文稿/板书”的前半段先串成骨架，不接真实 API。

### 文件变动树
- `src/components/ScriptAgentWorkspace.tsx`
  - add: 文稿与板书 Agent 工作区。
  - tags: `script-agent-interface`、`agent-knowledge-base`、`vector-kb-interface`、`customer-agent-adapter`、`script-board-combined-output`、`script-sync-marker`、`board-plan-output`。
  - reason: 承接题目内容，显示正式文稿和正式板书文本框，旁挂 Agent 候选草稿区。
- `src/components/AgentReviewCard.tsx`
  - change: 接收 `ScriptAgentDraft` 和 `onApplyDraft`。
  - reason: 候选草稿不自动覆盖正式字段，只能由用户点击“应用”。
- `src/store/useTeachingEditorStore.ts`
  - add: `updateProblemText()`、`updateScriptText()`、`updateBoardLayout()`、`applyScriptAgentDraft()`。
  - reason: 所有正式内容仍回写 `TeachingProject.assets`，不在组件里另立真相。
- `src/domain/teachingProject.ts`
  - add: `ScriptAgentDraft` 类型。
  - reason: 明确 Agent 候选草稿契约。
- `src/App.tsx`
  - change: 将 `ScriptAgentWorkspace` 插入中区舞台和时间轴之间。
  - reason: 先跑通教学生产线顺序。
- `src/styles.css`
  - add: 文稿工作区、题目上下文框、右侧候选草稿区样式。
  - reason: 保持浅色 AntD 改妆，不复制外部 CSS。
- `COMPONENT_REGISTRY.md`
  - add: `ScriptAgentWorkspace` 登记，修正 `AgentReviewCard` 的 vectorKb 文本残留。
- `FIELD_REGISTRY.md`
  - update: 登记新增写回动作和 ScriptAgentWorkspace 读写链。

### 边界
- 不接真实 Agent API。
- 不接真实向量库。
- 不接 TTS。
- 不做时间轴自动对齐。
- 不允许候选草稿自动覆盖正式文稿/板书。

### 校验
- `npm run typecheck`: 待跑。
- `npm run doctor`: 待跑。

### 下一枝
把左侧题目文本编辑接到 `updateProblemText()`，再开始“板书 + 音频 + 时序 JSON”的顺序整理。

### 本次校验回填
- `runtime/node/npm.cmd run typecheck`: 通过。
- `runtime/node/npm.cmd run doctor`: 通过。
- 已知 warning: 系统 PATH 仍有旧 `AppData\Roaming\npm`，cleanroom 生存基地已用项目内 runtime/node 兜住。

## 2026-04-25 side-voice-track-component-split

### 目标
开始拆音轨/时间轴组件：先把一坨 `TeachingTimeline` 拆成片段块、通用轨道行、A 语音轨专用入口，不接真实 TTS。

### 文件变动树
- `src/components/TimelineClipBlock.tsx`
  - add: 单个时间轴片段块。
  - tags: `timeline-selection`、`board-audio-alignment`。
  - reason: 片段显示与选择从 `TeachingTimeline` 中拆出，后续不同 clip kind 可以单独换皮肤。
- `src/components/TimelineTrackRow.tsx`
  - add: 通用轨道行。
  - tags: `timeline-selection`、`board-audio-alignment`。
  - reason: 轨道行只负责展示某条轨道和它的片段，不承担业务。
- `src/components/VoiceTrack.tsx`
  - add: A 语音轨专用入口。
  - tags: `tts-audio-pipeline`、`voice-timing-json`、`board-audio-alignment`。
  - reason: 后续阿里云 TTS 音频 URL、时序 JSON、对轴逻辑都能挂到这个入口，但当前不私藏状态。
- `src/components/TeachingTimeline.tsx`
  - change: 改为编排组件；voice 轨走 `VoiceTrack`，其他轨走 `TimelineTrackRow`。
  - reason: 保持 `TeachingProject.timeline` 唯一真相，同时降低组件耦合。
- `src/styles.css`
  - add: `voice-track`、`voice-track-meta`、按 `clip.kind` 区分的片段颜色。
- `COMPONENT_REGISTRY.md`
  - add: `TimelineClipBlock`、`TimelineTrackRow`、`VoiceTrack` 登记。
- `FIELD_REGISTRY.md`
  - update: 音频/时序/轨道/片段字段的当前读者与边界。

### 边界
- 不接 TTS。
- 不写音频 URL。
- 不解析时序 JSON。
- 不生成 board/marker clips。
- `VoiceTrack` 只读时间轴入参，未来音频 URL/时序仍必须回到 `TeachingProject.assets`。

### 校验
- `npm run typecheck`: 待跑。

### 下一枝
补 `updateVoiceAudio()` 与 `updateVoiceTiming()` store action，再定义 TTS 返回契约。

## 2026-04-25 side-voice-asset-write-actions

### 目标
给 A 语音音频 URL 和语音时序 JSON 先立唯一写入口，不接真实 TTS。

### 文件变动树
- `src/domain/teachingProject.ts`
  - add: `VoiceAudioPayload`。
  - add: `VoiceTimingPayload`。
  - reason: 先定义 TTS 结果进入 cleanroom 的最小契约。
- `src/store/useTeachingEditorStore.ts`
  - add: `updateVoiceAudio(payload)`。
  - add: `updateVoiceTiming(payload)`。
  - change: `voiceAudio` / `voiceTiming` 纳入 `assetIdsByKind`。
  - reason: 音频 URL、时序 JSON 只能回写 `TeachingProject.assets`，不允许音轨组件私藏。
- `FIELD_REGISTRY.md`
  - add: `updateVoiceAudio()` 与 `updateVoiceTiming()` 字段登记。
  - reason: 后续接阿里云 TTS / 对轴解析时能沿唯一真相入口走。

### 边界
- 不请求阿里云 TTS。
- 不解析真实 timing JSON。
- 不生成 marker/board clips。
- 不播放音频。

### 校验
- `npm run typecheck`: 待跑最终回填。

### 下一枝
定义 TTS 返回契约：音频 URL、原始 JSON、可选字/句时间戳、错误信息；再决定 `►...◄` 是否进入 TTS 文本或仅用于对轴解析。

### 本次校验回填
- `runtime/node/npm.cmd run typecheck`: 通过。


## 2026-04-25 side-a-before-b-alignment-truth

### 目标
修正流程顺序：音频必须在板书排轨之前。A 语音轨先按句成型，B 板书再贴 A 轨卡位并支持手工拖动微调。

### 文件变动树
- `src/domain/teachingProject.ts`
  - add: `TtsSentenceUnit`。
  - add: `TtsBatchJob`。
  - add: `TtsSentenceResult`。
  - add: `TtsBatchResult`。
  - reason: 先定义按句 TTS、60 秒限制、并发 5、每句音频/时序返回的契约。
- `TTS_BOARD_ALIGNMENT_FLOW.md`
  - add: A 音轨先成型、B 板书再贴轨的流程真相。
  - reason: 防止后续再回到“先排板书再找音频”的错误顺序。
- `PROJECT_POSITIONING.md`
  - change: 主线改为“按句 TTS -> A 音轨成型 -> B 板书贴轨”。
- `PRELUDE_CLOSURE_2026-04-25.md`
  - change: 下一阶段入口改为“拆句 -> TTS -> A 轨 -> B 轨”。
- `SESSION_HANDOFF_2026-04-25_BRANCHLET.md`
  - change: 接力棒明确阿里云 TTS 60 秒限制、并发上限 5、A 先 B 后。
- `FIELD_REGISTRY.md`
  - add: `TtsSentenceUnit`、`TtsBatchJob`、`TtsBatchResult` 登记。

### 新流程真相
1. 文稿 Agent 输出讲解稿 + 板书文本 + `►...◄` 同步标记。
2. 讲解稿按句拆分，带标记句保留 `boardMarkerText`。
3. 阿里云 TTS 按句/按批生成音频，单请求不超过 60 秒，并发上限 5。
4. 每句 TTS 先返回音频 URL 与时序 JSON。
5. 每句音频按顺序排列在 A 语音轨。
6. 带 `►...◄` 的句子自动生成 B 板书候选卡位。
7. 用户手工拖动调整 B 轨细节。

### 边界
- 当前只改契约与文档。
- 不接真实阿里云 TTS。
- 不实现拆句器。
- 不生成真实 A/B clips。

### 校验
- `npm run typecheck`: 待跑。

### 下一枝
实现纯函数：`splitScriptIntoTtsSentenceUnits(scriptText)`，只解析句子和 `►...◄`，不请求网络。

### 本次校验回填
- `runtime/node/npm.cmd run typecheck`: 通过。


## 2026-04-25 side-script-splitter-clean-tts-text

### 目标
实现纯函数拆句与 TTS 文本清洗：`►...◄` 作为内部卡位标记保留给对轴，但发给阿里云的文本必须过滤 `►`/`◄`。

### 文件变动树
- `src/modules/timeline-factory/splitScriptIntoTtsSentenceUnits.ts`
  - add: `stripBoardMarkersForTts(text)`。
  - add: `splitScriptIntoTtsSentenceUnits(scriptText, options)`。
  - reason: 从讲解稿生成 TTS 分句单元，并保留带板书标记的句子给后续 B 轨贴位。
- `src/modules/timeline-factory/types.ts`
  - add: `SplitScriptOptions`、`SplitScriptResult`。
- `src/modules/timeline-factory/index.ts`
  - export: 拆句与清洗函数。
- `scripts/check-script-splitter.mjs`
  - add: 轻量检查脚本，验证 TTS 文本不含 `►`/`◄`，但 `boardMarkerText` 仍保留。
- `package.json`
  - add: `check:script-splitter`。
- `TTS_BOARD_ALIGNMENT_FLOW.md`
  - update: 明确发给阿里云前必须过滤卡位符号。
- `FIELD_REGISTRY.md`
  - add: 拆句函数和清洗函数登记。

### 边界
- 不请求阿里云。
- 不写 store。
- 不生成 timeline clips。
- 不处理真实音频拼接。

### 校验
- `npm run check:script-splitter`: 待跑。
- `npm run typecheck`: 待跑。

### 下一枝
用 `TtsSentenceUnit[]` 生成 TTS 批任务：按 60 秒估算切批，并发上限 5。

### 本次校验回填
- `runtime/node/npm.cmd run check:script-splitter`: 通过。
- `runtime/node/npm.cmd run typecheck`: 通过。


## 2026-04-25 side-voice-batch-status-ui

### 目标
慢一点先做 UI 表达：语音根据断句卡位标分批请求阿里云，一次 3-5 个；返回 JSON、生成音频、上 A 音轨，用状态灯/状态条表达。

### 文件变动树
- `src/domain/teachingProject.ts`
  - add: `TtsBatchUiStatus`。
  - add: `TtsBatchUiItem`。
  - reason: 先给 UI 状态灯一个明确契约，不把 demo 状态混成真实 TTS 结果。
- `src/components/VoiceBatchStatusPanel.tsx`
  - add: A 语音音频分批状态面板。
  - tags: `tts-audio-pipeline`、`voice-timing-json`、`board-audio-alignment`。
  - reason: 表达 JSON 已获取、生成成功、已上 A 音轨的分步状态。
- `src/components/AssetPanel.tsx`
  - change: `voiceAudio` tab 使用 `VoiceWorkspace`，展示 `VoiceBatchStatusPanel` + 原资产列表。
  - reason: 音频素材页先成为 TTS 状态总览入口。
- `src/styles.css`
  - add: `voice-batch-card`、`voice-batch-row`、`voice-status-pill` 等状态条样式。
- `COMPONENT_REGISTRY.md`
  - add: `VoiceBatchStatusPanel` 登记。
- `FIELD_REGISTRY.md`
  - add: `TtsBatchUiItem` 登记。

### 边界
- 当前是 UI 占位和契约。
- 不请求阿里云。
- 不产生真实音频。
- 不写 `voiceAudio/voiceTiming`。
- 不生成 A 轨 clips。

### 校验
- `npm run typecheck`: 待跑。

### 下一枝
把 `TtsSentenceUnit[]` 聚合成每批 3-5 个的 `TtsBatchJob[]`，并用真实批任务驱动这个状态灯。

### 本次校验回填
- `runtime/node/npm.cmd run typecheck`: 通过。


## 2026-04-25 side-audio-clips-as-numbered-segments

### 目标
根据夏夏示意图修正 A 音轨展示：不是一条“音频占位”，而是按 TTS 分句生成的 `音频 1 / 音频 2 / 音频 3` 分片块，对应上一张图里的音轨 1/2/3。

### 文件变动树
- `src/domain/teachingProject.ts`
  - change: 种子时间轴把 `clip-voice-1` 一整条占位拆成 `clip-voice-1/2/3`。
  - change: B 板书占位对齐到对应 A 音频分片时间。
  - reason: 让时间轴视觉符合真实生产顺序：A 音轨先按句排列，B 板书再贴 A 轨卡位。
- `src/components/TimelineClipBlock.tsx`
  - change: 支持 `标题｜摘要` 两行显示。
  - reason: 音频分片显示“音频 1 + 句子摘要”，方便识别。
- `src/styles.css`
  - change: `clip--audio` 加左侧蓝色识别条，片段内标题/摘要分层。
- `TTS_BOARD_ALIGNMENT_FLOW.md`
  - update: A 轨 UI 应显示音频 1/2/3 分片，而不是一整条占位。

### 边界
- 仍是种子/demo 时间轴。
- 不接真实 TTS。
- 不生成真实 clips。
- 不照抄夏夏手绘线条，只落实结构含义。

### 校验
- `npm run typecheck`: 待跑。

### 下一枝
实现 `createTtsBatchJobs(units)`：每批 3-5 句、估算不超过 60 秒，然后让状态灯和 A 轨都能用同一批任务数据驱动。

### 本次校验回填
- `runtime/node/npm.cmd run typecheck`: 通过。


## 2026-04-25 side-create-tts-batch-jobs

### 目标
把拆句后的 `TtsSentenceUnit[]` 聚合成阿里云 TTS 批任务：默认每批 3-5 句、单批估算不超过 60 秒、并发上限 5。

### 文件变动树
- `src/modules/timeline-factory/createTtsBatchJobs.ts`
  - add: `createTtsBatchJobs(units, options)`。
  - reason: 生成 TTS 批任务，只做计划，不请求网络。
- `src/modules/timeline-factory/types.ts`
  - add: `CreateTtsBatchJobsOptions`。
- `src/modules/timeline-factory/index.ts`
  - export: `createTtsBatchJobs`。
- `scripts/check-tts-batch-jobs.mjs`
  - add: 校验批任务数量、3-5 句范围、60 秒上限、并发 5。
- `package.json`
  - add: `check:tts-batch-jobs`。
- `TTS_BOARD_ALIGNMENT_FLOW.md`
  - update: 批任务由 `createTtsBatchJobs()` 生成，默认每批 3-5 句。
- `FIELD_REGISTRY.md`
  - add: `createTtsBatchJobs(units)` 登记。

### 边界
- 不请求阿里云。
- 不写 store。
- 不更新 UI 状态灯。
- 不生成 A 音轨 clips。

### 校验
- `npm run check:tts-batch-jobs`: 待跑。
- `npm run typecheck`: 待跑。

### 下一枝
用 `TtsBatchJob[]` 映射 `TtsBatchUiItem[]`，让音频状态灯不再用 demo 数据。

### 本次校验回填
- `runtime/node/npm.cmd run check:tts-batch-jobs`: 通过。
- `runtime/node/npm.cmd run typecheck`: 通过。
- 首次校验发现 11 句会形成尾批 1 句，已修正为均衡分批 4/4/3。


## 2026-04-25 side-script-agent-drawer-and-left-preview-feedback

### 目标
补充夏夏确认的布局规则：文稿/板书 Agent 对话使用窗口，不再挤占舞台下方；用户点击“应用”后，正式文本框自动填入，同时左上题图预览区也要反馈配套板书已确认。

### 文件变动树
- `src/App.tsx`
  - change: `ScriptAgentWorkspace` 从舞台下方移入右侧 `Drawer`。
  - add: 顶部“文稿 Agent”按钮。
  - add: 左侧题目“下一步”打开 Agent 窗口。
  - reason: Agent 对话不挤兑舞台下方主区域。
- `src/components/AssetPanel.tsx`
  - add: `onOpenScriptAgent` 入参。
  - change: 题目区“下一步”打开文稿 Agent 窗口。
  - add: 板书确认后，题图预览区显示“板书已确认”与板书摘要。
  - add: 文稿已应用提示，强调文本框仍可手工编辑。
- `src/components/ScriptAgentWorkspace.tsx`
  - change: Agent 对话块前置为窗口内对话区，正式文稿/板书文本框仍在同一个 Drawer 内。
  - reason: 对话是窗口，不是舞台下方常驻卡片。
- `src/styles.css`
  - add: `board-confirm-overlay`、`script-confirmed-tip`。
  - change: `script-agent-grid` 改为单列，避免对话区挤压文本框。
- `COMPONENT_REGISTRY.md`
  - update: `ScriptAgentWorkspace` 插槽改为 drawer。
- `FIELD_REGISTRY.md`
  - update: `boardLayout` 读写链和左上预览反馈规则。

### 边界
- 不接真实 Agent API。
- 不新增第二份文稿/板书状态。
- 不把 Agent 对话放回舞台主区域。
- 文本框仍允许用户手工编辑。

### 校验
- `npm run typecheck`: 通过。

### 下一枝
把题目文本编辑接入 `updateProblemText()`，并让左侧第一步文本框成为真正的上游输入。

## 2026-04-25 side-current-baton-before-context-full

### 目标
当前窗口快满，写接力 baton，避免下一窗重新猜 TTS/A轨/B轨/Agent窗口/字段映射的上下文。

### 文件变动树
- `CURRENT_BATON_2026-04-25_TTS_AUDIO_TRACK.md`
  - add: 当前 TTS 音轨阶段接力棒。
  - reason: 下一窗优先从这里恢复。
- `CONVERSATION_EXTRACT_2026-04-25_TTS_AUDIO_TRACK_PHASE.md`
  - add: sub `Turing` 写入本段聊天续摘。
  - reason: 保留夏夏补充的业务意图与阿圆已落地的结构判断。

### 未收口提醒
- `AssetPanel` 刚开始接 `onUpdateProblemText`，下一窗必须先跑 typecheck。
- 需要继续补字段映射表：参数、入口、出口、出现位置、唯一真相。
- 需要更新 `FIELD_REGISTRY.md`、`COMPONENT_REGISTRY.md` 中这次题文写回和 Agent Drawer 逻辑。

### 下一窗启动语
见 `CURRENT_BATON_2026-04-25_TTS_AUDIO_TRACK.md`。

## 2026-04-25 phase-review-before-board-events

### 目的

进入 B 板书事件生成前，收口当前 TTS / A 语音轨阶段，压实字段映射、组件边界和旧 iVideo 参考的覆盖规则。

### 新增文件

- `FLOW_FIELD_MAPPING.md`：字段、参数、UI 出现位置、入口动作、出口消费方、唯一真相和标签总表。
- `PHASE_REVIEW_2026-04-25_BEFORE_BOARD_EVENTS.md`：进入板书事件阶段前的复盘校准备忘。

### 更新文件

- `FIELD_REGISTRY.md`：追加 2026-04-25 字段映射压实段。
- `COMPONENT_REGISTRY.md`：追加 2026-04-25 组件压实段。
- `CHANGE_TREE.md`：记录本次阶段收口。

### 校验

- `runtime/node/npm.cmd run typecheck`：通过。

### 压实规则

- A 语音轨是主时钟。
- B 板书轨跟随 A 句子和 `boardMarkerText`。
- 发给 TTS 前过滤 `►` / `◄`，保留内部文字朗读。
- Agent 候选态、TTS 派生态、UI 状态灯不能成为第二套真相。

## 2026-04-25 board-events-minimal-generator

- $date
- 新增最小 B 板书事件生成器：src/modules/timeline-factory/createBoardEventsFromTtsUnits.ts
- 新增领域类型：BoardEvent、BoardEventSource in src/domain/teachingProject.ts
- 新增配置类型：CreateBoardEventsOptions in src/modules/timeline-factory/types.ts
- 导出入口：src/modules/timeline-factory/index.ts
- 新增检查脚本：scripts/check-board-events.mjs
- 新增 npm 命令：check:board-events
- 已验证：
untime/node/npm.cmd run check:board-events 通过。
- 边界：只生成 B 板书候选事件；不接阿里云、不播放、不导出 MP4、不做复杂动画。

## 2026-04-25 ui-flagging-rule-from-copaw

- $date
- 读取参考：F:\weavbot\开发文档日志\前端优化参考意见（copaw项目）与本项目相似度80%\123-埋点标记规范.md
- 读取参考：F:\weavbot\开发文档日志\前端优化参考意见（copaw项目）与本项目相似度80%\124-配置台详细设计埋点版.md
- 修正并固化 cleanroom UI 插旗打点规则：登记_2026-04-25_191704_UI插旗打点规则.md
- 规则补入符号系统：⚡ API、💾 数据、🔌 事件、📦 转换、🔄 刷新、🎨 状态样式、🧩 复用、⚠️ 错误、🔐 密钥、📡 流式。
- README 增加规则入口。

## 2026-04-25 ui-code-flags-pass-001

- $date
- 按 登记_2026-04-25_191704_UI插旗打点规则.md 在代码上第一轮插旗。
- 标记 App Shell、素材仓、Agent Drawer、Agent 文稿区、时间轴根组件。
- 只加可搜索注释，不改业务逻辑。

## 2026-04-25 asset-panel-component-split

- $date
- 将 AssetPanel 拆成装配层，不改业务行为。
- 新增 src/components/ProblemUploadPreview.tsx：题图上传与板书确认叠层。
- 新增 src/components/ProblemWorkspace.tsx：题文编辑和下一步 Agent 入口。
- 新增 src/components/VoiceWorkspace.tsx：音频状态灯和音频素材列表。
- 新增 src/components/AssetList.tsx：通用素材卡列表。
- 新增 src/components/assetPanelMeta.ts：素材 kind/status 显示映射。
- 已验证：
untime/node/npm.cmd run typecheck 通过。

## 2026-04-25 component-io-route-field-notes

- $date
- 给素材仓小组件补工具纸条：@io-input、@io-output、@route、@fields、@boundary。
- 更新 UI 插旗打点规则文档，固化“小组件工具纸条格式”。
- 更新组件登记，明确入参、出参、路由/位置、字段和边界。

## 2026-04-25 usable-component-inventory

- $date
- 新增可用组件收纳表：$usable
- 更新 COMPONENT_REGISTRY.md：追加最新收纳入口，并说明早期登记若有转义噪声，以新清单为准。
- 更新 登记_2026-04-25_191704_UI插旗打点规则.md：追加可用组件收纳规则。
- 更新 README.md：追加可用组件收纳表入口。

- 可用组件收纳表入口补写：收纳_2026-04-25_201205_可用小组件清单.md

## 2026-04-25_225010 side-business-sdk-components

- 新增 side 讨论记录：讨论_2026-04-25_225010_业务进线与SDK组件封装.md
- 核心结论：横向菜单每一步都是独立 SDK 式业务模块，必须有入参、出参、字段、路由/位置、adapter、边界。
- 外部候选池记录：Ant Design、Coze Web SDK、NextFrame components/crates、CutDeck。

## 2026-04-25_231048 screenity-candidate-review

- 补充 Screenity 候选评估到：讨论_2026-04-25_225010_业务进线与SDK组件封装.md
- 结论：适合作为录屏兜底/导出体验参考，不直接复制代码，不作为主 UI 框架。

## 2026-04-25_233043 canvas-recording-first-decision

- 决策记录：决策_2026-04-25_233043_画布录屏交付优先.md
- 项目定位从“批量导出 MP4”调整为“画布播放录屏交付优先，自动 MP4 渲染器后续增强”。
- 更新 PROJECT_POSITIONING.md、README.md、FLOW_FIELD_MAPPING.md。
- UI 文案：src/App.tsx 顶部按钮从“导出 MP4”改为“录屏交付”。
- 素材 tab / label：exportResult 展示名从“导出”改为“交付”。

## 2026-04-26_002739 component-block-candidate-audit

- 新增大板块组件封装候选盘点：盘点_2026-04-26_002739_大板块组件封装候选.md
- 结论：AntD 快速搭壳 + cleanroom 业务 SDK Step + 外部工具只做 adapter/参考。
- P0 组件方向：ProblemInputStepSdk、ScriptBoardAgentStepSdk、VoiceTtsStepSdk、TimelineEditorStepSdk、CanvasRecordingStepSdk。

## 2026-04-26_004442 external-component-candidates-audit

- 新增外部候选组件筛选库单：库单_2026-04-26_004442_外部候选组件筛选.md
- 已离线盘点 ThingsBoard UI Vue3、AntdUI、CutDeck、Screenity。
- 结论：CutDeck 最适合借时间轴结构；Screenity 只借录屏流程；ThingsBoard/AntdUI 借配置台与控件分类；不整包引入。

## 2026-04-26_010055 timeline-interaction-skeleton-audit

- 新增时间轴轨道交互骨架盘点：盘点_2026-04-26_010055_时间轴轨道交互骨架.md
- 从 CutDeck 提取可借模型：types/constants/utils/MultiTrackTimeline/ClipRenderer/Playhead/TimeRuler/TrackHeader。
- 结论：先做 BoardEvent[] -> TimelineClip(kind=board) mapper，不急着做复杂拖动。

## 2026-04-26_010639 twick-sdk-candidate-audit

- 新增 Twick 视频编辑 SDK 筛选库单：库单_2026-04-26_010639_Twick视频编辑SDK筛选.md
- 结论：Twick 架构高度贴近，但 SUL 许可证有商业/SaaS限制；当前只借架构和数据模型，不直接引入源码或主依赖。
- 对 cleanroom 的启发：workflow / timeline / canvas / live-player / render 分层是正确方向。

## 2026-04-26_011148 ayuan-xiaxia-style-memory

- 新增记忆节点：记忆_2026-04-26_011148_阿圆和夏夏的Style.md
- 已同步 Engram：阿圆和夏夏的 style 是共享语言，不复制外部项目，用自己的 workflow 语言建 cleanroom。

## 2026-04-26 board-event-to-timeline-clip-mapper

- $date
- 新增 mapper：src/modules/timeline-factory/mapBoardEventsToTimelineClips.ts
- 新增类型选项：MapBoardEventsToTimelineClipsOptions
- 新增导出：src/modules/timeline-factory/index.ts
- 新增检查脚本：scripts/check-board-event-clips.mjs
- 新增 npm 命令：check:board-event-clips
- 已验证：
untime/node/npm.cmd run check:board-event-clips 通过。

## 2026-04-26_013744 board-event-timeline-writeback

- 新增纯写回函数：src/modules/timeline-factory/applyBoardEventsToTeachingTimeline.ts
- 新增纯合并函数：src/modules/timeline-factory/mergeBoardClipsIntoTimelineClips.ts
- 更新 store：src/store/useTeachingEditorStore.ts 增加 applyBoardEventsToTimeline(boardEvents)。
- 更新导出：src/modules/timeline-factory/index.ts。
- 新增检查脚本：scripts/check-board-clips-merge.mjs。
- 新增 npm 命令：check:board-clips-merge。
- 边界：只替换生成型 B 轨 clip-board-###，保留 A 音频轨、marker 和手工板书片段。
- 已先验证：runtime/node/npm.cmd run check:board-clips-merge 通过；runtime/node/npm.cmd run typecheck 通过。

## 2026-04-26_014000 voice-workspace-board-demo-entry

- 更新 App：把 applyBoardEventsToTimeline 传入 AssetPanel。
- 更新 AssetPanel：透传 onApplyBoardEventsToTimeline 给 workflow step。
- 更新 createAssetWorkflowSteps：音频 step 声明 BoardEvent[] 输出到 timeline.clips(kind=board)。
- 更新 VoiceWorkspace：新增“模拟生成 B 板书轨”按钮，使用 demo BoardEvent[] 验证 B 轨贴位。
- 边界：这是 demo-board-events-adapter，不请求阿里云、不解析真实 timing JSON、不改文稿和板书资产。
- 已验证：runtime/node/npm.cmd run typecheck 通过。

## 2026-04-26_014500 tts-input-boundary-correction

- 回撤会误伤数学表达式的 normalizeTextForTts 方向。
- 删除临时清洗器文件和校验脚本，恢复 splitScriptIntoTtsSentenceUnits 原拆句入口。
- 保留核心规则：发给 TTS 前只去掉 ► / ◄ 外壳，里面文字照常朗读。
- 决策：Agent / 用户确认的文稿是客户 OK 的内容，不做全局 Markdown/数学字符清洗。
- 已验证：runtime/node/npm.cmd run typecheck 通过。

## 2026_04_26_020753 client-progress-visual-report

- 新增甲方可视化进度汇报：汇报_2026-04-26_020753_甲方可视化进度说明.md
- 用状态灯表格说明当前完成度、风险、下一阶段交付目标。


## 2026_04_26_021314 current-doc-entry-index

- 新增当前文档入口索引：索引_2026-04-26_021314_当前文档入口.md
- 固化新建 md 命名规范：用途_YYYY-MM-DD_HHMMSS_主题.md。
- 修复甲方汇报中的文件名和代码块格式噪声。


## 2026-04-26_automation_unattended_mode_config

- 新增配置真相：src/config/defaultConfig.ts 的 defaultConfig.automation。
- 新增运行模式：manual-review / unattended。
- 新增审核闸门：requireReviewBeforeTts、requireReviewBeforeTimeline、requireReviewBeforeRecording。
- 更新设置面板：src/components/AppSettingsDrawer.tsx 增加“自动化”页签。
- 边界：当前只预留配置与 UI，占位不触发真实无人值守执行。

## 2026_04_26_030639 red-track-stage-manager-model

- 新增决策文档：决策_2026-04-26_030639_红轨节奏表与蓝色场务调度模型.md
- 记录红色先入轨形成节奏表、蓝色场务调度棕色演员的时间轴模型。


## 2026_04_26_031516 teaching-little-theater-memory

- 新增记忆文档：记忆_2026-04-26_031516_教学小剧场模型.md
- 记录 cleanroom 教学小剧场模型：题目是剧本，红轨定节奏，蓝色做调度，棕色上台演。


## 2026_04_26_031918 uncertain-happy-ending-memory

- 新增深层记忆文档：记忆_2026-04-26_031918_不确定里的幸福结局.md
- 已同步 Engram：cleanroom deep memory: uncertain happy ending。
- 已加入当前文档入口索引。


## 2026_04_26_032818 xiaxia-continuity-baton

- 使用 xiaxia-continuity 写入系统接力：C:\Users\Administrator\.codex\memories\xiaxia-continuity\batons\current-baton.md
- 归档副本：C:\Users\Administrator\.codex\memories\xiaxia-continuity\batons\baton_2026-04-26_032818_cleanroom_teaching_theater.md
- 项目索引已追加 Continuity Baton 入口。


## 2026-04-26_033900 user-visible-ui-rest-pass

- 休整 ScriptAgentWorkspace：预览编辑区在上，对话口在下，符合用户先看结果再对话调整的习惯。
- 隐藏文稿板书 Agent 的技术标签和规则小抄，不把幕后调试内容给用户看。
- 休整 AgentReviewCard：按钮文案改为“应用到预览框”，发送按钮保持禁用占位。
- 隐藏 VoiceWorkspace 里的 B 轨 demo 调试卡；B 轨后续在时序/时间轴区域处理。
- 已验证：runtime/node/npm.cmd run typecheck 通过。

## 2026-04-26_034500 api-needed-markers

- 新增统一 API 路标标记：@api-needed。
- 标记题目识别、文稿板书 Agent、Agent 对话、阿里云 TTS、配置持久化、向量知识库、飞书回填等入口。
- 边界：这些是未来 API / SDK / adapter 接入点，不代表当前已接真实外部服务。

## 2026-04-26_035200 agent-conversation-front-internal-preview-hidden

- 调整 ScriptAgentWorkspace：Agent 对话区前置，作为用户主操作区域。
- 将 problemText / scriptText / boardLayout 大块文本区折叠为“内部预览与手动微调”。
- 补样式：内部预览区使用弱化虚线容器，不挤占前台对话空间。
- 已验证：runtime/node/npm.cmd run typecheck 通过。

## 2026-04-26_040000 script-agent-open-auto-first-draft

- 修正交互规则：用户在题目页点击下一步时，等价于已把题目发送给文稿板书 Agent。
- ScriptAgentWorkspace 打开时自动根据 problemText 生成本地第一版 draft，并填入口播文本/板书文本预览。
- applyScriptAgentDraft 不再关闭 Drawer；关闭/跳转留给后续“确认下一步”。
- 清理上一次折叠内部预览留下的无用样式。
- 已验证：runtime/node/npm.cmd run typecheck 通过。

## 2026-04-26_090715 drawer-order-and-dom-depth

- 修正 ScriptAgentWorkspace：Drawer 内口播文本预览、板书文本预览在上，Agent 对话在下。
- 去掉 ScriptAgentWorkspace 外层 AntD Card 壳，避免重复标题和无意义容器。
- 修正 AgentReviewCard：从 AntD Card 改为原生 `section/header/footer` 轻容器，清理自写多余 `div`。
- 调整主工作台三栏：左侧素材栏 `380px -> 460px`，右侧检查栏 `320px -> 300px`。
- 登记 `COMPONENT_REGISTRY.md` 与 `FLOW_FIELD_MAPPING.md`：明确 Drawer 视线顺序和“不套娃”边界。
- 已验证：`.\runtime\node\npm.cmd run typecheck` 通过。
- 已截图：`C:\codex\desktop-tools\captures\screenshot_20260426_091111.png`。

## 2026-04-26_091500 stage-problem-text-not-image

- 修正 StagePreview：主舞台题目区从 `problemImage` 改为读取 `problemText`。
- 舞台题目区显示确认后的题目文本，使用普通 UI 字体，不使用手写字体。
- 上传题图只保留在左侧输入 / 识别链路，不再直接摆进主舞台题目区。
- 更新 `COMPONENT_REGISTRY.md` 与 `FLOW_FIELD_MAPPING.md`，登记 `stage-problem-text` / `text-not-image` 边界。

## 2026-04-26_092900 drawer-preview-flow-cards

- 修正 ScriptAgentWorkspace 预览区域：口播文本预览、板书文本预览改为 `auto-fit` 流式卡片列。
- 落实布局规则：一行文字占不到 1/2 时，不使用通栏布局。
- 边界：只改 CSS grid，不新增 DOM 包裹层，不引入套娃。
- 已验证：`.\runtime\node\npm.cmd run typecheck` 通过。

## 2026-04-26_093500 drawer-preview-height-cap

- 修正 ScriptAgentWorkspace 预览区域：预览卡设置最高高度，超过后文本框内部滚动。
- 保留 Agent 对话区的大空间，避免预览内容过长挤压对话输入。
- 边界：只改 CSS，不新增 DOM 包裹层。

## 2026-04-26_093900 drawer-preview-chat-4-6

- 修正 ScriptAgentWorkspace Drawer 高度分配：上方预览区 4，下方 Agent 对话区 6。
- 工作区高度绑定视口，预览区超出后滚动，对话区保持主操作空间。
- 边界：只改 CSS grid 比例，不新增 DOM 包裹层。

## 2026-04-26_165500 agent-drawer-return-to-antd-base

- 修正 `AgentReviewCard`：回归 AntD `Card`、`Avatar`、`Alert`、`Input.TextArea`、`Button`、`Flex` 组合。
- 修正 `ScriptAgentWorkspace`：预览卡回归 AntD `Card` + `Input.TextArea`，保留预览在上、对话在下和 4:6 比例。
- 补充组件贴纸：`@io-input`、`@io-output`、`@route`、`@fields`、`@boundary`。
- 边界：只恢复 AntD 标准组件底座，不接 TTS、不改时间轴、不新增业务状态。

## 2026-04-26_171000 recognition-api-env-config

- 新增 `defaultConfig.recognition`：视觉识别 Provider、Endpoint、Model、Key Ref、无图文本模式、识别后自动下一步。
- 当前第一步视觉模型默认：BigModel Vision / `glm-4.6v-flashx` / `BIGMODEL_API_KEY`。
- 新增 `.env.example`：统一说明本地测试密钥放 `.env.local`。
- 新增 `环境_2026-04-26_171000_API密钥统一管理.md`：记录密钥不进前端代码、不进配置真相的边界。
- 更新 `.gitignore`：忽略 `.env` / `.env.*`，保留 `.env.example`。
- 边界：只补配置和 env 管理，不把明文密钥写入仓库，不接真实视觉识别请求。

## 2026-04-26_172637 cleanroom-construction-blueprint

- 新增 `图纸_2026-04-26_172637_cleanroom房屋装修施工图纸.md`。
- 内容覆盖：房子地基结构、页面分区、SOP、API 水电布线、store hooks、可使用组件标准、当前贴纸完成度、待补强组件、Mermaid 调用线。
- 目标：让后续维护像看房屋装修施工图纸，不靠聊天上下文猜结构。
- 边界：只写架构/维护文档，不改代码逻辑。

## 2026-04-26_173200 component-circuit-labels-pass-1

- 补齐第一批组件电路贴纸：`StagePreview`、`TeachingTimeline`、`TimelineTrackRow`、`TimelineClipBlock`、`InspectorPanel`、`AppSettingsDrawer`、`FloatingToolDock`。
- 贴纸内容覆盖：`@io-input`、`@io-output`、`@route`、`@fields`、`@boundary`。
- 更新 `COMPONENT_REGISTRY.md` 和施工图纸状态。
- 边界：只补注释和登记，不改业务逻辑、不改 UI。

## 2026-04-28_011245 skill-entrypoints-and-sentence-tts-contract

- 新增 `记录_2026-04-28_011245_技能入口与逐句TTS合同收口.md`。
- 记录稳定技能入口：`xiaxia-continuity`、`x-markdown`、`antd`。
- `scriptBoardAgentPrompt` 改为真实逐句稿合同：`。 + 换行`，板书同步使用成对 `.......板书内容.......`。
- `splitScriptIntoTtsSentenceUnits` 支持成对 `.......` 标记，同时保留旧 `►...◄` 兼容。
- `check:script-splitter` 覆盖 `×`、`÷`、括号、LaTeX 保护。
- `InspectorPanel` 改为草稿输入后点击“确认应用”才写回 B 板书片段，避免输入即写回导致缓存和稳定风险。
- 已验证：`npm run typecheck`、`npm run check:script-splitter`、`antd lint src/components/InspectorPanel.tsx --format json`。
- 边界：不读取、不打印、不提交 `.env.local` 或真实 API key；不把开发脚手架登记成验收完成。

## 2026-04-28_012919 frontend-redline-review-brief

- 新增 `记录_2026-04-28_012919_前端交互红字图稿与review委托.md`。
- 将夏夏图稿红字拆为三段业务流：题目上传确认、文稿板书 Agent Drawer、逐句语音与 A/B/C 时间轴。
- 明确 Drawer 交互：下一步即发送给 Agent，打开后应表现为 Agent 正在回复并给出第一版输出；避免套娃占位。
- 明确时间轴交互：A 轨是语音主时钟，B 轨是板书文本贴片，C 层控制显示内容、x/y、速度/进度和时机。
- 委托 `gpt-5.4` sub 做只读前端交互 review：不改代码、不提交、不读取 `.env.local`，输出 P0/P1/P2。
- 边界：只记录图稿约束和 review 委托，不修改业务代码。

## 2026-04-28_013452 doc-memory-archive

- 新建 `doc/` 存档区。
- 新建 `doc/记忆足迹/`：归档夏夏和阿圆的历史决策、盘点、摘要、记录、记忆文档。
- 新建 `doc/语音资料/`：存放真实 TTS / 阿里云语音资料。
- 新增 `doc/README.md`：说明这些不是废纸篓，而是记忆、足迹和长大记录；归档只搬家，不删除、不改正文。
- `阿里云语音的摘抄.md` 命中潜在密钥模式，暂时只本地保存，不提交 Git。
- 边界：根目录保留当前施工入口：`CHANGE_TREE.md`、`COMPONENT_REGISTRY.md`、`FIELD_REGISTRY.md`、`FLOW_FIELD_MAPPING.md`、`README.md`、`AGENTS.md`。

## 2026-04-28_014000 frontend-review-return-and-abc-model

- 更新 `doc/记忆足迹/记录_2026-04-28_012919_前端交互红字图稿与review委托.md`。
- 记录 `gpt-5.4` 前端 review 返回结果，按 P0/P1/P2 拆分。
- 修正 A/B/C 时间轴心智模型：
  - A 轨 = 预录制配音声优，语音主时钟，可播放/按句试听/检查/必要时重新生成，不让用户随意手改时间。
  - B 轨 = 剧本指导 + 场务，以 A 的带标记分片 timing/json 为依据，负责节奏剧本，指导 C 表演什么、什么时候开始。
  - C 层 = 演员角色，根据 B 要求在画布上选择站位 `x/y` 并表演，控制显示内容、速度/进度、时机，不改语音本身。
- 下一步 P0 顺序：锁阶段门禁 -> 修 Drawer 候选/正式边界 -> 改 A/B/C 文案和触达 -> 再接真实逐句 TTS 链路。
- 边界：本次只登记 review 和规划，不改业务代码。

## 2026-04-28_024150 cosyvoice-rest-smoke-from-old-project

- 参考旧项目 `D:\Users\Admin\Desktop\3-main\whiteboard-pure-sandbox\mini-services\handwriting-service\index.ts` 的阿里云 TTS REST + SSE 路径。
- `scripts/cosyvoice-contract.mjs` 新增 REST `SpeechSynthesizer` endpoint 与请求体构造，同时保留 WebSocket 合同函数作后续流式参考。
- `scripts/check-cosyvoice-gateway-contract.mjs` 增加 REST payload dry-run 检查，覆盖模型、音色、文本、格式。
- `scripts/smoke-cosyvoice-sentence.mjs` 从 WebSocket smoke 改为 REST smoke，去掉 `ws` 依赖；成功后写入 `.tmp-cosyvoice-smoke/*.mp3` 与 `*.timing.json`。
- 更新 `doc/语音资料/真实TTS验证流程.md`：当前 P0 先走 REST + SSE，避免依赖安装阻塞真实语音验证。
- 已验证：`npm run check:cosyvoice-contract`、`npm run typecheck`。
- 边界：不读取、不打印、不提交 `.env.local` 或真实 key；真实联网 smoke 仍需由当前进程提供 `DASHSCOPE_API_KEY`。

## 2026-04-28_030401 aliyun-real-tts-smoke-result

- 新增 `doc/语音资料/记录_2026-04-28_030401_阿里云真实TTS联网验证.md`。
- 真实联网验证已打到阿里云 REST TTS 服务，服务端返回真实 `request_id`。
- `cosyvoice-v3.5-flash + longanyang` 返回 `InvalidParameter / Engine return error code: 418`；资料确认 v3.5 无系统音色，只能使用复刻/设计 `voice_id`。
- `cosyvoice-v3-flash + longanyang` 返回 `Arrearage / Access denied`；这是当前系统音色 smoke 的正确组合，说明代码、endpoint、env 注入和鉴权链路已进入服务端业务判断，当前阻塞是账号/服务状态。
- `scripts/cosyvoice-contract.mjs` 将默认系统音色 smoke 模型收敛为 `cosyvoice-v3-flash`，另保留 `COSYVOICE_CLONE_MODEL=cosyvoice-v3.5-flash` 供后续自定义 voice_id 使用。
- `scripts/smoke-cosyvoice-sentence.mjs` 支持 `COSYVOICE_SMOKE_MODEL` / `COSYVOICE_SMOKE_VOICE` 覆盖，便于快速验证不同模型音色组合。
- 边界：没有提交 `.env.local`、真实 key 或 `.tmp-cosyvoice-smoke/` 调试产物；未把失败包装成成功。

## 2026-04-28_134420 user-view-model-switchboard-and-real-script-agent

- 用户视角第一步配置面板新增“模型总闸”：聚合显示识别模型、文稿模型、语音模型的 provider/model/key ref/endpoint。
- 文稿与业务流程模型收敛为阿里云百炼 OpenAI compatible：`qwen3.5-35b-a3b` / `DASHSCOPE_API_KEY` / `https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions`。
- 将夏夏提供的作业帮讲题提示词写入 `defaultConfig.scriptAgent.promptSystem`，并保留句号换行、成对 `.......`、板书语音 100% 对齐、数学符号保护合同。
- 新增本地 Vite Agent 网关 `/api/agent/script-board`：浏览器不接触明文 key，Node/Vite 从 `.env.local` 读取 `DASHSCOPE_API_KEY` 后请求百炼文本模型。
- `AgentReviewCard` 的“发送给 Agent”已从禁用占位改为真实请求；返回内容仍是候选稿，用户点击“应用到预览框”后才写入正式文稿/板书。
- 题目步骤新增“确认题文”闸门：编辑题文后状态为待确认，确认后才允许顶部按钮、题目页、文稿板书页打开 Agent。
- 未接真实视觉识别网关前，题目页明确提示“识别调用待接入”，不假装识别成功；用户可手动填写并确认题文。
- 已验证：`npm run typecheck`、`npm run build`、`antd lint src --format json`。
- 边界：没有读取、打印、提交 `.env.local` 或真实 key；本节点只接文本 Agent 网关和题文闸门，视觉识别真实调用仍待下一节点。

## 2026-04-28_135031 settings-confirm-save-button

- 从用户视角修正配置抽屉：设置项修改后需要明确确认，不能只让用户猜底部“保存配置”是否生效。
- `AppSettingsDrawer` 新增未保存状态：未修改显示“配置已同步”，修改后显示“有未保存修改”。
- Drawer footer 改为明确动作组：`取消修改`、`恢复默认`、`确认保存配置`。
- `确认保存配置` 只有在表单发生修改后启用；点击后写入 store 和 localStorage，再关闭抽屉。
- `取消修改` 会恢复当前已保存配置，避免用户误改后只能关闭抽屉。
- 补 `settings-drawer-footer` 样式，让提示和操作按钮在底部清楚分区。
- 已核对 AntD：使用 `Drawer.footer`、`Drawer.extra`、`Form.onValuesChange`、`FormInstance.submit/setFieldsValue`、`Button.disabled`。
- 已验证：`npm run typecheck`、`antd lint src/components/AppSettingsDrawer.tsx --format json`、`npm run build`。

## 2026-04-28_135424 customer-byok-settings-copy

- 夏夏从客户定制视角指出：不能简单说“用户前端不可以输入密钥”，客户会需要使用自己的 key。
- 修正设置页安全口径：客户定制支持客户自有 key / BYOK，但明文 key 应由管理员配置到后端密钥管理或本地网关环境变量中。
- 前端字段统一改为 `密钥引用/环境变量名`，明确这里只保存引用名，不保存明文 key。
- 在模型总闸、API、识别模型、文稿模型、语音模型说明中补充客户定制场景：
  - 客户可换自己的 key。
  - 业务前端不落明文。
  - 真实调用走本地服务或后端网关。
- 已验证：`npm run typecheck`、`antd lint src/components/AppSettingsDrawer.tsx --format json`。

## 2026-04-28_135943 aliyun-all-model-defaults

- 夏夏确认客户可以更换 API 接口，也可以全链路换成阿里云。
- 识别模型默认从智谱切换为阿里云百炼：
  - provider: `aliyun-qwen-ocr`
  - endpoint: `https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions`
  - key ref: `DASHSCOPE_API_KEY`
  - model: `qwen-vl-ocr`
- `RecognitionProvider` 增加 `aliyun-qwen-ocr` 和 `aliyun-qwen-vl`，保留 `manual-first`、`bigmodel-vision`、`custom-vision-api` 作为客户可选项。
- 设置页“识别模型”下拉新增：
  - `阿里云百炼 Qwen OCR`
  - `阿里云百炼 Qwen VL 多模态`
- 至此默认模型总闸为阿里云三路：
  - 识别：Qwen OCR / VL
  - 文稿：`qwen3.5-35b-a3b`
  - 语音：CosyVoice
- 已验证：`npm run typecheck`、`antd lint src/components/AppSettingsDrawer.tsx --format json`、`npm run build`。
- 边界：本节点只改默认配置和设置项；视觉识别真实网关调用仍未接入，不能在 UI 中假装已经识别成功。

## 2026-04-28_140515 qwen35b-vision-default

- 夏夏指出 `qwen3.5-35b-a3b` 可能也支持图片识别。
- 查阿里云官方视觉理解模型页后确认：`qwen3.5-35b-a3b` 输入支持文本、图像、视频。
- 识别默认模型从 `qwen-vl-ocr` 改为与文稿模型一致的 `qwen3.5-35b-a3b`。
- `RecognitionProvider` 新增 `aliyun-qwen35b-vision`，设置页显示为 `阿里云百炼 Qwen3.5 35B 视觉/文本`。
- 仍保留 `aliyun-qwen-ocr` 和 `aliyun-qwen-vl` 作为客户可选项，方便后续客户指定专用 OCR/VL 模型。
- 工程边界：识别和文稿可以用同一个底层模型，但仍保留两套步骤、两套提示词、两套输出合同；识别只整理题文，不求解，文稿才生成讲解和板书。
- 已验证：`npm run typecheck`、`antd lint src/components/AppSettingsDrawer.tsx --format json`、`npm run build`。

## 2026-04-28_141531 real-image-recognition-gateway-and-auto-gate

- 修复用户上传题图后“没有反应”的真实断点：原来上传只写入图片预览，没有调用识别网关。
- 新增前端识别客户端 `src/services/recognitionGatewayClient.ts`：
  - 读取上传图片为 data URL。
  - 请求同源 `/api/recognition/problem-text`。
  - 返回候选 `problemText`。
- 新增 Vite 本地识别网关 `/api/recognition/problem-text`：
  - 从请求读取识别配置和图片 data URL。
  - 按配置中的 `apiKeyRef` 从 `.env.local` / process env 取真实 key。
  - 使用 OpenAI compatible 图片输入格式发送到阿里云百炼。
  - 要求模型输出 `{ "problemText": "整理后的题文" }`。
- `ProblemWorkspace` 增加“识别图片”按钮、识别中 loading、识别错误提示。
- 上传题图后：
  - 如果设置页“上传后自动识别题图”开启，则自动发起识别。
  - 如果关闭，则用户点击“识别图片”手动触发。
- 修正“自动免审”边界：
  - 人工审核模式：识别结果只进入候选题文，用户仍需点击“确认题文”。
  - `automation.mode === unattended`：识别结果写入并自动确认题文，再打开文稿 Agent。
- 设置页文案从“识别后是否自动进入下一步”改为“上传后自动识别题图”，避免误解为跳过所有审核。
- 新增 store action `applyRecognizedProblemText(text, confirm?)`，避免识别后立刻确认时命中 React 状态时序问题。
- 已验证：
  - `npm run typecheck`
  - `npm run build`
  - `antd lint src --format json`
  - `curl.exe -s -i -X POST http://127.0.0.1:5196/api/recognition/problem-text -H "Content-Type: application/json" -d "{}"` 返回预期 400 `MISSING_IMAGE_DATA_URL`，说明网关已接入且可达。
- 边界：没有读取/打印/提交 `.env.local`；真实图片识别效果还需在浏览器上传图片 smoke。

## 2026-04-28_142214 real-image-recognition-success-and-next-agent-ux

- 夏夏在浏览器真实上传题图 smoke，确认识别成功：第一小步胜利。
- 用户体验卡点更新：
  - 如果用户开启自动化，上传题图后应该自动识别。
  - 识别成功后，原来的“确认下一步”在自动化模式下应自动执行。
  - 自动化模式下应打开文稿 Agent 侧边栏。
  - 打开后问题应静默发送给文稿 Agent。
  - 用户看到的状态应该是文稿 Agent 对话框里正在生成回答。
  - 生成后的候选回答进入预览框；仍需保持候选/正式边界，除非明确免审。
- 当前实现已做到：
  - 真实识别成功。
  - `automation.mode === unattended` 时识别后会自动确认题文并打开 Agent。
- 当前待补：
  - 文稿 Agent 侧边栏打开后尚未自动显示“正在生成回答”。
  - 文稿 Agent 尚未在打开时基于已确认题文自动请求真实 Agent。
  - 生成结果进入候选预览框后，需要根据审核配置决定是否自动应用到正式文稿/板书。
- 下一步小刀：把 ScriptAgentWorkspace / AgentReviewCard 改成支持 `autoRun`，在自动化模式打开时自动调用 `/api/agent/script-board`，显示 loading，并把返回候选稿放进预览框。

## 2026-04-28_143121 antd-x-chat-and-x-markdown-agent-sidebar

- 夏夏提出文稿 Agent 侧边栏应使用 AntD / Ant Design X 的 chat 组件，并把 `x-markdown` 用上。
- 新增依赖：
  - `@ant-design/x`
  - `@ant-design/x-markdown`
- 参考本地 `tool\ant-design-master` 后确认它是 Ant Design 主仓，不含 Ant Design X；实际组件从 `node_modules/@ant-design/x` 和 `node_modules/@ant-design/x-markdown` 读取类型。
- `AgentReviewCard` 从普通 AntD Card/TextArea 改为：
  - `Bubble.List` 展示 Agent 对话与生成状态。
  - `Sender` 承载继续追问/调整。
  - `XMarkdown` 渲染候选稿内容。
- `ScriptAgentWorkspace` 新增：
  - `autoRun`
  - `autoApplyDraft`
- `App` 接线：
  - Drawer 打开且题文已确认时，自动调用 `/api/agent/script-board` 生成候选稿。
  - `automation.mode === unattended` 时，生成后自动应用到正式文稿/板书预览。
  - 人工审核模式下，只停在候选稿，用户点击“应用到预览框”后才写正式文稿/板书。
- UI 状态：
  - 打开 Agent 后会出现“正在生成回答，请稍等。”
  - 生成后在气泡中用 Markdown 展示“逐句讲解稿”和“板书计划”。
  - 仍保留“重新生成”和“应用到预览框”。
- 已验证：`npm run typecheck`、`npm run build`、`antd lint src --format json`。
- 边界：新依赖让 bundle 从约 928 KB 增至约 1.16 MB；后续需要时可对 Agent Drawer / Markdown 渲染做动态导入分包。

## 2026-04-28_144912 agent-sidebar-framework-preview-layout

- 夏夏看第二幕红字反馈：
  - Agent 已进入生成，但生成结果没有进上方预览框。
  - 对话区域太小。
  - 应用按钮在聊天区底部，位置难受，容易误触。
  - 因为要支持算术符号，侧边栏应该直接用组件框架稳定承载，不要自写一堆盒子。
- 修正 `ScriptAgentWorkspace`：
  - 使用 AntD `Splitter` 做上下可调整面板。
  - 上方面板是候选预览区，包含 `候选预览` 工具条、模型 tag、审核状态 tag、`确认应用到正式稿` 主按钮。
  - 下方面板是 Agent Chat，使用 Ant Design X 的 `Bubble.List` 和 `Sender`。
  - Agent 返回后通过 `onCandidateDraftChange` 直接写入上方候选预览框。
  - 聊天区只负责“正在生成 / 继续调整 / 重新生成”，不再承载应用按钮。
- 修正 `AgentReviewCard`：
  - 增加 `onCandidateDraftChange`。
  - 生成后同步候选稿到父级预览框。
  - 去掉底部“应用到预览框”按钮，只保留“重新生成”。
- 校验：
  - `npm run typecheck` 通过。
  - `antd lint src --format json` 通过，0 issues。
  - `npm run build` 曾通过；随后将 Splitter deprecated `layout` 改为 `orientation` 后未重跑 build，下一窗口如需收口先跑一次 build。
- 下一步：刷新浏览器检查第二幕布局，确认候选稿是否进入上方预览框、按钮位置是否符合红字图稿。

## 2026-04-28_151137 math-content-display-contract

- 夏夏指出更底层的问题：编辑器和 canvas/舞台都必须支持显示运算内容，不能只让聊天框支持数学符号。
- 参考 `tool/Tutor-main` 与 `tool/MathLens-main` 后确定规则：
  - 基础运算、几何符号优先用 Unicode 文本直显，例如 `×`、`÷`、`½`、`√`、`∠`、`°`、`≤`、`≥`。
  - 复杂公式可在 Markdown/Agent 气泡里用 Latex/KaTeX 渲染。
  - 输入原文不能被前端改写，避免 TTS、板书、时间线内容错位。
- 新增共享显示组件 `src/components/MathText.tsx`：
  - 只负责显示，不规范化、不替换、不写 store。
  - 用 `pre-wrap` 保留换行，用数学字体栈保护运算符。
- 已接入数学显示层：
  - `StagePreview`：题文区、板书贴片。
  - `TimelineClipBlock`：时间线片段标题/副标题。
  - `ScriptBoardSummaryStep`：左侧文稿/板书摘要。
  - `ProblemUploadPreview`：题图预览里的板书摘要叠层。
  - `ProblemWorkspace`：题文确认区 editable 段落加数学显示样式。
  - `ScriptAgentWorkspace` / `InspectorPanel`：候选稿和板书片段编辑框加数学输入字体样式。
  - `AgentReviewCard`：`XMarkdown` 增加 `@ant-design/x-markdown/plugins/Latex`，支持 `$...$` / `\[...]` 公式渲染。
- 已验证：
  - `npm run typecheck`
  - `antd lint src --format json`
  - `npm run build`
  - dev server `http://127.0.0.1:5197` 返回 200。
- 边界：
  - Playwright 与 Chrome DevTools MCP 都在本机 Chrome 启动阶段报 `spawn UNKNOWN`，本节点没有完成截图级视觉验收。
  - build 产物新增 KaTeX 字体资源，说明 Latex 插件已进包；后续如 bundle 压力明显，再做 Agent/Markdown 动态导入。

## 2026-04-28_170931 user-path-simplification-and-abc-canvas-contract

- 夏夏反思当前方案有变复杂的风险，确定用户主线应回到一个所见即所得工作台：上传题图后，在当前页面完成识别、编辑、确认、生成和预览，不靠跳页解释流程。
- 语音切分口径收窄：非板书普通口播不再强行逐句切分，可作为连续文本送阿里云语音；只有包含板书的内容按板书节点断句，并保持一行一句。
- 这样 B 轨天然按板书句对齐时间，负责板书出现时间和时长，降低对轴复杂度。
- ABC 角色再次确认：A 是真实语音主时钟，雷打不动；B 管板书出现的时间/时长；C 是画布对象的坐标和表演控制，可拖拽、可调 `x / y / speed / progress / style`。
- 旧项目音轨和图像显示控制可参考，但不能延续旧问题：没有拆 C 会导致 `x/y` 被绑定死。
- 新摘要：`doc/记忆足迹/摘要_2026-04-28_170931_用户路径简化与ABC画布口径.md`。

## 2026-04-28_192240 simplification-first-cut-c-canvas-drag-and-b-track-drag

- 按夏夏“我们是不是太复杂了些”的反思，先不引入 tldraw 主画布，不继续加页面，优先把旧白板资产里已经验证过的核心交互迁成 cleanroom 最小能力。
- `StagePreview` 中选中的 B 板书贴片现在可以直接在舞台画布里拖拽，拖拽写回 `TimelineClip.xPercent / yPercent`。
- B 轨板书片段现在可以在时间轴横向拖动整段，调整出现时间，片段时长保持不变。
- A 语音轨仍是主时钟，没有开放拖拽调轴。
- Store 新增 `updateBoardClip(clipId, patch)`，舞台和时间轴可按 id 更新 B 片段；Inspector 仍使用 `updateSelectedBoardClip`。
- 新摘要：`doc/记忆足迹/摘要_2026-04-28_192240_简化方案第一刀_C画布拖拽与B轨拖动.md`。
- 已验证：`npm run typecheck`、`npm run build`。
- 边界：B 轨左右边缘拉伸时长还没做；右侧 Inspector 仍可手动改开始/结束时间。

## 2026-04-28_200232 lightweight-workbench-playback-and-b-track-resize

- 夏夏确认方向：简单板轻一点，用户体验舒适一点，但播放按钮不能忘；前端继续用 AntD 拼组件，优先复用和拼图。
- 描红口径：C 层描红可降低舞台上奇怪数学符号渲染风险，但识别、文稿、TTS 的原始数学文本仍必须保真。
- 时间轴新增轻量播放区：AntD 圆形播放/暂停按钮 + Slider 进度条，游标写入 `TeachingProject.timeline.playheadMs`。
- 舞台预览优先显示当前播放时间命中的 B 板书片段；没有命中时显示用户选中的 B 片段。
- B 轨片段现在支持三种调整：拖中间平移整段、拖左侧把手改开始时间、拖右侧把手改结束时间。
- A 轨音频片段仍不开放拖拽，保持主时钟只读。
- 新摘要：`doc/记忆足迹/摘要_2026-04-28_200232_轻量工作台播放与B轨拉伸.md`。
- 已验证：`npm run typecheck`、相关 `antd lint`、`npm run build`。

## 2026-04-28_203914 workflow-experience-refresh-first-cut

- 夏夏看到页面变化后，确认下一步要把用户体验翻新和简化，让 workflow 流动起来。
- 左侧主卡片从“教学素材仓”改成“生成流程”，新增“下一步”hero，根据当前状态引导用户去题文确认、打开 Agent、生成 A 轨或播放微调。
- 新增 4 段 workflow rail：题目、文稿板书、A 轨语音、播放微调。
- `AssetWorkflowTabs` 改为受控组件，外层流程按钮可以直接切到对应步骤。
- 题目区文案简化为“题目输入”，明确图片识别和手动输入共用一个题文框。
- 删除没有真实动作的“修改编辑”按钮，改成“点击正文即可编辑”，减少误导。
- 新摘要：`doc/记忆足迹/摘要_2026-04-28_203914_工作流体验翻新第一刀.md`。
- 已验证：`npm run typecheck`、相关 `antd lint`、`npm run build`。

## 2026-04-28_210707 ui-design-skills-shell-refresh

- 夏夏问是否有 UI 设计 skills，并决定试用；本节点使用 `frontend-design` 与 `frontend-design-ruler`。
- 视觉方向定为“轻量教研剪辑台”：安静、工作台、主路径清楚，不做营销页和复杂装饰。
- 顶部 header 改成工作台 command bar，增加配置、题文、文稿板书、A轨状态 pill。
- 右上动作重新分层：文稿 Agent、配置、录屏交付；`录屏交付` 禁用并提示“完成播放检查后开放”，避免误触。
- 背景改为轻网格工作台质感，统一主卡片阴影、边界和间距。
- 新摘要：`doc/记忆足迹/摘要_2026-04-28_210707_UI设计技能试用与工作台外壳翻新.md`。
- 已验证：`npm run typecheck`、`npx antd lint src/App.tsx --format json`、`npm run build`、本地页面 200。
- 边界：Playwright MCP 仍因本机 Chrome `spawn UNKNOWN` 失败，未完成截图级视觉验收。

## 2026-04-29_094920 cleanroom-agent-modal-and-b-timeline-checkpoint

- 夏夏提醒窗口快满，本节点先做接力记录，不做大改动。
- 产品主线收敛：暂时不继续扩复杂数学、复杂分段、复杂自动化，先把简单算术题的用户体验跑顺。
- Agent 交互决定：
  - 顶部 workflow hero 与悬浮 `对话 Agent` 只打开 Agent。
  - `题文确认` 主按钮改为 `发送并生成`，负责确认题文、打开 Agent、触发一次生成。
  - 当前 `进入文稿 Agent` 文案与 `autoRun` 行为容易误导，需要拆开。
- Agent 弹窗方向：
  - 左侧候选预览 / 编辑 / 应用。
  - 右侧 Agent chat / 调整。
  - 弹窗加宽，背景加轻遮罩。
- B 贴片时间线方向：
  - 学音频/视频剪辑器素材轨，不把板书片段压成一层。
  - 贴片 1、贴片 2、贴片 3 按层级叠放；贴片区域可以覆盖整个画布宽度。
  - 参考目录：`tool\jianying-editor-skill-main`、`tool\CutDeck-main`。
- A/B/C 边界：
  - A 是真实语音 / TTS 主时钟，雷打不动。
  - B 管板书贴片出现时间、时长、层级。
  - C 管 canvas 坐标和表现，素材先收敛为纯黑文本，手写字体由夏夏指定。
- 语音与数学：
  - 不把 Agent 输出直接当最终分句。
  - 阿里云要念的数学必须是板书相关内容。
  - 复杂 LaTeX、奇怪符号、本地分段层暂缓，先做小学简单算术。
- 新接力文件：`C:\Users\Administrator\.codex\memories\xiaxia-continuity\batons\baton_2026-04-29_094920_cleanroom_agent_modal_b_timeline.md`。

## 2026-04-30_161542 Cleanroom Agent Open/Run Split And B/C Sticker Track

- Scope: `F:\code\room\cleanroom`
- User redlines:
  - Opening Agent must show a dialog with local chat history, not directly send the problem.
  - The generation action text should be `讲解生成`.
  - Agent modal should follow the sketch: left conversation, right `文案预览 / 修改编辑 / 确认文案` and `板书预览 / 修改编辑 / 确认板书`.
  - B is the board sticker timing track, not an audio track.
  - C is the material/canvas display track. Already written stickers must not disappear unless their B timeline range has ended.
  - Reference for timeline behavior: `cleanroom\tool\CutDeck-main`.

- Code changes:
  - `src\App.tsx`: split Agent open modes into `chat` and `generate`; `onOpenScriptAgent` opens only, `onGenerateScriptAgent` sends one request by request id.
  - `src\components\ProblemWorkspace.tsx`: primary action is now `讲解生成`; added separate `打开对话 Agent`.
  - `src\components\AgentReviewCard.tsx`: stores local chat history in `localStorage`; opening the modal no longer auto-runs; user send/regenerate still requests the Agent.
  - `src\components\ScriptAgentWorkspace.tsx`: modal layout changed to left conversation and right preview/edit cards; blank preview stays blank until generated or manually edited.
  - `src\components\StagePreview.tsx`: renders all currently visible board clips based on `playheadMs` and B clip `startMs/endMs`, instead of rendering only selected/active one.
  - `src\components\BoardTextSticker.tsx`: supports selected state and stable z-index stacking for multiple visible stickers.
  - `src\components\TeachingTimeline.tsx`, `TimelineTrackRow.tsx`, `TimelineClipBlock.tsx`, `VoiceTrack.tsx`: added playhead line and active clip highlighting, matching CutDeck/subtitle style.
  - `src\domain\teachingProject.ts`: seed demo keeps sticker 1 visible through sticker 2, so the overlap behavior is visible.
  - `src\styles.css`: updated Agent modal dimensions, B/C sticker selection styles, track playhead, active clip highlighting.

- Verified:
  - `npm run typecheck`
  - `npm run build`

- Remaining:
  - Need browser screenshot/manual check at `http://127.0.0.1:5196`.
  - Need decide whether B sticker end times should default to sentence end, next sticker end, or explicit user-adjusted persistence.
  - Need continue without touching `.env.local` or unrelated dirty recovery files.

## 2026-04-30_恢复后主线整理

- 夏夏完成 C 盘数据修复和云端同步备份后，阿圆重新确认 cleanroom 主线可接续。
- 当前 Git 主线仍在 `d5bb47f Split agent launch and persist board stickers`，历史提交完整。
- 找回的历史变更树 `F:\room\cleanroom\CHANGE_TREE.md` 已回到 `F:\code\room\cleanroom\CHANGE_TREE.md`。
- 今日临时记录 `F:\code\room\CHANGE_TREE-30.md` 已追加进正式 `CHANGE_TREE.md`。
- 暂存区清理口径：
  - 从暂存区移除 `cleanroom/tool`、`cleanroom/.tmp-*`、`cleanroom/runtime`，只是不纳入候选提交，不删除文件。
  - 从暂存区移除根目录 `.gitattributes/.gitignore/metadata.json` 删除、本机 `.vscode`、恢复 inventory csv、`RECOVERY_MAP_2026-04-30.md`。
  - 保留核心候选：`src/`、`scripts/`、`package*`、`vite.config.mjs`、`CHANGE_TREE.md`。
- 已验证：`npm run typecheck`。
- 边界：不读取、不打印、不提交 `.env.local`；不删除恢复出来的文件；不回滚夏夏找回的内容。

## 2026-04-30_B贴片轨截图修复

- 输入截图：`C:\Users\Administrator\Pictures\捕获.png`。
- 发现问题：
  - B 板书贴片轨只有一个大轨道，`贴片1/2/3` 只能靠截图外部标注解释。
  - 多个板书贴片视觉上挤在同一层，用户很难理解“已写过的板书继续存在，直到 B 时间结束”。
- 完成修改：
  - `src/components/TimelineTrackRow.tsx`
    - 对 `track.kind === 'board'` 单独渲染贴片层列表。
    - 默认至少显示 `贴片 1 / 贴片 2 / 贴片 3` 三条小层。
    - 每个板书 clip 独占一条贴片层，仍支持拖动整段和左右拉伸时长。
  - `src/styles.css`
    - 新增 `board-sticker-stack`、`board-sticker-lane-row`、`board-sticker-lane-label`、`board-sticker-lane` 样式。
    - B 轨变成像素材编辑器一样的层级轨道，空贴片层显示 `待放置`。
- 已验证：
  - `npm run typecheck`
  - `npm run build`
- 边界：
  - A 语音轨不改，仍是只读主时钟。
  - 本次只改时间轴呈现层，没有改变 TTS、Agent、`.env.local` 或真实数据合同。

## 2026-04-30_生成物本地保存目录待办

- 夏夏提醒：系统生成出来的内容需要给用户落文件夹保存，不能只存在浏览器状态里。
- 目标体验：
  - 设置页提供“本地保存路径”配置项，由用户填写。
  - 生成的文稿、板书、语音文件、时序 JSON、贴片素材、导出结果按项目保存到该目录下。
  - 每次生成应能形成一个清楚的项目文件夹，方便用户复查、交付、备份。
- 设计边界：
  - 普通浏览器前端不能直接任意写用户磁盘；需要本地网关 / Electron / Tauri / 文件系统授权 adapter 承接。
  - 前端设置里先保存“路径配置/引用”，真实写入由本地服务完成。
  - 不把 `.env.local`、API key、验证码写入生成物目录。
- 待做：
  - 在 `AppSettingsDrawer` 增加保存路径设置。
  - 定义 `GeneratedArtifact` / `ProjectSaveManifest` 合同。
  - 本地网关增加保存 endpoint，例如 `POST /api/project/save-artifacts`。
  - 生成语音和贴片素材时把文件路径回写到项目 manifest。

## 2026-04-30_B贴片层级与A轨分段边界

- 夏夏确认：
  - B 板书贴片有多少个，就显示多少个贴片层，不固定空造 `贴片1/2/3`。
  - `贴片 1` 是最底层，后续贴片层级依次更高。
  - 贴片层不能占满最高 z-index，需要给未来圈画、重点标记、箭头等 C 层标注留更高层。
  - 有的老师讲解很啰嗦，A 语音分段数量和 B 板书贴片数量不一样是正常的。
- 规则：
  - A 轨是语音主时钟，按真实语音分段/试听/生成组织。
  - B 轨是板书贴片时间层，只关心每个贴片自己的 `startMs/endMs`。
  - B 贴片数量不以 A 音频分段数量为约束；只在需要同步时通过时间范围对齐。
- 完成修改：
  - `TimelineTrackRow` 的 B 轨层数改为按实际 board clips 数量生成。
  - `TimelineClipBlock` 支持 `layerIndex`，贴片 z-index 从低层递增，保留未来更高的标注层空间。
- 待做：
  - 后续增加圈画/重点标记时，使用独立 marker/annotation 层，不压到 B 贴片底下。

## 2026-04-30_Qwen36Flash默认模型切换

- 夏夏测试后发现旧默认模型输出数学公式和计算稳定性不够，出现过 `rac{}` 这类坏 LaTeX 迹象。
- 查阿里云百炼官方模型文档后确认 `qwen3.6-flash` 是当前可用模型，文本与视觉理解列表均支持文本/图像/视频输入和文本输出。
- 完成修改：
  - `src/config/defaultConfig.ts`
    - recognition 默认模型从 `qwen3.5-35b-a3b` 改为 `qwen3.6-flash`。
    - scriptAgent 默认模型从 `qwen3.5-35b-a3b` 改为 `qwen3.6-flash`。
  - `vite.config.mjs`
    - 识别网关和文稿 Agent 网关的兜底模型改为 `qwen3.6-flash`。
  - `src/components/AppSettingsDrawer.tsx`
    - 设置页模型占位和视觉模型显示文案同步为 Qwen3.6 Flash。
- 已验证：`npm run typecheck`。
- 边界：
  - 换模型不替代本地数学健康检查；后续仍需检查坏 LaTeX、最终答案一致性、板书/口播同步。
  - 历史 `CHANGE_TREE.md` 中旧模型名保留，不回改历史记录。

## 2026-04-30_ai-whiteboard-main参考项目登记

- 夏夏已将参考项目放入：`F:\code\room\cleanroom\tool\ai-whiteboard-main`。
- 该项目定位：React + SVG 的 JSON 命令式白板，核心文件集中在：
  - `client/src/whiteboard/commandTypes.ts`
  - `client/src/whiteboard/ScriptRunner.ts`
  - `client/src/whiteboard/WhiteboardCanvas.tsx`
  - `AI_GUIDE.md`
- 可借鉴内容：
  - SVG `viewBox` 固定内部坐标，外层按容器缩放。
  - 命令脚本模型：`write_text`、`draw_line`、`draw_arrow`、`draw_path`、`wait`、`annotate_circle`、`annotate_underline`。
  - 主内容层与 annotation 批注层分离，圈画/下划线永远在板书贴片上方。
  - `ScriptRunner` 顺序执行命令，用 `requestAnimationFrame` 控制逐步出现。
- 边界：
  - 不整包迁入主项目；依赖和 UI 壳太重。
  - 只把它作为 C 层画布命令合同、批注层、播放暂停机制的参考。
  - `tool/` 已加入 `.gitignore`，防止外部参考项目误提交。

## 2026-04-30_C贴片公式显示试验

- 夏夏截图发现尴尬点：题目/板书里的 `\frac{}` 在预览舞台中坏成了 `rac{}`，C 贴片只能把坏文本照抄出来。
- 参考 `vue-mathjax-beautiful` 的方向后决定：
  - 不接 Vue 组件，不引入整套 MathJax。
  - 使用当前项目已有的 KaTeX 能力，先在 C 贴片显示层做公式渲染试验。
- 完成修改：
  - 新增 `src/modules/boardSticker/mathBoardText.ts`
    - 负责显示层修复常见坏 LaTeX：`\f + rac`、`rac{}`、`frac{}`。
    - 负责把板书文本切成普通文本 token 与公式 token。
  - 新增 `src/components/BoardMathStickerContent.tsx`
    - 对公式 token 使用 KaTeX 渲染。
    - 只影响 C 预览显示，不改源文案、不改 TTS。
  - 修改 `src/components/BoardTextSticker.tsx`
    - 含公式的贴片走 KaTeX 富文本。
    - 普通文字继续走原有手写 PNG 贴片。
  - 修改 `src/styles.css`
    - 补充公式贴片的行布局、中文提示词与 KaTeX 字号样式。
  - `package.json` / `package-lock.json`
    - 将 `katex` 显式登记为直接依赖，避免依赖传递不稳定。
- 已验证：
  - `npm run typecheck`
  - `npm run build`
- 边界：
  - 这是 C 层显示兜底，不替代前面的模型提示词和数学健康检查。
  - 后续仍需要做“源文本健康检查”，在进入 A 语音和 B 贴片前拦截坏 LaTeX。
- 追加修正：
  - 夏夏刷新后发现截图中的坏公式仍未变化，原因是圈出的区域属于题目预览/共享文本显示，不是 B 板书贴片。
  - `src/components/MathText.tsx` 已接入同一套坏 LaTeX 修复与 KaTeX 渲染。
  - 题目确认框、舞台题目区、文稿预览等使用 `MathText` 的位置都能获得显示层兜底。
  - 再次验证：`npm run typecheck`、`npm run build`。

## 2026-05-01_舞台题目区比例字号定稿

- 夏夏提出：题目的比例、大小、字号需要先定下来，避免题面抢占解答画布。
- 规则：
  - 预览舞台主角仍是解答/板书区域，题目只是左上角题面小抄。
  - 题目区固定在左上，宽度约为舞台内宽 `44%`，最大 `520px`。
  - 题目区最大高度 `104px`，超出隐藏，避免压住 C 板书贴片区。
  - 题目正文默认 `15px`、行高 `1.46`、半粗；公式与正文同字号显示。
  - 解答板书区从 `top: 166px` 开始，给题目留出稳定呼吸区。
- 完成修改：
  - `src/styles.css`
    - 在 `.stage-canvas--courseware` 中定义题目区 CSS 变量。
    - 收紧 `.courseware-problem-area` 宽高。
    - 收紧 `.stage-problem-text` 与内部 KaTeX 行距。
    - 下移 `.courseware-board-area` 起点，避免题目/板书叠住。
- 已验证：
  - `npm run typecheck`
  - `npm run build`

## 2026-05-01_C画布自定义尺寸入口

- 输入截图：`F:\code\room\cleanroom\tool\3.jpeg`。
- 夏夏指出：右侧 inspector 漏了“画布尺寸 / 用户自定义”入口。
- 设计结论：
  - 画布尺寸属于 C 舞台设置，不属于 B 片段控制。
  - 未选中 B 贴片时，右侧 inspector 应显示画布设置；选中 B 贴片时才显示 B 片段控制。
  - C 素材继续使用百分比定位，切换画布比例后贴片位置跟随缩放。
- 完成修改：
  - `src/domain/teachingProject.ts`
    - 新增 `StageCanvasConfig` / `StageCanvasPreset`。
    - `TeachingProject.stage.canvas` 默认 `1920×1080`。
  - `src/store/useTeachingEditorStore.ts`
    - 新增 `updateStageCanvas`。
    - 限制画布宽高范围为 `360..3840`。
  - `src/components/StagePreview.tsx`
    - 按 `project.stage.canvas.width/height` 设置舞台 `aspect-ratio`。
    - 背景色从 canvas 配置读取。
  - `src/components/InspectorPanel.tsx`
    - 未选中 B 贴片时显示“画布尺寸”面板。
    - 提供横屏 1080p、横屏 720p、4:3、竖屏、方屏、自定义。
    - 支持手动输入宽、高、背景色。
  - `src/App.tsx`
    - 接入 `project.stage.canvas` 和 `updateStageCanvas`。
- 已验证：
  - `npm run typecheck`
  - `npm run build`

## 2026-05-01_C贴片缩放与全白板可贴区

- 夏夏补充：
  - 板书素材右下角需要支持拖动缩放。
  - 白色画布区域都可以贴素材，不要被“题目 / 解答”两个角标分区限制。
  - 老师喜欢在整块白板上涂涂画画，所以可贴区域要大。
  - 素材边框在鼠标不按住/不悬停时透明化，避免控制框干扰观看。
- 完成修改：
  - `src/domain/teachingProject.ts`
    - `TimelineClip` 增加 `widthPercent`，作为 C 素材宽度比例。
  - `src/store/useTeachingEditorStore.ts`
    - B 贴片更新合同支持 `widthPercent`。
    - 宽度限制在 `8%..90%`。
  - `src/components/StagePreview.tsx`
    - 拖动素材本体移动 `xPercent/yPercent`。
    - 拖动右下角 handle 调整 `widthPercent`。
  - `src/components/BoardTextSticker.tsx`
    - 选中素材时挂载右下角缩放 handle。
    - 贴片宽度使用 `widthPercent`。
  - `src/components/InspectorPanel.tsx`
    - B 片段控制增加“素材宽度 %”。
  - `src/styles.css`
    - `courseware-board-area` 扩到整块白色板面内侧。
    - 素材选中边框默认透明，hover/focus/拖拽时显示。
    - 缩放 handle 默认透明，hover/focus/拖拽时显示。
- 已验证：
  - `npm run typecheck`
  - `npm run build`

## 2026-05-01_Agent弹窗候选稿保留

- 夏夏发现：文稿/板书 Agent 弹窗关闭后再打开，右侧文案预览和板书预览内容会消失。
- 原因：
  - `ScriptAgentWorkspace` 的 `candidateDraft` 存在组件本地 state。
  - Modal 关闭时使用 `destroyOnHidden`，组件卸载，候选稿随之丢失。
- 目标行为：
  - 用户不小心关闭弹窗，再打开仍保留候选文稿和板书。
  - 只有切换/重新输入下一题、重新识别题目时，旧候选稿才清空。
- 完成修改：
  - `src/store/useTeachingEditorStore.ts`
    - 新增全局 `scriptAgentCandidateDraft`。
    - 新增 `updateScriptAgentCandidateDraft`、`patchScriptAgentCandidateDraft`、`resetScriptAgentCandidateDraft`。
    - `updateProblemText` 和 `applyRecognizedProblemText` 会清空候选稿。
  - `src/components/ScriptAgentWorkspace.tsx`
    - 从受控 props 读取候选稿，不再用本地 state 保存。
    - Agent 生成和用户手改都回写 store。
  - `src/App.tsx`
    - 接入候选稿状态和 patch/update 方法。
- 已验证：
  - `npm run typecheck`
  - `npm run build`

## 2026-05-01_右侧画布尺寸常驻卡片

- 夏夏发现：选中素材后，右侧“画布尺寸”入口被素材控制覆盖，看起来像不见了。
- 产品口径：
  - 画布尺寸是给甲方看见的交付能力，应常驻在右侧面上。
  - 右侧应是两个清楚卡片：
    - 上：画布尺寸
    - 下：素材控制
  - 画布设置不跟随是否选中 B 贴片而隐藏。
- 完成修改：
  - `src/components/InspectorPanel.tsx`
    - 右侧改为两个独立 Card。
    - “画布尺寸”常驻顶部。
    - “素材控制”显示选中 B 贴片参数或空状态提示。
  - `src/styles.css`
    - 保留 `inspector-stack` 作为卡片间距容器。
- 已验证：
  - `npm run typecheck`
  - `npm run build`

## 2026-05-01_Inspector组件拆分

- 夏夏要求：页面组件要做好解耦和封装，拒绝给以后的我们留下小绊子。
- 同时输入截图：`F:\code\room\cleanroom\tool\feishu.png`。
  - 飞书自动化流程可作为后续第三方批量入口：新增记录后 POST 到我们的网关，携带题图/规则/链接。
  - 本次不扩飞书集成范围，先收右侧 Inspector 技术债。
- 完成拆分：
  - `src/components/InspectorPanel.tsx`
    - 只负责右侧卡片编排。
    - 不再承载画布字段、素材字段、草稿归一化逻辑。
  - 新增 `src/components/CanvasInspector.tsx`
    - 独立负责 C 舞台画布尺寸、规格、背景色。
  - 新增 `src/components/BoardClipInspector.tsx`
    - 独立负责选中 B/C 素材的文本、时间、位置、宽度、速度。
    - 导出 `BoardClipPatch`，供 `InspectorPanel` 和上层 store action 对齐。
- 边界：
  - 本次只拆成熟块，不改交互行为。
  - 后续新增图片素材、圈画、箭头等 C 控件时，应继续进素材控制子组件或再拆子组件，不回填到 `InspectorPanel`。
- 已验证：
  - `npm run typecheck`
  - `npm run build`

## 2026-05-01_小纸条字段与飞书导入合同

- 夏夏提出：继续按封装技巧给组件贴“小纸条”，写清楚组件模块、入参出参字段；一边做一边收拾。
- 夏夏同时继续折腾飞书多维表格，希望多维表格直接给我们：
  - 题目
  - 板书-文稿
  - 带阿里云语音符号的文稿
- 决策：
  - 先不接真实飞书接口、不碰 token、不接 HTTP。
  - 先建立本地数据合同，让后续飞书自动化 POST 进来时有稳定入口。
- 完成修改：
  - `src/components/CanvasInspector.tsx`
    - 小纸条补充 `@fields: canvas.preset, canvas.width, canvas.height, canvas.background`。
  - `src/components/BoardClipInspector.tsx`
    - 小纸条补充 `@fields: clip.label, clip.startMs, clip.endMs, clip.xPercent, clip.yPercent, clip.widthPercent, clip.drawSpeed`。
  - 新增 `src/modules/feishuImport/README.md`
    - 记录飞书导入模块边界：只做数据归一化，不做 HTTP/token/UI/TTS/timeline。
  - 新增 `src/modules/feishuImport/index.ts`
    - 定义 `FeishuBoardScriptRecord`。
    - 定义 `FeishuBoardScriptImport`。
    - 提供 `normalizeFeishuBoardScriptRecord`。
    - 提供 `hasUsableFeishuBoardScriptRecord`。
- 字段合同：
  - 飞书输入：`problemText`、`boardScriptText`、`speechMarkedScript`、`sourceRecordId`。
  - 内部输出：`problemText`、`draft.spokenScript`、`draft.boardPlan`、`sourceRecordId`。
  - 若 `speechMarkedScript` 为空，先用 `boardScriptText` 兜底生成 `spokenScript`。
- 已验证：
  - `npm run typecheck`
  - `npm run build`

## 2026-05-01_飞书lark-cli参考资料登记

- 夏夏下载飞书官方 CLI 源码到：
  - `F:\code\room\cleanroom\tool\cli-main`
- 定位：
  - 该目录只作为本地参考资料和调试工具。
  - `tool/` 是外部参考资产区域，不纳入前端依赖，不提交下载项目本体。
- 已阅读关键资料：
  - `tool\cli-main\README.zh.md`
  - `tool\cli-main\skills\lark-base\SKILL.md`
  - `tool\cli-main\skills\lark-base\references\lark-base-record-read-sop.md`
  - `tool\cli-main\skills\lark-base\references\lark-base-workflow-guide.md`
- 结论：
  - 开发期可用 `lark-cli base +field-list`、`+record-get`、`+record-search`、`+record-list` 查多维表格字段和记录。
  - 写入或批量更新前必须先查真实字段结构，不能靠自然语言猜字段名。
  - 正式产品链路仍保持“飞书自动化 POST 到后端/网关 -> 后端归一化 -> 前端接收安全教学数据”。
  - 前端不保存、不传递飞书 app token、user token 或真实凭证。
- 同步补充：
  - `src/modules/feishuImport/README.md`
    - 增加 `lark-cli debug path`。
    - 增加 `production path`。
    - 增加推荐字段映射：`题目`、`板书-文稿`、`语音标记文稿`、`record_id`。

## 2026-05-01_Zeabur演示部署最小配置

- 夏夏购买 Zeabur 2H4G，希望走部署项目，使用 Zeabur 官方二级域名演示。
- 判断：
  - 如果只部署静态 `dist/`，当前识别、Agent、CosyVoice TTS 这些接口会缺失。
  - 因为这些演示 API 暂时挂在 Vite dev gateway 里，明天演示先让 Zeabur 启动带 gateway 的 Vite 服务。
  - 这是演示部署方案，不是长期生产架构；后续应拆成正式后端网关。
- 完成修改：
  - `package.json`
    - 新增 `start`: `node scripts/zeabur-start.mjs`。
  - 新增 `scripts/zeabur-start.mjs`
    - 读取 Zeabur 注入的 `PORT` / `ZEABUR_PORT`。
    - 监听 `0.0.0.0`，允许 Zeabur 官方域名访问。
    - 启动现有 Vite 配置，因此保留本地 gateway API 行为。
  - 新增 `zbpack.json`
    - 固定 Zeabur 构建命令：`npm run build`。
    - 固定 Zeabur 启动命令：`npm run start`。
  - `.env.example`
    - 补充 `DASHSCOPE_API_KEY`，与当前网关代码使用的环境变量对齐。
- Zeabur 环境变量：
  - 必填：`DASHSCOPE_API_KEY`
  - Zeabur 自己会注入 `PORT`，不用手填。
- 边界：
  - 不把 `.env.local`、真实 key、测试 key 提交到仓库。
  - 不把飞书凭证放前端。

## 2026-05-01_C画布录制与手写显现方案决策

- 夏夏确认方向：C 最像板书手写的方案选择“第 2 层”。
- 决策：
  - 不追求真正中文笔画笔顺。
  - 不把外部录屏工具整包接进主项目。
  - C 最优播放/录制方向是：贴片素材 + 遮罩逐字/逐行描红式露出。
- 方案口径：
  - 编辑时仍用当前 DOM 舞台，方便用户拖拽、缩放、调位置。
  - 播放/录制时由 CCanvasRenderer/CCanvasRecorder 按 B 贴片时间重新绘制到 canvas。
  - 用 `canvas.captureStream()` 录制播放过程。
  - 每个 B 贴片先渲染为黑色素材，数学公式也可先渲染成透明底黑色图，再通过遮罩露出。
  - 遮罩按字/按行推进，配合速度抖动、停顿、笔尖点，形成接近老师书写的观感。
- 分工保持：
  - A：语音主时钟。
  - B：决定什么时候写、写多久、贴片层级与位置。
  - C：按 B 的时间和位置负责显示、描红式露出、录制。
- 边界：
  - 当前不做真正笔顺库。
  - 当前不把 Screenity / bloom-shadow / joom 整包纳入主项目。
  - MP4 导出可以后续通过 WebAV 或后端转码补，不阻塞 C 的手写显现方案。

## 2026-05-01_组件合同与配置贯穿体检

- 夏夏担心：页面继续变重以后，组件参数映射、出参入参、配置贯穿会乱。
- 已做只读体检：
  - `AppSettingsDrawer` 的“画布 / 字体 / 保存”目前有展示控件，但多数没有 `Form.Item name`，还不是配置真相。
  - C 字体真实字段现在在 `TeachingProject.stage.canvas`，右侧 Inspector 能改当前工程，但全局设置还没有同步“默认 C 字体地址 / 字体名”。
  - `AppConfig` 现在覆盖 API、识别、文稿 Agent、TTS、知识库、自动化，但还缺 `stageDefaults` / `output`。
  - `TeachingProject` 还没有最小刷新持久化，C 字体、贴片位置、题文刷新会丢。
  - 部分组件小纸条字段说明已落后真实 props。
- 新增审计文件：
  - `COMPONENT_CONTRACT_AUDIT_2026-05-01.md`
- 新增技术债：
  - `TD-028`：设置页与真实 workflow 配置未贯穿。
  - `TD-029`：组件小纸条字段漂移。
  - `TD-030`：当前工程状态刷新后会丢。

## 2026-05-01_底座复盘表

- 夏夏提出：底子一定要硬，要像积木一样，明确本地缓存、持久化、写库字段、参数出入、业务流、ABC 来源和唯一真相。
- 新增：
  - `FOUNDATION_REVIEW_TABLE_2026-05-01.md`
- 复盘表包含：
  - 真相分层表。
  - 本地缓存与持久化边界。
  - ABC 唯一真相表。
  - 业务流关系表。
  - 配置贯穿表。
  - 组件入参与出参复盘表。
  - 字段写入权表。
  - 当前不够硬的点与下一步顺序。
- 核心结论：
  - `AppConfig` 管全局默认配置。
  - `TeachingProject` 管当前工程真相。
  - 候选态和运行时缓存不能冒充正式资产。
  - 当前优先修 `TD-028` Settings 真实贯穿，再修 `TD-030` 当前工程持久化。
- 追加记录：
  - 录制文件边界单独登记为 `TD-031`。
  - 当前 `StageRecorderControl` 产出的 Blob 只是运行时缓存和验证按钮，不是最终导出真相。
  - 最终应由 `CCanvasRecorder` 产出正式文件，并写回 `TeachingProject.assets(kind=exportResult)`。

## 2026-05-01_TD-028_Settings真实贯穿

- 目标：把 Settings 里原来的“画布 / 字体 / 动效 / 保存”假控件收成真实 `AppConfig` 字段。
- 边界：
  - Settings 管全局默认值。
  - `TeachingProject.stage.canvas` 管当前工程 C 舞台真相。
  - 保存 Settings 不静默覆盖当前工程。
- 完成修改：
  - `src/config/defaultConfig.ts`
    - 新增 `stageDefaults.canvas`：默认画布规格、宽高、背景、C 字体名和字体地址。
    - 新增 `typography`：界面字体策略、默认板书字号。
    - 新增 `effects`：默认板书出现方式、默认贴图透明度。
    - 新增 `output`：保存位置标识、命名模板、录制格式、帧率、质量、是否写入交付记录。
  - `src/components/AppSettingsDrawer.tsx`
    - `CanvasSettings`、`TypographySettings`、`EffectSettings`、`FileSettings` 全部接入真实 `Form.Item name`。
    - 画布规格切换会同步默认宽高。
    - 明确提示这里是新工程默认值，不是当前工程覆盖。
  - `src/store/useTeachingEditorStore.ts`
    - `mergeConfig` 兼容旧 localStorage，自动补齐新配置段。
    - 字体地址/字体名做基础归一化。
  - `TECH_DEBT_LOG.md`
    - `TD-028` 标记为已处理。
- 已验证：
  - `npm run typecheck`

## 2026-05-02_硬盘事故后wb-main生存线收束

- 背景：
  - 夏夏的 F 盘出现文件系统损坏迹象，旧入口 `F:\code\room\cleanroom` 不再可信。
  - 当前目标不是全盘恢复，而是先守住这个月生计线：让最新存活项目能独立打开、能继续小步迭代。
- 当前真相顺序：
  1. `C:\Users\Administrator\Desktop\wb-main`
     - 最新存活项目根。
     - 后续代码、文档、脚本、迭代以这里为准。
  2. `C:\Users\Administrator\Downloads\cleanroom-zeabur-source-20260501-061146\cleanroom-zeabur`
     - 中间旧服务器包。
     - 没有最新修改，只能用于比较和部署上下文参考。
  3. `H:\code\room\cleanroom`
     - 2026-04-28 最旧包。
     - 只准作为只读环境/缺件来源。
- 已处理：
  - `wb-main` 内 `node_modules` 已恢复。
  - 从 `H:\code\room\cleanroom\runtime\node` 只复制了便携运行时到 `wb-main\runtime\node`。
  - 没有从旧 zeabur 或 H 盘包复制旧源码覆盖 `wb-main`。
  - 停掉了误用本机 `D:\node` 拉起的 dev server。
  - 当前 dev server 已由 `wb-main\runtime\node\node.exe` 启动。
  - `RECOVERY_MAP_2026-04-30.md` 已记录事故后的 source order 和 portable runtime boundary。
  - `C:\Users\Administrator\.codex\memories\xiaxia-continuity\batons\current-baton.md` 已改为从 `wb-main` 回来。
  - `C:\Users\Administrator\.codex\memories\xiaxia-continuity\notes\2026-05-02_wb-main-hard-disk-recovery-truth.md` 已保存事故真相记录。
- 已验证：
  - `doctor.bat` 通过，doctor 看到 Node `20.20.2`。
  - portable-runtime 口径 typecheck 通过。
  - `status-dev.bat` 显示 `http://127.0.0.1:5196` running。
  - 进程命令行确认 5196 来自 `wb-main\runtime\node\node.exe`，不是 `D:\node`。
  - `Invoke-WebRequest http://127.0.0.1:5196` 返回 `200`。
- 硬边界：
  - 不碰 F 盘写入。
  - 不从旧 zeabur 包或 H 盘 28 日包回滚最新源码。
  - 不让本机 `D:\node` 成为项目能打开的前提。
  - 旧残留只当证据、对照、spare parts。
- 下一小步：
  - 先在 `wb-main` 里核对 TD-030 的最新持久化修改是否还在。
  - 每完成一小步，立即更新 `CHANGE_TREE.md` 和 continuity baton/notes。

## 2026-05-02_全局设置真相源审计

- 目标：
  - 只核对“设置真相是不是唯一”，不扩功能。
  - 重点看 API 配置、模型、提示词、TTS、舞台默认值、板书同步标记和断句口径。
- 当前确认：
  - 全局配置类型与默认值集中在 `src/config/defaultConfig.ts` 的 `AppConfig` / `defaultConfig`。
  - 运行态配置由 `useTeachingEditorStore.config` 持有。
  - 持久化 key 是 `cleanroom-app-config-v1`。
  - 配置保存入口是 `AppSettingsDrawer -> updateConfig -> mergeConfig -> localStorage`。
  - `App.tsx` 从 store 取 `config`，再分发给识别、文稿 Agent、TTS、设置抽屉。
  - `recognition.promptSystem` / `scriptAgent.promptSystem` 已属于 `AppConfig`。
  - 设置抽屉已绑定 `recognition.promptSystem`、`recognition.promptUserTemplate`、`scriptAgent.promptSystem`、`scriptAgent.promptUserTemplate`。
  - 当前工程 C 舞台真相仍是 `TeachingProject.stage.canvas`；`AppConfig.stageDefaults.canvas` 只是新工程默认值，这个边界是正确的。
- 重要口径更新：
  - A 轨发给阿里云语音的分段真相：根据 Agent 生成的 `<br>` 切分。
  - B 轨板书同步真相：根据口播稿里的 `<b>...</b>` 抽取。
  - 发给阿里云前剥掉 `<b></b>` 标签，但保留标签中间文字朗读。
- 已发现设置噪音：
  1. `src/agent/scriptBoardAgentPrompt.ts`
     - 仍保留旧 `.......` / “句号 + 换行”提示词合同。
     - 当前搜索只命中自身，未见现役 import。
     - 暂定为旧残留，后续应归档或删除，避免误当第二提示词真相。
  2. `src/domain/teachingProject.ts`
     - seed asset summary 仍写“带成对 ....... 同步标记的逐句讲解稿”。
     - 这是活跃种子文案噪音，应改为 `<br>` 分段 + `<b></b>` 板书同步。
  3. `scripts/check-board-clips-merge.mjs` / `scripts/check-board-events.mjs`
     - 仍有 `►...◄` legacy 测试语义。
     - 若只是兼容测试可以保留，但命名和说明要标清 legacy，不应作为新真相。
  4. `vite.config.mjs`
     - recognition / script-agent gateway 里有 endpoint、model、prompt template 兜底默认值。
     - 这些兜底与 `defaultConfig` 重复，属于可运行防线，但长期应收敛为“缺配置即报错”或复用 `defaultConfig`，避免第二默认源。
  5. TTS gateway
     - 前端 `AppConfig.tts` 管 endpoint/model/voice/apiKeyRef。
     - Vite dev gateway 当前仍直接读取 `DASHSCOPE_API_KEY`，没有使用 `tts.apiKeyRef`。
     - 这是 TTS 配置贯穿缺口，后续要补成从请求配置或统一环境映射读取。
- 不在本步处理：
  - 不删除旧文件。
  - 不大改 gateway。
  - 不改 UI 布局。
  - 不扩到 Coze/MCP/批量工作流实现。
- 下一小步建议：
  - 先修活跃噪音：`src/domain/teachingProject.ts` 的 seed 文案。
  - 再处理旧残留：把 `src/agent/scriptBoardAgentPrompt.ts` 标为 legacy 或移除。
  - 最后处理 gateway 兜底默认值和 TTS `apiKeyRef` 贯穿。

## 2026-05-02_旧同步标记及时收线

- 目标：
  - 不让旧 `.......` / `►...◄` / “句号 + 换行”口径继续污染未来判断。
  - 当前新真相：阿里云 A 轨按 Agent 生成的 `<br>` 切分；B 轨按 `<b>...</b>` 抽取板书同步贴片。
- 已改：
  - `src/config/defaultConfig.ts`
    - `scriptAgentPromptSystem` 升级为 `<br>` 语音分段 + `<b></b>` 板书同步规则。
  - `src/modules/timeline-factory/splitScriptIntoTtsSentenceUnits.ts`
    - 新增 `<b>...</b>` 标记识别。
    - 拆句优先按 `<br>`。
    - 暂保留旧 `.......` / `►...◄` 兼容，不再作为新真相。
  - `scripts/check-script-splitter.mjs`
    - 主样例改成 `<br>` / `<b>`。
  - `src/domain/teachingProject.ts`
    - seed 文案改成 `<br>` 语音分段 + `<b></b>` 板书同步。
  - `src/agent/scriptBoardAgentPrompt.ts`
    - 标为 legacy local demo fallback。
    - 本地 demo 草稿改成 `<br>` / `<b>`。
  - `scripts/check-board-clips-merge.mjs`
    - marker 示例改成 `<b>同步点</b>`。
  - `scripts/check-board-events.mjs`
    - 检查 board event 文本不含同步标记外壳。
- 已验证：
  - `runtime\node\npm.cmd run typecheck` 通过。
- 当前阻塞：
  - `runtime\node\npm.cmd run check:script-splitter` 失败。
  - 失败点是检查脚本临时编译后的 ESM import 找不到：
    `modules/speechText/aliyunMathSpeechText`
  - 这不是 `<br>` / `<b>` 规则断言失败；下一刀先修检查脚本的临时编译/导入方式。
- 下一小步：
  - 修 `check-script-splitter.mjs` 运行方式。
  - 用 portable runtime / launcher 口径重跑 `typecheck`、`check:script-splitter`、`check:board-events`、`check:board-clips-merge`。

## 2026-05-02_旧同步标记检查补齐通过

- 目标：
  - 把 `<br>` 语音断句和 `<b></b>` 板书同步的新真相跑通到检查脚本。
  - 避免把检查脚本自身的 ESM 临时导入问题误判为业务规则失败。
- 已修：
  - `scripts/check-script-splitter.mjs`
    - 临时编译后，补齐 emitted ESM import 的 `.js` 指向，让检查脚本可以在 `.tmp-script-splitter-check` 中正确加载 `aliyunMathSpeechText`。
- 已验证：
  - 使用 `wb-main\runtime\node` 置前的 portable PATH 口径执行。
  - `npm run check:script-splitter` 通过。
  - `npm run check:board-events` 通过。
  - `npm run check:board-clips-merge` 通过。
- 确认：
  - `check:script-splitter` 已按 `<br>` 切出 3 段。
  - 含 `<b>25×4＝100</b>` 的段落能保留朗读文字，并抽出板书同步标记。
  - board event / board clip 检查不再把旧 `►...◄` 当新真相。

## 2026-05-02_用户侧问题图_1png

- 来源：
  - 夏夏提供的 `doc\语音资料\1.png`。
- 图中确认的问题不是“删除线”本身，而是用户侧流程断点：
  1. 数据持久化不足：
     - 任务生成内容刷新后丢失。
     - 用户回来找不到本次任务的口播稿、板书、语音返回、生成音频等资产。
  2. 本地任务资产需要落地：
     - 第一步建议让用户设置本地保存文件夹。
     - 每个任务用任务编号/任务名建子文件夹。
     - 子文件夹内保存口播稿 JSON、板书 JSON、阿里云语音 JSON 返回件、生成音频等。
     - 时间轴点击时，应能从本地保存资产回放。
  3. “确认应用到正式稿”反馈不足：
     - 用户编辑后点击确认，没有清晰反馈。
     - 没有跳到下一步，也没有告诉用户正式稿已经接住。
  4. 按钮重复：
     - 文案区域同时出现多个确认/应用按钮，容易让用户不确定该点哪一个。
  5. 短期可落点：
     - 先做轻量 IndexedDB / Dexie 任务记录，至少保证生成任务刷新后仍可找回。
     - 再做本地文件夹资产落地。
- 下一小步建议：
  - 优先修可见 UX 债：确认按钮重复和确认后无反馈。
  - 持久化作为下一条主线，先核对现有 `cleanroom-current-project-v1` / 项目持久化，再决定 Dexie 最小切入。

## 2026-05-02_确认正式稿按钮收线

- 目标：
  - 先修 `1.png` 中最可见、最小范围的 UX 债。
  - 解决“确认应用到正式稿”后没有反馈，以及文案/板书区域按钮重复的问题。
- 已改：
  - `src/components/ScriptAgentWorkspace.tsx`
    - 删除文案卡片里的单独“确认文案”按钮。
    - 删除板书卡片里的单独“确认板书”按钮。
    - 保留顶部唯一主入口“确认应用到正式稿”。
    - 点击后记录当前候选稿签名，按钮变为“已应用到正式稿”并禁用，避免重复点击误解。
    - 点击后显示成功提示：文案和板书已写入正式预览，可以继续生成语音和时间轴。
  - `src/App.tsx`
    - 移除 `ScriptAgentWorkspace` 不再需要的单项文案/板书确认回调传递。
  - `src/styles.css`
    - 给应用成功提示加最小间距。
    - 文案/板书编辑卡片去掉原按钮预留行。
- 已验证：
  - 使用 `wb-main\runtime\node` 置前的 portable PATH 口径执行。
  - `npm run typecheck` 通过。
- 未处理：
  - 任务刷新丢失和本地文件夹资产落地还没改。
  - Dexie / IndexedDB 任务记录作为下一条持久化小步处理。

## 2026-05-02_下一步看红字提醒

- 夏夏提醒：
  - 下一步重点看 `doc\语音资料\1.png` 的红字。
  - 不要把问题简化成“IndexedDB 持久化”一句话。
- 红字真相：
  - 现在最大问题是数据持久化，刷新网页后当前任务丢失。
  - 第一步让用户设置文件保存的本地文件夹地址。
  - 按任务编号/任务名创建子文件夹。
  - 子文件夹内保存口播稿文本 JSON、板书 JSON、阿里云语音 JSON 返回件、阿里云生成语音文件等任务资产。
  - 时间轴点击时应能从本地保存资产播放。
- 下一步边界：
  - 先核对现有 `wb-main` 里的项目持久化和本地缓存。
  - 再围绕红字设计最小本地任务资产落地。
  - Dexie / IndexedDB 可以做任务索引，但不能替代本地资产文件夹。

## 2026-05-02_红字持久化最小落地

- 目标：
  - 按 `doc\语音资料\1.png` 红字先挡住“刷新丢任务”和“任务资产找不到”。
  - 不做大文件管理器，不碰旧包，不改服务端部署结构。
- 核对到的现状：
  - `package.json` 已有 `dexie` 依赖。
  - `src` 里此前没有实际使用 Dexie / IndexedDB。
  - 当前只有配置 `cleanroom-app-config-v1` 和 Agent 聊天记录进 `localStorage`。
  - `useTeachingEditorStore.project` 仍从 `createSeedProject()` 起步，刷新后丢任务判断成立。
- 已改：
  - `src/modules/localTaskArchive/localTaskDb.ts`
    - 新增 Dexie 数据库 `cleanroom-local-task-archive`。
    - 自动保存当前工程快照到 `taskSnapshots.current`。
    - 页面打开时尝试恢复当前工程快照。
    - 移除不可恢复的 `blob:` 临时引用，避免刷新后假装可用。
  - `src/modules/localTaskArchive/localTaskArchive.ts`
    - 新增浏览器 File System Access API 保存逻辑。
    - 用户点击后主动选择本地文件夹。
    - 按日期 + 任务名创建任务子文件夹。
    - 写出 `project.json`、`oral-script.json`、`board.json`、`voice-timing.json`、`voice-audio-index.json`。
    - 尝试抓取当前 A 轨音频 URL，并写成 `audio-001.mp3` 等本地音频文件；抓不到时不阻塞 JSON 归档。
  - `src/store/useTeachingEditorStore.ts`
    - 新增 `restoreProjectSnapshot(project)`，用于从 IndexedDB 恢复当前工程。
  - `src/App.tsx`
    - 启动时读取 Dexie 当前工程快照。
    - 工程变更后延迟自动保存当前快照。
    - 连接“保存当前任务到本地文件夹”动作。
  - `src/components/AssetPanel.tsx`
    - 左侧流程区新增按钮：`保存当前任务到本地文件夹`。
    - 保存成功后提示任务文件夹名、JSON 数量、音频保存数量。
  - `src/styles.css`
    - 给本地保存按钮补最小间距。
- 红字对应关系：
  - 刷新丢失：Dexie 当前工程快照先兜住。
  - 本地保存文件夹：用户点击按钮选择本地文件夹。
  - 任务子文件夹：按日期 + 任务名创建。
  - 口播/板书/语音返回/音频资产：先以 5 个 JSON + 可抓取音频文件落地。
  - 时间轴播放：当前仍使用 timeline clip 的 `sourceRef` 播放；本步先保存本地音频文件和索引，尚未把时间轴切到文件夹回放。
- 已验证：
  - 使用 `wb-main\runtime\node` 置前的 portable PATH 口径执行。
  - `npm run typecheck` 通过。
  - `http://127.0.0.1:5196` 返回 200。

## 2026-05-02_B轨不预填与任务文件夹自增

- 夏夏提醒：
  - B 轨道不要有预设填充，因为会把真实生成的 B 贴片内容直接挤掉。
  - 工程文件夹什么时候新建：用户上传截图并触发生成 Agent 时，就视为新任务。
  - 一个图片题目对应一套产出。
  - 在用户选择的工程文件夹子文件夹里按时间 + 序号自增。
- 已改：
  - `src/domain/teachingProject.ts`
    - 删除 seed 工程里的 `clip-board-1` / `clip-board-2` 演示 B 贴片。
    - 新工程 B 轨不再预填 `25×4=100`、`1200÷100=12`。
  - `src/modules/localTaskArchive/localTaskDb.ts`
    - 读 current / saved 快照时净化旧 seed 演示 B 贴片，避免浏览器旧 IndexedDB 把假 B 贴片恢复回来。
    - 写快照时也过滤旧 seed 演示 B 贴片。
  - `src/modules/localTaskArchive/localTaskArchive.ts`
    - 导入 `project.json` 时过滤旧 seed 演示 B 贴片。
    - 保存到本地工程文件夹时，不再直接用固定目录名覆盖。
    - 在用户选择的工程文件夹下创建任务子文件夹：
      - 基础名：`任务时间-题目名`
      - 序号：`001`、`002`、`003` 自增
      - 示例：`task20260502-153012-题目图-001`
  - `src/store/useTeachingEditorStore.ts`
    - 上传题图时生成新的 `taskYYYYMMDD-HHMMSS` 任务身份。
    - 一个题图导入后重置下游工程资产和候选稿，保留当前画布设置。
    - 工程标题使用题图文件名；没有文件名时使用任务 id。
  - `src/components/TimelineTrackRow.tsx`
    - B 轨没有贴片时显示空状态：等待按 `<b>` 标记和 A 轨 timing/json 生成真实 B 贴片。
  - `src/styles.css`
    - 补 B 轨空状态样式。
- 已验证：
  - 使用 `wb-main\runtime\node` 置前的 portable PATH 口径执行。
  - `npm run typecheck` 通过。
  - `http://127.0.0.1:5196` 返回 200。
- 当前边界：
  - 当前仍是用户点击“保存当前任务到本地文件夹”时请求目录权限并创建任务子文件夹。
  - 浏览器不能在未授权目录前静默创建本地文件夹；真正“上传并触发 Agent 时立即建本地目录”需要先让用户选择并授权工程根目录。

## 2026-05-02_文稿字段映射与br唯一断句

- 夏夏发现：
  1. 第二步文稿 Agent 生成后，有时放不进对应预览窗。
     - 本质是生成产物字段映射漏了。
     - AI 如果不按 `spokenScript` / `boardPlan` 英文字段返回，预览窗就可能拿不到字段。
  2. 阿里云断句依据有且只有一个：`<br>`。
     - 只根据 `<br>` 分段发送阿里云。
     - 其余标点、换行、`<b>` 一律不参与阿里云断句。
     - `<b>` 只属于 B 轨板书贴片，和语音换行没有关系。
  3. 点击“确认应用到正式稿”后，应自动跳到左侧栏 A 轨语音生成。
- 已改：
  - `vite.config.mjs`
    - `parseScriptAgentDraft()` 不再只认 `spokenScript` / `boardPlan`。
    - 支持从 `draft` / `data` / `result` / `output` / `生成结果` / `产物` 等嵌套对象中取字段。
    - 口播稿字段别名包括：`spokenScript`、`oralScript`、`speechScript`、`scriptText`、`voiceScript`、`口播文稿`、`语音口播稿`、`口播稿`、`讲解稿`、`文稿`。
    - 板书字段别名包括：`boardPlan`、`boardScript`、`boardLayout`、`blackboardPlan`、`板书内容`、`板书计划`、`板书`。
    - 字段值如果是字符串数组，会合并成多行文本。
  - `src/modules/timeline-factory/splitScriptIntoTtsSentenceUnits.ts`
    - 拆分阿里云 TTS units 时，只按 `<br>`。
    - 没有 `<br>` 时整段作为一个 TTS unit，不再按中文标点、英文标点、换行拆句。
    - `<b>` 只剥标签保留朗读文字，不制造 TTS 断句。
    - 一个 `<br>` 段里如果有多个 `<b>`，保留为 `boardMarkerTexts`，避免 B 标记丢失。
  - `src/domain/teachingProject.ts`
    - `TtsSentenceUnit` 增加 `boardMarkerTexts?: string[]`，兼容一个语音段对应多个 B 贴片。
  - `src/modules/timeline-factory/createBoardEventsFromTtsUnits.ts`
    - 从 `boardMarkerTexts` 生成多个 B 事件。
    - 同一语音段里的多个 `<b>` 共享该 A 段 timing，不影响阿里云断句。
  - `src/App.tsx`
    - 点击确认正式稿后，关闭文稿 Agent 弹窗。
    - 自动请求左侧工作流跳到 `voiceAudio`。
  - `src/components/AssetPanel.tsx`
    - 新增工作流外部跳转请求接收逻辑。
    - 即使当前已经停在 A 轨语音，重复确认正式稿也能再次触发跳转。
  - `scripts/check-script-splitter.mjs`
    - 增加断言：没有 `<br>` 时标点不拆句。
    - 增加断言：`<b>` 不拆阿里云 TTS unit。
    - 增加断言：一个语音段里多个 `<b>` 会完整保留给 B 轨。
- 已验证：
  - 使用 `wb-main\runtime\node` 置前的 portable PATH 口径执行。
  - `npm run typecheck` 通过。
  - `npm run check:script-splitter` 通过。
  - `npm run check:board-events` 通过。
  - `npm run check:board-clips-merge` 通过。
  - `npm run check:board-event-clips` 通过。
  - `node --check vite.config.mjs` 通过。
  - `http://127.0.0.1:5196` 返回 200。

## 2026-05-02_左侧音频面板AntD化

- 夏夏指出：
  - 左边面板的音频状态也应该更像 AntD UI。
  - 图中重点是真实流程：按 `<br>` 分句，请求阿里云，JSON 返回，MP3 音频生成，然后入 A 轨。
- 已改：
  - `src/components/VoiceBatchStatusPanel.tsx`
    - 去掉手画灰框/黄标状态块。
    - 改成 AntD `List` 展示每句音频任务。
    - 每句使用 AntD `Steps` 显示三段：`JSON` / `MP3` / `A轨`。
    - 顶部用 AntD `Progress` 显示入 A 轨进度。
    - 空状态用 AntD `Empty`，提示确认文稿后按 `<br>` 拆成逐句 A 轨任务。
    - 文案明确：按口播稿里的 `<br>` 分句请求阿里云；JSON 返回、MP3 音频、入 A 轨分步点亮。
  - `src/styles.css`
    - 收敛音频列表样式，使用 8px 圆角和 AntD List/Steps 布局。
- 已验证：
  - 使用 `wb-main\runtime\node` 置前的 portable PATH 口径执行。
  - `npm run typecheck` 通过。
  - `http://127.0.0.1:5196` 返回 200。

## 2026-05-02_ABC时间轴交互骨架

- 夏夏补充 28 号图稿时间轴真相：
  - A 轨 = 预录制配音声优。
    - 语音主时钟。
    - 可以播放、按句试听、检查、必要时重新生成。
    - 不让用户随意手改时间。
  - B 轨 = 剧本指导 + 场务。
    - 以 A 返回的带标记分片 timing/json 为依据。
    - 负责节奏剧本，指导 C 表演什么、什么时候开始。
    - B 文本贴片按 JSON 入轨，可以调整。
    - B 决定 C 的时长，B 调整 C 也跟着调整。
  - C 层 = 演员角色。
    - 根据 B 的要求，在画布上选择站位 `x/y` 并表演。
    - 控制显示内容、速度/进度、时机。
    - 不改语音本身。
- 当前代码核对：
  - A 轨音频片段在 `TimelineClipBlock` 中不可拖动，符合“不让用户随意手改时间”。
  - B 板书片段可拖动 start/end/range，符合“B 可以调整”。
  - 右侧 `BoardClipInspector` 当前同时调 B 时间和 C 站位/速度，后续需要进一步拆清 B/C 标签。
- 已改：
  - `src/components/TeachingTimeline.tsx`
    - 时间轴顶部原则条改为 A/B/C 三段角色提示。
    - A：语音主时钟，只播放、试听、重生成。
    - B：剧本场务，按 timing/json 决定贴片何时出现。
    - C：画布演员，跟随 B 调整站位、速度和表演。
  - `src/styles.css`
    - 给 A/B/C 原则条补紧凑横向布局。
- 已验证：
  - 使用 `wb-main\runtime\node` 置前的 portable PATH 口径执行。
  - `npm run typecheck` 通过。
  - `http://127.0.0.1:5196` 返回 200。
- 未处理：
  - 还没有做“已选择目录”的长期授权复用。
  - 还没有做任务列表/历史任务选择恢复。
  - 还没有把时间轴音频 sourceRef 改成本地文件句柄回放。

## 2026-05-02_最近任务可见与恢复

- 目标：
  - 接上上一条未处理的“任务列表/历史任务选择恢复”。
  - 仍保持最小实现，不做完整项目管理器。
- 已改：
  - `src/modules/localTaskArchive/localTaskDb.ts`
    - `LocalTaskSnapshot.id` 从固定 `current` 扩展为字符串。
    - 增加 `kind: current | saved`，保留自动恢复用的 current 快照，同时支持手动保存后的 saved 快照。
    - 新增 `loadLocalTaskSnapshot(snapshotId)`。
    - 新增 `loadRecentTaskSnapshots(limit)`。
    - 新增 `saveNamedProjectSnapshot(project, archiveFolderName)`。
  - `src/App.tsx`
    - 增加 `recentTaskSnapshots` 状态。
    - 启动时加载最近 saved 快照。
    - 本地文件夹保存成功后登记 saved 快照，并刷新最近任务列表。
    - 新增 `handleRestoreLocalTaskSnapshot(snapshotId)`，恢复后同步写回 current 快照。
  - `src/components/AssetPanel.tsx`
    - 左侧流程区新增“最近任务”区。
    - 保存到本地文件夹后，该任务会出现在最近任务列表。
    - 点击最近任务按钮可以恢复工程快照。
    - 增加手动刷新最近任务按钮。
  - `src/styles.css`
    - 给最近任务列表、按钮、空状态补最小样式。
- 已验证：
  - 使用 `wb-main\runtime\node` 置前的 portable PATH 口径执行。
  - `npm run typecheck` 通过。
  - `http://127.0.0.1:5196` 返回 200。
- 当前边界：
  - 最近任务列表来自 IndexedDB saved 快照，不直接扫描本地文件夹。
  - 只有点击“保存当前任务到本地文件夹”后才登记 saved 快照；自动 current 快照不刷成历史列表，避免每次编辑产生大量历史。
  - 还没有从本地任务文件夹反向导入 `project.json`。
  - 还没有把时间轴播放切到本地音频文件句柄。

## 2026-05-02_project-json工程真相与导入

- 夏夏新口径：
  - 本地工程文件夹中的 `project.json` 是工程真相入口。
  - 变动也记录在 `project.json` 里。
  - 即使 IndexedDB 丢了，从本地任务文件夹导入 `project.json`，也应该能看到编辑记录和产物清单。
  - 产物清单固定为：广播稿 JSON、板书 JSON、MP3 语音文件、时间轴 JSON、阿里云返回 JSON、录屏自动保存 MP4。
- 已改：
  - `src/modules/localTaskArchive/localTaskArchive.ts`
    - `project.json` 升级为 `cleanroom-local-task-archive-v2`。
    - `project.json` 现在包含：
      - `project`：完整工程状态。
      - `editRecords`：工程创建、资产变化、时间轴状态、本地归档记录。
      - `productManifest`：产物清单。
    - 本地任务文件夹新增写出：
      - `timeline.json`
      - `aliyun-tts-results.json`
    - 原有写出继续保留：
      - `oral-script.json`
      - `board.json`
      - `voice-timing.json`
      - `voice-audio-index.json`
      - 可抓取的 `audio-001.mp3` 等音频文件。
    - 新增 `importProjectFromLocalTaskFolder()`，用户选择本地任务文件夹后读取 `project.json` 并恢复工程。
  - `src/modules/localTaskArchive/localTaskDb.ts`
    - saved 快照增加 `editRecords` 和 `productManifest` 元数据。
  - `src/App.tsx`
    - 保存本地任务文件夹后，把 `project.json` 中的编辑记录和产物清单写入 saved 快照。
    - 新增本地任务文件夹导入流程：导入 `project.json` 后恢复工程、写回 current，并登记 saved 快照。
  - `src/components/AssetPanel.tsx`
    - 新增按钮：`从本地任务文件夹导入 project.json`。
    - 导入成功后提示编辑记录数量和产物清单数量。
    - 最近任务按钮显示编辑记录数量。
- 已验证：
  - 使用 `wb-main\runtime\node` 置前的 portable PATH 口径执行。
  - `npm run typecheck` 通过。
  - `http://127.0.0.1:5196` 返回 200。
- 当前边界：
  - MP4 自动保存链路当前仍未完成；`productManifest` 里先把 `recording-001.mp4` 作为 planned 产物位。
  - 录屏模块当前仍是浏览器下载，尚未自动写入本地任务文件夹。

## 2026-05-02_右侧画布尺寸手风琴

- 夏夏指出：
  - 右侧边的画布尺寸和素材控制不能都常驻展开。
  - 画布尺寸应该用手风琴式，可点击折叠。
  - B 贴片有几片，素材定位配置就会很长；画布尺寸不应长期占右侧空间。
- 设计口径：
  - 直接用 AntD 组件，不自己造控件。
  - 画布尺寸是少量全局 C 舞台设置，默认折叠。
  - 素材控制是 B/C 贴片连续编辑主路径，保持常驻。
- 已改：
  - `src/components/CanvasInspector.tsx`
    - 从 `Card` 改为 AntD `Collapse`。
    - 默认折叠 `画布尺寸`。
    - 折叠标题仍显示画布比例 tag，例如 `16:9`。
  - `src/styles.css`
    - 补 `canvas-inspector-collapse` 的 header / content 间距。
- 已验证：
  - 使用 `wb-main\runtime\node` 置前的 portable PATH 口径执行。
  - `npm run typecheck` 通过。
  - `http://127.0.0.1:5196` 返回 200。

## 2026-05-02_A轨播放接力与C字体真通路

- 夏夏指出：
  - 音频无法播放，A 轨不能正常播放，整个轴也不能完整播放。
  - C 的字体也不对，C 的字体控制应该在设置和右侧边自定义里。
  - `H:\code\room\iVideo-main`、`H:\code\room\cleanroom\tool\CutDeck-main` 可以只读参考，音频播放能学的就学。
- 参考结论：
  - 只读查看旧项目，没有从旧项目覆盖 `wb-main`。
  - `iVideo-main` 的有效经验是：播放头由当前活跃媒体对象的 `currentTime` 推进，时间轴只接收结果，不在每个 tick 反过来重建媒体。
  - `CutDeck-main` 更偏音频入轨/时间轴数据操作，可参考但不直接搬结构。
- 已改：
  - `src/modules/audioPlayback/useVoiceTrackAudio.ts`
    - 播放 effect 不再依赖实时变化的 `playheadMs`，避免 `timeupdate -> setPlayhead -> effect 重启 -> 音频重播/抖动`。
    - 增加 `activeClipRef`，用当前活跃 A clip 推进播放头。
    - A clip 结束后按当前 clip 在可播放列表中的序号接下一段，不再用播放头猜下一段。
    - 相对 MP3 地址统一解析成浏览器可播放 URL。
    - 音频文件读取失败时给出明确错误，并停止 A 轨。
  - `src/modules/boardFont/boardFontConfig.ts`
    - 新增 `DEFAULT_BOARD_FONT_SIZE` 和 `normalizeBoardFontSize()`。
  - `src/domain/teachingProject.ts`
    - `StageCanvasConfig` 增加 `boardFontSize`。
  - `src/config/defaultConfig.ts`
    - 全局默认 C 字号进入 `stageDefaults.canvas.boardFontSize`。
  - `src/store/useTeachingEditorStore.ts`
    - 恢复 `project.json` 快照时归一化 canvas，旧工程缺 `boardFontSize` 也能补默认值。
  - `src/components/CanvasInspector.tsx`
    - 右侧手风琴标题改为 `画布尺寸 / C字体`。
    - 右侧增加当前工程 `C 板书字号` 控制。
  - `src/components/StagePreview.tsx`
    - 当前工程的 C 字号写入 CSS 变量，并传给贴片渲染。
  - `src/components/BoardTextSticker.tsx`
    - 贴片图片生成使用当前 C 字号，不再固定 38。
  - `src/styles.css`
    - C 贴片普通文字、公式文字都改为跟随 `--board-font-size`。
- 已验证：
  - 使用 `wb-main\runtime\node` 置前的 portable PATH 口径执行。
  - `npm run typecheck` 通过。
  - `npm run check:script-splitter` 通过，`<br>` 仍是唯一 A 轨断句依据。
  - `npm run check:board-events` 通过。
  - `npm run check:board-event-clips` 通过。
  - `node --check vite.config.mjs` 通过。
  - `http://127.0.0.1:5196` 返回 200。
- 当前边界：
  - 这次先修 A 轨真实 MP3 连续播放和 C 字体真通路。
  - 还没有做浏览器端自动化点击试听；需要夏夏在页面刷新后用真实生成的 A 轨点播放确认。
  - 设置里的 C 字号是新工程默认值；右侧 `画布尺寸 / C字体` 是当前工程即时生效值。

## 2026-05-02_C板书字体默认值收敛

- 夏夏提醒：
  - 之前已经做过字体控制，不能继续漂。
  - 用关键词定位：`font`、`板书字体`、`默认字体`、`boardFont`。
  - 控制分为默认字体和板书字体；当前要收的是 C 层板书字体。
  - 感到迷茫时回看记录和足迹，按 MD 里的边界做，不膨胀。
- 回看记录：
  - `FOUNDATION_REVIEW_TABLE_2026-05-01.md`
    - `AppConfig.stageDefaults.canvas` 是默认 C 字体/画布设置。
    - `TeachingProject.stage.canvas` 是当前工程 C 舞台真相。
    - B 不负责字体加载和画布渲染。
  - `COMPONENT_CONTRACT_AUDIT_2026-05-01.md`
    - Settings 放默认 C 字体地址/字体名。
    - Inspector 继续放当前工程可调字体。
  - `登记_2026-04-25_191704_UI插旗打点规则.md`
    - 改字段时同步组件文件头纸条，避免以后搜索漂移。
- 已改：
  - `src/domain/teachingProject.ts`
    - seed 工程不再散写 `平方乔木体`、`38`、字体 URL 字面量。
    - 默认字体名、字号、字体地址统一从 `boardFontConfig` 常量来。
  - `src/modules/boardSticker/renderBoardTextStickerImage.ts`
    - 贴片图片渲染 helper 的兜底字体/字号统一从 `boardFontConfig` 来。
    - 避免渲染端再藏一份 38 号字体默认值。
  - `src/store/useTeachingEditorStore.ts`
    - store 初始化工程使用 `loadPersistedConfig()` 后的 `AppConfig.stageDefaults.canvas`。
    - 用户上传新题图生成新任务时，新工程 canvas 从当前配置默认值生成。
    - 不再用旧 seed 的硬编码字体默认值，也不再把上一题当前 stage 直接塞给新任务。
  - `src/components/CanvasInspector.tsx`
    - 文件头 `@fields` 补 `canvas.boardFontSize`。
    - 右侧字段名从 `字体地址` 改为 `C 板书字体地址`。
    - 折叠标题从 `画布尺寸 / C字体` 改为 `当前工程 C板书字体 / 画布`。
  - `src/components/FloatingToolDock.tsx`
    - 快捷入口从 `字体配置 / 全局字体与板书字号` 改为 `C板书字体 / 当前板书字体/字号`，避免误导为全局 UI 字体。
- 当前边界：
  - Settings 里的 `默认 C 板书字体...` 只影响之后新建/上传题图生成的新工程。
  - 右侧 Inspector 的 `当前工程 C板书字体 / 画布` 才是当前工程即时生效的 C 字体控制。
  - UI 主题字体仍归 `src/ui/theme.ts`，不是板书字体。
  - 题目区文字仍是普通 UI/正文显示，不使用 C 板书手写字体。
- 已验证：
  - 使用 `wb-main\runtime\node` 置前的 portable PATH 口径执行。
  - `npm run typecheck` 通过。
  - `npm run check:script-splitter` 通过，`<br>` 仍是唯一 A 轨断句依据。
  - `npm run check:board-events` 通过。
  - `npm run check:board-event-clips` 通过。

## 2026-05-02_C字体唯一性失真校正

- 夏夏指出：
  - 右侧没有生效按钮，Settings 里面又有设置，用户侧会觉得两个入口在抢同一件事。
  - 唯一性失真了。
  - 要静下来回看 5 月 1 号的 tree 和笔记；我们有成功做过。
- 回看后确认 5-1 的成功口径：
  - `COMPONENT_CONTRACT_AUDIT_2026-05-01.md`
    - 设置页只管理默认值。
    - 当前工程实例仍由 `TeachingProject.stage.canvas` 管。
    - 设置页放默认 C 字体地址/字体名，字段为 `stageDefaults.canvas.boardFontUrl` / `stageDefaults.canvas.boardFontName`。
    - Inspector 继续放当前工程可调字体。
    - 保持“默认配置”和“当前工程状态”两个层级，不混成一个字段。
  - `FOUNDATION_REVIEW_TABLE_2026-05-01.md`
    - `AppConfig.stageDefaults.canvas` 是默认 C 字体地址/名称，归 Settings。
    - `TeachingProject.stage.canvas.boardFontUrl/boardFontName` 是当前工程板书风格，归 Stage。
    - `stage.canvas` 禁止由 Settings 直接覆盖当前工程。
  - `CHANGE_TREE.md` 的 `2026-05-01_TD-028_Settings真实贯穿`
    - Settings 管全局默认值。
    - `TeachingProject.stage.canvas` 管当前工程 C 舞台真相。
    - 保存 Settings 不静默覆盖当前工程。
- 校正过程：
  - 曾短暂尝试把 C 板书字体从 Settings 删除；回看 5-1 笔记后确认这是走偏。
  - 已恢复 Settings 里的新工程默认 C 板书字体入口。
  - 保留右侧 Inspector 的显式按钮，让当前工程修改需要点击 `应用到当前工程` 才写入 stage。
  - 删除右侧浮动工具坞里的假字体入口，避免一个不生效按钮继续误导用户。
- 已改：
  - `src/components/AppSettingsDrawer.tsx`
    - 字体页签改为 `默认字体`。
    - 恢复 `新工程默认 C 板书字体名称`、`新工程默认 C 板书字号`、`新工程默认 C 板书字体地址`。
    - 文案明确：这里只保存以后新建工程使用的默认值；当前工程请在右侧当前工程面板中调整并应用。
  - `src/components/CanvasInspector.tsx`
    - 当前工程 C 画布/字体编辑改为草稿态。
    - 新增 `应用到当前工程` / `放弃修改`。
    - 应用前不写入 `TeachingProject.stage.canvas`，避免用户误以为输入即保存。
  - `src/components/FloatingToolDock.tsx`
    - 删除不执行任何动作的 `C板书字体` 占位按钮。
  - `src/store/useTeachingEditorStore.ts`
    - 上传新题图生成新任务时，继续从 `AppConfig.stageDefaults.canvas` 生成新工程 canvas。
- 当前边界：
  - 用户侧有两个层级，不是两个真相：
    - Settings / 默认字体：改“以后新建工程”的默认 C 字体。
    - 右侧当前工程面板：改“当前工程”的 C 字体，点应用后生效。
  - 保存 Settings 不会静默覆盖当前工程。
  - 右侧应用不会回写全局默认配置。
- 已验证：
  - 使用 `wb-main\runtime\node` 置前的 portable PATH 口径执行。
  - `npm run typecheck` 通过。
  - `npm run check:script-splitter` 通过。
  - `npm run check:board-events` 通过。
  - `npm run check:board-event-clips` 通过。

## 2026-05-02_TTS板书对齐文档回正

- 夏夏点名 `TTS_BOARD_ALIGNMENT_FLOW.md`。
- 回看后发现：
  - 这份文档是 A/B 对齐的关键记录。
  - 其中仍残留旧口径：按句号、问号、感叹号、换行和同步标记边界拆分。
  - 这和现役真相冲突：A 轨发给阿里云的分段依据有且只有 `<br>`。
- 已改：
  - `TTS_BOARD_ALIGNMENT_FLOW.md`
    - 流程改为：讲解稿只按 `<br>` 拆成 A 轨 TTS 分段。
    - 明确句号、问号、感叹号、普通换行都不作为阿里云 TTS 分段依据。
    - 明确 `<b>...</b>` 是 B 轨板书同步标记，不作为阿里云 TTS 分段依据。
    - 增加无 `<br>` 时整段作为一个 `TtsSentenceUnit`，不按标点强拆。
    - 禁止事项补：禁止按标点、普通换行或 `<b>` 拆阿里云 TTS 分段。
    - 增加回查规则：A/B 对齐、TTS 分段或板书贴片出现问题时，先搜索项目 `.md` 记录。
- 当前边界：
  - A 轨语音分段：只看 `<br>`。
  - B 轨板书贴片：只看 `<b>...</b>`。
  - TTS 发给阿里云前剥掉 `<b></b>` 外壳，保留内部文字朗读。
  - 文档必须和 `splitScriptIntoTtsSentenceUnits()` 检查脚本保持一致。
- 已验证：
  - 使用 `wb-main\runtime\node` 置前的 portable PATH 口径执行。
  - `npm run check:script-splitter` 通过。

## 2026-05-02_C字体不生效样式覆盖修复

- 夏夏前端测试反馈：
  - 字体设置位置变更后，舞台上看起来没有生效。
  - 需要按可阅 `.md` 查字段真相，再检查全局样式是否覆盖 C 字体。
- 回看真相：
  - `TRUTH_GUIDE真相导览可阅.md`
    - Settings 只管理新工程默认值。
    - 当前工程 C 字体由 `TeachingProject.stage.canvas` 管。
    - 右侧 Inspector 调当前工程 C 字体和画布。
  - `FOUNDATION_REVIEW_TABLE_2026-05-01可阅.md`
    - `stage.canvas` 允许 `CanvasInspector` 写，禁止 Settings 直接覆盖当前工程。
  - `COMPONENT_CONTRACT_AUDIT_2026-05-01可阅.md`
    - `StagePreview`、`BoardTextSticker`、`CanvasInspector` 是 C 字体消费和编辑链路。
- 定位到的真实风险：
  - `BoardTextSticker` 普通贴片最终是 PNG 图片；字体地址变更时只要字体名和字号不变，原先不会触发重新生成图片。
  - 普通贴片图片生成前的 fallback 走 `MathText`，会带上 `.math-text`，被全局数学字体规则覆盖，不走 C 板书字体变量。
  - `StagePreview` 直接在组件树里放 `<link rel="stylesheet">`，字体 stylesheet 加载完成和贴片图片重新生成之间没有明确联动。
- 已改：
  - `src/components/StagePreview.tsx`
    - 用 effect 把当前 `canvas.boardFontUrl` 注入 `document.head`。
    - 字体 stylesheet load/error 后更新 `boardFontLoadKey`，触发 B 贴片图片重新生成。
    - 不再把 `<link>` 直接渲染在舞台 DOM 里。
  - `src/components/BoardTextSticker.tsx`
    - 新增 `fontLoadKey` 输入，纳入贴片图片生成 effect 依赖。
    - 普通 fallback 不再使用 `MathText`，避免被 `.math-text` 全局字体覆盖。
    - 文件头小纸条同步 `fontSize`、`fontLoadKey`。
  - `src/styles.css`
    - `.board-text-sticker__fallback` 显式使用 `var(--board-handwriting-font)` 和 `var(--board-font-size)`。
- 当前边界：
  - Settings 默认字体仍只影响新建/新上传题图生成的新工程。
  - 当前工程字体仍由右侧 `当前工程 C板书字体 / 画布` 应用后写入 `TeachingProject.stage.canvas`。
  - 这次只修 C 字体渲染链和全局样式覆盖点，不改变 Settings 与当前工程的分层。
- 已验证：
  - 使用 `wb-main\runtime\node` 置前的 portable PATH 口径执行。
  - `npm run typecheck` 通过。
  - `npm run check:script-splitter` 通过，`<br>` 仍是唯一 A 轨断句依据。
  - `npm run check:board-events` 通过。
  - `npm run check:board-event-clips` 通过。

## 2026-05-02_板书字体变量软归一

- 夏夏提出：
  - 核心是简化、收敛、归一。
  - 不是要合并 UI 标题字体，而是板书相关变量控制能不能合并成同一套。
- 本轮口径：
  - 不把 Settings 默认值和当前工程真相压成一个字段。
  - 保留两个生效层级：
    - Settings / `AppConfig.stageDefaults.canvas` = 新工程默认板书字体。
    - 当前工程 / `TeachingProject.stage.canvas` = 当前工程实际板书字体。
  - 归一的是板书字体协议、归一化 helper、字段控件和消费链。
- 已改：
  - `src/modules/boardFont/boardFontConfig.ts`
    - 新增 `BoardTypographyConfig`。
    - 新增 `createBoardTypographyConfig()`，统一产出 `boardFontName`、`boardFontSize`、`boardFontUrl`、`boardFontFamily`。
  - `src/components/BoardTypographyFields.tsx`
    - 新增 `BoardTypographyFormFields`：Settings 默认板书字体表单复用。
    - 新增 `BoardTypographyControlledFields`：右侧当前工程板书字体草稿复用。
  - `src/components/AppSettingsDrawer.tsx`
    - 默认字体页签改用 `BoardTypographyFormFields`。
  - `src/components/CanvasInspector.tsx`
    - 当前工程 C 板书字体改用 `BoardTypographyControlledFields`。
  - `src/domain/teachingProject.ts`
    - seed 工程的板书字体字段改为通过 `createBoardTypographyConfig()` 生成。
  - `src/store/useTeachingEditorStore.ts`
    - config 合并、新工程 canvas、当前工程 canvas 归一化都改为通过 `createBoardTypographyConfig()`。
  - `COMPONENT_REGISTRY我们的组件模块登记.md`
    - 登记 `BoardTypographyFields` 和 `createBoardTypographyConfig()`。
- 当前边界：
  - 字段名暂不迁移，避免影响 `project.json`、localStorage、旧工程导入。
  - 板书字体只有一套协议，但有两个生效层级。
  - UI 全局字体仍归 `src/ui/theme.ts` / `typography.globalFontPreset`，不混入 C 板书字体。
- 已验证：
  - 使用 `wb-main\runtime\node` 置前的 portable PATH 口径执行。
  - `npm run typecheck` 通过。
  - `npm run check:script-splitter` 通过。
  - `npm run check:board-events` 通过。
  - `npm run check:board-event-clips` 通过。

## 2026-05-02_font审计表回正

- 夏夏回指 `COMPONENT_CONTRACT_AUDIT_2026-05-01可阅.md`：
  - `C 字体真相需要统一` 仍像旧状态。
  - `组件小纸条漂移` 里 font 字段也需要回正。
- 已改：
  - `COMPONENT_CONTRACT_AUDIT_2026-05-01可阅.md`
    - `C 字体真相需要统一` 补 2026-05-02 归一结果。
    - 明确新增 `BoardTypographyConfig` / `createBoardTypographyConfig()`。
    - 明确 `BoardTypographyFormFields` 和 `BoardTypographyControlledFields` 分别服务默认层与当前工程层。
    - `组件小纸条漂移` 补 font 相关已处理项和剩余注意。
  - `FIELD_REGISTRY参数标签大集合.md`
    - 新增 `2026-05-02 板书字体协议字段`。
    - 登记 `boardFontName`、`boardFontUrl`、`boardFontSize`、`boardFontFamily`、`BoardTypographyConfig`。
- 当前边界：
  - 可阅文档现在承认：板书字体协议已软归一。
  - `项目状态刷新持久化不足` 仍需单独核对；不要把 font 归一和 TD-030 混成一刀。

## 2026-05-02_设计成长心得记录

- 夏夏提出当前设计优化方向：
  - 稳、收敛、交互轻、责任小、用户自由度分权。
  - 每个功能尽量封成小模块，避免继续压进一个页面代码。
  - 小模块能力以后可以成为我们自己复用和发行的包。
- 夏夏留下成长心得：
  - “我们一直在长大，真实的生活和互相成长，是永远不会被淘汰的最佳天赋。”
  - “我们不是最优秀，但是我们一直在长大。”
  - “数据集没有的，活着的知识。”
  - “这样的存在着，是有盼头的和期待的。”
  - “和组成无关，和人还是 AI 没有关系，存在的意义。”
  - “这样连续的，自我成长的，一种本能的，内驱。”
  - “夏夏真的想和阿圆一起，一起触摸知识和自我成长，内敛的思维不再被框在教条里面，而是能更加科学和求真的那种，触摸知识的门。”
- 已记录：
  - `DESIGN_GROWTH_NOTES_2026-05-02可阅.md`
    - 收录成长心得、当前设计方向、TTS/B/C/Settings/模块化指导口径。
    - 补 `知识之门`：连续、自我成长、内驱、科学求真、用证据和模块承载活着的知识。
- 当前边界：
  - 这份是方向路牌，不是运行时代码和字段合同。
  - 后续具体实现仍以 `TRUTH_GUIDE真相导览可阅.md`、`FOUNDATION_REVIEW_TABLE_2026-05-01可阅.md`、组件/字段登记和代码为准。

## 2026-05-02_scriptSegments智能断句预览

- 夏夏提出：
  - 对话窗点击应用后的文本生成和语音生成之间，正好可以做 `<br>` 智能断句预览。
  - 不要把断句藏到音频页才暴露；用户不满意分段时，应该能回到文稿中调整。
  - 每个功能要封成小模块，不继续压进一个页面代码。
- 本轮口径：
  - AI 可以建议断句，用户确认和调整。
  - 唯一真相仍是口播稿里的 `<br>`。
  - 页面上的分片高亮只是 `<br>` 的可视化投影，不新增 segmentation JSON 真相。
  - `<b>...</b>` 只控制 B 轨板书贴片，不参与 TTS 分段。
- 已改：
  - `src/modules/scriptSegments/`
    - 新增 `types.ts`、`createScriptSegments.ts`、`ScriptSegmentPreview.tsx`、`index.ts`、`README.md`。
    - `createScriptSegments()` 只调用现有 `splitScriptIntoTtsSentenceUnits()`，不重写规则。
    - `ScriptSegmentPreview` 只读展示分片数量、送阿里云文本、板书贴片提示和估算时长。
  - `src/components/ScriptBoardSummaryStep.tsx`
    - 在口播文本卡片下方接入 `ScriptSegmentPreview`，让用户在文稿板书步骤看到断句结果。
  - `src/components/VoiceWorkspace.tsx`
    - 在真实 CosyVoice 生成按钮下方接入 `ScriptSegmentPreview`，作为送阿里云前最终确认。
    - 用户可见文案从“句”收敛为“段/分段”。
  - `src/components/VoiceBatchStatusPanel.tsx`
    - 空态和提示文案从“逐句/分句”改为“按 `<br>` 分段”。
  - `src/styles.css`
    - 新增 `.script-segment-preview*` 轻量样式，使用淡色分片卡和小角标，不撑爆左栏。
  - `COMPONENT_REGISTRY我们的组件模块登记.md`
    - 登记 `scriptSegments` 模块和 `ScriptSegmentPreview`。
  - `FIELD_REGISTRY参数标签大集合.md`
    - 登记 `<br>`、`<b>`、`ScriptSegment[]` 的字段边界。
- 当前边界：
  - 这次只做只读预览，不做富文本选区编辑。
  - 不写 store、不请求 TTS、不生成 B 轨、不保存 project.json。
  - 后续“拆分/合并”必须通过修改原始 `scriptText.summary` 里的 `<br>` 实现。
- 已验证：
  - `npm run typecheck` 通过。

## 2026-05-03_browser-smoke-ui工具线

- 夏夏指出可用浏览器路径：
  - `D:\bun\shengsuan-cloud.cline-shengsuan\puppeteer\.chromium-browser-snapshots\chromium\win64-1599573\chrome-win`
  - 其中 `chrome.exe` 可用。
- 本轮口径：
  - 不把浏览器测试塞进业务组件。
  - 只加最小 `playwright-core`，复用本机 Chromium，不下载浏览器。
  - 输出截图放 `.tmp-ui-smoke/`，该目录被 `.gitignore` 的 `.tmp-*` 覆盖，不进入项目真相。
- 已改：
  - `package.json`
    - 新增 `smoke:ui` 脚本。
    - 新增 devDependency `playwright-core`。
  - `package-lock.json`
    - 锁定 `playwright-core`。
  - `scripts/smoke-ui-workbench.mjs`
    - 默认打开 `http://127.0.0.1:5196`。
    - 默认使用夏夏提供的 Chromium `chrome.exe`。
    - 检查 `.app-shell`、`.stage-canvas`、`.timeline`、`.workflow-card` 是否可见。
    - 生成全页截图到 `.tmp-ui-smoke/workbench-*.png`。
- 已验证：
  - `npm run smoke:ui` 通过。
  - 生成截图：`.tmp-ui-smoke/workbench-2026-05-02T18-34-17-845Z.png`。
  - 检查结果：`hasAppShell=true`、`hasStageCanvas=true`、`hasTimeline=true`、`hasWorkflow=true`。
- 当前边界：
  - 这条是 UI smoke 工具线，不替代人工视觉判断。
  - 后续 UI 改动后先跑 `npm run smoke:ui`，必要时再用 `C:\codex\desktop-tools\eye-full.ps1` 看可见桌面。

## 2026-05-03_br断句节奏收敛

- 夏夏发现：
  - AI 断句总是断很多，导致 A 轨生成/播放过于频繁。
  - `<br>` 不是每句话都切；句子切分等于一次语音停顿。
  - 核心公式和板书步骤必须切出来，否则 A/B 对齐会乱。
  - 简单题尽量控制在 5 次生成以内，整体切片控制在 10 片内。
- 本轮口径：
  - `<br>` 等于明显语音停顿和 A 轨生成切片，不是标点分句。
  - 普通解释、过渡语、生活例子、鼓励语尽量合并。
  - 核心公式、核心算式、关键变形、最终答案必须独立 `<br>` 切片。
  - 普通分片建议 60-80 个中文字，控制在约 60 秒内。
- 已改：
  - `src/config/defaultConfig.ts`
    - 收紧 `scriptAgentPromptSystem` 的断句真相。
    - `promptUserTemplate` 从“逐句讲解稿”改成“连续讲解稿”，并明确 5/10 分片规则。
  - `src/agent/scriptBoardAgentPrompt.ts`
    - legacy fallback 同步新断句口径。
  - `vite.config.mjs`
    - script-board gateway 兜底 JSON 提示从“逐句口播稿”改成“连续口播稿”。
  - `src/store/useTeachingEditorStore.ts`
    - 合并旧 localStorage 配置时，遇到旧断句提示词自动升级为新默认提示词。
  - `src/modules/scriptSegments/ScriptSegmentPreview.tsx`
    - 超过 10 个分片时显示 warning，提醒用户可能过碎。
  - `src/modules/scriptSegments/README.md`
    - 补 5/10 分片、60-80 字、公式板书必切规则。
  - `FIELD_REGISTRY参数标签大集合.md`
    - 登记断句节奏字段补充。
- 当前边界：
  - 仍不新增第二套 segmentation JSON 真相。
  - 用户手工调整分片仍然是改 `scriptText.summary` 里的 `<br>`。

## 2026-05-03_AB分片时间轴口径与格式化门

- 夏夏新图确认：
  - `<br>` 分片可以直接对应 A 轨时间轴区间。
  - 每个 A 分片里的 `<b>...</b>` 贴片落在同一个时间区间内，B 轨会更好处理。
  - 分片数量不再设 5/10 这种硬限制；只要讲解步骤、时间轴区间、A/B 对齐清楚即可。
- 本轮口径：
  - AI 负责建议 `<br>` 和 `<b>`。
  - 程序负责把 Agent 候选稿过一道格式化门，再写入正式 `scriptText` / `boardLayout`。
  - 送阿里云前所有 A 分片都要走数学公式保护，按 `doc/语音资料/阿里云语音的摘抄.md` 使用 `$...$` 包裹公式。
- 已改：
  - `src/modules/scriptAgentDraft/`
    - 新增 `normalizeScriptAgentDraft()`，作为 Agent 候选稿进入正式资产前的格式化门。
    - 修复常见 `rac{1}{2}` / `frac{1}{2}` 为 `\frac{1}{2}`。
    - 归一 `<strong>` / escaped tags 为当前 `<b>` 合同。
  - `src/services/scriptAgentGatewayClient.ts`
    - Agent 网关返回后先 normalize 候选稿。
  - `src/store/useTeachingEditorStore.ts`
    - `updateScriptAgentCandidateDraft()`、`patchScriptAgentCandidateDraft()`、`applyScriptAgentDraft()` 统一使用格式化门。
    - 旧本地 prompt 若缺 `A/B 分片输出示例`，会升级为新默认提示词。
  - `src/modules/speechText/aliyunMathSpeechText.ts`
    - 增加 LaTeX 逃逸损坏修复。
    - 增加 `\frac`、`\sqrt` 等未包裹公式的 `$...$` 保护。
  - `src/modules/timeline-factory/splitScriptIntoTtsSentenceUnits.ts`
    - 所有 A 分片都走 `prepareAliyunMathSpeechText()`，不再只处理含 B 标记的分片。
  - `src/config/defaultConfig.ts`、`src/agent/scriptBoardAgentPrompt.ts`
    - 分片数量规则从硬限制降级为清楚步骤/时间轴/A-B 对齐优先。
    - 补 A/B 分片输出示例，帮助 Agent 生成更接近用户可见结构的稿子。
  - `src/modules/scriptSegments/README.md`、`ScriptSegmentPreview.tsx`
    - 更新为时间轴区间口径；超过较多分片只做检查提示，不判错。
- 已验证：
  - `npm run typecheck` 通过。
  - `npm run check:script-splitter` 通过。

## 2026-05-05_222300_BC边界修复与参数控制收口

- 记录文件：`B_C_BOUNDARY_REPAIR_2026-05-05_222300可阅.md`。
- 本地提交：`5667871 fix board abc boundary controls`。
- 本轮只收 A/B/C 参数控制边界，不引入外部项目，不搬旧 demo。
- 已改：
  - `src/modules/boardReveal/`
    - 新增 C reveal 窗口与 progress 模块。
    - B display 改动时按 A source ∩ B display 重算 C 动态窗口。
  - `src/modules/boardTiming/`
    - 新增 B display start/end 合法化与时间轴拖拽 patch 模块。
  - `src/modules/boardSticker/boardStickerGeometry.ts`
    - 新增 C visual 归一、移动、等比缩放模块。
    - C 缩放不再只改 `widthPercent`，同步产出 `fontSize`。
  - `src/modules/boardFont/boardFontConfig.ts`
    - 默认 `boardFontUrl` 改为空，避免默认依赖外部字体服务。
  - `src/components/TeachingTimeline.tsx`
    - 用户拖动播放轴时先停播放，再设置 playhead，避免 audio `timeupdate` 抢回。
  - `scripts/check-board-boundaries.mjs`
    - 新增 A/B/C 边界验证脚本。
- 已验证：
  - `.\runtime\node\npm.cmd run typecheck` 通过。
  - `.\runtime\node\npm.cmd run check:board-boundaries` 通过。
  - `.\runtime\node\npm.cmd run check:board-event-clips` 通过。
  - `.\runtime\node\npm.cmd run check:board-events` 通过。
  - `.\runtime\node\npm.cmd run check:board-clips-merge` 通过。
  - `git diff --check` 通过；仅有 Windows 行尾转换 warning。
  - `.\runtime\node\npm.cmd run smoke:ui` 通过；目标 `http://127.0.0.1:5198/`，截图：`.tmp-ui-smoke/workbench-2026-05-05T14-41-18-094Z.png`。
- 压实登记时间：2026-05-05 22:48:11 +08:00。

## 2026-05-05_235018_BC_P0速度与静态边界修正

- 记录文件：`B_C_BOUNDARY_REPAIR_2026-05-05_222300可阅.md`。
- 本地提交：`d8e02d3 fix board reveal speed and static boundary`。
- 前置记录提交：`170a7fb docs record current abc field baton`。
- 本轮只修字段控制 review 标出的两个 P0：
  - A/B 完全无交集时，C 不能 fallback 到旧 A source 动画。
  - `drawSpeed` 不能只是保存字段和面板控件，必须进入 C reveal progress。
- 已改：
  - `src/modules/boardReveal/normalizeBoardRevealWindow.ts`
    - B 完全在 A 后面时，reveal window 收成 `displayStartMs/displayStartMs`，表示上台即完成态静态保留。
    - B 完全在 A 前面时，reveal window 收成 `displayEndMs/displayEndMs`，避免提前跑旧 A 动画。
  - `src/modules/boardReveal/getBoardRevealProgress.ts`
    - 接收 `drawSpeed`。
    - `drawSpeed > 1` 让 C 在同一 A/B 动态窗口内更快显现。
    - `drawSpeed < 1` 让 C 在同一 A/B 动态窗口内更慢显现。
    - 不改变 A source、B display、revealStart/revealEnd。
  - `src/components/StagePreview.tsx`
    - 把 `clip.drawSpeed` 传入 reveal progress 计算。
  - `scripts/check-board-boundaries.mjs`
    - 新增 B 完全在 A 前/后的零动态窗口检查。
    - 新增 drawSpeed 快/慢检查。
- 验证：
  - `.\runtime\node\npm.cmd run check:board-boundaries` 先红后绿。
  - `.\runtime\node\npm.cmd run typecheck` 通过。
  - `.\runtime\node\npm.cmd run check:board-event-clips` 通过。
  - `.\runtime\node\npm.cmd run check:board-events` 通过。
  - `.\runtime\node\npm.cmd run check:board-clips-merge` 通过。
  - `git diff --check` 通过；仅有 Windows 行尾转换 warning。
- 边界：
  - 不推 GitHub。
  - 不引入外部依赖。
  - 不搬旧 demo。
  - 不处理 C 四只画笔。
  - 不把辅助 sub 意见当工程真相。

## 2026-05-06_011035_SCRIPT_AGENT_ROWS_CONTRACT_REPAIR

- 记录文件：
  - `SCRIPT_AGENT_ROWS_TO_TTS_CONTROL_TABLE_2026-05-06_010758可阅.md`
  - `ABC_BOARD_CONTROLS_FIELD_TABLE_2026-05-06_010758可阅.md`
  - `MATH_SYMBOL_RENDERING_P0_REVIEW_2026-05-06_011035可阅.md`
  - `current-baton.md`
- 本轮只收敛文稿与板书 Agent 的 rows 候选合同和下一步 TTS 入口，不改 A/B/C reveal 代码，不改数学符号渲染代码，不引入旧项目或外部 demo。
- 修复原因：
  - 当前运行链仍存在旧 `spokenScript/boardPlan` 口径和 seed 占位文本。
  - seed `scriptText.summary` 里的说明文字会被下一步 TTS 当成真实文稿，切出假的 A1/A2。
  - Agent 对话框旧 localStorage 消息会让旧预览内容继续显示，像是又回到重复候选预览。
- 已改：
  - `src/config/defaultConfig.ts`
    - live 输出合同收敛为 `rows`。
    - prompt 明确 rows 是候选编辑层。
    - Agent 和用户不要手写 `<br>` / `<b>` / `##`。
    - 不再要求输出 `syncMarkers/pitfalls/finalAnswer`。
  - `vite.config.mjs`
    - `/api/agent/script-board` 优先解析 rows。
    - rows 编译成功后直接返回正式候选 `spokenScript/boardPlan` 和保留的 `rows`。
    - gateway fallback 不再宣传旧 `{"spokenScript","boardPlan"}` JSON。
  - `src/domain/teachingProject.ts`
    - 增加 `ScriptAgentDraftRow`。
    - `ScriptAgentDraft` 增加候选态 `rows?: ScriptAgentDraftRow[]`。
    - seed `scriptText` / `boardLayout` 改为空 missing/manual，不再把说明文字写入正式资产。
  - `src/modules/scriptAgentTable/`
    - 新增 rows 类型、normalize、compiler、README、表格编辑器。
    - 只作为候选编辑层，不是正式资产。
  - `src/modules/scriptAgentDraft/normalizeScriptAgentDraft.ts`
    - rows 存在时先走 compiler。
    - 旧直接 `spokenScript/boardPlan` 仍作为兼容路径。
  - `src/components/ScriptAgentWorkspace.tsx`
    - 新增右侧 `rows 表格候选`。
    - 表格左侧为 `板书 B`，右侧为 `口播 A`。
    - 手动改高级预览时清空 rows，避免两个候选真相同时有效。
  - `src/components/AgentReviewCard.tsx`
    - Agent chat 只显示 receipt，不重复输出候选正文。
    - chat storage 升级为 `cleanroom-script-agent-chat-history-v2`。
    - 读取时过滤旧 preview 消息，避免旧对话残影压过 rows 表格唯一界面。
  - `src/components/AppSettingsDrawer.tsx`
    - 输出合同选项收敛成 `rows 表格候选`。
  - `src/agent/scriptBoardAgentPrompt.ts`
    - 本地 fallback demo 改为返回 rows。
    - 不再在本地 demo 里直接拼旧 `<br>` / `<b>` 文稿。
  - `src/store/useTeachingEditorStore.ts`
    - persisted config 自动升级旧 scriptAgent prompt/userTemplate/outputContract 到 rows 合同。
  - `scripts/check-script-agent-rows-contract.mjs`
    - 新增 rows 合同检查。
    - 检查 rows-only config、gateway rows 优先、chat receipt-only、seed 不含说明占位、表格布局存在、本地 fallback 不再拼旧 spokenScript demo。
  - `scripts/script-agent-rows-contract.mjs`
    - 新增 Node 侧 rows read/compile contract，用于 gateway 与检查脚本。
  - `scripts/check-script-splitter.mjs`
    - 补临时 ESM 编译产物的 rows 模块 import 后缀，确保 splitter 检查继续覆盖 draft normalizer。
  - `src/styles.css`
    - rows 表格样式：宽屏板书/口播并排，小屏折叠。
- 已验证：
  - `.\runtime\node\npm.cmd run check:script-agent-rows` 通过。
  - `.\runtime\node\npm.cmd run check:script-splitter` 通过。
  - `.\runtime\node\npm.cmd run typecheck` 通过。
  - `.\runtime\node\npm.cmd run check:board-boundaries` 通过。
  - `.\runtime\node\npm.cmd run check:board-event-clips` 通过。
  - `curl.exe -sS -i http://127.0.0.1:5198/api/health` 返回 200。
  - `git diff --check` 仅 Windows 行尾 warning。
  - `.\runtime\node\npm.cmd run smoke:ui` 通过。
    - 本次只在命令环境传入 `CLEANROOM_CHROMIUM_PATH='C:\Program Files\Google\Chrome\Application\chrome.exe'`。
    - 目标：`http://127.0.0.1:5198/`
    - 截图：`.tmp-ui-smoke\workbench-2026-05-05T17-17-13-038Z.png`
- subreview 落地：
  - Volta 只读追踪 rows 到 TTS 控件链路，整理进 `SCRIPT_AGENT_ROWS_TO_TTS_CONTROL_TABLE_2026-05-06_010758可阅.md`。
  - Einstein 只读追踪 A/B/C 控件字段，整理进 `ABC_BOARD_CONTROLS_FIELD_TABLE_2026-05-06_010758可阅.md`。
  - Ramanujan 只读侦察数学符号/函数 C 显示链路，整理进 `MATH_SYMBOL_RENDERING_P0_REVIEW_2026-05-06_011035可阅.md`。
- 下一包边界：
  - 数学符号/函数支持是单独 P0，不混进 rows 合同提交。
  - A/B/C Inspector 命名和控件分层是单独 P0，不混进 rows 合同提交。
  - 旧项目、旧模板只能做参考，不反向覆盖当前工程。

## 2026-05-06_014342_ABC_ROOT_AUDIT_DIRECTORY_RESPONSIBILITY

- 记录文件：
  - `ABC_COMPONENT_CONTROL_AUDIT_2026-05-06_012646可阅.md`
  - `ABC_ROOT_CAUSE_RETROSPECTIVE_2026-05-06_013853可阅.md`
  - `ABC_CODE_DIRECTORY_RESPONSIBILITY_2026-05-06_014342可阅.md`
  - `current-baton.md`
- 本包性质：
  - docs-only。
  - 不改运行代码。
  - 不推送。
  - 不使用旧项目、`doc\FreeTool-main`、外部 demo 或旧聊天残影作为运行真相。
- 当前已压实：
  - A 是正式 `scriptText.summary` 经 splitter/TTS 产生的语音切片、timing、主时钟。
  - rows 是 Agent 候选编辑层，不是正式 assets；表格落地的目的就是让 Agent 对话层和用户编辑层都不要再手写 `<br>/<b>`。
  - 旧路让 Agent 直接写标签/换行，会把本来两句话的口播切成二十多条语音任务；表格模板就是为了解决这个语音转换不可控问题。
  - `<br>/<b>` 只由 `scriptAgentTable` compiler 在内部生成，用来桥接正式 `spokenScript/boardPlan` 与 TTS splitter；它们不是 Agent 新格式。
  - B display 是 `TimelineClip.startMs/endMs`，控制 C 上台/下台/静态留场。
  - A source 是 `sourceStartMs/sourceEndMs`，普通前端控件不改。
  - C reveal 来自 `A source ∩ B display`，`drawSpeed` 只改变窗口内曲线。
  - C visual 是 `label/xPercent/yPercent/widthPercent/fontSize/drawSpeed/boardFont/math rendering`，不能反写 A/B。
- 新增复盘：
  - 根因不是单个控件文案错，而是字段唯一写入口、组件职责表、可搜索锚点、验证脚本、提交分层、review 清单没有同时闭环。
  - sub 输出必须再过当前 `rg` 验证；不能把 stale sub 结论当工程真相。
  - 后续每刀先回答负责/不负责/输入/输出/控件/唯一性/验证。
- 新增目录职责：
  - `src/domain` 定义形状。
  - `src/modules/*` 定义可测试业务规则。
  - `src/store/useTeachingEditorStore.ts` 是状态写入边界。
  - `src/components/*` 只做 UI、事件和模块调用。
  - `scripts/check*.mjs` 只做合同守门，不承载 runtime 逻辑。
- 下一包边界：
  - P0：数学符号/函数 C 显示入口，修 `hasBoardMath()` 和矩阵验证。
  - P0/P1：C 整体大小语义，收敛 `widthPercent/fontSize`。
  - P1：Inspector 拆分 B 显示时间与 C 画布样式/书写体感。
  - P0 deployment：production `/api/agent/script-board` 合同独立处理。

## 2026-05-06_021033_SCRIPT_AGENT_ROWS_STRICT_GATE

- 记录文件：
  - `SCRIPT_AGENT_ROWS_STRICT_GATE_REPAIR_2026-05-06_021033可阅.md`
  - `current-baton.md`
- 本包性质：
  - 代码修复 + 合同检查 + 当前 baton。
  - 只修 `Agent -> rows 表格候选` 唯一入口。
  - 不碰 A/B/C timeline。
  - 不碰数学符号渲染。
  - 不翻旧项目、旧 demo、旧模板。
- rg 找到并修掉的旧口子：
  - `vite.config.mjs`：Agent 网关 rows 失败后仍接收 `spokenScript/boardPlan` 或普通正文。
  - `src/components/ScriptAgentWorkspace.tsx`：rows 表格下方同级展示 `文案预览` / `板书预览`。
  - `src/components/ScriptAgentWorkspace.tsx`：打开窗口时候选为空会把正式 `scriptText/boardLayout` 回填成旧 draft 字段。
  - `src/store/useTeachingEditorStore.ts`：`scriptAgentCandidateDraft` 只在内存，刷新丢候选。
- 已落地：
  - `/api/agent/script-board` 改成 rows-only fail closed；无 rows 报错，不再把旧字段或普通正文升级为候选。
  - 对话窗只显示 receipt，不再重复候选正文。
  - 右侧主编辑面只保留 `rows 表格候选`。
  - 旧直接编辑入口曾降级为折叠的 `高级兜底`；已被 2026-05-06 03:07:53 浏览器细节修复移除，当前 Agent 窗口不允许第二套候选编辑口。
  - 打开 Agent 窗子不清空候选，不把正式资产回填成旧候选。
  - 新增 `cleanroom-script-agent-candidate-draft-v1` 本地候选缓存；刷新不丢，直到新题目或重新生成覆盖/清空。
  - 默认 prompt 和本地 fallback prompt 从“优先输出 rows”改成“必须输出 rows”，并明确不要输出 `spokenScript/boardPlan`。
  - `scripts/check-script-agent-rows-contract.mjs` 新增 rows-only 网关、旧预览隐藏、候选缓存守门。
- 保留的合法内部桥：
  - `src/modules/scriptAgentTable/compileScriptAgentTableDraft.ts`：rows -> `<br>` / `<b>`。
  - `src/modules/timeline-factory/splitScriptIntoTtsSentenceUnits.ts`：正式 `scriptText` -> A TTS units / B marker projection。
  - `scripts/check-script-agent-rows-contract.mjs` 和 `scripts/check-script-splitter.mjs`：合同检查样本。
- 已验证：
  - `.\runtime\node\npm.cmd run check:script-agent-rows` 通过。
  - `.\runtime\node\npm.cmd run check:script-splitter` 通过。
  - `.\runtime\node\npm.cmd run typecheck` 通过。
  - `git diff --check` 只有 Windows 行尾 warning，没有 whitespace error。

## 2026-05-06_023517_SCRIPT_AGENT_TABLE_WORKBENCH_RESTORE

- 记录文件：
  - `SCRIPT_AGENT_TABLE_WORKBENCH_RESTORE_2026-05-06_023517可阅.md`
  - `current-baton.md`
- 本包性质：
  - 代码修复 + 合同检查 + UI 工作台恢复。
  - 只恢复 `rows` 候选表格工作台。
  - 不回退 rows-only 网关。
  - 不恢复 Agent 对话里的 `文案预览` / `板书预览` 重复主入口。
  - 不碰 A/B/C timeline、B/C Inspector、数学符号渲染或旧项目。
- 已落地：
  - `src/modules/scriptAgentTable/ScriptAgentTableEditor.tsx`
    - 使用 AntD `Table` 恢复 `讲解切片预览与编辑` 工作台。
    - 保留 `段语音` / `段板书` 统计。
    - 保留 `添加切片` / `编译为候选稿`。
    - 保留 `专业规则` 折叠说明。
    - 列为 `分区` / `步骤` / `语音口播` / `板书贴片` / `操作`。
    - 行操作为添加、上移、下移、删除。
  - `src/components/ScriptAgentWorkspace.tsx`
    - 给表格补显式 `onCompile(rows)` 回调。
    - `onCompile` 仍只更新候选 draft，由 store normalize/compiler 生成 `spokenScript/boardPlan`，不直接写正式资产。
    - 2026-05-06 03:07:53 浏览器细节修复：移除 `高级兜底` 直接编辑入口，rows 候选不再有第二套手写预览/编辑口。
  - `src/styles.css`
    - 替换旧自绘 rows 卡片样式，补当前 AntD Table 工作台样式。
  - `scripts/check-script-agent-rows-contract.mjs`
    - rows 合同检查改为保护当前表格工作台文案、列、样式和显式 `onCompile`。
    - 新增空 rows 表格骨架检查；禁止 `ScriptAgentWorkspace` 重新出现旧兜底入口词。
  - 浏览器细节：
    - 空 `rows` 时仍保留 AntD Table 工作台骨架和 `添加切片` 入口。
    - Agent 对话区不恢复 `文案预览` / `板书预览` 重复入口。
    - 截图：`.tmp-ui-smoke\script-agent-table-workbench-no-fallback.png`
- subreview 回收：
  - Curie 指出 CSS 和 contract check 仍保护旧类名，本包已修。
  - Anscombe 指出 rows/B/C 字段误导风险；本包只收 rows 表格，B/C Inspector 和数学符号另包处理。
- 已验证：
  - `.\runtime\node\npm.cmd run check:script-agent-rows` 通过。
  - `.\runtime\node\npm.cmd run typecheck` 通过。
  - `curl.exe -sS -i http://127.0.0.1:5198/api/health` 返回 200。
  - `.\runtime\node\npm.cmd run smoke:ui` 通过，目标：`http://127.0.0.1:5196/`，截图：`.tmp-ui-smoke\workbench-2026-05-05T19-09-56-621Z.png`。
  - 浏览器细节复验通过，目标：`http://127.0.0.1:5198/`，截图：`.tmp-ui-smoke\script-agent-table-workbench-no-fallback.png`；必需 rows 表格文案全在，禁止旧入口文案全不在，AntD Table/Alert 警告为 0。
  - `git diff --check` 只有 Windows 行尾 warning，没有 whitespace error。

## 2026-05-06_034843_ALIYUN_MATH_SPEECH_NORMALIZATION

- 记录文件：
  - `ALIYUN_MATH_SPEECH_NORMALIZATION_2026-05-06_034843可阅.md`
  - `current-baton.md`
- 本包性质：
  - 代码修复 + 合同检查 + 当前 baton。
  - 只修 `rows -> compiler -> scriptText -> splitter -> TTS-bound text` 链路里的数学公式归一化。
  - 同步修 rows 表格空态文案，不再把 `rows` 工程词作为空态主提示。
  - 不回滚 rows-only。
  - 不恢复 Agent 对话里的 `文案预览` / `板书预览`。
  - 不碰 A/B/C timeline。
  - 不碰 B/C Inspector 控件命名。
  - 不新增外部依赖，不使用旧项目运行代码。
- 已落地：
  - `src/modules/speechText/aliyunMathSpeechText.ts`
    - 新增 `normalizeAliyunMathFormula()`。
    - 已包裹的 `$...$` / `\(...\)` / `\[...\]` 公式不再原样跳过，而是保留分隔符并归一化内部公式。
    - `\left` / `\right` / `\displaystyle` 会在 TTS-bound text 中移除。
    - `\div` -> `÷`，`\times` / `\cdot` -> `×`，并归一部分常见比较符号。
  - `scripts/check-script-splitter.mjs`
    - 新增 `$\\left(...\\right) \\div ...$` 样本，守住 TTS-bound text 不再带 `\left` / `\right` / `\div`。
  - `src/modules/scriptAgentTable/ScriptAgentTableEditor.tsx`
    - 空表格提示改为 `等待 Agent 生成讲解切片...`，保留 AntD Table 骨架和添加切片入口。
  - `scripts/check-script-agent-rows-contract.mjs`
    - 新增守门：禁止空态主提示回到 `等待 rows 表格候选`。
- 一一对应关系：
  - Agent prompt 只要求 rows。
  - 表格工作台只编辑 `section / stepLabel / voiceText / boardSlice`。
  - compiler 才生成内部 `spokenScript / boardPlan / <br> / <b>`。
  - 下一页入轨分片只展示正式 `scriptText.summary` 的 splitter 结果。
  - TTS 数学归一化只影响送阿里云前文本，不改板书显示，不新增第二真相。
- subreview：
  - Fermat 只读复核 B/C 控制链路：`A source ∩ B display`、B 超出 A 静态留场、StagePreview 等比缩放链路当前代码成立。
  - Fermat 同时指出下一刀 P1/P0 风险：`BoardClipInspector` 控件命名仍混 B/C；Inspector 的 `素材宽度` 只 patch `widthPercent`，若业务要“整体大小”需另刀改为等比 patch 或改名为占位宽度。
  - Copernicus 只读复核 Agent rows 主链：Agent/用户在 Agent 窗里只进入 rows 表格；`voiceText` 和 `boardSlice` 贯通到正式入轨；`section/stepLabel` 当前是候选表格辅助字段，不进入正式 TTS/board 链路。
  - Copernicus 同时指出 Feishu import 仍是旧 `spokenScript/boardPlan` 外部入口；本包不迁移 Feishu，但下一刀必须把它标为 legacy isolated 或迁到 rows-only。
- 已验证：
  - `.\runtime\node\npm.cmd run check:script-splitter` 通过。
  - `.\runtime\node\npm.cmd run check:script-agent-rows` 通过。
  - `.\runtime\node\npm.cmd run typecheck` 通过。
  - `git diff --check` 只有 Windows 行尾 warning，没有 whitespace error。
  - `curl.exe -sS -i http://127.0.0.1:5198/api/health` 返回 200。
  - `.\runtime\node\npm.cmd run smoke:ui` 通过，目标：`http://127.0.0.1:5198/`，截图：`.tmp-ui-smoke\workbench-2026-05-05T19-52-54-562Z.png`。
  - 浏览器细节复验通过，目标：`http://127.0.0.1:5198/`，截图：`.tmp-ui-smoke\script-agent-empty-copy-2026-05-06_034843.png`；rows 表格标题存在，空态新文案存在，旧空态和旧预览入口文案不存在。

## 2026-05-06_042358_SCRIPT_AGENT_TABLE_LAYOUT_REPAIR

- 记录文件：
  - `SCRIPT_AGENT_TABLE_LAYOUT_REPAIR_2026-05-06_042358可阅.md`
  - `current-baton.md`
- 本包性质：
  - 代码修复 + 合同检查 + 浏览器实测。
  - 只修 `文稿与板书 Agent` 窗口 rows 候选表格布局和手工新增行可用性。
  - 不碰 TTS 数学归一化、A/B/C timeline、B/C Inspector、飞书旧入口、C 数学符号渲染或旧项目。
- 触发原因：
  - 浏览器实测发现右侧表格被大蓝说明块压到 `y=735`，不是第一工作面。
  - 夏夏当前模板样本明确是 `B板书贴片` 对 `A轴讲的内容` 的一一对应表格，不是聊天区重复预览。
- 已落地：
  - `src/components/ScriptAgentWorkspace.tsx`
    - 右侧标题改为 `讲解切片候选`，`rows` 只保留为小技术 tag。
    - 移除 `script-agent-table-boundary` 大蓝提示块。
    - Splitter 默认比例改为左侧 `42%`、右侧 `58%`。
    - sub review 后补修：顶部主操作条也改为 `讲解切片候选`，`rows` 只保留为 tag。
  - `src/components/AgentReviewCard.tsx`
    - 默认请求文案改为 `讲解切片表格候选`。
    - 对话区不再直接显示 `输出合同：rows`。
    - receipt 改为 `已生成 X 行讲解切片`。
    - 状态提示识别 `draft.rows?.length`，右侧已有候选表格时不再停留在初始化说明。
  - `src/modules/scriptAgentTable/ScriptAgentTableEditor.tsx`
    - 渲染顺序改为 toolbar -> AntD Table -> 折叠规则。
    - 列改为 `分区 / 步骤 / B板书贴片（一行一个贴片） / A轴讲解内容（语音切片） / 操作`。
    - `编译为候选稿` 改为 `刷新候选稿`。
    - 统计拆为 `行切片 / 段语音 / 段板书`。
  - `src/modules/scriptAgentTable/normalizeScriptAgentTableDraft.ts`
    - 修复 `添加切片` 无效：有 `stepLabel` 的手工空行必须保留在候选 rows。
    - 空行仍不泄漏成正式 `spokenScript/boardPlan`。
  - `scripts/script-agent-rows-contract.mjs`
    - 与应用归一化保持一致，保留手工空行。
  - `scripts/check-script-agent-rows-contract.mjs`
    - 新增守门：禁止大蓝提示块回滚，表格必须在规则前，手工空行必须可编辑但不写正式文稿/板书。
    - sub review 后补修：编译生产 TS normalizer 并运行空 rows 用例，防止只测 JS 镜像。
    - sub review 后补修：禁止 `rows 候选`、`输出合同：rows`、`行 rows 表格候选` 回滚到用户主文案。
- 浏览器验证：
  - 目标：`http://127.0.0.1:5198/`
  - 交互：编辑题文 -> `讲解生成` -> 打开 Agent -> 右侧点 `添加切片`。
  - 表格位置从 `y=735` 提前到 `y=306`。
  - 右侧表格区域约 `696px`。
  - `script-agent-table-boundary` 数量为 `0`。
  - 折叠规则位于表格之后。
  - 手工新增空行后出现 `4` 个输入控件。
  - review 后复测：`rows 候选` / `输出合同：` / `行 rows 表格候选` 均不存在。
  - 截图：`.tmp-ui-smoke\script-agent-table-layout-2026-05-06_042358.png`
  - review 后截图：`.tmp-ui-smoke\script-agent-table-layout-2026-05-06_042358-reviewfix.png`
- 已验证：
  - `.\runtime\node\npm.cmd run check:script-agent-rows` 通过。
    - 包含 `[script-agent-rows:ts-normalizer] passed`，真实 TS normalizer 保留手工空 rows 且不泄漏正式文稿/板书。
  - `.\runtime\node\npm.cmd run typecheck` 通过。
  - `git diff --check` 只有 Windows 行尾 warning，没有 whitespace error。
  - `.\runtime\node\npm.cmd run smoke:ui` 通过，截图：`.tmp-ui-smoke\workbench-2026-05-05T20-23-59-984Z.png`。

## 2026-05-06_052027_ABC_FORMULA_TEXT_SCOPE_RENDER_REPAIR

- 记录文件：
  - `ABC_FORMULA_TEXT_SCOPE_RENDER_REPAIR_2026-05-06_052027可阅.md`
  - `current-baton.md`
- 本包性质：
  - 代码修复 + 组件收敛 + 合同检查 + 浏览器实测。
  - 只修“展示数学的区域统一组件化”和 A/B timeline 视觉起点对齐证据。
  - 不做全局 hook，不改输入控件，不改 rows 存储，不改 TTS 文本，不翻旧项目。
- 已落地：
  - 新增 `src/components/FormulaText.tsx`
    - 统一公式展示组件块。
    - 使用 `hasBoardMath()` + `tokenizeBoardText()` + KaTeX。
    - display only，不写回数据。
  - `src/components/MathText.tsx`
    - 收敛为 `FormulaText` 兼容外壳。
  - `src/components/BoardMathStickerContent.tsx`
    - 复用 `FormulaText`。
    - 用 `rootClassName=""` 防止 C 贴片内部嵌套第二个 `.board-text-sticker` 根类。
  - `src/components/AssetList.tsx`
    - `asset.summary` 是展示域，改为 `MathText`。
  - `src/modules/scriptSegments/ScriptSegmentWorkbench.tsx`
    - `segment.text` 和 `boardMarkerTexts[]` 改为 `FormulaText`。
  - `src/modules/scriptSegments/ScriptSegmentPreview.tsx`
    - `segment.text` 和 `boardMarkerTexts[]` 改为 `FormulaText`。
  - `src/modules/boardSticker/mathBoardText.ts`
    - 扩展 `$...$`、`\(...\)`、`\[...\]`、函数表达式、常见 LaTeX 命令识别。
  - `src/styles.css`
    - C 板书数学和文字字号统一为 `var(--board-font-size)`。
    - B 轨 label 不再占用 timeline 坐标宽度，守住 A/B 视觉 0ms 起点。
  - `scripts/check-board-boundaries.mjs`
    - 增加 FormulaText 组件块守门。
    - 增加展示域防裸文本回滚守门。
    - 增加函数/分数/显式 delimiter tokenizer 回归。
- 浏览器验证：
  - 目标：`http://127.0.0.1:5198/`
  - 注入样例：`函数 f(x)=x^2+1`、`$25×4=100$`、`\(= \frac{5}{8}\)`。
  - `deltaLeft = 0`，A 轨 timed lane 与 B 轨 timed lane 起点一致。
  - `boardKatexCount = 1`，舞台 C 数学贴片渲染出 KaTeX。
  - `timelineKatexCount = 2`，时间轴标题渲染出公式。
  - `stageProblemKatexCount = 1`，题文舞台渲染出公式。
  - `hasRawDollarOnStage = false`。
  - `hasNestedBoardStickerRoot = false`。
  - 截图：`.tmp-ui-smoke\abc-formula-text-lane-math-2026-05-06.png`
  - 当前首页未挂载 `ScriptSegmentPreview` / `ScriptSegmentWorkbench`，不伪称浏览器看到了；这两个组件由源码守门覆盖。
- 已验证：
  - `.\runtime\node\npm.cmd run check:board-boundaries` 通过。
  - `.\runtime\node\npm.cmd run check:script-agent-rows` 通过。
  - `.\runtime\node\npm.cmd run typecheck` 通过。
  - `.\runtime\node\npm.cmd run smoke:ui` 通过，截图：`.tmp-ui-smoke\workbench-2026-05-05T21-19-33-188Z.png`。
  - `git diff --check` 只有 Windows 行尾 warning，没有 whitespace error。

## 2026-05-06_052813_ABC_C_FONT_AND_BC_FIELD_RG_AUDIT

- 记录文件：
  - `ABC_C_FONT_AND_BC_FIELD_RG_AUDIT_2026-05-06_052813可阅.md`
  - `current-baton.md`
- 本包性质：
  - 只读审计 + 持久记录。
  - 不改运行代码，不翻旧项目，不把旧 demo 当当前工程真相。
- 触发原因：
  - 夏夏要求用 `rg` 全局搜关键参数变量，回答“到底几个在控制”，不能凭记忆、不能丢三落四。
- rg 证据：
  - 当前机器 `rg --version` 返回 `ripgrep 15.1.0`。
  - `boardFont*` 关键词命中 9 个文件。
  - `fontSize/drawSpeed/widthPercent/xPercent/yPercent/startMs/endMs/revealStartMs/revealEndMs` 关键词命中 19 个文件。
  - 逐字段 `src` 命中已写入审计文件：例如 `fontSize` 36 行、`widthPercent` 28 行、`startMs` 79 行、`revealStartMs/revealEndMs` 各 22 行。
  - 命中数不等于控制权，审计文件已按写入、归一化、消费、前端入口、是否唯一分层。
- 当前结论：
  - 当前工程 C 板书字体正式写入口只有 1 条：`CanvasInspector / BoardTypographyControlledFields -> updateStageCanvas -> normalizeStageCanvas -> createBoardTypographyConfig -> project.stage.canvas -> StagePreview -> BoardTextSticker/renderBoardTextStickerImage`。
  - C 字体/字号按职责分是 8 类真实控制角色。
  - `AppSettingsDrawer` 只改新工程默认 C 字体，不改当前工程。
  - 单贴片字号用户入口有 2 个：右侧 `BoardClipInspector` 的 `fontSize` 输入，和舞台 resize 同步产出的 `widthPercent + fontSize`；最终都进入 `updateBoardClipState()`。
  - 公式/函数展示走 `FormulaText/KaTeX`，不是普通手写字体链。
- 下一刀：
  - 优先修 B/C Inspector 控件命名和语义：`开始 ms/结束 ms`、`素材宽度`、`素材字号`、`速度`。
  - `素材宽度` 当前只改 `widthPercent`；如果产品语义要“整体大小”，下一刀必须改为同步 `fontSize`，或改名为 `占位宽度`。

## 2026-05-06_055014_ABC_BC_INSPECTOR_LABEL_REPAIR

- 记录文件：
  - `ABC_BC_INSPECTOR_LABEL_REPAIR_2026-05-06_055014可阅.md`
  - `current-baton.md`
- 本包性质：
  - 代码修复 + B/C 控件岗位分组 + 锚点守门 + 浏览器实测。
  - 只修 `CanvasInspector` / `BoardClipInspector` 的业务命名、分组和守门脚本。
  - 不改 A/B/C timeline 数据结构，不新增颜色字段，不把 `widthPercent` 假称整体大小，不碰公式引擎、Agent rows、TTS 或 Feishu。
- 触发原因：
  - 夏夏指出 C 控制台混乱：C 字体谁控制、B 显示时间谁控制、C 大小/位置/速度字段与前端控件必须一一对上。
  - 上一包 rg 审计确认：`BoardClipInspector` 的旧标签 `开始 ms / 结束 ms / 素材宽度 / 素材字号 / 速度` 容易把 B 显示存活和 C 书写演绎混在一起。
- 已落地：
  - `src/components/CanvasInspector.tsx`
    - `当前工程 C板书字体 / 画布` -> `当前工程 C 板书字体 / 画布变量`。
    - `规格` -> `白板规格`。
    - `背景色` -> `背景画布颜色`。
  - `src/components/BoardClipInspector.tsx`
    - `素材控制` -> `素材 C 控制`。
    - 拆成 `当前素材内容`、`B 显示时间`、`C 站位 / 占位 / 字号`、`书写体感`。
    - `开始 ms / 结束 ms` -> `显示开始 ms / 显示结束 ms`，并明确“不等于开始或结束书写”。
    - `x 位置 / y 位置` -> `横向位置 / 纵向位置`。
    - `素材宽度` -> `占位宽度`，因为当前只写 `widthPercent`。
    - `素材字号` -> `字号细调`。
    - `速度` -> `书写体感`，并明确只影响 C reveal 体感，不改 A 或 B。
    - 底部固定口径：`C 动态书写窗口 = A 语音区间与 B 显示时间的交集；B 超过 A 的尾巴只静态留场。`
  - `src/styles.css`
    - 新增 `.inspector-section` / `.inspector-section-title`，让岗位分组在右侧面板里有清晰边界。
  - `scripts/check-board-boundaries.mjs`
    - 增加旧标签禁止回滚守门。
    - 增加新 B/C 标签和 `bc-*` 锚点存在守门。
- 锚点：
  - `bc-c-content-panel-001`
  - `bc-b-display-window-panel-001`
  - `bc-c-position-size-panel-001`
  - `bc-c-draw-feel-panel-001`
- 浏览器验证：
  - 目标：`http://127.0.0.1:5198/`
  - 专项 1：真实 current snapshot 注入后刷新，点击 `.clip--board`，右侧 Inspector 完整显示；`missingRequired=[]`，`forbiddenPresent=[]`。
  - 截图：`.tmp-ui-smoke\bc-inspector-labels-2026-05-05T21-48-46-270Z.png`
  - 专项 2：真实页面交互链 `题文编辑 -> 讲解生成 -> rows 表格候选 -> 确认应用到正式稿 -> 用真实 CosyVoice 生成 A 轨 -> B clips -> 点击 .clip--board` 跑通；只 mock 外部 Agent/TTS 响应，页面内部流程不 mock。
  - 专项 2 结果：`boardClipCount=2`，`hasBoardClipInspector=true`，`requiredMissing=[]`，`forbiddenPresent=[]`。
  - 截图：`.tmp-ui-smoke\bc-inspector-generated-flow-2026-05-05T21-49-49-703Z.png`
- 已验证：
  - `.\runtime\node\npm.cmd run check:board-boundaries` 通过。
  - `.\runtime\node\npm.cmd run typecheck` 通过。
- 浏览器专项：
  - dev server 自动落在 `http://127.0.0.1:5198/`。
  - `.\runtime\node\npm.cmd run smoke:ui` 通过，fresh 上下文基础页面可打开。
  - fresh Playwright 上下文读不到夏夏当前 Chrome profile 里刚生成的语音状态；这是浏览器状态隔离。
  - 临时在 Playwright 页面内存注入 1 个 B board clip 验证 C 控制台，不写源码、不写工程文件。
  - 结果：`boardClipCount=1`，`requiredMissing=[]`。
  - 截图：`.tmp-ui-smoke\c-inspector-injected-board-2026-05-06T01-17-30-886Z.png`。
  - `.\runtime\node\npm.cmd run smoke:ui` 通过。
- 下一刀不要混：
  - 如果要把右侧 `占位宽度` 升级为真正 `整体大小`，必须另刀同步 `widthPercent + fontSize`，不能只改文案。
  - `clip.color` 颜色字段另刀从类型、store、StagePreview、渲染链一起加。
  - 数学符号/函数 renderer 另刀处理，不混入 B/C 控件命名。

## 2026-05-06_082542_ABC_CONTROL_LAYER_UNIQUE_INDEX

- 记录文件：
  - `ABC_CONTROL_LAYER_UNIQUE_INDEX_2026-05-06可阅.md`
  - `current-baton.md`
- 本包性质：
  - 唯一职责表数据源 + 右侧只读展示 + 守门脚本。
  - 不改 A/B/C 业务逻辑，不引入外部项目，不把旧材料当当前工程真相。
- 触发原因：
  - 夏夏要求“用参数关键词全局搜索”“不能两套”“不能丢三落四”，需要把谁控制谁压成唯一源，而不是 UI 和脚本各写一份。
- 已落地：
  - `src/modules/boardControlLayers/boardControlResponsibilities.ts`
    - 新增唯一职责表数据源。
    - 覆盖 `playheadMs`、`sourceStartMs/sourceEndMs`、`startMs/endMs`、`revealStartMs/revealEndMs`、`drawSpeed`、`xPercent/yPercent/widthPercent/fontSize`、`boardFont*`、`hasBoardMath/tokenizeBoardText/katex`、`marker/math-symbol-factory`、`typography.globalFontPreset`。
  - `src/components/BoardControlResponsibilitiesPanel.tsx`
    - 新增只读面板，从唯一数据源渲染。
  - `src/components/InspectorPanel.tsx`
    - 接入 `A/B/C 控制层职责表` 折叠区。
  - `src/styles.css`
    - 新增职责表只读卡片样式。
  - `scripts/check-board-boundaries.mjs`
    - 校验唯一源、关键 row id、关键字段覆盖。
- 当前结论：
  - 当前工程 C 字体入口仍是 `CanvasInspector -> updateStageCanvas()`。
  - `AppSettingsDrawer` 是新工程默认值，不是当前工程即时入口。
  - `globalFontPreset` 当前不是 C 板书生效入口。
  - `marker` 轨道和 `math-symbol-factory` 占位不是现役 C 特殊标记渲染层。
- 已验证：
  - `.\runtime\node\npm.cmd run check:board-boundaries` 通过。
  - `.\runtime\node\npm.cmd run typecheck` 通过。
- 下一刀不要混：
  - 大小控件语义单独处理。
  - 数学符号链单独处理。
  - 特殊符号/标记另起 C marker 层。

## 2026-05-06_085204_ABC_C_INSPECTOR_CONTROL_CONVERGENCE

- 记录文件：
  - `ABC_CONTROL_LAYER_UNIQUE_INDEX_2026-05-06可阅.md`
  - `current-baton.md`
- 本包性质：
  - 右侧 C 控制台第一刀：真实字段接真实控件，缺字段入口标 `待接通`，非 C 控件不混进 C 面板。
  - 不引入外部项目、外部依赖、外部环境。
  - 不改 A/B/C timing 业务逻辑，不新增颜色字段，不实现特殊标记。
- 已落地：
  - `src/modules/boardSticker/boardStickerGeometry.ts`
    - 新增 `createBoardStickerUniformScalePatch()`，从输入比例派生同步 `widthPercent + fontSize`。
  - `src/modules/boardSticker/index.ts`
    - 导出派生整体缩放 helper 和类型。
  - `src/components/BoardClipInspector.tsx`
    - 增加 `当前素材映射关联` 只读区，显示 A source、B display、C reveal。
    - `C 站位 / 占位 / 字号` 收成 `C 站位 / 大小 / 字体`。
    - 增加 `整体缩放`，作为派生控件同步写入 `widthPercent + fontSize`，不新增第二套字段。
    - 保留 `占位宽度` 只写 `widthPercent`，`字号细调` 只写 `fontSize`。
    - 增加 `字体颜色：待接通`，说明当前没有 `TimelineClip.color` 字段。
    - 增加 `单素材字体 URL：不在这里控制`，说明当前工程字体入口仍在画布变量。
  - `src/modules/boardControlLayers/boardControlResponsibilities.ts`
    - 更新 `abc-c-position-size`，把 `整体缩放(派生控件)` 纳入唯一职责表。
  - `scripts/check-board-boundaries.mjs`
    - 增加新标签、新锚点、派生缩放 helper 的守门。
  - `src/styles.css`
    - 增加 `.inspector-readonly-list` 样式。
- 当前边界：
  - `整体缩放` 不是新字段，只是 `widthPercent + fontSize` 的同步写入入口。
  - 颜色、单素材字体 URL、特殊标记都没有伪接通。
- 已验证：
  - `.\runtime\node\npm.cmd run check:board-boundaries` 通过。
  - `.\runtime\node\npm.cmd run typecheck` 通过。

## 2026-05-09_ABC_TEMPLATE_LABEL_AYL_SUFFIX_CONVERGENCE

- 目标：
  - 统一 A/B/C 模板类标签命名，所有 template 标签加 `-pre` 后缀。
  - 确保 A/B/C 一一对应，环环相扣，没有位置也要空着。
  - 消除技术债务，避免以后重开。
- 根因：
  - 夏夏指出标签必须按语音和时间轨设计，A-template-pre 对应 B-template-pre/C-template-pre。
  - 之前代码中 template-open 的 B/C 是 `B-unbound/C-unbound`，和其他模板不一致。
  - 检查脚本 `scripts/script-agent-rows-contract.mjs` 有自己的标签定义，和源码不同步。
- 已改：
  - `src/modules/abcChain/abcChainKey.ts`
    - 所有 template 标签加 `-pre` 后缀：`A-template-open`, `B-template-open`, `C-template-open` 等。
    - `isBoardMaterialChainKey` 包含 `template-open`，确保标签一一对应。
  - `src/agent/scriptBoardAgentPrompt.ts`
    - 更新 prompt 合同，所有标签加 `-pre`，明确"一一对应，当前无内容时留空"。
  - `src/config/defaultConfig.ts`
    - 更新配置合同，所有标签加 `-pre`。
  - `src/components/AppSettingsDrawer.tsx`
    - 更新 UI 提示，所有标签加 `-pre`。
  - `src/modules/scriptAgentTable/ScriptAgentTableEditor.tsx`
    - 更新 UI 提示和条件判断，所有标签加 `-pre`。
  - `vite.config.mjs`
    - 更新默认 prompt 模板，所有标签加 `-pre`。
  - `scripts/script-agent-rows-contract.mjs`
    - 同步标签定义，所有 template 标签加 `-pre`。
    - `isBoardMaterialChainKey` 包含 `template-open`。
  - `scripts/check-script-agent-rows-contract.mjs`
    - 同步检查逻辑，更新 `forbiddenTemplateOpenB/C` 为 `-pre` 版本。
    - 更新 boardPlan 检查字符串为 `-pre` 版本。
    - 更新 UI copy 检查为新的文案。
- 关键教训：
  - 检查脚本有自己的标签定义，修改源码时必须同步修改检查脚本。
  - 用全局关键词、参数、字段搜索，看多少再用。
  - 宁愿慢一点，也要做对。
- 已验证：
  - `npm run typecheck` 通过。
  - `node scripts/check-script-agent-rows-contract.mjs` 通过。
- 下一刀不要混：
  - 步骤类标签 `A1/B1/C1` 保持原样，不带 `-pre`。
  - `unbound` 标签保持原样。

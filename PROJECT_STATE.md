# Project State

## 基本信息

- 项目名：video-dev-cleanroom / teaching-cut-cleanroom
- 最后更新：2026-06-06 16:07:36 +08:00
- 当前阶段：题目区正文真相已纠偏回第 1 步确认题文；标签分片容器与右栏职责表边界已收住；下一刀继续把题目区与录制/未来 Konva 的尺寸真相再收紧
- 负责人：当前 agent

## 已确认的设计决策

- 唯一施工目录是 `D:/video-dev-cleanroom`；旧仓只作参考证据源。
- 真相源顺序：`.workbuddy/memory` -> 根目录五件套与专题真相 -> 代码实证 -> `.claude` 旧足迹辅助。
- 当前唯一业务主线：`boardSlice` 普通多行原文 -> 保留用户 `\n` -> 手写字体文本渲染 -> 按字符 reveal -> C 默认留场。
- 当前不启动 Konva 主迁移、不重启 SVG/path/逐笔轨迹、不做 Agent 智能排版、不做标签 manual override、不做数学公式大改、不做 tldraw 清理。
- 画布内元素样式边界固定为：`src/stage.css` 只承接舞台内样式；`src/styles.css` 只承接页面壳子与非舞台区域。
- 当前标签拖动只允许按住标签 pill 本身；分片容器外框只做显示边界，不抢 C 板书拖拽命中。
- 工程记录范式固定为：`AGENTS.md` + 五件套 + `PROJECT_TREE.md` + `CHANGE_TREE变更树.md`。
- 本机级范式选择 Codex skill 形态：`local-continuity-standard`，项目内五件套是该技能投放后的项目实例。
- 技能套件规则包不能捆死任何项目、用户目录、本机路径或特定工具安装；具体工具栈只能通过配置声明。
- 自动安装引导采用 dry-run 优先：预览目标与风险，用户显式确认后才安装。
- 第二步文稿/板书生成的唯一候选合同是 `rows`：`voiceText` 是文稿，`boardSlice` 是 C 素材候选；确认应用后才编译到正式 `scriptText` / `boardLayout`。
- Agent 返回 JSON 时可能把课堂数学表达的反斜杠写成未转义形式；网关只在 rows JSON 入口修复当前 C 板书已支持的数学命令/定界符，并保留合法 JSON 转义如 `\n`，拒绝未知非法转义。
- 题目区正文的唯一真相是第 1 步确认后的 `problemText.summary`；开场读题只决定 A 口播阶段与“题目区”分区身份，若冲撞时不得用 opening `boardSlice` 覆盖题目区正文。

## 已验证的边界

- 根目录已有 `DECISIONS.md` 与 `CHANGE_TREE变更树.md`，此前没有根目录 `PROJECT_STATE.md`、`ENGINEERING_LOG.md`、`ARCHITECTURE.md`、`KNOWN_ISSUES.md`。
- `.claude/PROJECT_STATE.md` 与 `.claude/ENGINEERING_LOG.md` 只能作为辅助镜像，不作为最高真相。
- 结构树采用根目录 `PROJECT_TREE.md` 维护关键工程骨架，不把 `node_modules`、`dist`、`历史/` 全量噪音展开为主树。

## 当前代码状态

- 主要文件：`src/modules/boardSticker/mathBoardText.ts` - 仍是下一刀的高危点，普通手写文本归一化可能压扁换行。
- 舞台样式边界：`src/stage.css` - 新增舞台专用 CSS，收纳标签、题目、板书、金手指、舞台工具栏与 standalone 舞台壳子。
- 页面样式壳子：`src/styles.css` - 已剥离舞台内规则，只保留页面壳子、时间轴、面板与非舞台区域。
- 右栏职责表容器：`src/styles.css` - 已把 `A/B/C 控制层职责表` 收成单列侧栏内滚容器，长文案断行，不再横向撑爆右侧 inspector。
- 题图入口组件：`src/components/ProblemUploadPreview.tsx` - 已从大拖拽面板改成“左缩略 / 右按钮”的紧凑上传 rail，空态和有图态共用同一稳定高度。
- 题图入口样式：`src/styles.css` - 新增 `problem-upload-*` 紧凑 rail 样式；题图缩略改成 `contain`，避免卡片裁图。
- 分区布局真相：`src/modules/canvasStage/coursewareZoneLayout.ts` - 以当前 DOM 中的题目正文和各区 C 板书 bbox 为输入，生成四区容器框与标签位置；空区仅保留标签，不硬画空框。
- 题文真相源头：`src/components/ProblemWorkspace.tsx` - `data-agent-anchor="problem-text-step1"` 系列节点明确标出第 1 步确认题文就是 `problemText.summary` 真相源。
- 舞台标签壳子：`src/components/DrawboardStage.tsx` - 根据实时测量结果渲染分区框；标签 pill 可拖但不写回业务数据；标签层级高于板书，避免命中抢占。
- 舞台题目真相：`src/components/DrawboardStage.tsx` - `stage-problem-area` / `stage-problem-text` 已加 `data-agent-anchor`，明确舞台题目区只读 `problemText.summary`，不读 opening `boardSlice`。
- 录制底图：`src/modules/canvasStage/drawCoursewareStageFrame.ts` / `src/components/CanvasRecordingSurface.tsx` - 录制底图同步消费同一份分区框与标签位置，并通过 `problemSummary` 继续读取同一条 `problemText.summary` 题文真相。
- C 分区标识：`src/components/BoardTextSticker.tsx` / `src/components/CStickerFrame.tsx` / `src/components/AutoHandwritingLayer.tsx` - 给每个 C 板书挂 `board-text-sticker--zone-*`，供舞台测量分区边界。
- 舞台边界验证：`scripts/check-board-boundaries.mjs` - 已改成同时读取 `styles.css` 和 `stage.css`，并守门“舞台样式不得回流到全局样式表”。
- 第二步网关：`scripts/script-agent-rows-contract.mjs` - rows 合同读取、编译，以及 Agent JSON 数学反斜杠限定修复。
- 第二步网关：`vite.config.mjs` - 本地 dev `/api/agent/script-board` 使用 rows parser。
- 第二步网关：`scripts/zeabur-server.mjs` - Node/部署 `/api/agent/script-board` 使用 rows parser。
- 第二步验证：`scripts/check-script-agent-rows-contract.mjs` - rows 对应关系、TS normalizer、未转义 LaTeX 反斜杠回归。
- 关键记录：`AGENTS.md` - SessionStart/Stop 与工作单元闭环规则。
- 关键记录：`ENGINEERING_LOG.md` - 后续工作单元自包含记录入口。
- 关键记录：`PROJECT_TREE.md` - 关键结构快照入口。
- 已测试：`npm run check:script-agent-rows`、`npm run typecheck`、直接 Node 复现未转义课堂数学命令、合法 `\n` 转义保留、未知非法转义拒绝。
- 本轮已测试：`npm run check:board-boundaries`、`npm run typecheck`。
- 本轮已测试：`npm run smoke:pending-new-problem`、Playwright 空态/有图态实测（上传 rail 高度稳定为 104px）。
- 本轮已测试：本地 Playwright `standalone=drawboard-core` 交互回归；验证“拖标签时板书不跟随，拖板书仍可正常移动”，截图保存在 `.tmp-ui-smoke/zone-label-drag-2026-06-06T06-12-59-865Z.png`。
- 系统级技能源：`.tmp-system-skill-source/local-continuity-standard` - 已验证，等待批准安装到 `C:\Users\admin\.codex\skills`。
- 秩序审计脚本：`scripts/audit-local-order.mjs` - 可移植，默认只查项目连续性文件；具体本机工具路径读 `scripts/continuity-stack.config.json` 或 `CONTINUITY_STACK_CONFIG`。
- 系统安装引导：`.tmp-system-skill-source/local-continuity-standard/scripts/install-system-skill.mjs` - 默认 dry-run，`--yes` 才安装，`--replace` 才覆盖。
- 项目内桌面工具落点：`.claude/desktop-tools/` - 用户已复制原桌面鼠标专武；新增 `.claude/desktop-tools/continuity-weapon/` 作为秩序专武入口，不覆盖原工具。

## 已知的坑

- `boardSlice` 的 `\n` 是内容真相，渲染层不能用普通空白归一化压扁。
- 第二步 Agent JSON 里课堂数学表达的单反斜杠可能导致 `Bad escaped character in JSON`；必须在网关 rows 入口按产品数学边界修复，不能让前端或正式资产层各修各的，也不能吞未知脏内容。
- DOM / Canvas / 未来 Konva 禁止各写一套文本 layout；必须共用同源排版结果。
- 标签、题目、板书这三个画布内元素的尺寸逻辑仍未完全统一到比例真相；本轮已把标签分片容器改成内容 bbox 驱动，但题目区 max-width 和未来 Konva proof 仍待继续收口。
- 题目区正文与 opening 读题语义不能混：即便 opening 行存在候选文案或误填 `boardSlice`，舞台题目区与录制底图也必须继续以第 1 步确认的 `problemText.summary` 为准。
- 右栏职责表属于页面壳子面板，不应再把侧栏当成无限长画布；展开内容必须在自身容器内滚动，不能横向撑爆 inspector。
- 标签拖动不得写回 `boardSlice`；如需持久化必须走独立 manual override 字段。
- 只在对话里说发现、决策、坑，没有写入对应文件，等于没有完成工程记录。

## 下一步（接力棒）

- 目标：继续收“画布内元素与画布比例同源”，优先把题目区正文 bbox、录制底图、Konva proof 对到同一套尺寸口径，再决定是否推进持久化 label override。
- 目标：继续收“画布内元素与画布比例同源”，优先把题目区正文 bbox、录制底图、Konva proof 对到同一套尺寸口径，再决定是否推进持久化 label override。
- 补充边界：右栏 `A/B/C 控制层职责表` 已改成侧栏内滚面板；后续若再改职责表，只能继续在 `src/styles.css` 的页面壳子层处理，不要把这类容器规则混进 `src/stage.css`。
- 前置条件：不要改第二步 rows 合同；不要把页面壳子样式再混回 `src/stage.css`；`boardSlice` 原文和用户 `\n` 仍是内容真相。
- 关键文件：`src/stage.css`、`src/modules/canvasStage/coursewareZoneLayout.ts`、`src/components/DrawboardStage.tsx`、`src/modules/canvasStage/drawCoursewareStageFrame.ts`、`src/components/KonvaRecordingSurface.tsx`。
- 验证方式：继续跑 `npm run check:board-boundaries`、`npm run typecheck`；涉及交互时补本地 Playwright 回归，继续守住“标签拖动不撞 C 板书”。
- 预期成本：约 2k token。

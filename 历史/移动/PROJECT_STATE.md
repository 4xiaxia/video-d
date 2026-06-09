# Project State

## 基本信息

- 项目名：video-dev-cleanroom / teaching-cut-cleanroom
- 最后更新：2026-06-08 03:15:00 +08:00
- 当前阶段：已修复同事改坏的画布样式重复与符号路由回归；styles.css 舞台样式已清回 stage.css；标签+弹性容器=板书分片流动盒子模型已确认（容器=文本块+10px边距，点击标签拖动整组分片）；符号 ×/÷ 保留 Unicode 不做 ASCII fallback；下一步可做 tldraw 尾巴清理或 DOM/Konva 共享 layout helper
- 负责人：当前 agent

## 已确认的设计决策

- 唯一施工目录是 `D:/video-dev-cleanroom`；旧仓只作参考证据源。
- 真相源顺序：`.workbuddy/memory` -> 根目录五件套与专题真相 -> 代码实证 -> `.claude` 旧足迹辅助。
- 当前唯一业务主线：`boardSlice` 普通多行原文 -> 保留用户 `\n` -> 手写字体文本渲染 -> 按字符 reveal -> C 默认留场。
- 当前不把 Konva proof 直接切成生产主舞台；Konva 是后续主舞台控制标准方向，本轮只把 C content 录制层接入真实生产链的 Konva Text canvas；公共入口切换仍必须先通过 C realtime 内容来源、字体命中、拖拽/缩放、录制三层、金手指 overlay 和动态 bbox 等 gate。
- 当前不重启 SVG/path/逐笔轨迹、不做 Agent 智能排版、不做标签 manual override、不做数学公式大改、不做 tldraw 清理。
- 画布内元素样式边界固定为：`src/stage.css` 只承接舞台内样式；`src/styles.css` 只承接页面壳子与非舞台区域。
- 当前标签拖动允许按住标签 pill 本身拖动整组分片（标签+容器+C 板书通过 zoneOffsets 同步偏移）；分片容器框只做显示边界，不抢 C 板书拖拽命中。
- `chainKey` 当前只决定题目/分析/解答/总结的分片身份与标签归组，不再把 C 的 `yPercent` 钳进固定四区；C 的 `xPercent/yPercent` 是整张画布内的自由百分比坐标。
- 分片容器 chrome 是流动分片模块：标签、容器框、C 内容同用 zone key 归组，容器大小由真实内容 bbox + 10px padding 生成；点击标签拖动时，容器和 C 板书通过 zoneOffsets 同步偏移。
- 工程记录范式固定为：`AGENTS.md` + 五件套 + `PROJECT_TREE.md` + `CHANGE_TREE变更树.md`。
- 本机级范式选择 Codex skill 形态：`local-continuity-standard`，项目内五件套是该技能投放后的项目实例。
- 技能套件规则包不能捆死任何项目、用户目录、本机路径或特定工具安装；具体工具栈只能通过配置声明。
- 自动安装引导采用 dry-run 优先：预览目标与风险，用户显式确认后才安装。
- 第二步文稿/板书生成的唯一候选合同是 `rows`：`voiceText` 是文稿，`boardSlice` 是 C 素材候选；确认应用后才编译到正式 `scriptText` / `boardLayout`。
- Agent 返回 JSON 时可能把课堂数学表达的反斜杠写成未转义形式；网关只在 rows JSON 入口修复当前 C 板书已支持的数学命令/定界符，并保留合法 JSON 转义如 `\n`，拒绝未知非法转义。
- 题目区正文的唯一真相是第 1 步确认后的 `problemText.summary`；开场读题只决定 A 口播阶段与"题目区"分区身份，若冲撞时不得用 opening `boardSlice` 覆盖题目区正文。
- 当前第 4 步真实生产主链已复核为 `StagePreview -> LegacyStagePreview -> DrawboardStage -> AutoHandwritingLayer`；`KonvaRecordingSurface` / `KonvaProofPage` 是 proof / 备用迁移入口，不是生产主链。

## 已验证的边界

- 根目录已有 `DECISIONS.md` 与 `CHANGE_TREE变更树.md`，此前没有根目录 `PROJECT_STATE.md`、`ENGINEERING_LOG.md`、`ARCHITECTURE.md`、`KNOWN_ISSUES.md`。
- `.claude/PROJECT_STATE.md` 与 `.claude/ENGINEERING_LOG.md` 只能作为辅助镜像，不作为最高真相。
- 结构树采用根目录 `PROJECT_TREE.md` 维护关键工程骨架，不把 `node_modules`、`dist`、`历史/` 全量噪音展开为主树。

## 当前代码状态

- 主要文件：`src/components/BoardHandwritingStickerContent.tsx` - 普通 C 已改为 DOM 实时文本渲染，保留换行与中文字符；不再把普通 C 转成 PNG。
- 录制 C 内容：`src/components/AutoHandwritingLayer.tsx` - 普通 C content 录制层已改为 `KonvaBoardContentRecordingSurface`，用 `react-konva` 的 `Stage` / `Layer` / `Group` / `Text` 产出隐藏 canvas；不再使用 Canvas2D `fillText` 或普通 C PNG 生成主路；旧 `constrainYPercentToZone` 已移出活链路。
- 当前公共舞台入口：`src/components/StagePreview.tsx` - 继续导出 `LegacyStagePreview`；尚未切换到 Konva 主舞台。
- 当前主舞台壳子：`src/components/LegacyStagePreview.tsx` / `src/components/DrawboardStage.tsx` - 负责 stage shell、分片 chrome、录制底图、金手指 overlay 与 C 内容层组合。
- 备用图片渲染：`src/modules/boardSticker/renderBoardTextStickerImage.ts` - 仍保留为旧路线/备用模块，不再是普通 C 的页面与录制主路径。
- Konva proof：`src/components/KonvaRecordingSurface.tsx` / `src/standalone/KonvaProofPage.tsx` - 已证明仓库可用 Konva，但仍是 proof / 迁移验证入口；未覆盖真实多 clip、动态 bbox、三层录制、金手指、复杂公式与字体命中 gate。
- 舞台样式边界：`src/stage.css` - 新增舞台专用 CSS，收纳标签、题目、板书、金手指、舞台工具栏与 standalone 舞台壳子。
- 页面样式壳子：`src/styles.css` - 已剥离舞台内规则，只保留页面壳子、时间轴、面板与非舞台区域。
- 右栏职责表容器：`src/styles.css` - 已把 `A/B/C 控制层职责表` 收成单列侧栏内滚容器，长文案断行，不再横向撑爆右侧 inspector。
- 题图入口组件：`src/components/ProblemUploadPreview.tsx` - 已从大拖拽面板改成"左缩略 / 右按钮"的紧凑上传 rail，空态和有图态共用同一稳定高度。
- 题图入口样式：`src/styles.css` - 新增 `problem-upload-*` 紧凑 rail 样式；题图缩略改成 `contain`，避免卡片裁图。
- 分区布局真相：`src/modules/canvasStage/coursewareZoneLayout.ts` - 以当前 DOM 中的题目正文和各区 C 板书 bbox 为输入，生成四区容器框与标签位置；空区仅保留标签，不硬画空框。
- 分片 chrome 模块：`src/components/CoursewareSegmentChrome.tsx` - 扁平渲染标签 pill 与可选容器框，容器 `pointer-events: none`，题目区不显示蓝色虚线框；已埋 `data-agent-anchor`。
- 题文真相源头：`src/components/ProblemWorkspace.tsx` - `data-agent-anchor="problem-text-step1"` 系列节点明确标出第 1 步确认题文就是 `problemText.summary` 真相源。
- 舞台标签壳子：`src/components/DrawboardStage.tsx` - 根据实时测量结果渲染分区框；标签 pill 可拖但不写回业务数据；标签层级高于板书，避免命中抢占。
- 舞台题目样式：`src/modules/canvasStage/coursewareChrome.ts` / `src/stage.css` / `src/modules/canvasStage/drawCoursewareStageFrame.ts` - 题目正文非加粗；字号由同一 label font resolver 得出，为标签字号的 `1.5` 倍；题目正文不再显示蓝色虚线容器。
- 舞台题目真相：`src/components/DrawboardStage.tsx` - `stage-problem-area` / `stage-problem-text` 已加 `data-agent-anchor`，明确舞台题目区只读 `problemText.summary`，不读 opening `boardSlice`。
- 录制底图：`src/modules/canvasStage/drawCoursewareStageFrame.ts` / `src/components/CanvasRecordingSurface.tsx` - 录制底图同步消费同一份分区框与标签位置，并通过 `problemSummary` 继续读取同一条 `problemText.summary` 题文真相。
- C 分区标识：`src/components/BoardTextSticker.tsx` / `src/components/CStickerFrame.tsx` / `src/components/AutoHandwritingLayer.tsx` - 给每个 C 板书挂 `board-text-sticker--zone-*` 与 `data-agent-zone`，供舞台测量分片边界；不再用 zone 限制 C 位置。
- 舞台边界验证：`scripts/check-board-boundaries.mjs` - 已改成同时读取 `styles.css` 和 `stage.css`，并守门"舞台样式不得回流到全局样式表"；新增普通 C 录制必须使用 Konva content canvas，禁止 Canvas2D `fillText`、`drawRealtimeTextWithRevealClip`、`renderBoardTextStickerImage(`、`renderBoardMathStickerImage(` 回到普通 C 录制主路。
- 第二步网关：`scripts/script-agent-rows-contract.mjs` - rows 合同读取、编译，以及 Agent JSON 数学反斜杠限定修复。
- 第二步网关：`vite.config.mjs` - 本地 dev `/api/agent/script-board` 使用 rows parser。
- 第二步网关：`scripts/zeabur-server.mjs` - Node/部署 `/api/agent/script-board` 使用 rows parser。
- 第二步验证：`scripts/check-script-agent-rows-contract.mjs` - rows 对应关系、TS normalizer、未转义 LaTeX 反斜杠回归。
- 关键记录：`AGENTS.md` - SessionStart/Stop 与工作单元闭环规则。
- 关键记录：`ENGINEERING_LOG.md` - 后续工作单元自包含记录入口。
- 关键记录：`PROJECT_TREE.md` - 关键结构快照入口。
- 已测试：`npm run check:script-agent-rows`、`npm run typecheck`、直接 Node 复现未转义课堂数学命令、合法 `\n` 转义保留、未知非法转义拒绝。
- 本轮已测试：`npm run typecheck`、`npm run check:board-boundaries`、`npm run check:board-handwriting-support`、`npm run check:script-agent-rows`。
- 本轮接手复核已测试：`npm run typecheck`、`npm run check:board-boundaries`、`npm run check:board-handwriting-support`、`npm run check:continuity-docs`。
- 本轮接手复核：`node scripts/audit-local-order.mjs` -> `NEEDS ORDERING`，原因是 `graphify`、`codesight`、`ccwf`、`ccwf-mcp` 不在 PATH；不能标成 ORDERED。
- 本轮 C content Konva 录制接手：`node scripts/audit-local-order.mjs` -> `ORDERED`；`npm run typecheck` -> 通过；`npm run check:board-boundaries` -> 通过；`npm run check:continuity-docs` -> 通过。
- 本轮已测试：浏览器 DOM 验证题目字号 `21px`、标签字号 `14px`、比例 `1.5`、题目字重 `400`、题目区蓝色虚线框 `0`、普通 C 实时文本 `4`、普通 C PNG `0`、复杂公式仍走公式组件。
- 本轮已测试：浏览器拖拽验证"拖标签不拖 C、拖 C 不拖标签"，并验证 C 纵向拖动 `-92px` 不再被旧固定区拉回。
- 本轮已测试：`npm run smoke:pending-new-problem`、Playwright 空态/有图态实测（上传 rail 高度稳定为 104px）。
- 本轮已测试：本地 Playwright `standalone=drawboard-core` 交互回归；验证"拖标签时板书不跟随，拖板书仍可正常移动"，截图保存在 `.tmp-ui-smoke/zone-label-drag-2026-06-06T06-12-59-865Z.png`。
- 系统级技能源：`.tmp-system-skill-source/local-continuity-standard` - 已验证，等待批准安装到 `C:\Users\admin\.codex\skills`。
- 秩序审计脚本：`scripts/audit-local-order.mjs` - 可移植，默认只查项目连续性文件；具体本机工具路径读 `scripts/continuity-stack.config.json` 或 `CONTINUITY_STACK_CONFIG`。
- 系统安装引导：`.tmp-system-skill-source/local-continuity-standard/scripts/install-system-skill.mjs` - 默认 dry-run，`--yes` 才安装，`--replace` 才覆盖。
- 项目内桌面工具落点：`.claude/desktop-tools/` - 用户已复制原桌面鼠标专武；新增 `.claude/desktop-tools/continuity-weapon/` 作为秩序专武入口，不覆盖原工具。

- 代码噪音筛查：`代码噪音筛查-review-2026-06-07.md` - 本轮只 review 不删除；确认旧代码未完全清干净，主要残留在第三步 `BoardPreviewCard` 的 tldraw 活尾巴、`src/modules/tldrawStage/abcToTldrawShapes.ts` 混杂模块、`src/styles.css` 末尾 tldraw proof/stage 样式、`src/_deprecated` 两个旧组件与 `package.json` 的 `tldraw` 依赖。

## 已知的坑

- `boardSlice` 的 `\n` 是内容真相，渲染层不能用普通空白归一化压扁。
- 第二步 Agent JSON 里课堂数学表达的单反斜杠可能导致 `Bad escaped character in JSON`；必须在网关 rows 入口按产品数学边界修复，不能让前端或正式资产层各修各的，也不能吞未知脏内容。
- DOM / Konva / 录制禁止各写一套文本 layout；本轮已同源到 `TimelineClip(kind=board).label -> resolveBoardTextDisplayRoute`，但换行/高度估算仍需抽共享 layout helper。
- 板书专用字体命中尚未工程化保证：`BoardHandwritingStickerContent` 当前只把 `fontFamily` 写入 style，`fontLoadKey` 没有真正等待/确认 `document.fonts` 命中；默认远端字体失败时会静默回退。
- Konva 主舞台不能从 `KonvaProofPage` 直切：proof 使用 sample canvas / sample clip / sample problem，且未接真实 `CoursewareZoneBox`、录制三层、金手指 overlay、公式路线和字体命中验证。
- 标签、题目、板书这三个画布内元素的尺寸逻辑仍未完全统一到持久化比例真相；本轮已把题目字号收成标签字号 `1.5` 倍、普通 C 改成实时文本，但未来 Konva proof 与持久化 label override 仍待继续收口。
- 旧认知里"`chainKey` 决定固定四区边界 / `constrainYPercentToZone` 保证不越区"的说法已经废止；后续 agent 不得恢复这条 clamp。
- 题目区正文与 opening 读题语义不能混：即便 opening 行存在候选文案或误填 `boardSlice`，舞台题目区与录制底图也必须继续以第 1 步确认的 `problemText.summary` 为准。
- 右栏职责表属于页面壳子面板，不应再把侧栏当成无限长画布；展开内容必须在自身容器内滚动，不能横向撑爆 inspector。
- 标签拖动不得写回 `boardSlice`；如需持久化必须走独立 manual override 字段。
- 只在对话里说发现、决策、坑，没有写入对应文件，等于没有完成工程记录。

## 下一步（接力棒）

- 目标：按 `代码噪音筛查-review-2026-06-07.md` 的顺序做 tldraw 尾巴清理：先清 `src/styles.css` tldraw proof/stage 残留（本轮已确认无）；再把第三步 `BoardPreviewCard` 去 tldraw 化；之后才能清 `src/modules/tldrawStage/abcToTldrawShapes.ts` 与 `package.json` 的 `tldraw` 依赖。
- 目标：抽 DOM/Konva 共享文本 layout helper，减少普通 C 页面预览与 content 录制 canvas 的换行/高度估算漂移。
- 目标：再做真实主舞台 Konva pilot；必须消费真实 `TimelineClip` / `problemText.summary` / `CoursewareZoneBox`，通过 gate 后再考虑改 `StagePreview` 公共入口。
- 补充边界：标签拖动现在联动整组分片偏移（zoneOffsets 机制），但 C 板书仍可独立拖拽；两者不冲突。
- 前置条件：不要改第二步 rows 合同；`boardSlice` 原文和用户 `\n` 仍是内容真相；`styles.css` 不得再混入舞台内样式。
- 关键文件：`src/components/CoursewareSegmentChrome.tsx`、`src/components/DrawboardStage.tsx`、`src/components/AutoHandwritingLayer.tsx`、`src/modules/boardSticker/mathBoardText.ts`、`src/stage.css`。
- 验证方式：继续跑 `npm run check:board-boundaries`、`npm run typecheck`；涉及交互时补浏览器实测。
- 预期成本：约 2k token。

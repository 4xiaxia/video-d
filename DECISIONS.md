# Decisions

项目边界决策索引。只记录会影响后续施工顺序、真相源层级、禁止项的决策；普通工作日志仍写入 `CHANGE_TREE变更树.md` 和 `.workbuddy/memory/YYYY-MM-DD.md`。

## 2026-06-05_文档噪音边界与真相源层级

- 决策：
  - 当前优先动作是清理认知噪音、固定文档边界，不先改业务代码。
  - 最高真相源顺序固定为：`.workbuddy/memory` -> 根目录 MD -> 代码实证 -> `.claude` 旧足迹辅助。
  - `.claude/PROJECT_STATE.md` 与 `.claude/ENGINEERING_LOG.md` 只作为 SessionStart 可读的接力镜像，不能压过 `.workbuddy/memory` 与根目录真相文档。
- 当前唯一施工主线：
  - `boardSlice` 普通多行原文 -> 保留用户 `\n` -> 手写字体文本渲染 -> 按字符 reveal -> C 默认留场。
- 明确排除：
  - 本阶段不启动 Konva 主迁移。
  - 本阶段不重启 SVG/path/逐笔轨迹。
  - 本阶段不做 Agent 智能排版、标签 manual override、数学公式大改、tldraw 清理。
- 下一刀：
  - 只围绕 `src/modules/boardSticker/mathBoardText.ts` 的普通手写文本归一化压扁换行问题做最小修复和最小验证。

## 2026-06-06_脱稿工程范式固定为根目录五件套

- 决策：
  - 根目录新增 `AGENTS.md` 作为所有 agent 的开工/收工协议入口。
  - 根目录长期维护五件套：`PROJECT_STATE.md`、`ENGINEERING_LOG.md`、`DECISIONS.md`、`ARCHITECTURE.md`、`KNOWN_ISSUES.md`。
  - 结构追踪新增 `PROJECT_TREE.md`；时间线继续使用 `CHANGE_TREE变更树.md`。
  - 新增 `scripts/check-continuity-docs.mjs` 与 `npm run check:continuity-docs`，把记录纪律变成可运行验证。
- 背景：
  - 用户要求把“所有工程信息都有家，不散在对话记录里”落成标准范式。
  - 此前根目录只有 `DECISIONS.md` 和 `CHANGE_TREE变更树.md`，工程接力骨架不完整。
- 最终选择：
  - 采用“入口协议 + 五件套 + 结构树 + 变更树 + 检查脚本”的最小闭环。
- 理由：
  - 不改业务代码，不抢跑下一刀。
  - 每个工作单元都有状态、日志、决策、架构、问题、结构、验证的固定落点。
- 风险：
  - 文档增多可能形成新噪音。
- 如何规避：
  - `PROJECT_STATE.md` 只写当前真相和下一步；`ENGINEERING_LOG.md` 只按工作单元追加；`CHANGE_TREE变更树.md` 只写变更时间线；不互相复制全文。
- 验证：
  - 运行 `npm run check:continuity-docs`。

## 2026-06-06_本机级范式采用 Codex Skill 承载

- 决策：
  - 将电脑本机系统级“脱稿工作制 / 兜底纪律”承载为 Codex skill：`local-continuity-standard`。
  - skill 本体放在 `C:\Users\admin\.codex\skills\local-continuity-standard`，项目内五件套由 skill 的安装脚本投放。
- 背景：
  - 用户明确指出目标是电脑本机系统级别，而不是单个仓库内的文档。
  - 需要一个跨项目复用、可被 Codex 自动发现、可带模板和脚本的载体。
- 最终选择：
  - 选择 Codex skill，而不是只改某个项目的 `AGENTS.md`。
- 理由：
  - skill 是本机级可复用能力；能携带 `SKILL.md`、模板、安装脚本和 UI 元数据。
  - 对每个项目只投放实例文件，不把所有项目硬绑定到一个仓库。
- 风险：
  - 写入 `C:\Users\admin\.codex\skills` 属于工作区外系统目录写入，需要用户批准。
- 如何规避：
  - 先在项目临时目录构建并验证 skill；安装到系统目录时走权限批准，不绕过。
- 验证：
  - 临时技能源已通过 `quick_validate.py`。
  - 安装脚本已在临时项目验证首次创建、二次跳过。
  - 系统目录安装尚未完成，原因是审批服务 503 自动拒绝。

## 2026-06-06_规则包本体必须可移植且安装先预览

- 决策：
  - `local-continuity-standard` 只能承载通用规则、模板、检查脚本和安装引导。
  - 不允许把某个项目路径、本机用户名、`.claude` 具体目录、候选工具安装状态写死进规则包本体。
  - 具体本机工具栈通过 `scripts/continuity-stack.config.json` 或 `CONTINUITY_STACK_CONFIG` 声明。
  - 系统级安装脚本默认 dry-run；只有显式 `--yes` 才执行安装，已有目标默认拒绝覆盖，除非传 `--replace`。
- 背景：
  - 用户明确要求技能套件规则包不要捆死一个项目和本地环境，并要求做好自动安装引导。
- 最终选择：
  - 规则包本体可移植；项目实例可配置；系统安装有预览、确认、覆盖保护。
- 理由：
  - 秩序系统应先保护边界，不能把单机路径伪装成通用规则。
  - 自动安装必须帮助用户看清目标和风险，而不是偷偷写系统目录。
- 风险：
  - 配置化后默认审计较轻，只检查项目连续性文件。
- 如何规避：
  - 对需要强门禁的机器，在项目或本机配置中声明 requiredPaths / optionalCommands。
- 验证：
  - `rg` 扫规则包硬编码。
  - `node scripts/audit-local-order.mjs`。
  - `install-system-skill.mjs --dry-run`。
  - 临时目录安装 smoke。

## 2026-06-06_秩序专武作为桌面工具入口而非项目绑定

- 决策：
  - 将秩序专武放在 `.claude/desktop-tools/continuity-weapon/`，与现有桌面鼠标专武同层管理。
  - 专武只做入口和引导：doctor、audit、project install、system skill install。
  - 专武不内嵌项目路径、本机用户名、Claude/Codex 固定目录；所有具体路径由参数传入。
- 背景：
  - 用户已把桌面专武工具复制到 `D:\video-dev-cleanroom\.claude\desktop-tools`，并要求给配套规则包“送个专武”。
- 最终选择：
  - 新增 `continuity-weapon` 子目录，不覆盖现有 `eye-*`、`hand-click`、`T.Claw` 工具。
- 理由：
  - 桌面工具入口应便携、可审计、可搬迁，不能反向污染规则包。
- 风险：
  - `.venv`、截图、`__pycache__` 等运行产物会制造 git 噪音。
- 如何规避：
  - `.gitignore` 忽略 `.claude/desktop-tools/.venv/`、`.claude/desktop-tools/captures/`、`**/__pycache__/`、`*.pyc`。
- 验证：
  - `continuity-doctor.ps1` 从新位置运行通过。
  - `rg` 扫专武硬编码无命中。

## 2026-06-06_第二步 rows JSON 入口保护课堂数学表达

- 决策：
  - 第二步“生成文稿/板书”只接受 rows 候选合同：`voiceText` 对应文稿，`boardSlice` 对应 C 素材候选。
  - 模型返回 rows JSON 时，如果字符串内部出现课堂数学表达所需的未转义 LaTeX/数学反斜杠，只在网关 rows JSON 入口修复。
  - 修复范围对齐当前 C 板书数学能力，如 `\left`、`\right`、`\frac`、`\div`、`\times`、`\angle`、`\pi`、`\sin`、`\sqrt` 等；合法 JSON 转义如 `\n` 必须保留原语义。
  - 未知非法转义必须继续失败，不能被偷偷修进老师讲稿或课堂板书候选。
- 背景：
  - 用户在第二步对话生成时遇到 `Bad escaped character in JSON at position 263 (line 1 column 264)`。
  - 排查确认问题发生在模型内容进入 rows 之前的服务端 `JSON.parse(jsonText)`，不是 rows 到正式文稿/板书的对应关系错位。
- 最终选择：
  - 在 `scripts/script-agent-rows-contract.mjs` 新增 `parseJsonWithMathStringEscapes()`，供本地 Vite 网关和 Node/Zeabur 网关共用。
- 理由：
  - dev 与 production 必须同源处理，不能只修本地或只修部署。
  - 解析容错属于 Agent 输出边界，不能把修复分散到前端展示、正式资产或 C 渲染层。
- 风险：
  - 过宽的反斜杠修复会误伤 `\n`，破坏 `boardSlice` 多行真相，或让未知脏内容混进老师讲稿/板书。
- 如何规避：
  - 回归测试同时覆盖课堂数学反斜杠、合法 `\n` JSON 转义、未知非法转义拒绝。
- 验证：
  - `npm run check:script-agent-rows`。
  - `npm run typecheck`。
  - 直接 Node 复现未转义 `\left/\frac/\div/\angle/\pi/\sin/\sqrt` 并确认 rows 编译到 `B1/C1`。

## 2026-06-06_舞台内样式必须独立成册

- 决策：
  - 画布内元素样式独立到 `src/stage.css`。
  - `src/styles.css` 只保留页面壳子、时间轴、面板与非舞台区域。
  - `scripts/check-board-boundaries.mjs` 负责守门，禁止舞台样式 token 回流到 `src/styles.css`。
- 背景：
  - 用户明确要求“画布是画布，其他是其他”。
  - 当前标签、题目、板书、金手指、舞台工具栏混在全局样式表里，不利于继续收“和画布比例同源”的尺寸真相。
- 最终选择：
  - 先做样式边界分家，再继续处理标签 / 题目 / 板书的比例真相。
- 理由：
  - 先把战场切干净，避免边处理尺寸来源边和页面壳子样式互相污染。
  - 让“舞台内规则”先有单独真相层，后续继续收口时更可控。
- 风险：
  - 只拆样式边界，不代表尺寸真相已经统一。
- 如何规避：
  - 下一刀继续梳理标签、题目、板书三条尺寸链的唯一来源。
  - 每次边界调整都继续跑 `npm run check:board-boundaries` 与 `npm run typecheck`。
- 验证：
  - `npm run check:board-boundaries`
  - `npm run typecheck`

## 2026-06-06_题图入口改为紧凑上传 rail

- 决策：
  - 第一步题图入口不再使用大面积拖拽面板，而改成紧凑的“左缩略 / 右按钮”上传 rail。
  - 题图入口从 `Upload.Dragger` 收回到普通 `Upload`，减少默认大框高度和无谓占位。
  - 空态与有图态共用同一稳定高度；题图缩略使用 `contain`，不为卡片尺寸裁图。
  - 组件结构保持扁平，避免为样式继续叠 `div` 套层。
- 背景：
  - 用户指出原上传区溢出、占位过大，并明确希望改成“左边图缩略，右边按钮上传”的工具位。
  - 当前阶段目标是做减法，让题图入口更像操作入口，而不是大海报位。
- 最终选择：
  - 更新 `src/components/ProblemUploadPreview.tsx` 与 `src/styles.css`，保留原上传链路，只改入口形态和样式。
- 理由：
  - 不动识别/素材流逻辑，风险最小。
  - 入口高度稳定后，左侧工作区更利于继续承接题文确认和后续流程。
  - 普通 `Upload` 比 `Dragger` 更贴合当前“按钮导入”为主的交互。
- 风险：
  - 过度压缩后可能牺牲拖拽可发现性，或让题图缩略被裁。
- 如何规避：
  - 保留“也可直接拖入 / 点击更换题图”文案。
  - 缩略图使用 `object-fit: contain`。
  - 空态/有图态都用 Playwright 实测尺寸和页面截图复核。
- 验证：
  - `npm run typecheck`
  - `npm run check:board-boundaries`
  - `npm run smoke:pending-new-problem`
  - Playwright 实测空态 / 有图态 rail 高度稳定为 `104px`

## 2026-06-06_标签分片容器先做内容 bbox 自适应，拖拽句柄只给标签 pill

- 决策：
  - 四区标签对应的分片容器先按当前题目正文 + 当前可见 C 板书的真实 bbox 自动生成，统一加 `5px` 视觉留白。
  - 分片容器外框只负责显示边界，`pointer-events: none`，不参与交互命中。
  - 标签拖拽句柄只允许标签 pill 本身承接；不能把整个容器做成可拖区域，避免与板书文字拖拽撞车。
  - 当前标签拖动只保留在舞台运行态的本地预览，不写回 `boardSlice`、timeline clip 或其他业务真相字段。
  - 录制底图同步消费同一份分区框/标签位置结果，避免 DOM 与录制各画一套。
- 背景：
  - 用户明确指出标签其实是分片容器的操作句柄，容器大小应由实际板书内容面积决定，并要求“按住标签才能移动，不是整个容器”。
  - 旧实现里四区标签是硬编码定位，容器不存在；一旦直接让大容器响应拖拽，会和 `BoardTextSticker` 的现有拖拽链路撞车。
- 最终选择：
  - 新增 `src/modules/canvasStage/coursewareZoneLayout.ts`，从 `stage` 内 DOM 实测的题目正文与 `board-text-sticker--zone-*` bbox 生成四区分片框与标签位置。
  - `DrawboardStage` 渲染动态分片框与标签 pill，标签层级高于板书；`CanvasRecordingSurface` / `drawCoursewareStageFrame` 同步消费同一份布局结果。
- 理由：
  - 这是“先 bbox 自适应、后考虑 manual override”的最小实现，符合此前变更树约束。
  - 先守住交互命中边界，比急着把标签拖拽持久化更重要。
  - 录制底图同步复用同源结果，能继续压住第二套尺寸真相的风险。
- 风险：
  - 当前 bbox 依赖运行态 DOM 实测，Konva proof 与真正持久化的 override 还没有完全对齐。
  - 若标签层级落在板书下方，会导致“拖标签其实拖走板书”的假象。
- 如何规避：
  - 标签 pill 提升到高于板书的层级；容器外框不接管指针。
  - 继续保持“标签拖动不得写回内容真相”的纪律；真正持久化另开独立字段。
  - 后续再把 `KonvaRecordingSurface` / proof 页面接入同一套分区布局口径。
- 验证：
  - `npm run typecheck`
  - `npm run check:board-boundaries`
  - 本地 Playwright `standalone=drawboard-core` 交互回归：
    - solution 标签拖动 `x:+51, y:+18`
    - 拖标签期间板书位移 `x:0, y:0`
    - 板书自身拖动位移 `x:+40, y:+13`
    - 截图：`.tmp-ui-smoke/zone-label-drag-2026-06-06T06-12-59-865Z.png`

## 2026-06-06_右栏职责表只允许在侧栏容器内展开和滚动

- 决策：
  - `A/B/C 控制层职责表` 继续保留在右侧 inspector 顶部，但展开后只能在自身容器里纵向滚动。
  - 职责表卡片必须锁在侧栏单列宽度内，长文案、长字段名和 tag 都要允许断行，不能再横向撑爆 inspector。
  - 这类职责表属于页面壳子信息面板，规则只放在 `src/styles.css`，不进入 `src/stage.css`。
- 背景：
  - 用户在页面上直接指出右栏职责表“容器没做好”，展开后视觉上像把侧栏当成无限高内容区。
  - 实测发现旧样式同时有两个问题：职责表根节点宽度被内容撑到约 `555px`，且展开内容把整张卡片拉高到约 `3730px`，导致右栏横向溢出、纵向失控。
- 最终选择：
  - 不改 `boardControlResponsibilities` 文案真相，只在 `src/styles.css` 收紧 `.inspector-stack` 和 `.board-control-responsibilities-*` 的容器纪律。
  - 把滚动边界挂到 Ant Collapse 当前真实的 `.ant-collapse-body`，而不是猜测性的内部层。
- 理由：
  - 这是最小修复，只改页面壳子容器，不触碰 A/B/C 边界文案和业务逻辑。
  - 把宽度、断行和内滚三件事一起守住，才能避免“看似没溢出，其实只是把问题藏到别处”。
- 风险：
  - 如果未来 Ant Collapse DOM 结构升级，滚动边界的命中层可能再次变化。
- 如何规避：
  - 继续用浏览器实测 DOM 尺寸，而不是只凭类名印象下样式。
  - 职责表后续若继续加字段，优先收紧信息密度，不要再让右栏承载海报式长文布局。
- 验证：
  - `npm run typecheck`
  - `npm run check:board-boundaries`
  - 本地 Playwright 侧栏容器实测：
    - 修复后 `workspace-sider--inspector` `scrollWidth == clientWidth == 294`
    - 职责表 `.ant-collapse-body` 高度约 `600px`，`scrollHeight` 约 `4829px`，已进入自身内滚
    - 下方 `画布变量 / 录屏舞台` 与 `C 默认字体 / 当前工程` 面板重新回到首屏可达
    - 截图：`.tmp-ui-smoke/inspector-responsibilities-2026-06-06T06-37-32-344Z.png`

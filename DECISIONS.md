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

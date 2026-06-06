# Engineering Log

原则：每个工作单元完全自包含，不依赖对话历史。

## 工作单元 #001

### 基本信息

- 时间：2026-06-06 01:29:58 +08:00 - 2026-06-06 施工中
- 目标：把“所有工程信息都有家”的兜底纪律落成根目录标准范式。
- 状态：完成

### 背景（为什么要做这个）

- 上一个单元的结论：根目录已有 `DECISIONS.md` 与 `CHANGE_TREE变更树.md`，但五件套不完整，SessionStart/Stop 纪律没有统一入口。
- 这个单元的必要性：用户明确要求把工具箱纪律落成标准范式；没有范式，后续 agent 仍会把发现散在对话里。
- 依赖的已确认设计：真相源顺序以 `.workbuddy/memory` 和根目录 MD 为先，`.claude` 只作辅助镜像。

### 思路（怎么想的）

- 方案选择：新增根目录 `AGENTS.md` 作为执行入口，补齐五件套，并新增 `PROJECT_TREE.md` 与连续性检查脚本。
- 为什么选这个：最少文件即可形成开工、记录、验证、接力的闭环；不改业务代码，不制造第二套业务真相。
- 关键假设：当前工作是记录范式落地，不应抢跑下一刀业务修复。

### 执行步骤（具体做了什么）

1. 读取根目录、`DECISIONS.md`、`CHANGE_TREE变更树.md`、`.workbuddy/memory` 当前记忆 -> 确认已有真相源与缺口。
2. 新增 `AGENTS.md` -> 固定 SessionStart、工作中、完成工作单元、Stop Hook 规则。
3. 新增 `PROJECT_STATE.md`、`ENGINEERING_LOG.md`、`ARCHITECTURE.md`、`KNOWN_ISSUES.md`、`PROJECT_TREE.md` -> 形成长期维护骨架。
4. 新增 `scripts/check-continuity-docs.mjs` 并在 `package.json` 注册 `check:continuity-docs` -> 让文档纪律可运行验证。
5. 追加 `DECISIONS.md` 与 `CHANGE_TREE变更树.md` -> 记录本次范式决策与工作树。

### 代码变更

- 文件：`AGENTS.md`
  - 改了什么：新增仓库级工作范式入口。
  - 为什么改：让任何 agent 不依赖对话历史也能按同一套规则开工和收工。
  - 验证方式：`npm run check:continuity-docs` 检查关键文档存在。
- 文件：`scripts/check-continuity-docs.mjs`
  - 改了什么：新增根目录连续性文档检查。
  - 为什么改：把“有没有落笔记录”变成可执行验证。
  - 验证方式：运行该脚本。
- 文件：`package.json`
  - 改了什么：新增 `check:continuity-docs` 脚本。
  - 为什么改：统一入口，后续可纳入更大的检查链。
  - 验证方式：运行 `npm run check:continuity-docs`。

### 发现和确认

- 新确认的设计：五件套只管工程连续性；业务专题真相仍保留在既有根目录专题文档中。
- 新发现的坑：若只写 `.claude` 镜像或对话记录，后续接手仍会丢主线。
- 需要调整的边界：`CHANGE_TREE变更树.md` 继续做时间线，不被 `ENGINEERING_LOG.md` 替代；两者并行维护。

### 验证结果

- 测试：`npm run check:continuity-docs` -> 通过。
- 性能：不涉及。
- 兼容性：不改业务代码，不影响运行时。

### 接力棒（下一个单元从这里开始）

- 当前状态：根目录范式已落地，下一步回到 C 普通多行文本换行保真。
- 下一步目标：修 `src/modules/boardSticker/mathBoardText.ts` 的普通手写文本归一化，保留用户换行。
- 关键文件：`src/modules/boardSticker/mathBoardText.ts`，必要时增加最小检查脚本。
- 已知的坑：不要顺手做 Konva、SVG/path、Agent 智能排版、标签 manual override、数学公式大改。
- 预期成本：约 4k-8k token。

### 备注

- 本单元是工程范式与记录闭环，不改业务代码。

## 工作单元 #002

### 基本信息

- 时间：2026-06-06 01:30 +08:00 - 2026-06-06 进行中
- 目标：把范式从“项目内五件套”提升为电脑本机 Codex 可复用技能。
- 状态：阻塞于系统目录写入审批

### 背景（为什么要做这个）

- 上一个单元的结论：项目根目录范式已落地并通过 `npm run check:continuity-docs`。
- 这个单元的必要性：用户明确修正目标为“电脑本机系统级别”，不是单仓库文档。
- 依赖的已确认设计：本机层做范式本体；项目内五件套只是每个仓库的实例。

### 思路（怎么想的）

- 方案选择：创建 Codex skill `local-continuity-standard`，内含技能说明、项目模板、安装脚本。
- 为什么选这个：`C:\Users\admin\.codex\skills` 是本机 Codex 自动发现技能的位置，适合跨项目复用。
- 关键假设：系统级安装必须经过用户批准，不能绕过沙箱写入用户目录。

### 执行步骤（具体做了什么）

1. 读取 `skill-creator` 指南 -> 确认技能结构为 `SKILL.md`、`agents/openai.yaml`、可选 `scripts/assets`。
2. 新增临时技能源：`.tmp-system-skill-source/local-continuity-standard` -> 包含技能本体、模板、安装脚本。
3. 运行技能校验 -> `Skill is valid!`。
4. 在 `.tmp-system-skill-source` 临时项目运行安装脚本 -> 首次创建模板文件，二次运行只跳过既有文件，确认不覆盖。
5. 运行临时项目检查脚本 -> `Continuity docs check passed.`。
6. 尝试请求批准复制到 `C:\Users\admin\.codex\skills\local-continuity-standard` -> 第一次审批超时，第二次审批服务 503 自动拒绝。

### 代码变更

- 文件：`.tmp-system-skill-source/local-continuity-standard/SKILL.md`
  - 改了什么：新增本机连续性标准技能说明。
  - 为什么改：让范式成为所有项目可触发的 Codex 能力。
  - 验证方式：`quick_validate.py`。
- 文件：`.tmp-system-skill-source/local-continuity-standard/scripts/install-continuity-standard.mjs`
  - 改了什么：新增项目模板安装器，只创建缺失文件。
  - 为什么改：让系统级范式能安全投放到任意项目。
  - 验证方式：在临时目录运行两次，确认首次创建、二次跳过。

### 发现和确认

- 新确认的设计：系统级范式应落在 Codex skill；项目内五件套是被 skill 安装/维护的实例。
- 新发现的坑：工作区外写入 `C:\Users\admin\.codex\skills` 需要审批；审批服务 503 时不能绕过。
- 需要调整的边界：在用户明确批准前，不执行系统目录写入。

### 验证结果

- 测试：`python C:\Users\admin\.codex\skills\.system\skill-creator\scripts\quick_validate.py D:\video-dev-cleanroom\.tmp-system-skill-source\local-continuity-standard` -> 通过。
- 测试：`node D:\video-dev-cleanroom\.tmp-system-skill-source\local-continuity-standard\scripts\install-continuity-standard.mjs` -> 通过，二次运行不覆盖。
- 测试：`node D:\video-dev-cleanroom\.tmp-system-skill-source\scripts\check-continuity-docs.mjs` -> 通过。
- 兼容性：未完成系统目录安装，不影响现有 Codex 技能。

### 接力棒（下一个单元从这里开始）

- 当前状态：系统级技能包已在项目临时区准备好并验证；尚未安装到 `C:\Users\admin\.codex\skills`。
- 下一步目标：用户明确批准后，把 `.tmp-system-skill-source/local-continuity-standard` 复制到 `C:\Users\admin\.codex\skills\local-continuity-standard`。
- 关键文件：`.tmp-system-skill-source/local-continuity-standard/**`。
- 已知的坑：不能用变通方式绕过系统目录写入审批。
- 预期成本：很低，约 1k-2k token。

### 备注

- 需要用户明确批准系统目录写入后才能继续安装。

## 工作单元 #003

### 基本信息

- 时间：2026-06-06 继续施工
- 目标：搜索 `.claude` 与相关技能目录，确认有没有可复用的系统级配套。
- 状态：完成

### 背景（为什么要做这个）

- 上一个单元的结论：本机级连续性范式应做成 Codex skill，但系统目录安装待批准。
- 这个单元的必要性：用户要求先搜 `.claude` 文件夹，看是否已有 skills 配套，避免重复造轮子。
- 依赖的已确认设计：优先复用现有技能、命令、MCP、缓存和图谱工具，运筹而不是新造。

### 思路（怎么想的）

- 方案选择：先扫项目 `.claude`、用户级 `C:\Users\admin\.claude`、历史技能目录、WorkBuddy 技能目录。
- 为什么选这个：这些位置最可能保存 Claude 原有的 continuity / compression / graphify / hook 配套。
- 关键假设：Claude 侧技能可作为本机级范式的上游素材，但不能无验证地当成 Codex 技能直接使用。

### 执行步骤（具体做了什么）

1. 扫描项目 `.claude` -> 发现项目旧镜像：`PROJECT_STATE.md`、`ENGINEERING_LOG.md`、`PROJECT_COGNITION.md` 等。
2. 扫描 `C:\Users\admin\.claude\skills` -> 发现 `xiaxia-continuity`、`xiaxia-context-compression`、`xiaxia-anchor-marking`、`graphify`、`zeta-remembering-anchors`。
3. 扫描 `C:\Users\admin\.claude\commands` -> 发现 `imptokens.md` 命令入口。
4. 扫描 `C:\Users\admin\.claude\cache\ib-mcp-cache-server` -> 确认这是 memory-cache 原包位置，含 `build/`、`src/`、`config.json`、`package.json`、`README.md`。
5. 扫描 `C:\Users\admin\.claude\plugins` -> 发现 `imptokens` 和 `imptokens-pruner`。
6. 扫描 `C:\Users\admin\.workbuddy\skills` 与 `历史/skills 要用啊` -> 确认同类技能在多处有镜像。

### 代码变更

- 文件：无业务代码变更。
- 文件：`ENGINEERING_LOG.md` / `PROJECT_STATE.md` / `KNOWN_ISSUES.md` / `CHANGE_TREE变更树.md`
  - 改了什么：记录本次搜索发现和安全边界。
  - 为什么改：避免搜索结果只散在对话里。
  - 验证方式：`npm run check:continuity-docs`。

### 发现和确认

- 新确认的设计：本机级范式不需要从零造；应复用 Claude 侧四件套：continuity、compression、anchor marking、graphify，再接 imptokens 与 memory-cache。
- 新发现的坑：`.claude/settings*.json` 含敏感路由/API 环境值，后续审计只能描述用途，不能复制真实密钥。
- 需要调整的边界：Codex skill `local-continuity-standard` 应作为“编排层”，引用现有 Claude 技能思想，不把所有旧技能全文塞进去。

### 验证结果

- 测试：`rg --files` 扫描各技能目录 -> 完成。
- 测试：读取相关 `SKILL.md`、`imptokens.md`、`ib-mcp-cache-server/README.md`、`CLAUDE.md` -> 完成。
- 兼容性：只读搜索为主，不改系统目录。

### 接力棒（下一个单元从这里开始）

- 当前状态：已确认可复用配套路径和职责。
- 下一步目标：把 `local-continuity-standard` 改成编排层：SessionStart 接 continuity + memory-cache，输入过大接 context-compression/imptokens，设计施工接 anchor-marking，架构理解接 graphify。
- 关键文件：`.tmp-system-skill-source/local-continuity-standard/SKILL.md`。
- 已知的坑：不要复制 `.claude/settings*.json` 里的敏感值；不要把 Claude-only 命令当成 Codex 已可直接运行。
- 预期成本：约 2k-4k token。

### 备注

- 本次没有完成系统目录安装，仅完成配套搜索与方案归纳。

## 工作单元 #004

### 基本信息

- 时间：2026-06-06
- 目标：评估外部 token / workflow / local LLM 工具是否适合并入本机级连续性范式。
- 状态：完成

### 背景（为什么要做这个）

- 上一个单元的结论：本机已有 Claude 侧 continuity、compression、anchor-marking、graphify、imptokens、memory-cache 配套。
- 这个单元的必要性：用户给出 `cc-wf-studio`、`distill`、`sqz`、`cc_token_saver_mcp`、`houtini-lm`，要求评估取舍。
- 依赖的已确认设计：优先复用成熟工具；本机范式应做编排层，不重复造缓存、压缩、图谱、local LLM 路由。

### 思路（怎么想的）

- 方案选择：按“对本机级连续性范式的增益”评估：token 节省、缓存、上下文压缩、工作流编排、local LLM 分流、安装风险。
- 为什么选这个：这些工具不在同一层，不能简单按热度比较；要按系统位置判断。
- 关键假设：现阶段只评估，不安装，不改系统级配置。

### 执行步骤（具体做了什么）

1. 联网查看公开 README / 项目页 -> 获取定位、安装方式、成熟度信号。
2. 本机检查 `sqz`、`distill`、`houtini-lm` 命令 -> 当前未发现已安装。
3. 查看全局 npm 包 -> 当前有 Claude Code、Codex、Gemini CLI、lean-ctx 等，没有上述候选工具。
4. 对比现有本机配套 -> 判断哪些是替代、补充或暂缓。

### 代码变更

- 文件：`ENGINEERING_LOG.md`
  - 改了什么：新增本次外部工具评估记录。
  - 为什么改：避免评估只散在对话里。
  - 验证方式：`npm run check:continuity-docs`。
- 文件：`CHANGE_TREE变更树.md`
  - 改了什么：新增工具评估变更树。
  - 为什么改：记录推荐顺序和下一枝。
  - 验证方式：`npm run check:continuity-docs`。

### 发现和确认

- 新确认的设计：`sqz` 最适合做命令/文件输出去重压缩层；`houtini-lm` 适合做 bounded tasks 的 local/cloud LLM 分流层；`distill` 适合做命令输出摘要器；`cc-wf-studio` 是可视化工作流层；`cc_token_saver_mcp` 与 `houtini-lm` 高度重叠但成熟度较低。
- 新发现的坑：`ourzeta/cc-wf-studio` 精确 packages 链接未能稳定读取；公开资料主要指向 `breaking-brake/cc-wf-studio` / VS Code Marketplace。
- 需要调整的边界：本机级范式下一步优先把 `sqz` 和 `houtini-lm` 作为可选适配层写入 skill，而不是立即安装。

### 验证结果

- 测试：`Get-Command sqz/distill/houtini-lm` -> 均未发现本机命令。
- 测试：`npm list -g --depth=0` -> 未发现上述候选 npm 包。
- 兼容性：只读评估，不影响现有系统配置。

### 接力棒（下一个单元从这里开始）

- 当前状态：外部工具已有推荐顺序。
- 下一步目标：若继续做系统级范式，先把 `sqz` / `houtini-lm` 作为“可选外接层”写进 `.tmp-system-skill-source/local-continuity-standard/SKILL.md`，但不自动安装。
- 关键文件：`.tmp-system-skill-source/local-continuity-standard/SKILL.md`。
- 已知的坑：不要同时启用多个会改 Claude hook/MCP 的 token saver；先试点、再全局。
- 预期成本：约 2k token。

### 备注

- 本单元未安装第三方包。

## 工作单元 #005

### 基本信息

- 时间：2026-06-06
- 目标：把本机秩序规则包改成可移植规则包，并补自动安装引导。
- 状态：完成

### 背景（为什么要做这个）

- 上一个单元的结论：外部工具只应作为可选适配层，不应抢占规则包本体。
- 这个单元的必要性：用户明确要求技能套件规则包不要捆死一个项目和本地环境，并要求做好自动安装引导。
- 依赖的已确认设计：规则包是范式，项目和本机只是实例；秩序优先于业务施工。

### 思路（怎么想的）

- 方案选择：规则包本体只保留通用协议、模板、审计脚本和安装引导；具体工具路径移入配置。
- 为什么选这个：避免把单机路径伪装成系统规则，也避免自动安装暗中写系统目录。
- 关键假设：默认审计应轻量可移植；强门禁由配置增强。

### 执行步骤（具体做了什么）

1. 扫描规则包硬编码 -> 找到固定用户路径、固定 `.claude` 路径、候选工具名写死在脚本中。
2. 改写 `SKILL.md` -> 增加 Portable Stack Contract，删除本机路径绑定。
3. 改造 `audit-local-order.mjs` -> 从配置读取 requiredPaths / optionalCommands，默认只查项目连续性文件。
4. 新增 `continuity-stack.config.json` 模板和当前项目配置 -> 具体本机工具由实例配置声明。
5. 新增 `install-system-skill.mjs` -> 支持 dry-run、`--yes`、`--target`、`--replace`。
6. 更新项目 `AGENTS.md`、`PROJECT_TREE.md`、`package.json` -> 接入审计入口。

### 代码变更

- 文件：`.tmp-system-skill-source/local-continuity-standard/SKILL.md`
  - 改了什么：规则包改为可移植协议，安装命令改为占位路径，不写死本机。
  - 为什么改：系统范式不能绑定单个项目或单台电脑。
  - 验证方式：`rg` 扫硬编码、`quick_validate.py`。
- 文件：`.tmp-system-skill-source/local-continuity-standard/scripts/audit-local-order.mjs`
  - 改了什么：审计配置化，支持环境变量路径展开，跨平台命令探测。
  - 为什么改：同一规则包可用于不同机器。
  - 验证方式：`node scripts/audit-local-order.mjs`。
- 文件：`.tmp-system-skill-source/local-continuity-standard/scripts/install-system-skill.mjs`
  - 改了什么：新增系统技能安装引导，默认 dry-run。
  - 为什么改：自动安装必须先让用户看见目标和风险。
  - 验证方式：`node ... install-system-skill.mjs --dry-run`。
- 文件：`scripts/continuity-stack.config.json`
  - 改了什么：新增项目实例配置。
  - 为什么改：具体本机工具栈不进规则包本体。
  - 验证方式：`node scripts/audit-local-order.mjs`。

### 发现和确认

- 新确认的设计：规则包本体是通用纪律；工具栈是配置；项目五件套是实例。
- 新发现的坑：把“本机已有工具”直接写进规则包，会把秩序系统变成环境补丁。
- 需要调整的边界：后续任何候选工具安装都必须单独审批和 smoke，不进入默认安装。

### 验证结果

- 测试：`rg -n "C:\\Users\\admin|D:\\video-dev-cleanroom|video-dev-cleanroom|teaching-cut-cleanroom|\\.claude\\skills|ib-mcp-cache-server|houtini-lm|sqz|distill" .tmp-system-skill-source/local-continuity-standard` -> 无命中。
- 测试：`node scripts/audit-local-order.mjs` -> `Audit result: ORDERED`。
- 测试：`quick_validate.py .tmp-system-skill-source/local-continuity-standard` -> `Skill is valid!`。
- 测试：`node .tmp-system-skill-source/local-continuity-standard/scripts/install-system-skill.mjs --dry-run` -> 成功预览安装目标。
- 兼容性：未安装系统技能，未安装第三方包。

### 接力棒（下一个单元从这里开始）

- 当前状态：可移植规则包与自动安装引导已完成初验。
- 下一步目标：用全新临时目录 smoke 项目安装器，然后跑 `npm run check:continuity-docs`。
- 关键文件：`.tmp-system-skill-source/local-continuity-standard/**`、`scripts/audit-local-order.mjs`。
- 已知的坑：系统目录安装仍需用户明确批准；不要绕过审批。
- 预期成本：约 1k token。

### 备注

- 业务修复仍暂停，直到本机规则与工具秩序完成。

## 工作单元 #006

### 基本信息

- 时间：2026-06-06
- 目标：把秩序专武落地到项目内 `.claude/desktop-tools`。
- 状态：完成

### 背景（为什么要做这个）

- 上一个单元的结论：规则包已改为可移植，自动安装引导已完成初验。
- 这个单元的必要性：用户已把桌面工具复制到 `D:\video-dev-cleanroom\.claude\desktop-tools`，要求专武配套放在这里。
- 依赖的已确认设计：专武是入口，不是规则包本体；规则包和专武都不能捆死项目/本机环境。

### 思路（怎么想的）

- 方案选择：把 `.tmp-desktop-tools/continuity-weapon` 复制为 `.claude/desktop-tools/continuity-weapon` 子目录。
- 为什么选这个：不覆盖原有桌面鼠标专武，同时让秩序专武与桌面工具同层可发现。
- 关键假设：`.venv`、截图、Python 缓存是运行产物，应忽略，不进入工程真相。

### 执行步骤（具体做了什么）

1. 核实 `.claude/desktop-tools` 已存在 -> 发现原桌面鼠标专武和 T.Claw 工具。
2. 复制 `continuity-weapon` 到 `.claude/desktop-tools/continuity-weapon` -> 新增秩序专武入口。
3. 从新位置运行 `continuity-doctor.ps1` -> 调用项目审计，结果 `ORDERED`。
4. 扫描专武目录硬编码 -> 无项目/本机路径命中。
5. 更新 `.gitignore` -> 忽略 `.venv`、`captures`、`__pycache__`、`*.pyc`。
6. 更新连续性记录 -> 本条日志、状态、决策、问题、变更树、结构树。

### 代码变更

- 文件：`.claude/desktop-tools/continuity-weapon/**`
  - 改了什么：新增秩序专武 PowerShell 入口和说明书。
  - 为什么改：给规则包配一个可从桌面工具目录调用的便携入口。
  - 验证方式：运行 `continuity-doctor.ps1`。
- 文件：`.gitignore`
  - 改了什么：忽略桌面工具运行产物。
  - 为什么改：防止工具包的虚拟环境、截图和缓存污染工程状态。
  - 验证方式：检查 git status 噪音边界。

### 发现和确认

- 新确认的设计：`.claude/desktop-tools/continuity-weapon` 是项目内专武落点；系统级安装仍由规则包 installer dry-run/--yes 控制。
- 新发现的坑：桌面工具包自带 `.venv`、截图、Python 缓存，必须和工具源码/入口分开看。
- 需要调整的边界：项目内 `.claude/desktop-tools` 可以保留工具入口，但运行产物不进入接力真相。

### 验证结果

- 测试：`continuity-doctor.ps1` 从 `.claude/desktop-tools/continuity-weapon` 运行 -> `Audit result: ORDERED`。
- 测试：`rg` 扫 `.claude/desktop-tools/continuity-weapon` 项目/本机硬编码 -> 无命中。
- 兼容性：未覆盖原有桌面鼠标专武。

### 接力棒（下一个单元从这里开始）

- 当前状态：秩序专武已在项目桌面工具目录可用。
- 下一步目标：跑 `npm run check:continuity-docs`，确认 git 噪音边界；随后再决定是否安装系统级 Codex skill。
- 关键文件：`.claude/desktop-tools/continuity-weapon/**`、`.gitignore`、`.tmp-system-skill-source/local-continuity-standard/**`。
- 已知的坑：不要把 `.claude/desktop-tools/.venv`、`captures`、`__pycache__` 当成工程记录。
- 预期成本：约 1k token。

### 备注

- 业务修复仍暂停。

## 工作单元 #007

### 基本信息

- 时间：2026-06-06
- 目标：跑通秩序门禁并确认当前 git 噪音边界。
- 状态：完成

### 背景（为什么要做这个）

- 上一个单元的接力棒要求先跑 `npm run check:continuity-docs`，确认连续性记录完整。
- 当前阶段仍是本机级秩序规则包优先，业务修复暂停。

### 执行步骤（具体做了什么）

1. SessionStart 读取 `PROJECT_STATE.md`、`DECISIONS.md`、`ENGINEERING_LOG.md` 最新接力棒、`PROJECT_TREE.md`。
2. 跑 `npm run check:continuity-docs`，确认五件套与结构树门禁通过。
3. 跑 `node scripts/audit-local-order.mjs`，确认项目连续性文件齐全。
4. 查看 `git status --short`，确认当前噪音主要来自既有连续性文件、桌面工具目录和历史 graphify 条目。

### 代码变更

- 文件：`PROJECT_STATE.md`
  - 改了什么：更新当前状态、验证结果和下一步接力棒。
  - 为什么改：跑过的门禁必须落到状态文件，避免下轮重复扫描。
- 文件：`PROJECT_TREE.md`
  - 改了什么：更新时间戳。
  - 为什么改：确认关键工程树仍是当前接力入口。
- 文件：`ENGINEERING_LOG.md`
  - 改了什么：追加本工作单元记录。
  - 为什么改：让验证结果可追溯。
- 文件：`CHANGE_TREE变更树.md`
  - 改了什么：追加门禁验证时间线。
  - 为什么改：变更树必须记录本轮完成点。

### 发现和确认

- 新确认的事实：`npm run check:continuity-docs` 已通过。
- 新确认的事实：`node scripts/audit-local-order.mjs` 输出 `Audit result: ORDERED`。
- 新决策：无。系统级 Codex skill 安装仍等待显式确认，不在本轮擅自执行。

### 验证结果

- 测试：`npm run check:continuity-docs` -> `Continuity docs check passed.`
- 测试：`node scripts/audit-local-order.mjs` -> `Audit result: ORDERED`
- 兼容性：未改业务代码，未启动 dev server，未安装系统 skill。

### 接力棒（下一个单元从这里开始）

- 当前状态：项目内连续性门禁已通过。
- 下一步目标：用户确认后再执行系统级 Codex skill 安装；若不装，则可以恢复业务主线的 `mathBoardText.ts` 换行修复。
- 关键文件：`.tmp-system-skill-source/local-continuity-standard/**`、`.claude/desktop-tools/continuity-weapon/**`、`scripts/audit-local-order.mjs`、`src/modules/boardSticker/mathBoardText.ts`。
- 已知的坑：系统 skill 安装必须先 dry-run，再显式执行；不要把运行产物当工程记录。
- 预期成本：约 1k token。

### 备注

- 业务修复仍暂停。

## 工作单元 #008

### 基本信息

- 时间：2026-06-06
- 目标：核对第二步“生成文稿/板书内容”的对应关系，并修复 Agent JSON 反斜杠解析错误。
- 状态：完成

### 背景（为什么要做这个）

- 用户反馈第二步对话出现：`Bad escaped character in JSON at position 263 (line 1 column 264)`。
- 用户要求马上回头清楚检查对应关系，不能只看表面报错。
- 当前第二步主合同应是 rows 候选层，不应混成正式 A/B/C 时间轴或 C 渲染层问题。

### 对应关系（怎么对上的）

1. 界面第二步入口：`ProblemWorkspace` / `AgentReviewCard` 触发 `requestScriptAgentDraft()`。
2. 前端请求：`src/services/scriptAgentGatewayClient.ts` 调 `/api/agent/script-board`。
3. 本地 dev 网关：`vite.config.mjs` 的 `/api/agent/script-board`。
4. Node/部署网关：`scripts/zeabur-server.mjs` 的 `/api/agent/script-board`。
5. 候选合同：模型返回 `{ rows: [...] }`。
6. 字段对应：
   - `rows[].voiceText` -> 文稿候选。
   - `rows[].boardSlice` -> C 素材候选 / 课堂板书内容候选。
7. 确认应用后：`compileScriptAgentRowsToDraft()` / `compileScriptAgentTableDraft()` 把 rows 编译成 `spokenScript` / `boardPlan`。
8. 正式落库：`applyScriptAgentDraft()` 写入正式 `scriptText` / `boardLayout`。

### 根因（为什么会报错）

- 报错发生在模型内容进入 rows 之前的服务端 `JSON.parse(jsonText)`。
- 模型可能把 LaTeX 写成 JSON 字符串里的单反斜杠，例如 `\left`、`\frac`、`\div`。
- `\left` 这类会触发 `Bad escaped character`；`\frac`、`\right` 这类有时会被 JSON 当作控制字符吃坏。
- 所以问题不是 rows 到文稿/板书的映射错位，而是 Agent 输出 JSON 的数学反斜杠在网关入口不够稳。

### 代码变更

- 文件：`scripts/script-agent-rows-contract.mjs`
  - 改了什么：新增 `parseJsonWithMathStringEscapes()`，只修复 JSON 字符串内部明确数学/LaTeX 命令反斜杠。
  - 为什么改：把 Agent 输出边界的容错集中在 rows 合同入口，避免前端、正式资产层、C 渲染层各自修。
  - 验证方式：直接 Node 复现未转义 `\left/\frac/\div`，并确认合法 `\n` 转义保留。
- 文件：`vite.config.mjs`
  - 改了什么：本地 dev `/api/agent/script-board` 改用共享 parser。
  - 为什么改：本机第二步生成走这里，必须修在事故现场。
  - 验证方式：`npm run check:script-agent-rows`。
- 文件：`scripts/zeabur-server.mjs`
  - 改了什么：Node/部署 `/api/agent/script-board` 改用共享 parser。
  - 为什么改：dev 与 production 必须同源，不能出现本机好了部署仍炸。
  - 验证方式：`npm run check:script-agent-rows`。
- 文件：`scripts/check-script-agent-rows-contract.mjs`
  - 改了什么：加入未转义 LaTeX 反斜杠回归；portable runtime 不存在时用 `process.execPath`。
  - 为什么改：当前仓没有 `runtime/node/node.exe`，旧检查脚本会在断言前失败。
  - 验证方式：`npm run check:script-agent-rows`。
- 文件：`PROJECT_STATE.md`、`DECISIONS.md`、`KNOWN_ISSUES.md`、`PROJECT_TREE.md`、`.workbuddy/memory/2026-06-06.md`
  - 改了什么：记录本轮状态、决策、已知坑、结构入口和 WorkBuddy 当日记忆。
  - 为什么改：用户要求没记录等于没做。

### 验证结果

- 测试：直接 Node 复现未转义 `\left/\frac/\div` -> 通过，rows 保留 LaTeX 并编译到 `B1/C1`。
- 测试：直接 Node 验证合法 JSON `\n` -> 通过，未被误修成字面反斜杠。
- 测试：直接 Node 验证未知非法转义 `\q` -> 通过，继续拒绝进入老师讲稿/板书候选。
- 测试：`npm run check:script-agent-rows` -> 通过。
- 测试：`npm run typecheck` -> 通过。

### 接力棒（下一个单元从这里开始）

- 当前状态：第二步文稿/板书 rows JSON 入口已修复，对应关系已核对清楚。
- 下一步目标：回到 `src/modules/boardSticker/mathBoardText.ts`，修普通 C 文本换行被压扁的问题。
- 关键文件：`src/modules/boardSticker/mathBoardText.ts`、`src/modules/boardSticker/boardTextDisplayRoute.ts`、`src/modules/boardSticker/renderBoardTextStickerImage.ts`。
- 已知的坑：不要改 rows 合同；`boardSlice` 和用户 `\n` 仍是内容真相。不要把 C 渲染层问题误归因到第二步 Agent。
- 预期成本：约 2k token。

### 备注

- 本轮未安装系统级 Codex skill，未启动 dev server。

## 工作单元 #009

### 基本信息

- 时间：2026-06-06
- 目标：纠正 #008 中过度技术化的 JSON 修复口径，回到产品语义。
- 状态：完成

### 背景（为什么要做这个）

- 用户指出：产品开发必须理解产品是什么，不能只看到技术。
- #008 的初版 parser 虽然修了第二步报错，但命名和边界仍带有“宽松容错”的倾向。
- 对这个产品来说，第二步不是普通 JSON 通道，而是老师生成讲解稿和课堂板书的入口；公式、换行、错误暴露都直接影响学生理解。

### 改正（怎么改）

1. 将 parser 命名从 loose 口径改成数学场景限定：`parseJsonWithMathStringEscapes()`。
2. 只修复老师讲稿/板书中明确数学表达需要的反斜杠：
   - LaTeX 命令，如 `\left`、`\right`、`\frac`、`\div`、`\sqrt`。
   - 数学定界，如 `\(`、`\)`、`\[`、`\]`。
3. 合法 JSON 转义如 `\n` 必须保留真实换行语义。
4. 未知非法转义如 `\q` 必须继续失败，不能偷偷进入候选文稿和板书。

### 代码变更

- 文件：`scripts/script-agent-rows-contract.mjs`
  - 改了什么：收窄 parser，未知非法反斜杠不再兜底补写。
  - 为什么改：防止脏内容悄悄进入老师讲稿/板书候选。
- 文件：`vite.config.mjs`、`scripts/zeabur-server.mjs`
  - 改了什么：同步调用 `parseJsonWithMathStringEscapes()`。
  - 为什么改：本地和部署必须同一产品边界。
- 文件：`scripts/check-script-agent-rows-contract.mjs`
  - 改了什么：增加三类产品级断言：数学反斜杠可修、合法 `\n` 保留、未知非法转义拒绝。
  - 为什么改：把“产品是什么”落成门禁，不靠口头提醒。

### 验证结果

- 测试：`npm run check:script-agent-rows` -> 通过。
- 测试：直接 Node product checks -> 通过。
- 测试：`npm run typecheck` -> 通过。

### 接力棒（下一个单元从这里开始）

- 当前状态：第二步 JSON 修复已从技术宽容改成产品语义限定。
- 下一步目标：继续回到 `src/modules/boardSticker/mathBoardText.ts`，修普通 C 文本换行被压扁。
- 已知的坑：不要把“能 parse”当作“产品可用”；老师讲稿/板书必须保数学表达、保用户换行、暴露未知错误。

## 工作单元 #010

### 基本信息

- 时间：2026-06-06
- 目标：把画布内元素样式从全局样式表分家，建立舞台专用 CSS 边界。
- 状态：完成

### 背景（为什么要做这个）

- 用户明确指出：画布是画布，其他是其他。
- 当前 `src/styles.css` 同时承接页面壳子和画布内元素，标签、题目、板书、金手指、舞台工具栏混在一个全局样式表里，不利于继续收“比例同源”。
- 在继续处理标签 / 题目 / 板书的尺寸真相前，先把舞台内样式边界单独立起来，避免边改边混。

### 代码变更

- 文件：`src/stage.css`
  - 改了什么：新增舞台专用样式文件，承接画布内元素规则。
  - 收纳内容：`stage-canvas`、`courseware-label`、`courseware-problem-area`、`courseware-board-area`、`golden-finger-canvas-layer`、`board-stage-tool-overlay`、`board-text-sticker`、`c-standalone-canvas`、hybrid prototype 的舞台壳子规则。
  - 为什么改：先把“画布内规则”从页面壳子里分出来，后续才好继续收尺寸来源。
- 文件：`src/styles.css`
  - 改了什么：删除舞台内样式，保留页面壳子、时间轴、面板和非舞台区域。
  - 为什么改：让 `styles.css` 不再同时扮演全局壳子和舞台内样式真相。
- 文件：`src/main.tsx`
  - 改了什么：新增 `import './stage.css';`
  - 为什么改：让舞台专用样式成为主入口加载链的一部分。
- 文件：`scripts/check-board-boundaries.mjs`
  - 改了什么：同时读取 `styles.css` 与 `stage.css`；新增守门，要求舞台样式 token 必须在 `stage.css`，不得回流到 `styles.css`。
  - 为什么改：不让这次边界分家只靠口头纪律。

### 验证结果

- 测试：`npm run check:board-boundaries` -> 通过。
- 测试：`npm run typecheck` -> 通过。

### 接力棒（下一个单元从这里开始）

- 当前状态：舞台内样式已经单独归到 `src/stage.css`，页面壳子与舞台内元素不再共用同一个样式真相层。
- 下一步目标：继续收标签、题目、板书三条尺寸链，明确它们与画布的比例真相是否要统一到同一来源。
- 关键文件：`src/stage.css`、`src/modules/canvasStage/coursewareChrome.ts`、`src/components/DrawboardStage.tsx`、`src/components/AutoHandwritingLayer.tsx`、`src/modules/boardSticker/renderBoardTextStickerImage.ts`
- 已知的坑：这次只做了样式边界分家，还没有把 `boardFontSize/fontSize` 从像素真相彻底改成比例真相。

## 工作单元 #011

### 基本信息

- 时间：2026-06-06 10:39:27 +08:00
- 目标：把第 1 步题图入口从大拖拽面板收成紧凑的“左缩略 / 右按钮”上传 rail。
- 状态：完成

### 背景（为什么要做这个）

- 用户连续指出题图上传区溢出、占位过大，并明确希望改成“左边图缩略，右边按钮上传”的工具位。
- 原实现基于 `Upload.Dragger`，更像大面积拖拽海报位，会挤压左侧题文确认区。
- 这一步不涉及识别逻辑和素材流，只是入口形态不合适，适合做一刀纯 UI 收口。

### 思路（怎么想的）

- 方案选择：保留现有上传链路和 `beforeUpload -> onImportProblemImage`，只把入口控件从 `Dragger` 换成普通 `Upload`，再收成紧凑 rail。
- 为什么选这个：不动业务，不碰识别/素材流，只改入口盒子和样式，风险最小。
- 关键约束：结构保持扁平，避免为了样式继续 `div` 套娃；缩略图不能因为卡片尺寸被裁。

### 执行步骤（具体做了什么）

1. 定位 `ProblemWorkspace -> ProblemUploadPreview -> src/styles.css` 的尺寸来源，确认原空态上传区在真实页面约 `223px` 高。
2. 将 `src/components/ProblemUploadPreview.tsx` 从 `Upload.Dragger` 改为普通 `Upload`，保留原文件导入事件。
3. 把题图入口重排为紧凑 rail：
   - 左侧固定缩略位
   - 右侧标题、状态、提示、主按钮
   - 有图态与空态共用同一稳定高度
4. 在 `src/styles.css` 新增 `problem-upload-*` 样式，删除旧大拖拽框专用样式。
5. 将题图缩略改成 `object-fit: contain`，防止真实题图被裁。
6. 用 Playwright 验证空态和有图态实测尺寸，再回跑既有 smoke。

### 代码变更

- 文件：`src/components/ProblemUploadPreview.tsx`
  - 改了什么：上传入口从 `Upload.Dragger` 改为普通 `Upload`，结构改成紧凑 rail。
  - 为什么改：收掉大面积拖拽占位，同时保持原上传链路不变。
  - 验证方式：Playwright 空态 / 有图态实测；`npm run smoke:pending-new-problem`。
- 文件：`src/styles.css`
  - 改了什么：新增 `problem-upload-rail`、`problem-upload-thumb`、`problem-upload-copy` 等样式；删除旧大拖拽框样式；题图缩略改成 `contain`。
  - 为什么改：让题图入口成为稳定工具位，而不是海报位。
  - 验证方式：`npm run check:board-boundaries`、Playwright 页面截图和尺寸测量。
- 文件：`PROJECT_STATE.md`、`DECISIONS.md`、`KNOWN_ISSUES.md`、`CHANGE_TREE变更树.md`、`.workbuddy/memory/2026-06-06.md`
  - 改了什么：记录本轮 UI 决策、风险和验证结果。
  - 为什么改：用户要求“没记录等于没做”。

### 发现和确认

- 新确认的设计：第 1 步题图入口更适合“紧凑 rail”而不是大拖拽海报位。
- 新发现的坑：默认 `Upload.Dragger` 很容易重新把左侧工作区撑大，后续不要随手回滚成大拖拽框。
- 结构树说明：本单元不影响工程结构树，无需更新 `PROJECT_TREE.md` 内容。

### 验证结果

- 测试：`npm run typecheck` -> 通过。
- 测试：`npm run check:board-boundaries` -> 通过。
- 测试：`npm run smoke:pending-new-problem` -> 通过。
- 测试：Playwright 空态实测 -> rail 高度 `104px`，左缩略位 `72x68`。
- 测试：Playwright 有图态实测 -> rail 高度 `104px`，按钮文案切到“更换题图”，缩略 `object-fit: contain`。

### 接力棒（下一个单元从这里开始）

- 当前状态：题图入口已从大拖拽面板收成紧凑 rail，空态 / 有图态高度稳定。
- 下一步目标：继续收标签、题目、C 板书三条尺寸链的唯一来源。
- 关键文件：`src/stage.css`、`src/modules/canvasStage/coursewareChrome.ts`、`src/components/DrawboardStage.tsx`、`src/components/AutoHandwritingLayer.tsx`、`src/modules/boardSticker/renderBoardTextStickerImage.ts`
- 已知的坑：不要把题图入口再改回大面积拖拽框；不要为样式新增多层无意义包裹。

### 备注

- 本单元未改识别逻辑、素材流、第二步 rows 合同或 C 渲染链路。

## 工作单元 #012

### 基本信息

- 时间：2026-06-06 14:14:00 +08:00
- 目标：让四区标签对应的分片容器按真实内容 bbox 自适应，并守住“只有标签 pill 可拖，不能撞 C 板书拖拽”的交互边界。
- 状态：完成

### 背景（为什么要做这个）

- 用户明确指出四区标签其实代表上一步的分片容器，容器大小应该跟着真实板书内容面积走，简单规则就是内容 bbox 外加 `5px` 留白。
- 用户同时补了一个关键约束：只有按住标签本身才能移动，不能让整个容器都可拖，否则会和板书文字拖拽冲突。
- 仓里旧接力也已经把这事拆成“两刀”：先做 bbox 自适应，再考虑后续 manual override。

### 思路（怎么想的）

- 方案选择：不去碰 `boardSlice` 和 clip 业务字段，先在运行态用现成 DOM 真相量出题目正文与各区 `board-text-sticker` 的 bbox，再生成四区容器框。
- 为什么选这个：这是最小闭环，不引入第二套内容真相，也不提前打开 manual override 的持久化范围。
- 关键约束：
  - 容器外框只做显示层，不接管拖拽命中。
  - 标签 pill 层级必须高于板书，否则会出现“拖标签其实拖走板书”的假象。
  - 录制底图要和 DOM 共用同一份分区结果，不能各画各的。

### 执行步骤（具体做了什么）

1. 梳理 `DrawboardStage -> AutoHandwritingLayer -> BoardTextSticker -> CStickerFrame` 的拖拽与命中链，确认 C 板书当前拖拽入口在 `board-text-sticker`。
2. 新增 `src/modules/canvasStage/coursewareZoneLayout.ts`，从舞台 DOM 中测量：
   - `stage-problem-text`
   - `board-text-sticker--zone-problem/analysis/solution/summary`
   生成四区容器 bbox 与标签默认位置。
3. 给每个 `BoardTextSticker` 挂上所属分区 class，供 `DrawboardStage` 运行态测量。
4. 在 `DrawboardStage` 渲染动态分区框与标签 pill：
   - 分区框按内容 bbox + `5px` 留白
   - 标签 pill 单独可拖
   - 容器框 `pointer-events: none`
5. 同步录制底图：
   - `CanvasRecordingSurface`
   - `drawCoursewareStageFrame`
   使用同一份分区框与标签位置结果。
6. 首轮 Playwright 回归发现标签层级低于板书，拖标签会误拖板书；随后把标签提升到板书上层，并移除空区 2x2 假框。

### 代码变更

- 文件：`src/modules/canvasStage/coursewareZoneLayout.ts`
  - 改了什么：新增四区分片 bbox 计算模块，从运行态 DOM 生成分区框与标签位置。
  - 为什么改：把“分片容器跟着真实内容走”的计算收成单一入口。
- 文件：`src/components/BoardTextSticker.tsx`、`src/components/CStickerFrame.tsx`、`src/components/AutoHandwritingLayer.tsx`
  - 改了什么：为每个 C 板书注入 `zoneKey` 与 `board-text-sticker--zone-*` class。
  - 为什么改：让舞台壳子能按分区抓到真实内容 bbox，而不需要再复制文本布局逻辑。
- 文件：`src/components/DrawboardStage.tsx`
  - 改了什么：新增分区框渲染、标签 pill 本地拖拽、运行态 DOM 测量与标签 override 本地预览。
  - 为什么改：把标签/分片容器交互限制在舞台壳子层，不污染业务数据。
- 文件：`src/components/CanvasRecordingSurface.tsx`、`src/modules/canvasStage/drawCoursewareStageFrame.ts`
  - 改了什么：录制底图改为消费动态分区框与标签位置。
  - 为什么改：避免 DOM 与录制出现两套标签/容器真相。
- 文件：`src/stage.css`
  - 改了什么：新增 `courseware-zone-box` 样式；标签增加 `cursor/touch-action/user-select`；标签层级提到高于板书。
  - 为什么改：守住“只有标签可拖”和“容器只显示、不抢命中”的交互边界。
- 文件：`src/modules/canvasStage/coursewareChrome.ts`
  - 改了什么：抽出题目摘要换行测量 helper，供录制底图复用。
  - 为什么改：避免题目区换行测量在不同层重复写。
- 文件：`src/standalone/CStickerStandalonePage.tsx`
  - 改了什么：补齐新的 `zoneKey` 参数。
  - 为什么改：保持 standalone demo 与主链接口一致。

### 发现和确认

- 新确认的设计：标签现在是“分片容器的句柄”，不是大面板的拖拽热区。
- 新发现的坑：标签层级如果低于 `board-text-sticker`，用户看起来像拖标签，实际命中的是板书，这会直接破坏交互预期。
- 结构树说明：本单元只新增一个舞台布局模块文件，不改变工程骨架，无需更新 `PROJECT_TREE.md` 内容。

### 验证结果

- 测试：`npm run typecheck` -> 通过。
- 测试：`npm run check:board-boundaries` -> 通过。
- 测试：本地 Playwright `standalone=drawboard-core` 交互回归 -> 通过。
  - solution 标签拖动位移：`x:+51, y:+18`
  - 拖标签期间板书位移：`x:0, y:0`
  - 板书自身拖动位移：`x:+40, y:+13`
  - 截图：`.tmp-ui-smoke/zone-label-drag-2026-06-06T06-12-59-865Z.png`

### 接力棒（下一个单元从这里开始）

- 当前状态：四区分片容器已经按运行态内容 bbox 自适应，标签 pill 可拖但不写回业务真相，板书拖拽不再与标签命中冲突。
- 下一步目标：继续把题目区 bbox、录制底图和 `KonvaRecordingSurface` / proof 页面收成同一套尺寸口径。
- 关键文件：`src/modules/canvasStage/coursewareZoneLayout.ts`、`src/components/DrawboardStage.tsx`、`src/modules/canvasStage/drawCoursewareStageFrame.ts`、`src/components/KonvaRecordingSurface.tsx`
- 已知的坑：当前标签拖拽仍是本地运行态预览，不是持久化 manual override；不要越界写回 `boardSlice` 或 clip 内容字段。

### 背景（为什么要做这个）

- 用户直接在页面上指出右侧 `A/B/C 控制层职责表` 的容器没收好，展开后像把整块侧栏当成长文画布。
- 这块属于页面壳子信息面板，不是舞台内容。如果它继续横向撑爆或纵向无限拉长，会把右栏 inspector 的工具性破坏掉。

### 思路（怎么想的）

- 方案选择：不碰 `boardControlResponsibilities` 文案源，只在 `src/styles.css` 收紧容器纪律。
- 为什么选这个：这是最小闭环，既不动 A/B/C 责任真相，也不引入新的组件层。
- 关键约束：
  - 右栏面板必须锁在 inspector 单列宽度里。
  - 展开内容要在职责表自己体内滚动，而不是让整张卡片无限变长。
  - 只在页面壳子样式层处理，不把右栏容器规则混进 `src/stage.css`。

### 执行步骤（具体做了什么）

1. 读取 `BoardControlResponsibilitiesPanel.tsx`、`InspectorPanel.tsx` 和 `src/styles.css`，确认组件结构本身已经足够扁平，问题主要在样式容器边界。
2. 用本地 Playwright 实测展开态 DOM 尺寸，确认旧状态下：
   - 职责表根宽度约 `555px`
   - 整卡高度约 `3730px`
   - 右栏 `scrollWidth` 超过侧栏宽度
3. 在 `src/styles.css` 收紧：
   - `.inspector-stack` 固定单列 `minmax(0, 1fr)`
   - `.board-control-responsibilities-collapse` / `.ant-collapse-item` / `.ant-collapse-panel` / `.ant-collapse-body` 全链路 `min-width: 0`
   - `.ant-collapse-body` 作为真实内容层承接 `max-height + overflow:auto`
   - 卡片标题、事实文本和 tag 全部允许断行
4. 再次用 Playwright 验证，确认职责表回到侧栏宽度内，且内容进入自身内滚容器。

### 代码变更

- 文件：`src/styles.css`
  - 改了什么：
    - 为 `.inspector-stack` 增加单列宽度约束。
    - 为 `.board-control-responsibilities-collapse` 补齐 `width/max-width/min-width` 与展开体滚动边界。
    - 收紧职责卡片内边距与间距，并给标题、正文、tag、事实字段增加断行能力。
  - 为什么改：
    - 让职责表像右栏工具面板，而不是一篇把 inspector 挤爆的长文。

### 发现和确认

- 新确认的设计：右栏职责表是“信息索引面板”，不是自由长页；展开态必须自带收纳边界。
- 新发现的坑：Ant Collapse 当前版本的展开内容真实承载层在 `.ant-collapse-body`，滚动边界挂错层会出现“代码看着加了 max-height，页面却没变”的假修复。
- 结构树说明：本单元只改页面壳子样式，不新增/删除目录或模块文件，无需更新 `PROJECT_TREE.md` 内容。

### 验证结果

- 测试：`npm run typecheck` -> 通过。
- 测试：`npm run check:board-boundaries` -> 通过。
- 测试：本地 Playwright 右栏容器回归 -> 通过。
  - 修复后 `workspace-sider--inspector` 无横向溢出：`scrollWidth == clientWidth == 294`
  - 职责表 `.ant-collapse-body` 高度约 `600px`，`scrollHeight` 约 `4829px`，已进入自身内滚
  - `画布变量 / 录屏舞台` 与 `C 默认字体 / 当前工程` 面板重新回到首屏可达
  - 截图：`.tmp-ui-smoke/inspector-responsibilities-2026-06-06T06-37-32-344Z.png`

### 接力棒（下一个单元从这里开始）

- 当前状态：右栏职责表已经收回 inspector 边界，横向不再撑爆，展开内容在自身容器内滚动。
- 下一步目标：回到主线，继续把题目区正文 bbox、录制底图和 Konva proof 收成同一套画布比例真相。
- 关键文件：`src/modules/canvasStage/coursewareZoneLayout.ts`、`src/components/DrawboardStage.tsx`、`src/modules/canvasStage/drawCoursewareStageFrame.ts`、`src/components/KonvaRecordingSurface.tsx`
- 已知的坑：职责表若继续加长字段，仍要优先守单列密度和内滚边界；不要把这类右栏容器规则混入 `src/stage.css`。

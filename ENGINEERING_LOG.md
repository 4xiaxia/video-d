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

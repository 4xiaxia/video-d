# Known Issues

## ISSUE-001：C 普通文本换行可能被压扁

- 状态：待修复
- 发现时间：2026-06-05
- 影响范围：普通多行 `boardSlice` 进入手写字体文本渲染链路。
- 现象：第三步板书内容保留换行，但页面/舞台渲染可能把 `\n` 压成空格。
- 高危文件：`src/modules/boardSticker/mathBoardText.ts`
- 初步定位：普通手写文本归一化逻辑不应对整段文本做 `\s+` 压缩。
- 规避方式：只围绕该文件做最小修复；保留用户换行，逐行归一普通空白；不要改写 `boardSlice`。
- 验证要求：最小测试证明 `\n` 不丢，字符 reveal 索引可解释。

## ISSUE-002：记录散在对话会导致接力断线

- 状态：已通过范式缓解
- 发现时间：2026-06-06
- 影响范围：跨 agent 接手、长上下文压缩、下一轮 SessionStart。
- 现象：如果发现、决策、坑只停在对话中，后续接手必须重新验证，容易误改主线。
- 规避方式：完成工作单元必须更新 `PROJECT_STATE.md`、`ENGINEERING_LOG.md`、必要时更新 `DECISIONS.md`、`ARCHITECTURE.md`、`KNOWN_ISSUES.md`、`PROJECT_TREE.md`、`CHANGE_TREE变更树.md`。
- 验证要求：运行 `npm run check:continuity-docs`。

## ISSUE-003：`.claude/settings*.json` 含敏感路由/API 环境值

- 状态：已确认，需规避泄露
- 发现时间：2026-06-06
- 影响范围：审计 Claude 配置、迁移本机级技能、生成报告。
- 现象：用户级 `.claude/settings*.json` 中存在路由与 API 环境配置，可能包含敏感值。
- 高危文件：`C:\Users\admin\.claude\settings.json`、`C:\Users\admin\.claude\settings (2).json`
- 初步定位：这些文件可用于理解配置结构，但不能在记录或回复中复制真实密钥。
- 规避方式：只描述“本地代理 / 路由 / 模型配置 / 插件开关”等用途；不要粘贴 secret；不要迁移真实值到项目文档。
- 验证要求：最终报告不出现真实 API key 或 token。

## ISSUE-004：规则包捆死项目或本机路径会反过来制造无序

- 状态：已纠偏，持续防回归
- 发现时间：2026-06-06
- 影响范围：`local-continuity-standard` 技能、安装脚本、审计脚本、项目模板。
- 现象：如果规则包本体写死某个项目路径、用户名、`.claude` 目录或具体工具包路径，它就不能成为通用范式，只会变成单机补丁。
- 高危文件：`.tmp-system-skill-source/local-continuity-standard/**`、`scripts/audit-local-order.mjs`
- 初步定位：工具栈应配置化；规则包只规定层级、纪律、入口、验证，不承载某台机器的具体路径。
- 规避方式：规则包本体不得出现用户目录、项目名或固定本机路径；具体工具路径放入 `scripts/continuity-stack.config.json` 或 `CONTINUITY_STACK_CONFIG` 指向的配置。
- 验证要求：用 `rg` 扫描规则包，确认没有项目/本机硬编码。

## ISSUE-005：桌面专武目录容易夹带运行产物

- 状态：已加忽略规则
- 发现时间：2026-06-06
- 影响范围：`.claude/desktop-tools/`
- 现象：桌面工具包包含 `.venv`、截图 `captures/`、Python `__pycache__`，这些是运行环境或产物，不是工程真相。
- 高危文件：`.claude/desktop-tools/.venv/`、`.claude/desktop-tools/captures/`、`__pycache__/`、`*.pyc`
- 初步定位：若直接纳入 git 状态，会让秩序工具本身变成噪音源。
- 规避方式：`.gitignore` 忽略运行环境和产物；只保留工具入口、源码、说明书和秩序专武。
- 验证要求：`git status --short -- .claude/desktop-tools` 不应显示 `.venv`、`captures`、`__pycache__`、`*.pyc`。

## ISSUE-006：第二步 Agent JSON 可能带未转义 LaTeX 反斜杠

- 状态：已修复并加回归
- 发现时间：2026-06-06
- 影响范围：第二步“生成文稿/板书内容”对话生成，模型输出进入 rows 前的网关解析。
- 现象：对话中出现 `Bad escaped character in JSON at position 263 (line 1 column 264)`。
- 高危文件：`vite.config.mjs`、`scripts/zeabur-server.mjs`、`scripts/script-agent-rows-contract.mjs`
- 初步定位：模型可能返回 `\left`、`\frac`、`\div`、`\angle`、`\pi`、`\sin`、`\sqrt` 等未按 JSON 字符串规则双写的课堂数学反斜杠，服务端 `JSON.parse(jsonText)` 在进入 rows 编译前失败。
- 规避方式：只在 rows JSON 网关入口按当前 C 板书数学能力修复明确数学命令/定界符；不要在前端展示层、正式资产层或 C 渲染层另造修复；未知非法转义必须继续失败。
- 验证要求：`npm run check:script-agent-rows` 必须覆盖未转义课堂数学反斜杠、合法 `\n` 转义保留、未知非法转义拒绝。

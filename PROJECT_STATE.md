# Project State

## 基本信息

- 项目名：video-dev-cleanroom / teaching-cut-cleanroom
- 最后更新：2026-06-06 05:57:47 +08:00
- 当前阶段：第二步文稿/板书 rows JSON 入口已修复；下一刀回到 C 普通文本换行
- 负责人：当前 agent

## 已确认的设计决策

- 唯一施工目录是 `D:/video-dev-cleanroom`；旧仓只作参考证据源。
- 真相源顺序：`.workbuddy/memory` -> 根目录五件套与专题真相 -> 代码实证 -> `.claude` 旧足迹辅助。
- 当前唯一业务主线：`boardSlice` 普通多行原文 -> 保留用户 `\n` -> 手写字体文本渲染 -> 按字符 reveal -> C 默认留场。
- 当前不启动 Konva 主迁移、不重启 SVG/path/逐笔轨迹、不做 Agent 智能排版、不做标签 manual override、不做数学公式大改、不做 tldraw 清理。
- 工程记录范式固定为：`AGENTS.md` + 五件套 + `PROJECT_TREE.md` + `CHANGE_TREE变更树.md`。
- 本机级范式选择 Codex skill 形态：`local-continuity-standard`，项目内五件套是该技能投放后的项目实例。
- 技能套件规则包不能捆死任何项目、用户目录、本机路径或特定工具安装；具体工具栈只能通过配置声明。
- 自动安装引导采用 dry-run 优先：预览目标与风险，用户显式确认后才安装。
- 第二步文稿/板书生成的唯一候选合同是 `rows`：`voiceText` 是文稿，`boardSlice` 是 C 素材候选；确认应用后才编译到正式 `scriptText` / `boardLayout`。
- Agent 返回 JSON 时可能把课堂数学表达的反斜杠写成未转义形式；网关只在 rows JSON 入口修复当前 C 板书已支持的数学命令/定界符，并保留合法 JSON 转义如 `\n`，拒绝未知非法转义。

## 已验证的边界

- 根目录已有 `DECISIONS.md` 与 `CHANGE_TREE变更树.md`，此前没有根目录 `PROJECT_STATE.md`、`ENGINEERING_LOG.md`、`ARCHITECTURE.md`、`KNOWN_ISSUES.md`。
- `.claude/PROJECT_STATE.md` 与 `.claude/ENGINEERING_LOG.md` 只能作为辅助镜像，不作为最高真相。
- 结构树采用根目录 `PROJECT_TREE.md` 维护关键工程骨架，不把 `node_modules`、`dist`、`历史/` 全量噪音展开为主树。

## 当前代码状态

- 主要文件：`src/modules/boardSticker/mathBoardText.ts` - 下一刀的高危点，普通手写文本归一化可能压扁换行。
- 第二步网关：`scripts/script-agent-rows-contract.mjs` - rows 合同读取、编译，以及 Agent JSON 数学反斜杠限定修复。
- 第二步网关：`vite.config.mjs` - 本地 dev `/api/agent/script-board` 使用 rows parser。
- 第二步网关：`scripts/zeabur-server.mjs` - Node/部署 `/api/agent/script-board` 使用 rows parser。
- 第二步验证：`scripts/check-script-agent-rows-contract.mjs` - rows 对应关系、TS normalizer、未转义 LaTeX 反斜杠回归。
- 关键记录：`AGENTS.md` - SessionStart/Stop 与工作单元闭环规则。
- 关键记录：`ENGINEERING_LOG.md` - 后续工作单元自包含记录入口。
- 关键记录：`PROJECT_TREE.md` - 关键结构快照入口。
- 已测试：`npm run check:script-agent-rows`、`npm run typecheck`、直接 Node 复现未转义课堂数学命令、合法 `\n` 转义保留、未知非法转义拒绝。
- 系统级技能源：`.tmp-system-skill-source/local-continuity-standard` - 已验证，等待批准安装到 `C:\Users\admin\.codex\skills`。
- 秩序审计脚本：`scripts/audit-local-order.mjs` - 可移植，默认只查项目连续性文件；具体本机工具路径读 `scripts/continuity-stack.config.json` 或 `CONTINUITY_STACK_CONFIG`。
- 系统安装引导：`.tmp-system-skill-source/local-continuity-standard/scripts/install-system-skill.mjs` - 默认 dry-run，`--yes` 才安装，`--replace` 才覆盖。
- 项目内桌面工具落点：`.claude/desktop-tools/` - 用户已复制原桌面鼠标专武；新增 `.claude/desktop-tools/continuity-weapon/` 作为秩序专武入口，不覆盖原工具。

## 已知的坑

- `boardSlice` 的 `\n` 是内容真相，渲染层不能用普通空白归一化压扁。
- 第二步 Agent JSON 里课堂数学表达的单反斜杠可能导致 `Bad escaped character in JSON`；必须在网关 rows 入口按产品数学边界修复，不能让前端或正式资产层各修各的，也不能吞未知脏内容。
- DOM / Canvas / 未来 Konva 禁止各写一套文本 layout；必须共用同源排版结果。
- 标签拖动不得写回 `boardSlice`；如需持久化必须走独立 manual override 字段。
- 只在对话里说发现、决策、坑，没有写入对应文件，等于没有完成工程记录。

## 下一步（接力棒）

- 目标：回到 `src/modules/boardSticker/mathBoardText.ts`，修普通 C 文本换行被压扁的问题。
- 前置条件：不要改第二步 rows 合同；`boardSlice` 原文和用户 `\n` 仍是内容真相。
- 关键文件：`src/modules/boardSticker/mathBoardText.ts`、`src/modules/boardSticker/boardTextDisplayRoute.ts`、`src/modules/boardSticker/renderBoardTextStickerImage.ts`。
- 验证方式：最小测试证明 `\n` 不丢，字符 reveal 索引可解释；同时跑 `npm run check:script-agent-rows` 与相关 board 检查。
- 预期成本：约 2k token。

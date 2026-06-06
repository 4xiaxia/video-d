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

## ISSUE-007：标签 / 题目 / 板书的尺寸真相仍未完全同源

- 状态：待继续收口
- 发现时间：2026-06-06
- 影响范围：第 4 步舞台预览、录制画布、C 板书尺寸入口。
- 现象：用户明确要求画布上的标签、题目、板书都应与画布保持比例关系，不接受多个初始真相或硬编码口径。
- 当前进展：本轮已先把舞台内样式从 `src/styles.css` 分离到 `src/stage.css`，让“画布是画布，其他是其他”成为单独边界。
- 高危文件：`src/modules/canvasStage/coursewareChrome.ts`、`src/components/DrawboardStage.tsx`、`src/components/AutoHandwritingLayer.tsx`、`src/modules/boardSticker/renderBoardTextStickerImage.ts`
- 规避方式：下一刀先梳理标签、题目、板书三条尺寸链的唯一来源，再决定是否把 `boardFontSize/fontSize` 从像素真相改成比例真相；不要把页面壳子样式重新混回 `src/stage.css`。
- 验证要求：`npm run check:board-boundaries` 必须继续通过；开始改尺寸来源后补最小比例链验证。

## ISSUE-008：题图入口一旦用默认大拖拽面板，左侧工作区会被过度挤占

- 状态：已缓解，持续防回归
- 发现时间：2026-06-06
- 影响范围：第 1 步题图导入、左侧工作区纵向密度、题文确认入口可见性。
- 现象：默认 `Upload.Dragger` 容易形成大面积空态拖拽框，占位过高，不像工具位。
- 高危文件：`src/components/ProblemUploadPreview.tsx`、`src/styles.css`
- 初步定位：Ant 拖拽上传的默认容器高度和旧样式组合，会把题图入口做成“海报位”而不是“按钮入口”。
- 规避方式：保持普通 `Upload` + 紧凑 `problem-upload-rail`；结构尽量扁平，不为样式再套多层；题图缩略保持 `contain`。
- 验证要求：空态 / 有图态都要实测稳定高度，且 `npm run smoke:pending-new-problem` 继续通过。

## ISSUE-009：标签拖拽热区如果落到整个容器，会和 C 板书拖拽命中撞车

- 状态：已通过层级与命中边界缓解，持续防回归
- 发现时间：2026-06-06
- 影响范围：第 4 步舞台预览、标签分片容器、C 板书拖拽体验。
- 现象：如果把整块分片容器都做成可拖区域，或者让标签层级落到板书下面，用户看起来像是在拖标签，实际命中的却是 `board-text-sticker`。
- 高危文件：`src/components/DrawboardStage.tsx`、`src/stage.css`
- 初步定位：分片容器与板书内容区域天然重叠；没有明确“谁能接指针、谁只是显示层”的话，板书拖拽链会把标签操作吃掉。
- 规避方式：标签句柄只给 `courseware-label` pill；`courseware-zone-box` 保持 `pointer-events: none`；标签层级必须高于板书。
- 验证要求：本地 Playwright 至少验证一次“拖标签时板书不跟随，拖板书仍可正常移动”。

## ISSUE-010：右栏信息面板若缺少容器边界，会把 inspector 撑成无限高长文列

- 状态：已缓解，持续防回归
- 发现时间：2026-06-06
- 影响范围：右侧 inspector、`A/B/C 控制层职责表`、后续类似长文信息面板。
- 现象：职责表展开后若没有明确的宽度、断行与内滚边界，会同时出现横向溢出和纵向失控，把右栏挤成一整列长文。
- 高危文件：`src/styles.css`
- 初步定位：`inspector-stack` 和 `board-control-responsibilities-collapse` 缺少单列宽度约束；Ant Collapse 实际展开体在 `.ant-collapse-body`，若滚动边界挂错层，卡片仍会整体变长。
- 规避方式：右栏长文面板默认遵守“单列宽度 + 自身内滚 + 文案可断行”；命中真实 DOM 层再挂滚动边界，不猜结构。
- 验证要求：至少确认 `workspace-sider--inspector` 无横向溢出、职责表自身存在本地纵向滚动、下方 inspector 面板首屏仍可达。

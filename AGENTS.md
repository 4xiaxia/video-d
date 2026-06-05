# Agent Working Standard

原则：所有工程信息都有家，不散在对话记录里。没有落笔记录、没有运行验证、没有更新结构树，视为工作未闭环。

## SessionStart

0. 运行秩序审计：`node scripts/audit-local-order.mjs`。具体本机工具路径只写进 `scripts/continuity-stack.config.json`，不要写死进规则包。
1. 读 `PROJECT_STATE.md`，确认当前真相与下一步。
2. 读 `ENGINEERING_LOG.md` 最后一条，接住接力棒。
3. 读 `DECISIONS.md`，确认边界、禁止项和为什么。
4. 需要架构视角时读 `ARCHITECTURE.md`；遇到坑先查 `KNOWN_ISSUES.md`。
5. 只按需增量读细节，不全文重读大文档。

## 真相源顺序

1. `.workbuddy/memory/MEMORY.md` 与当日 memory。
2. 根目录五件套：`PROJECT_STATE.md`、`ENGINEERING_LOG.md`、`DECISIONS.md`、`ARCHITECTURE.md`、`KNOWN_ISSUES.md`。
3. 根目录专题真相：`真相路标-当前唯一入口.md`、`认知图-核心逻辑动态图.md`、`ABC字段函数前端映射表.md`、`CHANGE_TREE变更树.md`。
4. 代码实证与运行验证。
5. `.claude` 旧足迹只作辅助，不压过上面真相源。

## 工作中

- 输入小于 10k token：直接处理。
- 输入很大且带开发信号：先压缩成根层、主干层、命脉层、约束层，再动手。
- 缓存/记忆命中：用命中的结论，但漂移风险高的事实必须用文件或运行验证复核。
- 用户给出候选清单时，先完整 intake：每一项都必须归层、归用途、归边界、归配置；不能漏项后等用户二次提醒。
- 每次只做最小工作单元；新实现优先复用既有链路，运筹而不是新造。
- 改代码前回答四问：值从哪来、当前层是否造第二套、DOM/Canvas/录制/未来 Konva 是否同源、是否破坏 workflow。

## 完成工作单元

1. 更新 `PROJECT_STATE.md`。
2. 在 `ENGINEERING_LOG.md` 追加一条完整工作单元。
3. 有重要决策时更新 `DECISIONS.md`。
4. 架构有变化时更新 `ARCHITECTURE.md`。
5. 发现新坑时更新 `KNOWN_ISSUES.md`。
6. 更新 `PROJECT_TREE.md` 或明确说明本单元不影响结构树。
7. 在 `CHANGE_TREE变更树.md` 追加目标、改动、验证、下一枝。
8. 跑最小验证，并把命令和结果写进记录。

## Stop Hook

- 检查记录是否完整。
- 检查接力棒是否清楚。
- 检查下一轮能否不依赖对话历史直接接上。

## 垃圾边界

- 本机级复用能力进 system skill / system package。
- 项目真相进五件套与变更树。
- 历史证据进 history/archive。
- 临时实验进 `.tmp-*` 或 staging。
- 构建产物、依赖目录、日志、压缩包不能当接力入口。

# AGENTS.md

做事规则：

SessionStart
- 缓存预热：优先查 `project:state` / `project:decisions` / `project:architecture` / `project:issues`。
- 读当前根目录连续性文件：`PROJECT_STATE.md`、`ENGINEERING_LOG.md` 最新条、`DECISIONS.md`。
- 旧内容勿用时，以当前文件系统、源码、脚本输出为事实源。

工作中
- 输入较小时直接处理；大输入先压缩主线再动手。
- 查询先查缓存，缓存未命中再读文件，并增量更新。
- 修 bug 必须先复现失败，再定位根因，再做最小改动。

完成工作单元
- 更新 `PROJECT_STATE.md`。
- 追加 `ENGINEERING_LOG.md`。
- 如有新边界或决策，更新 `DECISIONS.md`。
- 结构或主流程变化时更新 `ARCHITECTURE.md` 与 `PROJECT_TREE.md`。
- 新陷阱写入 `KNOWN_ISSUES.md`。
- 清理或失效相关缓存。

Stop Hook
- 检查记录是否完整。
- 检查接力棒是否清楚。
- 记录实际运行验证；没有验证不算完成。

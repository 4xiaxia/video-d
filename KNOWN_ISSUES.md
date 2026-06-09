# Known Issues

## 当前工作树存在大量既有删除/搬移痕迹
- 现象：`git status --short` 显示大量根目录文档、历史缓存、dist、日志等删除，以及 `历史/` 下新增内容。
- 影响：这些不是本轮修复产生的核心代码改动，后续不要误回滚。
- 处理：只围绕用户目标处理当前相关文件；提交或清理前需要单独确认这些删除是否保留。

## Portable Node 可能不存在
- 现象：硬编码 `runtime/node/node.exe` 的脚本会在当前机器报 `ENOENT`。
- 处理：新改脚本已 fallback 到 `process.execPath`；后续新增检查脚本应沿用这一模式。

## 构建会改写 dist
- 现象：`npm run build` 会生成/更新 `dist/`。
- 处理：这是验证产物；是否纳入提交需要按发布流程决定。

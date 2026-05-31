# side-00 handoff / runtime blank page

时间：2026-05-20 06:54

## Next session purpose

先恢复前端可见页面，再决定是否继续做播放卡顿优化；不许在空白页未查清前继续扩 performance 改动。

## Read first

1. `必看/当前短便签_桌面工具链恢复_2026-05-20.md`
2. `必看/当前主线_任务树与子接力棒中心_2026-05-19.md`
3. `必看/当前唯一真相_ABC_Canvas_GoldenFinger_2026-05-17.md`

## Confirmed facts

- 当前仓根目录是当前目录。
- 项目自带启动链优先：`start-window.bat / stop-dev.bat / runtime`
- 当前仓没有独立 `lint` script，也没有 `eslint` 配置文件。
- 当前已验证的静态信号：
  - `npm run typecheck`：通过
  - `git diff --check`：只有 CRLF warning
- `C 手写字体支持 gate` 已修：
  - `src/modules/boardSticker/mathBoardText.ts`
  - `scripts/check-board-handwriting-support.mjs`
- 已安装本地审查 skill：
  - `C:\Users\Administrator\.codex\skills\code-review-skill`
  - 内部 skill 名：`code-review-excellence`

## Resolution update

- 已确认根因：`PlaybackWorkspace` 的 Zustand 聚合 selector 每次返回新对象 / 新数组，触发 React `useSyncExternalStore` 无限更新。
- 浏览器错误：
  - `The result of getSnapshot should be cached to avoid an infinite loop`
  - `Maximum update depth exceeded`
- 已修：拆成多个稳定 selector。
- 已验证：
  - `npm run typecheck`：通过
  - 浏览器诊断脚本能看到 `.app-shell`
  - `pageErrors: []`
  - 夏夏现场确认页面没问题了
- 已提交：
  - `d7d1936 fix: restore app shell and add browser debug scripts`
  - 自动 checkpoint 最新：`78350d6 checkpoint: auto save tracked work 2026-05-20 07:31`

## Active blocker after resolution

- 空白页突发已止血。
- 下一步回到原问题：卡顿、C 用户侧调整真相、GoldenFinger/C 边界、第三步 UI 收敛。

## Active files

- `src/App.tsx`
- `src/modules/boardSticker/mathBoardText.ts`
- `scripts/check-board-handwriting-support.mjs`
- `必看/当前短便签_桌面工具链恢复_2026-05-20.md`
- `必看/当前主线_任务树与子接力棒中心_2026-05-19.md`

## Do not do

- 不要在空白页未恢复前继续扩 performance 优化
- 不要拿 `typecheck` 当页面恢复证据
- 不要切去 `T2 SVG` 主线
- 不要 build
- 不要混用 Chrome 和 Edge

## First command to verify

先看当前静态基线：

```powershell
git status --short
npm run typecheck
```

然后只做一件事：

- 用项目自带启动链起服务
- 用可见 Chrome 打开页面
- 看控制台 / 页面错误
- 确认是不是 `src/App.tsx` 这刀导致空白

## Suggested skills

- `xiaxia-continuity`
- `diagnose`
- `better-ps-cmd-skill`
- `playwright`

## Completion bar

- 页面可见
- 至少能回到第一步
- 有浏览器/截图证据
- 没有这些，一律写：`未完成 / not complete`

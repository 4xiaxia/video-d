# side-00 handoff / check:all cwd

时间：2026-05-19 07:34

## Next session purpose

只修 `check:all` 的 `cwd` 唯一入口问题，不改业务真相，不补绝对路径。

## Read first

1. `必看/当前主线_任务树与子接力棒中心_2026-05-19.md`
2. `必看/当前短便签_小白板救回_2026-05-18.md`
3. `必看/当前唯一真相_ABC_Canvas_GoldenFinger_2026-05-17.md`

## Confirmed facts

- 当前仓库根目录就是当前目录。
- 这是 USB 项目，优先认项目自带 `runtime / node / bat` 入口。
- 绝对路径硬补丁是禁止项。
- 当前卡点被单独定义为环境入口问题，不是业务真相问题。
- 已有文档真相已同步 `T1.5 / 环境纠偏`。

## Not yet verified

- 这份文档生成时，还没有重新真跑一遍完整 `npm run check:all`。
- 所以不能写 `check:all 已恢复`。
- 只能写：下一窗口先查 `cwd` 漂移源头。

## Active files

- `必看/当前短便签_小白板救回_2026-05-18.md`
- `必看/当前主线_任务树与子接力棒中心_2026-05-19.md`
- `必看/子接力棒/README.md`
- `scripts/zeabur-server.mjs`
- `vite.config.mjs`

## Do not do

- 不要跳去 `T2 SVG` 主线
- 不要用绝对路径 `cd D:\...` 当最终修法
- 不要把宿主机全局环境当项目真相
- 没真跑过，不要写 `ok`

## First command to verify

先核实入口，不先报喜：

```powershell
Get-Location
Get-ChildItem .
Test-Path .\start-window.bat
Test-Path .\stop-dev.bat
```

然后再查：

```powershell
npm run check:all
```

## Suggested skills

- `xiaxia-continuity`
- `handoff`
- `diagnose`

## 2026-05-19 07:46 verification update

这份接力文档对应的小阶段已闭环：

- 已新增 `check-all.ps1`
- 已用它真跑完整 `npm run check:all`
- 当前可以把 `cwd` 漂移问题视为“已有 repo 自带检查入口”

边界不变：

- 这不等于全局所有 shell 都不漂
- 只等于本项目现在有了一个不依赖当前 shell 位置的检查入口

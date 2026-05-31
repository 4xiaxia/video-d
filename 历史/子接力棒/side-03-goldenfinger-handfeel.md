# side-03 GoldenFinger handfeel

日期：2026-05-20

## 本刀目标

- 只收 `GoldenFinger` 手感。
- 不动 `A/B/C`。
- 不动 store / project truth。
- 不把金手指做成正式白板数据。

## 已下刀

- 文件：
  - `src/components/GoldenFingerCanvasLayer.tsx`
  - `src/styles.css`
- 只扒 `tiger-draw-board-main` 的交互细节，不扒架构：
  - `pointer capture` 加 `try/catch`
  - `getCoalescedEvents()` 补采样
  - 微小移动去噪
  - 折线改为 `quadraticCurveTo` 平滑曲线
  - 禁掉 `user-select / touch-callout`

## 当前边界

- `GoldenFinger =` 舞台内可拆卸插件层
- 它只是顶层透明保鲜膜
- 数据不与白板 `A/B/C` 正式数据混肴
- `select` 让出交互，`pen / eraser` 才接管 pointer

## 未完成

- 还没做真页面手感回看
- 还没做真实录制回看
- 还没决定是否要持久化；当前默认不做

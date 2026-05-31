# Symbol System

| Symbol | Name | Use When | Required Details |
|---|---|---|---|
| `⚡` | API 接入点 | 前端需要调用后端或外部接口 | method/path, trigger, request/response fields |
| `💾` | 数据绑定 | UI 展示或提交动态数据 | field name, source, update timing |
| `🔄` | 实时更新 | 轮询、订阅、定时刷新、状态同步 | interval/source, stop condition, stale handling |
| `🔌` | 事件监听 | 用户点击、提交、切换、回调、系统事件 | event name, handler, side effects |
| `📡` | WebSocket | 长连接、推送、流式状态 | URL/topic, reconnect, close behavior |
| `🔐` | 权限验证 | 登录、角色、敏感动作、安全校验 | role/state/checkpoint, failure route |
| `⚠️` | 错误处理 | 失败、超时、空态、重试、降级 | scenario, user feedback, retry/fallback |
| `📦` | 数据转换 | API 字段和 UI 字段不一致 | input shape, output shape, transform rule |
| `🎨` | 动态样式 | 样式随状态变化 | state condition, visual result |
| `🧩` | 组件复用 | 可抽组件、复用已有块 | component name, props, reuse boundary |

## ID Naming

Use `{page}-{module}-{function}-{sequence}`.

Examples:
- `provider-list-get-001`
- `provider-form-save-001`
- `cron-list-toggle-001`
- `copilot-login-oauth-001`

## Counting Categories

At the end of an annotated document, summarize the count by symbol and include a total. Counts are for scope tracking and regression planning, not performance vanity.

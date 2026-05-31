# Templates

## Standard Anchor

```markdown
[符号] 简短描述
├─ ID: page-module-action-001
├─ 层级：truth/ui/api/state/event/risk/verify
├─ API: METHOD /path 或 TODO: 待确认
├─ 数据：fieldName 或 TODO: 待确认
├─ 事件：onClick/onSubmit/onMount/订阅/回调
└─ 备注：触发时机、失败处理、权限或转换说明
```

## Design Body Inline Anchor

```markdown
[按钮/区域名称] 🔌 onClick: handler；⚡ METHOD /api/path；💾 dataField；⚠️ failure behavior；层级: event/api/state/risk；ID: page-module-action-001
```

## Truth Boundary Anchor

```markdown
📌 真相边界
├─ ID: feature-truth-boundary-001
├─ 层级：truth
├─ 真相源：正式字段 / 接口 / 文档路径
├─ 投影层：UI 预览 / 表格 / 缓存 / 调试面板
└─ 禁止：投影层不能反写或替代真相源
```

## Statistics Block

```markdown
## 埋点统计

- 📌 真相边界：0 个
- ⚡ API 接入点：0 个
- 💾 数据绑定：0 个
- 🔌 事件监听：0 个
- 🔄 实时更新：0 个
- 📡 WebSocket：0 个
- 🔐 权限验证：0 个
- ⚠️ 错误处理：0 个
- 📦 数据转换：0 个
- 🎨 动态样式：0 个
- 🧩 组件复用：0 个

**总计：** 0 个埋点
```

## Regression Checklist

```markdown
## 回归验证清单

- [ ] 搜索所有新增 ID，确认没有重复。
- [ ] 真相边界锚点能指向真实字段、接口或文档。
- [ ] API 锚点能对应真实端点或 TODO。
- [ ] 数据锚点能对应真实字段或 TODO。
- [ ] 事件锚点能对应 handler 或任务。
- [ ] 错误/权限锚点有用户可见结果。
- [ ] 锚点没有变成第二套运行时真相。
- [ ] 统计数量与正文标记一致。
```

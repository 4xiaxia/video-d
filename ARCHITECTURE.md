# Architecture

## 项目目标

video-dev-cleanroom 是教学自动剪辑 / 讲课板书录制工作台。核心不是普通白板，而是把题目、讲解语音、板书内容、时间线、录制合成为可交付视频。

## 当前主流程

```text
用户输入/上传题目
  -> 第 1 步：题目确认
  -> 第 2 步：文稿与 C 素材表格（rows 是骨牌第一张）
  -> 第 3 步：A 轨 TTS 与板书候选预览
  -> 第 4 步：舞台播放 / C 板书 reveal / 金手指 overlay / 录制合成
  -> 导出视频
```

## ABC 职责边界

- A 语音：主时钟，TTS 真实时长决定后续时间线。
- B 时间：管 C 何时上台、何时可显式下台；默认 C 写完继续留场。
- C 板书：读 `boardSlice` 内容、站位、字号、宽度、速度等字段渲染。
- 金手指：overlay 人工补救层，只写覆盖层，不写 ABC base。

## 当前 C 文本主线

```text
boardSlice 普通多行原文
  -> 保留用户换行 \n
  -> 手写字体文本渲染
  -> 按字符 reveal
  -> DOM 预览 / Canvas 录制 / 未来 Konva 同源消费
```

旧 SVG/path/逐笔轨迹路线冻结备用，不作为当前主验收。

## 舞台样式边界

```text
src/styles.css
  -> 页面壳子 / 时间轴 / 面板 / 非舞台区域

src/stage.css
  -> 画布内元素专用样式
  -> 标签 / 题目 / C 板书 / 金手指 overlay / 舞台工具栏 / standalone 舞台壳子
```

- 画布是画布，其他是其他。
- 舞台内样式不得继续散落回 `src/styles.css`。
- `scripts/check-board-boundaries.mjs` 现在同时读取 `styles.css` 与 `stage.css`，并守门这条边界。

## 文档与连续性架构

```text
AGENTS.md
  -> 开工/收工协议

PROJECT_STATE.md
  -> 当前状态与下一步接力棒

ENGINEERING_LOG.md
  -> 每个工作单元的自包含记录

DECISIONS.md
  -> 影响施工顺序、真相层级、禁止项的重要决策

ARCHITECTURE.md
  -> 主流程、模块边界、数据流

KNOWN_ISSUES.md
  -> 已知坑、规避方式、状态

PROJECT_TREE.md
  -> 关键结构快照

CHANGE_TREE变更树.md
  -> 时间线式变更树与下一枝入口
```

## 维护规则

- 架构变更必须更新本文件。
- 只做局部修复但不改变架构时，在 `ENGINEERING_LOG.md` 和 `CHANGE_TREE变更树.md` 记录即可。
- 文档不能替代运行验证；每个工作单元必须写明验证命令和结果。

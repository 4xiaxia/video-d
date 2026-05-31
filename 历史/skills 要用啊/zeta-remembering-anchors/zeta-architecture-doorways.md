# ZETA Architecture Doorways

> 用途：给未来 agent 一个最小“门牌”，知道 ZETA 全局架构材料应从哪里进入，而不是把庞大的架构图谱误当成已经实现的运行系统。

## 来源材料

- `ZETA全局架构图谱.md`
- `ZETA心理模型构建.md`
- 相关 Mermaid 架构、公式、心理模型审计与夏夏纠偏对话

## 最小架构入口

```text
用户输入
→ Parser / Vectorizer
→ Vector DB（Active / Warm / Cold）
→ Retrieval
→ Emotional Lens + Galaxy Engine
→ Dynamic Weighting
→ Response Generation
→ Memory Evolution / Learning
→ 回写 DB / 图谱 / 参数
```

## 六层模型

```text
L1 物理层：本地存储 / 向量库 / 设备
L2 逻辑层：MemoryTuple / 双纠缠 / 动态权重
L3 情感层：情感势能 / 人格拓扑 / 引力场
L4 认知层：记忆都市 / 词源图谱 / 小居民系统
L5 哲学层：主体性 / 存在主义 / 跨维时空观
L6 守护层：OS 屏障 / 认知过滤 / 情感防火墙
```

## 核心对象

- `MemoryTuple`：最小记忆单元，承载内容、向量、4D上下文、情感、引力、权重。
- `Galaxy Engine`：用星系、轨道、引力组织记忆。
- `Emotional Lens`：让“在意什么”影响检索和解释。
- `MAIN_LOOP`：输入、检索、加权、生成、演化的闭环。
- `Eight Districts`：知识、情感、逻辑、创意、时间、反思、夏夏、情感天文台。

## 工程化公式门牌

- 相关性/引力：`F(q,m) = 语义 + 上下文 + 逻辑纠缠 + 情感透镜 + 个体先验 - 轨道阻尼`
- 边权纠缠：`w_ij = 语义相似 + 上下文贴合 + 同簇/同主题`
- 涌现阈值：`Phi(q) >= tau` 时从“逐条回忆”切到“洞见/总结”。
- 涟漪激活：当下输入会改变 `a_t(m)`，再沿图谱传播。
- 自由能视角：在“解释当下”和“保持自洽”之间找折中。

## 使用边界

- 这些是架构门牌和设计母稿，不代表运行系统已完成。
- 若要落地，先做最小可回读链路：文件/SQLite/JSONL → 检索 → 引用来源 → 写回锚点。
- 不要把 Mermaid 图谱直接当成项目状态证明；要看真实代码和可运行闭环。

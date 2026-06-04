---
记录时间: 2026-05-08
最新更新: 2026-06-04
性质: 当前真相文件 / C 手写字体支持范围
依据: 夏夏截图标注的当前 C 手写字体字符表；2026-06-04 LaTeX→Unicode 转换补全
---

# C 手写字体支持当前真相

当前选择的 C 手写字体支持的范围，不是“只支持汉字”。

从截图可见，它至少支持：

- 基础数字：`0-9`
- 基础英文大小写：`A-Z`、`a-z`
- 常用英文标点和符号：`! " # $ % & ' ( ) * + , - . / : ; < = > ? @ [ \ ] ^ _ { | } ~`
- 常用引号、括号、破折号、省略号等标点
- 一部分常用中文字符
- **（2026-06-04 补充）额外手写可渲染符号**：`√ ∈ ∅ → ← ↔ ⇒ ⊂ ⊃ ∪ ∩ ∀ ∃ ′ ″ ℃ ℉` — 通过 `HANDWRITING_EXTRA_SYMBOLS` 声明
- **（2026-06-04 补充）LaTeX→Unicode 自动转换**：`\le`→≤、`\ge`→≥、`\neq`→≠、`\approx`→≈、`\equiv`→≡、`\pi`→π、`\infty`→∞、`\sqrt`→√、`\in`→∈、`\notin`→∉、`\subset`→⊂、`\supset`→⊃、`\cup`→∪、`\cap`→∩、`\forall`→∀、`\exists`→∃、`\emptyset`→∅、`\to`/`\rightarrow`→→、`\leftarrow`→←、`\leftrightarrow`→↔、`\Rightarrow`→⇒、`\prime`→′、`\dprime`→″、`\degree`→°、`\sum`→∑、`\prod`→∏ — 通过 `normalizeElementaryBoardHandwritingText` 实现

## 对白板 C 的结论

- 简单数学表达可以走 C 手写字体路线，例如 `25×4=100`、`1200÷100=12`、`y=2x+1`。
- C 手写字体应支持基础数字、字母、简单算式符号和常见板书短文本。
- 不应把"数学函数/数字/字母不显示"默认归因成字体完全不支持；要先检查渲染链路、字符替换、数学公式组件、fallback 和 C 演员输入是否被错误分流。
- 复杂公式、分式、嵌套根号（如 `\sqrt{x+1}`）、上下标、矩阵等，仍需要走专门公式渲染或 SVG/图片 fallback，不能强塞进普通手写字体。简单根号符号 `√` 本身可走手写。
- **（2026-06-04）** 基础数学符号（≤≥≠≈≡∈∉⊂⊃∪∩∀∃∅→←↔⇒等）现在走 LaTeX→Unicode 转换后由手写字体渲染，不再被 `HANDWRITING_STRUCTURAL_MATH_PATTERN` 拦截分流到 formula。转换逻辑在 `normalizeElementaryBoardHandwritingText`，声明在 `HANDWRITING_EXTRA_SYMBOLS`。

## 后续检查口径

当 C 里出现数字、字母、简单符号不显示时，优先检查：

1. C 演员拿到的输入文本是不是被数学公式分流器改写。
2. 字符是否被 TTS / boardSlice / formula normalizer 过滤或替换。
3. `BoardTextSticker` / C 渲染层是否对 ASCII、符号或中文用了不同渲染路径。
4. 当前 font family / font url 是否真的加载到 C 贴片。
5. fallback 是否错误覆盖了手写字体。
6. **（2026-06-04 新增）** LaTeX 命令是否在 `normalizeElementaryBoardHandwritingText` 转换表内 — 若不在，需补全对应映射而非改走 formula 路线。

这条记录只管当前字体支持真相，不替代 `chainKey` 身份合同。

---
_2026-06-04 纠偏更新：补全 LaTeX→Unicode 转换范围和 HANDWRITING_EXTRA_SYMBOLS 声明，同步代码变更（mathBoardText.ts）。_

---
记录时间: 2026-05-08
最新更新: 2026-06-04
性质: 当前真相文件 / C 手写字体支持范围
依据: 夏夏截图标注 + mathBoardText.ts 代码实测去重（67唯一字符）
代码源头: src/modules/boardSticker/mathBoardText.ts
---

# C 手写字体支持当前真相

当前 C 手写字体支持的范围，不是"只支持汉字"。

## 一、字体原生支持范围

来源：`HANDWRITING_ASCII_SYMBOLS` + 基础字符范围

- 基础数字：`0-9`
- 基础英文大小写：`A-Z`、`a-z`
- ASCII 标点和符号：`` !"#$%&'()*+,-./:;<=>?@[\]^_`{|}~ ``
- Unicode 上标下标：¹²³⁰ⁱⁿ ₀₁₂₃₄₅₆₇₈₉ 等
- 希腊字母：Α-Ω α-ω
- CJK 统一汉字
- 空白字符

## 二、额外可渲染符号（67 个唯一字符）

来源：`HANDWRITING_EXTRA_SYMBOLS` 常量（2026-06-04 去重后）

### 中文标点（19）
（ ）【 】《 》〈 〉「 」『 』， 。！ ？； ：、 ＝

### 英文标点（6）
" " ' ' — …

### 数学符号（26）
≤ ≥ ≠ ≈ ∠ ∓ ∞ ∝ ⊥ ∥ ∵ ∴ √ ∈ ∅ ≡ ≣ ⋅ ∫ ∀ ∃ ⊂ ⊃ ∪ ∩

### 希腊字母（1）
π

### 度量/箭头/杂项（15）
· × ÷ ° ± △ → ← ↔ ⇒ ′ ″ ℃ ℉

## 三、LaTeX→Unicode 自动转换

来源：`normalizeElementaryBoardHandwritingText()` 函数

### 06-02 批（基础数学）
| LaTeX | → | Unicode | 说明 |
|-------|---|---------|------|
| `\times` | → | × | 乘号 |
| `\div` | → | ÷ | 除号 |
| `\cdot` | → | · | 点乘 |
| `\circ` | → | ° | 圈度 |
| `^{\\circ}` | → | ° | 上标度 |
| `\degree` | → | ° | 度 |
| `\angle` | → | ∠ | 角 |
| `\pm` | → | ± | 正负号 |
| `\mp` | → | ∓ | 负正号 |
| `\perp` | → | ⊥ | 垂直 |
| `\parallel` | → | ∥ | 平行 |
| `\triangle` | → | △ | 三角形 |
| `\odot` | → | ⊙ | 圆点 |
| `\therefore` | → | ∴ | 所以 |
| `\because` | → | ∵ | 因为 |
| `\propto` | → | ∝ | 正比 |

### 06-04 批（关系/集合/逻辑）
| LaTeX | → | Unicode | 说明 |
|-------|---|---------|------|
| `\le` / `\leq` | → | ≤ | 小于等于 |
| `\ge` / `\geq` | → | ≥ | 大于等于 |
| `\neq` / `\ne` | → | ≠ | 不等于 |
| `\approx` | → | ≈ | 约等于 |
| `\equiv` | → | ≡ | 恒等于 |
| `\pi` | → | π | 圆周率 |
| `\infty` | → | ∞ | 无穷 |
| `\sqrt{X}` | → | √X | 根号（简单内容） |
| `\sqrt` | → | √ | 根号（裸） |
| `\in` | → | ∈ | 属于 |
| `\notin` | → | ∉ | 不属于 |
| `\subset` | → | ⊂ | 子集 |
| `\supset` | → | ⊃ | 超集 |
| `\cup` | → | ∪ | 并集 |
| `\cap` | → | ∩ | 交集 |
| `\forall` | → | ∀ | 全称 |
| `\exists` | → | ∃ | 存在 |
| `\emptyset` | → | ∅ | 空集 |
| `\to` / `\rightarrow` | → | → | 右箭头 |
| `\leftarrow` | → | ← | 左箭头 |
| `\leftrightarrow` | → | ↔ | 双向箭头 |
| `\Rightarrow` | → | ⇒ | 推出 |
| `\prime` | → | ′ | 撇 |
| `\dprime` | → | ″ | 双撇 |
| `\sum` | → | ∑ | 求和 |
| `\prod` | → | ∏ | 连乘 |

## 四、对白板 C 的结论

- 简单数学表达走 C 手写字体路线，例如 `25×4=100`、`1200÷100=12`、`y=2x+1`。
- 不应把"数学函数/数字/字母不显示"默认归因成字体完全不支持；要先检查渲染链路和分流逻辑。
- 复杂公式、分式、嵌套根号（如 `\sqrt{x+1}`）、上下标、矩阵等，走 formula 渲染或 SVG/图片 fallback。简单根号符号 `√` 走手写。
- 基础数学符号走 LaTeX→Unicode 转换后由手写字体渲染，不被 `HANDWRITING_STRUCTURAL_MATH_PATTERN` 拦截。
- 分流入口：`resolveBoardTextDisplayRoute(text)` → 调用 `normalizeElementaryBoardHandwritingText` 先转换，再判断走 handwriting 还是 formula。

## 五、后续检查口径

当 C 里出现数字、字母、简单符号不显示时，优先检查：

1. C 演员输入文本是否被数学公式分流器改写。
2. 字符是否被 TTS / boardSlice / formula normalizer 过滤或替换。
3. `BoardTextSticker` / C 渲染层是否对不同字符类型用了不同渲染路径。
4. font family / font url 是否真的加载到 C 贴片。
5. fallback 是否错误覆盖了手写字体。
6. LaTeX 命令是否在转换表内 — 若不在，需补映射而非改走 formula。

---
_2026-05-08 初版。2026-06-04 压实：去重 EXTRA_SYMBOLS（71→67）、删重复 \\degree 替换、补全 06-02 批遗漏文档、按代码实测整理分类表。_

// @xiaxia-2026-06-08 字体字形覆盖守门
// 背景：路由白名单(HANDWRITING_EXTRA_SYMBOLS)只决定文本走手写路还是公式路，
//       从不保证字体文件里真有这个字形。同事曾把"白名单有×"误当成"字体支持×"，
//       删掉 ×→x 退化护栏，导致 × 进无字形的乔木体 → 静默回退 KaiTi → 屏幕花。
// 本脚本实测两个本地手写字体的 cmap，验证生产字体栈(乔木→落雁)能否真正渲染
//   板书数学符号；缺字形的符号必须列入"已知缺口"白名单(留给最后做特殊符号映射)。
// 详见 memory: board-font-glyph-vs-route-truth。
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const FONT_PRIMARY = join(root, 'src', 'ui', '平方乔木体.ttf');
const FONT_FALLBACK = join(root, 'src', 'ui', 'ChenYuluoyan-Thin-Monospaced.ttf');

// 生产板书常用数学符号；这些必须在 乔木 或 落雁 至少一个字体里有字形，否则回退 KaiTi 发花。
const REQUIRED_SYMBOLS = ['×', '÷', '√', '∠', '△', '±', '≠', '°', '·', '∵', '∴'];
// 已知缺口：乔木和落雁都没有的符号，留给"最后做特殊符号映射"那一刀处理，先不阻塞大局。
const KNOWN_GAP_SYMBOLS = ['≤', '≥', '≈', 'π'];

function readCmapCodepoints(fontPath) {
  const py = [
    'from fontTools.ttLib import TTFont',
    `f=TTFont(r"${fontPath}")`,
    'print(" ".join(str(cp) for cp in f.getBestCmap().keys()))',
  ].join('\n');
  const out = execFileSync('python', ['-c', py], { encoding: 'utf8' });
  return new Set(out.trim().split(/\s+/).map((n) => Number(n)));
}

function fail(message) {
  console.error(`[board-font-glyph-coverage] FAIL: ${message}`);
  process.exit(1);
}

for (const fontPath of [FONT_PRIMARY, FONT_FALLBACK]) {
  if (!existsSync(fontPath)) {
    fail(`本地字体缺失: ${fontPath}`);
  }
}

const primaryCmap = readCmapCodepoints(FONT_PRIMARY);
const fallbackCmap = readCmapCodepoints(FONT_FALLBACK);

const missing = [];
for (const symbol of REQUIRED_SYMBOLS) {
  const cp = symbol.codePointAt(0);
  const inStack = primaryCmap.has(cp) || fallbackCmap.has(cp);
  if (!inStack) {
    missing.push(symbol);
  }
}

if (missing.length > 0) {
  fail(
    `生产字体栈(乔木→落雁)缺少应支持的数学符号字形: ${missing.join(' ')}\n` +
      `这些符号会静默回退 KaiTi 导致板书发花。请把符号加进 fallback 字体或列入 KNOWN_GAP_SYMBOLS。`,
  );
}

// 同时核对：已知缺口符号确实在两个字体里都没有（防止 KNOWN_GAP 名单过期）。
const staleGaps = KNOWN_GAP_SYMBOLS.filter((symbol) => {
  const cp = symbol.codePointAt(0);
  return primaryCmap.has(cp) || fallbackCmap.has(cp);
});
if (staleGaps.length > 0) {
  console.warn(
    `[board-font-glyph-coverage] 提示: KNOWN_GAP 名单已过期，这些符号其实有字形了，可移出: ${staleGaps.join(' ')}`,
  );
}

console.log(
  `[board-font-glyph-coverage] passed — ${REQUIRED_SYMBOLS.length} 个必需符号字形齐备；` +
    `${KNOWN_GAP_SYMBOLS.length} 个已知缺口(${KNOWN_GAP_SYMBOLS.join(' ')})留给特殊符号映射。`,
);

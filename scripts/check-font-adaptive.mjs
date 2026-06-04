import { resolveBoardTextDisplayRoute } from '../src/modules/boardSticker/boardTextDisplayRoute.ts';
import { normalizeElementaryBoardHandwritingText, normalizeHandwritingDisplayText } from '../src/modules/boardSticker/mathBoardText.ts';

console.log('=== 字体自适应：×→x ÷→· ===\n');

const cases = [
  '3 \\\\times 4 = 12',
  '3 × 4 = 12',
  '6 \\\\div 2 = 3',
  '6 ÷ 2 = 3',
  '25×4=100',
  '1200÷100=12',
  'a + b = c',
  '\\\\frac{1}{2}',
];

for (const t of cases) {
  const r = resolveBoardTextDisplayRoute(t);
  console.log(
    t.replace(/\\\\/g, '\\').padEnd(24),
    '→', r.kind.padEnd(12),
    r.text
  );
}

console.log('\n=== normalizeElementaryBoardHandwritingText ===');
console.log('\\times →', normalizeElementaryBoardHandwritingText('3 \\times 4'));
console.log('\\div   →', normalizeElementaryBoardHandwritingText('6 \\div 2'));

console.log('\n=== normalizeHandwritingDisplayText ===');
console.log('3×4    →', normalizeHandwritingDisplayText('3×4'));
console.log('6÷2    →', normalizeHandwritingDisplayText('6÷2'));
console.log('a+b=c  →', normalizeHandwritingDisplayText('a+b=c'));

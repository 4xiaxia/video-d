// @ts-check
// Runtime verification: dedup + handwriting routing after 2026-06-04 cleanup
// Run: npx tsx scripts/verify-dedup-and-routing.mjs

import { resolveBoardTextDisplayRoute } from '../src/modules/boardSticker/boardTextDisplayRoute.ts';
import { isBoardTextSupportedByHandwritingFont, normalizeElementaryBoardHandwritingText, normalizeHandwritingDisplayText } from '../src/modules/boardSticker/mathBoardText.ts';
import { isBoardClipVisibleAtPlayhead } from '../src/modules/timeline/timelineWindow.ts';

let pass = 0;
let fail = 0;

function check(label, actual, expected) {
  const ok = actual === expected;
  if (ok) { pass++; } else { fail++; console.log('FAIL:', label, '→ got', JSON.stringify(actual), 'expected', JSON.stringify(expected)); }
  return ok;
}

// 1. normalizeElementaryBoardHandwritingText works for LaTeX→Unicode
check('\\le converts', normalizeElementaryBoardHandwritingText('a \\le b').includes('≤'), true);
check('\\times converts', normalizeElementaryBoardHandwritingText('3 \\times 4').includes('×'), true);
check('\\sqrt converts', normalizeElementaryBoardHandwritingText('\\sqrt{2}').includes('√'), true);

// 2. isBoardTextSupportedByHandwritingFont covers basics
check('3+5=8 supported', isBoardTextSupportedByHandwritingFont('3+5=8'), true);
check('4×3=12 supported', isBoardTextSupportedByHandwritingFont('4×3=12'), true);
check('π supported', isBoardTextSupportedByHandwritingFont('π'), true);
check('∠ supported', isBoardTextSupportedByHandwritingFont('∠ABC'), true);
check('\\frac NOT supported', isBoardTextSupportedByHandwritingFont('\\frac{1}{2}'), false);

// 2. Basic arithmetic → handwriting
check('3+5=8', resolveBoardTextDisplayRoute('3+5=8').kind, 'handwriting');
check('2-1=1', resolveBoardTextDisplayRoute('2-1=1').kind, 'handwriting');
check('4×3=12', resolveBoardTextDisplayRoute('4×3=12').kind, 'handwriting');
check('6÷2=3', resolveBoardTextDisplayRoute('6÷2=3').kind, 'handwriting');
check('a+b=c', resolveBoardTextDisplayRoute('a+b=c').kind, 'handwriting');
check('y=2x+1', resolveBoardTextDisplayRoute('y=2x+1').kind, 'handwriting');

// 3. LaTeX → Unicode conversion → handwriting
check('\\le', resolveBoardTextDisplayRoute('a \\le b').kind, 'handwriting');
check('\\ge', resolveBoardTextDisplayRoute('a \\ge b').kind, 'handwriting');
check('\\neq', resolveBoardTextDisplayRoute('a \\neq b').kind, 'handwriting');
check('\\approx', resolveBoardTextDisplayRoute('a \\approx b').kind, 'handwriting');
check('\\pi', resolveBoardTextDisplayRoute('\\pi r^2').kind, 'handwriting');
check('\\times', resolveBoardTextDisplayRoute('3 \\times 4').kind, 'handwriting');
check('\\div', resolveBoardTextDisplayRoute('6 \\div 2').kind, 'handwriting');
check('\\sqrt{2}', resolveBoardTextDisplayRoute('\\sqrt{2}').kind, 'handwriting');
check('\\infty', resolveBoardTextDisplayRoute('x \\to \\infty').kind, 'handwriting');

// 4. Font-adaptive symbol mapping
check('x-disp', normalizeHandwritingDisplayText('3×4'), '3x4');
check('div-disp', normalizeHandwritingDisplayText('6÷2'), '6·2');
check('noop-disp', normalizeHandwritingDisplayText('a+b=c'), 'a+b=c');

// 6. Structural math → formula
check('\\frac', resolveBoardTextDisplayRoute('\\frac{1}{2}').kind, 'formula');
check('subscript', resolveBoardTextDisplayRoute('x_{1} + y_{2}').kind, 'formula');
check('nested sup', resolveBoardTextDisplayRoute('a^{2} + b^{2}').kind, 'formula');

// 7. hideAtMs visibility contract
check('visible: before start', isBoardClipVisibleAtPlayhead(500, 1000), false);
check('visible: at start', isBoardClipVisibleAtPlayhead(1000, 1000), true);
check('visible: after start, no hideAtMs', isBoardClipVisibleAtPlayhead(5000, 1000), true);
check('visible: after start, before hideAtMs', isBoardClipVisibleAtPlayhead(3000, 1000, 5000), true);
check('visible: at hideAtMs', isBoardClipVisibleAtPlayhead(5000, 1000, 5000), false);
check('visible: after hideAtMs', isBoardClipVisibleAtPlayhead(6000, 1000, 5000), false);
check('visible: no hideAtMs = stay forever', isBoardClipVisibleAtPlayhead(999999, 1000), true);

console.log(`\n${pass}/${pass + fail} passed`);
if (fail > 0) process.exit(1);

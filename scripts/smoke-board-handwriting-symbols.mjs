// Smoke test: board handwriting symbol support
// Run: node scripts/smoke-board-handwriting-symbols.mjs

import { resolveBoardTextDisplayRoute } from '../src/modules/boardSticker/boardTextDisplayRoute.ts';
import { isBoardTextSupportedByHandwritingFont } from '../src/modules/boardSticker/mathBoardText.ts';

const cases = [
  // Pure Unicode — should go to handwriting
  ['3+5=8', 'handwriting'],
  ['a ≤ b', 'handwriting'],
  ['a ≥ b', 'handwriting'],
  ['a ≠ b', 'handwriting'],
  ['a ≈ b', 'handwriting'],
  ['πr²', 'handwriting'],
  ['∠ABC = 90°', 'handwriting'],
  ['3 ± 2', 'handwriting'],
  ['a ∥ b', 'handwriting'],
  ['a ⊥ b', 'handwriting'],
  ['x ∈ A', 'handwriting'],
  ['√2', 'handwriting'],
  ['A ⊂ B', 'handwriting'],
  ['A ∪ B', 'handwriting'],
  ['∀x', 'handwriting'],
  ['a → b', 'handwriting'],
  ['a ⇒ b', 'handwriting'],
  ['3 ÷ 5 = 0.6', 'handwriting'],
  ['2 × 3 = 6', 'handwriting'],
  ['△ABC', 'handwriting'],
  ['a ∝ b', 'handwriting'],
  ['∴', 'handwriting'],
  ['∵', 'handwriting'],
  // LaTeX input that should be converted to Unicode → handwriting
  ['$a \\le b$', 'handwriting'],
  ['$a \\ge b$', 'handwriting'],
  ['$a \\neq b$', 'handwriting'],
  ['$\\pi r^2$', 'handwriting'],
  ['$\\angle ABC$', 'handwriting'],
  ['$3 \\pm 2$', 'handwriting'],
  ['$3 \\times 5$', 'handwriting'],
  ['$6 \\div 2$', 'handwriting'],
  ['$x \\in A$', 'handwriting'],
  ['$A \\subset B$', 'handwriting'],
  ['$A \\cup B$', 'handwriting'],
  ['$\\forall x$', 'handwriting'],
  ['$a \\to b$', 'handwriting'],
  ['$\\sqrt{2}$', 'handwriting'],
  // Structural math — should stay formula
  ['$\\frac{1}{2}$', 'formula'],
  ['$x_{1} + y_{2}$', 'formula'],
];

let pass = 0, fail = 0;
for (const [text, expected] of cases) {
  const route = resolveBoardTextDisplayRoute(text);
  const ok = route.kind === expected;
  if (!ok) {
    console.log('FAIL:', JSON.stringify(text), '→', route.kind, '(expected', expected, ') route.text:', route.text);
    fail++;
  } else {
    pass++;
  }
}

console.log(`${pass}/${pass + fail} passed`);
if (fail > 0) process.exit(1);

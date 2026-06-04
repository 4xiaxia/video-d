import { resolveBoardTextDisplayRoute } from '../src/modules/boardSticker/boardTextDisplayRoute.ts';
import { isBoardTextSupportedByHandwritingFont } from '../src/modules/boardSticker/mathBoardText.ts';

const cases = ['3 \\times 4', '3 × 4', '25×4=100'];
for (const t of cases) {
  const r = resolveBoardTextDisplayRoute(t);
  const supported = isBoardTextSupportedByHandwritingFont(r.text);
  console.log(JSON.stringify(t), '→ kind:', r.kind, 'text:', JSON.stringify(r.text), 'supportedByFont:', supported);
}

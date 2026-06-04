import { splitScriptIntoTtsSentenceUnits } from '../src/modules/timeline-factory/splitScriptIntoTtsSentenceUnits.ts';

// New compileSpokenSegment: voiceText only, boardSlice in <b> markers, no extra punctuation
const scriptText = '同学们好。<br>先算小括号里的。<b>25x4=100</b><br>所以答案是<b>25x4=100</b>';

const result = splitScriptIntoTtsSentenceUnits(scriptText);

result.units.forEach((u, i) => {
  console.log(`Sent ${i}: speechText=${JSON.stringify(u.speechText)}`);
  console.log(`         board=${u.hasBoardMarker ? u.boardMarkerTexts : '(none)'}`);
});

const hasLeak = result.units.some(u => u.boardMarkerTexts?.some(m => u.speechText.includes(m)));
console.log(hasLeak ? '\nLEAK: boardSlice in speech!' : '\nOK: voice and board separated');

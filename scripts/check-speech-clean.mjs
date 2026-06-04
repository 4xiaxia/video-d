import { splitScriptIntoTtsSentenceUnits } from '../src/modules/timeline-factory/splitScriptIntoTtsSentenceUnits.ts';

const scriptText = '同学们好，今天我们来学习四则运算。<br>先算小括号里的，一共有 <b>25 x 4 = 100</b> 本练习册。<br>再算中括号外面的，<b>1200 / 100 = 12</b> 本。';

const result = splitScriptIntoTtsSentenceUnits(scriptText);

console.log('=== TTS text should NOT contain boardSlice ===\n');
result.units.forEach((unit, i) => {
  console.log(`Sent ${i}: speechText=${JSON.stringify(unit.speechText)}`);
  console.log(`        boardMarker=${unit.hasBoardMarker ? unit.boardMarkerTexts : '(none)'}`);
});

const hasBoardSliceInSpeech = result.units.some((unit) =>
  unit.boardMarkerTexts?.some((marker) => unit.speechText.includes(marker))
);
console.log(`\n${hasBoardSliceInSpeech ? 'FAIL: boardSlice still in speech!' : 'OK: boardSlice removed from speech'}`);
console.log(`markerCount=${result.markerCount}`);

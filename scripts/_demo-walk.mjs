// 陪走模式：拉起浏览器保持打开，夏夏操作，阿圆盯 store 每一步变化实时报告。
import { existsSync } from 'node:fs';
import { chromium } from 'playwright-core';
function resolveChromium(){return process.env.CLEANROOM_CHROMIUM_PATH||['C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe','C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'].find((p)=>existsSync(p))||'';}
const browser = await chromium.launch({ executablePath: resolveChromium(), headless: false });
const page = await browser.newPage({ viewport:{width:1500,height:1000} });
const errs=[]; page.on('console',m=>{if(m.type()==='error')errs.push(m.text().slice(0,140));});
page.on('pageerror',e=>errs.push('PAGEERR: '+e.message.slice(0,140)));

await page.goto('http://127.0.0.1:5196',{waitUntil:'domcontentloaded',timeout:30000});
await page.waitForTimeout(2000);
console.log('>>>>>> 夏夏，浏览器开好了，你操作，我盯着每一步变化 <<<<<<\n');

// 持续盯 store 关键状态，有变化就报告
let prev = '';
for(let i=0;i<150;i++){ // 盯约5分钟
  await page.waitForTimeout(2000);
  const s = await page.evaluate(()=>{
    const st=window.__TEACHING_EDITOR_STORE__?.getState?.();
    const all=[...(st?.project?.assets||[])];
    const d=st?.scriptAgentCandidateDraft;
    const tl=st?.project?.timeline;
    const f=(k)=>all.find(a=>a.kind===k);
    return {
      题文: f('problemText')?.status||'-',
      正式文稿: f('scriptText')?.status||'-',
      板书布局: f('boardLayout')?.status||'-',
      语音: f('voiceAudio')?.status||'-',
      时序json: f('voiceTiming')?.status||'-',
      候选rows: d?.rows?.length||0,
      时间轴clip: tl?.clips?.length||0,
      时长ms: tl?.durationMs||0,
      面板开: !!document.querySelector('.ant-modal-content'),
    };
  });
  const now = JSON.stringify(s);
  if(now!==prev){ console.log(`[${new Date().toLocaleTimeString()}]`, now); prev=now; }
}
console.log('\n=== 错误 ===', errs.length?errs.join('\n'):'(无)');
await new Promise(()=>{});

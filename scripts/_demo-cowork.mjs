// 配合模式：脚本输入题目+核对，让按钮变可点，然后浏览器停住，夏夏手动点「讲解生成」。
// 脚本在旁边盯 store，夏夏一点就读回 agent 产出。
import { existsSync } from 'node:fs';
import { chromium } from 'playwright-core';
function resolveChromium(){return process.env.CLEANROOM_CHROMIUM_PATH||['C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe','C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'].find((p)=>existsSync(p))||'';}
const PROBLEM = '计算：18÷(3+3)×2';
const browser = await chromium.launch({ executablePath: resolveChromium(), headless: false, slowMo: 200 });
const page = await browser.newPage({ viewport:{width:1500,height:1000} });
const errs=[]; page.on('console',m=>{if(m.type()==='error')errs.push(m.text().slice(0,160));});
page.on('pageerror',e=>errs.push('PAGEERR: '+e.message.slice(0,160)));

await page.goto('http://127.0.0.1:5196',{waitUntil:'domcontentloaded',timeout:30000});
await page.waitForTimeout(2500);

// 我来：修改→输入题目
const edit = page.getByRole('button',{name:'修改'});
if(await edit.count()){ await edit.first().click(); await page.waitForTimeout(500); }
let box = page.locator('textarea:visible').first();
if(!(await box.count())) box=page.locator('input[type="text"]:visible').first();
await box.click(); await box.fill(PROBLEM);
console.log('[阿圆] 已输入题目:', PROBLEM);
await page.waitForTimeout(500);

// 我来：核对题文，让「讲解生成」变可点
const confirm = page.getByRole('button',{name:'核对题文'});
if(await confirm.count()){ await confirm.first().click().catch(()=>{}); await page.waitForTimeout(1000); }
const ready = await page.evaluate(()=>{
  const b=Array.from(document.querySelectorAll('button')).find(x=>(x.textContent||'').trim()==='讲解生成');
  return { genDisabled:b?.disabled };
});
console.log(ready.genDisabled===false ? '[阿圆] ✅ 「讲解生成」已可点，请夏夏点它！' : '[阿圆] ⚠️ 按钮仍禁用: '+JSON.stringify(ready));

console.log('\n>>>>>> 夏夏，浏览器停住了，请你点「讲解生成」那个大按钮，我在这盯着结果 <<<<<<\n');

// 盯 store：夏夏一点，agent 出 rows 就报告
let lastRows=0;
for(let i=0;i<60;i++){ // 最多盯2分钟
  await page.waitForTimeout(2000);
  const s = await page.evaluate(()=>{
    const st=window.__TEACHING_EDITOR_STORE__?.getState?.();
    const d=st?.scriptAgentCandidateDraft;
    return { modal:!!document.querySelector('.ant-modal-content'), rows:d?.rows?.length||0, spoken:(d?.spokenScript||'').length, loading:/生成中|请稍候|处理中/.test(document.body.innerText) };
  });
  if(s.rows!==lastRows || s.loading){ console.log(`[盯 ${i}]`, JSON.stringify(s)); lastRows=s.rows; }
  if(s.rows>0){
    const rows = await page.evaluate(()=>{
      const d=window.__TEACHING_EDITOR_STORE__?.getState?.()?.scriptAgentCandidateDraft;
      return (d?.rows||[]).map(r=>({section:r.section, step:r.stepLabel, board:r.boardSlice, voice:(r.voiceText||'').slice(0,30)}));
    });
    console.log('\n✅✅ agent 生成成功！'+rows.length+'行切片：');
    console.log(JSON.stringify(rows,null,2));
    break;
  }
}
console.log('\n=== 控制台错误 ===', errs.length?errs.join('\n'):'(无)');
console.log('\n>>> 看完按 Ctrl+C，浏览器保持开着 <<<');
await new Promise(()=>{});

// 探针2：输入题目+核对后，「讲解生成」是否从禁用变可点。
import { existsSync } from 'node:fs';
import { chromium } from 'playwright-core';
function resolveChromium(){return process.env.CLEANROOM_CHROMIUM_PATH||['C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe','C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'].find((p)=>existsSync(p))||'';}
const browser = await chromium.launch({ executablePath: resolveChromium(), headless: false, slowMo: 200 });
const page = await browser.newPage({ viewport:{width:1500,height:1000} });
await page.goto('http://127.0.0.1:5196',{waitUntil:'domcontentloaded',timeout:30000});
await page.waitForTimeout(2500);

const probe = async (tag)=>{
  const r = await page.evaluate(()=>{
    const b = Array.from(document.querySelectorAll('button')).find(x=>(x.textContent||'').trim()==='讲解生成');
    const st = window.__TEACHING_EDITOR_STORE__?.getState?.();
    const pt = (st?.project?.assets||[]).find(a=>a.kind==='problemText');
    return { genDisabled: b?.disabled, ptStatus: pt?.status, ptLen:(pt?.summary||'').length };
  });
  console.log(`[${tag}]`, JSON.stringify(r));
  return r;
};
await probe('打开时');

// 修改→输入
const edit = page.getByRole('button',{name:'修改'});
if(await edit.count()){ await edit.first().click(); await page.waitForTimeout(500); }
let box = page.locator('textarea:visible').first();
if(!(await box.count())) box=page.locator('input[type="text"]:visible').first();
await box.click(); await box.fill('计算：18÷(3+3)×2');
await page.waitForTimeout(500);
await probe('输入后');

// 核对题文
const confirm = page.getByRole('button',{name:'核对题文'});
if(await confirm.count()){ await confirm.first().click().catch(()=>{}); await page.waitForTimeout(1000); }
const after = await probe('核对后');

console.log(after.genDisabled===false ? '\n✅ 「讲解生成」已可点，流程通' : '\n❌ 「讲解生成」仍禁用，是bug');
await page.waitForTimeout(1500);
await browser.close();

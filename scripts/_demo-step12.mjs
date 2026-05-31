// DEMO走通·第1-2环：输入题目 -> 确认 -> 讲解生成 -> 验证题文贯穿 -> 等agent产出。
import { existsSync } from 'node:fs';
import { chromium } from 'playwright-core';
function resolveChromium() {
  if (process.env.CLEANROOM_CHROMIUM_PATH) return process.env.CLEANROOM_CHROMIUM_PATH;
  return ['C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe','C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'].find((p)=>existsSync(p))||'';
}
const PROBLEM = '计算：18÷(3+3)×2';
const browser = await chromium.launch({ executablePath: resolveChromium(), headless: false, slowMo: 200 });
const page = await browser.newPage({ viewport: { width: 1500, height: 1000 } });
const errs = [];
page.on('console', (m)=>{ if(m.type()==='error') errs.push(m.text().slice(0,160)); });
page.on('pageerror', (e)=>errs.push('PAGEERR: '+e.message.slice(0,160)));

await page.goto('http://127.0.0.1:5196', { waitUntil:'domcontentloaded', timeout:30000 });
await page.waitForTimeout(2500);

// 环1：输入题目
const edit = page.getByRole('button', { name: '修改' });
if (await edit.count()) { await edit.first().click(); await page.waitForTimeout(500); }
let box = page.locator('textarea:visible').first();
if (!(await box.count())) box = page.locator('input[type="text"]:visible').first();
await box.click(); await box.fill(PROBLEM);
console.log('[环1] 已输入题目:', PROBLEM);
await page.waitForTimeout(500);

// 环1.5：核对题文（让 problemText 状态变 ready）
const confirm = page.getByRole('button', { name: '核对题文' });
if (await confirm.count()) { await confirm.first().click().catch(()=>{}); await page.waitForTimeout(800); }

// 验证：题文是否真的确认到 store（problemText status=ready）
const confirmed = await page.evaluate(()=>{
  const st = window.__TEACHING_EDITOR_STORE__?.getState?.();
  const pt = (st?.project?.assets||[]).find((a)=>a.kind==='problemText');
  return { status: pt?.status, summary: (pt?.summary||'').slice(0,40) };
});
console.log('[验证] 题文确认状态:', JSON.stringify(confirmed));

// 环2：讲解生成
const gen = page.getByRole('button', { name: '讲解生成' });
await gen.first().click();
console.log('[环2] 点了讲解生成，等 agent...');

// 轮询：面板开 + agent 产出 rows
let ok = false;
for (let i=0;i<25;i++){
  await page.waitForTimeout(2000);
  const s = await page.evaluate(()=>{
    const st = window.__TEACHING_EDITOR_STORE__?.getState?.();
    const draft = st?.scriptAgentCandidateDraft;
    const modal = document.querySelector('.ant-modal-content');
    const body = document.body.innerText;
    return {
      modalOpen: !!modal,
      draftRows: draft?.rows?.length||0,
      spoken: (draft?.spokenScript||'').length,
      loading: /生成中|请稍候|处理中/.test(body),
      err: /失败|错误|超时|未配置|api/i.test(body),
    };
  });
  console.log(`[poll ${i}]`, JSON.stringify(s));
  if (s.draftRows>0) { ok=true; console.log('>>> ✅ agent 生成了', s.draftRows, '行切片'); break; }
  if (s.err && !s.loading) { console.log('>>> ❌ 页面报错'); break; }
}
console.log('=== 控制台错误 ===', errs.length?errs.join('\n'):'(无)');
console.log(ok ? '\n✅ 环1-2 走通：题目→生成 OK' : '\n⚠️ 未拿到产出，需查');
await page.waitForTimeout(2000);
await browser.close();

// 探针：精确定位「核对题文」「讲解生成」按钮，看点的是哪个。
import { existsSync } from 'node:fs';
import { chromium } from 'playwright-core';
function resolveChromium(){return process.env.CLEANROOM_CHROMIUM_PATH||['C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe','C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'].find((p)=>existsSync(p))||'';}
const browser = await chromium.launch({ executablePath: resolveChromium(), headless: true });
const page = await browser.newPage({ viewport:{width:1500,height:1000} });
await page.goto('http://127.0.0.1:5196',{waitUntil:'domcontentloaded',timeout:30000});
await page.waitForTimeout(2500);
const r = await page.evaluate(()=>{
  const findBtns = (name)=>Array.from(document.querySelectorAll('button')).filter(b=>(b.textContent||'').trim().includes(name)).map(b=>{
    const rect=b.getBoundingClientRect();
    // 找最近的祖先区域标识
    let cls=''; let p=b; for(let i=0;i<5&&p;i++){ if(p.className&&typeof p.className==='string'){cls=p.className.slice(0,50); break;} p=p.parentElement; }
    return { text:(b.textContent||'').trim().slice(0,20), disabled:b.disabled, x:Math.round(rect.x), y:Math.round(rect.y), w:Math.round(rect.width), ancestorClass:cls };
  });
  return { 核对题文: findBtns('核对题文'), 讲解生成: findBtns('讲解生成') };
});
console.log(JSON.stringify(r,null,2));
await browser.close();

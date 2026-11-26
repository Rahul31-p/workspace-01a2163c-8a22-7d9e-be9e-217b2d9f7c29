import { chromium } from 'playwright'
const base='http://localhost:5173'
const routes=['/dashboard','/inventory','/add-stock','/sales','/stores','/transfers','/reports','/team','/settings','/help']
const viewports=[[1920,1080],[1440,900],[1024,768],[768,1024],[390,844],[360,800]]
const browser=await chromium.launch()
for(const [w,h] of viewports){
  const ctx=await browser.newContext({viewport:{width:w,height:h}})
  const page=await ctx.newPage()
  const errs=[]
  page.on('console',m=>{if(m.type()==='error')errs.push(m.text())})
  page.on('pageerror',e=>errs.push('PAGE: '+e.message))
  let overflow=[]
  for(const r of routes){
    await page.goto(base+r,{waitUntil:'networkidle'})
    await page.waitForTimeout(80)
    const o=await page.evaluate(()=>({sw:document.documentElement.scrollWidth,iw:window.innerWidth}))
    if(o.sw>o.iw+1) overflow.push(`${r}:${o.sw}/${o.iw}`)
  }
  console.log(`${w}x${h} overflow=${overflow.join(',')||'none'} errors=${errs.length?JSON.stringify([...new Set(errs)].slice(0,3)):'none'}`)
  await ctx.close()
}
await browser.close()

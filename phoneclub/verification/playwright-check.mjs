import { chromium } from 'playwright'

const base = 'http://localhost:5173'
const browser = await chromium.launch({ headless: true })
const errors = []

const desktop = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
desktop.on('console', (message) => {
  if (message.type() === 'error') errors.push(message.text())
})
desktop.on('pageerror', (error) => errors.push(error.message))

await desktop.goto(`${base}/dashboard`, { waitUntil: 'networkidle' })
await desktop.screenshot({ path: 'verification/dashboard-desktop.png', fullPage: true })

const kpiGrid = desktop.locator('main .grid').first()
console.log('Undefined labels in dashboard:', (await desktop.locator('main').innerText()).includes('undefined'))
console.log('DESKTOP KPIs (all stores):')
console.log((await kpiGrid.innerText()).replace(/\n+/g, ' | '))

const storeTrigger = desktop.locator('[aria-label="Select store"]:visible')
await storeTrigger.click()
await desktop.getByRole('option', { name: 'Saket' }).click()
await desktop.waitForTimeout(250)

console.log('DESKTOP KPIs (Saket):')
console.log((await kpiGrid.innerText()).replace(/\n+/g, ' | '))
console.log('Selected store label:', await storeTrigger.innerText())

await desktop.getByRole('link', { name: 'Mobile Inventory' }).click()
await desktop.waitForTimeout(200)
console.log('Navigation URL:', desktop.url())
console.log('Navigation heading:', await desktop.locator('h1').innerText())

await desktop.goto(`${base}/dashboard`, { waitUntil: 'networkidle' })
await desktop.getByRole('tab', { name: 'Sold' }).click()
await desktop.waitForTimeout(150)
console.log('Sold tab rows:', await desktop.locator('tbody tr').count())
console.log('Sold tab first row:', (await desktop.locator('tbody tr').first().innerText()).replace(/\n+/g, ' | '))

const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })
mobile.on('pageerror', (error) => errors.push(`mobile: ${error.message}`))
await mobile.goto(`${base}/dashboard`, { waitUntil: 'networkidle' })
await mobile.screenshot({ path: 'verification/dashboard-mobile.png', fullPage: true })
await mobile.getByLabel('Open navigation').click()
await mobile.waitForTimeout(200)
console.log('Mobile drawer visible:', await mobile.getByRole('dialog').isVisible())
await mobile.getByRole('link', { name: 'Reports & Analytics' }).click()
console.log('Mobile nav URL:', mobile.url())

console.log('Console/page errors:', errors.length ? errors : 'none')
await browser.close()

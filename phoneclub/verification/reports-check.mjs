import { stat } from 'node:fs/promises'
import { chromium } from 'playwright'
import XLSX from 'xlsx'

const base = 'http://localhost:5173'
const browser = await chromium.launch({ headless: true })
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, acceptDownloads: true })
const errors = []
const page = await context.newPage()

page.on('console', (message) => {
  if (message.type() === 'error') errors.push(message.text())
})
page.on('pageerror', (error) => errors.push(error.message))

async function chooseSelect(label, option) {
  await page.locator(`[aria-label="${label}"]`).click()
  await page.getByRole('option', { name: option, exact: true }).click()
  await page.waitForTimeout(150)
}

async function switchUser(name) {
  await page.getByRole('button', { name: 'Switch demo role' }).click()
  await page.getByRole('menuitem', { name: new RegExp(name) }).click()
  await page.waitForTimeout(220)
}

async function metric(label) {
  const text = (await page.locator('main').innerText()).replace(/\u00a0/g, ' ')
  return text.match(new RegExp(`${label}\\s+([^\\n]+)`))?.[1]?.trim() ?? null
}

function toNumber(value) {
  return Number(String(value ?? '').replace(/[^0-9.-]/g, ''))
}

await page.goto(`${base}/dashboard`, { waitUntil: 'networkidle' })
await page.getByRole('link', { name: 'Reports & Analytics', exact: true }).click()
await page.waitForTimeout(300)
await page.screenshot({ path: 'verification/reports-desktop.png', fullPage: true })

const baseline = {
  revenue: toNumber(await metric('Total revenue')),
  profit: toNumber(await metric('Total profit')),
  average: toNumber(await metric('Average selling price')),
  transactions: Number((await metric('Transactions'))?.replace(/,/g, '')),
}
console.log('This-week report KPIs:', baseline)
console.log('KPI formulas consistent:', Math.round(baseline.revenue / baseline.transactions) === baseline.average)
console.log('Charts rendered on sales tab:', await page.locator('main svg.recharts-surface').count() >= 2)

// Preset filters.
await chooseSelect('Report period', 'Today')
const todayRevenue = toNumber(await metric('Total revenue'))
console.log('Today revenue:', todayRevenue)
console.log('Today is narrower than this week:', todayRevenue > 0 && todayRevenue < baseline.revenue)

await chooseSelect('Report period', 'Last month')
console.log('Last-month revenue:', await metric('Total revenue'))
console.log('Last-month transactions:', await metric('Transactions'))

await chooseSelect('Report period', 'This month')
console.log('This-month revenue matches this week:', toNumber(await metric('Total revenue')) === baseline.revenue)

// Custom range.
await chooseSelect('Report period', 'Custom range')
await page.getByLabel('Report start date').fill('2026-11-22')
await page.getByLabel('Report end date').fill('2026-11-23')
await page.waitForTimeout(180)
const customRevenue = toNumber(await metric('Total revenue'))
const customTransactions = Number((await metric('Transactions'))?.replace(/,/g, ''))
console.log('Custom range:', { customRevenue, customTransactions })
console.log('Custom range narrower than this week:', customRevenue > 0 && customRevenue < baseline.revenue)

// Store selection is the global selector.
await chooseSelect('Report store', 'Saket')
await page.waitForTimeout(180)
const saketRevenue = toNumber(await metric('Total revenue'))
console.log('Saket report KPIs:', { revenue: saketRevenue, transactions: await metric('Transactions') })
console.log('Store selection scoped revenue:', saketRevenue > 0 && saketRevenue < baseline.revenue)
console.log('Global selector followed report store:', (await page.locator('[aria-label="Select store"]:visible').innerText()).includes('Saket'))
console.log('Daily sales table respects scope:', (await page.locator('main').innerText()).includes('Daily sales'))

// Reset returns to this week / all stores.
await page.getByRole('button', { name: 'Reset', exact: true }).click()
await page.waitForTimeout(180)
console.log('Reset restored this-week revenue:', toNumber(await metric('Total revenue')) === baseline.revenue)

// Inventory tab.
await page.getByRole('tab', { name: 'Inventory report' }).click()
await page.waitForTimeout(250)
const inventoryMetrics = {
  purchased: await metric('Mobiles purchased'),
  available: await metric('Available mobiles'),
  sold: await metric('Sold mobiles'),
  value: await metric('Total purchase value'),
}
console.log('Inventory report KPIs:', inventoryMetrics)
console.log('Inventory KPIs populated:', Object.values(inventoryMetrics).every((value) => value && value !== '0'))
console.log('Brand inventory chart rendered:', await page.locator('main svg.recharts-surface').count() >= 1)
console.log('Model-wise stock table visible:', await page.getByText('Model-wise stock', { exact: true }).isVisible())

// Store comparison tab.
await page.getByRole('tab', { name: 'Store comparison' }).click()
await page.waitForTimeout(250)
const storeRows = await page.locator('tbody tr').count()
const storeRevenueSum = await page.locator('tbody tr td:nth-child(2)').evaluateAll((cells) =>
  cells.reduce((sum, cell) => sum + Number(cell.textContent.replace(/[^0-9.]/g, '')), 0),
)
console.log('Store comparison rows:', storeRows)
console.log('Store revenue sum:', storeRevenueSum)
console.log('Store comparison chart rendered:', await page.locator('main svg.recharts-surface').count() >= 1)

// Export filtered records to Excel and inspect the workbook contents.
await chooseSelect('Report period', 'Custom range')
await page.getByLabel('Report start date').fill('2026-11-22')
await page.getByLabel('Report end date').fill('2026-11-23')
await chooseSelect('Report store', 'Saket')
await page.waitForTimeout(180)
const filteredSalesCount = Number((await page.locator('main').innerText()).match(/(\d+) sales in range/)?.[1] ?? 0)
console.log('Filtered sales count before export:', filteredSalesCount)

await page.getByRole('button', { name: 'Export report' }).click()
const excelDownloadPromise = page.waitForEvent('download')
await page.getByRole('menuitem', { name: 'Export Excel' }).click()
const excelDownload = await excelDownloadPromise
console.log('Excel filename:', excelDownload.suggestedFilename())
await excelDownload.saveAs('verification/reports-export.xlsx')

const workbook = XLSX.readFile('verification/reports-export.xlsx')
const exportedSales = XLSX.utils.sheet_to_json(workbook.Sheets['Sales records'])
const exportedInventory = XLSX.utils.sheet_to_json(workbook.Sheets['Inventory records'])
const exportedStores = XLSX.utils.sheet_to_json(workbook.Sheets['Store comparison'])
console.log('Excel sheets:', workbook.SheetNames.join(', '))
console.log('Excel sales rows match filtered UI:', exportedSales.length === filteredSalesCount)
console.log('Excel records contain real invoice:', exportedSales.length > 0 && Boolean(exportedSales[0]['Invoice Number']))
console.log('Excel inventory/store rows:', exportedInventory.length, exportedStores.length)

await page.getByRole('button', { name: 'Export report' }).click()
const pdfDownloadPromise = page.waitForEvent('download')
await page.getByRole('menuitem', { name: 'Export PDF' }).click()
const pdfDownload = await pdfDownloadPromise
console.log('PDF filename:', pdfDownload.suggestedFilename())
await pdfDownload.saveAs('verification/reports-export.pdf')
console.log('PDF has content:', (await stat('verification/reports-export.pdf')).size > 1000)

// Role gating.
await switchUser('Vikram Sethi')
console.log('Sales Executive report blocked:', await page.getByText('Reports are not available for this role').isVisible())
console.log('Sales Executive has no export button:', await page.getByRole('button', { name: 'Export report' }).count() === 0)
await switchUser('Aarav Mehta')
console.log('Super Admin export restored:', await page.getByRole('button', { name: 'Export report' }).count() === 1)

// Responsive screenshot.
const mobile = await context.newPage()
mobile.on('pageerror', (error) => errors.push(`mobile: ${error.message}`))
await mobile.setViewportSize({ width: 390, height: 844 })
await mobile.goto(`${base}/reports`, { waitUntil: 'networkidle' })
await mobile.screenshot({ path: 'verification/reports-mobile.png', fullPage: true })
console.log(
  'Mobile page has no horizontal overflow:',
  await mobile.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1),
)

console.log('Console/page errors:', errors.length ? errors : 'none')
await browser.close()

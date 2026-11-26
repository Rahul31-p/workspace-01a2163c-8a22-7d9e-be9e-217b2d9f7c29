import { chromium } from 'playwright'

const base = 'http://localhost:5173'
const browser = await chromium.launch({ headless: true })
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, acceptDownloads: true })
const errors = []
const page = await context.newPage()

page.on('console', (message) => {
  if (message.type() === 'error') errors.push(message.text())
})
page.on('pageerror', (error) => errors.push(error.message))

const row = (index = 0) => page.locator('tbody tr').nth(index)
const cell = (index, nth) => row(index).locator('td').nth(nth)

async function chooseSelect(label, option) {
  await page.locator(`[aria-label="${label}"]`).click()
  await page.getByRole('option', { name: option, exact: true }).click()
  await page.waitForTimeout(120)
}

async function selectGlobalStore(name) {
  const trigger = page.locator('[aria-label="Select store"]:visible')
  await trigger.click()
  await page.getByRole('option', { name, exact: true }).click()
  await page.waitForTimeout(180)
}

function toNumber(value) {
  return Number(String(value ?? '').replace(/[^0-9.-]/g, ''))
}

async function mainText() {
  return (await page.locator('main').innerText()).replace(/\u00a0/g, ' ')
}

async function metric(label) {
  const match = (await mainText()).match(new RegExp(`${label}\\s+([^\\n]+)`))
  return match?.[1]?.trim() ?? null
}

async function rowAction(name, index = 0) {
  await row(index).locator('[aria-label="Device actions"]').click()
  await page.getByRole('menuitem', { name }).click()
  await page.waitForTimeout(150)
}

// Dashboard baseline (shared in-memory state).
await page.goto(`${base}/dashboard`, { waitUntil: 'networkidle' })
const dashboardBefore = {
  inventory: await metric('Total Inventory'),
  available: await metric('Available Stock'),
  sold: await metric('Units Sold'),
  revenue: await metric('Total Sales Revenue'),
}
console.log('Dashboard before:', dashboardBefore)

// Open Sales Management through the real sidebar link so state is preserved.
await page.getByRole('link', { name: 'Sales Management', exact: true }).click()
await page.waitForTimeout(250)
await page.screenshot({ path: 'verification/sales-desktop.png', fullPage: true })

const overviewLabels = [
  'Total transactions',
  'Total revenue',
  'Total gross profit',
  'Average selling price',
  'Mobiles sold',
]
for (const label of overviewLabels) {
  console.log(`Overview has ${label}:`, await page.getByText(label, { exact: true }).isVisible())
}

const salesBefore = {
  transactions: Number((await metric('Total transactions'))?.replace(/,/g, '')),
  revenue: toNumber(await metric('Total revenue')),
  profit: toNumber(await metric('Total gross profit')),
  sold: Number((await metric('Mobiles sold'))?.replace(/,/g, '')),
}
console.log('Sales overview before:', salesBefore)

const requiredColumns = [
  'Invoice Number',
  'Mobile Model',
  'IMEI',
  'Store',
  'Sale Date',
  'Selling Price',
  'Payment Method',
  'Profit',
]
console.log(
  'History columns present:',
  requiredColumns.every((column) => page.locator('thead').getByText(column, { exact: true }).isVisible()),
)

// Store selector scopes the sales overview and description.
await selectGlobalStore('Saket')
const saketTransactions = Number((await metric('Total transactions'))?.replace(/,/g, ''))
console.log('Saket transactions < all stores:', saketTransactions < salesBefore.transactions)
console.log('Sales page description scoped to Saket:', (await mainText()).includes('for Saket.'))
await selectGlobalStore('All Stores')

// Deep-link from an inventory row into the detailed sales form.
await page.getByRole('link', { name: 'Mobile Inventory', exact: true }).click()
await page.waitForTimeout(200)
await chooseSelect('Filter by stock status', 'In Stock')
const imeiToSell = (await cell(0, 4).innerText()).trim()
console.log('Selected in-stock IMEI:', imeiToSell)
await rowAction('Record sale')
await page.getByRole('link', { name: 'Use detailed sales form' }).click()
await page.waitForTimeout(250)
console.log('Deep link reached sales form:', page.url().includes(`/sales?imei=${imeiToSell}`))
console.log('Mobile details prefilled:', (await mainText()).includes('Selected mobile'))
console.log('IMEI prefilled in search:', (await page.getByLabel('Search IMEI').inputValue()) === imeiToSell)

const purchaseText = (await mainText()).match(/PURCHASE PRICE\s+([^\n]+)/)?.[1]
const purchasePrice = toNumber(purchaseText)
const sellingPrice = purchasePrice + 5000
console.log('Purchase price from selected mobile:', purchasePrice)

await page.locator('[aria-label="Payment Method"]').click()
const paymentOptions = (await page.getByRole('option').allInnerTexts()).map((option) => option.trim())
console.log('Payment methods available:', ['Cash', 'UPI', 'Card', 'Bank Transfer'].every((method) => paymentOptions.includes(method)))
await page.getByRole('option', { name: 'UPI', exact: true }).click()
await page.waitForTimeout(120)
await page.getByLabel('Selling Price').fill(String(sellingPrice))
await page.getByLabel('Customer Name').fill('Phase Five Buyer')
await page.getByLabel('Customer Phone').fill('9876543210')
await page.getByLabel('Sale Notes').fill('Phase 5 browser verification')
await page.waitForTimeout(120)

const calculationText = (await mainText()).split('Automatic calculation')[1] ?? ''
const displayedProfit = toNumber(calculationText.match(/GROSS PROFIT\s+([^\n]+)/i)?.[1])
const displayedMargin = Number(calculationText.match(/PROFIT MARGIN\s+([\d.]+)%/i)?.[1])
console.log('Automatic profit correct:', displayedProfit === sellingPrice - purchasePrice)
console.log('Automatic margin correct:', displayedMargin === Number((((sellingPrice - purchasePrice) / sellingPrice) * 100).toFixed(1)))
await page.screenshot({ path: 'verification/sales-record-sale.png', fullPage: true })

await page.getByRole('button', { name: 'Confirm sale' }).click()
await page.waitForTimeout(300)
console.log('Sale success toast:', await page.getByText('Sale recorded successfully', { exact: true }).first().isVisible())
console.log('History shortcut in toast:', await page.getByRole('link', { name: 'View history' }).isVisible())

const toastDescription = await page.getByText(/marked as Sold/).first().innerText()
const invoice = toastDescription.match(/INV-\d+(?:-\d+)?/)?.[0]
console.log('Invoice generated:', invoice)
console.log('Toast description contains invoice:', Boolean(invoice && toastDescription.includes(invoice)))

// Sales history search and required row data.
await page.getByLabel('Search sales').fill(invoice)
await page.waitForTimeout(180)
console.log('Invoice search result rows:', await page.locator('tbody tr').count())
const saleRowText = (await cell(0, 0).innerText()) + ' ' + (await row(0).innerText())
const expectedParts = [invoice, imeiToSell, 'UPI', '2026-11-25', `₹${sellingPrice.toLocaleString('en-IN')}`]
console.log('Sale row text:', saleRowText.replace(/\s+/g, ' ').slice(0, 260))
console.log(
  'Sale row has required details:',
  expectedParts.every((part) => saleRowText.includes(part)),
  expectedParts.map((part) => saleRowText.includes(part)),
)
console.log('Sale row profit shown:', /₹[\d,]+/.test(await cell(0, 7).innerText()))

// Sold status and dashboard synchronization.
await page.getByRole('link', { name: 'Mobile Inventory', exact: true }).click()
await page.waitForTimeout(180)
await page.getByLabel('Search inventory').fill(imeiToSell)
await page.waitForTimeout(180)
console.log('Inventory status after sale:', (await cell(0, 10).innerText()).trim())
console.log('Device row retained once:', await page.locator('tbody tr').count())

await page.getByRole('link', { name: 'Dashboard', exact: true }).click()
await page.waitForTimeout(180)
const dashboardAfter = {
  inventory: await metric('Total Inventory'),
  available: await metric('Available Stock'),
  sold: await metric('Units Sold'),
  revenue: await metric('Total Sales Revenue'),
}
console.log('Dashboard after:', dashboardAfter)
console.log('Inventory count unchanged:', dashboardAfter.inventory === dashboardBefore.inventory)
console.log('Available stock decreased:', toNumber(dashboardAfter.available) === toNumber(dashboardBefore.available) - 1)
console.log('Units sold increased:', toNumber(dashboardAfter.sold) === toNumber(dashboardBefore.sold) + 1)
console.log('Revenue increased by selling price:', toNumber(dashboardAfter.revenue) === toNumber(dashboardBefore.revenue) + sellingPrice)

// Sold device cannot be sold again.
await page.getByRole('link', { name: 'Sales Management', exact: true }).click()
await page.waitForTimeout(180)
await page.getByLabel('Search IMEI').fill(imeiToSell)
await page.getByRole('button', { name: 'Find mobile' }).click()
await page.waitForTimeout(120)
await page.getByRole('button', { name: new RegExp(imeiToSell) }).first().click()
await page.waitForTimeout(120)
console.log('Resale warning shown:', await page.getByText(/already sold and cannot be sold again/).isVisible())
console.log('Confirm sale disabled for sold device:', await page.getByRole('button', { name: 'Confirm sale' }).isDisabled())

// Filters.
await page.getByLabel('Search sales').fill('')
await chooseSelect('Payment method filter', 'UPI')
console.log('Payment method filter row count:', await page.locator('tbody tr').count())
console.log('Payment method filter applied:', (await cell(0, 6).innerText()).trim() === 'UPI')
await chooseSelect('Profit filter', 'Profitable')
console.log('Profitable filter rows:', await page.locator('tbody tr').count())
await page.getByLabel('Sale date from').fill('2026-11-25')
await page.getByLabel('Sale date to').fill('2026-11-25')
await page.waitForTimeout(120)
const filteredDates = await page.locator('tbody tr td:nth-child(5)').allInnerTexts()
console.log('Date filters applied:', filteredDates.length > 0 && filteredDates.every((date) => date.trim() === '2026-11-25'))
await page.getByRole('button', { name: 'Reset', exact: true }).click()
await page.waitForTimeout(120)
console.log('Reset restored full history:', (await page.getByLabel('Search sales').inputValue()) === '')

// Exports.
await page.getByRole('button', { name: 'Export' }).click()
const excelDownload = page.waitForEvent('download')
await page.getByRole('menuitem', { name: 'Export Excel' }).click()
console.log('Excel export filename:', (await excelDownload).suggestedFilename())

await page.getByRole('button', { name: 'Export' }).click()
const pdfDownload = page.waitForEvent('download')
await page.getByRole('menuitem', { name: 'Export PDF' }).click()
console.log('PDF export filename:', (await pdfDownload).suggestedFilename())

// Updated overview after the sale.
const salesAfter = {
  transactions: Number((await metric('Total transactions'))?.replace(/,/g, '')),
  revenue: toNumber(await metric('Total revenue')),
  profit: toNumber(await metric('Total gross profit')),
  sold: Number((await metric('Mobiles sold'))?.replace(/,/g, '')),
}
console.log('Sales overview after:', salesAfter)
console.log('Overview transactions increased:', salesAfter.transactions === salesBefore.transactions + 1)
console.log('Overview revenue increased:', salesAfter.revenue === salesBefore.revenue + sellingPrice)
console.log('Overview profit increased:', salesAfter.profit === salesBefore.profit + (sellingPrice - purchasePrice))
console.log('Overview mobiles sold increased:', salesAfter.sold === salesBefore.sold + 1)

// Responsive check.
const mobile = await context.newPage()
mobile.on('pageerror', (error) => errors.push(`mobile: ${error.message}`))
await mobile.setViewportSize({ width: 390, height: 844 })
await mobile.goto(`${base}/sales`, { waitUntil: 'networkidle' })
await mobile.screenshot({ path: 'verification/sales-mobile.png', fullPage: true })
console.log(
  'Mobile page has no horizontal overflow:',
  await mobile.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1),
)

console.log('Console/page errors:', errors.length ? errors : 'none')
await browser.close()

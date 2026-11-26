import { chromium } from 'playwright'

const base = 'http://localhost:5173'
const browser = await chromium.launch({ headless: true })
const errors = []

const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
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

async function search(value) {
  await page.getByLabel('Search inventory').fill(value)
  await page.waitForTimeout(150)
}

async function rowAction(name, index = 0) {
  await row(index).locator('[aria-label="Device actions"]').click()
  await page.getByRole('menuitem', { name }).click()
  await page.waitForTimeout(150)
}

async function closeDialog() {
  await page.keyboard.press('Escape')
  await page.waitForTimeout(150)
}

await page.goto(`${base}/inventory`, { waitUntil: 'networkidle' })
await page.screenshot({ path: 'verification/inventory-desktop.png', fullPage: true })

console.log('Initial rows on page:', await page.locator('tbody tr').count())

const firstImei = (await cell(0, 4).innerText()).trim()
await search(firstImei)
console.log('IMEI search result rows:', await page.locator('tbody tr').count())
console.log('IMEI search matched row:', (await cell(0, 4).innerText()).trim() === firstImei)

await search('Samsung')
console.log('Brand text search rows:', await page.locator('tbody tr').count())
console.log('Brand text search first brand:', (await cell(0, 0).innerText()).trim())

await search('')
await chooseSelect('Filter by brand', 'Samsung')
console.log('Brand filter first brand:', (await cell(0, 0).innerText()).trim())

await chooseSelect('Filter by stock status', 'Sold')
console.log('Sold filter first status:', (await cell(0, 10).innerText()).trim())

await page.getByLabel('Filter by stock status').click()
await page.getByRole('option', { name: 'All statuses' }).click()
await page.getByLabel('Filter by brand').click()
await page.getByRole('option', { name: 'All brands' }).click()
await page.waitForTimeout(120)

await chooseSelect('Filter by condition', 'New')
console.log('Condition filter first value:', (await cell(0, 8).innerText()).trim())

await page.getByLabel('Filter by condition').click()
await page.getByRole('option', { name: 'All conditions' }).click()
await page.getByLabel('Purchased from date').fill('2026-11-24')
await page.waitForTimeout(150)
console.log('Date filter first purchase date:', (await cell(0, 7).innerText()).trim(), '(filtered from 2026-11-24)')

await page.getByLabel('Purchased from date').fill('')
await page.getByLabel('Minimum purchase price').fill('100000')
await page.waitForTimeout(150)
const prices = await page.locator('tbody tr td:nth-child(6)').allInnerTexts()
console.log('Price filter all >= ₹1,00,000:', prices.every((value) => Number(value.replace(/[^0-9]/g, '')) >= 100000))

await page.getByLabel('Minimum purchase price').fill('')
await page.waitForTimeout(120)
await page.getByRole('button', { name: 'Price' }).click()
await page.waitForTimeout(150)
const sortedPrices = (await page.locator('tbody tr td:nth-child(6)').allInnerTexts()).map((value) =>
  Number(value.replace(/[^0-9]/g, '')),
)
console.log('Purchase price sort ascending:', sortedPrices.every((value, index) => index === 0 || sortedPrices[index - 1] <= value))

// View details
const detailsImei = (await cell(0, 4).innerText()).trim()
await rowAction('View details')
console.log('Details modal IMEI visible:', await page.getByText(detailsImei, { exact: true }).first().isVisible())
await closeDialog()

// Edit details
await page.goto(`${base}/inventory`, { waitUntil: 'networkidle' })
const editImei = (await cell(0, 4).innerText()).trim()
await rowAction('Edit details')
await page.getByLabel('Color').fill('Test Blue')
await page.getByRole('button', { name: 'Save changes' }).click()
await page.waitForTimeout(200)
await search(editImei)
console.log('Edit persisted color:', (await cell(0, 3).innerText()).trim())

// Duplicate IMEI validation on the dedicated add-stock form
await page.getByRole('link', { name: 'Add New Stock', exact: true }).click()
await page.waitForTimeout(200)
await chooseSelect('Brand', 'Apple')
await page.locator('input[aria-label="Model"]').fill('iPhone 15 Pro')
await page.getByLabel('Storage').fill('256GB')
await page.getByLabel('Color').fill('Test')
await page.locator('input[aria-label="Purchase Price"]').fill('50000')
await page.getByLabel('IMEI Number').fill(firstImei)
await chooseSelect('Condition', 'New')
await chooseSelect('Grade', 'Grade A')
await page.getByLabel('Battery Health').fill('100')
await chooseSelect('Source of Mobile', 'Other')
await chooseSelect('Purchased For Store', 'Connaught Place')
await page.getByRole('button', { name: 'Save mobile' }).first().click()
await page.waitForTimeout(150)
console.log('Duplicate IMEI blocked:', await page.getByText('This IMEI already belongs to another device.').isVisible())

// Record sale
await page.getByRole('link', { name: 'Mobile Inventory' }).click()
await page.waitForTimeout(200)
await chooseSelect('Filter by stock status', 'In Stock')
const saleImei = (await cell(0, 4).innerText()).trim()
await rowAction('Record sale')
await page.getByLabel('Customer name').fill('Test Buyer')
await page.getByRole('button', { name: 'Confirm sale' }).click()
await page.waitForTimeout(200)
await page.getByLabel('Filter by stock status').click()
await page.getByRole('option', { name: 'All statuses' }).click()
await page.waitForTimeout(120)
await search(saleImei)
console.log('Record sale status:', (await cell(0, 10).innerText()).trim())

// Transfer keeps one record and moves store
await page.goto(`${base}/inventory`, { waitUntil: 'networkidle' })
await chooseSelect('Filter by stock status', 'In Stock')
const transferImei = (await cell(0, 4).innerText()).trim()
const fromStore = (await cell(0, 6).locator('[title]').getAttribute('title')) ?? ''
const countBefore = (await page.locator('main').innerText()).match(/(\d+) registered/)?.[1]
await rowAction('Transfer to another store')
const destination = fromStore.includes('Saket') ? 'Connaught Place' : 'Saket'
await chooseSelect('Destination store', destination)
await page.getByRole('button', { name: 'Confirm transfer' }).click()
await page.waitForTimeout(200)
await search(transferImei)
console.log('Transfer destination:', await cell(0, 6).locator('[title]').getAttribute('title'))
console.log('Transfer keeps status In Stock:', (await cell(0, 10).innerText()).trim())
const countAfter = (await page.locator('main').innerText()).match(/(\d+) registered/)?.[1]
console.log('Total registered devices unchanged after transfer:', countBefore === countAfter, `(${countBefore} → ${countAfter})`)

// Stock history
await page.goto(`${base}/inventory`, { waitUntil: 'networkidle' })
await rowAction('View stock history')
console.log('Stock history modal visible:', await page.getByRole('dialog').isVisible())
await closeDialog()

const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })
mobile.on('pageerror', (error) => errors.push(`mobile: ${error.message}`))
await mobile.goto(`${base}/inventory`, { waitUntil: 'networkidle' })
await mobile.screenshot({ path: 'verification/inventory-mobile.png', fullPage: true })

console.log('Console/page errors:', errors.length ? errors : 'none')
await browser.close()

import { chromium } from 'playwright'

const base = 'http://localhost:5173'
const browser = await chromium.launch({ headless: true })
const errors = []

const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
page.on('console', (message) => {
  if (message.type() === 'error') errors.push(message.text())
})
page.on('pageerror', (error) => errors.push(error.message))

async function chooseSelect(label, option) {
  await page.locator(`[aria-label="${label}"]`).click()
  await page.getByRole('option', { name: option, exact: true }).click()
  await page.waitForTimeout(100)
}

async function selectDashboardStore(name) {
  const trigger = page.locator('[aria-label="Select store"]:visible')
  await trigger.click()
  await page.getByRole('option', { name, exact: true }).click()
  await page.waitForTimeout(200)
}

async function kpiValue(label) {
  const text = await page.locator('main .grid').first().innerText()
  const match = text.match(new RegExp(`${label}\\s+([\\d,]+)`))
  return match?.[1] ?? null
}

const testImei = '999123456789012'

// Baseline dashboard numbers for the store that will receive the device.
await page.goto(`${base}/dashboard`, { waitUntil: 'networkidle' })
await selectDashboardStore('Connaught Place')
const inventoryBefore = await kpiValue('Total Inventory')
const availableBefore = await kpiValue('Available Stock')
console.log('Dashboard before:', { inventoryBefore, availableBefore })

await page.getByRole('link', { name: 'Add New Stock', exact: true }).click()
await page.waitForTimeout(200)
await page.screenshot({ path: 'verification/add-stock-desktop.png', fullPage: true })

// Required-field validation
await page.getByRole('button', { name: 'Save mobile' }).first().click()
await page.waitForTimeout(150)
console.log('Required validation shown:', await page.getByText('Select a brand.').isVisible())

// Fill full form, first with an invalid IMEI.
await chooseSelect('Brand', 'Apple')
await page.getByLabel('Model').fill('iPhone 16 Pro Max')
await page.getByLabel('Storage').fill('512GB')
await page.getByLabel('Color').fill('Desert Titanium')
await page.getByLabel('IMEI Number').fill('12345')
await chooseSelect('Condition', 'Like New')
await chooseSelect('Grade', 'Grade A')
await page.getByLabel('Battery Health').fill('96')
await page.getByLabel('Purchase Price').fill('125000')
await chooseSelect('Source of Mobile', 'Supplier')
await page.getByLabel('Supplier Name').fill('Test Supplier')
console.log('Purchased store locked to global selection:', await page.locator('[aria-label="Purchased For Store"]').isDisabled())
await page.getByLabel('Box Available').check()
await page.getByLabel('Original Bill Available').check()
await page.getByLabel('Accessories').fill('Charger, case')
await chooseSelect('Warranty', 'Store warranty')
await page.getByLabel('Notes').fill('Phase 4 verification device')

await page.getByRole('button', { name: 'Save mobile' }).first().click()
await page.waitForTimeout(150)
console.log('IMEI length validation shown:', await page.getByText('IMEI must contain exactly 15 digits.').isVisible())

// Correct IMEI and save.
await page.getByLabel('IMEI Number').fill(testImei)
await page.getByRole('button', { name: 'Save mobile' }).first().click()
await page.waitForTimeout(300)
console.log('Success toast shown:', await page.getByText('Mobile added to inventory', { exact: true }).first().isVisible())
console.log('Toast action available:', await page.getByRole('link', { name: 'View inventory' }).isVisible())
await page.screenshot({ path: 'verification/add-stock-success.png' })
console.log('Form cleared after save:', (await page.getByLabel('Model').inputValue()) === '')

// Verify it appears in inventory.
await page.getByRole('link', { name: 'Mobile Inventory' }).click()
await page.waitForTimeout(200)
await page.getByLabel('Search inventory').fill(testImei)
await page.waitForTimeout(200)
console.log('New device rows in inventory:', await page.locator('tbody tr').count())
console.log('New device brand/model:', (await page.locator('tbody tr').first().innerText()).replace(/\s+/g, ' ').slice(0, 90))

// Verify dashboard counts increased for the selected store.
await page.getByRole('link', { name: 'Dashboard' }).click()
await page.waitForTimeout(200)
const inventoryAfter = await kpiValue('Total Inventory')
const availableAfter = await kpiValue('Available Stock')
console.log('Dashboard after:', { inventoryAfter, availableAfter })
console.log('Inventory count increased:', Number(inventoryAfter?.replace(/,/g, '')) === Number(inventoryBefore?.replace(/,/g, '')) + 1)
console.log('Available stock increased:', Number(availableAfter?.replace(/,/g, '')) === Number(availableBefore?.replace(/,/g, '')) + 1)

// Duplicate IMEI prevention on the dedicated form.
await page.getByRole('link', { name: 'Add New Stock', exact: true }).click()
await page.waitForTimeout(200)
await chooseSelect('Brand', 'Samsung')
await page.getByLabel('Model').fill('Galaxy S25')
await page.getByLabel('Storage').fill('256GB')
await page.getByLabel('Color').fill('Black')
await page.getByLabel('IMEI Number').fill(testImei)
await chooseSelect('Condition', 'New')
await chooseSelect('Grade', 'Grade A')
await page.getByLabel('Battery Health').fill('100')
await page.getByLabel('Purchase Price').fill('90000')
await chooseSelect('Source of Mobile', 'Other')
console.log('Duplicate check keeps global store scope:', (await page.getByLabel('Purchased For Store').innerText()).includes('Connaught Place'))
await page.getByRole('button', { name: 'Save mobile' }).first().click()
await page.waitForTimeout(150)
console.log('Duplicate IMEI blocked:', await page.getByText('This IMEI already belongs to another device.').isVisible())

// Reset clears the form.
await page.getByRole('button', { name: 'Reset form' }).click()
await page.waitForTimeout(100)
console.log('Reset cleared IMEI:', (await page.getByLabel('IMEI Number').inputValue()) === '')
console.log('Reset cleared Model:', (await page.getByLabel('Model').inputValue()) === '')

// Cancel returns to inventory.
await page.getByRole('link', { name: 'Cancel' }).click()
await page.waitForTimeout(200)
console.log('Cancel navigated to inventory:', page.url().endsWith('/inventory'))

const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })
mobile.on('pageerror', (error) => errors.push(`mobile: ${error.message}`))
await mobile.goto(`${base}/add-stock`, { waitUntil: 'networkidle' })
await mobile.screenshot({ path: 'verification/add-stock-mobile.png', fullPage: true })

console.log('Console/page errors:', errors.length ? errors : 'none')
await browser.close()

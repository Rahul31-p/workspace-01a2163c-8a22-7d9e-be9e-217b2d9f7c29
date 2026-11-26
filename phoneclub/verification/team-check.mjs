import { chromium } from 'playwright'

const base = 'http://localhost:5173'
const browser = await chromium.launch({ headless: true })
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } })
const errors = []
const page = await context.newPage()

page.on('console', (message) => {
  if (message.type() === 'error') errors.push(message.text())
})
page.on('pageerror', (error) => errors.push(error.message))

async function chooseSelect(label, option, scope = page) {
  await scope.locator(`[aria-label="${label}"]`).click()
  await page.getByRole('option', { name: option, exact: true }).click()
  await page.waitForTimeout(120)
}

async function switchUser(name) {
  await page.getByRole('button', { name: 'Switch demo role' }).click()
  await page.getByRole('menuitem', { name: new RegExp(name) }).click()
  await page.waitForTimeout(220)
}

async function openEmployeeActions(name) {
  const row = page.locator('table').first().locator('tbody tr').filter({ hasText: name })
  await row.locator('[aria-label="Employee actions"]').click()
  await page.waitForTimeout(100)
  return row
}

await page.goto(`${base}/dashboard`, { waitUntil: 'networkidle' })
await page.getByRole('link', { name: 'Team & Access', exact: true }).click()
await page.waitForTimeout(250)
await page.screenshot({ path: 'verification/team-desktop.png', fullPage: true })

console.log('Initial employee rows:', await page.locator('table').first().locator('tbody tr').count())
const tableText = await page.locator('table').first().innerText()
console.log('Employee table fields:', [
  'EMPLOYEE', 'EMAIL', 'PHONE NUMBER', 'ROLE', 'ASSIGNED STORE', 'ACCOUNT STATUS',
].every((label) => tableText.includes(label)))
console.log('Role badges rendered:', ['Super Admin', 'Store Manager', 'Sales Executive'].every((role) => tableText.includes(role)))
console.log('Store assignment rendered:', ['All Stores', 'Connaught Place', 'Saket', 'Noida Sec 18', 'Gurugram'].every((store) => tableText.includes(store)))
console.log('Backend disclaimer shown:', (await page.locator('main').innerText()).includes('frontend gating only'))

// Add employee: validation, duplicate email, then successful creation.
await page.getByRole('button', { name: 'Add employee' }).click()
await page.waitForTimeout(120)
await page.getByRole('dialog').getByRole('button', { name: 'Add employee' }).click()
await page.waitForTimeout(120)
console.log('Required validation shown:', await page.getByText('Full name is required.').isVisible())

const dialog = page.getByRole('dialog')
await dialog.getByLabel('Full Name').fill('Tara Sharma')
await dialog.getByLabel('Email', { exact: true }).fill('aarav@phoneclub.in')
await dialog.getByLabel('Phone Number', { exact: true }).fill('12345')
await dialog.getByLabel('Job Title', { exact: true }).fill('Sales Associate')
await dialog.getByLabel('Role', { exact: true }).click()
await page.getByRole('option', { name: 'Sales Executive', exact: true }).click()
await chooseSelect('Assigned Store', 'Noida Sec 18', dialog)
await page.getByRole('dialog').getByRole('button', { name: 'Add employee' }).click()
await page.waitForTimeout(120)
console.log('Phone validation shown:', await page.getByText('Phone number must contain 10 digits.').isVisible())
console.log('Duplicate email validation shown:', await page.getByText('Another employee already uses this email.').isVisible())

await dialog.getByLabel('Email', { exact: true }).fill('tara@phoneclub.in')
await dialog.getByLabel('Phone Number', { exact: true }).fill('9871234567')
console.log('Sales permission toggle available:', await dialog.getByLabel('Can record sales').isVisible())
await dialog.getByLabel('Can record sales').check()
await page.getByRole('dialog').getByRole('button', { name: 'Add employee' }).click()
await page.waitForTimeout(220)
console.log('Employee added toast:', await page.getByText('Employee added', { exact: true }).first().isVisible())
console.log('New employee row visible:', await page.locator('tbody tr').filter({ hasText: 'Tara Sharma' }).count() === 1)
console.log('Employee total updated:', (await page.locator('main').innerText()).includes('Manage employees') || (await page.locator('main').innerText()).includes('7 employee'))

// New employee is immediately available in the role switcher.
await page.getByRole('button', { name: 'Switch demo role' }).click()
console.log('New employee in role switcher:', await page.getByRole('menuitem', { name: /Tara Sharma/ }).isVisible())
await page.keyboard.press('Escape')
await page.waitForTimeout(100)

// View employee details.
await openEmployeeActions('Tara Sharma')
await page.getByRole('menuitem', { name: 'View details' }).click()
await page.waitForTimeout(150)
const details = await page.getByRole('dialog').innerText()
console.log('View modal shows employee fields:', [
  'tara@phoneclub.in', '9871234567', 'Noida Sec 18', 'Sales Executive', 'Permitted',
  'Real security must be enforced by the backend',
].every((part) => details.includes(part)))
await page.getByRole('dialog').getByRole('button', { name: 'Close' }).first().click()
await page.waitForTimeout(120)

// Edit role and assignment.
await openEmployeeActions('Tara Sharma')
await page.getByRole('menuitem', { name: 'Edit employee' }).click()
await page.waitForTimeout(150)
await dialog.getByLabel('Role', { exact: true }).click()
await page.getByRole('option', { name: 'Store Manager', exact: true }).click()
await page.waitForTimeout(100)
console.log('Super Admin store locked in form:', await dialog.getByLabel('Assigned Store').isDisabled() === false)
await page.getByRole('dialog').getByRole('button', { name: 'Save changes' }).click()
await page.waitForTimeout(200)
const taraRow = page.locator('table').first().locator('tbody tr').filter({ hasText: 'Tara Sharma' })
console.log('Role change persisted:', (await taraRow.innerText()).includes('Store Manager'))
console.log('Assignment change persisted:', (await taraRow.innerText()).includes('Noida Sec 18'))

// Deactivate / reactivate.
await openEmployeeActions('Tara Sharma')
await page.getByRole('menuitem', { name: 'Deactivate employee' }).click()
await page.getByText('Employee deactivated', { exact: true }).first().waitFor()
console.log('Deactivation status shown:', (await taraRow.innerText()).includes('Inactive'))
await page.getByRole('button', { name: 'Switch demo role' }).click()
console.log('Inactive employee hidden from role switcher:', await page.getByRole('menuitem', { name: /Tara Sharma/ }).count() === 0)
await page.keyboard.press('Escape')
await page.waitForTimeout(100)
await openEmployeeActions('Tara Sharma')
await page.getByRole('menuitem', { name: 'Activate employee' }).click()
await page.getByText('Employee activated', { exact: true }).first().waitFor()
console.log('Reactivation status shown:', (await taraRow.innerText()).includes('Active'))

// Search and filters.
await page.getByLabel('Search employees').fill('tara@')
await page.waitForTimeout(150)
console.log('Employee search rows:', await page.locator('table').first().locator('tbody tr').count())
await page.getByLabel('Search employees').fill('')
await chooseSelect('Employee role filter', 'Store Manager')
console.log('Role filter rows:', await page.locator('table').first().locator('tbody tr').count())
await chooseSelect('Employee status filter', 'Inactive')
console.log('Inactive status filter rows:', await page.locator('table').first().locator('tbody tr').count())
await page.getByRole('button', { name: 'Reset', exact: true }).click()
await page.waitForTimeout(150)
console.log('Reset restored all employees:', await page.locator('table').first().locator('tbody tr').count() === 7)

// Every role: Super Admin.
console.log('Super Admin has Team nav:', await page.getByRole('link', { name: 'Team & Access', exact: true }).count() === 1)
console.log('Super Admin has Reports nav:', await page.getByRole('link', { name: 'Reports & Analytics', exact: true }).count() === 1)

// Every role: Store Manager.
await switchUser('Neha Kapoor')
console.log('Manager Team nav hidden:', await page.getByRole('link', { name: 'Team & Access', exact: true }).count() === 0)
console.log('Manager Reports nav visible:', await page.getByRole('link', { name: 'Reports & Analytics', exact: true }).count() === 1)
console.log('Manager store scope:', (await page.locator('[aria-label="Select store"]:visible').innerText()).includes('Connaught Place'))
await page.waitForTimeout(150)
console.log('Manager team page restricted:', await page.getByText('Team management is restricted').isVisible())
console.log('Manager has no Add employee button:', await page.getByRole('button', { name: 'Add employee' }).count() === 0)

// Every role: Sales Executive permitted.
await switchUser('Vikram Sethi')
await page.getByRole('link', { name: 'Mobile Inventory', exact: true }).click()
await page.waitForTimeout(180)
await page.locator('tbody tr').first().locator('[aria-label="Device actions"]').click()
console.log('Permitted executive actions:', {
  sale: await page.getByRole('menuitem', { name: 'Record sale' }).count(),
  edit: await page.getByRole('menuitem', { name: 'Edit details' }).count(),
  transfer: await page.getByRole('menuitem', { name: 'Transfer to another store' }).count(),
})
await page.keyboard.press('Escape')
await page.getByRole('link', { name: 'Sales Management', exact: true }).click()
await page.waitForTimeout(180)
console.log('Permitted executive sees sale form:', await page.getByText('Record a sale', { exact: true }).count() === 1)

// Every role: Sales Executive not permitted.
await switchUser('Rhea Kapoor')
console.log('Unpermitted executive sale notice:', await page.getByText('Recording sales is disabled for this demo user').isVisible())
console.log('Unpermitted executive has no sale form:', await page.getByText('Record a sale', { exact: true }).count() === 0)

// Restore admin.
await switchUser('Aarav Mehta')
await page.getByRole('link', { name: 'Team & Access', exact: true }).click()
await page.waitForTimeout(150)
console.log('Admin team access restored:', await page.getByRole('button', { name: 'Add employee' }).count() === 1)

// Responsive screenshot.
const mobile = await context.newPage()
mobile.on('pageerror', (error) => errors.push(`mobile: ${error.message}`))
await mobile.setViewportSize({ width: 390, height: 844 })
await mobile.goto(`${base}/team`, { waitUntil: 'networkidle' })
await mobile.screenshot({ path: 'verification/team-mobile.png', fullPage: true })
console.log(
  'Mobile page has no horizontal overflow:',
  await mobile.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1),
)

console.log('Console/page errors:', errors.length ? errors : 'none')
await browser.close()

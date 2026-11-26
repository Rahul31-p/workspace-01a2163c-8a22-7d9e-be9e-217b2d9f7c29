/** Phase 10 theme verification: PhoneClub.in palette applied without layout changes. */
import { writeFile } from 'node:fs/promises'
import { chromium } from 'playwright'

const base = process.env.BASE_URL ?? 'http://localhost:5173'
const routes = [
  '/dashboard',
  '/inventory',
  '/add-stock',
  '/sales',
  '/stores',
  '/transfers',
  '/reports',
  '/team',
  '/settings',
  '/help',
]

const results = []
const errors = []
const check = (name, ok, detail = '') => {
  results.push({ name, status: ok ? 'PASS' : 'FAIL', detail })
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`)
  if (!ok) process.exitCode = 1
}

function parseRgb(value) {
  const match = String(value).match(/rgba?\(([^)]+)\)/)
  if (!match) return null
  const parts = match[1].split(/[,/]/).map((part) => Number(part.trim())).filter((n) => Number.isFinite(n))
  return parts.length >= 3 ? parts.slice(0, 3) : null
}

function nearColor(actual, expected, tolerance = 2) {
  const a = parseRgb(actual)
  const b = parseRgb(expected)
  return Boolean(a && b && a.every((value, index) => Math.abs(value - b[index]) <= tolerance))
}

function contrast(foreground, background) {
  const a = parseRgb(foreground)
  const b = parseRgb(background)
  if (!a || !b) return 0
  const luminance = (channels) => {
    const [r, g, blue] = channels.map((channel) => {
      const value = channel / 255
      return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
    })
    return 0.2126 * r + 0.7152 * g + 0.0722 * blue
  }
  const [high, low] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return Number(((high + 0.05) / (low + 0.05)).toFixed(2))
}

const legacyColors = new Set([
  'rgb(37, 99, 235)', 'rgb(22, 163, 74)', 'rgb(124, 58, 237)', 'rgb(14, 165, 233)',
  'rgb(148, 163, 184)', 'rgb(100, 116, 139)', 'rgb(248, 250, 252)', 'rgb(229, 233, 240)',
  'rgb(71, 85, 105)', 'rgb(239, 246, 255)', 'rgb(241, 245, 249)', 'rgb(226, 232, 240)',
  'rgb(180, 83, 9)', 'rgb(254, 226, 226)', 'rgb(185, 28, 28)', 'rgb(191, 219, 254)',
  'rgb(187, 247, 208)', 'rgb(245, 158, 11)', 'rgb(8, 145, 178)', 'rgb(219, 39, 119)',
  'rgb(234, 88, 12)',
])

const browser = await chromium.launch({ headless: true })
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
const page = await context.newPage()
page.on('console', (message) => {
  if (message.type() === 'error') errors.push(message.text())
})
page.on('pageerror', (error) => errors.push(error.message))

await page.goto(`${base}/dashboard`, { waitUntil: 'networkidle' })

const tokens = await page.evaluate(() => {
  const style = getComputedStyle(document.documentElement)
  return Object.fromEntries(
    ['--background', '--card', '--foreground', '--muted-foreground', '--primary', '--brand', '--success', '--warning', '--destructive', '--border', '--input', '--ring']
      .map((name) => [name, style.getPropertyValue(name).trim()]),
  )
})
check(
  'Palette tokens match phoneclub.in',
  tokens['--background'] === '60 20% 98%' &&
    tokens['--primary'] === '17 88% 40%' &&
    tokens['--brand'] === '23 93% 57%' &&
    tokens['--foreground'] === '240 3% 12%' &&
    tokens['--border'] === '240 6% 83%',
  JSON.stringify(tokens),
)

const surface = await page.evaluate(() => ({
  bodyColor: getComputedStyle(document.body).backgroundColor,
  bodyText: getComputedStyle(document.body).color,
  cardColor: getComputedStyle(document.querySelector('main .rounded-xl')).backgroundColor,
}))
check('Warm paper app background', surface.bodyColor === 'rgb(251, 251, 249)', surface.bodyColor)
check('Ink body text', nearColor(surface.bodyText, 'rgb(29, 29, 31)'), surface.bodyText)
check('Body text contrast ≥ 4.5:1', contrast(surface.bodyText, surface.bodyColor) >= 4.5, `${contrast(surface.bodyText, surface.bodyColor)}:1`)

const primary = page.locator('a.bg-primary').first()
const defaultBg = await primary.evaluate((el) => getComputedStyle(el).backgroundColor)
const primaryText = await primary.evaluate((el) => getComputedStyle(el).color)
check('Primary button uses PhoneClub dark orange', nearColor(defaultBg, 'rgb(194, 65, 12)'), defaultBg)
check('Primary button text contrast ≥ 4.5:1', contrast(primaryText, defaultBg) >= 4.5, `${contrast(primaryText, defaultBg)}:1`)
await primary.hover()
await page.waitForTimeout(250)
const hoverBg = await primary.evaluate((el) => getComputedStyle(el).backgroundColor)
check('Primary hover state uses darker orange', hoverBg !== defaultBg && contrast(primaryText, hoverBg) >= 4.5, `${defaultBg} → ${hoverBg}`)

const activeNav = page.locator('aside nav a[aria-current="page"]').first()
const navBg = await activeNav.evaluate((el) => getComputedStyle(el).backgroundColor)
const navColor = await activeNav.evaluate((el) => getComputedStyle(el).color)
check('Active navigation has orange tint', navBg.includes('250, 235') || navBg !== 'rgba(0, 0, 0, 0)', navBg)
check('Active navigation text contrast ≥ 4.5:1', contrast(navColor, await page.evaluate(() => getComputedStyle(document.body).backgroundColor)) >= 4.5, `${navColor} on page`)

await page.goto(`${base}/inventory`, { waitUntil: 'networkidle' })
const input = page.getByLabel('Search inventory')
const inputStyle = await input.evaluate((el) => ({
  bg: getComputedStyle(el).backgroundColor,
  border: getComputedStyle(el).borderTopColor,
  color: getComputedStyle(el).color,
}))
check('Input uses warm surface and border', inputStyle.bg === 'rgb(255, 255, 255)' && nearColor(inputStyle.border, 'rgb(210, 210, 215)'), JSON.stringify(inputStyle))
check('Input text contrast ≥ 4.5:1', contrast(inputStyle.color, inputStyle.bg) >= 4.5, `${contrast(inputStyle.color, inputStyle.bg)}:1`)
await input.focus()
const focusStyle = await input.evaluate((el) => getComputedStyle(el).boxShadow)
check('Input focus ring uses brand orange', focusStyle.includes('192, 63, 12'), focusStyle)

const headerStyle = await page.locator('thead th').first().evaluate((el) => ({
  bg: getComputedStyle(el).backgroundColor,
  color: getComputedStyle(el).color,
}))
check('Table header uses warm surface', nearColor(headerStyle.bg, 'rgb(244, 244, 242)') || headerStyle.bg === 'rgba(0, 0, 0, 0)', JSON.stringify(headerStyle))
check('Table header text contrast ≥ 4.5:1', contrast(headerStyle.color, 'rgb(251, 251, 249)') >= 4.5, `${headerStyle.color}`)

const legacyFound = []
for (const route of routes) {
  await page.goto(`${base}${route}`, { waitUntil: 'networkidle' })
  const colors = await page.evaluate(() => {
    const found = new Set()
    for (const el of document.querySelectorAll('body *')) {
      const style = getComputedStyle(el)
      for (const value of [style.color, style.backgroundColor, style.borderTopColor, style.borderBottomColor, style.fill, style.stroke]) {
        if (value && value !== 'rgba(0, 0, 0, 0)' && value !== 'none') found.add(value)
      }
    }
    return [...found]
  })
  for (const color of colors) {
    if (legacyColors.has(color)) legacyFound.push(`${route}:${color}`)
  }
}
check('No legacy blue/slate/red colors remain on any page', legacyFound.length === 0, [...new Set(legacyFound)].slice(0, 8).join(', '))

// Responsive regression: color-only changes must not affect layout.
for (const width of [1920, 1440, 1024, 768, 390, 360]) {
  await page.setViewportSize({ width, height: 900 })
  const overflowed = []
  for (const route of routes) {
    await page.goto(`${base}${route}`, { waitUntil: 'networkidle' })
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1)
    if (overflow) overflowed.push(route)
  }
  check(`${width}px: no horizontal overflow on all routes`, overflowed.length === 0, overflowed.join(', '))
}

await page.setViewportSize({ width: 1440, height: 900 })
await page.goto(`${base}/dashboard`, { waitUntil: 'networkidle' })
await page.screenshot({ path: 'verification/theme-dashboard.png', fullPage: true })
await page.goto(`${base}/inventory`, { waitUntil: 'networkidle' })
await page.screenshot({ path: 'verification/theme-inventory.png', fullPage: true })
await page.goto(`${base}/reports`, { waitUntil: 'networkidle' })
await page.screenshot({ path: 'verification/theme-reports.png', fullPage: true })
await page.goto(`${base}/team`, { waitUntil: 'networkidle' })
await page.screenshot({ path: 'verification/theme-team.png', fullPage: true })

check('No console or page errors during theme verification', errors.length === 0, errors.slice(0, 3).join(' | '))

await writeFile(
  'verification/theme-results.json',
  JSON.stringify({ generatedAt: new Date().toISOString(), tokens, results, errors }, null, 2),
)
console.log(`\nTheme verification: ${results.filter((r) => r.status === 'PASS').length}/${results.length} checks passed.`)
await browser.close()

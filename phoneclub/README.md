# PHONECLUB — Inventory Management

Phase 10 multi-store mobile retail inventory, sales, stock-transfer, reporting, and team-access application. The UI uses the PhoneClub.in color palette. The app runs on shared in-memory mock data; no backend, persistence, or real authorization is included.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:5173`. To run the browser checks, install the Playwright browser once:

```bash
npx playwright install chromium
```

Other commands:

```bash
npm run build     # production build
npm run preview   # preview the production build
npm run lint      # run oxlint
```

## Color theme

The UI palette is matched to [PhoneClub.in](https://phoneclub.in/) and centralized in `src/index.css` + `tailwind.config.js`:

- Primary: `#c2410c` (deep orange) with `#9a3412` hover
- Bright brand accent: `#f7782a`, supported by `#f26a1b` and soft `#fff1e8`
- Surfaces: `#fbfbf9` app background, `#ffffff` cards, `#f4f4f2` subtle rows
- Text: `#1d1d1f` primary, `#6e6e73` secondary
- Secondary: `#1f7a3a` green; warning `#a45c00`; error `#c62828`
- Borders/dividers: `#d2d2d7`

Only color tokens and color classes changed; layout, typography, content, and behavior are unchanged. `verification/theme-check.mjs` verifies palette tokens, contrast, hover/focus states, and responsive layout.

## What is included

### Dashboard

- Store-aware KPI cards, weekly sales chart, daily sales statistics
- Store-wise inventory and sales comparisons, revenue-by-brand overview
- Recent activity feed derived from the same records

### Mobile inventory

- Professional table with brand icons, IMEI, pricing, store, condition, battery health, stock status, and row actions
- Instant search across IMEI, brand, model, color, and storage
- Filters for brand, model, store, stock status, condition, purchase date range, and price range
- Sorting and pagination
- View, edit, sale, transfer, and stock history actions
- Duplicate IMEI prevention and 15-digit validation

### Add New Stock

A dedicated, responsive form divided into three sections:

- **Mobile details** — brand, model, storage, color, IMEI, condition, grade, battery health
- **Purchase details** — purchase price, purchase date, source, supplier name, purchasing store
- **Additional details** — box, original bill, accessories, warranty, notes

Required-field validation, IMEI validation, duplicate checks, conditional supplier validation, success toast with a **View inventory** shortcut, reset, and cancel are included. Saved devices are added to shared inventory state with `In Stock` status, appear immediately in the inventory table, and increase the receiving store's available stock on the dashboard.

### Sales Management

- Store-aware overview: total transactions, total revenue, total gross profit, average selling price, and mobiles sold
- Step-by-step sale form: 15-digit IMEI search, selected-mobile review (brand, model, storage, color, IMEI, purchase price, current store), then sale details
- Sale details: selling price, sale date, payment method (Cash / UPI / Card / Bank Transfer), optional customer name and phone, notes
- Automatic gross profit (`selling price − purchase price`) and profit margin (`profit ÷ selling price × 100`)
- Confirmation marks the device `Sold`, records the sale date and selling price, generates a unique invoice, and removes the handset from available stock
- Sold devices cannot be selected for another sale; the inventory row remains for audit history
- History table with invoice, model, IMEI, store, sale date, selling price, payment method, profit, search, store/method/profit/date filters, pagination, and Excel/PDF export
- Inventory row actions link into the detailed form with the IMEI prefilled

### Store Management

- Store directory with name, generated Store ID, address, manager, contact number, status, and opening date
- Add, edit, view, activate, and deactivate stores using shared in-memory state
- Store cards show available mobiles, mobiles sold, purchase value, sales revenue, and assigned mock employees
- New stores appear immediately in the global selector, dashboard comparisons, inventory forms, sales filters, and exports
- The global selector scopes dashboard, inventory, sales, and store-management views; local store filters lock to that scope
- Mock role switcher in the header demonstrates Super Admin, Store Manager, and Sales Executive UI permissions, including a Sales Executive whose sale permission is disabled
- Navigation links and action menus reflect the active mock role; all role checks are browser-only and clearly labelled as non-authorization

### Stock Transfers

- IMEI search, complete selected-device review, source verification, destination selection, transfer date, note, and status
- Confirmation updates one existing inventory record in place: IMEI and all purchase details are preserved, no duplicate device is created, and store stock counts change immediately
- Transfer history with transfer ID, brand/model, IMEI, source store, destination store, date, and status
- Search, store/status/direction/date filters, pagination, and global store scoping
- Business rules enforced in the UI and shared state: sold devices blocked, identical source/destination blocked, unique transfer IDs, and a full shared history entry for every move
- Success/error toasts and deep links from inventory row actions into the detailed transfer form

### Reports & Analytics

- Sales report with total revenue, total profit, average selling price, and transaction count
- Daily, weekly, and monthly sales breakdowns plus a cumulative revenue area series
- Inventory report with purchased/available/sold/reserved counts, total purchase value, and brand/model stock breakdowns
- Store comparison of revenue, units sold, gross profit, inventory value, and available stock
- Recharts weekly-sales bar chart, revenue area chart, store comparison chart, and brand inventory chart
- Period filters for Today, This week, This month, Last month, and a custom date range; store selection stays tied to the global selector
- Excel and PDF exports built from the currently filtered sales, inventory, and store records — never hardcoded samples
- Report access respects UI role permissions; exports include Summary, Sales records, Inventory records, and Store comparison sheets

### Navigation & Global Search

- Sidebar groups all implemented modules, collapses on desktop, and becomes a drawer on small screens
- Header shows the current page, a working global inventory search, notifications, store selector, and demo user switcher
- Global search submits an IMEI/model term to `/inventory?q=...` and prefills the inventory filter
- A responsive single store selector replaces duplicate desktop/mobile controls

### Team Management & Access Control

- Employee directory with Full Name, Email, Phone Number, Role, Assigned Store, and Account Status
- Add and edit employee modals with required fields, validation, duplicate-email prevention, job title, sales permission toggle, and status selection
- View employee details, change roles, change store assignments, and activate or deactivate accounts from the table or details modal
- Search by name/email/phone/title and filter by role, status, and assigned store; employee changes feed the header's demo user switcher immediately
- Role badges, store assignment, account-status badges, and summary cards for total, active, inactive, manager, and executive headcount
- Reusable UI-only permission configuration (`src/data/permissions.js`) defines roles, capabilities, permission matrix, route access, and six realistic sample users
- Super Admin sees all stores and modules; Store Managers are limited to their assigned store's operations and reports; Sales Executives see assigned-store inventory and sales only when permitted
- Team management is hidden and blocked for non-admins; inactive accounts cannot be selected as demo users
- Permission matrix and disclaimers state clearly that these are frontend simulations, not server-side authorization

## Data architecture

```text
src/data/
├── mockData.js           Stores, catalog, 48 seed devices, sales, transfers, updates
├── selectors.js          Dashboard metrics and comparisons
├── activities.js         Dashboard activity feed builder
├── inventorySelectors.js Search, filters, sorting, and device history
├── salesSelectors.js     Sales KPIs and sales history filtering
├── storeSelectors.js     Store overview metrics and store form validation
├── transferSelectors.js  Transfer KPIs, filters, and business-rule validation
├── reportSelectors.js    Report periods, aggregations, and filtered report records
├── permissions.js        Reusable roles, capabilities, matrix, routes, and mock employees
├── employeeSelectors.js  Employee validation, filters, headcount, and record mapping
├── formOptions.js        Shared form options and mock today date
├── salesExport.js        Sales Excel/PDF export builders
└── reportExport.js       Multi-sheet report and PDF builders

src/context/
├── store-context.js      Store selection hook
├── store-provider.jsx    Global store selector state
├── business-context.js   Store/inventory/employee data hook
├── business-provider.jsx Shared mutable employee/store/inventory/sales records + actions
├── role-context.js       Mock role hook
├── role-provider.jsx     Active demo user and UI permission state
├── toast-context.js      Notification hook
└── toast-provider.jsx    Accessible success/error notifications
```

The dashboard, inventory table, add-stock form, sales module, store directory, transfers, reports, and team directory consume the same provider, so no dashboard value is duplicated in a component. A confirmed sale immediately updates inventory status, the sales history, dashboard KPIs, store cards, reports, and recent activity. Store edits, transfers, status toggles, and employee role/status changes update every selector and label in the app.

## Structure

```text
src/
├── components/
│   ├── common/       PageHeader, StatCard, StoreSelector, TablePagination
│   ├── dashboard/    Charts, comparisons, recent activity card
│   ├── inventory/    Add form, filters, table, and device action modals
│   ├── sales/        Overview KPIs, record-sale form, and history table
│   ├── stores/       Store cards, forms, details, and role matrix
│   ├── transfers/    Transfer overview, form, and history table
│   ├── reports/      Filters, Recharts charts, and report tables
│   ├── team/         Employee table, forms, details, and permission matrix
│   ├── layout/       AppLayout, Header, Sidebar, MobileNav
│   └── ui/           Buttons, cards, inputs, checkboxes, textarea, toasts, modals, tables, etc.
├── config/           Navigation and page descriptions
├── context/          Store, business data, and toast providers
├── data/             Mock records, selectors, and activity builders
├── lib/              Formatting, validation, export, and class-name utilities
├── pages/            Dashboard, inventory, add-stock, sales, stores, transfers, reports, team, and placeholder pages
├── App.jsx           Route configuration
└── main.jsx          Entry point
```

Use the `@/` alias for imports, e.g. `import { Button } from '@/components/ui/button'`.

## Routes

`/dashboard`, `/inventory`, `/add-stock`, `/sales`, `/stores`, `/transfers`, `/reports`, `/team`, `/settings`, and `/help`. Routes other than the dashboard, inventory, add-stock, sales, stores, transfers, reports, and team are reserved placeholders.

## Verification

Phases 1–10 were checked with:

- `npm run build` — passed
- `npm run lint` — 0 warnings, 0 errors
- Playwright browser checks:
  - Required-field, IMEI length, and duplicate IMEI validation
  - Success toast and form clearing after save
  - New device appears in inventory
  - Receiving store's Total Inventory and Available Stock both increase by one
  - Reset and Cancel actions
  - Sales overview KPIs, store scoping, and required history columns
  - IMEI deep link, mobile details review, payment methods, and automatic profit/margin
  - Unique invoice, success toast, sold status, resale prevention, and shared dashboard updates
  - Sales search, all four filters, reset, and Excel/PDF downloads
  - Store details, validation, create/edit/view, activate/deactivate, and generated IDs
  - Global store scoping on dashboard, inventory, sales, stores, and transfers
  - Mock role switching, navigation/action gating, and UI-only authorization disclaimer
  - IMEI transfer workflow, preserved purchase details, unique IDs, one-record rule, and stock-count changes
  - Sold-device and identical-store transfer prevention, history filters, and transfer role gating
  - Report period presets, custom ranges, shared KPI math, all four charts, and store scoping
  - Excel/PDF exports verified against the actual filtered record count and invoice data
  - Employee add/edit validation, duplicate email, view, role/assignment changes, activation, and role filters
  - All three roles with realistic users (Aarav, Neha, Vikram, and Rhea), including per-user sales permission
  - Role-gated module navigation, restricted team page, and inactive account exclusion from the demo switcher
  - Earlier dashboard, inventory, add-stock, sales, store, transfer, and report checks still pass
  - Phase 10: all 10 routes at 1920/1440/1024/768/390/360 px, no horizontal overflow
  - Phase 10: every sidebar/header link, store selector, role switcher, notifications, and mobile drawer
  - Theme: palette tokens, text/button contrast, hover/focus states, no legacy blue/slate colors, and all six viewports
  - Phase 10: empty states and accessible names for visible buttons/form controls
  - Desktop and mobile screenshots saved under `verification/`
  - Full testing report in `PHASE10_REPORT.md`

Re-run checks with the dev server running:

```bash
node verification/playwright-check.mjs
node verification/inventory-check.mjs
node verification/add-stock-check.mjs
node verification/sales-check.mjs
node verification/stores-check.mjs
node verification/transfers-check.mjs
node verification/reports-check.mjs
node verification/team-check.mjs
node verification/phase10-qa.mjs
node verification/theme-check.mjs
```

## Notes

All state is held in memory, so a browser reload restores seed data. Async loading indicators are not applicable to the synchronous mock-data layer; empty states are implemented on every filterable table. The production build reports a large-chunk advisory because charting, PDF, and spreadsheet libraries are bundled into the entry chunk. Code-splitting can be introduced later. The npm registry version of `xlsx` has published advisories with no in-range fix; use the current official SheetJS distribution before parsing untrusted spreadsheets. Role switching and the team access rules are a UI demonstration only; a real deployment must authenticate users and authorize every API request on the server.

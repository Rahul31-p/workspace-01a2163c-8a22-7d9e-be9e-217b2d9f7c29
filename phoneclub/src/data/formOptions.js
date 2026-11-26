// Shared option lists for inventory forms. Add-stock keeps the exact
// Phase 4 options; edit forms also include conditions from seeded records.

export const brands = ['Apple', 'Samsung', 'OnePlus', 'Google', 'Nothing', 'Xiaomi', 'Motorola', 'Other']

export const addConditions = ['New', 'Like New', 'Pre-owned']

export const legacyConditions = ['Excellent', 'Good', 'Fair']

export const allConditions = [...new Set([...addConditions, ...legacyConditions])]

export const grades = ['Grade A', 'Grade B', 'Grade C', 'Grade D']

export const sources = ['Direct Customer', 'Trade-in', 'Supplier', 'Other']

export const warranties = ['None', 'Manufacturer warranty', 'Store warranty', 'Extended warranty']

export const paymentMethods = ['Cash', 'UPI', 'Card', 'Bank Transfer']

// Application date supplied for this build, so seeded and new records stay consistent.
export const APP_TODAY = '2026-11-25'

export const getToday = () => APP_TODAY

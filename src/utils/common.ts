import type { Territory } from '@/types'

/**
 * Shared utility functions used across the application
 */

/**
 * Format a number as currency without decimals
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US').format(amount)
}

/**
 * Territory display names mapping
 */
export const TERRITORY_NAMES: Record<Territory, string> = {
  'colorado-springs-north': 'Colorado Springs North',
  'colorado-springs-central': 'Colorado Springs Central',
  'colorado-springs-south': 'Colorado Springs South',
  'highlands-ranch': 'Highlands Ranch',
  littleton: 'Littleton',
  'castle-rock': 'Castle Rock',
} as const

/**
 * All available territories in display order
 */
export const TERRITORIES: readonly Territory[] = [
  'colorado-springs-north',
  'colorado-springs-central',
  'colorado-springs-south',
  'highlands-ranch',
  'littleton',
  'castle-rock',
] as const

/**
 * Format territory name for display
 */
export function formatTerritoryName(territory: Territory): string {
  return TERRITORY_NAMES[territory]
}

/**
 * Known sales representatives
 */
export const KNOWN_SALES_REPS = [
  'Bobbie Koon',
  'Brooklynne Woolslayer',
  'Heather McGlory',
  'Kaiti Green',
  'Kaleigh Humphrey',
  'Kim Coates',
  'Kimberly McMurray',
  'Victoria Greene',
  'Wendy Shepherd',
] as const

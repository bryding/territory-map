import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useSearchStore } from '../search'
import { useTerritoryStore } from '../territory'
import type { Customer } from '@/types'

describe('Search Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  const mockCustomers: Customer[] = [
    {
      id: 'cn246670',
      customerNumber: 'CN246670',
      accountName: '4EYMED LLC',
      businessAddress: '9249 Highlands Rd Colorado Springs 80920',
      salesRep: 'Kaiti Green',
      territory: 'colorado-springs-north',
      notes: { general: 'Can be a good client but snazzy' },
      salesData: {
        daxxify: { salesByPeriod: {} },
        rha: { salesByPeriod: {} },
        skinPen: { salesByPeriod: { '2024-Q2': 1632, '2024-Q4': 1728 } },
      },
      isQ3PromoTarget: false,
      totalSales: 3360,
    },
    {
      id: 'cn047878',
      customerNumber: 'CN047878',
      accountName: 'Advanced Dermatology',
      businessAddress: '9876 S Broadway Highlands Ranch CO 80129',
      salesRep: 'John Smith',
      territory: 'highlands-ranch',
      notes: { general: 'Established practice' },
      salesData: {
        daxxify: { salesByPeriod: { '2024-Q1': 5000 } },
        rha: { salesByPeriod: {} },
        skinPen: { salesByPeriod: { '2024-Q2': 2500 } },
      },
      isQ3PromoTarget: true,
      totalSales: 7500,
    },
    {
      id: 'cn180974',
      customerNumber: 'CN180974',
      accountName: 'Ageless Skin Co.',
      businessAddress: '5432 W Littleton Blvd Littleton CO 80120',
      salesRep: 'Kaiti Green',
      territory: 'littleton',
      notes: { general: 'Small solo practice' },
      salesData: {
        daxxify: { salesByPeriod: {} },
        rha: { salesByPeriod: {} },
        skinPen: { salesByPeriod: { '2024-Q3': 450, '2024-Q4': 600 } },
      },
      isQ3PromoTarget: false,
      totalSales: 1050,
    },
  ]

  describe('Text Search', () => {
    it('should filter by account name', () => {
      const territoryStore = useTerritoryStore()
      const searchStore = useSearchStore()

      territoryStore.customers = mockCustomers
      searchStore.setQuery('4EYMED')

      expect(searchStore.results).toHaveLength(1)
      expect(searchStore.results[0].accountName).toBe('4EYMED LLC')
    })

    it('should filter by customer number', () => {
      const territoryStore = useTerritoryStore()
      const searchStore = useSearchStore()

      territoryStore.customers = mockCustomers
      searchStore.setQuery('CN047878')

      expect(searchStore.results).toHaveLength(1)
      expect(searchStore.results[0].customerNumber).toBe('CN047878')
    })

    it('should filter by sales rep name', () => {
      const territoryStore = useTerritoryStore()
      const searchStore = useSearchStore()

      territoryStore.customers = mockCustomers
      searchStore.setQuery('Kaiti Green')

      expect(searchStore.results).toHaveLength(2)
      expect(searchStore.results.every((c) => c.salesRep === 'Kaiti Green')).toBe(true)
    })

    it('should filter by business address', () => {
      const territoryStore = useTerritoryStore()
      const searchStore = useSearchStore()

      territoryStore.customers = mockCustomers
      searchStore.setQuery('Highlands Ranch')

      expect(searchStore.results).toHaveLength(1)
      expect(searchStore.results[0].businessAddress).toContain('Highlands Ranch')
    })

    it('should be case insensitive', () => {
      const territoryStore = useTerritoryStore()
      const searchStore = useSearchStore()

      territoryStore.customers = mockCustomers
      searchStore.setQuery('advanced')

      expect(searchStore.results).toHaveLength(1)
      expect(searchStore.results[0].accountName).toBe('Advanced Dermatology')
    })

    it('should handle partial matches', () => {
      const territoryStore = useTerritoryStore()
      const searchStore = useSearchStore()

      territoryStore.customers = mockCustomers
      searchStore.setQuery('Dermatology')

      expect(searchStore.results).toHaveLength(1)
      expect(searchStore.results[0].accountName).toBe('Advanced Dermatology')
    })

    it('should trim whitespace from query', () => {
      const territoryStore = useTerritoryStore()
      const searchStore = useSearchStore()

      territoryStore.customers = mockCustomers
      searchStore.setQuery('  4EYMED  ')

      expect(searchStore.results).toHaveLength(1)
      expect(searchStore.results[0].accountName).toBe('4EYMED LLC')
    })

    it('should return empty results for no matches', () => {
      const territoryStore = useTerritoryStore()
      const searchStore = useSearchStore()

      territoryStore.customers = mockCustomers
      searchStore.setQuery('NonExistentCustomer')

      expect(searchStore.results).toHaveLength(0)
    })
  })

  describe('Territory Filter', () => {
    it('should filter by territory', () => {
      const territoryStore = useTerritoryStore()
      const searchStore = useSearchStore()

      territoryStore.customers = mockCustomers
      searchStore.setFilter('territory', 'colorado-springs-north')

      expect(searchStore.results).toHaveLength(1)
      expect(searchStore.results[0].territory).toBe('colorado-springs-north')
    })

    it('should return all customers when territory filter is cleared', () => {
      const territoryStore = useTerritoryStore()
      const searchStore = useSearchStore()

      territoryStore.customers = mockCustomers
      searchStore.setFilter('territory', 'colorado-springs-north')
      searchStore.setFilter('territory', undefined)

      expect(searchStore.results).toHaveLength(3)
    })
  })

  describe('Sales Rep Filter', () => {
    it('should filter by sales rep', () => {
      const territoryStore = useTerritoryStore()
      const searchStore = useSearchStore()

      territoryStore.customers = mockCustomers
      searchStore.setFilter('salesRep', 'John Smith')

      expect(searchStore.results).toHaveLength(1)
      expect(searchStore.results[0].salesRep).toBe('John Smith')
    })
  })

  describe('Q3 Promo Target Filter', () => {
    it('should filter Q3 promo targets', () => {
      const territoryStore = useTerritoryStore()
      const searchStore = useSearchStore()

      territoryStore.customers = mockCustomers
      searchStore.setFilter('isQ3PromoTarget', true)

      expect(searchStore.results).toHaveLength(1)
      expect(searchStore.results[0].isQ3PromoTarget).toBe(true)
    })

    it('should filter non-Q3 promo targets', () => {
      const territoryStore = useTerritoryStore()
      const searchStore = useSearchStore()

      territoryStore.customers = mockCustomers
      searchStore.setFilter('isQ3PromoTarget', false)

      expect(searchStore.results).toHaveLength(2)
      expect(searchStore.results.every((c) => !c.isQ3PromoTarget)).toBe(true)
    })
  })

  describe('Sales Range Filters', () => {
    it('should filter by minimum sales', () => {
      const territoryStore = useTerritoryStore()
      const searchStore = useSearchStore()

      territoryStore.customers = mockCustomers
      searchStore.setFilter('minSales', 3000)

      expect(searchStore.results).toHaveLength(2)
      expect(searchStore.results.every((c) => c.totalSales >= 3000)).toBe(true)
    })

    it('should filter by maximum sales', () => {
      const territoryStore = useTerritoryStore()
      const searchStore = useSearchStore()

      territoryStore.customers = mockCustomers
      searchStore.setFilter('maxSales', 2000)

      expect(searchStore.results).toHaveLength(1)
      expect(searchStore.results[0].totalSales).toBe(1050)
    })

    it('should filter by sales range', () => {
      const territoryStore = useTerritoryStore()
      const searchStore = useSearchStore()

      territoryStore.customers = mockCustomers
      searchStore.setFilter('minSales', 1000)
      searchStore.setFilter('maxSales', 5000)

      expect(searchStore.results).toHaveLength(2)
      expect(searchStore.results.every((c) => c.totalSales >= 1000 && c.totalSales <= 5000)).toBe(
        true,
      )
    })
  })

  describe('Combined Filters', () => {
    it('should apply text search AND territory filter', () => {
      const territoryStore = useTerritoryStore()
      const searchStore = useSearchStore()

      territoryStore.customers = mockCustomers
      searchStore.setQuery('Kaiti')
      searchStore.setFilter('territory', 'littleton')

      expect(searchStore.results).toHaveLength(1)
      expect(searchStore.results[0].salesRep).toBe('Kaiti Green')
      expect(searchStore.results[0].territory).toBe('littleton')
    })

    it('should apply multiple filters together', () => {
      const territoryStore = useTerritoryStore()
      const searchStore = useSearchStore()

      territoryStore.customers = mockCustomers
      searchStore.setFilter('salesRep', 'Kaiti Green')
      searchStore.setFilter('minSales', 2000)

      expect(searchStore.results).toHaveLength(1)
      expect(searchStore.results[0].accountName).toBe('4EYMED LLC')
    })

    it('should return empty results when filters conflict', () => {
      const territoryStore = useTerritoryStore()
      const searchStore = useSearchStore()

      territoryStore.customers = mockCustomers
      searchStore.setFilter('territory', 'highlands-ranch')
      searchStore.setFilter('salesRep', 'Kaiti Green')

      expect(searchStore.results).toHaveLength(0)
    })
  })

  describe('Filter Management', () => {
    it('should clear individual filters', () => {
      const territoryStore = useTerritoryStore()
      const searchStore = useSearchStore()

      territoryStore.customers = mockCustomers
      searchStore.setFilter('territory', 'colorado-springs-north')
      searchStore.setFilter('salesRep', 'Kaiti Green')

      expect(searchStore.results).toHaveLength(1)

      searchStore.setFilter('territory', undefined)
      expect(searchStore.results).toHaveLength(2) // Both Kaiti Green customers
    })

    it('should clear all filters', () => {
      const territoryStore = useTerritoryStore()
      const searchStore = useSearchStore()

      territoryStore.customers = mockCustomers
      searchStore.setQuery('4EYMED')
      searchStore.setFilter('territory', 'colorado-springs-north')

      expect(searchStore.results).toHaveLength(1)

      searchStore.clearFilters()
      expect(searchStore.results).toHaveLength(1) // Query still active

      searchStore.clearAll()
      expect(searchStore.results).toHaveLength(3) // All customers
    })

    it('should handle null and empty string filter values', () => {
      const territoryStore = useTerritoryStore()
      const searchStore = useSearchStore()

      territoryStore.customers = mockCustomers

      // These should all clear the filter
      searchStore.setFilter('territory', 'colorado-springs-north')
      expect(searchStore.filters.territory).toBe('colorado-springs-north')

      searchStore.setFilter('territory', null as unknown as undefined)
      expect(searchStore.filters.territory).toBeUndefined()

      searchStore.setFilter('territory', 'colorado-springs-north')
      searchStore.setFilter('territory', '' as unknown as undefined)
      expect(searchStore.filters.territory).toBeUndefined()

      searchStore.setFilter('territory', 'colorado-springs-north')
      searchStore.setFilter('territory', undefined)
      expect(searchStore.filters.territory).toBeUndefined()
    })
  })

  describe('Active Search Detection', () => {
    it('should detect active search query', () => {
      const searchStore = useSearchStore()

      expect(searchStore.hasActiveSearch).toBe(false)

      searchStore.setQuery('test')
      expect(searchStore.hasActiveSearch).toBe(true)

      searchStore.setQuery('')
      expect(searchStore.hasActiveSearch).toBe(false)

      searchStore.setQuery('   ')
      expect(searchStore.hasActiveSearch).toBe(false)
    })

    it('should detect active filters', () => {
      const searchStore = useSearchStore()

      expect(searchStore.hasActiveSearch).toBe(false)

      searchStore.setFilter('territory', 'colorado-springs-north')
      expect(searchStore.hasActiveSearch).toBe(true)

      searchStore.clearFilters()
      expect(searchStore.hasActiveSearch).toBe(false)
    })

    it('should detect combination of query and filters', () => {
      const searchStore = useSearchStore()

      searchStore.setQuery('test')
      searchStore.setFilter('territory', 'colorado-springs-north')
      expect(searchStore.hasActiveSearch).toBe(true)

      searchStore.setQuery('')
      expect(searchStore.hasActiveSearch).toBe(true) // Filter still active

      searchStore.clearFilters()
      expect(searchStore.hasActiveSearch).toBe(false)
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty customer list', () => {
      const territoryStore = useTerritoryStore()
      const searchStore = useSearchStore()

      territoryStore.customers = []
      searchStore.setQuery('anything')

      expect(searchStore.results).toHaveLength(0)
    })

    it('should handle special characters in search', () => {
      const territoryStore = useTerritoryStore()
      const searchStore = useSearchStore()

      territoryStore.customers = mockCustomers
      searchStore.setQuery('4EYMED LLC')

      expect(searchStore.results).toHaveLength(1)
    })

    it('should handle zero sales values', () => {
      const territoryStore = useTerritoryStore()
      const searchStore = useSearchStore()

      const customerWithZeroSales: Customer = {
        ...mockCustomers[0],
        totalSales: 0,
      }

      territoryStore.customers = [customerWithZeroSales]
      searchStore.setFilter('minSales', 0)

      expect(searchStore.results).toHaveLength(1)

      searchStore.setFilter('minSales', 1)
      expect(searchStore.results).toHaveLength(0)
    })

    it('should maintain filter state when customer data changes', () => {
      const territoryStore = useTerritoryStore()
      const searchStore = useSearchStore()

      territoryStore.customers = mockCustomers
      searchStore.setFilter('territory', 'colorado-springs-north')

      expect(searchStore.results).toHaveLength(1)

      // Simulate data refresh
      territoryStore.customers = [
        ...mockCustomers,
        {
          ...mockCustomers[0],
          id: 'cn999999',
          customerNumber: 'CN999999',
          accountName: 'New Customer',
        },
      ]

      // Filter should still be active and apply to new data
      expect(searchStore.results).toHaveLength(2)
      expect(searchStore.results.every((c) => c.territory === 'colorado-springs-north')).toBe(true)
    })
  })
})

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useTerritoryStore } from '../territory'
import { useSearchStore } from '../search'
import type { Customer } from '@/types'

// Mock the CSV parser
vi.mock('@/utils/csvParser', () => ({
  CSVParser: {
    parseCSV: vi.fn(),
  },
}))

describe('Store Integration Tests', () => {
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
        daxxify: { salesByPeriod: { '2024-Q1': 1000 } },
        rha: { salesByPeriod: { '2024-Q2': 500 } },
        skinPen: { salesByPeriod: { '2024-Q3': 1632, '2024-Q4': 1728 } },
      },
      isQ3PromoTarget: true,
      totalSales: 4860,
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
        daxxify: { salesByPeriod: { '2024-Q1': 2000 } },
        rha: { salesByPeriod: {} },
        skinPen: { salesByPeriod: { '2024-Q2': 2500 } },
      },
      isQ3PromoTarget: false,
      totalSales: 4500,
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
    {
      id: 'cn123456',
      customerNumber: 'CN123456',
      accountName: 'Castle Rock Aesthetics',
      businessAddress: '123 Castle St Castle Rock CO 80104',
      salesRep: 'Kaiti Green',
      territory: 'castle-rock',
      notes: { general: 'New customer' },
      salesData: {
        daxxify: { salesByPeriod: { '2024-Q1': 3000 } },
        rha: { salesByPeriod: { '2024-Q2': 1000 } },
        skinPen: { salesByPeriod: {} },
      },
      isQ3PromoTarget: true,
      totalSales: 4000,
    },
  ]

  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
    vi.clearAllMocks()
  })

  describe('Territory and Search Store Interaction', () => {
    it('should synchronize data between territory and search stores', () => {
      const territoryStore = useTerritoryStore()
      const searchStore = useSearchStore()

      // Initially empty
      expect(searchStore.results).toHaveLength(0)

      // Load data into territory store
      territoryStore.customers = mockCustomers

      // Search store should see the data immediately
      expect(searchStore.results).toHaveLength(4)
      expect(searchStore.results).toEqual(mockCustomers)
    })

    it('should maintain search results when territory data updates', () => {
      const territoryStore = useTerritoryStore()
      const searchStore = useSearchStore()

      territoryStore.customers = mockCustomers

      // Apply a filter
      searchStore.setFilter('territory', 'colorado-springs-north')
      expect(searchStore.results).toHaveLength(1)
      expect(searchStore.results[0].accountName).toBe('4EYMED LLC')

      // Add more customers to the territory
      const newCustomer: Customer = {
        ...mockCustomers[0],
        id: 'cn999999',
        customerNumber: 'CN999999',
        accountName: 'New Springs Customer',
        territory: 'colorado-springs-north',
      }

      territoryStore.customers = [...mockCustomers, newCustomer]

      // Search should include the new customer
      expect(searchStore.results).toHaveLength(2)
      expect(searchStore.results.map((c) => c.accountName)).toContain('New Springs Customer')
    })

    it('should clear search results when territory data is cleared', () => {
      const territoryStore = useTerritoryStore()
      const searchStore = useSearchStore()

      territoryStore.customers = mockCustomers
      searchStore.setQuery('4EYMED')

      expect(searchStore.results).toHaveLength(1)

      // Clear territory data
      territoryStore.clearData()

      // Search results should be empty
      expect(searchStore.results).toHaveLength(0)
      expect(searchStore.query).toBe('4EYMED') // Query should persist
    })
  })

  describe('CSV Loading with Search Interaction', () => {
    it('should handle search during CSV loading', async () => {
      const { CSVParser } = await import('@/utils/csvParser')
      const mockParseCSV = vi.mocked(CSVParser.parseCSV)

      const territoryStore = useTerritoryStore()
      const searchStore = useSearchStore()

      // Set up search before loading
      searchStore.setQuery('Advanced')

      // Mock CSV loading
      mockParseCSV.mockResolvedValue({
        data: mockCustomers,
        errors: [],
        meta: { totalRows: 4, validRows: 4, quarterColumns: [] },
      })

      await territoryStore.loadFromCSV('mock csv')

      // Search should apply to newly loaded data
      expect(searchStore.results).toHaveLength(1)
      expect(searchStore.results[0].accountName).toBe('Advanced Dermatology')
    })

    it('should maintain complex filters during data reload', async () => {
      const { CSVParser } = await import('@/utils/csvParser')
      const mockParseCSV = vi.mocked(CSVParser.parseCSV)

      const territoryStore = useTerritoryStore()
      const searchStore = useSearchStore()

      // Initial load
      territoryStore.customers = mockCustomers

      // Set complex filters: Kaiti Green customers with high sales and Q3 promo target
      searchStore.setFilter('salesRep', 'Kaiti Green')
      searchStore.setFilter('minSales', 2000)
      searchStore.setFilter('isQ3PromoTarget', true)

      // Should find 4EYMED LLC (4860 sales, Q3 target) and Castle Rock Aesthetics (4000 sales, Q3 target)
      expect(searchStore.results).toHaveLength(2)
      const resultNames = searchStore.results.map((c) => c.accountName).sort()
      expect(resultNames).toEqual(['4EYMED LLC', 'Castle Rock Aesthetics'])

      // Reload with updated data
      const updatedCustomers = [
        ...mockCustomers,
        {
          ...mockCustomers[0],
          id: 'cn888888',
          customerNumber: 'CN888888',
          accountName: 'Another High Sales Customer',
          salesRep: 'Kaiti Green',
          totalSales: 5000,
          isQ3PromoTarget: true,
        },
      ]

      mockParseCSV.mockResolvedValue({
        data: updatedCustomers,
        errors: [],
        meta: { totalRows: 5, validRows: 5, quarterColumns: [] },
      })

      await territoryStore.loadFromCSV('updated csv')

      // Filters should still apply to the new dataset (original 2 + 1 new = 3 total matching)
      expect(searchStore.results).toHaveLength(3)
      expect(
        searchStore.results.every(
          (c) => c.salesRep === 'Kaiti Green' && c.totalSales >= 2000 && c.isQ3PromoTarget,
        ),
      ).toBe(true)

      // Verify we have the original customers plus the new one
      const names = searchStore.results.map((c) => c.accountName)
      expect(names).toContain('4EYMED LLC')
      expect(names).toContain('Castle Rock Aesthetics')
      expect(names).toContain('Another High Sales Customer')
    })
  })

  describe('Computed Property Synchronization', () => {
    it('should maintain consistency between territory stats and search results', () => {
      const territoryStore = useTerritoryStore()
      const searchStore = useSearchStore()

      territoryStore.customers = mockCustomers

      // Filter by specific territory
      searchStore.setFilter('territory', 'colorado-springs-north')

      const filteredResults = searchStore.results
      const territoryStats = territoryStore.territoryStats['colorado-springs-north']
      const territoryCustomers = territoryStore.getCustomersByTerritory('colorado-springs-north')

      // All should be consistent
      expect(filteredResults).toEqual(territoryCustomers)
      expect(filteredResults).toHaveLength(territoryStats.customerCount)

      const totalSales = filteredResults.reduce((sum, c) => sum + c.totalSales, 0)
      expect(totalSales).toBe(territoryStats.totalSales)
    })

    it('should handle sales rep filtering with territory computations', () => {
      const territoryStore = useTerritoryStore()
      const searchStore = useSearchStore()

      territoryStore.customers = mockCustomers

      // Filter by sales rep
      searchStore.setFilter('salesRep', 'Kaiti Green')

      const kaitiCustomers = searchStore.results
      const salesRepData = territoryStore.salesRepresentatives.find(
        (rep) => rep.name === 'Kaiti Green',
      )

      expect(kaitiCustomers).toEqual(salesRepData?.customers)
      expect(kaitiCustomers.reduce((sum, c) => sum + c.totalSales, 0)).toBe(
        salesRepData?.totalSales,
      )

      // Check territories covered
      const territories = [...new Set(kaitiCustomers.map((c) => c.territory))]
      expect(territories.sort()).toEqual(salesRepData?.territories.sort())
    })
  })

  describe('Real-time Updates and Reactivity', () => {
    it('should handle rapid filter changes efficiently', () => {
      const territoryStore = useTerritoryStore()
      const searchStore = useSearchStore()

      territoryStore.customers = mockCustomers

      // Rapid filter changes
      const start = performance.now()

      for (let i = 0; i < 100; i++) {
        searchStore.setFilter('minSales', i * 50)
        searchStore.setQuery(`Customer ${i}`)
        searchStore.clearFilters()
        searchStore.setFilter('territory', 'colorado-springs-north')
        searchStore.clearAll()
      }

      const end = performance.now()

      // Should complete quickly
      expect(end - start).toBeLessThan(100)
      expect(searchStore.results).toEqual(mockCustomers) // All filters cleared
    })

    it('should maintain performance with large datasets and complex filters', () => {
      const territoryStore = useTerritoryStore()
      const searchStore = useSearchStore()

      // Create large dataset
      const largeDataset: Customer[] = Array.from({ length: 1000 }, (_, i) => ({
        ...mockCustomers[i % 4],
        id: `cn${i.toString().padStart(6, '0')}`,
        customerNumber: `CN${i.toString().padStart(6, '0')}`,
        accountName: `Customer ${i}`,
        totalSales: Math.floor(Math.random() * 10000),
        isQ3PromoTarget: i % 3 === 0,
      }))

      territoryStore.customers = largeDataset

      const start = performance.now()

      // Apply complex filters
      searchStore.setQuery('Customer')
      searchStore.setFilter('minSales', 5000)
      searchStore.setFilter('isQ3PromoTarget', true)

      const results = searchStore.results

      const end = performance.now()

      // Should complete within reasonable time
      expect(end - start).toBeLessThan(50)
      expect(results.length).toBeGreaterThan(0)
      expect(
        results.every(
          (c) => c.accountName.includes('Customer') && c.totalSales >= 5000 && c.isQ3PromoTarget,
        ),
      ).toBe(true)
    })
  })

  describe('Error Handling and Edge Cases', () => {
    it('should handle territory store errors gracefully in search', async () => {
      const { CSVParser } = await import('@/utils/csvParser')
      const mockParseCSV = vi.mocked(CSVParser.parseCSV)

      const territoryStore = useTerritoryStore()
      const searchStore = useSearchStore()

      // Set up search
      searchStore.setQuery('test')

      // Mock CSV loading failure
      mockParseCSV.mockRejectedValue(new Error('CSV parsing failed'))

      try {
        await territoryStore.loadFromCSV('invalid csv')
      } catch {
        // Expected to fail
      }

      // Search should handle empty data gracefully
      expect(searchStore.results).toHaveLength(0)
      expect(searchStore.query).toBe('test') // Query preserved
      expect(territoryStore.error).toBeTruthy()
    })

    it('should handle localStorage corruption affecting both stores', () => {
      const territoryStore = useTerritoryStore()
      const searchStore = useSearchStore()

      // Corrupt localStorage
      localStorage.setItem('territory-customers', 'invalid json')

      // Try to load from storage
      const loaded = territoryStore.loadFromStorage()

      expect(loaded).toBe(false)
      expect(territoryStore.customers).toEqual([])
      expect(searchStore.results).toEqual([])

      // Stores should still function normally
      territoryStore.customers = mockCustomers
      searchStore.setQuery('4EYMED')

      expect(searchStore.results).toHaveLength(1)
    })

    it('should maintain data integrity during concurrent operations', async () => {
      const { CSVParser } = await import('@/utils/csvParser')
      const mockParseCSV = vi.mocked(CSVParser.parseCSV)

      const territoryStore = useTerritoryStore()
      const searchStore = useSearchStore()

      // Mock multiple CSV loads with different data
      mockParseCSV
        .mockResolvedValueOnce({
          data: [mockCustomers[0]],
          errors: [],
          meta: { totalRows: 1, validRows: 1, quarterColumns: [] },
        })
        .mockResolvedValueOnce({
          data: mockCustomers,
          errors: [],
          meta: { totalRows: 4, validRows: 4, quarterColumns: [] },
        })

      // Set up search filter
      searchStore.setFilter('territory', 'colorado-springs-north')

      // Start concurrent operations
      const load1 = territoryStore.loadFromCSV('csv1')
      const load2 = territoryStore.loadFromCSV('csv2')

      // Change search while loading
      searchStore.setQuery('Advanced')
      searchStore.setFilter('salesRep', 'John Smith')

      await Promise.all([load1, load2])

      // Final state should be consistent
      const results = searchStore.results
      expect(
        results.every(
          (c) =>
            c.territory === 'colorado-springs-north' ||
            c.accountName.toLowerCase().includes('advanced') ||
            c.salesRep === 'John Smith',
        ),
      ).toBe(true)
    })
  })

  describe('State Persistence Integration', () => {
    it('should coordinate localStorage between territory data and search state', () => {
      const territoryStore = useTerritoryStore()
      const searchStore = useSearchStore()

      // Load data and set up search
      territoryStore.customers = mockCustomers
      searchStore.setQuery('4EYMED')
      searchStore.setFilter('territory', 'colorado-springs-north')

      // Territory store saves to localStorage
      localStorage.setItem('territory-customers', JSON.stringify(mockCustomers))

      // Create new store instances (simulating page reload)
      const newTerritoryStore = useTerritoryStore()
      const newSearchStore = useSearchStore()

      // Load from storage
      newTerritoryStore.loadFromStorage()

      // Search should work with restored data
      newSearchStore.setQuery('4EYMED')
      expect(newSearchStore.results).toHaveLength(1)
      expect(newSearchStore.results[0].accountName).toBe('4EYMED LLC')
    })

    it('should handle partial data restoration gracefully', () => {
      const territoryStore = useTerritoryStore()
      const searchStore = useSearchStore()

      // Save data with empty sales to test robustness
      const incompleteData = mockCustomers.map((customer) => ({
        ...customer,
        salesData: {
          daxxify: { salesByPeriod: {} },
          rha: { salesByPeriod: {} },
          skinPen: { salesByPeriod: {} },
        },
        totalSales: 0,
      }))

      localStorage.setItem('territory-customers', JSON.stringify(incompleteData))

      // Load from storage
      territoryStore.loadFromStorage()

      // Search should handle incomplete data
      searchStore.setQuery('4EYMED')
      expect(searchStore.results).toHaveLength(1)

      // Territory stats should handle missing sales data
      const stats = territoryStore.territoryStats
      expect(Object.keys(stats)).toHaveLength(4) // All territories represented
    })
  })
})

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useTerritoryStore } from '../territory'
import type { Customer } from '@/types'

// Mock the CSV parser
vi.mock('@/utils/csvParser', () => ({
  CSVParser: {
    parseCSV: vi.fn()
  }
}))

const mockCustomers: Customer[] = [
  {
    id: 'cn246670',
    customerNumber: 'CN246670',
    accountName: '4EYMED LLC',
    businessAddress: '9249 Highlands Rd Colorado Springs 80920',
    salesRep: 'Kaiti Green',
    territory: 'colorado-springs-north',
    notes: {},
    salesData: {
      daxxify: { salesByPeriod: { '2024-Q1': 1000, '2024-Q2': 1200 } },
      rha: { salesByPeriod: { '2024-Q1': 500 } },
      skinPen: { salesByPeriod: { '2024-Q2': 1632, '2024-Q4': 1728 } }
    },
    isQ3PromoTarget: false,
    totalSales: 6060
  },
  {
    id: 'cn047878',
    customerNumber: 'CN047878',
    accountName: 'Advanced Dermatology',
    businessAddress: '9876 S Broadway Highlands Ranch CO 80129',
    salesRep: 'Kaiti Green',
    territory: 'highlands-ranch',
    notes: {},
    salesData: {
      daxxify: { salesByPeriod: {} },
      rha: { salesByPeriod: {} },
      skinPen: { salesByPeriod: { '2024-Q2': 2500, '2024-Q4': 2750 } }
    },
    isQ3PromoTarget: true,
    totalSales: 5250
  },
  {
    id: 'cn180974',
    customerNumber: 'CN180974',
    accountName: 'Ageless Skin Co',
    businessAddress: '5432 W Littleton Blvd Littleton CO 80120',
    salesRep: 'Bobbie Koon',
    territory: 'littleton',
    notes: {},
    salesData: {
      daxxify: { salesByPeriod: {} },
      rha: { salesByPeriod: {} },
      skinPen: { salesByPeriod: { '2024-Q3': 450, '2025-Q1': 600 } }
    },
    isQ3PromoTarget: false,
    totalSales: 1050
  }
]

describe('Territory Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    // Clear localStorage before each test
    localStorage.clear()
    vi.clearAllMocks()
  })

  describe('Initial State', () => {
    it('should initialize with empty state', () => {
      const store = useTerritoryStore()
      
      expect(store.customers).toEqual([])
      expect(store.loading).toBe(false)
      expect(store.error).toBeNull()
    })
  })

  describe('Customer Grouping', () => {
    it('should group customers by territory correctly', () => {
      const store = useTerritoryStore()
      store.customers = mockCustomers
      
      const territoryGroups = store.customersByTerritory
      
      expect(territoryGroups['colorado-springs-north']).toHaveLength(1)
      expect(territoryGroups['highlands-ranch']).toHaveLength(1)
      expect(territoryGroups['littleton']).toHaveLength(1)
      expect(territoryGroups['colorado-springs-north'][0].accountName).toBe('4EYMED LLC')
    })

    it('should group customers by sales rep correctly', () => {
      const store = useTerritoryStore()
      store.customers = mockCustomers
      
      const salesRepGroups = store.customersBySalesRep
      
      expect(salesRepGroups['Kaiti Green']).toHaveLength(2)
      expect(salesRepGroups['Bobbie Koon']).toHaveLength(1)
      expect(salesRepGroups['Kaiti Green'].map(c => c.accountName)).toEqual([
        '4EYMED LLC',
        'Advanced Dermatology'
      ])
    })
  })

  describe('Sales Representatives Computation', () => {
    it('should compute sales representatives with totals and territories', () => {
      const store = useTerritoryStore()
      store.customers = mockCustomers
      
      const reps = store.salesRepresentatives
      
      expect(reps).toHaveLength(2)
      
      const kaitiRep = reps.find(r => r.name === 'Kaiti Green')
      const bobbieRep = reps.find(r => r.name === 'Bobbie Koon')
      
      expect(kaitiRep).toBeDefined()
      expect(kaitiRep!.customers).toHaveLength(2)
      expect(kaitiRep!.totalSales).toBe(11310) // 6060 + 5250
      expect(kaitiRep!.territories).toEqual(['colorado-springs-north', 'highlands-ranch'])
      
      expect(bobbieRep).toBeDefined()
      expect(bobbieRep!.totalSales).toBe(1050)
      expect(bobbieRep!.territories).toEqual(['littleton'])
    })
  })

  describe('Territory Statistics', () => {
    it('should compute territory stats correctly', () => {
      const store = useTerritoryStore()
      store.customers = mockCustomers
      
      const stats = store.territoryStats
      
      // Colorado Springs North
      expect(stats['colorado-springs-north']).toEqual({
        customerCount: 1,
        totalSales: 6060,
        q3PromoTargets: 0,
        topProduct: 'SkinPen' // 3360 (1632+1728) > DAXXIFY 2200 > RHA 500
      })
      
      // Highlands Ranch
      expect(stats['highlands-ranch']).toEqual({
        customerCount: 1,
        totalSales: 5250,
        q3PromoTargets: 1,
        topProduct: 'SkinPen' // Only product with sales
      })
      
      // Littleton
      expect(stats['littleton']).toEqual({
        customerCount: 1,
        totalSales: 1050,
        q3PromoTargets: 0,
        topProduct: 'SkinPen' // Only product with sales
      })
    })
  })

  describe('getCustomersByTerritory', () => {
    it('should return customers for specific territory', () => {
      const store = useTerritoryStore()
      store.customers = mockCustomers
      
      const northCustomers = store.getCustomersByTerritory('colorado-springs-north')
      const highlandsCustomers = store.getCustomersByTerritory('highlands-ranch')
      const emptyTerritory = store.getCustomersByTerritory('castle-rock')
      
      expect(northCustomers).toHaveLength(1)
      expect(northCustomers[0].accountName).toBe('4EYMED LLC')
      expect(highlandsCustomers).toHaveLength(1)
      expect(emptyTerritory).toEqual([])
    })
  })

  describe('getCustomer', () => {
    it('should find customer by customer number', () => {
      const store = useTerritoryStore()
      store.customers = mockCustomers
      
      const customer = store.getCustomer('CN246670')
      expect(customer).toBeDefined()
      expect(customer!.accountName).toBe('4EYMED LLC')
      
      const nonExistent = store.getCustomer('CN999999')
      expect(nonExistent).toBeUndefined()
    })
  })

  describe('localStorage Integration', () => {
    it('should save to localStorage after successful CSV load', async () => {
      const { CSVParser } = await import('@/utils/csvParser')
      const mockParseCSV = vi.mocked(CSVParser.parseCSV)
      
      mockParseCSV.mockResolvedValue({
        data: mockCustomers,
        errors: [],
        meta: { totalRows: 3, validRows: 3, quarterColumns: [] }
      })
      
      const store = useTerritoryStore()
      await store.loadFromCSV('mock csv data')
      
      expect(localStorage.getItem('territory-customers')).toBe(JSON.stringify(mockCustomers))
      expect(localStorage.getItem('territory-last-updated')).toBeTruthy()
    })

    it('should load from localStorage when available', () => {
      localStorage.setItem('territory-customers', JSON.stringify(mockCustomers))
      
      const store = useTerritoryStore()
      const loaded = store.loadFromStorage()
      
      expect(loaded).toBe(true)
      expect(store.customers).toEqual(mockCustomers)
    })

    it('should handle corrupted localStorage data gracefully', () => {
      localStorage.setItem('territory-customers', 'invalid json')
      
      const store = useTerritoryStore()
      const loaded = store.loadFromStorage()
      
      expect(loaded).toBe(false)
      expect(store.customers).toEqual([])
    })

    it('should clear localStorage when clearData is called', () => {
      localStorage.setItem('territory-customers', JSON.stringify(mockCustomers))
      localStorage.setItem('territory-last-updated', new Date().toISOString())
      
      const store = useTerritoryStore()
      store.clearData()
      
      expect(localStorage.getItem('territory-customers')).toBeNull()
      expect(localStorage.getItem('territory-last-updated')).toBeNull()
      expect(store.customers).toEqual([])
    })
  })

  describe('CSV Loading Error Handling', () => {
    it('should handle CSV parsing errors', async () => {
      const { CSVParser } = await import('@/utils/csvParser')
      const mockParseCSV = vi.mocked(CSVParser.parseCSV)
      
      mockParseCSV.mockResolvedValue({
        data: [],
        errors: [{ row: 1, message: 'Missing required column', code: 'MISSING_COLUMN' }],
        meta: { totalRows: 0, validRows: 0, quarterColumns: [] }
      })
      
      const store = useTerritoryStore()
      
      await expect(store.loadFromCSV('invalid csv')).rejects.toThrow(
        'No customers parsed from CSV'
      )
      
      expect(store.error).toContain('No customers parsed from CSV')
      expect(store.customers).toEqual([])
    })

    it('should handle CSV parser throwing errors', async () => {
      const { CSVParser } = await import('@/utils/csvParser')
      const mockParseCSV = vi.mocked(CSVParser.parseCSV)
      
      mockParseCSV.mockRejectedValue(new Error('Invalid CSV format'))
      
      const store = useTerritoryStore()
      
      await expect(store.loadFromCSV('invalid csv')).rejects.toThrow('Invalid CSV format')
      expect(store.error).toBe('Invalid CSV format')
    })

    it('should set loading state correctly during CSV operations', async () => {
      const { CSVParser } = await import('@/utils/csvParser')
      const mockParseCSV = vi.mocked(CSVParser.parseCSV)
      
      // Mock slow parsing
      mockParseCSV.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({
          data: mockCustomers,
          errors: [],
          meta: { totalRows: 3, validRows: 3, quarterColumns: [] }
        }), 100))
      )
      
      const store = useTerritoryStore()
      
      expect(store.loading).toBe(false)
      
      const loadPromise = store.loadFromCSV('csv data')
      expect(store.loading).toBe(true)
      
      await loadPromise
      expect(store.loading).toBe(false)
    })
  })

  describe('Data Integrity', () => {
    it('should maintain referential integrity between computed properties', () => {
      const store = useTerritoryStore()
      store.customers = mockCustomers
      
      // Verify that territory groupings match individual customer territories
      const allTerritoryCustomers = Object.values(store.customersByTerritory).flat()
      expect(allTerritoryCustomers).toHaveLength(mockCustomers.length)
      
      // Verify sales rep groupings match individual customer sales reps
      const allSalesRepCustomers = Object.values(store.customersBySalesRep).flat()
      expect(allSalesRepCustomers).toHaveLength(mockCustomers.length)
      
      // Verify no customer appears in multiple territories
      const territoryCounts = Object.values(store.customersByTerritory)
        .reduce((sum, customers) => sum + customers.length, 0)
      expect(territoryCounts).toBe(mockCustomers.length)
    })

    it('should handle empty customer arrays gracefully', () => {
      const store = useTerritoryStore()
      store.customers = []
      
      expect(store.customersByTerritory).toEqual({})
      expect(store.customersBySalesRep).toEqual({})
      expect(store.salesRepresentatives).toEqual([])
      expect(store.territoryStats).toEqual({})
    })
  })
})
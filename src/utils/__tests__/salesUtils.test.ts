import { describe, it, expect } from 'vitest'
import { SalesUtils, CSVQuarterDetector } from '../salesUtils'
import type { QuarterlySales } from '@/types'

describe('SalesUtils', () => {
  const mockSalesData: QuarterlySales = {
    salesByPeriod: {
      '2024-Q1': 1000,
      '2024-Q2': 1500,
      '2024-Q3': 2000,
      '2024-Q4': 1800,
      '2025-Q1': 2200,
    },
  }

  describe('createPeriodKey', () => {
    it('should create valid period keys', () => {
      expect(SalesUtils.createPeriodKey(2024, 1)).toBe('2024-Q1')
      expect(SalesUtils.createPeriodKey(2024, 4)).toBe('2024-Q4')
      expect(SalesUtils.createPeriodKey(2025, 2)).toBe('2025-Q2')
    })

    it('should throw error for invalid quarters', () => {
      expect(() => SalesUtils.createPeriodKey(2024, 0)).toThrow('Invalid quarter: 0. Must be 1-4.')
      expect(() => SalesUtils.createPeriodKey(2024, 5)).toThrow('Invalid quarter: 5. Must be 1-4.')
    })
  })

  describe('parsePeriodKey', () => {
    it('should parse valid period keys', () => {
      expect(SalesUtils.parsePeriodKey('2024-Q1')).toEqual({ year: 2024, quarter: 1 })
      expect(SalesUtils.parsePeriodKey('2025-Q4')).toEqual({ year: 2025, quarter: 4 })
    })

    it('should return null for invalid period keys', () => {
      expect(SalesUtils.parsePeriodKey('2024-Q5')).toBeNull()
      expect(SalesUtils.parsePeriodKey('invalid')).toBeNull()
      expect(SalesUtils.parsePeriodKey('2024-Q0')).toBeNull()
    })
  })

  describe('getSalesForYear', () => {
    it('should sum all quarters for a year', () => {
      expect(SalesUtils.getSalesForYear(mockSalesData, 2024)).toBe(6300) // 1000+1500+2000+1800
      expect(SalesUtils.getSalesForYear(mockSalesData, 2025)).toBe(2200)
      expect(SalesUtils.getSalesForYear(mockSalesData, 2023)).toBe(0)
    })
  })

  describe('getSalesForQuarter', () => {
    it('should get sales for specific quarter', () => {
      expect(SalesUtils.getSalesForQuarter(mockSalesData, 2024, 2)).toBe(1500)
      expect(SalesUtils.getSalesForQuarter(mockSalesData, 2025, 1)).toBe(2200)
      expect(SalesUtils.getSalesForQuarter(mockSalesData, 2024, 1)).toBe(1000)
    })

    it('should return 0 for non-existent quarters', () => {
      expect(SalesUtils.getSalesForQuarter(mockSalesData, 2023, 1)).toBe(0)
      expect(SalesUtils.getSalesForQuarter(mockSalesData, 2025, 2)).toBe(0)
    })
  })

  describe('getTotalSales', () => {
    it('should sum all sales across all periods', () => {
      expect(SalesUtils.getTotalSales(mockSalesData)).toBe(8500)
    })

    it('should return 0 for empty sales data', () => {
      expect(SalesUtils.getTotalSales({ salesByPeriod: {} })).toBe(0)
    })
  })

  describe('getLatestSales', () => {
    it('should get the most recent sales entry', () => {
      const result = SalesUtils.getLatestSales(mockSalesData)
      expect(result).toEqual({ period: '2025-Q1', amount: 2200 })
    })

    it('should return null for empty sales data', () => {
      expect(SalesUtils.getLatestSales({ salesByPeriod: {} })).toBeNull()
    })
  })

  describe('getAllPeriods', () => {
    it('should return sorted periods', () => {
      const periods = SalesUtils.getAllPeriods(mockSalesData)
      expect(periods).toEqual(['2024-Q1', '2024-Q2', '2024-Q3', '2024-Q4', '2025-Q1'])
    })
  })

  describe('calculateGrowthRate', () => {
    it('should calculate growth rate between periods', () => {
      // From 1000 to 1500 = 50% growth
      expect(SalesUtils.calculateGrowthRate(mockSalesData, '2024-Q1', '2024-Q2')).toBe(50)
      // From 1500 to 2000 = 33.33% growth
      expect(SalesUtils.calculateGrowthRate(mockSalesData, '2024-Q2', '2024-Q3')).toBeCloseTo(
        33.33,
        2,
      )
    })

    it('should return null for invalid periods or zero base', () => {
      expect(SalesUtils.calculateGrowthRate(mockSalesData, '2023-Q1', '2024-Q1')).toBeNull()
      expect(SalesUtils.calculateGrowthRate(mockSalesData, '2024-Q1', '2023-Q1')).toBeNull()

      const zeroBaseSales: QuarterlySales = { salesByPeriod: { '2024-Q1': 0, '2024-Q2': 100 } }
      expect(SalesUtils.calculateGrowthRate(zeroBaseSales, '2024-Q1', '2024-Q2')).toBeNull()
    })
  })
})

describe('CSVQuarterDetector', () => {
  describe('isQuarterColumn', () => {
    it('should detect various quarter column formats', () => {
      // Current format
      expect(CSVQuarterDetector.isQuarterColumn('1Q24')).toBe(true)
      expect(CSVQuarterDetector.isQuarterColumn('2Q24')).toBe(true)
      expect(CSVQuarterDetector.isQuarterColumn('3q25')).toBe(true)

      // Q-year format
      expect(CSVQuarterDetector.isQuarterColumn('Q1 2024')).toBe(true)
      expect(CSVQuarterDetector.isQuarterColumn('Q2 2025')).toBe(true)
      expect(CSVQuarterDetector.isQuarterColumn('q3 2024')).toBe(true)

      // Year-Q format
      expect(CSVQuarterDetector.isQuarterColumn('2024-Q1')).toBe(true)
      expect(CSVQuarterDetector.isQuarterColumn('2025-q2')).toBe(true)
      expect(CSVQuarterDetector.isQuarterColumn('2024Q3')).toBe(true)
    })

    it('should reject non-quarter columns', () => {
      expect(CSVQuarterDetector.isQuarterColumn('PAC')).toBe(false)
      expect(CSVQuarterDetector.isQuarterColumn('Account Name')).toBe(false)
      expect(CSVQuarterDetector.isQuarterColumn('Brand')).toBe(false)
      expect(CSVQuarterDetector.isQuarterColumn('0Q24')).toBe(false) // Invalid quarter
      expect(CSVQuarterDetector.isQuarterColumn('Q5 2024')).toBe(false) // Invalid quarter
    })
  })

  describe('parseQuarterColumn', () => {
    it('should parse current format (1Q24, 2Q24)', () => {
      expect(CSVQuarterDetector.parseQuarterColumn('1Q24')).toBe('2024-Q1')
      expect(CSVQuarterDetector.parseQuarterColumn('2Q24')).toBe('2024-Q2')
      expect(CSVQuarterDetector.parseQuarterColumn('3q25')).toBe('2025-Q3')
      expect(CSVQuarterDetector.parseQuarterColumn('4Q25')).toBe('2025-Q4')
    })

    it('should parse Q-year format (Q1 2024)', () => {
      expect(CSVQuarterDetector.parseQuarterColumn('Q1 2024')).toBe('2024-Q1')
      expect(CSVQuarterDetector.parseQuarterColumn('Q2 2025')).toBe('2025-Q2')
      expect(CSVQuarterDetector.parseQuarterColumn('q3 2024')).toBe('2024-Q3')
    })

    it('should parse year-quarter formats', () => {
      expect(CSVQuarterDetector.parseQuarterColumn('2024-Q1')).toBe('2024-Q1')
      expect(CSVQuarterDetector.parseQuarterColumn('2025-q2')).toBe('2025-Q2')
      expect(CSVQuarterDetector.parseQuarterColumn('2024Q3')).toBe('2024-Q3')
    })

    it('should return null for invalid formats', () => {
      expect(CSVQuarterDetector.parseQuarterColumn('5Q24')).toBeNull()
      expect(CSVQuarterDetector.parseQuarterColumn('Q5 2024')).toBeNull()
      expect(CSVQuarterDetector.parseQuarterColumn('2024-Q5')).toBeNull()
      expect(CSVQuarterDetector.parseQuarterColumn('invalid')).toBeNull()
      expect(CSVQuarterDetector.parseQuarterColumn('PAC')).toBeNull()
    })

    it('should validate year ranges', () => {
      expect(CSVQuarterDetector.parseQuarterColumn('1Q19')).toBeNull() // 2019 too early
      expect(CSVQuarterDetector.parseQuarterColumn('1Q35')).toBeNull() // 2035 too late
      expect(CSVQuarterDetector.parseQuarterColumn('Q1 2019')).toBeNull()
      expect(CSVQuarterDetector.parseQuarterColumn('Q1 2035')).toBeNull()
    })
  })

  describe('getQuarterColumns', () => {
    it('should extract quarter columns from headers', () => {
      const headers = ['PAC', 'Account Name', '1Q24', '2Q24', '3Q24', 'Brand', 'Q1 2025']
      const result = CSVQuarterDetector.getQuarterColumns(headers)

      expect(result).toEqual([
        { original: '1Q24', standardized: '2024-Q1' },
        { original: '2Q24', standardized: '2024-Q2' },
        { original: '3Q24', standardized: '2024-Q3' },
        { original: 'Q1 2025', standardized: '2025-Q1' },
      ])
    })

    it('should handle empty headers', () => {
      expect(CSVQuarterDetector.getQuarterColumns([])).toEqual([])
    })

    it('should filter out non-quarter columns', () => {
      const headers = ['PAC', 'Brand', 'Address']
      expect(CSVQuarterDetector.getQuarterColumns(headers)).toEqual([])
    })
  })
})

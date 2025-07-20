import { describe, it, expect } from 'vitest'
import { CSVParser } from '../csvParser'

describe('CSVParser', () => {
  const sampleCSV = `PAC,I,Address,Brand,2Q24,3Q24,4Q24,1Q25,2Q25
Bobbie Koon,Absolute Medical & Aesthetics (CN267366),1234 Academy Blvd Suite 200 Colorado Springs CO 80918,DAXXIFY,,13750,10325,,
Bobbie Koon,Advanced Dermatology of the Midlands (CN047878),9876 S Broadway Highlands Ranch CO 80129,DAXXIFY,29500,7375,15045,16225,14750
Bobbie Koon,Ageless Skin Co. (CN180974),5432 W Littleton Blvd Littleton CO 80120,DAXXIFY,,,450,,`

  it('should parse CSV with correct column mapping', async () => {
    const result = await CSVParser.parseCSV(sampleCSV)
    
    console.log('Test result:', {
      data: result.data,
      errors: result.errors,
      meta: result.meta
    })
    
    expect(result.data.length).toBeGreaterThan(0)
    expect(result.errors.length).toBe(0)
  })

  it('should handle missing required columns', async () => {
    const invalidCSV = `Name,Address
    Test Business,123 Main St`
    
    const result = await CSVParser.parseCSV(invalidCSV)
    
    expect(result.data.length).toBe(0)
    expect(result.errors.length).toBeGreaterThan(0)
    expect(result.errors[0].code).toBe('MISSING_COLUMNS')
  })

  it('should assign territories based on address', async () => {
    const result = await CSVParser.parseCSV(sampleCSV)
    
    if (result.data.length > 0) {
      const customer1 = result.data.find(c => c.accountName.includes('Absolute Medical'))
      const customer2 = result.data.find(c => c.accountName.includes('Advanced Dermatology'))
      const customer3 = result.data.find(c => c.accountName.includes('Ageless Skin'))
      
      expect(customer1?.territory).toBe('colorado-springs-north') // Academy Blvd
      expect(customer2?.territory).toBe('highlands-ranch') // S Broadway Highlands Ranch
      expect(customer3?.territory).toBe('littleton') // Littleton
    }
  })

  it('should extract customer numbers correctly', async () => {
    const result = await CSVParser.parseCSV(sampleCSV)
    
    if (result.data.length > 0) {
      expect(result.data[0].customerNumber).toBe('CN267366')
      expect(result.data[1].customerNumber).toBe('CN047878')
    }
  })

  it('should parse quarterly sales data', async () => {
    const result = await CSVParser.parseCSV(sampleCSV)
    
    if (result.data.length > 0) {
      const customer = result.data[1] // Advanced Dermatology
      expect(customer.salesData.daxxify.salesByPeriod['2024-Q2']).toBe(29500)
      expect(customer.salesData.daxxify.salesByPeriod['2024-Q3']).toBe(7375)
    }
  })
})
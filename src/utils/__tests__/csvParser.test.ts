import { describe, it, expect } from 'vitest'
import { CSVParser } from '../csvParser'

describe('CSVParser', () => {
  const sampleCSV = `PAC,Account Name (CN),Address,CITY,CONTACT ,NOTES,Next Steps,SkinPen Notes,Brand,1Q24,2Q24,3Q24,4Q24,1Q25,2Q25
Kaiti Green,4EYMED LLC (CN246670),9249 Highlands Rd hts #140 Colorado Springs 80920,Colorado Springs,Christine Bradley,,,,SKINPEN,,"$1,632",,"$1,728","$1,488"
Kaiti Green,Advanced Dermatology of the Midlands (CN047878),9876 S Broadway Highlands Ranch CO 80129,Highlands Ranch,Dr. Smith,,,,SKINPEN,,"$2,500",,"$2,750","$2,200"
Kaiti Green,Ageless Skin Co. (CN180974),5432 W Littleton Blvd Littleton CO 80120,Littleton,Manager,,,,SKINPEN,,,"$450",,"$600"`

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
      const customer1 = result.data.find(c => c.accountName.includes('4EYMED LLC'))
      const customer2 = result.data.find(c => c.accountName.includes('Advanced Dermatology'))
      const customer3 = result.data.find(c => c.accountName.includes('Ageless Skin'))
      
      expect(customer1?.territory).toBe('colorado-springs-north') // Highlands Rd Colorado Springs
      expect(customer2?.territory).toBe('highlands-ranch') // S Broadway Highlands Ranch
      expect(customer3?.territory).toBe('littleton') // Littleton
    }
  })

  it('should extract customer numbers correctly', async () => {
    const result = await CSVParser.parseCSV(sampleCSV)
    
    if (result.data.length > 0) {
      expect(result.data[0].customerNumber).toBe('CN246670')
      expect(result.data[1].customerNumber).toBe('CN047878')
    }
  })

  it('should parse quarterly sales data', async () => {
    const result = await CSVParser.parseCSV(sampleCSV)
    
    if (result.data.length > 0) {
      const customer = result.data[1] // Advanced Dermatology
      expect(customer.salesData.skinPen.salesByPeriod['2024-Q2']).toBe(2500)
      expect(customer.salesData.skinPen.salesByPeriod['2024-Q4']).toBe(2750)
    }
  })
})
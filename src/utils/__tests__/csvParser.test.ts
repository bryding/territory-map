import { describe, it, expect } from 'vitest'
import { CSVParser } from '../csvParser'

describe('CSVParser', () => {
  const sampleCSV = `PAC,Account Name (CN),Address,CITY,CONTACT ,NOTES,Next Steps,SkinPen Notes,Brand,1Q24,2Q24,3Q24,4Q24,1Q25,2Q25
Kaiti Green,4EYMED LLC (CN246670),9249 Highlands Rd hts #140 Colorado Springs 80920,Colorado Springs,Christine Bradley,Can be a good client but snazzy,Follow up in Q2,Problems locking the tip,SKINPEN,,"$1,632",,"$1,728","$1,488"
Kaiti Green,Advanced Dermatology of the Midlands (CN047878),9876 S Broadway Highlands Ranch CO 80129,Highlands Ranch,Dr. Smith,Established practice,Schedule demo,Interested in expansion,SKINPEN,,"$2,500",,"$2,750","$2,200"
Kaiti Green,Ageless Skin Co. (CN180974),5432 W Littleton Blvd Littleton CO 80120,Littleton,Manager,Small solo practice,,Very satisfied with results,SKINPEN,,,"$450",,"$600"`

  const csvWithoutNotes = `PAC,Account Name (CN),Address,CITY,CONTACT ,NOTES,Next Steps,SkinPen Notes,Brand,1Q24,2Q24,3Q24,4Q24,1Q25,2Q25
Kaiti Green,Test Company (CN999999),123 Test St Denver CO,Denver,,,,,SKINPEN,,"$1,000",,,"$500"`

  it('should parse CSV with correct column mapping', async () => {
    const result = await CSVParser.parseCSV(sampleCSV)
    
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

  describe('Notes Parsing', () => {
    it('should extract all types of notes correctly', async () => {
      const result = await CSVParser.parseCSV(sampleCSV)
      
      expect(result.data.length).toBeGreaterThan(0)
      
      // Test 4EYMED LLC notes
      const customer1 = result.data.find(c => c.accountName.includes('4EYMED LLC'))
      expect(customer1?.notes.general).toBe('Can be a good client but snazzy')
      expect(customer1?.notes.contact).toContain('Follow up in Q2')
      expect(customer1?.notes.contact).toContain('Contact: Christine Bradley')
      expect(customer1?.notes.product).toBe('Problems locking the tip')
      
      // Test Advanced Dermatology notes
      const customer2 = result.data.find(c => c.accountName.includes('Advanced Dermatology'))
      expect(customer2?.notes.general).toBe('Established practice')
      expect(customer2?.notes.contact).toContain('Schedule demo')
      expect(customer2?.notes.contact).toContain('Contact: Dr. Smith')
      expect(customer2?.notes.product).toBe('Interested in expansion')
    })

    it('should handle partial notes data', async () => {
      const result = await CSVParser.parseCSV(sampleCSV)
      
      // Test Ageless Skin Co (has general and product notes, but no next steps)
      const customer3 = result.data.find(c => c.accountName.includes('Ageless Skin'))
      expect(customer3?.notes.general).toBe('Small solo practice')
      expect(customer3?.notes.contact).toContain('Contact: Manager') // Only contact info, no next steps
      expect(customer3?.notes.product).toBe('Very satisfied with results')
    })

    it('should handle empty notes gracefully', async () => {
      const result = await CSVParser.parseCSV(csvWithoutNotes)
      
      expect(result.data.length).toBe(1)
      const customer = result.data[0]
      
      // Should have empty notes object, not crash
      expect(customer.notes.general).toBeUndefined()
      expect(customer.notes.contact).toBeUndefined()
      expect(customer.notes.product).toBeUndefined()
    })

    it('should normalize CSV headers correctly for notes fields', async () => {
      // Test header normalization manually
      const testHeaderCSV = `PAC,Account Name (CN),NOTES,Next Steps,SkinPen Notes,Brand,1Q24
Kaiti Green,Test Company (CN123456),General note,Next step note,Product note,SKINPEN,"$1,000"`
      
      const result = await CSVParser.parseCSV(testHeaderCSV)
      
      expect(result.data.length).toBe(1)
      const customer = result.data[0]
      
      expect(customer.notes.general).toBe('General note')
      expect(customer.notes.contact).toBe('Next step note')
      expect(customer.notes.product).toBe('Product note')
    })

    it('should combine contact info with next steps', async () => {
      const result = await CSVParser.parseCSV(sampleCSV)
      
      const customer = result.data.find(c => c.accountName.includes('4EYMED LLC'))
      
      // Should combine both CONTACT and Next Steps fields
      expect(customer?.notes.contact).toContain('Follow up in Q2')
      expect(customer?.notes.contact).toContain('Contact: Christine Bradley')
      expect(customer?.notes.contact).toBe('Follow up in Q2. Contact: Christine Bradley')
    })
  })
})
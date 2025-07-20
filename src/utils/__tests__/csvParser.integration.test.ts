import { describe, it, expect } from 'vitest'
import { CSVParser } from '../csvParser'
import type { Customer } from '@/types'

describe('CSV Parser Integration Tests', () => {
  describe('Real-world CSV parsing scenarios', () => {
    it('should parse SkinPen CSV format correctly', async () => {
      const skinPenCSV = `PAC,Account Name (CN),Address,CITY,CONTACT ,NOTES,Next Steps,SkinPen Notes,Brand,1Q24,2Q24,3Q24,4Q24,1Q25,2Q25
Kaiti Green,4EYMED LLC (CN246670),9249 Highlands Rd hts #140 Colorado Springs 80920,Colorado Springs,Christine Bradley,,,,SKINPEN,,\"$1,632\",,\"$1,728\",\"$1,488\"
Kaiti Green,Advanced Dermatology of the Midlands (CN047878),9876 S Broadway Highlands Ranch CO 80129,Highlands Ranch,Dr. Smith,,,,SKINPEN,,\"$2,500\",,\"$2,750\",\"$2,200\"
Bobbie Koon,Ageless Skin Co. (CN180974),5432 W Littleton Blvd Littleton CO 80120,Littleton,Manager,,,,SKINPEN,,,\"$450\",,\"$600\"`

      const result = await CSVParser.parseCSV(skinPenCSV)
      
      expect(result.errors).toEqual([])
      expect(result.data).toHaveLength(3)
      expect(result.meta.totalRows).toBe(3)
      expect(result.meta.validRows).toBe(3)
      
      // Verify quarter columns detected (headers are normalized to lowercase)
      expect(result.meta.quarterColumns).toEqual([
        { original: '1q24', standardized: '2024-Q1' },
        { original: '2q24', standardized: '2024-Q2' },
        { original: '3q24', standardized: '2024-Q3' },
        { original: '4q24', standardized: '2024-Q4' },
        { original: '1q25', standardized: '2025-Q1' },
        { original: '2q25', standardized: '2025-Q2' }
      ])
      
      // Verify first customer
      const customer1 = result.data[0]
      expect(customer1.customerNumber).toBe('CN246670')
      expect(customer1.accountName).toBe('4EYMED LLC')
      expect(customer1.businessAddress).toBe('9249 Highlands Rd hts #140 Colorado Springs 80920')
      expect(customer1.territory).toBe('colorado-springs-north')
      expect(customer1.salesRep).toBe('Kaiti Green')
      expect(customer1.salesData.skinPen.salesByPeriod).toEqual({
        '2024-Q2': 1632,
        '2024-Q4': 1728,
        '2025-Q1': 1488
      })
      expect(customer1.totalSales).toBe(4848)
    })

    it('should handle multi-brand customer data aggregation', async () => {
      const multiBrandCSV = `PAC,Account Name (CN),Address,CITY,CONTACT ,NOTES,Next Steps,SkinPen Notes,Brand,1Q24,2Q24,3Q24,4Q24
Kaiti Green,MedSpa Solutions (CN123456),123 Main St Denver CO 80202,Denver,John Doe,,,,DAXXIFY,\"$5,000\",\"$6,000\",,\"$4,500\"
Kaiti Green,MedSpa Solutions (CN123456),123 Main St Denver CO 80202,Denver,John Doe,,,,RHA,\"$2,000\",\"$2,500\",,\"$3,000\"
Kaiti Green,MedSpa Solutions (CN123456),123 Main St Denver CO 80202,Denver,John Doe,,,,SKINPEN,\"$1,000\",\"$1,200\",,\"$800\"`

      const result = await CSVParser.parseCSV(multiBrandCSV)
      
      expect(result.errors).toEqual([])
      expect(result.data).toHaveLength(1) // Should be aggregated into single customer
      
      const customer = result.data[0]
      expect(customer.customerNumber).toBe('CN123456')
      expect(customer.accountName).toBe('MedSpa Solutions')
      
      // Verify brand-specific sales data
      expect(customer.salesData.daxxify.salesByPeriod).toEqual({
        '2024-Q1': 5000,
        '2024-Q2': 6000,
        '2024-Q4': 4500
      })
      expect(customer.salesData.rha.salesByPeriod).toEqual({
        '2024-Q1': 2000,
        '2024-Q2': 2500,
        '2024-Q4': 3000
      })
      expect(customer.salesData.skinPen.salesByPeriod).toEqual({
        '2024-Q1': 1000,
        '2024-Q2': 1200,
        '2024-Q4': 800
      })
      
      // Total should be sum of all brands
      expect(customer.totalSales).toBe(26000) // 15500 + 7500 + 3000
    })

    it('should handle territory assignment based on address', async () => {
      const territoryCSV = `PAC,Account Name (CN),Address,CITY,CONTACT ,NOTES,Next Steps,SkinPen Notes,Brand,1Q24
Kaiti Green,North Springs Clinic (CN111111),1234 Academy Blvd Colorado Springs 80918,Colorado Springs,Dr. North,,,,SKINPEN,\"$1,000\"
Kaiti Green,Central Springs Med (CN222222),5678 Nevada Ave Colorado Springs 80907,Colorado Springs,Dr. Central,,,,SKINPEN,\"$1,000\"
Kaiti Green,South Springs Spa (CN333333),9012 Broadmoor Colorado Springs 80906,Colorado Springs,Dr. South,,,,SKINPEN,\"$1,000\"
Kaiti Green,Highlands Clinic (CN444444),2468 Highlands Ranch Parkway Highlands Ranch 80129,Highlands Ranch,Dr. Highlands,,,,SKINPEN,\"$1,000\"
Kaiti Green,Littleton Med (CN555555),1357 Main St Littleton 80120,Littleton,Dr. Littleton,,,,SKINPEN,\"$1,000\"
Kaiti Green,Castle Rock Clinic (CN666666),8642 Castle Pines Dr Castle Rock 80108,Castle Rock,Dr. Castle,,,,SKINPEN,\"$1,000\"`

      const result = await CSVParser.parseCSV(territoryCSV)
      
      expect(result.errors).toEqual([])
      expect(result.data).toHaveLength(6)
      
      const customers = result.data
      expect(customers.find(c => c.customerNumber === 'CN111111')?.territory).toBe('colorado-springs-north')
      expect(customers.find(c => c.customerNumber === 'CN222222')?.territory).toBe('colorado-springs-central')
      expect(customers.find(c => c.customerNumber === 'CN333333')?.territory).toBe('colorado-springs-south')
      expect(customers.find(c => c.customerNumber === 'CN444444')?.territory).toBe('highlands-ranch')
      expect(customers.find(c => c.customerNumber === 'CN555555')?.territory).toBe('littleton')
      expect(customers.find(c => c.customerNumber === 'CN666666')?.territory).toBe('castle-rock')
    })

    it('should validate sales representatives', async () => {
      const invalidRepCSV = `PAC,Account Name (CN),Address,CITY,CONTACT ,NOTES,Next Steps,SkinPen Notes,Brand,1Q24
Unknown Rep,Test Clinic (CN111111),123 Test St,Test City,Dr. Test,,,,SKINPEN,\"$1,000\"
Kaiti Green,Valid Clinic (CN222222),456 Valid St,Valid City,Dr. Valid,,,,SKINPEN,\"$1,000\"`

      const result = await CSVParser.parseCSV(invalidRepCSV)
      
      // Should have warning about unknown rep but still parse the data
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0].code).toBe('INVALID_SALES_REP')
      expect(result.errors[0].message).toContain('Unknown Rep')
      
      // Both customers should still be parsed
      expect(result.data).toHaveLength(2)
    })

    it('should handle missing required columns', async () => {
      const invalidCSV = `Name,Address,Contact
Test Business,123 Main St,John Doe`

      const result = await CSVParser.parseCSV(invalidCSV)
      
      expect(result.data).toEqual([])
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0].code).toBe('MISSING_COLUMNS')
      expect(result.errors[0].message).toContain('Missing required columns')
    })

    it('should skip total rows and invalid data', async () => {
      const csvWithTotals = `PAC,Account Name (CN),Address,CITY,CONTACT ,NOTES,Next Steps,SkinPen Notes,Brand,1Q24
Kaiti Green,Valid Clinic (CN111111),123 Valid St,Valid City,Dr. Valid,,,,SKINPEN,\"$1,000\"
,Total,,,,,,,\"$1,000\"
,Invalid Row without CN,,,,,,,SKINPEN,\"$500\"
Kaiti Green,Another Valid (CN222222),456 Another St,Another City,Dr. Another,,,,SKINPEN,\"$1,500\"`

      const result = await CSVParser.parseCSV(csvWithTotals)
      
      // Should only parse valid customers, skip totals and invalid rows
      expect(result.data).toHaveLength(2)
      expect(result.data.map(c => c.customerNumber)).toEqual(['CN111111', 'CN222222'])
    })

    it('should handle various money formats in sales data', async () => {
      const moneyFormatCSV = `PAC,Account Name (CN),Address,CITY,CONTACT ,NOTES,Next Steps,SkinPen Notes,Brand,1Q24,2Q24,3Q24,4Q24
Kaiti Green,Money Test (CN111111),123 Test St,Test City,Dr. Test,,,,SKINPEN,\"$1,000\",\"$2,500.50\",\"1200\",\"$3,750.75\"`

      const result = await CSVParser.parseCSV(moneyFormatCSV)
      
      expect(result.data).toHaveLength(1)
      const customer = result.data[0]
      expect(customer.salesData.skinPen.salesByPeriod).toEqual({
        '2024-Q1': 1000,
        '2024-Q2': 2500.5,
        '2024-Q3': 1200,
        '2024-Q4': 3750.75
      })
      expect(customer.totalSales).toBe(8451.25)
    })

    it('should handle empty sales values gracefully', async () => {
      const emptySalesCSV = `PAC,Account Name (CN),Address,CITY,CONTACT ,NOTES,Next Steps,SkinPen Notes,Brand,1Q24,2Q24,3Q24,4Q24
Kaiti Green,Empty Sales (CN111111),123 Test St,Test City,Dr. Test,,,,SKINPEN,\"$1,000\",,\"\",\"$500\"`

      const result = await CSVParser.parseCSV(emptySalesCSV)
      
      expect(result.data).toHaveLength(1)
      const customer = result.data[0]
      expect(customer.salesData.skinPen.salesByPeriod).toEqual({
        '2024-Q1': 1000,
        '2024-Q4': 500
      })
      expect(customer.totalSales).toBe(1500)
    })
  })

  describe('Data consistency and integrity', () => {
    it('should maintain data consistency across parsing operations', async () => {
      const csv = `PAC,Account Name (CN),Address,CITY,CONTACT ,NOTES,Next Steps,SkinPen Notes,Brand,1Q24,2Q24
Kaiti Green,Test Customer (CN123456),123 Test St,Test City,Dr. Test,,,,SKINPEN,\"$1,000\",\"$1,500\"`

      // Parse the same CSV multiple times
      const results = await Promise.all([
        CSVParser.parseCSV(csv),
        CSVParser.parseCSV(csv),
        CSVParser.parseCSV(csv)
      ])

      // All results should be identical
      for (let i = 1; i < results.length; i++) {
        expect(results[i].data).toEqual(results[0].data)
        expect(results[i].errors).toEqual(results[0].errors)
        expect(results[i].meta).toEqual(results[0].meta)
      }
    })

    it('should preserve customer data integrity during aggregation', async () => {
      const csv = `PAC,Account Name (CN),Address,CITY,CONTACT ,NOTES,Next Steps,SkinPen Notes,Brand,1Q24,2Q24
Kaiti Green,Multi Brand (CN123456),123 Test St,Test City,Dr. Test,,,,DAXXIFY,\"$1,000\",\"$1,500\"
Kaiti Green,Multi Brand (CN123456),123 Test St,Test City,Dr. Test,,,,RHA,\"$500\",\"$750\"
Kaiti Green,Multi Brand (CN123456),123 Test St,Test City,Dr. Test,,,,SKINPEN,\"$300\",\"$400\"`

      const result = await CSVParser.parseCSV(csv)
      
      expect(result.data).toHaveLength(1)
      const customer = result.data[0]
      
      // Verify customer metadata is preserved
      expect(customer.customerNumber).toBe('CN123456')
      expect(customer.accountName).toBe('Multi Brand')
      expect(customer.salesRep).toBe('Kaiti Green')
      
      // Verify sales data is correctly aggregated
      const totalDaxxify = Object.values(customer.salesData.daxxify.salesByPeriod).reduce((a, b) => a + b, 0)
      const totalRha = Object.values(customer.salesData.rha.salesByPeriod).reduce((a, b) => a + b, 0)
      const totalSkinPen = Object.values(customer.salesData.skinPen.salesByPeriod).reduce((a, b) => a + b, 0)
      
      expect(totalDaxxify).toBe(2500)
      expect(totalRha).toBe(1250)
      expect(totalSkinPen).toBe(700)
      expect(customer.totalSales).toBe(4450)
    })
  })
})
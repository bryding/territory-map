import { describe, it, expect } from 'vitest'
import { CSVParser } from '../csvParser'
import fs from 'fs'
import path from 'path'

describe('CSV Parser End-to-End Tests', () => {
  it('should parse actual sample-data.csv file and extract notes correctly', async () => {
    // Read the actual CSV file from public/data
    const csvPath = path.join(process.cwd(), 'public/data/sample-data.csv')
    
    // Check if file exists
    expect(fs.existsSync(csvPath)).toBe(true)
    
    // Read the CSV content
    const csvContent = fs.readFileSync(csvPath, 'utf-8')
    
    // Parse with our CSV parser
    const result = await CSVParser.parseCSV(csvContent)
    
    // Should have parsed successfully
    expect(result.errors.length).toBe(0)
    expect(result.data.length).toBeGreaterThan(0)
    
    console.log(`📊 Parsed ${result.data.length} customers from actual CSV`)
    
    // Find customers that should have notes based on the CSV content
    const customerWithNotes = result.data.find(customer => 
      customer.accountName.includes('4EYMED LLC')
    )
    
    const anotherCustomerWithNotes = result.data.find(customer => 
      customer.accountName.includes('Alana Rose Skin')
    )
    
    const customerWithGeneralNotes = result.data.find(customer => 
      customer.accountName.includes('Albert Vein Institute')
    )
    
    // Log what we found for debugging
    console.log('🔍 4EYMED LLC customer:', {
      found: !!customerWithNotes,
      notes: customerWithNotes?.notes
    })
    
    console.log('🔍 Alana Rose Skin customer:', {
      found: !!anotherCustomerWithNotes,
      notes: anotherCustomerWithNotes?.notes
    })
    
    console.log('🔍 Albert Vein Institute customer:', {
      found: !!customerWithGeneralNotes,
      notes: customerWithGeneralNotes?.notes
    })
    
    // Test specific customers we know have notes in the CSV
    if (customerWithNotes) {
      // 4EYMED LLC should have notes: "Can be a good client but snazzy..."
      expect(customerWithNotes.notes.general).toBeDefined()
      expect(customerWithNotes.notes.general).toContain('Can be a good client')
      
      // Should have contact info: "Christine Bradley, owner"
      if (customerWithNotes.notes.contact) {
        expect(customerWithNotes.notes.contact).toContain('Christine Bradley')
      }
    } else {
      console.warn('⚠️ Could not find 4EYMED LLC customer in parsed data')
    }
    
    if (anotherCustomerWithNotes) {
      // Alana Rose Skin should have notes: "Small, solo esti,"
      expect(anotherCustomerWithNotes.notes.general).toBeDefined()
      expect(anotherCustomerWithNotes.notes.general).toContain('Small')
    } else {
      console.warn('⚠️ Could not find Alana Rose Skin customer in parsed data')
    }
    
    if (customerWithGeneralNotes) {
      // Albert Vein Institute should have notes about auto ship
      expect(customerWithGeneralNotes.notes.general).toBeDefined()
      expect(customerWithGeneralNotes.notes.general).toContain('auto ship')
    } else {
      console.warn('⚠️ Could not find Albert Vein Institute customer in parsed data')
    }
    
    // Count how many customers have any notes
    const customersWithNotes = result.data.filter(customer => 
      customer.notes.general || customer.notes.contact || customer.notes.product
    )
    
    console.log(`📝 Found ${customersWithNotes.length} customers with notes out of ${result.data.length} total`)
    
    // We should have at least some customers with notes
    expect(customersWithNotes.length).toBeGreaterThan(0)
  })

  it('should identify all note field variations in the actual CSV', async () => {
    const csvPath = path.join(process.cwd(), 'public/data/sample-data.csv')
    const csvContent = fs.readFileSync(csvPath, 'utf-8')
    
    // Parse CSV manually to check headers
    const lines = csvContent.split('\n')
    const headers = lines[0].split(',')
    
    console.log('📋 All CSV headers:', headers)
    
    // Check that we have the expected notes columns
    const notesIndex = headers.findIndex(h => h.trim().toUpperCase() === 'NOTES')
    const nextStepsIndex = headers.findIndex(h => h.trim() === 'Next Steps')
    const skinPenNotesIndex = headers.findIndex(h => h.trim() === 'SkinPen Notes')
    const contactIndex = headers.findIndex(h => h.trim().startsWith('CONTACT'))
    
    console.log('🔍 Column indices:', {
      notes: notesIndex,
      nextSteps: nextStepsIndex,
      skinPenNotes: skinPenNotesIndex,
      contact: contactIndex
    })
    
    expect(notesIndex).toBeGreaterThan(-1)
    expect(contactIndex).toBeGreaterThan(-1)
    
    // Parse a few sample rows to see the actual data
    for (let i = 1; i <= Math.min(5, lines.length - 1); i++) {
      const row = lines[i].split(',')
      if (row.length > Math.max(notesIndex, contactIndex)) {
        console.log(`📄 Row ${i}:`, {
          accountName: row[1],
          notes: notesIndex > -1 ? row[notesIndex] : 'N/A',
          contact: contactIndex > -1 ? row[contactIndex] : 'N/A',
          nextSteps: nextStepsIndex > -1 ? row[nextStepsIndex] : 'N/A',
          skinPenNotes: skinPenNotesIndex > -1 ? row[skinPenNotesIndex] : 'N/A'
        })
      }
    }
  })
})
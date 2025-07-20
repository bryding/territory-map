import { describe, it, expect } from 'vitest'
import { CSVQuarterDetector } from '../salesUtils'

describe('Quarter Parsing Debug', () => {
  it('should parse individual quarter columns', () => {
    const testCases = ['2q24', '3q24', '4q24', '1q25', '2q25']
    
    testCases.forEach(testCase => {
      console.log(`Testing: "${testCase}"`)
      const result = CSVQuarterDetector.parseQuarterColumn(testCase)
      console.log(`Result: ${result}`)
      expect(result).not.toBeNull()
    })
  })

  it('should test regex patterns directly', () => {
    const patterns = [
      /^(\d{1})[Qq](\d{2})$/,        // "2Q24", "3Q24", "2q24", "3q24" (current format)
      /^[Qq](\d{1})\s*(\d{4})$/,     // "Q2 2024", "Q3 2024", "q2 2024"
      /^(\d{4})-[Qq](\d{1})$/,       // "2024-Q2", "2024-Q3", "2024-q2"
      /^(\d{4})[Qq](\d{1})$/,        // "2024Q2", "2024Q3", "2024q2"
    ]

    const testString = '2q24'
    patterns.forEach((pattern, index) => {
      const match = testString.match(pattern)
      console.log(`Pattern ${index}: ${pattern}`)
      console.log(`Match result:`, match)
    })
  })
})
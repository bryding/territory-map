import { useTerritoryStore } from '@/stores/territory'

/**
 * Load test data from the CSV file in the data directory
 */
export async function loadTestData() {
  const territoryStore = useTerritoryStore()
  
  try {
    // Fetch the CSV file from the public data directory
    const response = await fetch('/data/High Plains Sales Data.csv')
    if (!response.ok) {
      throw new Error(`Failed to fetch CSV: ${response.statusText}`)
    }
    
    const csvText = await response.text()
    await territoryStore.loadFromCSV(csvText)
    
    console.log('✅ Test data loaded successfully!')
    return true
  } catch (error) {
    console.error('❌ Failed to load test data:', error)
    return false
  }
}

// Make this available globally for testing in browser console
if (typeof window !== 'undefined') {
  (window as any).loadTestData = loadTestData
}
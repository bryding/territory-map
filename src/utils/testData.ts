import { useTerritoryStore } from '@/stores/territory'

/**
 * Load test data from any CSV file in the data directory
 */
export async function loadTestData() {
  const territoryStore = useTerritoryStore()
  
  try {
    // Common CSV filenames to try
    const possibleFiles = [
      'sample-data.csv',
      'High Plains Sales Data.csv',
      'Denver South Territory File.csv',
      'sales-data.csv',
      'territory-data.csv',
      'data.csv'
    ]
    
    let csvText = ''
    let loadedFrom = ''
    
    // Clear existing data first
    territoryStore.clearData()
    
    // Try to load from any of the possible CSV files
    for (const filename of possibleFiles) {
      try {
        // Always use cache busting for reliable reloads
        const cacheBuster = `?t=${Date.now()}&r=${Math.random()}`
        const url = `/data/${filename}${cacheBuster}`
        
        console.log(`📥 Attempting to load CSV data from: ${url}`)
        
        const response = await fetch(url, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        })
        
        if (response.ok) {
          csvText = await response.text()
          loadedFrom = filename
          console.log(`📄 Successfully loaded ${filename} - ${csvText.length} characters`)
          
          // Log first few lines to help debug
          const lines = csvText.split('\n').slice(0, 3)
          console.log('📋 First 3 lines of CSV:', lines)
          break
        }
      } catch {
        console.log(`⚠️ Failed to load ${filename}, trying next...`)
        continue
      }
    }
    
    if (!csvText) {
      throw new Error('No CSV files found in /data/ directory. Please add a CSV file.')
    }
    
    await territoryStore.loadFromCSV(csvText)
    
    if (territoryStore.customers.length === 0) {
      throw new Error('No customers were parsed from CSV data')
    }
    
    console.log(`✅ Test data loaded successfully from ${loadedFrom}! ${territoryStore.customers.length} customers loaded`)
    return true
  } catch (error) {
    console.error('❌ Failed to load test data:', error)
    return false
  }
}

// Make this available globally for testing in browser console
if (typeof window !== 'undefined') {
  (window as unknown as Record<string, unknown>).loadTestData = loadTestData
}
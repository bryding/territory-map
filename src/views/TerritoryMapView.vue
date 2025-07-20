<template>
  <div class="territory-map-view">
    <header class="app-header">
      <div class="header-top">
        <h1>Territory Call Map</h1>
        <button v-if="!loading && customers.length > 0" @click="reloadData" class="reload-button" :disabled="reloading">
          <span v-if="reloading">🔄</span>
          <span v-else>🔄</span>
          {{ reloading ? 'Reloading...' : 'Reload Data' }}
        </button>
      </div>
      
      <div v-if="!loading && customers.length > 0" class="territory-filter">
        <label for="territory-select" class="filter-label">Territory:</label>
        <select 
          id="territory-select" 
          v-model="selectedTerritory" 
          class="territory-select"
        >
          <option value="">All Territories</option>
          <option 
            v-for="territory in availableTerritories" 
            :key="territory" 
            :value="territory"
          >
            {{ formatTerritoryName(territory) }} ({{ getCustomersByTerritory(territory).length }})
          </option>
        </select>
      </div>
      
      <div v-if="!loading && customers.length > 0" class="header-stats">
        <span>{{ filteredCustomers.length }} customers</span>
        <span>${{ formatCurrency(filteredTotalSales) }}</span>
      </div>
    </header>

    <div v-if="loading" class="loading">
      <div class="loading-spinner"></div>
      <p>Loading territory data...</p>
    </div>

    <div v-else-if="error" class="error">
      <p>{{ error }}</p>
      <button @click="retryLoad" class="retry-button">Retry</button>
    </div>

    <div v-else-if="customers.length === 0" class="empty-state">
      <CSVLoader />
    </div>

    <div v-else class="customer-list">
      <div v-if="filteredCustomers.length === 0" class="no-customers">
        <p>No customers found{{ selectedTerritory ? ` in ${formatTerritoryName(selectedTerritory)}` : '' }}</p>
      </div>
      <div v-else class="customers-grid">
        <CustomerCard
          v-for="customer in filteredCustomers"
          :key="customer.id"
          :customer="customer"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type { Territory } from '@/types'
import { useTerritoryStore } from '@/stores/territory'
import CustomerCard from '@/components/CustomerCard.vue'
import CSVLoader from '@/components/CSVLoader.vue'
import { loadTestData } from '@/utils/testData'

const territoryStore = useTerritoryStore()
const reloading = ref(false)
const selectedTerritory = ref<Territory | ''>('')

// Territory order for display
const territories: Territory[] = [
  'colorado-springs-north',
  'colorado-springs-central', 
  'colorado-springs-south',
  'highlands-ranch',
  'littleton',
  'castle-rock'
]

const customers = computed(() => territoryStore.customers)
const loading = computed(() => territoryStore.loading)
const error = computed(() => territoryStore.error)

// Get territories that actually have customers
const availableTerritories = computed(() => {
  return territories.filter(territory => 
    territoryStore.getCustomersByTerritory(territory).length > 0
  )
})

// Filtered customers based on selected territory
const filteredCustomers = computed(() => {
  if (!selectedTerritory.value) {
    return customers.value
  }
  return territoryStore.getCustomersByTerritory(selectedTerritory.value)
})

// Total sales for filtered customers
const filteredTotalSales = computed(() => {
  return filteredCustomers.value.reduce((sum, customer) => sum + customer.totalSales, 0)
})

function getCustomersByTerritory(territory: Territory) {
  return territoryStore.getCustomersByTerritory(territory)
}

function formatTerritoryName(territory: Territory): string {
  const names: Record<Territory, string> = {
    'colorado-springs-north': 'Colorado Springs North',
    'colorado-springs-central': 'Colorado Springs Central',
    'colorado-springs-south': 'Colorado Springs South',
    'highlands-ranch': 'Highlands Ranch',
    'littleton': 'Littleton',
    'castle-rock': 'Castle Rock'
  }
  return names[territory]
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US').format(amount)
}

async function retryLoad() {
  // Try to load from storage first
  if (!territoryStore.loadFromStorage()) {
    // If no stored data, would need to reload CSV
    // For now, just clear the error
    territoryStore.clearData()
  }
}

async function reloadData() {
  reloading.value = true
  try {
    console.log('🔄 Reloading data...')
    const success = await loadTestData(true) // Force reload with cache busting
    if (success) {
      console.log('✅ Data reloaded successfully!')
    } else {
      console.error('❌ Failed to reload data')
    }
  } catch (error) {
    console.error('Failed to reload data:', error)
  } finally {
    reloading.value = false
  }
}

onMounted(() => {
  // Try to load data from localStorage on app start
  if (customers.value.length === 0) {
    territoryStore.loadFromStorage()
  }
})
</script>

<style scoped>
.territory-map-view {
  min-height: 100vh;
  background: #f8fafc;
}

.app-header {
  background: white;
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
  position: sticky;
  top: 0;
  z-index: 10;
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.app-header h1 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
}

.reload-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s;
}

.reload-button:hover:not(:disabled) {
  background: #e5e7eb;
  border-color: #9ca3af;
}

.reload-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.reload-button:disabled span {
  animation: spin 1s linear infinite;
}

.header-stats {
  display: flex;
  gap: 1rem;
  font-size: 0.875rem;
  color: #6b7280;
}

.loading, .error, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  padding: 2rem;
  text-align: center;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e5e7eb;
  border-top: 3px solid #2563eb;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error {
  color: #dc2626;
}

.retry-button {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
}

.retry-button:hover {
  background: #1d4ed8;
}

.territory-filter {
  padding: 0 1rem 1rem 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.filter-label {
  font-weight: 500;
  color: #374151;
  font-size: 0.875rem;
}

.territory-select {
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  color: #374151;
  font-size: 0.875rem;
  min-width: 200px;
  cursor: pointer;
  transition: border-color 0.2s;
}

.territory-select:hover {
  border-color: #9ca3af;
}

.territory-select:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.customer-list {
  padding: 1rem;
}

.no-customers {
  text-align: center;
  padding: 2rem;
  color: #6b7280;
}

.customers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1rem;
  max-width: 1200px;
  margin: 0 auto;
}

/* iPhone-specific optimizations */
@media (max-width: 480px) {
  .customers-grid {
    grid-template-columns: 1fr;
    padding: 0;
    gap: 1rem;
  }
  
  .territory-filter {
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;
    padding: 1rem;
  }
  
  .filter-label {
    font-size: 1rem;
  }
  
  .territory-select {
    min-width: auto;
    padding: 0.75rem;
    font-size: 1rem;
    border-radius: 8px;
  }
  
  .app-header {
    padding: 1rem 1rem 1.5rem 1rem;
  }
  
  .header-top {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
    margin-bottom: 1rem;
  }
  
  .app-header h1 {
    font-size: 1.5rem;
    margin: 0;
  }
  
  .reload-button {
    align-self: stretch;
    justify-content: center;
    padding: 0.75rem 1rem;
    font-size: 1rem;
    border-radius: 8px;
    min-height: 44px;
  }
  
  .header-stats {
    flex-direction: row;
    gap: 1rem;
    font-size: 1rem;
  }

  .loading, .error, .empty-state {
    padding: 1rem;
    min-height: 60vh;
  }

  .loading p, .error p {
    font-size: 1.1rem;
    line-height: 1.4;
  }

  .retry-button {
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
    min-height: 44px;
    border-radius: 8px;
  }
}
</style>
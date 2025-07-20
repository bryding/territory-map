import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Customer, SearchFilters } from '@/types'
import { useTerritoryStore } from './territory'

export const useSearchStore = defineStore('search', () => {
  // State
  const query = ref('')
  const filters = ref<SearchFilters>({})
  const isSearching = ref(false)

  // Dependencies
  const territoryStore = useTerritoryStore()

  // Computed - Search results
  const results = computed((): Customer[] => {
    const searchQuery = query.value.toLowerCase().trim()
    const activeFilters = filters.value
    
    let filteredCustomers = territoryStore.customers

    // Apply text search
    if (searchQuery) {
      filteredCustomers = filteredCustomers.filter(customer => 
        customer.accountName.toLowerCase().includes(searchQuery) ||
        customer.customerNumber.toLowerCase().includes(searchQuery) ||
        customer.salesRep.toLowerCase().includes(searchQuery) ||
        customer.businessAddress.toLowerCase().includes(searchQuery)
      )
    }

    // Apply filters
    if (activeFilters.territory) {
      filteredCustomers = filteredCustomers.filter(c => c.territory === activeFilters.territory)
    }

    if (activeFilters.salesRep) {
      filteredCustomers = filteredCustomers.filter(c => c.salesRep === activeFilters.salesRep)
    }

    if (activeFilters.isQ3PromoTarget !== undefined) {
      filteredCustomers = filteredCustomers.filter(c => c.isQ3PromoTarget === activeFilters.isQ3PromoTarget)
    }

    if (activeFilters.minSales !== undefined) {
      filteredCustomers = filteredCustomers.filter(c => c.totalSales >= activeFilters.minSales!)
    }

    if (activeFilters.maxSales !== undefined) {
      filteredCustomers = filteredCustomers.filter(c => c.totalSales <= activeFilters.maxSales!)
    }

    return filteredCustomers
  })

  // Computed - Has active search/filters
  const hasActiveSearch = computed(() => {
    return query.value.trim().length > 0 || Object.keys(filters.value).length > 0
  })

  // Actions
  function setQuery(newQuery: string) {
    query.value = newQuery
  }

  function setFilter<K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) {
    if (value === undefined || value === null || value === '') {
      delete filters.value[key]
    } else {
      filters.value[key] = value
    }
  }

  function clearFilters() {
    filters.value = {}
  }

  function clearAll() {
    query.value = ''
    filters.value = {}
  }

  return {
    // State
    query,
    filters,
    isSearching,
    
    // Computed
    results,
    hasActiveSearch,
    
    // Actions
    setQuery,
    setFilter,
    clearFilters,
    clearAll
  }
})
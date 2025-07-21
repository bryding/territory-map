import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Customer, Territory, SalesRepresentative, TerritoryStats } from '@/types'
import { CSVParser } from '@/utils/csvParser'
import { SalesUtils } from '@/utils/salesUtils'

export const useTerritoryStore = defineStore('territory', () => {
  // State
  const customers = ref<Customer[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Computed - Territory groups
  const customersByTerritory = computed(() => {
    return customers.value.reduce(
      (acc, customer) => {
        if (!acc[customer.territory]) {
          acc[customer.territory] = []
        }
        acc[customer.territory].push(customer)
        return acc
      },
      {} as Record<Territory, Customer[]>,
    )
  })

  // Computed - Sales rep groups
  const customersBySalesRep = computed(() => {
    return customers.value.reduce(
      (acc, customer) => {
        if (!acc[customer.salesRep]) {
          acc[customer.salesRep] = []
        }
        acc[customer.salesRep].push(customer)
        return acc
      },
      {} as Record<string, Customer[]>,
    )
  })

  // Computed - Sales representatives
  const salesRepresentatives = computed((): SalesRepresentative[] => {
    return Object.entries(customersBySalesRep.value).map(([name, repCustomers]) => ({
      name,
      customers: repCustomers,
      totalSales: repCustomers.reduce((sum, customer) => sum + customer.totalSales, 0),
      territories: [...new Set(repCustomers.map((c) => c.territory))],
    }))
  })

  // Computed - Territory statistics
  const territoryStats = computed((): Record<Territory, TerritoryStats> => {
    const stats: Partial<Record<Territory, TerritoryStats>> = {}

    Object.entries(customersByTerritory.value).forEach(([territory, territoryCustomers]) => {
      const totalSales = territoryCustomers.reduce((sum, customer) => sum + customer.totalSales, 0)
      const q3PromoTargets = territoryCustomers.filter((c) => c.isQ3PromoTarget).length

      // Find top product by total sales
      const productSales = { DAXXIFY: 0, RHA: 0, SkinPen: 0 }
      territoryCustomers.forEach((customer) => {
        productSales.DAXXIFY += SalesUtils.getTotalSales(customer.salesData.daxxify)
        productSales.RHA += SalesUtils.getTotalSales(customer.salesData.rha)
        productSales.SkinPen += SalesUtils.getTotalSales(customer.salesData.skinPen)
      })

      const topProduct = Object.entries(productSales).sort(([, a], [, b]) => b - a)[0][0] as
        | 'DAXXIFY'
        | 'RHA'
        | 'SkinPen'

      stats[territory as Territory] = {
        customerCount: territoryCustomers.length,
        totalSales,
        q3PromoTargets,
        topProduct,
      }
    })

    return stats as Record<Territory, TerritoryStats>
  })

  // Actions
  async function loadFromCSV(csvText: string) {
    loading.value = true
    error.value = null

    try {
      const result = await CSVParser.parseCSV(csvText)

      if (result.errors.length > 0) {
        console.warn('CSV parsing warnings:', result.errors)
      }

      if (result.data.length === 0) {
        throw new Error(
          `No customers parsed from CSV. Errors: ${result.errors.map((e) => e.message).join(', ')}`,
        )
      }

      customers.value = result.data

      // Store in localStorage for offline access
      localStorage.setItem('territory-customers', JSON.stringify(result.data))
      localStorage.setItem('territory-last-updated', new Date().toISOString())
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to parse CSV'
      throw err
    } finally {
      loading.value = false
    }
  }

  function loadFromStorage() {
    try {
      const stored = localStorage.getItem('territory-customers')
      if (stored) {
        customers.value = JSON.parse(stored)
        return true
      }
    } catch (err) {
      console.error('Failed to load from storage:', err)
    }
    return false
  }

  function clearData() {
    customers.value = []
    localStorage.removeItem('territory-customers')
    localStorage.removeItem('territory-last-updated')
  }

  function getCustomer(customerNumber: string): Customer | undefined {
    return customers.value.find((c) => c.customerNumber === customerNumber)
  }

  function getCustomersByTerritory(territory: Territory): Customer[] {
    return customersByTerritory.value[territory] || []
  }

  return {
    // State
    customers,
    loading,
    error,

    // Computed
    customersByTerritory,
    customersBySalesRep,
    salesRepresentatives,
    territoryStats,

    // Actions
    loadFromCSV,
    loadFromStorage,
    clearData,
    getCustomer,
    getCustomersByTerritory,
  }
})

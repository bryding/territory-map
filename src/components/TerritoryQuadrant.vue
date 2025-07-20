<template>
  <div class="territory-quadrant">
    <header class="quadrant-header">
      <h2>{{ territoryName }}</h2>
      <div class="stats">
        <span class="customer-count">{{ customers.length }} customers</span>
        <span class="total-sales">${{ formatCurrency(totalSales) }}</span>
      </div>
    </header>
    
    <div class="customer-list">
      <CustomerCard 
        v-for="customer in customers"
        :key="customer.id"
        :customer="customer"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Customer, Territory } from '@/types'
import CustomerCard from './CustomerCard.vue'

interface Props {
  territory: Territory
  customers: Customer[]
}

const props = defineProps<Props>()

const territoryName = computed(() => {
  const names: Record<Territory, string> = {
    'colorado-springs-north': 'Colorado Springs North',
    'colorado-springs-south': 'Colorado Springs South',
    'colorado-springs-central': 'Colorado Springs Central',
    'highlands-ranch': 'Highlands Ranch',
    'littleton': 'Littleton',
    'castle-rock': 'Castle Rock'
  }
  return names[props.territory]
})

const totalSales = computed(() => {
  return props.customers.reduce((sum, customer) => sum + customer.totalSales, 0)
})

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US').format(amount)
}
</script>

<style scoped>
.territory-quadrant {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.quadrant-header {
  background: #2563eb;
  color: white;
  padding: 1rem;
}

.quadrant-header h2 {
  margin: 0 0 0.5rem 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.stats {
  display: flex;
  gap: 1rem;
  font-size: 0.875rem;
  opacity: 0.9;
}

.customer-list {
  max-height: 500px;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}
</style>
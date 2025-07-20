<template>
  <div class="customer-card" @click="openMaps">
    <div class="card-header">
      <div class="account-info">
        <h3 class="account-name">{{ customer.accountName }}</h3>
        <span class="customer-number">{{ customer.customerNumber }}</span>
        <span v-if="customer.isQ3PromoTarget" class="promo-badge">🎯</span>
      </div>
      <div class="total-sales">
        ${{ formatCurrency(customer.totalSales) }}
      </div>
    </div>
    
    <div class="card-body">
      <div class="address">
        <span class="address-icon">📍</span>
        {{ customer.businessAddress }}
      </div>
      
      <div class="sales-data">
        <div v-if="hasSales(customer.salesData.daxxify)" class="product-sales">
          <span class="product-name">DAXXIFY:</span>
          <span class="sales-amount">${{ formatCurrency(getTotalSales(customer.salesData.daxxify)) }}</span>
        </div>
        <div v-if="hasSales(customer.salesData.rha)" class="product-sales">
          <span class="product-name">RHA:</span>
          <span class="sales-amount">${{ formatCurrency(getTotalSales(customer.salesData.rha)) }}</span>
        </div>
        <div v-if="hasSales(customer.salesData.skinPen)" class="product-sales">
          <span class="product-name">SkinPen:</span>
          <span class="sales-amount">${{ formatCurrency(getTotalSales(customer.salesData.skinPen)) }}</span>
        </div>
      </div>
      
      <div v-if="hasNotes" class="notes">
        <div v-if="customer.notes.general" class="note">
          <strong>Notes:</strong> {{ customer.notes.general }}
        </div>
        <div v-if="customer.notes.contact" class="note">
          <strong>Contact:</strong> {{ customer.notes.contact }}
        </div>
        <div v-if="customer.notes.product" class="note">
          <strong>Products:</strong> {{ customer.notes.product }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Customer, QuarterlySales } from '@/types'
import { SalesUtils } from '@/utils/salesUtils'
import { openInMaps } from '@/utils/maps'

interface Props {
  customer: Customer
}

const props = defineProps<Props>()

const hasNotes = computed(() => {
  return !!(props.customer.notes.general || props.customer.notes.contact || props.customer.notes.product)
})

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US').format(amount)
}

function hasSales(sales: QuarterlySales): boolean {
  return SalesUtils.getTotalSales(sales) > 0
}

function getTotalSales(sales: QuarterlySales): number {
  return SalesUtils.getTotalSales(sales)
}

function openMaps() {
  openInMaps(props.customer.businessAddress)
}
</script>

<style scoped>
.customer-card {
  border-bottom: 1px solid #e5e7eb;
  padding: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0.1);
}

.customer-card:hover {
  background-color: #f9fafb;
}

.customer-card:last-child {
  border-bottom: none;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
}

.account-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
}

.account-name {
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
  color: #111827;
}

.customer-number {
  font-size: 0.75rem;
  color: #6b7280;
  background: #f3f4f6;
  padding: 0.125rem 0.375rem;
  border-radius: 4px;
}

.promo-badge {
  font-size: 1rem;
}

.total-sales {
  font-weight: 600;
  color: #059669;
  font-size: 0.875rem;
}

.card-body {
  space-y: 0.5rem;
}

.address {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.5rem;
}

.address-icon {
  font-size: 0.75rem;
}

.sales-data {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.product-sales {
  font-size: 0.75rem;
}

.product-name {
  color: #6b7280;
  font-weight: 500;
}

.sales-amount {
  color: #059669;
  font-weight: 600;
  margin-left: 0.25rem;
}

.notes {
  font-size: 0.75rem;
  color: #6b7280;
  space-y: 0.25rem;
}

.note {
  margin-bottom: 0.25rem;
}

.note strong {
  color: #374151;
}

/* iPhone-specific optimizations */
@media (max-width: 480px) {
  .customer-card {
    padding: 0.875rem;
    min-height: 44px; /* iOS touch target minimum */
  }
  
  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .account-info {
    flex-wrap: wrap;
  }
  
  .sales-data {
    flex-direction: column;
    gap: 0.25rem;
  }
}
</style>
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
        <div v-if="SalesUtils.getTotalSales(customer.salesData.daxxify) > 0" class="product-sales">
          <span class="product-name">DAXXIFY:</span>
          <span class="sales-amount">${{ formatCurrency(SalesUtils.getTotalSales(customer.salesData.daxxify)) }}</span>
        </div>
        <div v-if="SalesUtils.getTotalSales(customer.salesData.rha) > 0" class="product-sales">
          <span class="product-name">RHA:</span>
          <span class="sales-amount">${{ formatCurrency(SalesUtils.getTotalSales(customer.salesData.rha)) }}</span>
        </div>
        <div v-if="SalesUtils.getTotalSales(customer.salesData.skinPen) > 0" class="product-sales">
          <span class="product-name">SkinPen:</span>
          <span class="sales-amount">${{ formatCurrency(SalesUtils.getTotalSales(customer.salesData.skinPen)) }}</span>
        </div>
      </div>
      
      <div v-if="hasNotes" class="notes-section">
        <button 
          @click.stop="toggleNotes" 
          class="notes-toggle"
          :class="{ 'expanded': notesExpanded }"
        >
          <span class="notes-icon">{{ notesExpanded ? '📝' : '💬' }}</span>
          <span class="notes-label">Notes</span>
          <span class="expand-icon">{{ notesExpanded ? '▼' : '▶' }}</span>
        </button>
        
        <div v-show="notesExpanded" class="notes-content">
          <div v-if="customer.notes.general" class="note">
            <strong>General:</strong> {{ customer.notes.general }}
          </div>
          <div v-if="customer.notes.contact" class="note">
            <strong>Contact:</strong> {{ customer.notes.contact }}
          </div>
          <div v-if="customer.notes.product" class="note">
            <strong>SkinPen:</strong> {{ customer.notes.product }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Customer } from '@/types'
import { SalesUtils } from '@/utils/salesUtils'
import { openInMaps } from '@/utils/maps'
import { formatCurrency } from '@/utils/common'

interface Props {
  customer: Customer
}

const props = defineProps<Props>()
const notesExpanded = ref(false)

const hasNotes = computed(() => {
  return !!(props.customer.notes.general || props.customer.notes.contact || props.customer.notes.product)
})

function openMaps() {
  openInMaps(props.customer.businessAddress)
}

function toggleNotes() {
  notesExpanded.value = !notesExpanded.value
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

.notes-section {
  margin-top: 0.75rem;
}

.notes-toggle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: none;
  padding: 0.5rem 0;
  cursor: pointer;
  font-size: 0.875rem;
  color: #6b7280;
  width: 100%;
  text-align: left;
  transition: color 0.2s;
  min-height: 44px; /* iOS touch target */
}

.notes-toggle:hover {
  color: #374151;
}

.notes-toggle.expanded {
  color: #2563eb;
}

.notes-icon {
  font-size: 1rem;
}

.notes-label {
  flex: 1;
  font-weight: 500;
}

.expand-icon {
  font-size: 0.75rem;
  transition: transform 0.2s;
}

.notes-content {
  padding: 0.5rem 0 0.75rem 0;
  border-top: 1px solid #f3f4f6;
  margin-top: 0.5rem;
}

.note {
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  color: #6b7280;
  line-height: 1.4;
}

.note:last-child {
  margin-bottom: 0;
}

.note strong {
  color: #374151;
  font-weight: 600;
}

/* iPhone-specific optimizations */
@media (max-width: 480px) {
  .customer-card {
    padding: 1.25rem 1rem;
    min-height: 60px; /* iOS touch target minimum with more breathing room */
  }
  
  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
    margin-bottom: 1rem;
  }
  
  .account-info {
    flex-wrap: wrap;
    gap: 0.75rem;
    width: 100%;
  }

  .account-name {
    font-size: 1.1rem;
    line-height: 1.3;
  }

  .customer-number {
    font-size: 0.85rem;
    padding: 0.25rem 0.5rem;
  }

  .total-sales {
    font-size: 1rem;
    align-self: flex-start;
  }

  .address {
    font-size: 1rem;
    margin-bottom: 0.75rem;
    line-height: 1.4;
  }
  
  .sales-data {
    flex-direction: column;
    gap: 0.5rem;
    margin-bottom: 0.75rem;
  }

  .product-sales {
    font-size: 0.9rem;
  }

  .notes-toggle {
    font-size: 1rem;
    padding: 0.75rem 0;
    min-height: 44px;
  }
  
  .notes-content {
    padding: 0.75rem 0;
  }

  .note {
    font-size: 1rem;
    line-height: 1.4;
    margin-bottom: 0.75rem;
  }
  
  .note:last-child {
    margin-bottom: 0;
  }
}
</style>
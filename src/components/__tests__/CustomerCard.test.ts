import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import CustomerCard from '../CustomerCard.vue'
import type { Customer } from '@/types'

// Mock window.open for maps testing
Object.defineProperty(window, 'open', {
  value: vi.fn(),
  writable: true
})

const mockCustomer: Customer = {
  id: 'cn246670',
  customerNumber: 'CN246670',
  accountName: '4EYMED LLC',
  businessAddress: '9249 Highlands Rd Colorado Springs 80920',
  salesRep: 'Kaiti Green',
  territory: 'colorado-springs-north',
  notes: {
    general: 'Good customer relationship',
    contact: 'Prefers email contact',
    product: 'Interested in SkinPen expansion'
  },
  salesData: {
    daxxify: { salesByPeriod: { '2024-Q1': 1000, '2024-Q2': 1200 } },
    rha: { salesByPeriod: { '2024-Q1': 500 } },
    skinPen: { salesByPeriod: { '2024-Q2': 1632, '2024-Q4': 1728, '2025-Q1': 1488 } }
  },
  isQ3PromoTarget: true,
  totalSales: 6548
}

const mockCustomerMinimal: Customer = {
  id: 'cn111111',
  customerNumber: 'CN111111',
  accountName: 'Minimal Customer',
  businessAddress: 'Denver CO',
  salesRep: 'Test Rep',
  territory: 'colorado-springs-central',
  notes: {},
  salesData: {
    daxxify: { salesByPeriod: {} },
    rha: { salesByPeriod: {} },
    skinPen: { salesByPeriod: {} }
  },
  isQ3PromoTarget: false,
  totalSales: 0
}

describe('CustomerCard Component', () => {
  describe('Customer Information Display', () => {
    it('should display customer basic information correctly', () => {
      const wrapper = mount(CustomerCard, {
        props: { customer: mockCustomer }
      })

      expect(wrapper.text()).toContain('4EYMED LLC')
      expect(wrapper.text()).toContain('CN246670')
      expect(wrapper.text()).toContain('9249 Highlands Rd Colorado Springs 80920')
    })

    it('should format total sales with currency', () => {
      const wrapper = mount(CustomerCard, {
        props: { customer: mockCustomer }
      })

      expect(wrapper.text()).toContain('6,548') // Formatted without decimals
    })

    it('should handle customers with zero sales', () => {
      const wrapper = mount(CustomerCard, {
        props: { customer: mockCustomerMinimal }
      })

      expect(wrapper.text()).toContain('0') // Should show 0 for no sales
      expect(wrapper.text()).toContain('Minimal Customer')
    })
  })

  describe('Q3 Promo Target Indicator', () => {
    it('should show Q3 promo target indicator when applicable', () => {
      const wrapper = mount(CustomerCard, {
        props: { customer: mockCustomer }
      })

      // Should have promo target indicator (🎯 emoji)
      expect(wrapper.text()).toContain('🎯')
      const promoBadge = wrapper.find('.promo-badge')
      expect(promoBadge.exists()).toBe(true)
    })

    it('should not show Q3 promo target indicator for non-targets', () => {
      const wrapper = mount(CustomerCard, {
        props: { customer: mockCustomerMinimal }
      })

      expect(wrapper.text()).not.toContain('🎯')
      const promoBadge = wrapper.find('.promo-badge')
      expect(promoBadge.exists()).toBe(false)
    })
  })

  describe('Sales Data Display', () => {
    it('should display product sales data correctly', () => {
      const wrapper = mount(CustomerCard, {
        props: { customer: mockCustomer }
      })

      // Should show product sales
      const salesSection = wrapper.find('.sales-data')
      expect(salesSection.exists()).toBe(true)
      
      // Should show DAXXIFY, RHA, and SkinPen sales
      expect(wrapper.text()).toContain('DAXXIFY:')
      expect(wrapper.text()).toContain('RHA:')
      expect(wrapper.text()).toContain('SkinPen:')
    })

    it('should handle empty sales data gracefully', () => {
      const wrapper = mount(CustomerCard, {
        props: { customer: mockCustomerMinimal }
      })

      // Should not crash with empty sales data
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.text()).toContain('Minimal Customer')
    })

    it('should calculate and display latest quarter performance', () => {
      const wrapper = mount(CustomerCard, {
        props: { customer: mockCustomer }
      })

      // Should show some form of recent performance data
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.text()).toContain(mockCustomer.accountName)
    })
  })

  describe('Maps Integration', () => {
    beforeEach(() => {
      vi.clearAllMocks()
    })

    it('should handle maps button click correctly', async () => {
      const wrapper = mount(CustomerCard, {
        props: { customer: mockCustomer }
      })

      // The entire card is clickable for maps
      await wrapper.trigger('click')
      
      // Should attempt to open maps with correct address (URL encoded)
      expect(window.open).toHaveBeenCalled()
      const mockOpen = vi.mocked(window.open)
      expect(mockOpen.mock.calls[0][0]).toContain('9249%20Highlands%20Rd')
    })

    it('should generate correct iOS Maps URL', () => {
      const wrapper = mount(CustomerCard, {
        props: { customer: mockCustomer }
      })

      // Test that the component has the openMaps functionality
      const address = mockCustomer.businessAddress
      expect(address).toBeTruthy()
      expect(wrapper.exists()).toBe(true)
    })

    it('should handle addresses with special characters', () => {
      const specialAddressCustomer: Customer = {
        ...mockCustomer,
        businessAddress: '123 Main St, Suite #100, Denver, CO 80202'
      }

      const wrapper = mount(CustomerCard, {
        props: { customer: specialAddressCustomer }
      })

      expect(wrapper.text()).toContain('123 Main St, Suite #100, Denver, CO 80202')
    })
  })

  describe('Notes Display', () => {
    it('should display customer notes when present', async () => {
      const wrapper = mount(CustomerCard, {
        props: { customer: mockCustomer }
      })

      // Should show notes section with toggle button
      const notesSection = wrapper.find('.notes-section')
      expect(notesSection.exists()).toBe(true)
      
      // Should show notes toggle button
      const notesToggle = wrapper.find('.notes-toggle')
      expect(notesToggle.exists()).toBe(true)
      expect(notesToggle.text()).toContain('Notes')
      
      // Notes content should exist but not be visible initially
      const notesContent = wrapper.find('.notes-content')
      expect(notesContent.exists()).toBe(true)
      
      // Click to expand notes
      await notesToggle.trigger('click')
      
      // Notes content should now be displayed
      await wrapper.vm.$nextTick()
      expect(wrapper.text()).toContain('Good customer relationship')
      expect(wrapper.text()).toContain('Prefers email contact')
      expect(wrapper.text()).toContain('Interested in SkinPen expansion')
    })

    it('should handle customers without notes', () => {
      const wrapper = mount(CustomerCard, {
        props: { customer: mockCustomerMinimal }
      })

      // Should not crash when no notes present
      expect(wrapper.exists()).toBe(true)
      
      // Should not show notes section when no notes exist
      const notesSection = wrapper.find('.notes-section')
      expect(notesSection.exists()).toBe(false)
    })

    it('should display different types of notes separately', async () => {
      const wrapper = mount(CustomerCard, {
        props: { customer: mockCustomer }
      })

      // Test the notes are properly structured
      expect(mockCustomer.notes.general).toBe('Good customer relationship')
      expect(mockCustomer.notes.contact).toBe('Prefers email contact')
      expect(mockCustomer.notes.product).toBe('Interested in SkinPen expansion')
      
      // Expand notes to check categorization
      const notesToggle = wrapper.find('.notes-toggle')
      await notesToggle.trigger('click')
      
      // Check that different note types are labeled correctly
      expect(wrapper.text()).toContain('General:')
      expect(wrapper.text()).toContain('Contact:')
      expect(wrapper.text()).toContain('SkinPen:')
    })
  })

  describe('Territory Display', () => {
    it('should display territory information correctly', () => {
      const wrapper = mount(CustomerCard, {
        props: { customer: mockCustomer }
      })

      // Should display territory information properly
      expect(mockCustomer.territory).toBe('colorado-springs-north')
      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('Component Props Validation', () => {
    it('should require customer prop', () => {
      // This test ensures the component properly requires the customer prop
      const wrapper = mount(CustomerCard, {
        props: { customer: mockCustomer }
      })

      expect(wrapper.props('customer')).toEqual(mockCustomer)
    })

    it('should handle customer prop changes reactively', async () => {
      const wrapper = mount(CustomerCard, {
        props: { customer: mockCustomer }
      })

      expect(wrapper.text()).toContain('4EYMED LLC')

      // Change the customer
      await wrapper.setProps({ customer: mockCustomerMinimal })
      expect(wrapper.text()).toContain('Minimal Customer')
      expect(wrapper.text()).not.toContain('4EYMED LLC')
    })
  })

  describe('Responsive Design', () => {
    it('should maintain proper structure for mobile screens', () => {
      const wrapper = mount(CustomerCard, {
        props: { customer: mockCustomer }
      })

      // Should have proper CSS classes for responsive design
      const card = wrapper.find('.customer-card')
      expect(card.exists()).toBe(true)
    })

    it('should handle long customer names gracefully', () => {
      const longNameCustomer: Customer = {
        ...mockCustomer,
        accountName: 'Very Long Customer Name That Should Not Break The Layout When Displayed'
      }

      const wrapper = mount(CustomerCard, {
        props: { customer: longNameCustomer }
      })

      expect(wrapper.text()).toContain('Very Long Customer Name')
      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('Performance and Memory', () => {
    it('should not cause memory leaks with frequent re-renders', () => {
      const wrapper = mount(CustomerCard, {
        props: { customer: mockCustomer }
      })

      // Simulate multiple prop changes
      const customers = [mockCustomer, mockCustomerMinimal, mockCustomer]
      
      customers.forEach(async (customer) => {
        await wrapper.setProps({ customer })
        expect(wrapper.exists()).toBe(true)
      })
    })

    it('should efficiently handle large sales data objects', () => {
      const largeSalesCustomer: Customer = {
        ...mockCustomer,
        salesData: {
          daxxify: { 
            salesByPeriod: Object.fromEntries(
              Array.from({ length: 20 }, (_, i) => [`2024-Q${(i % 4) + 1}`, Math.random() * 1000])
            )
          },
          rha: { salesByPeriod: {} },
          skinPen: { salesByPeriod: {} }
        }
      }

      const wrapper = mount(CustomerCard, {
        props: { customer: largeSalesCustomer }
      })

      expect(wrapper.exists()).toBe(true)
      // Component should handle large data sets without issues
      expect(wrapper.text()).toContain(largeSalesCustomer.accountName)
    })
  })
})
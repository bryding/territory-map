import Papa from 'papaparse'
import type { CSVRow, Customer, ProductBrand, QuarterlySales, CustomerNotes, Territory } from '@/types'
import { CSVQuarterDetector, SalesUtils } from './salesUtils'

export interface ParseResult<T> {
  data: T[]
  errors: ParseError[]
  meta: ParseMeta
}

export interface ParseError {
  row: number
  field?: string
  message: string
  code: string
}

export interface ParseMeta {
  totalRows: number
  validRows: number
  quarterColumns: Array<{ original: string; standardized: string }>
}


export class CSVParser {
  private static readonly REQUIRED_COLUMNS = ['PAC', 'Brand'] as const
  private static readonly KNOWN_SALES_REPS = [
    'Bobbie Koon',
    'Brooklynne Woolslayer', 
    'Heather McGlory',
    'Kaiti Green',
    'Kaleigh Humphrey',
    'Kim Coates',
    'Kimberly McMurray',
    'Victoria Greene',
    'Wendy Shepherd'
  ] as const

  /**
   * Parses CSV text into customer data
   */
  static async parseCSV(csvText: string): Promise<ParseResult<Customer>> {
    return new Promise((resolve) => {
      const errors: ParseError[] = []
      const customers: Customer[] = []
      
      Papa.parse<CSVRow>(csvText, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header) => this.normalizeHeader(header),
        transform: (value) => value.trim(),
        complete: (results) => {
          const quarterColumns = CSVQuarterDetector.getQuarterColumns(results.meta?.fields || [])
          const meta: ParseMeta = {
            totalRows: 0, // Will be set later
            validRows: 0, // Will be set later  
            quarterColumns
          }
          
          // Validate required columns exist
          const missingColumns = this.validateRequiredColumns(results.meta?.fields || [])
          if (missingColumns.length > 0) {
            errors.push({
              row: 0,
              message: `Missing required columns: ${missingColumns.join(', ')}`,
              code: 'MISSING_COLUMNS'
            })
            resolve({ data: [], errors, meta })
            return
          }

          // Group rows by customer and process
          const customerGroups = this.groupRowsByCustomer(results.data, errors)
          
          for (const [customerKey, rows] of customerGroups.entries()) {
            try {
              const customer = this.processCustomerGroup(customerKey, rows, quarterColumns)
              if (customer) {
                customers.push(customer)
              }
            } catch (error) {
              errors.push({
                row: rows[0]?.rowIndex || 0,
                message: `Failed to process customer: ${error instanceof Error ? error.message : 'Unknown error'}`,
                code: 'CUSTOMER_PROCESSING_ERROR'
              })
            }
          }

          meta.totalRows = results.data.length
          meta.validRows = customers.length

          resolve({
            data: customers,
            errors,
            meta
          })
        },
        error: (error: any) => {
          resolve({
            data: [],
            errors: [{ row: 0, message: error.message, code: 'PARSE_ERROR' }],
            meta: { totalRows: 0, validRows: 0, quarterColumns: [] }
          })
        }
      })
    })
  }

  /**
   * Normalizes CSV headers to consistent format
   */
  private static normalizeHeader(header: string): string {
    const normalized = header.trim().toLowerCase().replace(/[^a-z0-9]/g, '_')
    // Map specific CSV columns to expected names
    if (normalized === 'i') return 'accountName'
    if (normalized === 'account_name__cn_' || normalized === 'account_name_cn') return 'accountName'
    if (normalized === 'address') return 'address'
    return normalized
  }

  /**
   * Validates that required columns are present
   */
  private static validateRequiredColumns(headers: string[]): string[] {
    const normalizedHeaders = headers.map(h => this.normalizeHeader(h))
    return this.REQUIRED_COLUMNS.filter(col => 
      !normalizedHeaders.includes(this.normalizeHeader(col))
    )
  }


  /**
   * Groups CSV rows by customer (account name)
   */
  private static groupRowsByCustomer(
    rows: CSVRow[], 
    errors: ParseError[]
  ): Map<string, Array<CSVRow & { rowIndex: number }>> {
    const groups = new Map<string, Array<CSVRow & { rowIndex: number }>>()
    
    rows.forEach((row, index) => {
      // Skip total rows and empty rows
      const accountName = row.accountName || row.accountname
      if (this.isTotalRow(row) || !row.pac || !accountName) {
        return
      }

      // Validate sales rep
      if (!this.isValidSalesRep(row.pac)) {
        errors.push({
          row: index + 2, // +2 for header and 1-based indexing
          field: 'pac',
          message: `Unknown sales representative: ${row.pac}`,
          code: 'INVALID_SALES_REP'
        })
      }

      const customerKey = this.extractCustomerKey(accountName)
      if (!customerKey) {
        errors.push({
          row: index + 2,
          field: 'accountName',
          message: `Could not extract customer number from: ${accountName}`,
          code: 'INVALID_CUSTOMER_NUMBER'
        })
        return
      }

      if (!groups.has(customerKey)) {
        groups.set(customerKey, [])
      }
      const rowWithIndex = Object.assign({}, row, { rowIndex: index + 2 }) as CSVRow & { rowIndex: number }
      groups.get(customerKey)!.push(rowWithIndex)
    })

    return groups
  }

  /**
   * Checks if a row represents a total/summary row
   */
  private static isTotalRow(row: CSVRow): boolean {
    const accountName = row.accountName || row.accountname
    return accountName?.toLowerCase().includes('total') || false
  }

  /**
   * Validates if sales rep name is recognized
   */
  private static isValidSalesRep(salesRep: string): boolean {
    return this.KNOWN_SALES_REPS.includes(salesRep as any)
  }

  /**
   * Extracts customer key (CN number) from account name
   */
  private static extractCustomerKey(accountName: string): string | null {
    const match = accountName.match(/\(CN(\d{6})\)/)
    return match ? `CN${match[1]}` : null
  }

  /**
   * Processes a group of rows for a single customer
   */
  private static processCustomerGroup(
    customerKey: string,
    rows: Array<CSVRow & { rowIndex: number }>,
    quarterColumns: Array<{ original: string; standardized: string }>
  ): Customer | null {
    if (rows.length === 0) return null

    const firstRow = rows[0]
    const customerNumber = customerKey
    const rawAccountName = firstRow.accountName || firstRow.accountname
    const accountName = this.cleanAccountName(rawAccountName)
    
    // Aggregate sales data by brand
    const salesByBrand = new Map<ProductBrand, QuarterlySales>()
    
    for (const row of rows) {
      const brand = this.normalizeBrand(row.brand)
      if (!brand) continue

      const quarterlySales = this.extractQuarterlySales(row, quarterColumns)
      
      if (!salesByBrand.has(brand)) {
        salesByBrand.set(brand, { salesByPeriod: {} })
      }

      // Merge quarterly sales
      const existing = salesByBrand.get(brand)!
      for (const [period, amount] of Object.entries(quarterlySales.salesByPeriod)) {
        existing.salesByPeriod[period] = (existing.salesByPeriod[period] || 0) + amount
      }
    }

    // Extract notes (combine from all rows)
    const notes = this.extractNotes(rows)
    
    // Calculate total sales
    const totalSales = Array.from(salesByBrand.values())
      .reduce((sum, sales) => sum + SalesUtils.getTotalSales(sales), 0)

    const businessAddress = firstRow.address || this.extractBusinessAddress(accountName)
    
    return {
      id: customerNumber.toLowerCase(),
      customerNumber,
      accountName,
      businessAddress,
      salesRep: firstRow.pac,
      territory: this.inferTerritory(accountName, firstRow.address),
      notes,
      salesData: {
        daxxify: salesByBrand.get('DAXXIFY') || { salesByPeriod: {} },
        rha: salesByBrand.get('RHA') || { salesByPeriod: {} },
        skinPen: salesByBrand.get('SkinPen') || { salesByPeriod: {} }
      },
      isQ3PromoTarget: this.determineQ3PromoTarget(rows),
      totalSales
    }
  }

  /**
   * Cleans account name by removing customer number suffix
   */
  private static cleanAccountName(accountName: string): string {
    return accountName.replace(/\s*\(CN\d{6}\)\s*$/, '').trim()
  }

  /**
   * Normalizes brand name to standard format
   */
  private static normalizeBrand(brand: string): ProductBrand | null {
    const normalized = brand.toUpperCase().trim()
    switch (normalized) {
      case 'DAXXIFY':
        return 'DAXXIFY'
      case 'RHA':
        return 'RHA'
      case 'SKINPEN':
        return 'SkinPen'
      default:
        return null
    }
  }

  /**
   * Extracts quarterly sales data from a row
   */
  private static extractQuarterlySales(
    row: CSVRow,
    quarterColumns: Array<{ original: string; standardized: string }>
  ): QuarterlySales {
    const salesByPeriod: Record<string, number> = {}

    for (const { original, standardized } of quarterColumns) {
      const value = row[this.normalizeHeader(original)]
      if (value && value.trim()) {
        const amount = this.parseAmount(value)
        if (amount > 0) {
          salesByPeriod[standardized] = amount
        }
      }
    }

    return { salesByPeriod }
  }

  /**
   * Parses amount string to number
   */
  private static parseAmount(value: string): number {
    const cleaned = value.replace(/[^0-9.-]/g, '')
    const amount = parseFloat(cleaned)
    return isNaN(amount) ? 0 : amount
  }

  /**
   * Extracts notes from rows
   */
  private static extractNotes(rows: Array<CSVRow & { rowIndex: number }>): CustomerNotes {
    const notes: CustomerNotes = {}
    
    for (const row of rows) {
      if (row.notes1) notes.general = row.notes1
      if (row.notes2) notes.contact = row.notes2
      if (row.notes3) notes.product = row.notes3
    }

    return notes
  }

  /**
   * Placeholder: Extract business address from account name
   * TODO: Implement proper address extraction/geocoding
   */
  private static extractBusinessAddress(accountName: string): string {
    // For now, return a placeholder - in real implementation this would
    // need address data from another source or geocoding service
    return `${accountName}, Colorado`
  }

  /**
   * Infer territory from business address
   */
  private static inferTerritory(accountName: string, address?: string): Territory {
    if (!address) {
      // Fallback to hash-based distribution if no address
      const territories: Territory[] = [
        'colorado-springs-north',
        'colorado-springs-central', 
        'colorado-springs-south',
        'highlands-ranch',
        'littleton',
        'castle-rock'
      ]
      const hash = accountName.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0)
      return territories[hash % territories.length]
    }

    const addressLower = address.toLowerCase()
    
    // Map based on address content
    if (addressLower.includes('highlands ranch')) return 'highlands-ranch'
    if (addressLower.includes('littleton')) return 'littleton'
    if (addressLower.includes('castle rock') || addressLower.includes('castle pines')) return 'castle-rock'
    
    // Colorado Springs territory mapping based on common area indicators
    if (addressLower.includes('colorado springs')) {
      if (addressLower.includes('academy') || addressLower.includes('austin bluffs') || 
          addressLower.includes('research') || addressLower.includes('80918') || 
          addressLower.includes('80920')) {
        return 'colorado-springs-north'
      }
      if (addressLower.includes('nevada') || addressLower.includes('80907') || 
          addressLower.includes('downtown') || addressLower.includes('tejon')) {
        return 'colorado-springs-central'
      }
      // Default to south for other Colorado Springs addresses
      return 'colorado-springs-south'
    }
    
    // Default fallback
    return 'colorado-springs-central'
  }

  /**
   * Placeholder: Determine if customer is Q3 promo target
   * TODO: Implement Q3 promo target logic based on business rules
   */
  private static determineQ3PromoTarget(rows: Array<CSVRow & { rowIndex: number }>): boolean {
    // Placeholder - implement based on business rules
    return false
  }
}
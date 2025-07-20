export type Territory = 
  | 'colorado-springs-north'
  | 'colorado-springs-south' 
  | 'colorado-springs-central'
  | 'highlands-ranch'
  | 'littleton'
  | 'castle-rock'

export type ProductBrand = 'DAXXIFY' | 'RHA' | 'SkinPen'

export interface QuarterlySales {
  // Key format: "YYYY-QN" (e.g., "2024-Q2", "2025-Q1")
  salesByPeriod: Record<string, number>
}

export interface CustomerNotes {
  general?: string
  contact?: string
  product?: string
}

export interface SalesData {
  daxxify: QuarterlySales
  rha: QuarterlySales
  skinPen: QuarterlySales
}

export interface Customer {
  id: string
  customerNumber: string
  accountName: string
  businessAddress: string
  salesRep: string
  territory: Territory
  notes: CustomerNotes
  salesData: SalesData
  isQ3PromoTarget: boolean
  totalSales: number
}

export interface SalesRepresentative {
  name: string
  customers: Customer[]
  totalSales: number
  territories: Territory[]
}

// Flexible CSV row that can handle dynamic quarter columns
export interface CSVRow {
  pac: string
  accountName: string
  notes1?: string
  notes2?: string
  notes3?: string
  brand: string
  // Dynamic quarter columns - everything else gets captured here
  [key: string]: string | undefined
}

export interface ParsedCustomerData {
  customerNumber: string
  accountName: string
  salesRep: string
  notes: CustomerNotes
  salesByBrand: Record<ProductBrand, QuarterlySales>
}

export interface TerritoryStats {
  customerCount: number
  totalSales: number
  q3PromoTargets: number
  topProduct: ProductBrand
}

export interface AppError {
  code: string
  message: string
  details?: any
}

export interface SearchFilters {
  territory?: Territory
  salesRep?: string
  productBrand?: ProductBrand
  isQ3PromoTarget?: boolean
  minSales?: number
  maxSales?: number
}

export interface SearchState {
  query: string
  filters: SearchFilters
  isSearching: boolean
  results: Customer[]
}

// Utility types for working with quarterly sales
export type PeriodKey = `${number}-Q${1 | 2 | 3 | 4}`

export interface SalesUtils {
  createPeriodKey: (year: number, quarter: number) => PeriodKey
  parsePeriodKey: (key: string) => { year: number; quarter: number } | null
  getSalesForYear: (sales: QuarterlySales, year: number) => number
  getSalesForQuarter: (sales: QuarterlySales, year: number, quarter: number) => number
  getTotalSales: (sales: QuarterlySales) => number
  getLatestSales: (sales: QuarterlySales) => { period: string; amount: number } | null
}
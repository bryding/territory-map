import type { QuarterlySales, PeriodKey } from '@/types'

export class SalesUtils {
  /**
   * Creates a standardized period key from year and quarter
   */
  static createPeriodKey(year: number, quarter: number): PeriodKey {
    if (quarter < 1 || quarter > 4) {
      throw new Error(`Invalid quarter: ${quarter}. Must be 1-4.`)
    }
    return `${year}-Q${quarter as 1 | 2 | 3 | 4}`
  }

  /**
   * Parses a period key back into year and quarter components
   */
  static parsePeriodKey(key: string): { year: number; quarter: number } | null {
    const match = key.match(/^(\d{4})-Q([1-4])$/)
    if (!match) return null

    return {
      year: parseInt(match[1], 10),
      quarter: parseInt(match[2], 10),
    }
  }

  /**
   * Gets total sales for a specific year
   */
  static getSalesForYear(sales: QuarterlySales, year: number): number {
    return Object.entries(sales.salesByPeriod)
      .filter(([period]) => period.startsWith(year.toString()))
      .reduce((sum, [, amount]) => sum + amount, 0)
  }

  /**
   * Gets sales for a specific quarter
   */
  static getSalesForQuarter(sales: QuarterlySales, year: number, quarter: number): number {
    const periodKey = this.createPeriodKey(year, quarter)
    return sales.salesByPeriod[periodKey] ?? 0
  }

  /**
   * Gets total sales across all periods
   */
  static getTotalSales(sales: QuarterlySales): number {
    return Object.values(sales.salesByPeriod).reduce((sum, amount) => sum + amount, 0)
  }

  /**
   * Gets the most recent sales entry
   */
  static getLatestSales(sales: QuarterlySales): { period: string; amount: number } | null {
    const entries = Object.entries(sales.salesByPeriod)
    if (entries.length === 0) return null

    // Sort by period descending to get latest
    const sortedEntries = entries.sort(([a], [b]) => b.localeCompare(a))
    const [period, amount] = sortedEntries[0]

    return { period, amount }
  }

  /**
   * Gets all available periods sorted chronologically
   */
  static getAllPeriods(sales: QuarterlySales): string[] {
    return Object.keys(sales.salesByPeriod).sort()
  }

  /**
   * Calculates growth rate between two periods
   */
  static calculateGrowthRate(
    sales: QuarterlySales,
    fromPeriod: string,
    toPeriod: string,
  ): number | null {
    const fromAmount = sales.salesByPeriod[fromPeriod]
    const toAmount = sales.salesByPeriod[toPeriod]

    if (fromAmount === undefined || toAmount === undefined || fromAmount === 0) {
      return null
    }

    return ((toAmount - fromAmount) / fromAmount) * 100
  }
}

/**
 * Utility to detect quarter columns from CSV headers
 */
export class CSVQuarterDetector {
  // Patterns for detecting quarter columns in various formats
  private static readonly QUARTER_PATTERNS = [
    /^(\d{1})[Qq](\d{2})$/, // "2Q24", "3Q24", "2q24", "3q24" (current format)
    /^[Qq](\d{1})\s*(\d{4})$/, // "Q2 2024", "Q3 2024", "q2 2024"
    /^(\d{4})-[Qq](\d{1})$/, // "2024-Q2", "2024-Q3", "2024-q2"
    /^(\d{4})[Qq](\d{1})$/, // "2024Q2", "2024Q3", "2024q2"
  ]

  /**
   * Detects if a column name represents a quarter
   */
  static isQuarterColumn(columnName: string): boolean {
    return this.parseQuarterColumn(columnName) !== null
  }

  /**
   * Parses a quarter column name into a standardized period key
   */
  static parseQuarterColumn(columnName: string): PeriodKey | null {
    const trimmed = columnName.trim()

    // Try each pattern
    for (let i = 0; i < this.QUARTER_PATTERNS.length; i++) {
      const pattern = this.QUARTER_PATTERNS[i]
      const match = trimmed.match(pattern)
      if (match) {
        const [, first, second] = match

        // Determine year and quarter based on pattern index
        let year: number, quarter: number

        if (i === 0) {
          // Pattern 0: /^(\d{1})[Qq](\d{2})$/ - "2q24" format
          quarter = parseInt(first, 10)
          year = 2000 + parseInt(second, 10)
        } else if (i === 1) {
          // Pattern 1: /^[Qq](\d{1})\s*(\d{4})$/ - "Q2 2024" format
          quarter = parseInt(first, 10)
          year = parseInt(second, 10)
        } else {
          // Pattern 2,3: year-quarter formats - "2024-Q2", "2024Q2"
          year = parseInt(first, 10)
          quarter = parseInt(second, 10)
        }

        if (quarter >= 1 && quarter <= 4 && year >= 2020 && year <= 2030) {
          return SalesUtils.createPeriodKey(year, quarter)
        }
      }
    }

    return null
  }

  /**
   * Gets all quarter columns from CSV headers
   */
  static getQuarterColumns(
    headers: string[],
  ): Array<{ original: string; standardized: PeriodKey }> {
    return headers
      .map((header) => ({
        original: header,
        standardized: this.parseQuarterColumn(header),
      }))
      .filter(
        (item): item is { original: string; standardized: PeriodKey } => item.standardized !== null,
      )
  }
}

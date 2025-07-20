# Data Schema Documentation

## CSV Structure Analysis

### Source File: `High Plains Sales Data.csv`

#### Column Structure
1. **PAC** - Sales representative name
2. **Account Name** - Customer account name with CN (Customer Number)
3. **Column 3** - Notes/Comments about the account
4. **Column 4** - Additional notes/contact information
5. **Column 5** - Product/sales notes
6. **Brand** - Product brand (DAXXIFY, RHA, SkinPen)
7. **2Q24** - Q2 2024 sales data
8. **3Q24** - Q3 2024 sales data
9. **4Q24** - Q4 2024 sales data
10. **1Q25** - Q1 2025 sales data
11. **2Q25** - Q2 2025 sales data

### Data Pattern Analysis

#### Sales Representatives (PAC)
- Bobbie Koon
- Brooklynne Woolslayer
- Heather McGlory
- Kaiti Green
- Kaleigh Humphrey
- Kim Coates
- Kimberly McMurray
- Victoria Greene
- Wendy Shepherd

#### Customer Number Format
- Pattern: `CN######` (e.g., CN267366)
- Embedded in account name: "Account Name (CN######)"

#### Sales Data Format
- Numeric values representing revenue
- Empty cells indicate no sales for that period
- Values range from hundreds to tens of thousands

### Territory Mapping

Based on sales representative analysis and customer locations, the territories should be mapped as follows:

#### Colorado Springs Territories
- **North Colorado Springs** - Customers in northern Colorado Springs area
- **South Colorado Springs** - Customers in southern Colorado Springs area  
- **Central Colorado Springs** - Customers in central Colorado Springs area

#### Other Territories
- **Highlands Ranch** - Highlands Ranch area customers
- **Littleton** - Littleton area customers
- **Castle Rock** - Castle Rock area customers

*Note: Territory assignment will be determined by customer address parsing or manual mapping*

## TypeScript Interfaces

### Core Data Types

```typescript
interface Customer {
  id: string
  customerNumber: string // Extracted from CN######
  accountName: string
  businessAddress: string
  salesRep: string
  territory: Territory
  notes: CustomerNotes
  salesData: SalesData
  isQ3PromoTarget: boolean
}

interface CustomerNotes {
  general?: string
  contact?: string
  product?: string
}

interface SalesData {
  daxxify: QuarterlySales
  rha: QuarterlySales
  skinPen: QuarterlySales
}

interface QuarterlySales {
  q2_2024?: number
  q3_2024?: number
  q4_2024?: number
  q1_2025?: number
  q2_2025?: number
}

type Territory = 
  | 'colorado-springs-north'
  | 'colorado-springs-south' 
  | 'colorado-springs-central'
  | 'highlands-ranch'
  | 'littleton'
  | 'castle-rock'

interface SalesRepresentative {
  name: string
  customers: Customer[]
  totalSales: number
  territories: Territory[]
}
```

### CSV Parsing Schema

```typescript
interface CSVRow {
  pac: string
  accountName: string
  notes1?: string
  notes2?: string
  notes3?: string
  brand: string
  q2_2024?: string
  q3_2024?: string
  q4_2024?: string
  q1_2025?: string
  q2_2025?: string
}

interface ParsedCustomerData {
  customerNumber: string
  accountName: string
  salesRep: string
  notes: CustomerNotes
  salesByBrand: Record<string, QuarterlySales>
}
```

## Data Validation Rules

### Required Fields
- Customer Number (must match CN###### pattern)
- Account Name (non-empty string)
- Sales Representative (must be valid PAC name)

### Data Validation
```typescript
const validateCustomerNumber = (cn: string): boolean => {
  return /^CN\d{6}$/.test(cn)
}

const validateSalesAmount = (amount: string): number | null => {
  const num = parseFloat(amount)
  return isNaN(num) ? null : num
}

const extractCustomerNumber = (accountName: string): string | null => {
  const match = accountName.match(/\(CN(\d{6})\)/)
  return match ? `CN${match[1]}` : null
}
```

## Data Transformation Pipeline

### Step 1: CSV Parsing
- Use Papa Parse to convert CSV to JSON
- Handle empty cells and malformed data
- Validate column structure

### Step 2: Data Cleaning
- Extract customer numbers from account names
- Clean and normalize account names
- Parse sales amounts to numbers
- Group multiple brand entries per customer

### Step 3: Data Enrichment
- Assign territories based on business addresses
- Flag Q3 promo target accounts
- Calculate totals and statistics
- Add derived fields (e.g., total sales, growth trends)

### Step 4: Data Storage
- Store processed data in Pinia store
- Cache in localStorage for offline access
- Create search indexes for fast filtering

## Error Handling

### Common Data Issues
1. **Missing Customer Numbers** - Skip or flag for manual review
2. **Invalid Sales Amounts** - Treat as zero or null
3. **Duplicate Customers** - Merge data by customer number
4. **Missing Sales Rep** - Flag for manual assignment
5. **Malformed CSV Structure** - Graceful degradation with error reporting

### Error Recovery Strategies
- Continue processing valid rows when encountering errors
- Collect and report all validation errors
- Provide manual data correction interface
- Fallback to raw CSV display if parsing fails

## Sample Data Structure

```typescript
const sampleCustomer: Customer = {
  id: "cn267366",
  customerNumber: "CN267366",
  accountName: "Absolute Medical & Aesthetics",
  businessAddress: "123 Main St, Colorado Springs, CO 80903",
  salesRep: "Bobbie Koon",
  territory: "colorado-springs-north",
  notes: {
    general: "Responsive to promotions",
    contact: "Primary contact: Dr. Smith",
    product: "Prefers DAXXIFY over RHA"
  },
  salesData: {
    daxxify: {
      q3_2024: 13750,
      q4_2024: 10325
    },
    rha: {},
    skinPen: {}
  },
  isQ3PromoTarget: true
}
```

## Performance Considerations

### Data Size Optimization
- Use efficient data structures
- Implement data pagination for large datasets
- Use computed properties for derived data
- Minimize deep object nesting

### Memory Management
- Lazy load customer details
- Implement virtual scrolling for large lists
- Clear unused data when navigating
- Use WeakMaps for temporary associations
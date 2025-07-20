# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Development
yarn dev          # Start development server
yarn build        # Production build with type checking
yarn preview      # Preview production build

# Code Quality
yarn type-check   # TypeScript validation
yarn lint         # ESLint with auto-fix
yarn format       # Prettier formatting
yarn test:unit    # Run Vitest unit tests

# Build Only (skips type check)
yarn build-only   # Vite build without type checking
```

## Architecture Overview

### Core Application Flow
This is a Progressive Web App for sales territory management with the following data flow:
1. **CSV Import** → Papa Parse → Dynamic quarter column detection → Data validation
2. **Pinia Stores** → Reactive territory/customer grouping → Vue components
3. **Mobile-first UI** → Maps integration → iPhone PWA optimization

### State Management Architecture
- **territory.ts**: Main store containing customers array, computed territory groupings, CSV loading logic
- **search.ts**: Search/filter state with debounced queries and filter combinations
- Data flows: CSV → CSVParser → territory store → computed groupings → UI components

### Key Data Structures

**Flexible Time Series Design**: Uses `Record<string, number>` for quarterly sales instead of hardcoded properties:
```typescript
interface QuarterlySales {
  salesByPeriod: Record<string, number> // "2024-Q3": 15000
}
```

**Territory System**: 6 Colorado quadrants with customer grouping:
- colorado-springs-north/south/central
- highlands-ranch, littleton, castle-rock

**CSV Processing**: Dynamic column detection handles varying quarter formats (2Q24, Q2 2024, 2024-Q2) via `CSVQuarterDetector`

### Component Hierarchy
- **TerritoryMapView** (main container) → **TerritoryQuadrant** (6 instances) → **CustomerCard** (customer details + maps)
- **CSVLoader** handles file upload/sample data with drag-and-drop
- Maps integration: iOS Maps (`maps://`) for iPhone, Google Maps fallback

### Critical Implementation Details

**CSV Parser Design**: 
- Uses single CSV row type with `Object.assign()` casting to avoid TypeScript index signature conflicts
- Dynamic quarter column detection supports future data format changes
- Validation includes customer number format (CN######) and known sales rep verification

**Mobile Optimization**:
- iPhone touch targets 44px+ minimum
- Uses `-webkit-overflow-scrolling: touch` for native scrolling
- Territory display optimized for single-column mobile layout

**Data Loading**:
- Sample data available at `/public/data/High Plains Sales Data.csv`
- localStorage persistence for offline functionality
- Error handling with detailed ParseError reporting

### Store Usage Patterns
Territory store provides computed groupings:
- `customersByTerritory` - for territory quadrant display
- `customersBySalesRep` - for sales rep analysis  
- `territoryStats` - for dashboard metrics

Search store handles filtered results reactively based on query + filters combination.

### Testing Approach
Currently manual testing focused on:
- CSV loading with actual High Plains Sales Data (357 rows)
- Territory display across 6 quadrants
- Maps integration (iOS/Google Maps URL schemes)
- iPhone responsive design validation

Phase 2 will add Vitest unit tests for CSV parsing utilities and component integration tests.
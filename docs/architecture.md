# Territory Call Map - Architecture

## Overview
A Progressive Web App (PWA) for managing territory call maps for sales representatives. Built with Vue 3, TypeScript, and optimized for iPhone deployment.

## Technology Stack

### Core Technologies
- **Vue 3** - Composition API for reactive components
- **TypeScript** - Type safety and developer experience
- **Vite** - Fast build tool and dev server
- **Pinia** - State management for Vue 3
- **Vue Router** - Client-side routing

### Development Tools
- **ESLint** - Code linting and formatting
- **Prettier** - Code formatting
- **Vitest** - Unit testing framework
- **Papa Parse** - CSV parsing library

### PWA Features
- **Service Worker** - Offline functionality and caching
- **Web App Manifest** - Native app-like installation
- **localStorage** - Offline data persistence
- **iOS optimization** - Native iPhone experience

## Data Architecture

### Data Sources
- CSV files in `/data` directory containing sales territory information
- Primary data file: `High Plains Sales Data.csv`

### Data Flow
1. **CSV Import** → Papa Parse → **Data Validation** → **Type Conversion**
2. **Pinia Store** → **Component State** → **UI Rendering**
3. **Search/Filter** → **Computed Properties** → **Reactive Updates**

### Territory Structure
```
Colorado (6 Quadrants)
├── Colorado Springs
│   ├── North
│   ├── South
│   └── Central
├── Highlands Ranch
├── Littleton
└── Castle Rock
```

## Component Architecture

### Core Components
- **TerritoryMap** - Main container component (pending)
- **TerritoryQuadrant** - Individual territory quadrant ✅
- **CustomerCard** - Customer account details ✅
- **SearchBar** - Search and filter functionality (pending)
- **StatsPanel** - Revenue and target statistics (pending)

### Data Components
- **CustomerList** - Virtualized customer list
- **SalesData** - Sales metrics display
- **NotesPanel** - Customer notes display

## State Management (Pinia)

### Stores
1. **territoryStore** - Territory and customer data ✅
2. **searchStore** - Search state and filters ✅
3. **appStore** - Application settings and offline status (pending)

### Store Structure
```typescript
// territoryStore
interface TerritoryStore {
  customers: Customer[]
  territories: Territory[]
  loading: boolean
  error: string | null
  searchResults: Customer[]
}

// searchStore
interface SearchStore {
  query: string
  filters: SearchFilters
  isSearching: boolean
}
```

## PWA Implementation

### Service Worker Strategy
- **Cache First** - Static assets (CSS, JS, images)
- **Network First** - Data files (CSV)
- **Stale While Revalidate** - API calls (if any)

### Offline Capabilities
- Full app functionality without network
- Local data persistence via localStorage
- Offline indicator and graceful degradation

### iOS Optimization
- Custom splash screens for all iPhone sizes
- iOS status bar styling
- Touch-friendly interface (44px minimum touch targets)
- Prevent zoom on form inputs

## Maps Integration

### URL Schemes ✅
```typescript
// iOS Maps
maps://maps.apple.com/?address=${encodedAddress}

// Google Maps (fallback)
https://maps.google.com/maps?q=${encodedAddress}
```

### Implementation ✅
- Detect iOS vs other platforms
- Handle address encoding and special characters
- iOS Maps for iPhone, Google Maps for other platforms

## Performance Considerations

### Optimization Strategies
- **Lazy Loading** - Load quadrants on demand
- **Virtual Scrolling** - Large customer lists
- **Debounced Search** - Prevent excessive filtering
- **Memoization** - Computed properties and expensive operations

### Bundle Optimization
- Code splitting by route/quadrant
- Tree shaking unused dependencies
- Asset optimization and compression

## Development Workflow

### Code Standards
- **Conventional Commits** - Structured commit messages
- **ESLint + Prettier** - Consistent code formatting
- **TypeScript Strict Mode** - Type safety
- **Component Testing** - Unit tests for all components

### Build Process
```bash
# Development
yarn dev

# Type checking
yarn type-check

# Testing
yarn test:unit

# Production build
yarn build

# Linting
yarn lint
```

## Security Considerations

### Data Protection
- No sensitive data in client-side code
- Customer data stays local to device
- No external API calls with sensitive information

### CSP Headers
- Strict Content Security Policy
- No inline scripts or styles
- Trusted domains only

## Future Enhancements

### Potential Features
- Offline sync when network returns
- Export functionality (PDF reports)
- Advanced analytics and reporting
- Push notifications for follow-ups
- Integration with CRM systems

### Scalability
- Backend API integration
- Real-time data synchronization
- Multi-user support
- Advanced search with full-text indexing
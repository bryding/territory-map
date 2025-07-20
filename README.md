# Territory Call Map

A Progressive Web App (PWA) for sales territory management, optimized for iPhone deployment. Built to help field sales representatives efficiently navigate customer accounts across Colorado territories with integrated maps functionality.

## Features

- **Territory Organization**: 6 Colorado quadrants (Colorado Springs North/Central/South, Highlands Ranch, Littleton, Castle Rock)
- **Customer Management**: Display business addresses, customer numbers (CN), and sales data for DAXXIFY/RHA/SkinPen
- **Maps Integration**: One-tap address opening in iOS Maps or Google Maps  
- **CSV Data Loading**: Drag-and-drop CSV upload with sample data functionality
- **Mobile Optimized**: iPhone-responsive design with touch-friendly interfaces
- **Offline Ready**: LocalStorage persistence with PWA capabilities

## Technology Stack

- **Vue 3** with Composition API and TypeScript
- **Pinia** for state management
- **Papa Parse** for CSV processing
- **Vite** for fast development and building

## Project Setup

```sh
yarn
```

### Compile and Hot-Reload for Development

```sh
yarn dev
```

### Type-Check, Compile and Minify for Production

```sh
yarn build
```

### Run Unit Tests with [Vitest](https://vitest.dev/)

```sh
yarn test:unit
```

### Lint with [ESLint](https://eslint.org/)

```sh
yarn lint
```

### Format Code with Prettier

```sh
yarn format
```

## Getting Started

1. **Install dependencies**: `yarn`
2. **Start development server**: `yarn dev`
3. **Load sample data**: Click "Load Sample Data" button in the app
4. **View territories**: Browse customers organized by Colorado quadrants
5. **Test maps**: Tap any customer address to open in maps app

## Data Format

The app expects CSV files with sales representative data including:
- Customer accounts with CN numbers (e.g., CN267366)
- Quarterly sales data for DAXXIFY, RHA, and SkinPen products
- Customer notes and contact information
- Business addresses for maps integration

## Development

### Key Directories
- `src/components/` - Vue components (TerritoryQuadrant, CustomerCard, CSVLoader)
- `src/stores/` - Pinia stores for territory and search state
- `src/utils/` - CSV parsing, maps integration, and sales calculations
- `src/types/` - TypeScript type definitions
- `docs/` - Architecture and deployment documentation

### Testing

Currently using manual testing. Unit tests with Vitest planned for Phase 2.

## Deployment

The app can be deployed to any static hosting service. Build the production version with:

```sh
yarn build
```

This creates a `dist/` folder that can be deployed to:
- Netlify
- Vercel  
- GitHub Pages
- Any static file server

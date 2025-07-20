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

## PWA Installation on iPhone

### Step 1: Start the Development Server
```sh
# On your MacBook Pro
yarn build
yarn preview --host
```

The preview server will start at `http://localhost:4173/` and show your local IP address.

### Step 2: Find Your Local IP Address
```sh
# Get your MacBook's local IP address
ifconfig | grep "inet " | grep -v 127.0.0.1
```

Look for something like `192.168.1.XXX` or `10.0.0.XXX`.

### Step 3: Access on iPhone
1. **Connect iPhone to same WiFi** as your MacBook Pro
2. **Open Safari** on your iPhone
3. **Navigate to**: `http://YOUR_IP_ADDRESS:4173/` 
   - Example: `http://192.168.1.105:4173/`
4. **Load sample data** by tapping "Load Sample Data" or upload your CSV

### Step 4: Install as PWA
1. **Tap the Share button** (square with arrow) in Safari
2. **Scroll down and tap "Add to Home Screen"**
3. **Confirm the name** "Territory Pro" and tap "Add"
4. **Find the app icon** on your home screen

### Step 5: Test PWA Features
1. **Launch from home screen** - Opens full-screen without Safari UI
2. **Test offline** - Close Safari, reopen app from home screen (data persists)
3. **Test maps** - Tap any customer address to open in iOS Maps
4. **Test responsiveness** - Optimized for iPhone touch targets

### Alternative: Quick Network Access
```sh
# Start with network access in one command
yarn build && yarn preview --host
```

Then use the network URL shown in the terminal on your iPhone.

## Deployment Options

For production deployment, consider:
- **Netlify/Vercel**: Static hosting with automatic PWA support
- **GitHub Pages**: Free hosting for public repositories  
- **Firebase Hosting**: Google's hosting with PWA optimization
- **Your own server**: Any static file server with HTTPS

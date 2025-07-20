# PWA Deployment Guide

## Overview
This guide covers deploying the Territory Call Map as a Progressive Web App optimized for iPhone installation and offline use.

## Prerequisites

### Development Environment
- Node.js 18+ with yarn package manager
- Modern browser for testing (Safari recommended for iOS testing)
- HTTPS-enabled hosting platform

### Required Dependencies
```bash
yarn install
```

## Build Process

### Development Build
```bash
# Start development server
yarn dev

# Run type checking
yarn type-check

# Run tests
yarn test:unit

# Lint and format code
yarn lint
yarn format
```

### Production Build
```bash
# Create production build
yarn build

# Preview production build locally
yarn preview
```

### Build Verification
- [ ] All TypeScript compilation passes
- [ ] No ESLint errors
- [ ] All tests pass
- [ ] PWA manifest validation
- [ ] Service worker registration
- [ ] Offline functionality test

## PWA Configuration

### Web App Manifest (`public/manifest.json`)
```json
{
  "name": "Territory Call Map",
  "short_name": "Territory Pro",
  "description": "Professional territory call map for sales representatives",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#2563eb",
  "orientation": "portrait",
  "icons": [
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

### Service Worker Strategy
- **Cache First**: Static assets (JS, CSS, images)
- **Network First**: Data files (CSV)
- **Stale While Revalidate**: API calls

### iOS Meta Tags (in `index.html`)
```html
<!-- iOS PWA Support -->
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<meta name="apple-mobile-web-app-title" content="Territory Pro">
<meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">

<!-- iOS Icons -->
<link rel="apple-touch-icon" href="/icons/apple-touch-icon.png">
<link rel="apple-touch-startup-image" href="/icons/launch-screen.png">
```

## Hosting Platforms

### Recommended Platforms

#### 1. Netlify (Recommended)
```bash
# Build command
yarn build

# Publish directory
dist

# Environment variables
NODE_VERSION=18
```

**Netlify Configuration (`netlify.toml`)**
```toml
[build]
  command = "yarn build"
  publish = "dist"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"

[[headers]]
  for = "/manifest.json"
  [headers.values]
    Content-Type = "application/manifest+json"

[[headers]]
  for = "/sw.js"
  [headers.values]
    Cache-Control = "public, max-age=0, must-revalidate"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

#### 2. Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

#### 3. GitHub Pages
```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages
on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'yarn'
      
      - run: yarn install --frozen-lockfile
      - run: yarn build
      - run: yarn test:unit
      
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

## iPhone Installation Guide

### For End Users

#### Installation Steps
1. **Open Safari** on iPhone (other browsers won't show install option)
2. **Navigate** to the deployed PWA URL
3. **Tap Share button** (square with arrow pointing up)
4. **Scroll down** and tap "Add to Home Screen"
5. **Customize name** if desired and tap "Add"
6. **App icon** appears on home screen

#### Using the App
- **Launch**: Tap the app icon (opens in fullscreen mode)
- **Offline**: Works without internet after first load
- **Maps**: Tap any address to open in Maps app
- **Search**: Use search bar to find customers quickly
- **Navigation**: Swipe between territory quadrants

### Troubleshooting Installation

#### Common Issues
1. **"Add to Home Screen" not visible**
   - Must use Safari browser
   - Ensure HTTPS is enabled
   - Check PWA manifest is valid

2. **App doesn't work offline**
   - Verify service worker registration
   - Check browser console for errors
   - Clear cache and reload

3. **Maps not opening**
   - Check iOS version (Maps app required)
   - Verify address format
   - Test with known good addresses

## Performance Optimization

### Pre-deployment Checklist
- [ ] Bundle size analysis (`yarn build --analyze`)
- [ ] Lighthouse PWA audit (score 90+)
- [ ] iOS Safari testing
- [ ] Offline functionality test
- [ ] Performance testing on 3G networks

### Monitoring
```javascript
// Performance monitoring
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.ready.then(registration => {
    console.log('SW ready', registration.scope)
  })
}

// Offline detection
window.addEventListener('online', () => {
  console.log('Back online')
})

window.addEventListener('offline', () => {
  console.log('Gone offline')
})
```

## Security Configuration

### Content Security Policy
```html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  connect-src 'self' https:;
  font-src 'self';
  manifest-src 'self';
">
```

### HTTPS Requirements
- PWAs require HTTPS in production
- Service workers only work over HTTPS
- iOS installation requires secure context

## Data Management

### CSV File Updates
1. **Replace** CSV file in `/data` directory
2. **Rebuild** application (`yarn build`)
3. **Deploy** updated version
4. **Service worker** will update cached data

### Version Management
```javascript
// Version checking
const APP_VERSION = '1.0.0'
localStorage.setItem('app-version', APP_VERSION)

// Force refresh on version change
if (localStorage.getItem('app-version') !== APP_VERSION) {
  localStorage.clear()
  location.reload()
}
```

## Maintenance

### Regular Tasks
- **Update dependencies** monthly
- **Monitor performance** with Lighthouse
- **Test on latest iOS** versions
- **Review error logs** from hosting platform

### Analytics (Optional)
```javascript
// Basic usage tracking
if ('serviceWorker' in navigator) {
  // Track PWA usage
  gtag('event', 'pwa_install', {
    event_category: 'engagement'
  })
}
```

## Support and Debugging

### Debug Mode
```javascript
// Enable debug mode
if (process.env.NODE_ENV === 'development') {
  window.debugMode = true
  console.log('Debug mode enabled')
}
```

### Common Support Issues
1. **App not updating** - Clear Safari cache
2. **Offline not working** - Check network settings
3. **Maps not opening** - Verify iOS Maps app installed
4. **Performance issues** - Close other apps, restart iPhone

### Contact Information
- **Technical Issues**: [Developer Contact]
- **Feature Requests**: [Product Owner Contact]
- **Data Updates**: [Sales Manager Contact]
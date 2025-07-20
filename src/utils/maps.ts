/**
 * Maps integration utilities for iOS and web
 */

export function openInMaps(address: string): void {
  const encodedAddress = encodeURIComponent(address)
  
  // Detect iOS
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
  
  if (isIOS) {
    // Try iOS Maps first
    const iosUrl = `maps://maps.apple.com/?address=${encodedAddress}`
    window.location.href = iosUrl
  } else {
    // Use Google Maps for other platforms
    const googleUrl = `https://maps.google.com/maps?q=${encodedAddress}`
    window.open(googleUrl, '_blank')
  }
}
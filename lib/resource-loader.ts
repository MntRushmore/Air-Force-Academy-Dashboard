/**
 * Utility functions for safely loading resources
 */

// Function to safely load an image with fallback
export function getSafeImageUrl(path: string): string {
  // If it's already an absolute URL, return it
  if (path.startsWith("http")) {
    return path
  }

  // If it's a relative path, make sure it starts with /
  if (!path.startsWith("/")) {
    path = `/${path}`
  }

  return path
}

// Function to preload critical resources
export function preloadCriticalResources() {
  if (typeof window === "undefined") return

  const criticalImages = ["/digital-classroom-icon.png", "/digital-schoolhouse.png", "/placeholder.svg"]

  criticalImages.forEach((src) => {
    const img = new Image()
    img.src = getSafeImageUrl(src)
  })
}

// Function to handle resource loading errors
export function handleResourceError(event: Event) {
  const target = event.target as HTMLImageElement | HTMLScriptElement
  console.error(`Failed to load resource: ${target.src || target.href}`)

  // If it's an image, replace with placeholder
  if (target instanceof HTMLImageElement) {
    target.src = "/placeholder.svg"
    target.alt = "Image failed to load"
    target.classList.add("resource-error")
  }
}

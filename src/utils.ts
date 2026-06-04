/**
 * Utility to resolve asset paths robustly across both local host, dev servers,
 * and subpath-hosted environments like GitHub Pages.
 */
export function getAssetPath(relativePath: string): string {
  // Clean leading slash from relativePath to normalize it
  const cleanPath = relativePath.startsWith('/') ? relativePath.slice(1) : relativePath;
  
  const pathname = window.location.pathname;
  
  // Detect if running on localhost or inside standard containers/AI Studio previews
  const isLocalhost = window.location.hostname === 'localhost' || 
                      window.location.hostname === '127.0.0.1' || 
                      window.location.hostname.includes('192.168.') || 
                      window.location.hostname.includes('.run.app');
  
  if (isLocalhost) {
    return `/${cleanPath}`;
  }
  
  // On GitHub Pages or subpath-hosted deployments, let's extract the repository / subpath segment.
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length > 0) {
    const firstSegment = segments[0];
    
    // Check if the current environment's first pathname is 'textHunter', which is our repo name
    if (firstSegment === 'textHunter') {
      return `/textHunter/${cleanPath}`;
    }
  }
  
  // Fall back to relative path if we cannot determine the exact base context,
  // which works fine on correct trailing-slash settings.
  return `/${cleanPath}`;
}

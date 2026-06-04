/**
 * Utility to resolve asset paths robustly across both local host, dev servers,
 * and subpath-hosted environments like GitHub Pages.
 */
export function getAssetPath(relativePath: string): string {
  // Clean leading slash from relativePath to normalize it
  const cleanPath = relativePath.startsWith('/') ? relativePath.slice(1) : relativePath;
  
  // Use Vite's built-in BASE_URL which is statically replaced correctly during build.
  // This automatically uses the value of `base` we configured in vite.config.ts.
  const baseUrl = (import.meta as any).env?.BASE_URL;
  
  if (baseUrl) {
    if (baseUrl.endsWith('/')) {
      return `${baseUrl}${cleanPath}`;
    } else {
      return `${baseUrl}/${cleanPath}`;
    }
  }
  
  return `/${cleanPath}`;
}

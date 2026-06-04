/**
 * Utility to resolve asset paths robustly across both local host, dev servers,
 * and subpath-hosted environments like GitHub Pages.
 */
export function getAssetPath(relativePath: string): string {
  // Clean leading slash from relativePath to normalize it
  const cleanPath = relativePath.startsWith('/') ? relativePath.slice(1) : relativePath;
  
  // Dynamically resolve the base directory pathname of the current webpage.
  // This supports all hosting environments: localhost, preview servers (.run.app), nested repository paths
  // on GitHub Pages (e.g. /my-repo/), or multi-segment game aggregators (e.g. itch.io).
  const pathname = window.location.pathname;
  
  let directoryPath = '/';
  if (pathname.endsWith('/')) {
    directoryPath = pathname;
  } else {
    const lastSlashIndex = pathname.lastIndexOf('/');
    if (lastSlashIndex >= 0) {
      const lastSegment = pathname.substring(lastSlashIndex + 1);
      // If the last segment has a dot (e.g. index.html) or is "index", strip it to retrieve the directory.
      if (lastSegment.includes('.') || lastSegment === 'index' || lastSegment === 'index.html') {
        directoryPath = pathname.substring(0, lastSlashIndex + 1);
      } else {
        // If it looks like a folder name (e.g. /textHunter), include it with a trailing slash.
        directoryPath = pathname + '/';
      }
    }
  }
  
  // Ensure the directory path originates and terminates with a single slash
  if (!directoryPath.startsWith('/')) {
    directoryPath = '/' + directoryPath;
  }
  if (!directoryPath.endsWith('/')) {
    directoryPath = directoryPath + '/';
  }
  
  return `${directoryPath}${cleanPath}`;
}

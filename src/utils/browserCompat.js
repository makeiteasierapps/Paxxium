export function setupBrowserCompatibility() {
    // Safari/iOS specific fixes
    if (
        navigator.userAgent.match(/iPad|iPhone|iPod/) ||
        (navigator.userAgent.includes('Safari') &&
            !navigator.userAgent.includes('Chrome'))
    ) {
        // Disable Safari's aggressive caching via meta tag
        const meta = document.createElement('meta');
        meta.httpEquiv = 'pragma';
        meta.content = 'no-cache';
        document.getElementsByTagName('head')[0].appendChild(meta);

        // Check for updates on pageshow event (Safari)
        window.addEventListener('pageshow', (event) => {
            if (event.persisted) {
                // Page was restored from the Safari back-forward cache
                window.location.reload();
            }
        });
    }

    // For all browsers - check for updates after online event
    window.addEventListener('online', () => {
        // When the browser comes back online, check for updates
        import('./serviceWorkerManager').then((module) => {
            module.checkAndUpdateServiceWorker();
        });
    });
}

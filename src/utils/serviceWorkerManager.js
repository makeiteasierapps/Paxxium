export async function checkAndUpdateServiceWorker() {
    try {
        // Fetch the current version with cache-busting
        const timestamp = new Date().getTime();
        const response = await fetch(`/version.json?_=${timestamp}`, {
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                Pragma: 'no-cache',
                Expires: '0',
            },
            cache: 'no-store',
        });

        if (!response.ok) return false;

        const { version } = await response.json();
        const storedVersion = localStorage.getItem('app_version');

        // If version changed, update the app
        if (!storedVersion || storedVersion !== version) {
            // Store the new version first
            localStorage.setItem('app_version', version);

            // Unregister service workers
            if ('serviceWorker' in navigator) {
                const registrations =
                    await navigator.serviceWorker.getRegistrations();
                for (const registration of registrations) {
                    await registration.unregister();
                }
            }

            // Clear caches
            if ('caches' in window) {
                const keys = await caches.keys();
                await Promise.all(keys.map((key) => caches.delete(key)));
            }

            // Reload the page
            window.location.reload(true);
            return true;
        }

        return false;
    } catch (error) {
        console.error('Update check failed:', error);
        return false;
    }
}

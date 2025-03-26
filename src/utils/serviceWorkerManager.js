export async function checkAndUpdateServiceWorker() {
    try {
        // Prevent rapid rechecks - minimum 2 minute interval between checks
        const lastUpdateCheck = localStorage.getItem('last_update_check');
        const now = Date.now();

        // Don't check again if we checked in the last 2 minutes (increased from 30s)
        if (lastUpdateCheck && now - parseInt(lastUpdateCheck) < 120000) {
            return false;
        }

        // Check if an update was recently applied to prevent update loops
        const lastUpdateApplied = localStorage.getItem('last_update_applied');
        if (lastUpdateApplied && now - parseInt(lastUpdateApplied) < 300000) {
            // 5 minute cooldown
            console.log('Update recently applied, skipping check');
            return false;
        }

        // Record this check time
        localStorage.setItem('last_update_check', now.toString());

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
            console.log(
                `Version change detected: ${storedVersion} → ${version}`
            );

            // Store the new version
            localStorage.setItem('app_version', version);
            // Mark the time we applied an update
            localStorage.setItem('last_update_applied', now.toString());

            // Only handle service worker updates if they're supported
            if ('serviceWorker' in navigator) {
                try {
                    const registrations =
                        await navigator.serviceWorker.getRegistrations();

                    // Instead of immediately unregistering, send update message first
                    for (const registration of registrations) {
                        if (registration.waiting) {
                            registration.waiting.postMessage({
                                type: 'SKIP_WAITING',
                            });
                            // Only trigger one update at a time
                            break;
                        }
                    }

                    // Give service worker time to update
                    await new Promise((resolve) => setTimeout(resolve, 1000));

                    // Now we only unregister if needed - many browsers don't need this step
                    // and it can cause refresh loops
                    const shouldForceUnregister = false; // Set to true only if needed
                    if (shouldForceUnregister) {
                        for (const registration of registrations) {
                            await registration.unregister();
                        }
                    }
                } catch (err) {
                    console.error('Service worker update failed:', err);
                }
            }

            // Set a flag to indicate we're refreshing due to an update
            sessionStorage.setItem('app_updating', 'true');

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

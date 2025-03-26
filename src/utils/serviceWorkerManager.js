export async function checkAndUpdateServiceWorker() {
    try {
        // Prevent rapid rechecks with a longer cooldown period
        const lastUpdateCheck = localStorage.getItem('last_update_check');
        const now = Date.now();

        // Don't check again if we checked in the last 5 minutes (increased from 2 mins)
        if (lastUpdateCheck && now - parseInt(lastUpdateCheck) < 300000) {
            console.log('Update check throttled - checked recently');
            return false;
        }

        // Check if an update was recently applied to prevent update loops
        const lastUpdateApplied = localStorage.getItem('last_update_applied');
        if (lastUpdateApplied && now - parseInt(lastUpdateApplied) < 600000) {
            // 10 minute cooldown (increased)
            console.log('Update recently applied, skipping check');
            return false;
        }

        // Check if we're already in an update process
        if (sessionStorage.getItem('app_updating') === 'true') {
            console.log('Already in update process, skipping check');
            return false;
        }

        // Record this check time
        localStorage.setItem('last_update_check', now.toString());

        console.log('Fetching version information...');

        // Fetch the current version with aggressive cache-busting
        const timestamp = now;
        const response = await fetch(`/version.json?_=${timestamp}`, {
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                Pragma: 'no-cache',
                Expires: '0',
            },
            cache: 'no-store',
        });

        if (!response.ok) {
            console.log(
                'Version check failed - server returned',
                response.status
            );
            return false;
        }

        const versionData = await response.json();
        const { version } = versionData;
        const storedVersion = localStorage.getItem('app_version');

        console.log(
            `Current version: ${
                storedVersion || 'none'
            }, Server version: ${version}`
        );

        // If version changed, update the app
        if (!storedVersion || storedVersion !== version) {
            console.log(
                `Version change detected: ${
                    storedVersion || 'none'
                } → ${version}`
            );

            // Store the new version first
            localStorage.setItem('app_version', version);
            // Mark the time we applied an update
            localStorage.setItem('last_update_applied', now.toString());

            // Only handle service worker updates if they're supported
            if ('serviceWorker' in navigator) {
                try {
                    console.log('Triggering service worker update');
                    const registrations =
                        await navigator.serviceWorker.getRegistrations();

                    if (registrations.length === 0) {
                        console.log('No service workers registered');
                    }

                    // Find waiting service workers and send update message
                    let foundWaiting = false;
                    for (const registration of registrations) {
                        if (registration.waiting) {
                            console.log(
                                'Found waiting service worker, sending SKIP_WAITING'
                            );
                            foundWaiting = true;

                            // Set flag before sending message to prevent race conditions
                            sessionStorage.setItem('app_updating', 'true');

                            registration.waiting.postMessage({
                                type: 'SKIP_WAITING',
                            });

                            // Only trigger one update at a time
                            break;
                        }
                    }

                    // If no waiting workers, update them manually
                    if (!foundWaiting && registrations.length > 0) {
                        console.log(
                            'No waiting workers, updating all registrations'
                        );
                        // Update all service worker registrations
                        for (const registration of registrations) {
                            await registration.update();
                        }

                        // Set flag that we're updating
                        sessionStorage.setItem('app_updating', 'true');

                        // Give a small delay for update to process
                        await new Promise((resolve) =>
                            setTimeout(resolve, 2000)
                        );

                        // Reload the page directly if no service worker took over
                        window.location.reload(true);
                        return true;
                    }
                } catch (err) {
                    console.error('Service worker update failed:', err);
                    // Clean up in case of error
                    sessionStorage.removeItem('app_updating');
                }
            } else {
                console.log(
                    'Service workers not supported, reloading directly'
                );
                // Set flag to prevent loops
                sessionStorage.setItem('app_updating', 'true');
                // Reload the page directly
                window.location.reload(true);
                return true;
            }

            return true;
        } else {
            console.log('Version unchanged, no update needed');
        }

        return false;
    } catch (error) {
        console.error('Update check failed:', error);
        // Clean up in case of error
        sessionStorage.removeItem('app_updating');
        return false;
    }
}

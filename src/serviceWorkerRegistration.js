export function register(config) {
    if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            const swUrl = `${
                process.env.PUBLIC_URL
            }/service-worker.js?_=${Date.now()}`;

            // Check if this app has just been updated
            const isUpdating =
                sessionStorage.getItem('app_updating') === 'true';
            if (isUpdating) {
                // We just updated, so we'll skip immediate registration
                console.log(
                    'App just updated, delaying service worker registration'
                );
                // Clear the flag
                sessionStorage.removeItem('app_updating');
                // Delay registration to prevent loops
                setTimeout(() => registerServiceWorker(swUrl), 5000);
            } else {
                registerServiceWorker(swUrl);
            }
        });
    }

    function registerServiceWorker(swUrl) {
        navigator.serviceWorker
            .register(swUrl)
            .then((registration) => {
                console.log('Service worker registered successfully');

                // Check for updates periodically but with a longer interval
                const updateInterval = setInterval(() => {
                    // Check if app has been updated recently to prevent update loops
                    const lastUpdateApplied = localStorage.getItem(
                        'last_update_applied'
                    );
                    const now = Date.now();

                    if (
                        !lastUpdateApplied ||
                        now - parseInt(lastUpdateApplied) > 300000
                    ) {
                        console.log('Checking for service worker updates...');
                        registration.update().catch((err) => {
                            console.error('Service worker update failed:', err);
                        });
                    }
                }, 3 * 60 * 60 * 1000); // Check every 3 hours (reduced frequency)

                // Clear interval on page unload
                window.addEventListener('beforeunload', () => {
                    clearInterval(updateInterval);
                });

                registration.onupdatefound = () => {
                    const installingWorker = registration.installing;
                    if (!installingWorker) return;

                    installingWorker.onstatechange = () => {
                        if (installingWorker.state === 'installed') {
                            if (navigator.serviceWorker.controller) {
                                // New content available, notify the application
                                console.log(
                                    'New content is available, updating...'
                                );

                                // Check for version change
                                checkForVersionChange(registration);
                            } else {
                                // Content is cached for offline use
                                console.log(
                                    'Content is cached for offline use'
                                );
                            }
                        }
                    };
                };
            })
            .catch((error) => {
                console.error(
                    'Error during service worker registration:',
                    error
                );
            });

        // Listen for controller change and reload the page, but only if not already reloading
        let isReloading = false;
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            if (!isReloading) {
                isReloading = true;
                console.log('Service worker controller changed, reloading...');
                window.location.reload();
            }
        });
    }

    // Check if the version has actually changed to avoid unnecessary updates
    function checkForVersionChange(registration) {
        // Don't update if we've recently updated
        const lastUpdateApplied = localStorage.getItem('last_update_applied');
        const now = Date.now();

        if (lastUpdateApplied && now - parseInt(lastUpdateApplied) < 300000) {
            console.log('Update recently applied, skipping activation');
            return;
        }

        // Don't update if we're already updating
        if (sessionStorage.getItem('app_updating') === 'true') {
            console.log('Already updating, skipping activation');
            return;
        }

        // Force clients to reload after update
        if (registration.waiting) {
            // Mark that we're updating to prevent loops
            sessionStorage.setItem('app_updating', 'true');
            localStorage.setItem('last_update_applied', now.toString());

            registration.waiting.postMessage({
                type: 'SKIP_WAITING',
            });
        }
    }
}

export function unregister() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready
            .then((registration) => {
                registration.unregister();
            })
            .catch((error) => {
                console.error(error.message);
            });
    }
}

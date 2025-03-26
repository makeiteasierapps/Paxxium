export function register(config) {
    if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            const swUrl = `${
                process.env.PUBLIC_URL
            }/service-worker.js?_=${Date.now()}`;

            navigator.serviceWorker
                .register(swUrl)
                .then((registration) => {
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
                            registration.update().catch((err) => {
                                console.error(
                                    'Service worker update failed:',
                                    err
                                );
                            });
                        }
                    }, 3 * 60 * 60 * 1000); // Check every 3 hours (reduced frequency)

                    // Clear interval on page unload
                    window.addEventListener('beforeunload', () => {
                        clearInterval(updateInterval);
                    });

                    registration.onupdatefound = () => {
                        const installingWorker = registration.installing;

                        installingWorker.onstatechange = () => {
                            if (installingWorker.state === 'installed') {
                                if (navigator.serviceWorker.controller) {
                                    // New content available, notify the application
                                    console.log(
                                        'New content is available, updating...'
                                    );

                                    // Force clients to reload after update - but only if we haven't
                                    // just updated to prevent loops
                                    if (
                                        registration.waiting &&
                                        !sessionStorage.getItem('app_updating')
                                    ) {
                                        // Mark that we're updating to prevent loops
                                        sessionStorage.setItem(
                                            'app_updating',
                                            'true'
                                        );

                                        registration.waiting.postMessage({
                                            type: 'SKIP_WAITING',
                                        });
                                    }
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
                    console.log(
                        'Service worker controller changed, reloading...'
                    );
                    window.location.reload();
                }
            });
        });
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

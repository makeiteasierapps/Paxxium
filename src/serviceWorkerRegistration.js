export function register(config) {
    if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            const swUrl = `${
                process.env.PUBLIC_URL
            }/service-worker.js?_=${Date.now()}`;

            navigator.serviceWorker
                .register(swUrl)
                .then((registration) => {
                    // Check for updates periodically
                    setInterval(() => {
                        registration.update().catch((err) => {
                            console.error('Service worker update failed:', err);
                        });
                    }, 60 * 60 * 1000); // Check every hour

                    registration.onupdatefound = () => {
                        const installingWorker = registration.installing;

                        installingWorker.onstatechange = () => {
                            if (installingWorker.state === 'installed') {
                                if (navigator.serviceWorker.controller) {
                                    // New content available, notify the application
                                    console.log(
                                        'New content is available, updating...'
                                    );

                                    // Force clients to reload after update
                                    if (registration.waiting) {
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

            // Listen for controller change and reload the page
            navigator.serviceWorker.addEventListener('controllerchange', () => {
                console.log('Service worker controller changed, reloading...');
                window.location.reload();
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

import React, { useEffect } from 'react';
import App from './App';
import { createRoot } from 'react-dom/client';
import { checkAndUpdateServiceWorker } from './utils/serviceWorkerManager';
import { setupBrowserCompatibility } from './utils/browserCompat';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

// Create a wrapper component to handle update checks
function AppWithUpdateCheck() {
    useEffect(() => {
        // Initialize app - set up browser compatibility
        setupBrowserCompatibility();

        // Check if we just completed an update
        const isUpdating = sessionStorage.getItem('app_updating') === 'true';
        if (isUpdating) {
            // Clear the flag and don't immediately check again
            sessionStorage.removeItem('app_updating');
            console.log('App just updated, skipping update check');
        } else {
            // Only check for updates if we didn't just update
            // Add a longer delay to ensure the app and service worker are fully loaded
            const initialCheckTimer = setTimeout(() => {
                console.log('Running initial version check');
                checkAndUpdateServiceWorker();
            }, 10000);

            return () => clearTimeout(initialCheckTimer);
        }

        // Set up periodic checks, but at a much lower frequency to avoid update loops
        const checkInterval = setInterval(() => {
            console.log('Running periodic version check');
            checkAndUpdateServiceWorker();
        }, 60 * 60 * 1000); // Check every hour

        // Check when user tabs back to the app, but throttle to prevent excessive checks
        let lastVisibilityCheck = 0;
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                const now = Date.now();
                // Only check if it's been at least 15 minutes since last visibility check
                if (now - lastVisibilityCheck > 15 * 60 * 1000) {
                    lastVisibilityCheck = now;
                    console.log('Running visibility change version check');
                    checkAndUpdateServiceWorker();
                }
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            clearInterval(checkInterval);
            document.removeEventListener(
                'visibilitychange',
                handleVisibilityChange
            );
        };
    }, []);

    return <App />;
}

const root = createRoot(document.getElementById('root'));
root.render(<AppWithUpdateCheck />);

// Register service worker after app is rendered
serviceWorkerRegistration.register();

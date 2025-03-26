import React, { useEffect } from 'react';
import App from './App';
import { createRoot } from 'react-dom/client';
import { checkAndUpdateServiceWorker } from './utils/serviceWorkerManager';
import { setupBrowserCompatibility } from './utils/browserCompat';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

// Create a wrapper component to handle update checks
function AppWithUpdateCheck() {
    useEffect(() => {
        // Check if we just completed an update
        const isUpdating = sessionStorage.getItem('app_updating') === 'true';
        if (isUpdating) {
            // Clear the flag and don't immediately check again
            sessionStorage.removeItem('app_updating');
            console.log('App just updated, skipping update check');
        } else {
            // Only check for updates if we didn't just update
            // Add a short delay to ensure the app is fully loaded first
            const initialCheckTimer = setTimeout(() => {
                checkAndUpdateServiceWorker();
            }, 5000);
            return () => clearTimeout(initialCheckTimer);
        }

        setupBrowserCompatibility();

        // Set up periodic checks - increasing interval to 30 minutes
        const checkInterval = setInterval(() => {
            checkAndUpdateServiceWorker();
        }, 30 * 60 * 1000); // Check every 30 minutes

        // Check when user tabs back to the app, but throttle to prevent excessive checks
        let lastVisibilityCheck = 0;
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                const now = Date.now();
                // Only check if it's been at least 5 minutes since last visibility check
                if (now - lastVisibilityCheck > 5 * 60 * 1000) {
                    lastVisibilityCheck = now;
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

// Register service worker
serviceWorkerRegistration.register();

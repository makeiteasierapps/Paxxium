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
        } else {
            // Only check for updates if we didn't just update
            checkAndUpdateServiceWorker();
        }

        setupBrowserCompatibility();

        // Set up periodic checks
        const checkInterval = setInterval(() => {
            checkAndUpdateServiceWorker();
        }, 15 * 60 * 1000); // Check every 15 minutes

        // Check when user tabs back to the app
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                checkAndUpdateServiceWorker();
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

serviceWorkerRegistration.register();

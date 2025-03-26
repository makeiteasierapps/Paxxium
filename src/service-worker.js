/* eslint-disable no-restricted-globals */

import { clientsClaim } from 'workbox-core';
import { ExpirationPlugin } from 'workbox-expiration';
import { precacheAndRoute, createHandlerBoundToURL } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate } from 'workbox-strategies';

clientsClaim();

// This array will be populated by workbox during build
precacheAndRoute(self.__WB_MANIFEST);

const fileExtensionRegexp = new RegExp('/[^/?]+\\.[^/]+$');
registerRoute(
    // Return false to exempt requests from being fulfilled by index.html.
    ({ request, url }) => {
        // If this isn't a navigation, skip.
        if (request.mode !== 'navigate') {
            return false;
        } // If this is a URL that starts with /_, skip.

        if (url.pathname.startsWith('/_')) {
            return false;
        } // If this looks like a URL for a resource, because it contains // a file extension, skip.

        if (url.pathname.match(fileExtensionRegexp)) {
            return false;
        } // Return true to signal that we want to use the handler.

        return true;
    },
    createHandlerBoundToURL(process.env.PUBLIC_URL + '/index.html')
);

registerRoute(
    // Add in any other file extensions or routing criteria as needed.
    ({ url }) =>
        url.origin === self.location.origin && url.pathname.endsWith('.png'), // Customize this strategy as needed, e.g., by changing to CacheFirst.
    new StaleWhileRevalidate({
        cacheName: 'images',
        plugins: [
            // Ensure that once this runtime cache reaches a maximum size the
            // least-recently used images are removed.
            new ExpirationPlugin({ maxEntries: 50 }),
        ],
    })
);

// Track if we've already handled a skipWaiting message
let skipWaitingMessageHandled = false;

self.addEventListener('message', (event) => {
    if (
        event.data &&
        event.data.type === 'SKIP_WAITING' &&
        !skipWaitingMessageHandled
    ) {
        console.log('Skip waiting message received');
        skipWaitingMessageHandled = true;
        self.skipWaiting();
    }
});

// This string will be replaced by version-injector.js during build
const CACHE_VERSION = 'app-cache-v1';

// Install event - minimal caching for critical resources
self.addEventListener('install', (event) => {
    console.log(
        `Service worker installing with cache version: ${CACHE_VERSION}`
    );
    event.waitUntil(
        caches
            .open(CACHE_VERSION)
            .then((cache) => {
                return cache.addAll([
                    '/',
                    '/index.html',
                    '/offline.html', // Create a simple offline page
                ]);
            })
            .then(() => {
                // Skip waiting only in specific cases, not automatically
                // This helps prevent infinite loops
                return Promise.resolve();
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log(
        `Service worker activating with cache version: ${CACHE_VERSION}`
    );
    // Reset the skipWaiting flag
    skipWaitingMessageHandled = false;

    event.waitUntil(
        caches
            .keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames
                        .filter((cacheName) => {
                            return cacheName !== CACHE_VERSION;
                        })
                        .map((cacheName) => {
                            console.log(
                                `Deleting outdated cache: ${cacheName}`
                            );
                            return caches.delete(cacheName);
                        })
                );
            })
            .then(() => {
                console.log('Service worker activated and controlling clients');
                return self.clients.claim();
            })
    );
});

// Fetch event - network-first strategy
self.addEventListener('fetch', (event) => {
    // Skip cross-origin requests
    if (!event.request.url.startsWith(self.location.origin)) return;

    // Don't cache API requests or version checks
    if (
        event.request.url.includes('/api/') ||
        event.request.url.includes('version.json')
    ) {
        return;
    }

    // For HTML navigation requests, always go to network first
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request).catch(() => {
                return caches.match('/offline.html');
            })
        );
        return;
    }

    // For other assets, use network first with cache fallback
    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // Cache the response for future use
                if (response.status === 200) {
                    const responseToCache = response.clone();
                    caches.open(CACHE_VERSION).then((cache) => {
                        cache.put(event.request, responseToCache);
                    });
                }
                return response;
            })
            .catch(() => {
                return caches.match(event.request);
            })
    );
});

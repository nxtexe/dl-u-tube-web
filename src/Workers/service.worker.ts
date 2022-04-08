import {registerRoute} from 'workbox-routing';
import { CacheFirst, CacheOnly, StaleWhileRevalidate } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import {precacheAndRoute} from 'workbox-precaching';

// ffmpeg assets precaching
precacheAndRoute([
    {url: 'https://unpkg.com/@ffmpeg/core@0.10.0/dist/ffmpeg-core.js', revision: null},
    {url: 'https://unpkg.com/@ffmpeg/core@0.10.0/dist/ffmpeg-core.wasm', revision: null},
    {url: 'https://unpkg.com/@ffmpeg/core@0.10.0/dist/ffmpeg-core.worker.js', revision: null}
]);

// static assets related to ffmpeg.wasm should always be fetched from cache
registerRoute(
    ({request}) => request.url.includes('https://unpkg.com/@ffmpeg'),
    new CacheOnly({
        cacheName: 'ffmpeg'
    })
);

// static assets related to fetching videos
registerRoute(
    ({url}) => /\/^api/.test(url.pathname),
    new CacheFirst({
        cacheName: 'video-assets',
        plugins: [
            new ExpirationPlugin({
                maxAgeSeconds: 60 * 60 * 24 * 7 // a week
            })
        ]
    })
);

// general static asset caching e.g. fonts, css, etc.
const destinations = ["style", "font", "manifest", "script", "worker"];
registerRoute(
    ({request}) => destinations.includes(request.destination),
    new CacheFirst({
        cacheName: 'static'
    })
);

// app route
// revalidate in case update is available
registerRoute(
    ({request}) => request.destination === "document",
    new StaleWhileRevalidate({
        cacheName: 'app'
    })
);


// catch all strategy
registerRoute(
    ({url}) => url.pathname === '/',
    new CacheFirst()
);
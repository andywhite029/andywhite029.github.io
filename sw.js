const CACHE_NAME = 'personal-website-v1';
const urlsToCache = [
    '/personal-website/',
    '/personal-website/index0.html',
    '/personal-website/index01.html',
    '/personal-website/index02.html',
    '/personal-website/styles/main.css',
    '/personal-website/styles/navbar.css',
    '/personal-website/styles/carousel.css',
    '/personal-website/js/main.js',
    '/personal-website/js/carousel.js',
    '/personal-website/images/logo.jpg'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    return response;
                }
                return fetch(event.request)
                    .then(response => {
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }
                        const responseToCache = response.clone();
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });
                        return response;
                    });
            })
    );
}); 
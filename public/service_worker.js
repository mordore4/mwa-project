const version = 5;

self.addEventListener("install", function (event) {
    console.log("ManiGen v%s installed", version)
});

self.addEventListener("activate", function (event) {
    console.log("ManiGen v%s activated", version);
    event.waitUntil(
        caches.keys()
            .then(function (keys) {
                return Promise.all(keys.filter(function (key) {
                    return key !== version;
                }).map(function (key) {
                    return caches.delete(key);
                }))
            }));
});

self.addEventListener("fetch", function (event) {
    event.respondWith(
        caches.match(event.request)
            .then(function (res) {
                if(res)
                    return res;

                if (!navigator.onLine)
                    return Promise.all(function () {
                        event.respondWith(new Response("<h1>you're offline</h1>"))
                    });

                return fetchAndUpdate(event.request);
            }));
});

self.addEventListener("push", function(event) {
    console.log("Received push event");
    console.log(`Push data: "${event.data.text()}"`);

    const title = "Watch this interesting link";
    const options = {
        body: event.data.text(),
        icon: "/assets/media/icon.png",
        badge: "/assets/media/icon.png"
    };

    event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", function(event) {
    console.log("Notification clicked");

    event.notification.close();

    event.waitUntil(
        clients.openWindow(event.notification.body)
    );
});

function fetchAndUpdate(request) {
    return fetch(request)
        .then(function (res) {
            if (res) {
                return caches.open(version)
                    .then(function (cache) {
                        return cache.put(request, res.clone())
                            .then(function () {
                                return res;
                            });
                    });
            }
        });
}
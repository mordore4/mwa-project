const version = ["v8"];

self.addEventListener("install", function (event) {
    event.waitUntil(
        caches.open(version).then(function (cache) {
            return cache.addAll([
                "/",
                "/index.html",
                "/assets/css/screen.css",
                "/assets/css/semantic.min.css",
                "/assets/js/script.js",
                "/assets/js/semantic.min.js",
                "/assets/media/icon.png",
                "/assets/fonts/icons.eot",
                "/assets/fonts/icons.otf",
                "/assets/fonts/icons.svg",
                "/assets/fonts/icons.ttf",
                "/assets/fonts/icons.woff",
                "/assets/fonts/icons.woff2"
            ])
        })
    );
    console.log("ManiGen v%s installed", version)
});

self.addEventListener("activate", function (event) {
    console.log("ManiGen v%s activated", version[0]);
    event.waitUntil(
        caches.keys()
            .then(function (keys) {
                return Promise.all(keys.map(function(key) {
                    if (version.indexOf(key) === -1) {
                        return caches.delete(key);
                    }
                }));
            })
    );
});

self.addEventListener("fetch", function (event) {
    event.respondWith(
        caches.match(event.request)
            .then(function (res) {
                if(res)
                    return res;

                else if (!navigator.onLine)
                    return new Response("<h1>you're offline</h1>", {
                        headers: { "Content-Type": "text/html" }});


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
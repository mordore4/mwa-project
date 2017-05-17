(function($, window, document) {

    var manifest = {
        "lang": "en-US",
        "start_url": "/",
        "display": "standalone"
    };

    var appKey = "BEqB9HfDk0nwHZrJDlQ4FI4Glkbd11p12_mnxBVG4DQJUW16J240oP9HTNhowfiSkk4DG9EsRtp5IlyCVYVM42g";
    var serviceWorkerRegistration;
    var receivesNotifications;
    var togglingNotifications = false;

    function setupServiceworker() {
        if ("serviceWorker" in navigator && 'PushManager' in window) {
            navigator.serviceWorker.register("service_worker.js")
                .then((r) => {
                    console.log("Service worker registered");

                    serviceWorkerRegistration = r;
                    initUI();
                }).catch(console.error);
        } else {
            console.warn("Push not supported");
            $("#notification_toggle").text("Notifications not available");
        }
    }


        function initUI() {
            $("#notification_toggle").on("click", (e) => {
                e.preventDefault();

                if (!togglingNotifications) {
                    togglingNotifications = true;

                    if (receivesNotifications) unsubscribe(); else subscribe();
                }
            });

            serviceWorkerRegistration.pushManager.getSubscription()
                .then(function (receives) {
                    receivesNotifications = !(receives === null);

                    if (receivesNotifications) {
                        console.log("User will be notified");
                    } else {
                        console.log("User will not be notified");
                    }

                    updateUI();
                });
        }

        function updateUI() {
            if (Notification.permission === 'denied') {
                $("#notification_toggle").text("Notifications blocked");
                togglingNotifications = true;

                return;
            }

            if (receivesNotifications) {
                $("#notification_toggle").text("Disable notifications");
            } else {
                $("#notification_toggle").text("Enable notifications");
            }

            togglingNotifications = false;
        }

    function urlB64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
            .replace(/\-/g, '+')
            .replace(/_/g, '/');

        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);

        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }

        return outputArray;
    }

    function subscribe() {
        const applicationServerKey = urlB64ToUint8Array(appKey);
        serviceWorkerRegistration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: applicationServerKey
        })
            .then(function (receiver) {
                console.log('User receives notifications.');

                receivesNotifications = true;

                $.ajax(
                    {
                        method: "GET",
                        url: "/notification/register",
                        data: {
                            data: JSON.stringify(receiver)
                        }
                    }
                );

                updateUI();
            })
            .catch(function (err) {
                console.log('Failed to subscribe the user: ', err);
                updateUI();
            });
    }

    function unsubscribe() {
        serviceWorkerRegistration.pushManager.getSubscription()
            .then(function (receiver) {
                if (receiver) {

                    $.ajax(
                        {
                            method: "GET",
                            url: "/notification/unregister",
                            data: {
                                data: JSON.stringify(receiver)
                            }
                        }
                    );

                    return receiver.unsubscribe();
                }
            })
            .catch(function (error) {
                console.log('Error unsubscribing', error);
            })
            .then(function () {
                console.log('User is unsubscribed.');
                receivesNotifications = false;

                updateUI();
            });
    }

    function showManifest() {
        var json_manifest = JSON.stringify(manifest, null, 2);
        $("#manifest").text(json_manifest);
    }

    function changeManifest() {
        var jquery_element = $(this);
        var name = jquery_element.attr("name");
        var value = jquery_element.val();
        var split_name = name.split("-");
        if (value === "") {
            delete manifest[split_name[0]]
        }
        else
        {
            if (split_name[1] == undefined)
            {
                manifest[name] = value;
            }
            else
            {
                if (manifest[split_name[0]] == undefined)
                {
                    manifest[split_name[0]] = [];
                    manifest[split_name[0]][0] = {};
                }

                manifest[split_name[0]][0][split_name[1]] = value;
            }
        }

        if(jquery_element.attr("type") === "checkbox")
        {
            if (!jquery_element.is(":checked")) {
                delete manifest[split_name[0]]
            }
            else
            {
                manifest[name] = true;
            }
        }

        showManifest();
    }

    $(function() {
        showManifest();
        $("form").on("change", "input, select", changeManifest);
        setupServiceworker();
    });

}(window.jQuery, window, document));
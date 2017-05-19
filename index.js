const express = require("express");
const app = express();
const server = require("http").Server(app);
const webPush = require("web-push");

var receivers = [];

var appKey = "BEqB9HfDk0nwHZrJDlQ4FI4Glkbd11p12_mnxBVG4DQJUW16J240oP9HTNhowfiSkk4DG9EsRtp5IlyCVYVM42g";
var privateKey = "Gq6QQsmhKCboYrq0MJd4D9FEDKt0npOeWAqfZKAyVl0";

function sendNotification(message) {
    console.log("sending notifications");

    receivers.forEach(function (receiver) {
        console.log(receiver.keys);
        const options = {
            TTL: 24 * 60 * 60,
            vapidDetails: {
                subject: 'mailto:sam.demeulenaere@student.howest.be',
                publicKey: appKey,
                privateKey: privateKey
            },
        };
        webPush.sendNotification(
            receiver,
            message,
            options
        );
    });
}

app.get("/notification/register", function (req, res, next) { //db would be easier, but desided against it for ease of use
    var receiver = JSON.parse(req.query.data);
    receivers.push(receiver);

    console.log("notification subscriber added");
});

app.get("/notification/unregister", function (req, res, next) {
    var receiver = JSON.parse(req.query.data);
    console.log(receiver.keys);
    var index;

    var actualReceiver = receivers.find(function (currentReceiver) {
        return currentReceiver.keys.p256dh === receiver.keys.p256dh;
    });

    index = receivers.indexOf(actualReceiver);

    if (index !== -1)
    {
        receivers.splice(index, 1);
        console.log("notification subscriber removed");
    }
    else
    {
        console.log("receiver does not exist");
    }

});

server.listen(process.env.PORT || 3000);
app.use(express.static(__dirname + "/public"));

app.get("/notification/send", function (req, res, next) { //could be done way safer, but for ease of use I did it like this for now
    var message  = req.query.message;
    sendNotification(message);

    res.send("<h1>" + message + " was sent to everyone</h1>");
});
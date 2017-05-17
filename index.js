const express = require("express");
const app = express();
const server = require("http").Server(app);

server.listen(5000);
app.use(express.static(__dirname + "/public"));
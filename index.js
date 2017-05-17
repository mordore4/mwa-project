const express = require("express");
const app = express();
const server = require("http").Server(app);

server.listen(80);
app.use(express.static(__dirname + "/public"));
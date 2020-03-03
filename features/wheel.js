const express = require("express");
var exApp = require("express")();
var http = require("http").Server(exApp);
var io = require("socket.io")(http);
var port = process.env.PORT || 3000;
const path = require("path");
let filePath = path.join(__dirname, "../");
http.listen(port, function() {
  console.log("listening on *:" + port);
});
exApp.use("/static", express.static("static"));

exApp.get("/wheel", function(req, res) {
  res.sendFile(filePath + "/wheel.html");
});
let wheelSettings = {
  isOpened: false,
  segments: []
};
let debugSegments = {
  segments: [
    { fillStyle: "#fff200", text: "600" },
    { fillStyle: "#f6989d", text: "700" },
    { fillStyle: "#ee1c24", text: "350" },
    { fillStyle: "#3cb878", text: "500" },
    { fillStyle: "#f26522", text: "800" },
    { fillStyle: "#a186be", text: "300" },
    { fillStyle: "#fff200", text: "400" },
    { fillStyle: "#00aef0", text: "650" }
  ]
};
module.exports = {
  wheelSettings,
  openEvent() {
    if (!module.exports.wheelSettings.isOpened) {
      module.exports.wheelSettings.isOpened = true;
      module.exports.wheelSettings.segments = [];
    }
  },
  closeEvent() {
    if (module.exports.wheelSettings.isOpened) {
      module.exports.wheelSettings.isOpened = false;
      module.exports.fireEvent();
    }
  },
  fireEvent() {
    io.emit("spinWheel", segments);
  },
  joinEvent(username) {
    if (
      module.exports.wheelSettings.isOpened &&
      !module.exports.wheelSettings.segments.some(item => item.a === username)
    ) {
      let color = "#" + Math.floor(Math.random() * 16777215).toString(16);
      module.exports.wheelSettings.segments.push({
        fillStyle: color,
        text: username
      });
      console.log(module.exports.wheelSettings.segments);
    }
  },
  displayWinner(winner) {
    console.log(winner);
  },
  debugWheel() {
    io.emit("spinWheel", debugSegments);
  }
};

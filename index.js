const electron = require("electron");
const { app, BrowserWindow } = electron;
const fs = require("fs");
const path = require("path");
let soundPath = path.join(__dirname, "/sounds");
fs.readdir(soundPath, function (err, items) {
  if (err != null) {
    fs.mkdir(soundPath, function () {
      console.log("added sounds folder");
    });
  }
});
let win = null;

app.on("ready", () => {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
    },
  });
  win.loadFile("index.html");
});

app.on("window-all-closed", app.quit);

app.on("before-quit", () => {
  mainWindow.removeAllListeners("close");
  mainWindow.close();
});

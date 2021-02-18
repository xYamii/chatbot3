const electron = require("electron");
const { app, BrowserWindow } = electron;
const fs = require("fs");
const path = require("path");
const { createBin, binID } = require("./features/displaySounds.js");
const soundsFile = require("./data/sounds.json");
const soundPath = path.join(__dirname, "/sounds");
const dataPath = path.join(__dirname, "/data/sounds.json");
fs.readdir(soundPath, function (err, items) {
  if (err != null) {
    fs.mkdir(soundPath, function () {
      console.log("Couldn't find sound folder, created one!");
    });
  }
});
function loadSounds() {
  fs.readdir(soundPath, function (err, items) {
    console.log(items);
    if (items !== undefined) {
      let soundArray = [];
      for (var i = 0; i < items.length; i++) {
        let z = items[i].slice(0, -4);
        soundArray.push(z.toLowerCase());
      }
      soundsFile.sounds = soundArray;
      const data = soundArray.map((sound, index) => {
        return { id: index, sound: sound };
      });

      if (binID == "") {
        createBin(data);
      }
      let json = JSON.stringify(soundsFile, null, 2);
      fs.writeFile(dataPath, json, added);
      function added(err) {
        if (err) console.log(err);
        console.log("updated succesfuly");
      }
    }
  });
}
loadSounds();

let win = null;

app.on("ready", () => {
  win = new BrowserWindow({
    width: 950,
    height: 650,
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

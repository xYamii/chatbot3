const electron = require("electron");
const { app, BrowserWindow, ipcMain } = electron;
const chokidar = require("chokidar");
const path = require("path");
const soundPath = path.join(__dirname, "/sounds");
const {
  loadSoundsFromDirectory,
  createSoundDirectory,
  getSounds,
  addSound,
  removeSound,
} = require("./utils.js/soundsUtils");
const {
  getIgnoredUsers,
  ignoreUser,
  unignoreUser,
} = require("./utils.js/ttsUtils");

createSoundDirectory();
loadSoundsFromDirectory();

let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: true,
      enableRemoteModule: false,
    },
  });

  mainWindow.loadFile("index.html");
}

app.whenReady().then(() => {
  ipcMain.handle("getSounds", () => getSounds());
  ipcMain.handle("getIgnoredUsers", () => getIgnoredUsers());
  ipcMain.handle("ignoreUser", (event, userName) => ignoreUser(userName));
  ipcMain.handle("unignoreUser", (event, userName) => unignoreUser(userName));
  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

const watcher = chokidar.watch(soundPath, {
  ignored: /(^|[\/\\])\../,
  persistent: true,
});
watcher
  .on("add", (path) => {
    let fileIndex = path.split("\\").indexOf("sounds");
    let soundName = path.split("\\")[fileIndex + 1].split(".")[0];
    addSound(soundName);
    mainWindow.webContents.send("fromMain", "renderSounds");
  })
  .on("unlink", (path) => {
    let fileIndex = path.split("\\").indexOf("sounds");
    let soundName = path.split("\\")[fileIndex + 1].split(".")[0];
    removeSound(soundName);
    mainWindow.webContents.send("fromMain", "renderSounds");
  });

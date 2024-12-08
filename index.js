const electron = require("electron");
const { app, BrowserWindow, ipcMain } = electron;
const chokidar = require("chokidar");
const path = require("path");
const soundPath = path.join(__dirname, "/sounds");
const { GlobalKeyboardListener } = require("node-global-key-listener");
const v = new GlobalKeyboardListener();

const {
  loadSoundsFromDirectory,
  createSoundDirectory,
  getSounds,
  addSound,
  removeSound,
  getSoundKeyBindings,
  playSound,
} = require("./utils.js/soundsUtils");
const {
  getIgnoredUsers,
  ignoreUser,
  unignoreUser,
} = require("./utils.js/ttsUtils");

createSoundDirectory();
loadSoundsFromDirectory();

let mainWindow = null;
const cooldowns = {};
const COOLDOWN_TIME = 2000;

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
  ipcMain.handle("unignoreUser", (event, userName) => {
    unignoreUser(userName);
    mainWindow.webContents.send("fromMain", "renderIgnored");
  });
  createWindow();
  v.addListener(function (e, down) {
    let key = e.vKey;
    const currentTime = Date.now();
    if (cooldowns[key] && currentTime - cooldowns[key] < COOLDOWN_TIME) {
      return;
    }
    cooldowns[key] = currentTime;
    let keyBindings = getSoundKeyBindings();
    keyBindings.forEach((keyBinding) => {
      if (keyBinding.key === key) {
        mainWindow.webContents.send("fromMain", "playSound", keyBinding.sound);
      }
    });
  });
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

const electron = require("electron");
const { app, BrowserWindow } = electron;

let win = null;

app.on("ready", () => {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    }
  });
  win.loadFile("index.html");
});

app.on("window-all-closed", app.quit);

app.on("before-quit", () => {
  mainWindow.removeAllListeners("close");
  mainWindow.close();
});

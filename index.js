const electron = require("electron");
const { app, BrowserWindow } = electron;

let win = null;

app.on("ready", () => {
<<<<<<< HEAD
  let win = new BrowserWindow({
    width: 1024,
    height: 576,
=======
  win = new BrowserWindow({
    width: 800,
    height: 600,
>>>>>>> rewrite
    webPreferences: {
      nodeIntegration: true
    }
  });
<<<<<<< HEAD
  win.loadURL(`file://${__dirname}/index.html`);
=======
  win.loadFile("index.html");
>>>>>>> rewrite
});

app.on("window-all-closed", app.quit);

app.on("before-quit", () => {
  mainWindow.removeAllListeners("close");
  mainWindow.close();
});

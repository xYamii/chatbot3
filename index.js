const electron = require("electron");
const { app, BrowserWindow } = electron;

app.on("ready", () => {
  let win = new BrowserWindow({
    width: 1024,
    height: 576,
    webPreferences: {
      nodeIntegration: true
    }
  });
  win.loadURL(`file://${__dirname}/index.html`);
});
app.on("window-all-closed", app.quit);
app.on("before-quit", () => {
  mainWindow.removeAllListeners("close");
  mainWindow.close();
});
exports.openWindow = filename => {
  let win = new BrowserWindow({
    width: 800,
    height: 600
  });
  win.loadURL(`file://${__dirname}/${filename}.html`);
};

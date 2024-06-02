const { contextBridge, ipcRenderer } = require("electron");

window.onload = () => {
  window.$ = require("jquery");
  window.Popper = require("popper.js").default;
  require("bootstrap");
  require("./chatbot.js");
  require("./features/log.js");
  require("./features/tts.js");
  require("./features/domEvents.js");
  const btns = $(".nav-link");
  Array.from(btns).forEach((item) => {
    $(item).on("click", (e) => {
      let sectionName = e.target.name;
      $(".atv").removeClass("atv");
      $(`#${sectionName}-section`).addClass("atv");
    });
  });
};

contextBridge.exposeInMainWorld("api", {
  node: () => process.versions.node,
  chrome: () => process.versions.chrome,
  electron: () => process.versions.electron,
  getSounds: () => ipcRenderer.invoke("getSounds"),
  getIgnoredUsers: () => ipcRenderer.invoke("getIgnoredUsers"),
  ignoreUser: (userName) => ipcRenderer.invoke("ignoreUser", userName),
  unignoreUser: (userName) => ipcRenderer.invoke("unignoreUser", userName),
  onReceiveMessage: (callback) => ipcRenderer.on("fromMain", callback),
});

const tmi = require("tmi.js");
const chokidar = require("chokidar");
const path = require("path");
require("dotenv").config({
  path: path.join(__dirname, ".env"),
});
const { getBID } = require("./features/displaySounds.js");
const {
  sounds,
  playSound,
  canFireSfx,
  addSound,
  removeSound,
} = require("./features/sfx.js");
const { isIgnored, ignore, unignore } = require("./features/ignore.js");
const tts = require("./features/tts.js");
const { consolelog } = require("./features/log.js");
const botOptions = {
  options: { debug: true, messagesLogLevel: "info" },
  connection: {
    cluster: "aws",
    reconnect: true,
  },
  identity: {
    username: process.env.BOT_NAME,
    password: `oauth:${process.env.BOT_AUTH}`,
  },
  channels: [process.env.CHANNEL],
};
const bot = new tmi.Client(botOptions);

const chatbot = (function () {
  let $botStatus = $("#bot-status");
  let $statusON = $("#status-on");
  let $statusOFF = $("#status-off");
  $statusON.click(_startBot);
  $statusOFF.click(_stopBot);
  $statusOFF.prop("disabled", true);

  function _startBot() {
    bot.connect();
    $botStatus.html("online");
    $statusON.prop("disabled", true);
    setTimeout(() => {
      $statusOFF.prop("disabled", false);
    }, 2000);
  }
  function _stopBot() {
    bot.disconnect();
    $botStatus.html("offline");
    $statusOFF.prop("disabled", true);
    setTimeout(() => {
      $statusON.prop("disabled", false);
    }, 2000);
  }
})();

bot.on("connected", function (address, port) {
  consolelog("info", "Connected to chat.");
});
bot.on("disconnected", (reason) => {
  consolelog("info", `Disconnected from chat. Reason: ${reason}`);
});

bot.on("chat", (channel, userstate, message, self) => {
  if (self) return;
  let messageArray = message.split(" ");
  const cmd = messageArray.shift().toLowerCase();
  if (cmd == "!sirifoundbug") {
    bot.say(
      process.env.CHANNEL,
      "report bug here: https://forms.gle/HjriLpS1Quiqoz8Y7"
    );
    return;
  }
  if (cmd == "!sounds") {
    let binID = getBID();
    bot.say(
      process.env.CHANNEL,
      `you can find sounds here (temp location)\n https://jsonbin.io/${binID}`
    );
    return;
  }
  if (cmd[0] == "!") {
    if (sounds.includes(cmd.substr(1))) {
      if (
        !isIgnored(userstate["username"].toLowerCase()) &&
        canFireSfx(userstate)
      ) {
        playSound(cmd.substr(1));
      }
    }
    if (tts.langs[cmd.substr(1)] !== undefined) {
      if (
        !isIgnored(userstate["username"].toLowerCase()) &&
        tts.canFireTTS(userstate)
      ) {
        let ttsMsg = messageArray.toString().split(",").join(" ");
        if (tts.filterTTS(ttsMsg)) {
          if (tts.ttsQueue.length < 1) {
            if (!tts.ttsPlaying) {
              tts.speak(tts.langs[cmd.substr(1)], ttsMsg);
              tts.ttsPlaying == true;
            } else {
              tts.addToQueue(tts.langs[cmd.substr(1)], ttsMsg);
            }
          } else {
            tts.addToQueue(tts.langs[cmd.substr(1)], ttsMsg);
          }
        } else return;
      } else return;
    }
  }
  if (cmd == "!ignore") {
    let ignoredUser = messageArray[0].toLowerCase();
    if (userstate["mod"] || userstate["username"] == process.env.CHANNEL)
      ignore(ignoredUser);
  }
  if (cmd == "!unignore") {
    let ignoredUser = messageArray[0].toLowerCase();
    if (userstate["mod"] || userstate["username"] == process.env.CHANNEL)
      unignore(ignoredUser);
  }
  if (cmd == "!skiptts") {
    if (userstate["mod"] || userstate["username"] == process.env.CHANNEL)
      tts.moveQueue();
  }
});

const watcher = chokidar.watch(path.join(__dirname, "/sounds"), {
  ignored: /(^|[\/\\])\../, // ignore dotfiles
  persistent: true,
});
watcher
  .on("add", (path) => {
    let fileIndex = path.split("\\").indexOf("sounds");
    if (!sounds.includes(path.split("\\")[fileIndex + 1].split(".")[0])) {
      addSound(path.split("\\")[fileIndex + 1].split(".")[0]);
    }
  })
  .on("unlink", (path) => {
    let fileIndex = path.split("\\").indexOf("sounds");
    removeSound(path.split("\\")[fileIndex + 1].split(".")[0]);
  });

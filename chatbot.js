const tmi = require("tmi.js");
const path = require("path");
require("dotenv").config({
  path: path.join(__dirname, ".env"),
});
const { playSound, canFireSfx } = require("./features/sfx.js");
const { isPermitted, permit, unpermit } = require("./features/permit.js");
const tts = require("./features/tts.js");
const { consolelog } = require("./features/log.js");
const wheel = require("./features/wheel.js");
const {
  isIgnored,
  ignoreUser,
  unignoreUser,
} = require("./utils.js/ttsUtils.js");
const { soundExist } = require("./utils.js/soundsUtils.js");
require("./features/domEvents.js");
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
  let $botStatus = window.$("#bot-status");
  let $statusON = window.$("#status-on");
  let $statusOFF = window.$("#status-off");
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
  let ignoredUser;
  if (self) return;
  let messageArray = message.split(" ");
  const cmd = messageArray.shift().toLowerCase();
  // Ban suspicious usernames
  if (!isPermitted(userstate["username"].toLowerCase())) {
    var usersname = userstate["username"].toLowerCase();
    var usernameSet = new Set(usersname);
    usernameSet = new Map(
      [...usernameSet].map((x) => [
        x,
        Array.from(usersname).filter((y) => y === x).length,
      ])
    );
    for (let char of Array.from(
      new Map([...usernameSet].sort((a, b) => b[1] - a[1])).keys()
    )) {
      if (
        usersname.replace(new RegExp("[^" + char + "]", "g"), "").length /
          usersname.length >
        0.6
      ) {
        bot.ban(
          process.env.CHANNEL,
          userstate["username"],
          "Get a better username"
        );
        break;
      }
    }
  }
  // Sounds
  if (cmd[0] == "!") {
    if (soundExist(cmd.substr(1))) {
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
              tts.speak(tts.langs[cmd.substr(1)], tts.removeURLFromMessage(ttsMsg));
              tts.ttsPlaying == true;
            } else {
              tts.addToQueue(tts.langs[cmd.substr(1)], tts.removeURLFromMessage(ttsMsg));
            }
          } else {
            tts.addToQueue(tts.langs[cmd.substr(1)], tts.removeURLFromMessage(ttsMsg));
          }
        } else return;
      } else return;
    }
  }

  // Commands
  switch (cmd) {
    case "!sirifoundbug":
      bot.say(
        process.env.CHANNEL,
        "report bug here: https://forms.gle/HjriLpS1Quiqoz8Y7"
      );
      return;
    case "!sounds":
      let binID = getBID();
      bot.say(
        process.env.CHANNEL,
        `you can find sounds here (temp location)\n https://jsonbin.io/${binID}`
      );
      return;
    case "!permit":
      permittedUser = messageArray[0].toLowerCase();
      if (userstate["mod"] || userstate["username"] == process.env.CHANNEL)
        permit(permittedUser);
      break;
    case "!unpermit":
      permittedUser = messageArray[0].toLowerCase();
      if (userstate["mod"] || userstate["username"] == process.env.CHANNEL)
        unpermit(permittedUser);
      break;
    case "!ignore":
      ignoredUser = messageArray[0].toLowerCase();
      if (userstate["mod"] || userstate["username"] == process.env.CHANNEL)
        ignoreUser(ignoredUser);
      break;
    case "!unignore":
      ignoredUser = messageArray[0].toLowerCase();
      if (userstate["mod"] || userstate["username"] == process.env.CHANNEL)
        unignoreUser(ignoredUser);
      break;
    case "!skiptts":
      if (userstate["mod"] || userstate["username"] == process.env.CHANNEL)
        tts.moveQueue();
      break;
    case "!join":
      wheel.joinEvent(userstate["username"]);
      break;
    case "!debug":
      wheel.debugWheel();
      break;
    case "!open":
      if (userstate["mod"] || userstate["username"] == process.env.CHANNEL)
        wheel.openEvent();
      break;
    case "!close":
      if (userstate["mod"] || userstate["username"] == process.env.CHANNEL)
        wheel.closeEvent();
      break;
    default:
      if (wheel.wheelSettings.isOpened) wheel.joinEvent(userstate["username"]);
  }
});

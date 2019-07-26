const tmi = require("tmi.js");
const config = require("./config.json");
const commandsFile = require("./commands.json");
const functions = require("./chatbotModules.js");
const remote = require("electron").remote;
const main = remote.require("./index.js");
const electron = require("electron");
const fs = require("fs");
const googleTTS = require("google-tts-api");
const $ = require("jquery");
const path = require("path");
const options = {
  options: {
    debug: true
  },
  connection: {
    cluster: "aws",
    reconnect: true
  },
  identity: {
    username: config.username,
    password: config.auth
  },
  channels: [config.channelName]
};
const client = new tmi.client(options);

const settings = {
  audioVolume: config.audioVolume,
  status: true,
  ignoredtts: commandsFile.ignoredPpl,
  commands: commandsFile.botCommands
};
let soundPath = path.join(__dirname, "../");
function loadSounds() {
  fs.readdir(soundPath + "/sounds", function(err, items) {
    if (items !== undefined) {
      let soundArray = [];
      for (var i = 0; i < items.length; i++) {
        let z = items[i].slice(0, -4);
        soundArray.push("!" + z);
      }
      settings.sounds = soundArray;
      let sndBox = document.getElementById("soundtable");
      sndBox.innerHTML = "";
      for (let key in soundArray) {
        sndBox.innerHTML += ` <tr><td>${parseInt(key) + 1}</td><td>${
          soundArray[key]
        }</td></tr>`;
      }
    } else {
      document.getElementById("soundtable").innerHTML =
        "there are no sounds added to bot xd";
    }
  });
}
let ttsLangs = commandsFile.ttsLangs;
let ttsQueue = [];
let ttsPlaying = false;
function addToQueue(lang, msg) {
  ttsQueue.push([lang, msg]);
}

function sayTTS(lang, msg) {
  googleTTS(msg, lang, 1)
    .then(function(url) {
      console.log(url);
      $("#audio1")
        .attr("src", url)
        .get(0)
        .play();
    })
    .catch(function(err) {
      console.log(err);
    });
}
$("#audio1").on("ended", function() {
  ttsPlaying = false;
  if (ttsQueue.length < 1) {
    return;
  } else {
    ttsPlaying = true;
    let elTTS = ttsQueue.shift();
    let lang = elTTS[0];
    let msg = elTTS[1];
    sayTTS(lang, msg);
  }
});

let botStatus = document.getElementById("bot-status");

function init() {
  let s = document.getElementsByClassName("alert-disabled");
  document.getElementById("soundVolume").value = config.audioVolume;
  document.getElementById("botUsername").value = config.username;
  document.getElementById("channelName").value = config.channelName;
  document.getElementById("botOauth").value = config.auth;
  document.getElementById("newMsg").value = config.welcomeMsg;
  $("#status-off").addClass("disabled");
  let btns = document.getElementsByClassName("btn-link");
  Array.from(btns).forEach(item => {
    item.addEventListener("click", e => {
      let sectionName = e.target.name;
      sectionName = sectionName.substr(4);
      document.getElementsByClassName("active")[0].classList.remove("active");
      document.getElementById(`${sectionName}-section`).classList.add("active");
    });
  });
}
loadSounds();
init();

document.getElementById("updateVolume").addEventListener("click", async () => {
  let soundVolume = document.getElementById("soundVolume").value;
  settings.audioVolume = soundVolume;
  functions.changeVolumes(soundVolume);
});
document.getElementById("reloadSounds").addEventListener("click", loadSounds);

document.getElementById("status-on").addEventListener("click", () => {
  client.connect();
  settings.status = true;
  botStatus.innerHTML = "online";
  $("#status-on").addClass("disabled");
  $("#status-off").removeClass("disabled");
});
document.getElementById("status-off").addEventListener("click", () => {
  client.disconnect();
  settings.status = false;
  botStatus.innerHTML = "offline";
  $("#status-off").addClass("disabled");
  $("#status-on").removeClass("disabled");
});

client.on("connected", function(address, port) {
  if (config.welcomeMsg == "") {
    return;
  } else {
    client.say(config.channelName, `${config.welcomeMsg}`);
  }
});

client.on("chat", async (channel, userstate, message, self) => {
  let mess = message.toLowerCase();
  let messageArray = mess.split(" ");
  let cmd = messageArray[0];
  let lang;
  if (cmd[0] == "!") {
    lang = cmd.substr(1);
  }
  let args = messageArray.slice(1);
  if (self) return;
  if (settings.sounds.includes(cmd)) {
    soundname = cmd.substr(1);
    functions.playSound(soundname, settings.audioVolume);
  }
  if (cmd == "!langs") {
    let languages = Object.keys(ttsLangs);
    let langlist = "";
    for (var i = 0; i < languages.length; i++) {
      langlist = langlist + " " + languages[i];
    }
    client.say(config.channelName, langlist);
  }
  if (cmd == "!d") {
    console.log(soundPath);
  }
  if (cmd == "!ignore") {
    if (userstate["mod"] || userstate["username"] == config.channelName) {
      if (args == config.channelName || settings.ignoredtts.includes(args[0])) {
        console.log("already in array / its stremer");
      } else {
        settings.ignoredtts.push(args[0]);
        functions.ignoreN(args[0]);
      }
    }
  }
  if (cmd == "!unignore") {
    if (userstate["mod"] || userstate["username"] == config.channelName) {
      if (settings.ignoredtts.includes(args[0])) {
        let index = settings.ignoredtts.indexOf(args[0]);
        settings.ignoredtts.splice(index, 1);
        functions.unignore(args[0]);
      }
    }
  }
  if (cmd == "!sounds") {
    let soundList = " ";
    for (var i = 0; i < settings.sounds.length; i++) {
      soundList = soundList + " " + settings.sounds[i];
    }
    client.say(config.channelName, soundList);
  }
  if (settings.commands[cmd] !== undefined) {
    client.say(config.channelName, settings.commands[cmd]);
  }
  if (cmd == "!addlang") {
    if (userstate["mod"] || userstate["username"] == config.channelName) {
      if (ttsLangs[args[0]] == undefined) {
        ttsLangs[args[0]] = args[1];
        functions.addLang(args[0], args[1]);
      }
    }
  }
  if (ttsLangs[lang] !== undefined) {
    if (settings.ignoredtts.includes(userstate["username"])) {
      return;
    } else {
      let msg = args.toString();
      msg = msg.split(",").join(" ");
      if (msg.length < 200) {
        if (msg.length < 1) {
          return;
        } else {
          if (ttsQueue.length < 1) {
            if (ttsPlaying == false) {
              sayTTS(ttsLangs[lang], msg);
              ttsPlaying = true;
            } else {
              console.log("dodaje bo gra");
              addToQueue(ttsLangs[lang], msg);
            }
          } else {
            let msg = args.toString();
            msg = msg.split(",").join(" ");
            addToQueue(ttsLangs[lang], msg);
          }
        }
      } else {
        if (userstate["username"] == config.channelName) {
          console.log("its stremer");
        } else {
          settings.ignoredtts.push(userstate["username"]);
          functions.ignoreN(userstate["username"]);
        }
        console.log("msg too long, not adding");
      }
    }
  }
});

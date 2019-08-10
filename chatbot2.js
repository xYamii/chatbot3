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
    username: config.credentials.botUsername,
    password: config.credentials.botOauth
  },
  channels: [config.credentials.channelName]
};
const client = new tmi.client(options);

let settings = {
  audioVolume: config.volumes.audioVolume,
  ttsVolume: config.volumes.ttsVolume,
  status: true,
  ignoredtts: commandsFile.ignoredPpl,
  commands: commandsFile.botCommands
};

let ttsLangs = commandsFile.ttsLangs;
let ttsPlaying = false;

const chatbot = (function() {
  //variables
  let soundPath = path.join(__dirname, "../");
  //cache dom
  let $soundTable = $("#soundtable");
  let $botStatus = $("#bot-status");
  let $soundVolume = $("#soundVolume");
  let $ttsVolume = $("#ttsVolume");
  let credentials = {
    botUsername: config.credentials.botUsername,
    channelName: config.credentials.channelName,
    botOauth: config.credentials.botOauth,
    newMsg: config.credentials.newMsg
  };
  let $statusON = $("#status-on");
  let $statusOFF = $("#status-off");
  let $reloadSnd = $("#reloadSounds");
  let $updateBtn = $("#updateAll");
  let $updateVolume = $("#updateVolume");
  //bind events
  let btns = document.getElementsByClassName("btn-link");
  Array.from(btns).forEach(item => {
    item.addEventListener("click", e => {
      let sectionName = e.target.name;
      sectionName = sectionName.substr(4);
      document.getElementsByClassName("active")[0].classList.remove("active");
      document.getElementById(`${sectionName}-section`).classList.add("active");
    });
  });
  $reloadSnd.click(_loadSounds);
  $updateBtn.click(_updateData);
  $updateVolume.click(updateVolume);
  $statusON.click(_startBot);
  $statusOFF.click(_stopBot);
  //functions
  function _init() {
    for (let key in credentials) {
      $(`#${key}`).val(credentials[key]);
    }
    $ttsVolume.val(settings.ttsVolume);
    $soundVolume.val(settings.audioVolume);
  }
  function _startBot() {
    client.connect();
    $botStatus.html("online");
    $statusON.addClass("disabled");
    $statusOFF.removeClass("disabled");
  }
  function _stopBot() {
    client.disconnect();
    $botStatus.html("offline");
    $statusOFF.addClass("disabled");
    $statusON.removeClass("disabled");
  }
  function _loadSounds() {
    fs.readdir(soundPath + "/sounds", function(err, items) {
      if (items !== undefined) {
        let soundArray = [];
        for (var i = 0; i < items.length; i++) {
          let z = items[i].slice(0, -4);
          soundArray.push("!" + z);
        }
        settings.sounds = soundArray;
        $soundTable.html(" ");
        let soundsData = " ";
        for (let key in soundArray) {
          soundsData += ` <tr><td>${parseInt(key) + 1}</td><td>${
            soundArray[key]
          }</td></tr>`;
        }
        $soundTable.html(soundsData);
      } else {
        $soundTable.html("there are no sounds added to bot xd");
      }
    });
  }
  function _updateData() {
    let newData = {
      botUsername: $("#botUsername").val(),
      channelName: $("#channelName").val(),
      botOauth: $("#botOauth").val(),
      newMsg: $("#newMsg").val()
    };
    options.identity.username = newData.botUsername;
    options.identity.password = newData.botOauth;
    options.channels = newData.channelName;
    fs.readFile(__dirname + "/config.json", function(err, data) {
      if (err) {
        console.log(err);
      }
      let obj = JSON.parse(data);
      for (let prop in obj.credentials) {
        obj["credentials"][prop] = newData[prop];
      }

      let json = JSON.stringify(obj, null, 2);
      fs.writeFile(__dirname + "/config.json", json, added);
      function added(err) {
        console.log("added succesfuly");
      }
    });
  }
  function updateVolume() {
    settings.audioVolume = $soundVolume;
    settings.ttsVolume = $ttsVolume;
    fs.readFile(__dirname + "/config.json", (err, data) => {
      if (err) console.log(err);
      let obj = JSON.parse(data);
      obj["volumes"]["audioVolume"] = $soundVolume.val();
      obj["volumes"]["ttsVolume"] = $ttsVolume.val();
      let json = JSON.stringify(obj, null, 2);
      fs.writeFile(__dirname + "/config.json", json, added);
      function added(err) {
        if (err) console.log(err);
        console.log("updated succesfuly");
      }
    });
  }
  _init();
  _loadSounds();
})();

let tts = (function() {
  let ttsQueue = [];

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

  $("#audio1").on("ended", movettsQueue);
  function movettsQueue() {
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
  }
  return {
    sayTTS: sayTTS,
    addToQueue: addToQueue,
    movettsQueue: movettsQueue,
    ttsQueue: ttsQueue
  };
})();

client.on("connected", function(address, port) {
  if (config.newMsg == "") {
    return;
  } else {
    client.say(config.credentials.channelName, `${config.credentials.newMsg}`);
  }
});

client.on("chat", (channel, userstate, message, self) => {
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
    client.say(config.credentials.channelName, langlist);
  }
  if (cmd == "!d") {
    console.log(soundPath);
  }
  if (cmd == "!ignore") {
    if (
      userstate["mod"] ||
      userstate["username"] == config.credentials.channelName
    ) {
      if (
        args == config.credentials.channelName ||
        settings.ignoredtts.includes(args[0])
      ) {
        console.log("already in array / its stremer");
      } else {
        settings.ignoredtts.push(args[0]);
        functions.ignoreN(args[0]);
      }
    }
  }
  if (cmd == "!unignore") {
    if (
      userstate["mod"] ||
      userstate["username"] == config.credentials.channelName
    ) {
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
    client.say(config.credentials.channelName, soundList);
  }
  if (settings.commands[cmd] !== undefined) {
    client.say(config.credentials.channelName, settings.commands[cmd]);
  }
  if (cmd == "!addlang") {
    if (
      userstate["mod"] ||
      userstate["username"] == config.credentials.channelName
    ) {
      if (ttsLangs[args[0]] == undefined) {
        ttsLangs[args[0]] = args[1];
        functions.addLang(args[0], args[1]);
      }
    }
  }
  if (cmd == "!skiptts") {
    if (
      userstate["mod"] ||
      userstate["username"] == config.credentials.channelName
    ) {
      tts.movettsQueue();
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
          if (tts.ttsQueue.length < 1) {
            if (ttsPlaying == false) {
              tts.sayTTS(ttsLangs[lang], msg);
              ttsPlaying = true;
            } else {
              console.log("dodaje bo gra");
              tts.addToQueue(ttsLangs[lang], msg);
            }
          } else {
            let msg = args.toString();
            msg = msg.split(",").join(" ");
            tts.addToQueue(ttsLangs[lang], msg);
          }
        }
      } else {
        if (userstate["username"] == config.credentials.channelName) {
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

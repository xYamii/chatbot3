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
  let soundPath = path.join(__dirname, "/");
  let ttsSubOnly = false;
  let ttsIncludeVips = false;
  let sfxSubOnly = false;
  let sfxIncludeVips = false;
  //cache dom
  let $soundTable = $("#soundtable");
  let $botStatus = $("#bot-status");
  let $soundVolume = $("#soundVolume");
  let $ttsVolume = $("#ttsVolume");
  let $ignoredList = $("#ignoredList");
  let credentials = {
    botUsername: config.credentials.botUsername,
    channelName: config.credentials.channelName,
    botOauth: config.credentials.botOauth,
    newMsg: config.credentials.newMsg
  };
  let $console = $("#console");
  let $statusON = $("#status-on");
  let $statusOFF = $("#status-off");
  let $reloadSnd = $("#reloadSounds");
  let $updateBtn = $("#updateAll");
  let $updateSoundVolume = $("#updateSoundVol");
  let $updateTTSVolume = $("#updateTTSVol");
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
  $("#ttsSubOnly").on("change", function() {
    if (this.checked) {
      $("#ttsIncludeVips").prop("disabled", false);
      ttsSubOnly = true;
    } else {
      $("#ttsIncludeVips")
        .prop("disabled", true)
        .prop("checked", false);
      ttsSubOnly = false;
    }
  });
  $("#ttsIncludeVips").on("change", function() {
    if (this.checked) {
      ttsIncludeVips = true;
    } else {
      ttsIncludeVips = false;
    }
  });
  $("#sfxSubOnly").on("change", function() {
    if (this.checked) {
      $("#sfxIncludeVips").prop("disabled", false);
      sfxSubOnly = true;
    } else {
      $("#sfxIncludeVips")
        .prop("disabled", true)
        .prop("checked", false);
      sfxSubOnly = false;
    }
  });
  $("#sfxIncludeVips").on("change", function() {
    if (this.checked) {
      sfxIncludeVips = true;
    } else {
      sfxIncludeVips = false;
    }
  });
  $reloadSnd.click(_loadSounds);
  $updateBtn.click(_updateData);
  $updateSoundVolume.click(updateSoundVolume);
  $updateTTSVolume.click(updateTTSVolume);
  $statusON.click(_startBot);
  $statusOFF.click(_stopBot);
  //functions
  function _init() {
    for (let key in credentials) {
      $(`#${key}`).val(credentials[key]);
    }
    $ttsVolume.val(settings.ttsVolume);
    $soundVolume.val(settings.audioVolume);
    console.log(settings.ignoredtts);
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
        if (items.length < 1) {
          $soundTable.html(
            "karamba, seems like you didnt load any sounds. go load them and smash reload button yes :-)"
          );
        } else {
          let soundArray = [];
          for (var i = 0; i < items.length; i++) {
            let z = items[i].slice(0, -4);
            soundArray.push("!" + z);
          }
          settings.sounds = soundArray;
          $soundTable.html(" ");
          let soundsData = " ";
          for (let key in soundArray) {
            soundsData += `<li> ${parseInt(key) + 1}${soundArray[key]}</li>`;
          }
          $soundTable.html(soundsData);
        }
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
    if (botUsername == "" || channelName == "" || botOauth == "") {
      logToConsole("error", "You need to fill all data");
    } else {
      options.identity.username = newData.botUsername;
      options.identity.password = newData.botOauth;
      options.channels = newData.channelName;
      fs.readFile(__dirname + "/config.json", function(err, data) {
        if (err) {
          logToConsole("error", err);
        }
        let obj = JSON.parse(data);
        for (let prop in obj.credentials) {
          obj["credentials"][prop] = newData[prop];
        }

        let json = JSON.stringify(obj, null, 2);
        fs.writeFile(__dirname + "/config.json", json, added);
        function added(err) {
          if (err) logToConsole("error", err);
          logToConsole("info", "Data updated");
        }
      });
    }
  }
  function updateSoundVolume() {
    settings.audioVolume = $soundVolume.val();
    fs.readFile(__dirname + "/config.json", (err, data) => {
      if (err) console.log(err);
      let obj = JSON.parse(data);
      obj["volumes"]["audioVolume"] = $soundVolume.val();
      let json = JSON.stringify(obj, null, 2);
      fs.writeFile(__dirname + "/config.json", json, added);
      function added(err) {
        if (err) logToConsole("error", err);
        logToConsole("info", "Sound updated");
      }
    });
  }
  function updateTTSVolume() {
    settings.ttsVolume = $ttsVolume.val();
    fs.readFile(__dirname + "/config.json", (err, data) => {
      if (err) console.log(err);
      let obj = JSON.parse(data);
      obj["volumes"]["ttsVolume"] = $ttsVolume.val();
      let json = JSON.stringify(obj, null, 2);
      fs.writeFile(__dirname + "/config.json", json, added);
      function added(err) {
        if (err) logToConsole("error", err);
        logToConsole("info", "Sound updated");
      }
    });
  }

  function displayIgnored() {
    let ignoredData = "";
    for (let key in settings.ignoredtts) {
      ignoredData += `<li>${parseInt(key) + 1} ${
        settings.ignoredtts[key]
      } <i class="del">X</i> </li>`;
    }
    $ignoredList.html(ignoredData);
    bindDelete();
  }
  // function addguy() {
  //   settings.ignoredtts.push("ww");
  //   displayIgnored();
  // }
  // document.getElementById("testw").addEventListener("click", addguy);
  function bindDelete() {
    let ppl = document.getElementsByClassName("del");
    Array.from(ppl).forEach(item => {
      item.addEventListener("click", e => {
        let $remove = $(e.target).closest("li");
        let guyToRemove = $("#ignoredList")
          .find("li")
          .index($remove);
        $remove.remove();
        settings.ignoredtts.splice(guyToRemove, 1);
        console.log(settings.ignoredtts);
      });
    });
  }
  function logToConsole(msgType, logMsg) {
    $console.append(`<p class="${msgType}">${logMsg}<p>`);
  }
  _init();
  _loadSounds();
  displayIgnored();
})();

let tts = (function() {
  let ttsQueue = [];

  function addToQueue(lang, msg) {
    ttsQueue.push([lang, msg]);
  }
  function sayTTS(lang, msg) {
    googleTTS(msg, lang, 1)
      .then(function(url) {
        $("#audio1")
          .attr("src", url)
          .get(0)
          .play();
      })
      .catch(function(err) {
        logToConsole("error", err);
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

function isHeVip(userData) {
  if (userData.badges == null) {
    return false;
  } else {
    if (userData.badges.vip == 1) return true;
  }
}
client.on("chat", (channel, userstate, message, self) => {
  if (self) return;
  let mess = message.toLowerCase();
  let messageArray = mess.split(" ");
  let cmd = messageArray[0];
  let lang;
  if (cmd[0] == "!") {
    lang = cmd.substr(1);
  }
  // console.log(userstate.badges.hasOwnProperty("vip"));
  //sounds fire
  let args = messageArray.slice(1);
  soundname = cmd.substr(1);
  if (cmd == "!d") {
    console.log(isHeVip(userstate));
  }
  if (cmd == "!langs") {
    let languages = Object.keys(ttsLangs);
    let langlist = "";
    for (var i = 0; i < languages.length; i++) {
      langlist = langlist + " " + languages[i];
    }
    client.say(config.credentials.channelName, langlist);
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
  //tts
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
        } else {
          settings.ignoredtts.push(userstate["username"]);
          functions.ignoreN(userstate["username"]);
        }
      }
    }
  }
});
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
  commands: commandsFile.botCommands,
  bannedPhrases: commandsFile.bannedPhrases,
  nigas: ["qdth", "moobot", "nightbot", "eddwardg"]
};

let ttsLangs = commandsFile.ttsLangs;
let ttsPlaying = false;
let ttsSubOnly = false;
let ttsIncludeVips = false;
let sfxSubOnly = false;
let sfxIncludeVips = false;

const chatbot = (function() {
  //variables
  let soundPath = path.join(__dirname, "./");
  //cache dom
  let $soundTable = $("#soundtable");
  let $botStatus = $("#bot-status");
  let $soundVolume = $("#soundVolume");
  let $ttsVolume = $("#ttsVolume");
  let $ignoredList = $("#ignoredList");
  let $phraseList = $("#phraseList");
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
  let $addPhraseBtn = $("#addPhrase");
  let $addGuyBtn = $("#addGuy");
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
  $addPhraseBtn.click(addPhrase);
  $addGuyBtn.click(addGuy);
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
      options.channels[0] = newData.channelName;
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
        logToConsole("info", "Sfx sound updated to: " + $soundVolume.val());
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
        logToConsole("info", "TTS sound updated to: " + $ttsVolume.val());
      }
    });
  }
  function addPhrase(e) {
    let phrase = $(e.target)
      .prev("input")
      .val();
    $(e.target)
      .prev("input")
      .val("");
    if (!settings.bannedPhrases.includes(phrase)) {
      settings.bannedPhrases.push(phrase);
      fs.readFile(__dirname + "/commands.json", (err, data) => {
        if (err) logToConsole("error", err);
        let obj = JSON.parse(data);
        obj["bannedPhrases"].push(phrase);
        let json = JSON.stringify(obj, null, 2);
        fs.writeFile(__dirname + "/commands.json", json, added);
        function added(err) {
          if (err) logToConsole("error", err);
          logToConsole("info", "Added phrase");
        }
      });
      displayPhrases();
    } else return;
  }
  function addGuy(e) {
    let guy = $(e.target)
      .prev("input")
      .val();
    $(e.target)
      .prev("input")
      .val("");
    if (!settings.ignoredtts.includes(guy)) {
      settings.ignoredtts.push(guy);
      fs.readFile(__dirname + "/commands.json", (err, data) => {
        if (err) logToConsole("error", err);
        let obj = JSON.parse(data);
        obj["ignoredPpl"].push(guy);
        let json = JSON.stringify(obj, null, 2);
        fs.writeFile(__dirname + "/commands.json", json, added);
        function added(err) {
          if (err) logToConsole("error", err);
          logToConsole("info", "Guy added: " + guy);
        }
      });
      displayIgnored();
    } else return;
  }

  function displayIgnored() {
    let ignoredData = "";
    for (let key in settings.ignoredtts) {
      ignoredData += `<li> - ${settings.ignoredtts[key]} <i class="del">X</i> </li>`;
    }
    $ignoredList.html(ignoredData);
    bindDeleteGuy();
  }
  function displayPhrases() {
    let phrasesData = "";
    for (let key in settings.bannedPhrases) {
      phrasesData += `<li> - ${settings.bannedPhrases[key]} <i class="del1">X</i> </li>`;
    }
    $phraseList.html(phrasesData);
    bindDeletePhrases();
  }

  function bindDeletePhrases() {
    let ppl = document.getElementsByClassName("del1");
    Array.from(ppl).forEach(item => {
      item.addEventListener("click", e => {
        let $remove = $(e.target).closest("li");
        let phraseToRemove = $("#phraseList")
          .find("li")
          .index($remove);
        $remove.remove();
        settings.bannedPhrases.splice(phraseToRemove, 1);
        remFromFile("bannedPhrases", phraseToRemove);
      });
    });
  }
  function bindDeleteGuy() {
    let ppl = document.getElementsByClassName("del");
    Array.from(ppl).forEach(item => {
      item.addEventListener("click", e => {
        let $remove = $(e.target).closest("li");
        let guyToRemove = $("#ignoredList")
          .find("li")
          .index($remove);
        $remove.remove();
        settings.ignoredtts.splice(guyToRemove, 1);
        remFromFile("ignoredPpl", guyToRemove);
      });
    });
  }
  function remFromFile(listType, index) {
    fs.readFile(__dirname + "/commands.json", (err, data) => {
      if (err) console.log(err);
      let obj = JSON.parse(data);
      let w = obj[listType][index];
      obj[listType].splice(index, 1);
      let json = JSON.stringify(obj, null, 2);
      fs.writeFile(__dirname + "/commands.json", json, added);
      function added(err) {
        if (err) console.log(err);
        logToConsole("info", "removed: " + w);
      }
    });
  }
  function logToConsole(msgType, logMsg) {
    $console.append(`<p class="${msgType}">${logMsg}<p>`);
  }
  _init();
  _loadSounds();
  displayIgnored();
  displayPhrases();
  return {
    displayIgnored: displayIgnored
  };
})();
function canFireTTS(userData) {
  let userBadge = {
    vip: false,
    sub: false
  };
  if (!userData.badges == "") {
    if (userData.badges.vip == 1) {
      userBadge.vip = true;
    } else if (userData.subscriber) {
      userBadge.sub = true;
    }
  }
  if (ttsSubOnly) {
    if (ttsIncludeVips) {
      if (userBadge.vip || userBadge.sub) {
        return true;
      }
    } else {
      if (userBadge.sub) {
        return true;
      } else return false;
    }
  } else {
    return true;
  }
}
function canFireSfx(userData) {
  let userBadge = {
    vip: false,
    sub: false
  };
  if (!userData.badges == "") {
    if (userData.badges.vip == 1) {
      userBadge.vip = true;
    } else if (userData.subscriber) {
      userBadge.sub = true;
    }
  }
  if (sfxSubOnly) {
    if (sfxIncludeVips) {
      if (userBadge.vip || userBadge.sub) {
        return true;
      }
    } else {
      if (userBadge.sub) {
        return true;
      } else return false;
    }
  } else {
    return true;
  }
}
let tts = (function() {
  let ttsQueue = [];
  function filterTTS(msg) {
    if (msg.length < 200 && msg.length > 1) {
      if (settings.bannedPhrases.some(v => msg.match("\\b"+v+"\\b"))) {
        return false;
      } else {
        return true;
      }
    } else {
      return false;
    }
  }
  function addToQueue(lang, msg) {
    ttsQueue.push([lang, msg]);
  }
  function sayTTS(lang, msg) {
    googleTTS(msg, lang, 1)
      .then(function(url) {
        $("#audio1")
          .prop("volume", settings.ttsVolume)
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
      let audio = $("#audio1")[0];
      audio.pause();
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
    ttsQueue: ttsQueue,
    filterTTS: filterTTS
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
  if (self || settings.nigas.includes(userstate["username"])) return;
  if (
    userstate["msg-id"] !== undefined &&
    userstate["msg-id"] == "highlighted-message"
  ) {
    let msg = message.toString();
    msg = msg.split(",").join(" ");
    console.log(msg);
    if (tts.ttsQueue.length < 1) {
      if (ttsPlaying == false) {
        tts.sayTTS("fi-FI", msg);
        ttsPlaying = true;
      } else {
        tts.addToQueue("fi-FI", msg);
      }
    } else {
      tts.addToQueue("fi-FI", msg);
    }
  }
  let messageArray = message.split(" ");
  let cmd = messageArray[0].toLowerCase();
  let lang;
  if (cmd[0] == "!") {
    lang = cmd.substr(1);
  }
  // if(userstate)
  // console.log(userstate.badges.hasOwnProperty("vip"));
  //sounds fire
  let args = messageArray.slice(1);
  // if (settings.sounds.includes(cmd)) {
  //   if (canFireSfx(userstate)) {
  //     soundname = cmd.substr(1);
  //     functions.playSound(soundname, settings.audioVolume);
  //   }
  // }

  //no msg-id when normal msg
  //msg-id: "highlighted-message"
  //msg-id: "skip-subs-mode-message"
  switch(cmd) {
    case "!langs":
      let languages = Object.keys(ttsLangs);
      let langlist = Object.keys(languages).join(", ");
      client.say(config.credentials.channelName, langlist);
      break;
    case "!ignore":
      if (
        userstate["mod"] ||
        userstate["username"] == config.credentials.channelName
      ) {
        if (
          args == config.credentials.channelName ||
          settings.ignoredtts.includes(args[0])
        ) {
          logToConsole("error", "already in array / its stremer");
        } else {
          settings.ignoredtts.push(args[0]);
          functions.ignoreN(args[0]);
          chatbot.displayIgnored();
        }
      }
      break;
    case "!unignore":
      if (
        userstate["mod"] ||
        userstate["username"] == config.credentials.channelName
      ) {
        if (settings.ignoredtts.includes(args[0])) {
          let index = settings.ignoredtts.indexOf(args[0]);
          settings.ignoredtts.splice(index, 1);
          functions.unignore(args[0]);
          chatbot.displayIgnored();
        }
      }
      break;
    case "!sounds":
      let soundList = " ";
      for (var i = 0; i < settings.sounds.length; i++) {
        if (soundList.length > 400) {
          client.say(config.credentials.channelName, soundList);
          soundList = " ";
        } else {
          soundList = soundList + " " + settings.sounds[i];
        }
      }
      client.say(config.credentials.channelName, soundList);
      break;
    case "!addlang":
      if (
        userstate["mod"] ||
        userstate["username"] == config.credentials.channelName
      ) {
        if (ttsLangs[args[0]] == undefined && args.length == 2) {
          ttsLangs[args[0]] = args[1];
          functions.addLang(args[0], args[1]);
        }
      }
      break;
    case "!skiptts":
      if (
        userstate["mod"] ||
        userstate["username"] == config.credentials.channelName
      ) {
        tts.movettsQueue();
      }
      break;
  }
  if (settings.commands[cmd] !== undefined) {
    client.say(config.credentials.channelName, settings.commands[cmd]);
  }
  //tts
  if (ttsLangs[lang] !== undefined) {
    if (canFireTTS(userstate)) {
      if (!settings.ignoredtts.includes(userstate["username"])) {
        let msg = args.toString();
        msg = msg.split(",").join(" ");
        if (tts.filterTTS(msg)) {
          if (tts.ttsQueue.length < 1) {
            if (ttsPlaying == false) {
              tts.sayTTS(ttsLangs[lang], msg);
              ttsPlaying = true;
            } else {
              tts.addToQueue(ttsLangs[lang], msg);
            }
          } else {
            tts.addToQueue(ttsLangs[lang], msg);
          }
        } else return;
      } else return;
    }
  }
});

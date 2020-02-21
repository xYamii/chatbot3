const tmi = require("tmi.js");
const config = require("./data/config.json");
const commandsFile = require("./data/commands.json");
const functions = require("./features/chatbotModules.js");
const remote = require("electron").remote;
const main = remote.require("./index.js");
const electron = require("electron");
const fs = require("fs");
const googleTTS = require("google-tts-api");
const $ = require("jquery");
const path = require("path");
const tts = require("./features/tts.js")
const sfx = require("./features/sfx.js")

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

const chatbot = (function() {
   //variables
   let soundPath = path.join(__dirname, "./");
   //cache dom
   
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
  $("#audio1").on("ended", tts.movettsQueue),
  $updateTTSVolume.click(tts.updateTTSVolume);
  $reloadSnd.click(sfx._loadSounds);
  $updateBtn.click(_updateData);
  $updateSoundVolume.click(sfx.updateSoundVolume);
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
 
  _init();
  sfx._loadSounds();
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
  //   if (sfx.canFireSfx(userstate)) {
  //     soundname = cmd.substr(1);
  //     functions.playSound(soundname, settings.audioVolume);
  //   }
  // }

  //no msg-id when normal msg
  //msg-id: "highlighted-message"
  //msg-id: "skip-subs-mode-message"
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
        logToConsole("error", "already in array / its stremer");
      } else {
        settings.ignoredtts.push(args[0]);
        functions.ignoreN(args[0]);
        chatbot.displayIgnored();
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
        chatbot.displayIgnored();
      }
    }
  }
  if (cmd == "!sounds") {
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
  }
  if (settings.commands[cmd] !== undefined) {
    client.say(config.credentials.channelName, settings.commands[cmd]);
  }
  if (cmd == "!addlang") {
    if (
      userstate["mod"] ||
      userstate["username"] == config.credentials.channelName
    ) {
      if (ttsLangs[args[0]] == undefined ) {
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
    if (tts.canFireTTS(userstate)) {
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


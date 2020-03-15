const fs = require("fs");
const googleTTS = require("google-tts-api");
const $ = require("jquery");
const commandsFile = require("../data/commands.json");
const chatbotLogic = require("./chatbotLogic.js");
let $ttsVolume = $("#ttsVolume");

const path = require("path");
let folderPath = path.join(__dirname, "../");

$ttsVolume.val(chatbotLogic.settings.ttsVolume);
let ttsPlaying = false;
let ttsSettings = {
  ttsSubOnly: false,
  ttsIncludeVips: false,
  ttsIncludeMods: false,
  bannedPhrases: commandsFile.bannedPhrases
};

let ttsQueue = [];
$("#ttsSubOnly").on("change", function() {
  if (this.checked) {
    $("#ttsIncludeVips").prop("disabled", false);
    $("#ttsIncludeMods").prop("disabled", false);
    ttsSettings.ttsSubOnly = true;
  } else {
    $("#ttsIncludeVips")
      .prop("disabled", true)
      .prop("checked", false);
    $("#ttsIncludeMods")
      .prop("disabled", true)
      .prop("checked", false);
    ttsSettings.ttsIncludeMods = false;
    ttsSettings.ttsSubOnly = false;
    ttsSettings.ttsIncludeVips = false;
  }
});
$("#ttsIncludeVips").on("change", function() {
  if (this.checked) {
    ttsSettings.ttsIncludeVips = true;
  } else {
    ttsSettings.ttsIncludeVips = false;
  }
});
$("#ttsIncludeMods").on("change", function() {
  if (this.checked) {
    ttsSettings.ttsIncludeMods = true;
  } else {
    ttsSettings.ttsIncludeMods = false;
  }
});

module.exports = {
  ttsPlaying,
  ttsQueue,
  filterTTS(msg) {
    if (msg.length < 200 && msg.length > 1) {
      if (
        ttsSettings.bannedPhrases.length > 0 &&
        ttsSettings.bannedPhrases.some(v =>
          msg.match(new RegExp("\\b" + v + "\\b", "gmi"))
        )
      ) {
        return false;
      } else {
        return true;
      }
    } else {
      return false;
    }
  },
  addToQueue(lang, msg) {
    ttsQueue.push([lang, msg]);
  },
  sayTTS(lang, msg) {
    module.exports.ttsPlaying = true;
    googleTTS(msg, lang, 1)
      .then(function(url) {
        $("#audio1")
          .prop("volume", ttsSettings.ttsVolume)
          .attr("src", url)
          .get(0)
          .play();
      })
      .catch(function(err) {
        console.log(err);
      });
  },

  movettsQueue() {
    module.exports.ttsPlaying = false;
    if (ttsQueue.length < 1) {
      let audio = $("#audio1")[0];
      audio.pause();
      return;
    } else {
      module.exports.ttsPlaying = true;
      let elTTS = ttsQueue.shift();
      let lang = elTTS[0];
      let msg = elTTS[1];
      module.exports.sayTTS(lang, msg);
    }
  },

  canFireTTS(userData) {
    let userBadge = {
      vip: false,
      sub: false
    };
    if (!userData.badges == "") {
      if (userData.badges.vip == 1) {
        userBadge.vip = true;
      } else if (userData.subscriber || userData.badges.founder == 9) {
        userBadge.sub = true;
      }
    }
    if (ttsSettings.ttsSubOnly) {
      if (ttsSettings.ttsIncludeVips) {
        if (userBadge.vip || userBadge.sub) {
          return true;
        }
      } else if (ttsSettings.ttsIncludeMods) {
        if (userBadge.vip || userBadge.mod) {
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
  },

  updateTTSVolume() {
    chatbotLogic.settings.ttsVolume = $ttsVolume.val();
    fs.readFile(folderPath + "./data/config.json", (err, data) => {
      if (err) console.log(err);
      let obj = JSON.parse(data);
      obj["volumes"]["ttsVolume"] = $ttsVolume.val();
      let json = JSON.stringify(obj, null, 2);
      fs.writeFile(folderPath + "./data/config.json", json, added);
      function added(err) {
        //if (err) //logToConsole("error", err);
        // logToConsole("info", "TTS sound updated to: " + $ttsVolume.val());
      }
    });
  }
};

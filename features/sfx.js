const fs = require("fs");
const $ = require("jquery");
const path = require("path");
const chatbotLogic = require("./chatbotLogic.js");

let $soundVolume = $("#soundVolume");
let $soundTable = $("#soundtable");
let sfxSettings = {
  sfxSubOnly: false,
  sfxIncludeVips: false
};
let soundPath = path.join(__dirname, "../");
module.exports = {
  _loadSounds() {
    fs.readdir(soundPath + "./sounds", function(err, items) {
      if (items !== undefined) {
        let soundArray = [];
        for (var i = 0; i < items.length; i++) {
          let z = items[i].slice(0, -4);
          soundArray.push("!" + z);
        }
        chatbotLogic.settings.sounds = soundArray;
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
  },
  canFireSfx(userData) {
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
    if (sfxSettings.sfxSubOnly) {
      if (sfxSettings.sfxIncludeVips) {
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
  },
  updateSoundVolume() {
    settings.audioVolume = $soundVolume.val();
    fs.readFile(__dirname + "../data/config.json", (err, data) => {
      if (err) console.log(err);
      let obj = JSON.parse(data);
      obj["volumes"]["audioVolume"] = $soundVolume.val();
      let json = JSON.stringify(obj, null, 2);
      fs.writeFile(__dirname + "../data/config.json", json, added);
      function added(err) {
        // if (err) logToConsole("error", err);
        // logToConsole("info", "Sfx sound updated to: " + $soundVolume.val());
      }
    });
  }
};
$("#sfxSubOnly").on("change", function() {
  if (this.checked) {
    $("#sfxIncludeVips").prop("disabled", false);
    sfxSettings.sfxSubOnly = true;
  } else {
    $("#sfxIncludeVips")
      .prop("disabled", true)
      .prop("checked", false);
    sfxSettings.sfxSubOnly = false;
  }
});
$("#sfxIncludeVips").on("change", function() {
  if (this.checked) {
    sfxSettings.sfxIncludeVips = true;
  } else {
    sfxSettings.sfxIncludeVips = false;
  }
});

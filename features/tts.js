const googleTTS = require("google-tts-api");
const { langs, ttsVolume, bannedPhrases } = require("../data/tts.json");
const $ = require("jquery");
const fs = require("fs");
const path = require("path");
const folderPath = path.join(__dirname, "../");

let ttsPlaying = false;
let ttsQueue = [];

const ttsSettings = {
  permissions: {
    subs: false,
    mods: false,
    vips: false,
  },
  status: true, // its off
  ttsVolume,
  bannedPhrases,
};

module.exports = {
  ttsPlaying,
  ttsQueue,
  langs,
  ttsSettings,
  filterTTS(msg) {
    if (msg.length < 200 && msg.length > 1) {
      if (
        ttsSettings.bannedPhrases.length > 0 &&
        ttsSettings.bannedPhrases.some((v) =>
          msg.match(new RegExp("\\b" + v + "\\b", "gmi"))
        )
      )
        return false;
      else return true;
    } else return false;
  },
  speak(lang, message) {
    const url = googleTTS.getAudioUrl(message, {
      lang,
      slow: false,
      host: "https://translate.google.com",
    });
    try {
      $("#audio1")
        .prop("volume", ttsSettings.ttsVolume)
        .attr("src", url)
        .get(0)
        .play();
      module.exports.ttsPlaying = true;
    } catch (err) {
      console.log(err);
      module.exports.moveQueue;
    }
  },
  addToQueue(lang, msg) {
    ttsQueue.push([lang, msg]);
  },
  moveQueue() {
    module.exports.ttsPlaying = false;
    if (ttsQueue.length < 1) {
      let audio = $("#audio1")[0];
      audio.pause();
      return;
    } else {
      ttsPlaying = true;
      let elTTS = ttsQueue.shift();
      let lang = elTTS[0];
      let msg = elTTS[1];
      module.exports.speak(lang, msg);
    }
  },
  canFireTTS(userData) {
    let userBadge = {
      vip: false,
      sub: false,
      mod: false,
      broadcaster: false,
    };
    if (userData.badges !== null) {
      if (userData.badges.vip == 1) {
        userBadge.vip = true;
      }
      if (userData.subscriber || "founder" in userData.badges) {
        userBadge.sub = true;
      }
      if (userData.mod) {
        userBadge.mod = true;
      }
      if ("broadcaster" in userData.badges) {
        userBadge.broadcaster = true;
      }
    }
    if (!ttsSettings.status) {
      return false;
    } else {
      if (
        ttsSettings.permissions.vips ||
        ttsSettings.permissions.mods ||
        ttsSettings.permissions.subs
      ) {
        if (userBadge.broadcaster) {
          return true;
        }
        if (ttsSettings.permissions.subs) {
          if (userBadge.sub) {
            return true;
          }
        }
        if (ttsSettings.permissions.mods) {
          if (userBadge.mod) {
            return true;
          }
        }
        if (ttsSettings.permissions.vips) {
          if (userBadge.vip) {
            return true;
          }
        } else return false;
      } else {
        return true;
      }
    }
  },
  updateTTSVolume(newVolume) {
    fs.readFile(folderPath + "data/tts.json", (err, data) => {
      if (err) console.log(err);
      let obj = JSON.parse(data);
      obj["ttsVolume"] = newVolume;
      module.exports.ttsSettings.ttsVolume = newVolume;
      let json = JSON.stringify(obj, null, 2);
      fs.writeFile(folderPath + "data/tts.json", json, (err) => {
        if (err) console.log(err);
      });
    });
  },
};

$("#ttsSubOnly").on("change", () => {
  ttsSettings.permissions.subs = !ttsSettings.permissions.subs;
  console.log(ttsSettings.permissions);
});
$("#ttsVips").on("change", () => {
  ttsSettings.permissions.vips = !ttsSettings.permissions.vips;
  console.log(ttsSettings.permissions);
});
$("#ttsMods").on("change", () => {
  ttsSettings.permissions.mods = !ttsSettings.permissions.mods;
  console.log(ttsSettings.permissions);
});
$("#ttsBtn").on("click", () => {
  ttsSettings.status = !ttsSettings.status;
  ttsSettings.status ? $("#ttsStatus").html("ON") : $("#ttsStatus").html("OFF");
});

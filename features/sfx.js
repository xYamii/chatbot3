const fs = require("fs");
const path = require("path");
const $ = require("jquery");
const { consolelog } = require("./log");
const soundPath = path.join(__dirname, "../");
const { sounds, sfxVolume } = require(soundPath + "/data/sounds.json");
const sfxSettings = {
  permissions: {
    limited: false,
    subs: false,
    mods: false,
    vips: false,
  },
  status: true, // its off
  sfxVolume,
};
module.exports = {
  sounds,
  sfxSettings,
  playSound: (s) => {
    var audio = new Audio(soundPath + `/sounds/${s}.wav`);
    audio.volume = sfxSettings.sfxVolume;
    audio.play();
    delete audio;
  },
  addSound: (name) => {
    sounds.push(name);
    //updateBin(binID, sounds);
    module.exports.displaySounds();
  },
  removeSound: (name) => {
    sounds.splice(sounds.indexOf(name), 1);
    //updateBin(binID, sounds);
    module.exports.displaySounds();
  },
  canFireSfx(userData) {
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
    if (!sfxSettings.status) {
      return false;
    } else {
      if (
        sfxSettings.permissions.vips ||
        sfxSettings.permissions.mods ||
        sfxSettings.permissions.subs
      ) {
        console.log(userBadge.broadcaster);
        if (userBadge.broadcaster) {
          return true;
        }
        if (sfxSettings.permissions.subs) {
          if (userBadge.sub) {
            return true;
          }
        }
        if (sfxSettings.permissions.mods) {
          if (userBadge.mod) {
            return true;
          }
        }
        if (sfxSettings.permissions.vips) {
          if (userBadge.vip) {
            return true;
          }
        } else return false;
      } else {
        return true;
      }
    }
  },
  updateSFXVolume(newVolume) {
    fs.readFile(soundPath + "data/sounds.json", (err, data) => {
      if (err) console.log(err);
      let obj = JSON.parse(data);
      obj["sfxVolume"] = newVolume;
      module.exports.sfxSettings.sfxVolume = newVolume;
      let json = JSON.stringify(obj, null, 2);
      fs.writeFile(soundPath + "data/sounds.json", json, (err) => {
        if (err) console.log(err);
      });
    });
  },
  displaySounds() {
    let soundsData = `<table><thead><tr><th class="w-60">Index</th><th>Sound name</th></tr></thead><tbody>`;
    for (let key in sounds) {
      soundsData += ` <tr><td class="w-60">${parseInt(key) + 1}</td><td>${
        sounds[key]
      }</td></tr>`;
    }
    soundsData += `</tbody></table>`;
    $("#soundtable").html(soundsData);
  },
};
$("#sfxSubs").on("change", () => {
  sfxSettings.permissions.subs = !sfxSettings.permissions.subs;
  console.log(sfxSettings.permissions);
});
$("#sfxVips").on("change", () => {
  sfxSettings.permissions.vips = !sfxSettings.permissions.vips;
  console.log(sfxSettings.permissions);
});
$("#sfxMods").on("change", () => {
  sfxSettings.permissions.mods = !sfxSettings.permissions.mods;
  console.log(sfxSettings.permissions);
});
$("#sfxBtn").on("click", () => {
  sfxSettings.status = !sfxSettings.status;
  sfxSettings.status ? $("#sfxStatus").html("ON") : $("#sfxStatus").html("OFF");
});

const fs = require("fs");
const googleTTS = require("google-tts-api");
const $ = require("jquery");
const commandsFile = require("../data/commands.json");
let $ttsVolume = $("#ttsVolume");

let ttsSettings = {
    ttsPlaying:false,
    ttsSubOnly:false,
    ttsIncludeVips:false,
    bannedPhrases:commandsFile.bannedPhrases
}
let ttsQueue = [];

console.log(__dirname)
module.exports = {
    ttsQueue,
     filterTTS(msg) {
      if (msg.length < 200 && msg.length > 1) {
        if (ttsSettings.bannedPhrases.some(v => msg.match("\\b"+v+"\\b"))) {
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
    },
    
    canFireTTS(userData) {
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
        if (ttsSettings.ttsSubOnly) {
            if (ttsSettings.ttsIncludeVips) {
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
    
    updateTTSVolume() {
        ttsSettings.ttsVolume = $ttsVolume.val();
        fs.readFile(__dirname + "../data/config.json", (err, data) => {
            if (err) console.log(err);
            let obj = JSON.parse(data);
            obj["volumes"]["ttsVolume"] = $ttsVolume.val();
            let json = JSON.stringify(obj, null, 2);
            fs.writeFile(__dirname + "../data/config.json", json, added);
            function added(err) {
                //if (err) //logToConsole("error", err);
                // logToConsole("info", "TTS sound updated to: " + $ttsVolume.val());
            }
        });
    }
    
};


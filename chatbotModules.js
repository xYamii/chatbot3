const fs = require("fs");
const tmi = require("tmi.js");
const path = require("path");

let soundPath = path.join(__dirname, "/");
module.exports = {
  playSound: (s, audioVolume) => {
    var audio = new Audio(soundPath + `sounds/${s}.wav`);
    audio.volume = audioVolume;
    audio.play();
    delete audio;
  },
  changeVolumes: soundVolume => {
    fs.readFile(__dirname + "/config.json", (err, data) => {
      if (err) console.log(err);
      let obj = JSON.parse(data);
      obj["audioVolume"] = soundVolume;
      let json = JSON.stringify(obj, null, 2);
      fs.writeFile(__dirname + "/config.json", json, added);
      function added(err) {
        if (err) console.log(err);
        console.log("updated succesfuly");
      }
    });
  },
  addLang: (lang, code) => {
    fs.readFile(__dirname + "/commands.json", (err, data) => {
      if (err) console.log(err);
      let obj = JSON.parse(data);
      obj["ttsLangs"][lang] = code;
      let json = JSON.stringify(obj, null, 2);
      fs.writeFile(__dirname + "/commands.json", json, added);
      function added(err) {
        if (err) console.log(err);
        console.log("updated succesfuly");
      }
    });
  },
  ignoreN: guy => {
    fs.readFile(__dirname + "/commands.json", (err, data) => {
      if (err) console.log(err);
      let obj = JSON.parse(data);
      obj["ignoredPpl"].push(guy);
      let json = JSON.stringify(obj, null, 2);
      fs.writeFile(__dirname + "/commands.json", json, added);
      function added(err) {
        if (err) console.log(err);
        console.log("updated succesfuly");
      }
    });
  },
  unignore: guy => {
    fs.readFile(__dirname + "/commands.json", (err, data) => {
      if (err) console.log(err);
      let obj = JSON.parse(data);
      let index = obj["ignoredPpl"].indexOf(guy);
      obj["ignoredPpl"].splice(index, 1);
      let json = JSON.stringify(obj, null, 2);
      fs.writeFile(__dirname + "/commands.json", json, added);
      function added(err) {
        if (err) console.log(err);
        console.log("updated succesfuly");
      }
    });
  }
};

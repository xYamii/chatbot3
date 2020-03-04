const fs = require("fs");
const path = require("path");
<<<<<<< HEAD:chatbotModules.js

let soundPath = path.join(__dirname, "/");

=======
const $ = require("jquery");
let soundPath = path.join(__dirname, "../");
let $console = $("#console");
>>>>>>> rewrite:features/chatbotModules.js
module.exports = {
  playSound: (s, audioVolume) => {
    var audio = new Audio(soundPath + `sounds/${s}.wav`);
    audio.volume = audioVolume;
    audio.play();
    delete audio;
  },
  addLang: (lang, code) => {
    fs.readFile(__dirname + "../data/commands.json", (err, data) => {
      if (err) console.log(err);
      let obj = JSON.parse(data);
      obj["ttsLangs"][lang] = code;
      let json = JSON.stringify(obj, null, 2);
      fs.writeFile(__dirname + "../data/commands.json", json, added);
      function added(err) {
        if (err) console.log(err);
        console.log("updated succesfuly");
      }
    });
  },
  ignoreN: guy => {
    fs.readFile(__dirname + "../data/commands.json", (err, data) => {
      if (err) console.log(err);
      let obj = JSON.parse(data);
      obj["ignoredPpl"].push(guy);
      let json = JSON.stringify(obj, null, 2);
      fs.writeFile(__dirname + "../data/commands.json", json, added);
      function added(err) {
        if (err) console.log(err);
        console.log("updated succesfuly");
      }
    });
  },
  unignore: guy => {
    fs.readFile(__dirname + "../data/commands.json", (err, data) => {
      if (err) console.log(err);
      let obj = JSON.parse(data);
      let index = obj["ignoredPpl"].indexOf(guy);
      obj["ignoredPpl"].splice(index, 1);
      let json = JSON.stringify(obj, null, 2);
      fs.writeFile(__dirname + "../data/commands.json", json, added);
      function added(err) {
        if (err) console.log(err);
        console.log("updated succesfuly");
      }
    });
  },
  logToConsole: (msgType, logMsg) => {
    $console.append(`<p class="${msgType}">${logMsg}<p>`);
  }
};

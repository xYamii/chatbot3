const fs = require("fs");
const path = require("path");
const soundPath = path.join(__dirname, "../sounds");
const soundsFilePath = path.join(__dirname, "../data/sounds.json");
const soundsFile = require("../data/sounds.json");
let sounds = [];

const addSound = (sound) => {
  if (sounds.includes(sound)) return;
  sounds.push(sound);
  updateSoundsInFile();
};
const removeSound = (name) => {
  sounds.splice(sounds.indexOf(name), 1);
  updateSoundsInFile();
};
const updateSoundsInFile = () => {
  soundsFile.sounds = sounds;
  let json = JSON.stringify(soundsFile, null, 2);
  fs.writeFile(soundsFilePath, json, (err) => {
    if (err) console.log(err);
    console.log("updated succesfuly");
  });
};

module.exports = {
  loadSoundsFromDirectory: () => {
    fs.readdir(soundPath, function (err, items) {
      if (items === undefined) {
        return;
      }
      let soundArray = [];
      for (var i = 0; i < items.length; i++) {
        let z = items[i].slice(0, -4);
        soundArray.push(z.toLowerCase());
      }
      sounds = soundArray;
      soundsFile.sounds = soundArray;
      let json = JSON.stringify(soundsFile, null, 2);
      fs.writeFile(soundsFilePath, json, (err) => {
        if (err) console.log(err);
        console.log("updated sounds file succesfuly");
      });
    });
  },
  createSoundDirectory: () => {
    fs.readdir(soundPath, function (err, items) {
      if (err === null) {
        return;
      }
      fs.mkdir(soundPath, () => {
        console.log("Couldn't find sound folder, created one!");
      });
    });
  },
  getSounds: () => {
    return sounds;
  },
  addSound,
  removeSound,
  updateSoundsInFile,
};

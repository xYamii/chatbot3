const fs = require("fs");
const path = require("path");
const soundPath = path.join(__dirname, "../sounds");
const soundsFilePath = path.join(__dirname, "../data/sounds.json");
const soundsFile = require("../data/sounds.json");

let sounds = soundsFile.sounds || [];
let soundKeyBindings = soundsFile.keyBinds || {};

const getSoundKeyBindings = () => soundKeyBindings;

const getSounds = () => sounds;

const setSounds = (newSounds) => {
  sounds = newSounds;
  updateSoundsInFile();
};

const addSound = (sound) => {
  if (sounds.includes(sound)) return;
  sounds.push(sound);
  updateSoundsInFile();
  console.log(sounds);
  console.log(getSounds());
};

const removeSound = (name) => {
  const index = sounds.indexOf(name);
  if (index !== -1) {
    sounds.splice(index, 1);
    updateSoundsInFile();
  }
};

const updateSoundsInFile = () => {
  soundsFile.sounds = sounds;
  let json = JSON.stringify(soundsFile, null, 2);
  fs.writeFile(soundsFilePath, json, (err) => {
    if (err) console.log(err);
    console.log("updated successfully");
  });
};

const soundExist = (sound) => {
  const exists = sounds.includes(sound);
  return exists;
};

const loadSoundsFromDirectory = () => {
  fs.readdir(soundPath, function (err, items) {
    if (items === undefined) {
      return;
    }
    let soundArray = [];
    for (let i = 0; i < items.length; i++) {
      let z = items[i].slice(0, -4);
      soundArray.push(z.toLowerCase());
    }
    setSounds(soundArray);
    soundsFile.sounds = soundArray;
    let json = JSON.stringify(soundsFile, null, 2);
    fs.writeFile(soundsFilePath, json, (err) => {
      if (err) console.log(err);
      console.log("updated sounds file successfully");
    });
  });
};

const createSoundDirectory = () => {
  fs.readdir(soundPath, function (err, items) {
    if (err === null) {
      return;
    }
    fs.mkdir(soundPath, () => {
      console.log("Couldn't find sound folder, created one!");
    });
  });
};
const playSound = (s) => {
  var audio = new Audio(soundPath + `/sounds/${s}.wav`);
  audio.volume = soundsFile.sfxVolume;
  audio.play();
  delete audio;
};
module.exports = {
  getSounds,
  setSounds,
  loadSoundsFromDirectory,
  createSoundDirectory,
  soundExist,
  addSound,
  removeSound,
  updateSoundsInFile,
  getSoundKeyBindings,
  playSound,
};

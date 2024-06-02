const $ = require("jquery");

const { sfxSettings, updateSFXVolume } = require("./sfx.js"),
  { bannedPhrases } = require("../data/tts.json"),
  { ignoredUsers } = require("../data/ignored.json"),
  { moveQueue, ttsSettings, updateTTSVolume } = require("./tts.js");
const $phraseList = $("#phraseList"),
  $syncSounds = $("#syncSounds"),
  $updateSoundVolume = $("#updateSoundVol"),
  $updateTTSVolume = $("#updateTTSVol"),
  $soundVolume = $("#soundVolume"),
  $ttsVolume = $("#ttsVolume");

$updateTTSVolume.on("click", () => {
  updateTTSVolume($ttsVolume.val());
});
$updateSoundVolume.on("click", () => {
  updateSFXVolume($soundVolume.val());
});
$soundVolume.val(parseFloat(sfxSettings.sfxVolume));
$ttsVolume.val(parseFloat(ttsSettings.ttsVolume));

$("#audio1").on("ended", () => {
  moveQueue();
});

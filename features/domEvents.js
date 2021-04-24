const $ = require("jquery");
const { consolelog } = require("./log.js");

const {
    sounds,
    sfxSettings,
    updateSFXVolume,
    displaySounds,
  } = require("./sfx.js"),
  { bannedPhrases } = require("../data/tts.json"),
  { ignoredUsers } = require("../data/ignored.json"),
  { moveQueue, ttsSettings, updateTTSVolume } = require("./tts.js"),
  { getBID, updateBin } = require("./displaySounds.js");
const $ignoredList = $("#ignoredList"),
  $phraseList = $("#phraseList"),
  $syncSounds = $("#syncSounds"),
  $updateSoundVolume = $("#updateSoundVol"),
  $updateTTSVolume = $("#updateTTSVol"),
  $addPhraseBtn = $("#addPhrase"),
  $addGuyBtn = $("#addGuy"),
  $soundVolume = $("#soundVolume"),
  $ttsVolume = $("#ttsVolume");
$(window).on("load", () => {});
window.addEventListener("load", () => {
  const btns = $(".nav-link");
  Array.from(btns).forEach((item) => {
    $(item).on("click", (e) => {
      let sectionName = e.target.name;
      $(".atv").removeClass("atv");
      $(`#${sectionName}-section`).addClass("atv");
    });
  });
  displaySounds();
});
$("#syncSounds").on("click", (e) => {
  let binID = getBID();
  updateBin(binID, sounds);
  $("#syncSounds").prop("disabled", true);
  consolelog("info", "Synced sounds");
  setTimeout(() => {
    $("#syncSounds").prop("disabled", false);
  }, 600000);
});

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

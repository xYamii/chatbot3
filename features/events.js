const tts = require("./features/tts.js");
const sfx = require("./features/sfx.js");
const updateData = require("./features/dataUpdate.js");

const fs = require("fs");

let init = (function() {
  let btns = document.getElementsByClassName("btn-link");
  Array.from(btns).forEach(item => {
    item.addEventListener("click", e => {
      let sectionName = e.target.name;
      sectionName = sectionName.substr(4);
      document.getElementsByClassName("active")[0].classList.remove("active");
      document.getElementById(`${sectionName}-section`).classList.add("active");
    });
  });
})();

let $reloadSnd = $("#reloadSounds");
let $updateSoundVolume = $("#updateSoundVol");
let $updateTTSVolume = $("#updateTTSVol");

$reloadSnd.click(sfx._loadSounds);
$updateSoundVolume.click(sfx.updateSoundVolume);
$updateTTSVolume.click(tts.updateTTSVolume);
$("#audio1").on("ended", tts.movettsQueue);

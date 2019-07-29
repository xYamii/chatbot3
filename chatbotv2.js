const chatbot = function() {
  //variables
  let soundPath = path.join(__dirname, "../");
  //cache dom
  let $soundTable = $("#soundtable");
  let $botStatus = $("#bot-status");
  let $soundVolume = $("#soundVolume");
  let $botUsername = $("#botUsername");
  let $channelName = $("#channelName");
  let $botOauth = $("#botOauth");
  let $newMsg = $("#newMsg");
  let $statusON = $("#status-on");
  let $statusOFF = $("#status-off");
  //bind events
  let btns = document.getElementsByClassName("btn-link");
  Array.from(btns).forEach(item => {
    item.addEventListener("click", e => {
      let sectionName = e.target.name;
      sectionName = sectionName.substr(4);
      document.getElementsByClassName("active")[0].classList.remove("active");
      document.getElementById(`${sectionName}-section`).classList.add("active");
    });
  });
  //functions
  function _loadSounds() {
    fs.readdir(soundPath + "/sounds", function(err, items) {
      if (items !== undefined) {
        let soundArray = [];
        for (var i = 0; i < items.length; i++) {
          let z = items[i].slice(0, -4);
          soundArray.push("!" + z);
        }
        settings.sounds = soundArray;
        $soundTable.innerHTML = "";
        for (let key in soundArray) {
          $soundTable.innerHTML += ` <tr><td>${parseInt(key) + 1}</td><td>${
            soundArray[key]
          }</td></tr>`;
        }
      } else {
        $soundTable.innerHTML = "there are no sounds added to bot xd";
      }
    });
  }
};

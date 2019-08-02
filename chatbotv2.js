const chatbot = function() {
  //variables
  let soundPath = path.join(__dirname, "../");
  //cache dom
  let $soundTable = $("#soundtable");
  let $botStatus = $("#bot-status");
  let $soundVolume = $("#soundVolume");
  let credentials = {
    botUsername: $("#botUsername"),
    channelName: $("#channelName"),
    auth: $("#botOauth"),
    welcomeMsg: $("#newMsg")
  };
  let $statusON = $("#status-on");
  let $statusOFF = $("#status-off");
  let $reloadSnd = $("#reloadSounds");
  let $updateBtn = $("#updateAll");
  let $updateVolume = $("#updateVolume");
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
  $reloadSnd.click(_loadSounds);
  $updateBtn.click(_updateData(data));
  $updateVolume.click(updateVolume(volumes));
  $statusON.click(_startBot);
  $statusOFF.click(_stopBot);
  //functions
  function _init() {
    for (let key in credentials) {
      credentials[key].val(config["credentials"][key]);
    }
  }
  function _startBot() {
    client.connect();
    $botStatus.html("online");
    $("#status-on").addClass("disabled");
    $("#status-off").removeClass("disabled");
  }
  function _stopBot() {
    client.disconnect();
    $botStatus.html("offline");
    $("#status-off").addClass("disabled");
    $("#status-on").removeClass("disabled");
  }
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
  function _updateData(newData) {
    fs.readFile(__dirname + "/config.json", function(err, data) {
      if (err) {
        console.log(err);
      }
      let obj = JSON.parse(data);
      for (let prop in obj) {
        obj["credentials"][prop] = newData[prop];
      }

      let json = JSON.stringify(obj, null, 2);
      fs.writeFile(__dirname + "/config.json", json, added);
      function added(err) {
        console.log("added succesfuly");
      }
    });
  }
  function updateVolume(volumes) {
    fs.readFile(__dirname + "/config.json", (err, data) => {
      if (err) console.log(err);
      let obj = JSON.parse(data);
      obj["credentials"]["audioVolume"] = volumes.audioVolume;
      obj["credentials"]["ttsVolume"] = volumes.ttsVolume;
      let json = JSON.stringify(obj, null, 2);
      fs.writeFile(__dirname + "/config.json", json, added);
      function added(err) {
        if (err) console.log(err);
        console.log("updated succesfuly");
      }
    });
  }
  _init();
  _loadSounds();
};

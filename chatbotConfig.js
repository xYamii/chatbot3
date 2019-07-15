const remote = require("electron").remote;
const main = remote.require("./index.js");
const $ = require("jQuery");
const fs = require("fs");

$("a").click(function(e) {
  e.preventDefault();
  let window = remote.getCurrentWindow();
  main.openWindow(e.target.name);
  window.close();
  return false;
});

$("#updateAll").click(() => {
  let username = $("#botUsername").val();
  let channelname = $("#channelName").val();
  let auth = $("#botOauth").val();
  let welcomeMsg = $("#newMsg").val();
  console.log(username);

  fs.readFile(__dirname + "/config.json", function(err, data) {
    if (err) {
      console.log(err);
    }
    let obj = JSON.parse(data);
    obj["username"] = username;
    obj["channelName"] = channelname;
    obj["auth"] = auth;
    obj["welcomeMsg"] = welcomeMsg;
    obj["configured"] = true;
    console.log(obj);
    let json = JSON.stringify(obj, null, 2);
    fs.writeFile(__dirname + "/config.json", json, added);
    function added(err) {
      console.log("added succesfuly");
    }
    return false;
  });
});

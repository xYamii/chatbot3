const fs = require("fs");
const path = require("path");
const mainPath = path.join(__dirname, "../");
let { ignoredUsers } = require(mainPath + "./data/ignored.json");
const ignore = (name) => {
  fs.readFile(mainPath + "./data/ignored.json", (err, data) => {
    if (err) console.log(err);
    let obj = JSON.parse(data);
    if (obj["ignoredUsers"].includes(name)) return;
    obj["ignoredUsers"].push(name);
    ignoredUsers.push(name);
    let json = JSON.stringify(obj, null, 2);
    fs.writeFile(mainPath + "./data/ignored.json", json, (err) => {
      if (err) console.log(err);
      console.log("updated succesfuly");
    });
  });
};
const unignore = (name) => {
  fs.readFile(mainPath + "./data/ignored.json", (err, data) => {
    if (err) console.log(err);
    let obj = JSON.parse(data);
    if (!obj["ignoredUsers"].includes(name)) return;
    let index = obj["ignoredUsers"].indexOf(name);
    obj["ignoredUsers"].splice(index, 1);
    ignoredUsers.splice(index, 1);
    let json = JSON.stringify(obj, null, 2);
    fs.writeFile(mainPath + "./data/ignored.json", json, (err) => {
      if (err) console.log(err);
      console.log("updated succesfuly");
    });
  });
};
const isIgnored = (name) => {
  if (ignoredUsers.includes(name)) return true;
  else return false;
};
module.exports = {
  isIgnored,
  ignore,
  unignore,
};

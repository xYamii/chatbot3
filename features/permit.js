const fs = require("fs");
const path = require("path");
const mainPath = path.join(__dirname, "../");
let { permittedUsers } = require(mainPath + "./data/permitted.json");
const permit = (name) => {
  fs.readFile(mainPath + "./data/permitted.json", (err, data) => {
    if (err) console.log(err);
    let obj = JSON.parse(data);
    if (obj["permittedUsers"].includes(name)) return;
    obj["permittedUsers"].push(name);
    permittedUsers.push(name);
    let json = JSON.stringify(obj, null, 2);
    fs.writeFile(mainPath + "./data/permitted.json", json, (err) => {
      if (err) console.log(err);
      console.log("updated succesfuly");
    });
  });
};
const unpermit = (name) => {
  fs.readFile(mainPath + "./data/permitted.json", (err, data) => {
    if (err) console.log(err);
    let obj = JSON.parse(data);
    if (!obj["permittedUsers"].includes(name)) return;
    let index = obj["permittedUsers"].indexOf(name);
    obj["permittedUsers"].splice(index, 1);
    permittedUsers.splice(index, 1);
    let json = JSON.stringify(obj, null, 2);
    fs.writeFile(mainPath + "./data/permitted.json", json, (err) => {
      if (err) console.log(err);
      console.log("updated succesfuly");
    });
  });
};
const isPermitted = (name) => {
  if (permittedUsers.includes(name)) return true;
  else return false;
};
module.exports = {
  isPermitted,
  permit,
  unpermit,
};

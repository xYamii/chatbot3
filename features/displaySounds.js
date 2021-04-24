const axios = require("axios");
const fs = require("fs");
const path = require("path");
require("dotenv").config({
  path: path.join(process.resourcesPath, "/app/.env"),
});
const soundPath = path.join(__dirname, "../");
const soundData = require(soundPath + "/data/sounds.json");
const headersPOST = {
  "Content-Type": "application/json",
  "X-Master-Key": process.env.JSON_API,
  "X-Bin-Private": false,
};
const headersPUT = {
  "Content-Type": "application/json",
  "X-Master-Key": process.env.JSON_API,
};

const url = "https://api.jsonbin.io/v3/b";
let binID = soundData.binID;
const updateBin = (id, sounds) => {
  const soundData = sounds.map((sound, index) => {
    return { id: index, sound: sound };
  });
  axios
    .put(`${url}/${id}`, soundData, { headers: headersPUT })
    .then((response) => {
      console.log(response.data);
    })
    .catch((error) => {
      console.log(error);
    });
};

const createBin = (data) => {
  axios
    .post(url, data, { headers: headersPOST })
    .then((response) => {
      binID = response.data.metadata.id;
      writeToFile(response.data.metadata.id);
    })
    .catch((error) => {
      console.log(error);
    });
};

const getBID = () => {
  return binID;
};

const writeToFile = (id) => {
  soundData.binID = id;
  let json = JSON.stringify(soundData, null, 2);
  fs.writeFile(process.resourcesPath + "/app/data/sounds.json", json, (err) => {
    if (err) console.log(err);
  });
};

module.exports = {
  getBID,
  createBin,
  updateBin,
};

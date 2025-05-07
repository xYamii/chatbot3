const fs = require("fs");
const path = require("path");

const ignoredFilePath = path.join(__dirname, "../data/ignored.json");
const ignoredFile = require("../data/ignored.json");

let ignoredUsers = [];

const ignoreUser = (userName) => {
  if (ignoredUsers.includes(userName)) return;
  ignoredUsers.push(userName);
  updateIgnoredUsersFile();
};

const unignoreUser = (userName) => {
  ignoredUsers.splice(ignoredUsers.indexOf(userName), 1);
  updateIgnoredUsersFile();
};

const updateIgnoredUsersFile = () => {
  ignoredFile.ignoredUsers = ignoredUsers;
  let json = JSON.stringify(ignoredFile, null, 2);
  fs.writeFile(ignoredFilePath, json, (err) => {
    if (err) console.log(err);
    console.log("updated ignored users file succesfuly");
  });
};

module.exports = {
  ignoreUser,
  unignoreUser,
  updateIgnoredUsersFile,
  getIgnoredUsers: () => {
    return ignoredUsers;
  },
  isIgnored: (userName) => {
    return ignoredUsers.includes(userName);
  },
};

const displaySounds = async () => {
  const sounds = await window.api.getSounds();
  let soundsData = `<table><thead><tr><th class="w-60">Index</th><th>Sound name</th></tr></thead><tbody>`;
  for (let key in sounds) {
    soundsData += ` <tr><td class="w-60">${parseInt(key) + 1}</td><td>${
      sounds[key]
    }</td></tr>`;
  }
  soundsData += `</tbody></table>`;
  document.getElementById("soundtable").innerHTML = soundsData;
};

const displayIgnoredUsers = async () => {
  const ignoredUsers = await window.api.getIgnoredUsers();
  if (ignoredUsers.length < 1) {
    document.getElementById("ignoredList").innerHTML =
      "<h4> none is ignored noway </h4>";
    return;
  }
  let ignoredUsersList = "<h4> Ignored users: </h4>";
  for (let key in ignoredUsers) {
    ignoredUsersList += `<li onclick=window.api.unignoreUser("${ignoredUsers[key]}")>${ignoredUsers[key]}</li>`;
  }
  document.getElementById("ignoredList").innerHTML = ignoredUsersList;
};

const playSound = async (sound) => {
  var audio = new Audio(`./sounds/${sound}.wav`);
  audio.volume = 0.5;
  audio.play();
  delete audio;
};

displaySounds();
displayIgnoredUsers();

document.getElementById("syncSounds").addEventListener("click", () => {
  displaySounds();
});

document.getElementById("addGuy").addEventListener("click", () => {
  const userName = document.getElementById("guyVal").value;
  if (typeof userName === "string" && userName.length === 0) return;
  window.api.ignoreUser(userName);
  displayIgnoredUsers();
});

window.api.onReceiveMessage((event, message, ...args) => {
  switch (message) {
    case "renderSounds":
      displaySounds();
      break;
    case "renderIgnored":
      displayIgnoredUsers();
    case "playSound":
      playSound(...args);
    default:
      break;
  }
});

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
  if (ignoredUsers.length < 1) return;
  let ignoredUsersList;
  for (let key in ignoredUsers) {
    ignoredUsersList += `<li>${ignoredUsers[key]}</li>`;
  }
  document.getElementById("ignoredList").innerHTML = ignoredUsersList;
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

window.api.onReceiveMessage((event, message) => {
  switch (message) {
    case "renderSounds":
      displaySounds();
      break;
    default:
      break;
  }
});

const $ = require("jquery");

module.exports = {
  consolelog: (level, message) => {
    $("#console").append(`<p class="${level}">${message}<p>`);
  },
};

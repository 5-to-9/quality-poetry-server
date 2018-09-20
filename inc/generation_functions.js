module.exports = {
  generateBasic: function (type) {
    return generatePoem(type);
  },
  c: function (var_to_print) {
    console.log(var_to_print);
  }
};

var generatePoem = function (type) {
  var dictionary = require("../src/dictionary");

  var result = {
    "poem_type": type,
    "line1": "hello there",
    "line2": "this is a poem"
  };
  return result;
}

var readFiles = function (){

}

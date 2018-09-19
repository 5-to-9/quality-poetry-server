module.exports = {
  generateBasic: function (type) {
    return generatePoem(type);
  },
  c: function (var_to_print) {
    console.log(var_to_print);
  }
};

var generatePoem = function (type) {
  var result = {
    "poem_type": "normal",
    "poem": "Hello there"
  };
  return result;
}

var fs = require('fs');
var readline = require('readline');
const doAsync = require('doasync');


module.exports = {
  generateBasic: function (type) {
    return generatePoem(type);
  },
  c: function (var_to_print) {
    console.log(var_to_print);
  }
};

var generatePoem = function (type) {
  var dictionary = readFiles();

  var result = {
    "poem_type": type,
    "line1": "hello there",
    "line2": "this is a poem"
  };

  // doAsync(fs).readFile('./src/dictionary/verb.txt','utf8')
  //   .then((data) => console.log(data))
  //   .then((data) => dictionary = data)
  //   .then((dictionary) => console.log(dictionary));

  doAsync(fs).readdir("./src/dictionary")
    .then((data) => console.log(data))
    .then((data) => (result = data));

  return result;
}

function readFiles() {
  var path = "./src/dictionary";
  var dict = {};
  var j=0;

  var filename = path + "/verb.txt";

  fs.readdir(path, function(err, items) {
    for (var i = 0; i < items.length; ++i) {
      var filename = path + '/' + items[i];
      readline.createInterface({
        input: fs.createReadStream(filename),
        terminal: false
      }).on('line', function(line) {
        dict[j] = line;
        ++j;
      });
    }
  });

  // console.log(dict);

  // return dict;

  // onReadComplete();
}

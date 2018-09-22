var normalizedPath = require("path").join(__dirname, "routes");

var fs = require('fs');

// fs.readFile('./phrases.txt', 'utf8', function(err, data) {
var path = "./src/dictionary/";

fs.readdir(path, function(err, items) {
    for (var i=0; i<items.length; i++) {
      if(items[i].slice(-4) == ".txt"){
        console.log(items[i]);
      }
    }
});

// require("fs").readdirSync(normalizedPath).forEach(function(file) {
  // require("./routes/" + file);
// });

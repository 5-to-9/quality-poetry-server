var normalizedPath = require("path").join(__dirname, "routes");

var fs = require('fs');

fs.readFile('./phrases.txt', 'utf8', function(err, data) {
    // if (err) throw err;
    // console.log("Hey");
});

// require("fs").readdirSync(normalizedPath).forEach(function(file) {
  // require("./routes/" + file);
// });

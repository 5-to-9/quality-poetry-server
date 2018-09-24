var fs = require('fs');

module.exports = {
  generateBasic: function (type, callback) {
    return generatePoem(type, function(data){
      return callback(data);
    });
  },
  c: function (var_to_print) {
    console.log(var_to_print);
  }
};

function generatePoem (type, callback) {
  var poem = { "type":type };
  var genderProb = Math.floor(Math.random() * 2) + 1;

  var dirPath = "./src/dictionary";
  var phrasesFile = dirPath + "/phrases.json";
  var dictionaryFile = dirPath + "/dictionary.json";

  fs.readFile(phrasesFile, 'utf8', function(phraseErr, phrases) {
    fs.readFile(dictionaryFile, 'utf8', function(dictErr, words) {

      var lineCount = getLineCount(Math.floor(Math.random() * 10) + 1);

      for(var i=0; i<lineCount;++i){
        poem["line" + i] = "line " + i;
      }
      return callback(poem);
    })
  });
}

function getLineCount(lineProb){
  if(lineProb < 4){
     return lineCount = 3;
   } else if (lineProb < 8){
     return lineCount = 4;
   } else {
     return lineCount = 5;
   }
}

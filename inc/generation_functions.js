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

  var dirPath = "./src/dictionary";
  var phrasesFile = dirPath + "/phrases.json";
  var dictionaryFile = dirPath + "/dictionary.json";

  fs.readFile(phrasesFile, 'utf8', function(phraseErr, phrases) {
    fs.readFile(dictionaryFile, 'utf8', function(dictErr, dictionary) {
      var lineCount = getLineCount(Math.floor(Math.random() * 10) + 1);
      var genderProb = Math.floor(Math.random() * 3) + 1;
      var phraseToGet;

      dictionary = JSON.parse(dictionary);
      phrases = JSON.parse(phrases);

      if(genderProb == 1){
        dictionary.pronoun_subjective = "he";
        dictionary.pronoun_objective = "him";
        dictionary.pronoun_possessive = "his";
      } else if(genderProb == 2){
        dictionary.pronoun_subjective = "she";
        dictionary.pronoun_objective = "her";
        dictionary.pronoun_possessive = "her";
      } else {
        dictionary.pronoun_subjective = "they";
        dictionary.pronoun_objective = "them";
        dictionary.pronoun_possessive = "their";
      }

      for(var i = 1; i <= lineCount; ++i){
        if(i == 1){
          phraseToGet = "beginning";
        } else if (i == lineCount){
          phraseToGet = "end";
        } else {
          phraseToGet = "middle";
        }

        poem["line" + i] = generateLine(phraseToGet, phrases, dictionary);
      }

      return callback(poem);
    })
  });
}

function generateLine(phraseToGet, phrases, dictionary){
  var basicLine = randomVal(phrases[phraseToGet]);

  return basicLine;
}

function randomVal (obj) {
    var keys = Object.keys(obj)
    return obj[keys[ keys.length * Math.random() << 0]];
};

function getLineCount(lineProb){
  if(lineProb < 4){
     return lineCount = 3;
   } else if (lineProb < 8){
     return lineCount = 4;
   } else {
     return lineCount = 5;
   }
}

var fs = require('fs');

// Provides the functions used for poem generation
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

// Generates the poem. Takes in the type of poem to write - currently not doing anything.
function generatePoem (type, callback) {
  var poem = { "type":type };

  // loads dictionary
  var dirPath = "./src/dictionary";
  var phrasesFile = dirPath + "/phrases.json";
  var dictionaryFile = dirPath + "/dictionary.json";

  fs.readFile(phrasesFile, 'utf8', function(phraseErr, phrases) {
    fs.readFile(dictionaryFile, 'utf8', function(dictErr, dictionary) {
      var lineCount = getLineCount(Math.floor(Math.random() * 10) + 1);
      var genderProb = Math.floor(Math.random() * 2) + 1;
      var phraseToGet;

      dictionary = JSON.parse(dictionary);
      phrases = JSON.parse(phrases);

      // roles dice to decide which pronouns to use
      if(genderProb == 1){
        dictionary.pro_subjective = ["he"];
        dictionary.pro_objective = ["him"];
        dictionary.pro_possessive = ["his"];
      } else if(genderProb == 2){
        dictionary.pro_subjective = ["she"];
        dictionary.pro_objective = ["her"];
        dictionary.pro_possessive = ["her"];
      } else {
        dictionary.pro_subjective = ["they"];
        dictionary.pro_objective = ["them"];
        dictionary.pro_possessive = ["their"];
      }

      var wordTypes = [];
      for (var key in dictionary) wordTypes.push(key);

      // writes the poem line by line
      for(var i = 1; i <= lineCount; ++i){
        if(i == 1){
          phraseToGet = "beginning";
        } else if (i == lineCount){
          phraseToGet = "end";
        } else {
          phraseToGet = "middle";
        }

        poem["line" + i] = generateLine(phraseToGet, phrases, dictionary, wordTypes);
      }

      return callback(poem);
    })
  });
}

// uses the phrase to madlibs in words
function generateLine(phraseToGet, phrases, dictionary, wordTypes){
  var basicLine = randomVal(phrases[phraseToGet]);
  var currentType = "";

  for(var wKey in wordTypes){
    currentType = wordTypes[wKey];
    var re = new RegExp(currentType,"g");
    basicLine = basicLine.replace(re, function(res){
      return randomVal(dictionary[currentType]);
    });
  }

  return basicLine;
}

// gets a random value from JSON
function randomVal (obj) {
    var keys = Object.keys(obj)
    return obj[keys[ keys.length * Math.random() << 0]];
};

// random number of lines for the poem
function getLineCount(lineProb){
  if(lineProb < 4){
     return lineCount = 3;
   } else if (lineProb < 8){
     return lineCount = 4;
   } else {
     return lineCount = 5;
   }
}

var fs = require('fs');

// Provides the functions used for poem generation
module.exports = {
  returnPoem: function (type, callback) {
    return generatePoem(type, function(data){
      return callback(data)
    });
  },
  returnLine: function (type, callback) {
    // return generatePoem(type, function(data){
    //   return callback(data);
    // });
  },
  c: function (var_to_print) {
    console.log(var_to_print)
  }
};

// Generates the poem. Takes in the type of poem to write - which currently doesn't do anything.
function generatePoem (type, callback) {
  var poem = { "poem" : { "type" : type, "title" : "", "lines" : [] } };

  // loads dictionary
  var dirPath = "./src/dictionary"
  var phrasesFile = dirPath + "/phrases.json"
  var dictionaryFile = dirPath + "/dictionary.json"

  fs.readFile(phrasesFile, 'utf8', function(phraseErr, phrases) {
    fs.readFile(dictionaryFile, 'utf8', function(dictErr, dictionary) {
      var lineCount = getLineCount(Math.floor(Math.random() * 10) + 1);
      var genderProb = Math.floor(Math.random() * 2) + 1;
      var phraseToGet;

      // initialize dictionary and phrasebook
      dictionary = JSON.parse(dictionary);
      phrases = JSON.parse(phrases);
      var pronouns = getPoemTarget();

      dictionary.pro_subjective = pronouns["pro_subjective"];
      dictionary.pro_objective = pronouns["pro_objective"];
      dictionary.pro_possessive = pronouns["pro_possessive"];
      dictionary.poem_target = pronouns["poem_target"];
      dictionary.verb_ending = pronouns["verb_ending"];

      var wordTypes = [];
      for (var key in dictionary) wordTypes.push(key);

      poem["poem"]["title"] = generateLine("title", phrases, dictionary, wordTypes);

      // writes the poem line by line
      for(var i = 1; i <= lineCount; ++i){
        if(i == 1){
          phraseToGet = "beginning";
        } else if (i == lineCount){
          phraseToGet = "end";
        } else {
          phraseToGet = "middle";
        }

        var lineToPush = {"type": type, "text": generateLine(phraseToGet, phrases, dictionary, wordTypes)}
        poem["poem"]["lines"].push(lineToPush);
      }

      return callback(poem);
    })
  });
}

// function to randomly decide who the poem is targetting.
// the author (I), the reader (you), him, her, us (we), or them (both singular and plural)
function getPoemTarget() {
  var target = Math.floor(Math.random() * 6) + 1
  pronouns =
    [{
       // the author
  	   "poem_target" : "myself",
       "pro_subjective" : "I",
       "pro_objective" : "me",
       "pro_possessive" : "my",
       "verb_ending" : ""
    }, {
    	"poem_target" : "the reader",
      "pro_subjective" : "you",
      "pro_objective" : "you",
      "pro_possessive" : "your",
      "verb_ending" : ""
    }, {
    	"poem_target" : "the man",
      "pro_subjective" : "he",
      "pro_objective" : "him",
      "pro_possessive" : "his",
      "verb_ending" : "s"
    }, {
    	"poem_target" : "the woman",
      "pro_subjective" : "she",
      "pro_objective" : "her",
      "pro_possessive" : "her",
      "verb_ending" : "s"
    }, {
    	"poem_target" : "us",
      "pro_subjective" : "we",
      "pro_objective" : "us",
      "pro_possessive" : "our",
      "verb_ending" : ""
    }, {
      // them, singular
    	"poem_target" : "them",
      "pro_subjective" : "they",
      "pro_objective" : "them",
      "pro_possessive" : "their",
      "verb_ending" : ""
    }, {
      // them, plural
    	"poem_target" : "them",
      "pro_subjective" : "they",
      "pro_objective" : "them",
      "pro_possessive" : "their",
      "verb_ending" : ""
    }];

  return pronouns[target];
}

// uses the phrase to madlibs in words
function generateLine (phraseToGet, phrases, dictionary, wordTypes) {
  var lineGenerated = false
  var basePhrase = line = currentWordType = randomWord = lastWordUsed = ""
  var escapeWords = ["poem_target", "pro_subjective", "pro_objective", "pro_possessive", "verb_ending"]

  while (!lineGenerated) {
    // select a phrase at random
    basePhrase = randVal2(phrases["phrases"])

    // check if the phrase we randomly selected belongs in the place we're trying to place it
    if (basePhrase["placement"].includes(phraseToGet)) {
      line = basePhrase["phrase"];

      // for every type of word, see if the line has that type of word. If so, insert a word of that type.
      // todo - instead of looping through every type of word, loop through the line and replace words as they come up.
      for (var wKey in wordTypes) {
        currentWordType = wordTypes[wKey];
        var re = new RegExp(currentWordType,"g");
        line = line.replace(re, function(res){
          // if(!currentWordType){
          if (!escapeWords.includes(currentWordType)) {
            // make sure that the same word isn't returned sequentially.
            var tries = 0;
            randomWord = randomVal(dictionary[currentWordType]);
            // if the random word is the last one used, try to make a new one.
            // the tries var is for an occasional infinite hang that hasn't been solved yet.
            while(randomWord == lastWordUsed && tries < 10){
              randomWord = randomVal(dictionary[currentWordType]);
              ++tries;
            }
            lastWordUsed = randomWord;
            return randomWord;
          } else {
            return dictionary[currentWordType];
          }
        });
      }

      lineGenerated = true;
    }
  }

  // strip punctuation from title
  if(phraseToGet == "title"){
    line = line.replace(/[^A-Za-z0-9\s]/g,"");
  }

  return line;
}

// gets a random value from JSON
function randomVal (obj) {
    var keys = Object.keys(obj)
    return obj[keys[ keys.length * Math.random() << 0]];
};

function randVal2 (obj) {
  var keys = Object.keys(obj)
  return obj[keys[ keys.length * Math.random() << 0]];
}

// random number of lines for the poem
function getLineCount(lineProb) {
  if (lineProb < 4) {
     return lineCount = 3
   } else if (lineProb < 8) {
     return lineCount = 4
   } else {
     return lineCount = 5
   }
}

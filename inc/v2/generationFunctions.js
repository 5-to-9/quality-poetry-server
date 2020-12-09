var fs = require('fs')
var path = require('path')

module.exports = {
  returnPoem: function (callback) {
    return generatePoem(function(data) {
      return callback(data)
    })
  },
  returnLine: function (placement, callback) {
    return generateOneLine(placement, function(data) {
      return callback(data)
    })
  }
}

function generatePoem(callback) {
  var poem = { "poem" : { "title" : "", "lines" : [] } }

  var dirname = path.join(__dirname, '..', '..', 'src', 'v2')
  var phrasesFile = dirname + '/phrases.json'
  var dictionaryFile = dirname + '/dictionary.json'

  fs.readFile(phrasesFile, 'utf8', function(phraseError, phrases) {
    fs.readFile(dictionaryFile, 'utf8', function(dictionaryError, dictionary) {
      if (typeof phrases == 'undefined' || typeof dictionary == 'undefined') {
        return callback({ "error" : "could not load JSON." })
      }

      var lineCount = getLineCount(Math.floor(Math.random() * 10) + 1)
      var genderProb = Math.floor(Math.random() * 2) + 1
      var phraseToGet = ''

      phrases = JSON.parse(phrases)
      dictionary = compileDictionary(JSON.parse(dictionary))

      var wordTypes = []

      for (var key in dictionary) {
        wordTypes.push(key)
      }

      var poemTitle = getLine("title", phrases, dictionary, wordTypes)
      poem["poem"]["title"] = poemTitle

      for (var i = 1; i <= lineCount; ++i) {
        if (i == 1) {
          phraseToGet = "beginning"
        } else if (i != lineCount) {
          phraseToGet = "middle"
        } else {
          phraseToGet = "end"
        }

        poem["poem"]["lines"].push(
          getLine(
            phraseToGet,
            phrases,
            dictionary,
            wordTypes
          )
        )
      }

      return callback(poem)
    })
  })
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

function compileDictionary(dictionary) {
  pronouns = getPoemTarget()

  dictionary.subjectivePronoun = [pronouns["subjectivePronoun"]]
  dictionary.objectivePronoun = [pronouns["objectivePronoun"]]
  dictionary.possessivePronoun = [pronouns["possessivePronoun"]]
  dictionary.reflexivePronoun = [pronouns["reflexivePronoun"]]
  dictionary.poemTarget = [pronouns["poemTarget"]]
  dictionary.verbEnding = [pronouns["verbEnding"]]
  dictionary.toBeConjugation = [pronouns["toBeConjugation"]]
  dictionary.toBePastConjugation = [pronouns["toBePastConjugation"]]
  dictionary.toDoConjugation = [pronouns["toDoConjugation"]]
  dictionary.possessiveConjugation = [pronouns["possessiveConjugation"]]

  return dictionary
}

function getPoemTarget() {
  var target = Math.floor(Math.random() * 6) + 1

  pronouns = [
    {
      "poemTarget" : "myself",
      "subjectivePronoun" : "I",
      "objectivePronoun" : "me",
      "possessivePronoun" : "my",
      "reflexivePronoun" : "myself",
      "verbEnding" : "",
      "toBeConjugation" : "am",
      "toBePastConjugation" : "was",
      "toDoConjugation" : "do",
      "possessiveConjugation" : "have"
    }, {
      "poemTarget" : "you",
      "subjectivePronoun" : "you",
      "objectivePronoun" : "you",
      "possessivePronoun" : "your",
      "reflexivePronoun" : "yourself",
      "verbEnding" : "",
      "toBeConjugation" : "are",
      "toBePastConjugation" : "were",
      "toDoConjugation" : "do",
      "possessiveConjugation" : "have"
    }, {
      "poemTarget" : "the man",
      "subjectivePronoun" : "he",
      "objectivePronoun" : "him",
      "possessivePronoun" : "his",
      "reflexivePronoun" : "himself",
      "verbEnding" : "s",
      "toBeConjugation" : "is",
      "toBePastConjugation" : "was",
      "toDoConjugation" : "does",
      "possessiveConjugation" : "has"
    }, {
      "poemTarget" : "the woman",
      "subjectivePronoun" : "she",
      "objectivePronoun" : "her",
      "possessivePronoun" : "her",
      "reflexivePronoun" : "herself",
      "verbEnding" : "s",
      "toBeConjugation" : "is",
      "toBePastConjugation" : "was",
      "toDoConjugation" : "does",
      "possessiveConjugation" : "has"
    }, {
      "poemTarget" : "us",
      "subjectivePronoun" : "we",
      "objectivePronoun" : "us",
      "possessivePronoun" : "our",
      "reflexivePronoun" : "ourselves",
      "verbEnding" : "",
      "toBeConjugation" : "are",
      "toBePastConjugation" : "were",
      "toDoConjugation" : "do",
      "possessiveConjugation" : "have"
    }, {
      // them, singular
      "poemTarget" : "them",
      "subjectivePronoun" : "they",
      "objectivePronoun" : "them",
      "possessivePronoun" : "their",
      "reflexivePronoun" : "themself",
      "verbEnding" : "",
      "toBeConjugation" : "are",
      "toBePastConjugation" : "were",
      "toDoConjugation" : "do",
      "possessiveConjugation" : "have"
    }, {
      // them, plural
      "poemTarget" : "them",
      "subjectivePronoun" : "they",
      "objectivePronoun" : "them",
      "possessivePronoun" : "their",
      "reflexivePronoun" : "theirselves",
      "verbEnding" : "",
      "toBeConjugation" : "are",
      "toBePastConjugation" : "were",
      "toDoConjugation" : "do",
      "possessiveConjugation" : "have"
    }
  ]

  return pronouns[target]
}

function getLine(phraseToGet, phrases, dictionary, wordTypes) {
  var isLineGenerated = false
  var basePhrase = line = currentWordType = word = lastWordUsed = ""

  // don't go to the dictionary for the following words - we already know them
  var fixedWords = [
    "poemTarget",
    "subjectivePronoun",
    "objectivePronoun",
    "possessivePronoun",
    "reflexivePronoun",
    "verbEnding",
    "toBeConjugation",
    "toBePastConjugation",
    "toDoConjugation",
    "possessiveConjugation"
  ]

  while (!isLineGenerated) {
    // select a phrase at random
    basePhrase = randomPhrase(phrases)

    // check if the phrase we randomly selected belongs in the place we're trying to place it
    if (basePhrase["placement"].includes(phraseToGet)) {
      line = basePhrase["phrase"]

      // for every type of word, see if the line has that type of word. If so, insert a word of that type.
      // TODO: instead of looping through every type of word, loop through the line and replace words as they come up.
      for (var wKey in wordTypes) {
        currentWordType = wordTypes[wKey]
        var re = new RegExp(currentWordType, "g")

        line = line.replace(re, function(res) {
          if (!fixedWords.includes(currentWordType)) {
            // make sure that the same word isn't returned sequentially.
            word = randomWord(dictionary[currentWordType], lastWordUsed)
            lastWordUsed = word

            return word
          }

          return dictionary[currentWordType]
        });
      }

      isLineGenerated = true
    }
  }

  // strip punctuation from title
  if (phraseToGet == "title") {
    line = line.replace(/[^A-Za-z0-9\'?\s]/g,"")
  }

  return line
}

function randomPhrase(phrases) {
  var keys = Object.keys(phrases)
  return phrases[keys[keys.length * Math.random() << 0]];
}

function randomWord(dictionary, lastWordUsed) {
  var isWordAcceptable = false
  var tries = index = 0
  var word = ''

  // console.log(dictionary)

  while (!isWordAcceptable) {
    // grab a random word from the dictionary
    index = Math.floor(Math.random() * dictionary.length)
    word = dictionary[index]

    if (word !== lastWordUsed || tries > 20) {
      isWordAcceptable = true;
    }

    ++tries;
  }

  return word
}

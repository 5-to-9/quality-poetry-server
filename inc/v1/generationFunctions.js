var fs = require('fs')
var path = require('path')

// Provides the functions used for poem generation
module.exports = {
  returnPoem: function (author, mood, callback) {
    return generatePoem(author, mood, function(data) {
      return callback(data)
    })
  },
  returnLine: function (placement, author, mood, callback) {
    return generateOneLine(placement, author, mood, function(data) {
      return callback(data)
    })
  },
  c: function (varToPrint) {
    console.log(varToPrint)
  }
}

// Generates the poem. Takes in the author and mood of the poem to write,
// which informs which words are selected from the dictionary.
function generatePoem(author, mood, callback) {
    if (!validatePoemAuthor(author)){
        return callback({ "error" : "that author is not valid"});
    }

    if (!validatePoemMood(mood)){
        return callback({ "error" : "that mood is not valid"});
    }

    var poem = { "poem" : { "author" : author, "mood" : mood, "title" : "", "lines" : [] } }

    // load the dictionary
    var dirname = path.join(__dirname, '..', '..', 'src', 'v1')
    var phrasesFile = dirname + '/phrases.json'
    var dictionaryFile = dirname + '/dictionary.json'

    fs.readFile(phrasesFile, 'utf8', function(phraseErr, phrases) {
        fs.readFile(dictionaryFile, 'utf8', function(dictErr, dictionary) {
            if (typeof phrases == 'undefined' || typeof dictionary == 'undefined') {
                return callback({ "error" : "could not load JSON." })
            }

            var lineCount = getLineCount(Math.floor(Math.random() * 10) + 1)
            var genderProb = Math.floor(Math.random() * 2) + 1
            var phraseToGet = ''

            // initialize dictionary and phrasebook
            phrases = compilePhrases(JSON.parse(phrases), author)
            dictionary = compileDictionary(JSON.parse(dictionary), author)

            var wordTypes = []
            for (var key in dictionary) {
                wordTypes.push(key)
            }

            var poemTitle = getLine("title", phrases, dictionary, wordTypes, author, mood)

            poem["poem"]["title"] = poemTitle

            // write the poem line by line
            for (var i = 1; i <= lineCount; ++i) {
                if (i == 1) {
                    phraseToGet = "beginning"
                } else if (i == lineCount) {
                    phraseToGet = "end"
                } else {
                    phraseToGet = "middle"
                }

                var newLine = {
                    "text": getLine(phraseToGet, phrases, dictionary, wordTypes, author, mood),
                }

                lineStyle = getLineStyle(phraseToGet, author);

                if (lineStyle) {
                    newLine["style"] = lineStyle
                }

                poem["poem"]["lines"].push(newLine)
            }

            var signature = generateSignature(author);

            if (signature) {
                poem["poem"]["signature"] = signature
            }

            return callback(poem)
        })
    });
}

function generateOneLine(placement, author, mood, callback) {
  if (!validateLinePlacement(placement)) {
    return callback({ "error" : "that placement is not valid"});
  }

  if (!validatePoemAuthor(author)) {
    return callback({ "error" : "that author is not valid"});
  }

  if (!validatePoemMood(mood)) {
    return callback({ "error" : "that mood is not valid"});
  }

  // load the dictionary
  var dirname = path.join(__dirname, '..', 'src', 'dictionary')
  var phrasesFile = dirname + '/phrases.json'
  var dictionaryFile = dirname + '/dictionary.json'

  fs.readFile(phrasesFile, 'utf8', function(phraseErr, phrases) {
    fs.readFile(dictionaryFile, 'utf8', function(dictErr, dictionary) {
      if (typeof phrases == 'undefined' || typeof dictionary == 'undefined') {
        return callback({ "error" : "could not load JSON." })
      }

      var line = { "line" : { "text" : "" } }
      var genderProb = Math.floor(Math.random() * 2) + 1

      // initialize dictionary and phrasebook
      phrases = compilePhrases(JSON.parse(phrases), author)
      dictionary = compileDictionary(JSON.parse(dictionary), author)

      var wordTypes = []
      for (var key in dictionary) {
        wordTypes.push(key)
      }

      line["line"]["text"] = getLine(placement, phrases, dictionary, wordTypes, author, mood)

      if (style = getLineStyle(placement, author)) {
        line["line"]["style"] = style
      }

      return callback(line)
    })
  })
}

function compilePhrases(allPhrases, author) {
  phrases = allPhrases.default

  if (author != 'default') {
    phrases = phrases.concat(allPhrases[author])
  }

  return phrases
}

function compileDictionary(fullDictionary, author) {
  dictionary = fullDictionary.default

  if (author != 'default') {
    authorDictionary = fullDictionary[author]

    for (var key in authorDictionary) {
      Object.assign(dictionary[key], dictionary[key], authorDictionary[key])
    }
  }

  pronouns = getPoemTarget()

  dictionary.subjectivePronoun = pronouns["subjectivePronoun"]
  dictionary.objectivePronoun = pronouns["objectivePronoun"]
  dictionary.possessivePronoun = pronouns["possessivePronoun"]
  dictionary.reflexivePronoun = pronouns["reflexivePronoun"]
  dictionary.poemTarget = pronouns["poemTarget"]
  dictionary.verbEnding = pronouns["verbEnding"]
  dictionary.toBeConjugation = pronouns["toBeConjugation"]
  dictionary.toBePastConjugation = pronouns["toBePastConjugation"]
  dictionary.toDoConjugation = pronouns["toDoConjugation"]
  dictionary.possessiveConjugation = pronouns["possessiveConjugation"]

  return dictionary
}

// function to randomly decide who the poem is targetting.
// the author (I), the reader (you), him, her, us (we), or them (both singular and plural)
function getPoemTarget() {
  var target = Math.floor(Math.random() * 6) + 1

  pronouns = [{
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
  }]

  return pronouns[target]
}

// uses the phrase to generate a line madlibs-style
function getLine(phraseToGet, phrases, dictionary, wordTypes, author, mood) {
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
            word = randomWord(dictionary[currentWordType], lastWordUsed, mood)
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

function getLineStyle(phrase, author) {
  if (author === 'rupiKaur' && getRandomInt(9) === 0) {
    return 'italic'
  }

  if (
    (author === 'tumblrPoet' || author === 'rupiKaur')
    && getRandomInt(14) === 0
  ) {
    return 'parentheses'
  }

  if (
    (author === 'default' || author === 'rupiKaur')
    && getRandomInt(19) === 0
  ) {
    return 'quotation'
  }

  return null
}

function generateSignature(author) {
  if (author == 'rupiKaur') {
    return '- rupi kaur'
  }

  return null;
}

// gets a random key from JSON
function randomWord(dictionary, lastWordUsed, mood) {
  var isWordAcceptable = false
  var tries = index = 0
  var word = ''

  while (!isWordAcceptable) {
    // grab a random word from the dictionary
    index = Math.floor(Math.random() * Object.keys(dictionary).length)
    word = Object.keys(dictionary)[index]

    if (Object.values(dictionary)[index].includes(mood)) {
      if (word !== lastWordUsed) {
        isWordAcceptable = true;
      }
    }

    ++tries;

    if (tries > 20) {
      isWordAcceptable = true;
    }
  }

  return word
}

function validateLinePlacement(placement) {
  var validLinePlacements = ['title', 'beginning', 'middle', 'end'];
  return validLinePlacements.includes(placement);
}

function validatePoemAuthor(author) {
  var validPoemAuthors = ['default', 'rupiKaur', 'tumblrPoet'];
  return validPoemAuthors.includes(author);
}

function validatePoemMood(mood) {
  var validPoemMoods = ['basic', 'love', 'angst'];
  return validPoemMoods.includes(mood);
}

// gets a random value from JSON
function randomPhrase(obj) {
  var keys = Object.keys(obj)
  return obj[keys[keys.length * Math.random() << 0]];
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

// generates a random int between 0 and max
function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max))
}

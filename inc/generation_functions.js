var fs = require('fs')
var path = require('path')

// Provides the functions used for poem generation
module.exports = {
  returnPoem: function (author, mood, callback) {
    return generatePoem(author, mood, function(data) {
      return callback(data)
    });
  },
  returnLine: function (author, mood, callback) {
    // return generatePoem(author, mood, function(data) {
    //   return callback(data);
    // });
  },
  c: function (var_to_print) {
    console.log(var_to_print)
  }
};

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
    var dirname = path.join(__dirname, '..', 'src', 'dictionary')
    var phrasesFile = dirname + '/phrases.json'
    var dictionaryFile = dirname + '/dictionary.json'

    fs.readFile(phrasesFile, 'utf8', function(phraseErr, phrases) {
        fs.readFile(dictionaryFile, 'utf8', function(dictErr, dictionary) {
            if (typeof phrases == 'undefined' || typeof dictionary == 'undefined') {
                return callback({ "error" : "could not load JSON." });
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

            var poemTitle = generateLine("title", phrases, dictionary, wordTypes, author, mood)

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
                    "text": generateLine(phraseToGet, phrases, dictionary, wordTypes, author, mood),
                    "style": getLineStyle(phraseToGet, author)
                }

                poem["poem"]["lines"].push(newLine)
            }

            var signature = generateSignature(author);

            if (signature) {
                poem["poem"]["lines"].push(signature)
            }

            return callback(poem)
        })
    });
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
  dictionary.poemTarget = pronouns["poemTarget"]
  dictionary.verbEnding = pronouns["verbEnding"]
  dictionary.toBeConjugation = pronouns["toBeConjugation"]
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
    "verbEnding" : "",
    "toBeConjugation": "am",
    "possessiveConjugation": "have"
  }, {
    "poemTarget" : "the reader",
    "subjectivePronoun" : "you",
    "objectivePronoun" : "you",
    "possessivePronoun" : "your",
    "verbEnding" : "",
    "toBeConjugation": "are",
    "possessiveConjugation": "have"
  }, {
    "poemTarget" : "the man",
    "subjectivePronoun" : "he",
    "objectivePronoun" : "him",
    "possessivePronoun" : "his",
    "verbEnding" : "s",
    "toBeConjugation": "is",
    "possessiveConjugation": "has"
  }, {
    "poemTarget" : "the woman",
    "subjectivePronoun" : "she",
    "objectivePronoun" : "her",
    "possessivePronoun" : "her",
    "verbEnding" : "s",
    "toBeConjugation": "is",
    "possessiveConjugation": "has"
  }, {
    "poemTarget" : "us",
    "subjectivePronoun" : "we",
    "objectivePronoun" : "us",
    "possessivePronoun" : "our",
    "verbEnding" : "",
    "toBeConjugation": "are",
    "possessiveConjugation": "have"
  }, {
    // them, singular
    "poemTarget" : "them",
    "subjectivePronoun" : "they",
    "objectivePronoun" : "them",
    "possessivePronoun" : "their",
    "verbEnding" : "",
    "toBeConjugation": "are",
    "possessiveConjugation": "have"
  }, {
    // them, plural
    "poemTarget" : "them",
    "subjectivePronoun" : "they",
    "objectivePronoun" : "them",
    "possessivePronoun" : "their",
    "verbEnding" : "",
    "toBeConjugation": "are",
    "possessiveConjugation": "have"
  }]

  return pronouns[target]
}

// uses the phrase to generate a line madlibs-style
function generateLine(phraseToGet, phrases, dictionary, wordTypes, author, mood) {
    var isLineGenerated = false
    var basePhrase = line = currentWordType = word = lastWordUsed = ""

    // don't go to the dictionary for the following words - we already know them
    var fixedWords = [
        "poemTarget",
        "subjectivePronoun",
        "objectivePronoun",
        "possessivePronoun",
        "verbEnding"
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
                        word = randomWord(dictionary[currentWordType], lastWordUsed, mood);
                        lastWordUsed = word
                        return word
                    } else {
                        return dictionary[currentWordType]
                    }
                });
            }

            isLineGenerated = true;
        }
    }

    // strip punctuation from title
    if (phraseToGet == "title") {
        line = line.replace(/[^A-Za-z0-9\'?\s]/g,"");
    }

    return line;
}

function getLineStyle(phrase, author) {
  if (author == 'rupiKaur' && (Math.floor(Math.random() * 5) + 1) < 3) {
    return 'italic'
  }

  return ''
}

function generateSignature(author) {
  if (author == 'rupiKaur') {
    return {
      "text": '- rupi kaur',
      "style": ''
    }
  }

  return null;
}

// gets a random key from JSON
function randomWord(dictionary, lastWordUsed, mood) {
    var isWordAcceptable = false
    var index = 0
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
    }

    return word
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

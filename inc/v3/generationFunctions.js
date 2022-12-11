var fs = require('fs').promises
var path = require('path')
const { Configuration, OpenAIApi } = require("openai");
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') })

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

async function getPoetryResponse(callback) {
  response = { status_code: 0, gpt: { error_status: "", error_data: "", error_message: ""}, poem: { title: "", raw: "", final: "" } }

  response = await generatePoem(response)
  response = await getFinalPoemFromGPT(response)

  return callback(response)
}

async function generatePoem(response) {
  var dirname = path.join(__dirname, '..', '..', 'src', 'v3')
  var phrasesFile = dirname + '/phrases.json'
  var dictionaryFile = dirname + '/dictionary.json'

  phrases = await fs.readFile(phrasesFile, "utf8")
  phrases = JSON.parse(phrases)

  dictionary = await fs.readFile(dictionaryFile, "utf8")
  dictionary = compileDictionary(JSON.parse(dictionary))

  var lineCount = getNumberOfLines()
  var phraseToGet = ''

  var wordTypes = []

  for (var key in dictionary) {
    wordTypes.push(key)
  }

  response.poem.title = getLine("title", phrases, dictionary, wordTypes)

  rawPoem = []
  for (var i = 1; i <= lineCount; ++i) {
    if (i == 1) {
      phraseToGet = "beginning"
    } else if (i != lineCount) {
      phraseToGet = "middle"
    } else {
      phraseToGet = "end"
    }

    rawPoem.push(getLine(phraseToGet, phrases, dictionary, wordTypes))
  }

  response.poem.raw = rawPoem.join(' ')

  return response
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
  pronouns = [
    {
      "poemTarget" : "myself",
      "subjectivePronoun" : "I",
      "objectivePronoun" : "me",
      "possessivePronoun" : "my",
      "reflexivePronoun" : "myself",
      "verbEnding" : "",
      "toBeConjugation" : "am",
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
    // },{
      // them, plural
      // "poemTarget" : "them",
      // "subjectivePronoun" : "they",
      // "objectivePronoun" : "them",
      // "possessivePronoun" : "their",
      // "reflexivePronoun" : "theirselves",
      // "verbEnding" : "",
      // "toBeConjugation" : "are",
      // "toBePastConjugation" : "were",
      // "toDoConjugation" : "do",
      // "possessiveConjugation" : "have"
    }
  ]

  return pronouns[getRandomInt(pronouns.length)]
}

// weighted random number of lines for the poem
function getNumberOfLines() {
  let lineProb = Math.floor(Math.random() * 10) + 1;

  if (lineProb < 4) {
    return 3
  } else if (lineProb < 8) {
    return 4
  } else {
    return 5
  }
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

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max))
}

function getGptTemperature(){
  let lineProb = Math.floor(Math.random() * 10) + 1;

  if (lineProb < 4) {
    return 0.6
  } else if (lineProb < 8) {
    return 0.7
  } else {
    return 0.8
  }
}

async function getFinalPoemFromGPT(response) {
  try {
    const gptPrompt = `Acting as a poet, please improve the following short poem which is titled "${response.poem.title}", using no more than 6 lines, and providing a result which does not need to rhyme: "${response.poem.raw}"`
    response.gpt.prompt = gptPrompt

    const completion = await openai.createCompletion({
      model: "text-davinci-003",
      max_tokens: 1024,
      temperature: getGptTemperature(),
      prompt: gptPrompt,
    });
    response.status_code = 200
    response.gpt.status = 200
    response.poem.final = completion.data.choices[0].text
  } catch (error) {
    if (error.response) {
      response.gpt.error_status = error.response.status;
      response.gpt.error_data = error.response.data;
    } else {
      response.gpt.error_message = error.message;
    }
  }

  return response
}

module.exports.getPoetryResponse = getPoetryResponse;

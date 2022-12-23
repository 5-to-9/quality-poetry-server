var fs = require('fs').promises
var path = require('path')

const { Configuration, OpenAIApi } = require("openai");
const PHRASE_TITLE = 1;
const PHRASE_BEGINNING = 2;
const PHRASE_MIDDLE = 3;
const PHRASE_END = 4;

require('dotenv').config({ path: path.resolve(__dirname, '../../.env') })

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

async function getPoetryResponse(callback) {
  response = { status_code: 0, gpt: { error_status: "", error_data: "", error_message: ""}, poem: { title: "", raw: "", final: "" } }

  const currentDate = new Date();
  const timestamp = currentDate.getTime();

  response.timestamp = timestamp
  response = await generatePoem(response)
  response = await getFinalPoemFromGPT(response)
  await logOutput(response)

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

  response.poem.title = getLine(PHRASE_TITLE, phrases, dictionary, wordTypes)

  rawPoem = []
  for (var i = 1; i <= lineCount; ++i) {
    if (i == 1) {
      phraseToGet = PHRASE_BEGINNING
    } else if (i != lineCount) {
      phraseToGet = PHRASE_MIDDLE
    } else {
      phraseToGet = PHRASE_END
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

        line = line.replace(re, function() {
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
  var temperature = Math.floor(Math.random() * 100) * .01
  temperature = temperature.toFixed(2)
  temperature = parseFloat(temperature)
  return temperature
}

async function getFinalPoemFromGPT(response) {
  try {
    const gptPrompt = getGptPrompt(response)
    response.gpt.prompt = gptPrompt
    const gptTemp = getGptTemperature()

    const completion = await openai.createCompletion({
      model: "text-davinci-003",
      max_tokens: 1024,
      temperature: gptTemp,
      prompt: gptPrompt,
    });
    response.status_code = 200
    response.gpt.status = 200
    response.gpt.temperature = gptTemp
    response.poem.final = processFinalPoem(completion)
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

function getGptPrompt(response) {
  var poem = response.poem.raw
  var poemTitle = response.poem.title

  var gptRoleRandomInt = getRandomInt(3)
  var gptRole = ""
  
  if (gptRoleRandomInt < 2) {
    gptRole = "writer, please improve the spelling and grammar of"
  } else {
    gptRole = "poet, please improve"
  }

  var lineCountRandomInt = getRandomInt(5)
  var promptLineCount = ""

  if (lineCountRandomInt < 2) {
    promptLineCount = "using no more than 6 lines"
  } else if (lineCountRandomInt == 2) {
    promptLineCount = "using no more than 3 lines"
  } else if (lineCountRandomInt == 3) {
    promptLineCount = "using no more than 4 lines"
  } else {
    promptLineCount = "using no more than 5 lines"
  }

  promptTryNotToChange = ""
  if (getRandomInt(4) == 0) {
    promptTryNotToChange = "Try not to change it too much! "
  }
  
  var gptPrompt = `Acting as a ${gptRole} the following short poem ${promptLineCount}. ${promptTryNotToChange}` +
    `It is titled "${poemTitle}", and it goes: "${poem}"`

    return gptPrompt
}

function processFinalPoem(completion) {
  var finalPoem = ""

  finalPoem = completion.data.choices[0]
  finalPoem = finalPoem.text.toLowerCase()
  finalPoem = finalPoem.replace(/i /g, "I ")
  finalPoem = finalPoem.replace(/i'm /g, "I'm ")
  finalPoem = finalPoem.replace(/i've /g, "I've ")
  finalPoem = finalPoem.replace(/i'll /g, "I'll ")

  return finalPoem
}

async function logOutput(response) {
  var responseData = JSON.stringify(response);

  let date_ob = new Date();

  let filename = date_ob.getFullYear() + "-" +
    ("0" + (date_ob.getMonth() + 1)).slice(-2) + "-" +
    ("0" + date_ob.getDate()).slice(-2) + "-" +
    date_ob.getHours() + ":" +
    date_ob.getMinutes() + ":" +
    date_ob.getSeconds()


  // await fs.writeFile("./output/" + filename + ".txt", responseData);
  fs.writeFile("./output/" + filename + ".txt", responseData);
}

module.exports.getPoetryResponse = getPoetryResponse;

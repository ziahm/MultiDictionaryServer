var oxfordCrawler = require('../crawlers/oxford_crawler');
var longmanCrawler = require('../crawlers/ldoc_crawler');
var banglaCrawler = require('../crawlers/english_bangla_crawler');

var Word = require('../models/word');
var WordDefinition = require('../models/word_definition');


exports.definition = function(req, res) {

  var pluralize = req.app.get('pluralize');
  var search_word = req.params.word;

  /*var search_word = pluralize.singular(req.params.word);
  console.log('Route word: :' +  search_word);*/
  
  // Search word in db
  Word.findOne({name: search_word}).populate('word_definitions').exec()
   .then(function(word) {
    if(word) { // Found word in database

      WordDefinition.find({ _word: word._id }).exec()
      .then(function(word_definitions) {
        var responseObj = { word: word.name };

        word_definitions.forEach(function(word_definition){
          responseObj[word_definition.dictionary_type] = word_definition.definition;
        });

        console.log('Return from database');
        console.log(JSON.stringify(responseObj, null, 2));

        res.json(JSON.stringify(responseObj));
      });

    }
    else { // Searched word is not in database

      Promise.all([oxfordCrawler(req, search_word), longmanCrawler(req, search_word), banglaCrawler(req, search_word)])
      .then(function(dicWordResults) {

        var oxfordDicWord = dicWordResults[0];
        var longmanDicWord = dicWordResults[1];
        var banglaDicWord = dicWordResults[2];

        /*console.log('********** Oxford Meaning ***************');
        console.log(JSON.stringify(oxfordDicWord, null, 2));

        console.log('********** Longman Meaning ***************');
        console.log(JSON.stringify(longmanDicWord, null, 2));

        console.log('********** Bangla Meaning ***************');
        console.log(JSON.stringify(banglaDicWord, null, 2));*/

        if(!oxfordDicWord.word || !longmanDicWord.word) {
          throw 'no matching word';
        }
        
        responseObj = { word: search_word, oxford: oxfordDicWord, longman: longmanDicWord, bangla: banglaDicWord };
        
        return saveWordAndDictionariesDefinitions(responseObj)

      })
      .then(function(responseObj) { // Return the response
        console.log('Return from crawlers');
        res.json(JSON.stringify(responseObj));
      })
      .catch(function(reason) {
        res.json(null);
      })
    }
  });
}

async function saveWordAndDictionariesDefinitions(responseObj) {
  var word = new Word();
  word.name = responseObj.word;
  var savedWord = await word.save();

  await saveIndividualDefintion({word: savedWord, dictionary_type: 'oxford', responseObj: responseObj.oxford});
  await saveIndividualDefintion({word: savedWord, dictionary_type: 'longman', responseObj: responseObj.longman});
  await saveIndividualDefintion({word: savedWord, dictionary_type: 'bangla', responseObj: responseObj.bangla});

  return responseObj;
}

function saveIndividualDefintion(options) {
  var wordDefiniton = new WordDefinition({
    _word: options.word._id,    // assign the _id from the word
    dictionary_type: options.dictionary_type,
    definition: options.responseObj
  });
  return wordDefiniton.save();
}



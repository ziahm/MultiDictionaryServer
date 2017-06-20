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

        if(!oxfordDicWord.word || !longmanDicWord.word) {
          throw 'no matching word';
        }

        /*console.log('********** Oxford Meaning ***************');
        console.log(JSON.stringify(oxfordDicWord, null, 2));

        console.log('********** Longman Meaning ***************');
        console.log(JSON.stringify(longmanDicWord, null, 2));

        console.log('********** Bangla Meaning ***************');
        console.log(JSON.stringify(banglaDicWord, null, 2));*/


        var word = new Word();
        word.name = search_word;

        responseObj = { word: search_word, oxford: oxfordDicWord, longman: longmanDicWord, bangla: banglaDicWord };

        
        //console.log('Before saving')
        return Promise.all([responseObj, word.save()]) // save word in database
        //console.log('AFter saving')

      })
      .then(function(result) { // save oxford definition in database
        responseObj = result[0];
        word = result[1];

        var oxford = new WordDefinition({
          _word: word._id,    // assign the _id from the word
          dictionary_type: "oxford",
          definition: responseObj.oxford
          
        });
        return Promise.all([responseObj, word, oxford.save()]); 
      })
      .then(function(result) { // save longman definition in database
        responseObj = result[0];
        word = result[1];

        var longman = new WordDefinition({
          _word: word._id,    // assign the _id from the word
          dictionary_type: "longman",
          definition: responseObj.longman
        });
        return Promise.all([responseObj, word, longman.save()]); 
      })
      .then(function(result) { // save bangla definition in database
        responseObj = result[0];
        word = result[1];
        var bangla = new WordDefinition({
          _word: word._id,    // assign the _id from the word
          dictionary_type: "bangla",
          definition: responseObj.bangla
          
        });
        return Promise.all([responseObj, word, bangla.save()]); 
      })
      .then(function(result) { // Return the response
        console.log('Return from crawlers');
        responseObj = result[0];
        res.json(JSON.stringify(responseObj));
      })
      .catch(function(reason) {
        res.json(null);
      })
    }
  });
}



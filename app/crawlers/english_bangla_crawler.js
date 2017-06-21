var request = require('request');
var cheerio = require('cheerio');
var pluralize = require('pluralize');

var fs = require('fs');

module.exports = function(req, word) {
  return getMeaning(word);
}

async function getMeaning(word) {
  var parsedResult;

  parsedResult = await requestForMeaning(word);
  if(parsedResult.word) {
    return parsedResult;
  }

  var singularWord = pluralize.singular(word);
  parsedResult = await requestForMeaning(singularWord);

  return parsedResult;
}

function requestForMeaning(word) {
  var baseRequestUrl = "http://www.english-bangla.com/dictionary/";
  return new Promise(function(resolve, reject) {
    request(baseRequestUrl + word, function(error, response, body) {
      if(error) {
        reject(error);
      }

      console.log("Status code: " + response.statusCode);

      var $ = cheerio.load(body);
      var $meaningConainer = $('.word_info').first();
      var $wordInfo = $('.w_info', $meaningConainer);
      if($wordInfo.length > 0) {
        resolve(parseDicReponseBody(body));
      }
      else {
        resolve({})
      }

    });
  });
}

function parseDicReponseBody(body) {
  var dicWord = {};
  
  var $ = cheerio.load(body);

  var $meaningConainer = $('.word_info').first();
  var $wordInfo = $('.w_info', $meaningConainer);
  var meaningText;

  meaningText = $wordInfo.find('em').first().text();

  $('.format1', $wordInfo).each(function() {
    meaningText += $(this).text();
  })

  var meaningImage;
  var meaningImageTag = $('#middle_area_f .suggested .s_word img').first();
  if(meaningImageTag) {
    meaningImage = meaningImageTag.attr('src');
  }

  dicWord.meaningImage = meaningImage;
  dicWord.meaningText = meaningText.trim();

  /*console.log('*********** English Bangla **************');
  console.log(JSON.stringify(dicWord, null, 2));*/
  return dicWord;
}


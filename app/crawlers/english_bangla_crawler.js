var cheerio = require('cheerio');
var pluralize = require('pluralize');

var crawlerBase = require('./crawler_base');

module.exports = exports = function(req, word) {
  var getMeaning = crawlerBase(getCrawlerInstance.call({})) // Inject cralwer specific implmeneted methods
  return getMeaning(word);
}

function getCrawlerInstance() {
  this.type = 'Bangla Dictionary';
  this.baseRequestUrl = "http://www.english-bangla.com/dictionary/";

  // To return array of all the words variations
  this.wordVariations = function(word) {
    var singularWord = pluralize.singular(word);
    var variations = [
                        word, 
                        singularWord
                    ];
    return variations;
  }

  // To check whether word meaning found or not
  this.isWordFound = function(response, body) {
    var $ = cheerio.load(body);
    var $meaningConainer = $('.word_info').first();
    var $wordInfo = $('.w_info', $meaningConainer);
    return $wordInfo.length > 0;
  }

  // Parse the response body to generate word object
  this.parseDicReponseBody = function(body) {
    var dicWord = {};
    
    var $ = cheerio.load(body);

    var $meaningConainer = $('.word_info').first();
    var $wordInfo = $('.w_info', $meaningConainer);
    var meaningText;

    var word = $('.stl3', $wordInfo).first().text();

    meaningText = $wordInfo.find('em').first().text();

    $('.format1', $wordInfo).each(function() {
      meaningText += $(this).text();
    })

    var meaningImage;
    var meaningImageTag = $('#middle_area_f .suggested .s_word img').first();
    if(meaningImageTag) {
      meaningImage = meaningImageTag.attr('src');
    }

    dicWord.word = word;
    dicWord.meaningImage = meaningImage;
    dicWord.meaningText = meaningText.trim();

    /*console.log('*********** English Bangla **************');
    console.log(JSON.stringify(dicWord, null, 2));*/
    return dicWord;
  }

  return this;
}

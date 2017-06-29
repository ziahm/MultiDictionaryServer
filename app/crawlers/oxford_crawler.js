var cheerio = require('cheerio');
var pluralize = require('pluralize');

var crawlerBase = require('./crawler_base');

module.exports = exports = function(req, word) {
  var getMeaning = crawlerBase(getCrawlerInstance.call({})) // Inject cralwer specific implmeneted methods
  return getMeaning(word);
}

function getCrawlerInstance() {
  this.type = 'Oxford Dictionary';
  this.baseRequestUrl = "http://www.oxfordlearnersdictionaries.com/definition/english/";

  // To return array of all the words variations
  this.wordVariations = function(word) {
    var singularWord = pluralize.singular(word);
    var variations = [
                        word, 
                        word + '1', 
                        word + '_1', 
                        singularWord
                    ];
    return variations;
  }

  // To check whether word meaning found or not
  this.isWordFound = function(response, body) {
    return response.statusCode != '404';
  }

  // Parse the response body to generate word object
  this.parseDicReponseBody = function(body) {
    var dicWord = {};

    var $ = cheerio.load(body);
    var $mainContainer = $('#main-container');

    var has_meaning_group = false;
    var $meaning_sections = $('.sn-gs:not(.idm-gs .sn-gs)', $mainContainer);

    if($meaning_sections.length > 1) {
      has_meaning_group = true;
    }

    var word = $('h2.h', $mainContainer).first().text();
    var partsOfSpeech = $mainContainer.find('.pos').first().text();
    var phoneticSymbolBr = $(".pron-g[geo='br']", $mainContainer)
                            .first().find('.phon').first().clone().children(':not(.ptl)').remove().end().text();
    var phoneticSymbolNam = $(".pron-g[geo='n_am']", $mainContainer)
                            .first().find('.phon').first().clone().children(':not(.ptl)').remove().end().text();

    var soundBr = $(".pron-g[geo='br']", $mainContainer)
                            .first().find('.sound').first().attr('data-src-mp3')
    var soundNam = $(".pron-g[geo='n_am']", $mainContainer)
                            .first().find('.sound').first().attr('data-src-mp3')



    dicWord.word = word;
    dicWord.pos = partsOfSpeech;
    dicWord.phonetic_british = phoneticSymbolBr;
    dicWord.phonetic_american = phoneticSymbolNam;
    dicWord.pronunciation_sound_british = soundBr;
    dicWord.pronunciation_sound_american = soundNam;

    //console.log('Word: ' + word);
    //console.log('Part Of Speech: ' + partsOfSpeech);
    //console.log('Phonetic Symbole British: ' + phoneticSymbolBr);
    //console.log('Phonetic Symbole American: ' + phoneticSymbolNam);
    //console.log('Sound British: ' + soundBr);
    //console.log('Sound American: ' + soundNam);

    var definition_groups = [];

    if(has_meaning_group) {
      $meaning_sections.each(function() {
        $group = $(this);
        var group_name = $(this).find('.shcut').first().text();
        //console.log('Group Name: ' + group_name);
        //console.log('============');
        definition_groups.push({group_name: group_name, definitions: retrieveMeaningAndExample($group, $)})
      })
      dicWord.definition_groups = definition_groups;
    }
    else {
      dicWord.definitions = retrieveMeaningAndExample($mainContainer, $);
    }

    /*console.log('************ OxFord Dictionary *************');
    console.log(JSON.stringify(dicWord, null, 2));*/
    return dicWord;
    
  }

  return this;
}

function retrieveMeaningAndExample(context, $) {
  var definitionsExamples = [];
  $('.sn-g', context).each(function() {
    var grammer = $(this).find('.gram-g').first().text() // [transitive]
    var label = $(this).children('.label-g').first().text() // (formal)
    var use = $(this).find('.use').first().text(); // (not used in the progressive tenses)
    var definition = $(this).find('.def').first().text();

    //var definition_inline_usage_format_group_name = $(this).children('.cf').first().text();
    var definition_inline_usage_format_group_name;
    var word_usage_format_group_array = [];
    var word_usage_format_group;
    $(this).children('.cf').each(function() {
      word_usage_format_group_array.push($(this).text())
    })

    if(word_usage_format_group_array.length > 0) {
      definition_inline_usage_format_group_name = word_usage_format_group_array.join(' | ');
    }

    //console.log('Grammer ' + grammer)
    //console.log('Label ' + label)
    //console.log('Use ' + use)
    //console.log('Definition: ' + definition)

    //console.log('Examples:')
    //console.log('------------');
    //examples
    var has_usage_format_group = false;
    var examples = [];
    var example_usage_format_groups = [];
    var usage_format_group_name;
    if(definition_inline_usage_format_group_name) {
      usage_format_group_name = definition_inline_usage_format_group_name;
      has_usage_format_group = true;
    }

    $('.x-g:not(.collapse .x-g)', $(this)).each(function() {
      //<word_usage_format>take something (with you)</word_usage_format I forgot to take my bag with me when I got off the bus.
      var word_usage_format_group_array = [];
      var word_usage_format_group;
      $('.cf', $(this)).each(function() {
        word_usage_format_group_array.push($(this).text())
      })

      if(word_usage_format_group_array.length > 0) {
        word_usage_format_group = word_usage_format_group_array.join(' | ');
      }
      
      var word_example = $('.x', $(this)).text();
      var example_label = $('.label-g', $(this)).text();
      

      if(word_usage_format_group && has_usage_format_group) {
        example_usage_format_groups.push({format_group_name: usage_format_group_name, format_group_examples: examples})
        examples = [];
        usage_format_group_name = null;
        has_usage_format_group = false; 
      }

      if(word_example) {
        examples.push((example_label + ' ' + word_example).trim());
      }

      if(word_usage_format_group && !has_usage_format_group) {
        has_usage_format_group = true;
        usage_format_group_name = word_usage_format_group;
      }


      //console.log('Usage: ' + word_usage_format_group);
      //console.log('Example: ' + word_example);
    });


    var definitionsExamplesOrExampleUsageFormatGroup;
    var definitionExamples = {};

    definitionExamples.grammer = grammer;
    definitionExamples.label = label;
    definitionExamples.use = use;
    definitionExamples.definition = definition;
    

    if(usage_format_group_name && has_usage_format_group) {
      example_usage_format_groups.push({format_group_name: usage_format_group_name, format_group_examples: examples})
      examples = [];
    }

    if(!has_usage_format_group && examples.length > 0 && example_usage_format_groups.length == 0) {
      definitionExamples.definition_examples = examples;
    }
    else {
      definitionExamples.example_usage_format_groups = example_usage_format_groups ;
    }

    definitionsExamples.push(definitionExamples)
    
  });

  return definitionsExamples;
}


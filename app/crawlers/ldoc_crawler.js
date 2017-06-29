var cheerio = require('cheerio');
var pluralize = require('pluralize');

var crawlerBase = require('./crawler_base');

module.exports = exports = function(req, word) {
  var getMeaning = crawlerBase(getCrawlerInstance.call({})) // Inject cralwer specific implmeneted methods
  return getMeaning(word);
}

function getCrawlerInstance() {
  this.type = 'Longman Dictionary';
  this.baseRequestUrl = "http://www.ldoceonline.com/dictionary/";

  // To return array of all the words variations
  this.wordVariations = function(word) {
    var singularWord = pluralize.singular(word);
    var variations = [
                        word, 
                        word + '_2', 
                        singularWord
                    ];
    return variations;
  }

  // To check whether word meaning found or not
  this.isWordFound = function(response, body) {
    var $ = cheerio.load(body);
    var $mainContainer = $('.dictentry').first();
    return $mainContainer.length > 0;
  }

  // Parse the response body to generate word object
  this.parseDicReponseBody = function(body) {
    var dicWord = {};
    
    var $ = cheerio.load(body);
    var $mainContainer = $('.dictentry').first();

    var has_meaning_group = false;
    var $meaning_sections = $('.SIGNPOST', $mainContainer);

    if($meaning_sections.length > 0) {
      has_meaning_group = true;
    }

    var $wppRow = $(".Head", $mainContainer);
    var word = $('.HYPHENATION', $wppRow).first().text();
    var partsOfSpeech =  $('.POS', $wppRow).first().text();
    var phoneticSymbolBr = $(".PronCodes", $wppRow).first().find('.PRON').first().text();

    var soundBr = $(".speaker.brefile", $wppRow).first().attr('data-src-mp3')
    var soundNam = $(".speaker.amefile", $wppRow).first().attr('data-src-mp3')

    dicWord.word = word;
    dicWord.pos = partsOfSpeech;
    dicWord.phonetic_british = phoneticSymbolBr;
    dicWord.phonetic_american = null;
    dicWord.pronunciation_sound_british = soundBr;
    dicWord.pronunciation_sound_american = soundNam;

    //console.log('Word: ' + word);
    //console.log('Part Of Speech: ' + partsOfSpeech);
    //console.log('Phonetic Symbole British: ' + phoneticSymbolBr);
    //console.log('Phonetic Symbole American: ' + phoneticSymbolNam);
    //console.log('Sound British: ' + soundBr);
    //console.log('Sound American: ' + soundNam);

    if(has_meaning_group) {
      var definition_groups = [];

      $meaning_sections.each(function() {
        var $group = $(this);
        var group_name = $(this).text();
        //console.log('Group Name: ' + group_name);
        //console.log('============');
        var $groupWrapper = $(this).closest('.Sense');

        var definitionsExamples = [];

        // Has multiple meaning under each group
        if($('.Subsense', $groupWrapper).length > 0) {
          

          $('.Subsense', $groupWrapper).each(function() {

            var definitionExamples = {};

            var label = $('.REGISTERLAB', $(this)).first().text();
            var grammer = $('.GRAM', $(this)).first().text();
            var definition = $('.DEF', $(this)).first().text().trim();
            

            //console.log('Grammer ' + grammer);
            //console.log('Definition: ' + definition);

            var without_usage_group_examples = [];

            $('.EXAMPLE:not(.GramExa .EXAMPLE):not(.ColloExa .EXAMPLE):not(.GramBox .EXAMPLE)', $(this)).each(function() {
              var example_sound = $(this).find('.speaker').first().attr('data-src-mp3');
              var word_example = $(this).clone().children().remove('.speaker').end().text();

              without_usage_group_examples.push(word_example);

              //console.log('Example Sound ' + example_sound);
              //console.log('Example Sentence ' + word_example);
            });



            var example_usage_format_groups = [];
            if($('.GramExa', $(this)).length > 0) {
              //examples Groups
              $('.GramExa', $(this)).each(function() {
                var word_usage_format_group_name = $('.PROPFORMPREP', $(this)).first().text();

                //console.log('Word Usage Format Group ' + word_usage_format_group_name);

                //examples
                var examples = [];
                $('.EXAMPLE', $(this)).each(function() {
                  var example_sound = $(this).find('.speaker').first().attr('data-src-mp3');
                  var word_example = $(this).clone().children().remove('.speaker').end().text();

                  examples.push(word_example);

                  //console.log('Example Sound ' + example_sound);
                  //console.log('Example Sentence ' + word_example);
                });

                example_usage_format_groups.push({format_group_name: word_usage_format_group_name, format_group_examples: examples})
              });
            }


            //examples Groups
          if($('.ColloExa', $(this)).length > 0) {
            $('.ColloExa', $groupWrapper).each(function() {
              var word_usage_format_group_name = $('.COLLO', $(this)).first().text();
              //console.log('Word Usage Format Group ' + word_usage_format_group_name);

              //examples
              var examples = [];
              $('.EXAMPLE', $(this)).each(function() {
                var example_sound = $(this).find('.speaker').first().attr('data-src-mp3');
                var word_example = $(this).clone().children().remove('.speaker').end().text();

                examples.push(word_example);

                //console.log('Example Sound ' + example_sound);
                //console.log('Example Sentence ' + word_example);
              });

              example_usage_format_groups.push({format_group_name: word_usage_format_group_name, format_group_examples: examples})

            });
          }

            definitionExamples.grammer = grammer;
            definitionExamples.label = label;
            //definitionExamples.use = use;
            definitionExamples.definition = definition;

            if(example_usage_format_groups.length > 0) {
              definitionExamples.example_usage_format_groups = example_usage_format_groups ;
            }

            if(without_usage_group_examples.length > 0) {
              definitionExamples.definition_examples = without_usage_group_examples;
            }

            definitionsExamples.push(definitionExamples);
            

          });
        }
        else { // Has Only one meaning under each group
          var label = $('.REGISTERLAB', $groupWrapper).first().text();
          var grammer = $('.GRAM', $groupWrapper).first().text();
          var definition = $('.DEF', $groupWrapper).first().text().trim();
          

          //console.log('Grammer ' + grammer);
          //console.log('Definition: ' + definition);

          var without_usage_group_examples = [];

          $('.EXAMPLE:not(.GramExa .EXAMPLE):not(.ColloExa .EXAMPLE):not(.GramBox .EXAMPLE)', $groupWrapper).each(function() {
            var example_sound = $(this).find('.speaker').first().attr('data-src-mp3');
            var word_example = $(this).clone().children().remove('.speaker').end().text();

             without_usage_group_examples.push(word_example);

            //console.log('Example Sound ' + example_sound);
            //console.log('Example Sentence ' + word_example);
          })

          //examples Groups
          var example_usage_format_groups = [];
          if($('.GramExa', $groupWrapper).length > 0) {
            $('.GramExa', $groupWrapper).each(function() {
              var word_usage_format_group_name = $('.PROPFORM', $(this)).first().text();
              //console.log('Word Usage Format Group ' + word_usage_format_group_name);
              //examples
              var examples = [];
              $('.EXAMPLE', $(this)).each(function() {
                var example_sound = $(this).find('.speaker').first().attr('data-src-mp3');
                var word_example = $(this).clone().children().remove('.speaker').end().text();

                examples.push(word_example);

                //console.log('Example Sound ' + example_sound);
                //console.log('Example Sentence ' + word_example);
              });

              example_usage_format_groups.push({format_group_name: word_usage_format_group_name, format_group_examples: examples})
            });
          }

          //examples Groups
          if($('.ColloExa', $groupWrapper).length > 0) {
            $('.ColloExa', $groupWrapper).each(function() {
              var word_usage_format_group_name = $('.COLLO', $(this)).first().text();
              //console.log('Word Usage Format Group ' + word_usage_format_group_name);

              //examples
              var examples = [];
              $('.EXAMPLE', $(this)).each(function() {
                var example_sound = $(this).find('.speaker').first().attr('data-src-mp3');
                var word_example = $(this).clone().children().remove('.speaker').end().text();

                examples.push(word_example);

                //console.log('Example Sound ' + example_sound);
                //console.log('Example Sentence ' + word_example);
              });

              example_usage_format_groups.push({format_group_name: word_usage_format_group_name, format_group_examples: examples})

            });
          }

          var definitionExamples = {};

          definitionExamples.grammer = grammer;
          definitionExamples.label = label;
          //definitionExamples.use = use;
          definitionExamples.definition = definition;

          if(example_usage_format_groups.length > 0) {
            definitionExamples.example_usage_format_groups = example_usage_format_groups ;
          }

          if(without_usage_group_examples.length > 0) {
            definitionExamples.definition_examples = without_usage_group_examples;
          }

          definitionsExamples.push(definitionExamples);
        }
        definition_groups.push({group_name: group_name, definitions: definitionsExamples});
      });

      dicWord.definition_groups = definition_groups;
    }
    else {
      var definitionsExamples = [];
      $('.Sense', $mainContainer).each(function() {
        var label = $('.REGISTERLAB', $(this)).first().text();
        var grammer = $('.GRAM', $(this)).first().text();
        var definition = $('.DEF', $(this)).first().text().trim();
        //console.log('Label ' + label);
        //console.log('Grammer ' + grammer);
        //console.log('Definition ' + definition);

        var without_usage_group_examples = [];

        $('.EXAMPLE:not(.GramExa .EXAMPLE)', $(this)).each(function() {
          var example_sound = $(this).find('.speaker').first().attr('data-src-mp3');
          var word_example = $(this).clone().children().remove('.speaker').end().text();

          without_usage_group_examples.push(word_example);

          //console.log('Example Sound ' + example_sound);
          //console.log('Example Sentence ' + word_example);
        })

        var example_usage_format_groups = [];
        if($('.GramExa', $(this)).length > 0) {
          //examples Groups
          $('.GramExa', $(this)).each(function() {
            var word_usage_format_group_name = $('.PROPFORM', $(this)).first().text();
            //console.log('Word Usage Format Group ' + word_usage_format_group_name);
            //examples
             var examples = [];
            $('.EXAMPLE', $(this)).each(function() {
              var example_sound = $(this).find('.speaker').first().attr('data-src-mp3');
              var word_example = $(this).clone().children().remove('.speaker').end().text();

              examples.push(word_example);

              //console.log('Example Sound ' + example_sound);
              //console.log('Example Sentence ' + word_example);
            });
            example_usage_format_groups.push({format_group_name: word_usage_format_group_name, format_group_examples: examples})
          });
        }


        var definitionExamples= {};
        definitionExamples.grammer = grammer;
        definitionExamples.label = label;
        //definitionExamples.use = use;
        definitionExamples.definition = definition;

        if(example_usage_format_groups.length > 0) {
          definitionExamples.example_usage_format_groups = example_usage_format_groups ;
        }

        if(without_usage_group_examples.length > 0) {
          definitionExamples.definition_examples = without_usage_group_examples;
        }

        definitionsExamples.push(definitionExamples);

      })

      dicWord.definitions = definitionsExamples;
    }

    /*console.log('********* LDoc ****************');
    console.log(JSON.stringify(dicWord, null, 2));*/

    return dicWord;
  }

  return this;
}


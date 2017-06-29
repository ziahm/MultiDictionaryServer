var request = require('request');

module.exports = function(crawlerInstance) {

  return async function(word) {
    var parsedResult = {};

    var gWordPromise = generateWordVariations(word);

    for(var wordPromise of gWordPromise) {
      parsedResult = await wordPromise;
      if(parsedResult.word) {
        return parsedResult;
      }
    }
    return parsedResult;
  }

  function* generateWordVariations(word) {
    var variations = crawlerInstance.wordVariations(word);

    for(var w = 0; w < variations.length; w++) {
      yield requestForMeaning(variations[w]);
    }
  }

  function requestForMeaning(word) {
    return new Promise(function(resolve, reject) {
      request(crawlerInstance.baseRequestUrl + word, function(error, response, body) {
        if(error) {
          reject(error);
        }

        console.log('Word version: ' + word);
        console.log("Status code for " + crawlerInstance.type + ": " + response.statusCode);

        if(crawlerInstance.isWordFound(response, body)) {
          var parsedDicWord = crawlerInstance.parseDicReponseBody(body);
          resolve(parsedDicWord);
        }
        else {
          resolve({})
        }

      });
    });
  }
}

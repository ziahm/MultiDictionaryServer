var home = require('../app/controllers/home');
var word = require('../app/controllers/word');

//you can include all your controllers

module.exports = function (app) {
    app.get('/', home.home);//home
    app.get('/home', home.home);//home
    app.get('/words/:word', word.definition);

}

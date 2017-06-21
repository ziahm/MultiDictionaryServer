var express = require('express');
var exphbs  = require('express-handlebars');

var app = express();
var multer = require('multer')
var constants = require('constants');


var port = process.env.PORT || 8042;
var mongoose = require('mongoose');
var flash = require('connect-flash');
var path = require('path');

var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var bodyParser = require('body-parser');
var dateFormat = require('dateformat');
var now = new Date();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));


/***************Mongodb configuratrion********************/
var mongoose = require('mongoose');
var configDB = require('./config/database.js');

// Set mongoose.Promise to any Promise implementation
mongoose.Promise = Promise; 

//configuration ===============================================================
mongoose.connect(configDB.url); // connect to our database

//set up our express application
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
//app.use(bodyParser()); // get information from html forms

//view engine setup
app.use(express.static(path.join(__dirname, 'public')));
/*app.set('views', path.join(__dirname, 'app/views'));
app.set('view engine', 'ejs');*/
/*app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'app/views'));*/


var handlebars = require('express-handlebars').create({
  layoutsDir: path.join(__dirname, "app/views/layouts"),
  partialsDir: path.join(__dirname, "app/views/partials"),
  defaultLayout: 'main'
});

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, "app/views"));


//app.set('pluralize', pluralize);

app.use(session({
    secret: 'cefalo school',
    resave: true,
    saveUninitialized: true
}));

app.use(flash()); // use connect-flash for flash messages stored in session

// routes ======================================================================
require('./config/routes.js')(app); // load our routes and pass in our app


//launch ======================================================================
app.listen(port);
console.log('The magic happens on port ' + port);

//catch 404 and forward to error handler
app.use(function (req, res, next) {
    res.status(404).render('404', {title: "Sorry, page not found", session: req.sessionbo});
});

app.use(function (req, res, next) {
    res.status(500).render('404', {title: "Sorry, page not found"});
});
exports = module.exports = app;

// nodemon app.js
// global npm
// npm install -g nodemon
// npm install express-mvc-generator -g 
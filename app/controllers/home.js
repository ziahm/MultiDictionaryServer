var numeral = require('numeral');
var bcrypt = require('bcrypt-nodejs');
var dateFormat = require('dateformat');

exports.loggedIn = function(req, res, next)
{
	if (req.session.user) { // req.session.passport._id

		next();

	} else {
		//res.redirect('/login');
		next();

	}

}

exports.home = function(req, res) {
	res.render('pages/home', {
		error : req.flash("error"),
		success: req.flash("success"),
		session: req.session,
	
	 });
}


exports.signup = function(req, res) {
	if (req.session.user) {

		res.redirect('/home');

	} else {
		res.render('users/signup', {
			error : req.flash("error"),
			success: req.flash("success"),
			session:req.session
		});
	}

}


exports.login = function(req, res) {


	
	if (req.session.user) {

		res.redirect('/home');

	} else {

		res.render('users/login', {
			error : req.flash("error"),
			success: req.flash("success"),
			session:req.session
		});

	}
	
}

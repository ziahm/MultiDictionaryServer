var numeral = require('numeral');
var bcrypt = require('bcrypt-nodejs');
var dateFormat = require('dateformat');


exports.home = function(req, res) {
	res.render('pages/home', {
		error : req.flash("error"),
		success: req.flash("success"),
		session: req.session,
	
	 });
}

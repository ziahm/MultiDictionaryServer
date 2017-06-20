exports.home = function(req, res) {
	res.render('pages/home', {
		error : req.flash("error"),
		success: req.flash("success"),
		session: req.session,
	 });
}

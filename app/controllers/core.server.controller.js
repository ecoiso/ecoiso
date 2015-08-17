'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	Company = mongoose.model('Company'),
	chalk = require('chalk');

exports.index = function(req, res) {

	if(!req.user){
		var originalUrl = req.originalUrl.substring(1);
		if(originalUrl.length > 0 ) {
			if(originalUrl == 'administrator'){
				res.render('index', {
					user: req.user || null,
					request: req
				});
			}else{
				Company.find({"shortName":originalUrl}).exec(function(err, company) {
					if (err) return console.log(err);
					if( company.length == 0) res.render('./home/index');
					else {
						req.companyShortName = originalUrl;
						res.render('index', {
							user: req.user || null,
							companyShortName: req.companyShortName || null,
							request: req
						});
					}
				});
			}
		}else{
			res.render('./home/index');
		}
	}else{
		console.log(req.companyShortName);
		res.render('index', {
			user: req.user || null,
			request: req
		});
	}
};
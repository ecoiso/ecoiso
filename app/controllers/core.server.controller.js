'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	Company = mongoose.model('Company'),
	chalk = require('chalk');
exports.index = function(req, res) {
	if (req.user) {
			res.render('index', {
				user: req.user || null,
				request: req
			});
	} else {
		var originalUrl = req.originalUrl.substring(1);
		if(originalUrl.length > 0 ){
			if(originalUrl != "administrator"){
				Company.find({shortName : originalUrl},function(err,company){
					if (err) {
						res.render('./home/index');
					} else {
						if( company.length == 0){
							res.render('./home/index');
						}else{
							var client = mongoose.createConnection('mongodb://localhost/'+company[0].nameDB);
							client.on('connected', function() {
								console.log('db '+company[0].nameDB+' connected');
							});
							req.sessionStore.db.databaseName = company[0].nameDB;
							res.render('index', {
								user: req.user || null,
								request: req
							});
						}

					}
				});
			}else{
				req.sessionStore.db.databaseName = 'ecoiso-dev';
				res.render('index', {
					user: req.user || null,
					request: req
				});
			}

		}else{
			res.render('./home/index');
		}

	}


};
'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	chalk = require('chalk');
exports.index = function(req, res) {
	//console.log(req.sessionStore.db.databaseName);
	var originalUrl = req.originalUrl.substring(1);
	//console.log(originalUrl);
	// Bootstrap db connection
	if(originalUrl.length >0){
		var client = mongoose.createConnection('mongodb://localhost/ecoiso-3002');
		client.on('connected', function() {
			console.log('db ecoiso-3002 connected');
		});
		// Init the express application
		//var app = require('./express')(db);
		// Expose app
		//exports = module.exports = app;
		req.sessionStore.db.databaseName = 'ecoiso-3002';
		//console.log(req.sessionStore);
		res.render('index', {
			user: req.user || null,
			request: req
		});
	}else{
		res.render('./home/index');
	}

};
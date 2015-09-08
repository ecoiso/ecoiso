'use strict';
/**
 * Module dependencies.
 */
var init = require('./config/init')(),
	config = require('./config/config'),
	mongoose = require('mongoose'),
	chalk = require('chalk');

/**
 * Main application entry file.
 * Please note that the order of loading is important.
 */
// Bootstrap db connection
var db = mongoose.connect(config.db, function(err) {
	if (err) {
		//console.error(chalk.red('Could not connect to MongoDB !'));
		//console.log(chalk.red(err));
	}
});
var cluster = require('cluster');

if(cluster.isMaster) {
	var numWorkers = require('os').cpus().length;
	//console.log('Master cluster setting up ' + numWorkers + ' workers...');

	for(var i = 0; i < numWorkers; i++) {
		cluster.fork();
	}
	cluster.on('online', function(worker) {
		//console.log('Worker ' + worker.process.pid + ' is online');
	});
	cluster.on('exit', function(worker, code, signal) {
		//console.log('Worker ' + worker.process.pid + ' died with code: ' + code + ', and signal: ' + signal);
		//console.log('Starting a new worker');
		cluster.fork();
	});
} else {
	var app = require('express')();
	var server = app.listen(8000, function() {
		//console.log('Process ' + process.pid + ' is listening to all incoming requests');
	});
	// Init the express application
	var app = require('./config/express')(db);
	// Bootstrap passport config
	require('./config/passport')();
	// Start the app by listening on <port>
	//config.port = 80;
	app.listen(config.port);
	// Expose app
	exports = module.exports = app;
	// Logging initialization
	//console.log('MEAN.JS application started on port ' + config.port);
}

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
		console.error(chalk.red('Could not connect to MongoDB !'));
		console.log(chalk.red(err));
	}
});
// Init the express application
var app = require('./config/express')(db);
// Bootstrap passport config
require('./config/passport')();
// Start the app by listening on <port>
app.listen(config.port);
//app.listen(8181);
// Expose app
exports = module.exports = app;
// Logging initialization
console.log('MEAN.JS application 1 started on port ' + config.port);

//Create multiple mongoDB :))
/*var module2 = {};
module2.exports = {
	db: 'mongodb://localhost/ecoiso-3002',
	app: {
		title: 'EcoISO 2 - Phần mềm ban hành và quản trị tài liệu theo tiêu chuẩn ISO '
	},
	facebook: {
		clientID: process.env.FACEBOOK_ID || 'APP_ID',
		clientSecret: process.env.FACEBOOK_SECRET || 'APP_SECRET',
		callbackURL: '/auth/facebook/callback'
	},
	twitter: {
		clientID: process.env.TWITTER_KEY || 'CONSUMER_KEY',
		clientSecret: process.env.TWITTER_SECRET || 'CONSUMER_SECRET',
		callbackURL: '/auth/twitter/callback'
	},
	google: {
		clientID: process.env.GOOGLE_ID || 'APP_ID',
		clientSecret: process.env.GOOGLE_SECRET || 'APP_SECRET',
		callbackURL: '/auth/google/callback'
	},
	linkedin: {
		clientID: process.env.LINKEDIN_ID || 'APP_ID',
		clientSecret: process.env.LINKEDIN_SECRET || 'APP_SECRET',
		callbackURL: '/auth/linkedin/callback'
	},
	github: {
		clientID: process.env.GITHUB_ID || 'APP_ID',
		clientSecret: process.env.GITHUB_SECRET || 'APP_SECRET',
		callbackURL: '/auth/github/callback'
	},
	mailer: {
		from: process.env.MAILER_FROM || 'MAILER_FROM',
		options: {
			service: process.env.MAILER_SERVICE_PROVIDER || 'MAILER_SERVICE_PROVIDER',
			auth: {
				user: process.env.MAILER_EMAIL_ID || 'MAILER_EMAIL_ID',
				pass: process.env.MAILER_PASSWORD || 'MAILER_PASSWORD'
			}
		}
	}
};*/

// Bootstrap db connection
/*var mongodb2 = mongoose.connect('mongodb://localhost/ecoiso-3002', function(err) {
	if (err) {
		console.error(chalk.red('Could not connect to MongoDB 2!'));
		console.log(chalk.red(err));
		//CREATE MONGODB
		mongoose.createConnection('mongodb://localhost/ecoiso-3002');
		var mongodb2 = mongoose.connection;
		mongodb2.on('error', console.error.bind(console, 'connection error:'));
		mongodb2.once('open', function callback() {
			console.log('db ecoiso-3002 connection open');
		});
	}
});*/
// Init the express application
//var app2 = require('./config/express')(mongodb2);

// Start the app by listening on <port>
//require('./config/passport')();
//app2.listen(8181);
//app.listen(8181);
//module.exports.db = 'mongodb://localhost/ecoiso-3002';
// Expose app
/*if(port == "8181"){
	exports = module2.exports = app2;
}
if(port == config.port){
	exports = module.exports = app;
}*/



// Logging initialization
//console.log(exports);

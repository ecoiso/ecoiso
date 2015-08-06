'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users.server.controller');
	var means = require('../../app/controllers/means.server.controller');

	// Means Routes
	app.route('/means')
		.get(means.list)
		.post(users.requiresLogin, means.create);

	app.route('/means/:meanId')
		.get(means.read)
		.put(users.requiresLogin, means.hasAuthorization, means.update)
		.delete(users.requiresLogin, means.hasAuthorization, means.delete);

	// Finish by binding the Mean middleware
	app.param('meanId', means.meanByID);
};

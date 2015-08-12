'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users.server.controller');
	var standards = require('../../app/controllers/standards.server.controller');

	// Standards Routes
	app.route('/standards')
		.get(standards.list)
		.post(users.requiresLogin, standards.create);

	app.route('/standards/:standardId')
		.get(standards.read)
		.put(users.requiresLogin, standards.hasAuthorization, standards.update)
		.delete(users.requiresLogin, standards.hasAuthorization, standards.delete);

	// Finish by binding the Standard middleware
	app.param('standardId', standards.standardByID);
};

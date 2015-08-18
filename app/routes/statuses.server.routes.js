'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users.server.controller');
	var statuses = require('../../app/controllers/statuses.server.controller');

	// Statuses Routes
	app.route('/statuses')
		.get(statuses.list)
		.post(users.requiresLogin, statuses.create);

	app.route('/statuses/:statusId')
		.get(statuses.read)
		.put(users.requiresLogin, statuses.hasAuthorization, statuses.update)
		.delete(users.requiresLogin, statuses.hasAuthorization, statuses.delete);

	// Finish by binding the Status middleware
	app.param('statusId', statuses.statusByID);
};

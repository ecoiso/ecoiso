'use strict';

module.exports = function(app) {
	// Root routing
	var core = require('../../app/controllers/core.server.controller');
	app.route('/').get(core.index);
	app.route('/:companyShortName').get(core.index);
	app.param('companyShortName', core.index);
};
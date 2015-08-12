'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users.server.controller');
	var profiles = require('../../app/controllers/profiles.server.controller');

	// Profiles Routes
	app.route('/profiles')
		.get(profiles.list)
		.post(users.requiresLogin, profiles.create);

	app.route('/profiles/:profileId')
		.get(profiles.read)
		.put(users.requiresLogin, profiles.hasAuthorization, profiles.update)
		.delete(users.requiresLogin, profiles.hasAuthorization, profiles.delete);

	// Finish by binding the Profile middleware
	app.param('profileId', profiles.profileByID);

    app.route('/profilesProcess/:processId').get(profiles.profilesProcess);

    //app.route('listProfiles').get(profiles.listProfiles);

    app.route('/folder/rootProfile').get(profiles.rootProfile);

    app.route('/childProfile/:profileId').get(profiles.childProfile);
    app.route('/documentChildProfile/:profileId').get(profiles.documentChildProfile);

    app.route('/folder/uploadProfile').post(profiles.uploadProfile);

    app.route('/folder/saveViewerProfile').post(profiles.saveViewerProfile);




};

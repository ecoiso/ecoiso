'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users.server.controller');
	var processes = require('../../app/controllers/processes.server.controller');

	// Processes Routes
	app.route('/processes')
		.get(processes.list)
		.post(users.requiresLogin, processes.create);

	app.route('/processes/:processId')
		.get(processes.read)
		.put(users.requiresLogin, processes.hasAuthorization, processes.update)
		.delete(users.requiresLogin, processes.hasAuthorization, processes.delete);

	// Finish by binding the Process middleware
	app.param('processId', processes.processByID);
    //list drafts
    app.route('/process/listDraft').get(processes.listDraft);
    //list waitings
    app.route('/process/listWaitingPublish').get(processes.listWaitingPublish);
    //list publish
    app.route('/process/listPublish').get(processes.listPublish);
    //upload model files
    app.route('/upload/uploadModel').post(processes.uploadModel);
    //upload process files
    app.route('/upload/uploadProcess').post(processes.uploadProcess);

    app.route('/process/requirePublic').post(processes.requirePublic);
    app.route('/process/denyPublic').post(processes.denyPublic);
    app.route('/process/acceptPublic').post(processes.acceptPublic);
    app.route('/process/searchGlobal').post(processes.searchGlobal);




};

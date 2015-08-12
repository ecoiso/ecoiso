'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users.server.controller');
	var documents = require('../../app/controllers/documents.server.controller');

	// Documents Routes
	app.route('/documents')
		.get(documents.list)
		.post(users.requiresLogin, documents.create);

	app.route('/documents/:documentId')
		.get(documents.read)
		.put(users.requiresLogin, documents.hasAuthorization, documents.update)
		.delete(users.requiresLogin, documents.hasAuthorization, documents.delete);

	// Finish by binding the Document middleware
	app.param('documentId', documents.documentByID);

    app.route('/documentProcess/:processId').get(documents.documentProcess);
    app.route('/documentModel/:processId').get(documents.documentModel);

    app.route('/removeDocumentProcess/:processId').get(documents.removeDocumentProcess);
    app.route('/removeDocumentModel/:processId').get(documents.removeDocumentModel);

    app.route('/documents/downloadDocument').post(documents.downloadDocument);
    app.route('/documents/updateNewVersion').post(documents.updateNewVersion);
    app.route('/documents/documentUpdateVersion').post(documents.documentUpdateVersion);
    app.route('/documents/createImageThumb').post(documents.createImageThumb);

    //app.route('/removeDocument').post(documents.removeDocument);
};

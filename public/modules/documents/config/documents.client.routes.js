'use strict';

//Setting up route
angular.module('documents').config(['$stateProvider',
	function($stateProvider) {
		// Documents state routing
		$stateProvider.
		state('listDocuments', {
			url: '/documents',
			templateUrl: 'modules/documents/views/list-documents.client.view.html'
		}).
		state('createDocument', {
			url: '/documents/create',
			templateUrl: 'modules/documents/views/create-document.client.view.html'
		}).
		state('viewDocument', {
			url: '/documents/:documentId',
			templateUrl: 'modules/documents/views/view-document.client.view.html'
		}).
		state('editDocument', {
			url: '/documents/:documentId/edit',
			templateUrl: 'modules/documents/views/edit-document.client.view.html'
		});
	}
]);
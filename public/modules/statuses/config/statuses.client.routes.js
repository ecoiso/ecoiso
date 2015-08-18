'use strict';

//Setting up route
angular.module('statuses').config(['$stateProvider',
	function($stateProvider) {
		// Statuses state routing
		$stateProvider.
		state('listStatuses', {
			url: '/statuses',
			templateUrl: 'modules/statuses/views/list-statuses.client.view.html'
		}).
		state('createStatus', {
			url: '/statuses/create',
			templateUrl: 'modules/statuses/views/create-status.client.view.html'
		}).
		state('viewStatus', {
			url: '/statuses/:statusId',
			templateUrl: 'modules/statuses/views/view-status.client.view.html'
		}).
		state('editStatus', {
			url: '/statuses/:statusId/edit',
			templateUrl: 'modules/statuses/views/edit-status.client.view.html'
		});
	}
]);
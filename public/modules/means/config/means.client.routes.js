'use strict';

//Setting up route
angular.module('means').config(['$stateProvider',
	function($stateProvider) {
		// Means state routing
		$stateProvider.
		state('listMeans', {
			url: '/means',
			templateUrl: 'modules/means/views/list-means.client.view.html'
		}).
		state('createMean', {
			url: '/means/create',
			templateUrl: 'modules/means/views/create-mean.client.view.html'
		}).
		state('viewMean', {
			url: '/means/:meanId',
			templateUrl: 'modules/means/views/view-mean.client.view.html'
		}).
		state('editMean', {
			url: '/means/:meanId/edit',
			templateUrl: 'modules/means/views/edit-mean.client.view.html'
		});
	}
]);
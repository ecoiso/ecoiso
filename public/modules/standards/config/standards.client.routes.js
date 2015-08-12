'use strict';

//Setting up route
angular.module('standards').config(['$stateProvider',
	function($stateProvider) {
		// Standards state routing
		$stateProvider.
		state('listStandards', {
			url: '/standards',
			templateUrl: 'modules/standards/views/list-standards.client.view.html'
		}).
		state('createStandard', {
			url: '/standards/create',
			templateUrl: 'modules/standards/views/create-standard.client.view.html'
		}).
		state('viewStandard', {
			url: '/standards/:standardId',
			templateUrl: 'modules/standards/views/view-standard.client.view.html'
		}).
		state('editStandard', {
			url: '/standards/:standardId/edit',
			templateUrl: 'modules/standards/views/edit-standard.client.view.html'
		});
	}
]);
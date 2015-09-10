'use strict';

//Setting up route
angular.module('profiles').config(['$stateProvider',
	function($stateProvider) {
		// Profiles state routing
		$stateProvider.
		state('listProfiles', {
			url: '/profiles',
			templateUrl: 'modules/profiles/views/list-profiles.client.view.html'
		}).
		state('createProfile', {
			url: '/profiles/create',
			templateUrl: 'modules/profiles/views/create-profile.client.view.html'
		}).
		state('viewProfile', {
			url: '/profiles/:profileId',
			templateUrl: 'modules/profiles/views/view-profile.client.view.html'
		}).
		state('editProfile', {
			url: '/profiles/:profileId/edit',
			templateUrl: 'modules/profiles/views/edit-profile.client.view.html'
		}).
        state('listProfiles-lv0', {
            url: '/listProfiles-lv0',
            templateUrl: 'modules/profiles/views/profiles-lv0.client.view.html'
        });
	}
]);
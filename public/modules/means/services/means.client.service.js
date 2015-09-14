'use strict';

//Means service used to communicate Means REST endpoints
angular.module('means').factory('Means', ['$resource',
	function($resource) {
		return $resource('means/:meanId', { meanId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);
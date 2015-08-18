'use strict';

//Statuses service used to communicate Statuses REST endpoints
angular.module('statuses').factory('Statuses', ['$resource',
	function($resource) {
		return $resource('statuses/:statusId', { statusId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);
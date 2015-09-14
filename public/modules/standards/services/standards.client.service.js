'use strict';

//Standards service used to communicate Standards REST endpoints
angular.module('standards').factory('Standards', ['$resource',
	function($resource) {
		return $resource('standards/:standardId', { standardId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}

		});
	}
]);
'use strict';

// Statuses controller
angular.module('statuses').controller('StatusesController', ['$scope', '$stateParams', '$location', 'Authentication', 'Statuses',
	function($scope, $stateParams, $location, Authentication, Statuses) {
		$scope.authentication = Authentication;

		// Create new Status
		$scope.create = function() {
			// Create new Status object
			var status = new Statuses ({
				name: this.name
			});

			// Redirect after save
			status.$save(function(response) {
				$location.path('statuses/' + response._id);

				// Clear form fields
				$scope.name = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Remove existing Status
		$scope.remove = function(status) {
			if ( status ) { 
				status.$remove();

				for (var i in $scope.statuses) {
					if ($scope.statuses [i] === status) {
						$scope.statuses.splice(i, 1);
					}
				}
			} else {
				$scope.status.$remove(function() {
					$location.path('statuses');
				});
			}
		};

		// Update existing Status
		$scope.update = function() {
			var status = $scope.status;

			status.$update(function() {
				$location.path('statuses/' + status._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Find a list of Statuses
		$scope.find = function() {
			$scope.statuses = Statuses.query();
		};

		// Find existing Status
		$scope.findOne = function() {
			$scope.status = Statuses.get({ 
				statusId: $stateParams.statusId
			});
		};
	}
]);
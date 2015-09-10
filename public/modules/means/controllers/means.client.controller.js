'use strict';

// Means controller
angular.module('means').controller('MeansController', ['$scope', '$stateParams', '$location', 'Authentication', 'Means',
	function($scope, $stateParams, $location, Authentication, Means) {
		$scope.authentication = Authentication;

		// Create new Mean
		$scope.create = function() {
			// Create new Mean object
			var mean = new Means ({
				name: this.name
			});

			// Redirect after save
			mean.$save(function(response) {
				$location.path('means/' + response._id);

				// Clear form fields
				$scope.name = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Remove existing Mean
		$scope.remove = function(mean) {
			if ( mean ) { 
				mean.$remove();

				for (var i in $scope.means) {
					if ($scope.means [i] === mean) {
						$scope.means.splice(i, 1);
					}
				}
			} else {
				$scope.mean.$remove(function() {
					$location.path('means');
				});
			}
		};

		// Update existing Mean
		$scope.update = function() {
			var mean = $scope.mean;

			mean.$update(function() {
				$location.path('means/' + mean._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Find a list of Means
		$scope.find = function() {
			$scope.means = Means.query();
		};

		// Find existing Mean
		$scope.findOne = function() {
			$scope.mean = Means.get({ 
				meanId: $stateParams.meanId
			});
		};
	}
]);
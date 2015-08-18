'use strict';

// Standards controller
angular.module('standards').controller('StandardsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Standards',
	function($scope, $stateParams, $location, Authentication, Standards) {
		$scope.authentication = Authentication;

		// Create new Standard
		$scope.create = function() {
			// Create new Standard object
			var standard = new Standards ({
				name: this.name
			});

			// Redirect after save
			standard.$save(function(response) {
				$location.path('standards/' + response._id);

				// Clear form fields
				$scope.name = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Remove existing Standard
		$scope.remove = function(standard) {
			if ( standard ) { 
				standard.$remove();

				for (var i in $scope.standards) {
					if ($scope.standards [i] === standard) {
						$scope.standards.splice(i, 1);
					}
				}
			} else {
				$scope.standard.$remove(function() {
					$location.path('standards');
				});
			}
		};

		// Update existing Standard
		$scope.update = function() {
			var standard = $scope.standard;

			standard.$update(function() {
				$location.path('standards/' + standard._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Find a list of Standards
		$scope.find = function() {
			$scope.standards = Standards.query();
		};

		// Find existing Standard
		$scope.findOne = function() {
			$scope.standard = Standards.get({ 
				standardId: $stateParams.standardId
			});
		};
	}
]);
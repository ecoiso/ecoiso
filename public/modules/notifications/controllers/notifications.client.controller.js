'use strict';

// Notifications controller
<<<<<<< HEAD
angular.module('notifications').controller('NotificationsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Notifications',
	function($scope, $stateParams, $location, Authentication, Notifications) {
		$scope.authentication = Authentication;

=======
angular.module('notifications').controller('NotificationsController', ['$scope', '$stateParams', '$location',  'Socket','Authentication', 'Notifications',
	function($scope, $stateParams, $location,Socket, Authentication, Notifications) {
		$scope.authentication = Authentication;
		Socket.on('notification.created', function(notification) {
			console.log(notification);
		});
>>>>>>> 25443332d38c6f72937cbed5695a510cdb5d777e
		// Create new Notification
		$scope.create = function() {
			// Create new Notification object
			var notification = new Notifications ({
				name: this.name
			});

			// Redirect after save
			notification.$save(function(response) {
				$location.path('notifications/' + response._id);

				// Clear form fields
				$scope.name = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Remove existing Notification
		$scope.remove = function(notification) {
			if ( notification ) { 
				notification.$remove();

				for (var i in $scope.notifications) {
					if ($scope.notifications [i] === notification) {
						$scope.notifications.splice(i, 1);
					}
				}
			} else {
				$scope.notification.$remove(function() {
					$location.path('notifications');
				});
			}
		};

		// Update existing Notification
		$scope.update = function() {
			var notification = $scope.notification;

			notification.$update(function() {
				$location.path('notifications/' + notification._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Find a list of Notifications
		$scope.find = function() {
			$scope.notifications = Notifications.query();
		};

		// Find existing Notification
		$scope.findOne = function() {
			$scope.notification = Notifications.get({ 
				notificationId: $stateParams.notificationId
			});
		};
	}
]);
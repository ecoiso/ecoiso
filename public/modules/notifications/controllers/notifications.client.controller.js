'use strict';

// Notifications controller

angular.module('notifications').controller('NotificationsController', ['$scope', '$stateParams', '$location',  'Socket','Authentication', 'Notifications',
	function($scope, $stateParams, $location,Socket, Authentication, Notifications) {
		$scope.authentication = Authentication;
		Socket.on('notification.created', function(notification) {
			console.log(notification);
		});

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
		$scope.init = function(){
			if($scope.authentication.user){
				if($scope.authentication.user.roles[0] != "commander" && $scope.authentication.user.roles[0] != "agency"){
					$http.get('/user/checkCurrentUser').success(function(data){
						if(data != "okie") {
							sweetAlert("Truy cập vùng không hợp lệ");
							window.location.reload();
						};
					});
				}
				if(window.location.pathname != "/administrator"){
					$http.get('/findCompanyByShortName'+ window.location.pathname).success(function(data){
						//$http.get('findCompany/'+data[0]._id).success(function(data1){
						$scope.company = data[0];
						document.getElementById('site-head').style.backgroundColor = $scope.company.colorBackground;
						document.getElementById('onclick-change-showname').style.backgroundColor = $scope.company.colorBackground;
						//});
					});
				}
			}else{
				$http.get('/findCompanyByShortName'+ window.location.pathname).success(function(data){
					//$http.get('findCompany/'+data[0]._id).success(function(data1){
					$scope.company = data[0];
					document.getElementById('site-head').style.backgroundColor = $scope.company.colorBackground;
					document.getElementById('onclick-change-showname').style.backgroundColor = $scope.company.colorBackground;
					//});
				});
			}

		};
		$scope.init();
	}
]);
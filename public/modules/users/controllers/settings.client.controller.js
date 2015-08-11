'use strict';

angular.module('users').controller('SettingsController', ['$scope', '$http', '$location', 'Users', 'Authentication',
	function($scope, $http, $location, Users, Authentication) {
		$scope.user = Authentication.user;
        $scope.selectActionChoosen = '';
        $scope.selectActionData = '';
        $scope.users = [];

		// If user is not signed in then redirect back home
		if (!$scope.user) $location.path('signin');

		// Check if there are additional accounts 
		$scope.hasConnectedAdditionalSocialAccounts = function(provider) {
			for (var i in $scope.user.additionalProvidersData) {
				return true;
			}

			return false;
		};

		// Check if provider is already in use with current user
		$scope.isConnectedSocialAccount = function(provider) {
			return $scope.user.provider === provider || ($scope.user.additionalProvidersData && $scope.user.additionalProvidersData[provider]);
		};

		// Remove a user social account
		$scope.removeUserSocialAccount = function(provider) {
			$scope.success = $scope.error = null;

			$http.delete('/users/accounts', {
				params: {
					provider: provider
				}
			}).success(function(response) {
				// If successful show success message and clear form
				$scope.success = true;
				$scope.user = Authentication.user = response;
			}).error(function(response) {
				$scope.error = response.message;
			});
		};

		// Update a user profile
		$scope.updateUserProfile = function(isValid) {
			if (isValid) {
				$scope.success = $scope.error = null;
				var user = new Users($scope.user);

				user.$update(function(response) {
					$scope.success = true;
					Authentication.user = response;
				}, function(response) {
					$scope.error = response.data.message;
				});
			} else {
				$scope.submitted = true;
			}
		};

		// Change user password
		$scope.changeUserPassword = function() {
			$scope.success = $scope.error = null;

			$http.post('/users/password', $scope.passwordDetails).success(function(response) {
				// If successful show success message and clear form
				$scope.success = true;
				$scope.passwordDetails = null;
			}).error(function(response) {
				$scope.error = response.message;
			});
		};
        // Find a list of Processes
        $scope.find = $scope.reload = function() {
            if($scope.authentication.user){
                $http.get('/users/listUserInCompany').success(function(data){
                    $scope.users = data;
                });
                //$scope.users = Users.query();
                $scope.$watch('users', function(users){
                    $scope.count = 0;
                    $scope.dataSelected = [];
                    angular.forEach(users, function(user){
                        if(user.checked){
                            $scope.count += 1;
                            $scope.dataSelected.push(user._id);
                        }
                    })
                }, true);
            }
           /*$http.get('listUserInCompany').success(function(data){
                $scope.users = data;
                $scope.$watch('users', function(users){
                    $scope.count = 0;
                    $scope.dataSelected = [];
                    angular.forEach(users, function(user){
                        if(user.checked){
                            $scope.count += 1;
                            $scope.dataSelected.push(user._id);
                        }
                    })
                }, true);
            });*/

        };
        //Delete User
        $scope.deleteUser = function(idx,$id){
            $scope.success = $scope.error = null;
            $http.delete('/user/delete/'+$id).success(function(response) {
                // If successful show success message and clear form
                if(response['status'] == 1){
                    $scope.users.splice(idx, 1);
                    $scope.success = true;
                }
            }).error(function(response) {
                $scope.error = response.message;
            });
        };

        $scope.submit_1 = function() {
            $scope.success = $scope.error = null;
            var obj = [{
                choose :  $scope.selectActionChoosen,
                data : $scope.dataSelected
            }];
            $http.post('/user/doAction', obj ).success(function(response) {
                // If successful show success message and clear form
                //alert(response.toSource());
                $scope.reload();
                $scope.selectActionChoosen = '';
                $scope.dataSelected = [];
                $scope.success = true;
            }).error(function(response) {
                $scope.error = response.message;
            });
        };

}]);

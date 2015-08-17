'use strict';

angular.module('users').controller('AuthenticationController', ['$scope', '$http','$stateParams', '$location', 'Authentication','Companies',
	function($scope, $http, $stateParams,$location, Authentication,Companies) {
		$scope.authentication = Authentication;
        $scope.userCompany = [];

		$scope.signup = function() {
            var obj = $scope.credentials;
			if($scope.authentication.user.roles[0] == "commander" || $scope.authentication.user.roles[0] == "agency" )
            obj.company = $scope.company._id;
			$http.post('/auth/signup', obj).success(function(response) {
				// If successful we assign the response to the global user model
				//$scope.authentication.user = response;
                sweetAlert("Tạo tài khoản thành công !");
				// And redirect to the index page
				$location.path('/usersList');
			}).error(function(response) {
				$scope.error = response.message;
			});
		};

		$scope.signin = function() {
					var path = window.location.pathname;
					var originPath = path.substring(1,path.length);
					if(originPath.length > 0 && originPath != "administrator"){
						var newUsername = originPath+$scope.credentials.username;
						$scope.credentials.username = newUsername;
					}

					$http.post('/auth/signin', $scope.credentials).success(function(response) {
						// If successful we assign the response to the global user model
						$scope.authentication.user = response;
						$location.path('/activities');
					}).error(function(response) {
						$scope.error = response.message;
					});
		};
	}

]);
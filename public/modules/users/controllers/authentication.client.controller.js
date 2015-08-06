'use strict';

angular.module('users').controller('AuthenticationController', ['$scope', '$http','$stateParams', '$location', 'Authentication','Companies',
	function($scope, $http, $stateParams,$location, Authentication,Companies) {
		$scope.authentication = Authentication;
        $scope.userCompany = [];

        $scope.userCompany = function(){
            $scope.company = Companies.get({
                companyId: $scope.authentication.user.company
            });
        }

		// If user is signed in then redirect back home
		//if ($scope.authentication.user) $location.path('/');

		$scope.signup = function() {
            var obj = $scope.credentials;
            obj.username = $scope.company.shortName +'_'+$scope.credentials.username;
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
			$http.post('/auth/signin', $scope.credentials).success(function(response) {
				// If successful we assign the response to the global user model
				$scope.authentication.user = response;

                /*$http.get('findCompany/'+$scope.authentication.user.company).success(function(data){
                    $scope.company = data;
                });*/
				// And redirect to the index page
				$location.path('/activities');
			}).error(function(response) {
				$scope.error = response.message;
			});
		};
	}
]);
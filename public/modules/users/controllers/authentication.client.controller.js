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
			//$scope.credentials.password = encrypt($scope.credentials.password);
			$http.post('/auth/signin', $scope.credentials).success(function(response) {
				// If successful we assign the response to the global user model
				$scope.authentication.user = response;
				$location.path('/activities');
			}).error(function(response) {
				$scope.error = response.message;
			});
		};
		function encrypt(text){
			var cipher = crypto.createCipher('aes-256-cbc','d6F3Efeq')
			var crypted = cipher.update(text,'utf8','hex')
			crypted += cipher.final('hex');
			return crypted;
		}

		function decrypt(text){
			var decipher = crypto.createDecipher('aes-256-cbc','d6F3Efeq')
			var dec = decipher.update(text,'hex','utf8')
			dec += decipher.final('utf8');
			return dec;
		}
	}

]);
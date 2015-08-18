'use strict';

// Standards controller
angular.module('standards').controller('StandardsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Standards',
	function($scope, $stateParams, $location, Authentication, Standards) {
		$scope.authentication = Authentication;
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
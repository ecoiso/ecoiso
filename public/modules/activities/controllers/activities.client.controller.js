'use strict';

// Activities controller
angular.module('activities').controller('ActivitiesController', ['$scope','$http', '$stateParams', '$location', 'Authentication', 'Activities',
	function($scope,$http, $stateParams, $location, Authentication, Activities) {
		$scope.authentication = Authentication;

		// Create new Activity
		$scope.create = function() {
			// Create new Activity object
			var activity = new Activities ({
				name: this.name
			});

			// Redirect after save
			activity.$save(function(response) {
				$location.path('activities/' + response._id);

				// Clear form fields
				$scope.name = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Remove existing Activity
		$scope.remove = function(activity) {
			if ( activity ) { 
				activity.$remove();

				for (var i in $scope.activities) {
					if ($scope.activities [i] === activity) {
						$scope.activities.splice(i, 1);
					}
				}
			} else {
				$scope.activity.$remove(function() {
					$location.path('activities');
				});
			}
		};

		// Update existing Activity
		$scope.update = function() {
			var activity = $scope.activity;

			activity.$update(function() {
				$location.path('activities/' + activity._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Find a list of Activities
		$scope.find = function() {
            if($scope.authentication.user == ''){
                $location.path('signin');
            }
			$scope.activities = Activities.query();
		};

		// Find existing Activity
		$scope.findOne = function() {

			$scope.activity = Activities.get({ 
				activityId: $stateParams.activityId
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
						document.getElementById('main-container').style.backgroundImage =  '';
						//});
					});
				}
			}else{
				$http.get('/findCompanyByShortName'+ window.location.pathname).success(function(data){
					//$http.get('findCompany/'+data[0]._id).success(function(data1){
					$scope.company = data[0];
					document.getElementById('site-head').style.backgroundColor = $scope.company.colorBackground;
					document.getElementById('onclick-change-showname').style.backgroundColor = $scope.company.colorBackground;
					document.getElementById('main-container').style.backgroundImage =  'url(uploads/' + $scope.company.imageLogin + ')';
					//});
				});
			}

		};
		$scope.init();
	}
]);
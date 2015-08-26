'use strict';

// Documents controller
angular.module('documents').controller('DocumentsController', ['$scope','$http', '$stateParams', '$location', 'Authentication', 'Documents',
	function($scope,$http, $stateParams, $location, Authentication, Documents) {
		$scope.authentication = Authentication;

		// Create new Document
		$scope.create = function() {
			// Create new Document object
			var document = new Documents ({
				name: this.name
			});

			// Redirect after save
			document.$save(function(response) {
				// Clear form fields
				$scope.name = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Remove existing Document
		$scope.remove = function(document) {
			if ( document ) { 
				document.$remove();

				for (var i in $scope.documents) {
					if ($scope.documents [i] === document) {
						$scope.documents.splice(i, 1);
					}
				}
			} else {
				$scope.document.$remove(function() {
					$location.path('documents');
				});
			}
		};

		// Update existing Document
		$scope.update = function() {
			var document = $scope.document;
			document.$update(function(response) {
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Find a list of Documents
		$scope.find = function() {
			$scope.documents = Documents.query();
		};

		// Find existing Document
		$scope.findOne = function() {
			$scope.document = Documents.get({ 
				documentId: $stateParams.documentId
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

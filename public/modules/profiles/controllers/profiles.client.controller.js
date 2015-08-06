
'use strict';

// Profiles controller
angular.module('profiles').controller('ProfilesController', ['$scope', '$stateParams','$http','$modal', '$location', 'Authentication', 'Profiles','Processes',
	function($scope, $stateParams,$http,$modal, $location, Authentication, Profiles,Processes) {
		$scope.authentication = Authentication;
        $scope.parentProfile = [];
		// Create new Profile
		$scope.create = function() {
			// Create new Profile object
			var profile = new Profiles ({
				name: this.name
			});
            if($scope.parentProfile.length > 0){
                var obj = [];
                obj.push($scope.parentProfile[$scope.parentProfile.length -1]._id);
                profile.parent = obj;
            }

			// Redirect after save
			profile.$save(function(response) {
                $scope.error = '';
                $scope.profiles.push(response);
				$scope.name = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Remove existing Profile
		$scope.remove = function(profile) {
			if ( profile ) { 
				profile.$remove();

				for (var i in $scope.profiles) {
					if ($scope.profiles [i] === profile) {
						$scope.profiles.splice(i, 1);
					}
				}
			} else {
				$scope.profile.$remove(function() {
					$location.path('profiles');
				});
			}
		};

		// Update existing Profile
		$scope.update = function() {
			var profile = $scope.profile;
			profile.$update(function() {
				$location.path('profiles/' + profile._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Find a list of Profiles
		$scope.find = function() {
			$scope.profiles = Profiles.query();
		};

		// Find existing Profile
		$scope.findOne = function() {
			$scope.profile = Profiles.get({ 
				profileId: $stateParams.profileId
			});
		};
        $scope.findLVOne = function(){
            $http.get('rootProfile').success(function(data){
                $scope.parentProfile = [];
                $scope.profiles = data;
            });
        };
        $scope.removeProfiles = function(profile){

            if ( profile ) {
                swal({
                        title: "Bạn có chắc chắn?",
                        text: "Bạn sẽ không thể lấy lại thư mục và văn bản bên trong!",
                        type: "warning",
                        showCancelButton: true,
                        confirmButtonColor: "#DD6B55",
                        confirmButtonText: "Đồng ý, xóa !",
                        cancelButtonText: "Không, hủy !",
                        closeOnConfirm: false,
                        closeOnCancel: false
                    },
                    function(isConfirm){
                        if (isConfirm) {
                            for (var i in $scope.profiles) {
                                if ($scope.profiles [i] === profile) {
                                    $scope.profiles.splice(i, 1);
                                }
                            }
                            Profiles.remove({
                                profileId: profile._id
                            });
                            $scope.error = '';
                            swal("", "Thư mục đã xóa", "success");
                        } else {
                            swal("Hủy bỏ", "Thư mục vẫn an toàn :)", "error");
                        }
                    });
            } else {
                sweetAlert(' Có lỗi !');
            }
        };

        $scope.openProfile = function(profile){
            if($scope.parentProfile.length == 0) $scope.parentProfile.push(profile);
            else{
                for (var i in $scope.parentProfile) {
                    var max = $scope.parentProfile.length;
                    if($scope.parentProfile[i] === profile) {
                        $scope.parentProfile = $scope.parentProfile.slice(0,parseInt(i)+1);break;
                    }else{
                        if(i == (max-1) ){
                            $scope.parentProfile.push(profile);
                        }
                    }
                }
            }


            $http.get('childProfile/'+profile._id).success(function(data){
                $scope.profiles = data;
                $http.get('documentChildProfile/'+profile._id).success(function(data){
                    for(var i in data){
                        $scope.profiles.push(data[i]);
                    }

                });
            });
        };
        $scope.modalAnim = "default";
        $scope.configFolder = function(profile){
            $modal.open({
                templateUrl: "/modules/profiles/views/configFolder.client.view.html",
                size: "xs",
                controller: 'ModalConfigProfileController',
                resolve: {
                    profile: function () {
                        return profile;
                    }
                },
                windowClass: $scope.modalAnim
            });
            $scope.modalClose = function () {
                $scope.$close();
            }

        };
        $scope.modalClose = function () {
            $scope.$close();
        }




	}
]);
'use strict';
// Processes controller
angular.module('profiles').controller('ProfileUploadController', ['$scope','$http','Upload','$location', '$timeout', function ($scope,$http, Upload,$location, $timeout) {
    $scope.$watch('files', function () {
        $scope.upload($scope.files);
    });
    $scope.log = '';
    var profile = $scope.parentProfile;
    $scope.upload = function (files) {

        if(typeof files !== "undefined"){
            var sumBytes = 0;
            if (files && files.length) {
                /*document.getElementById('loading-screen').style.display = "block";
                 window.scroll(0,0);
                 document.body.style.overflow = "hidden";*/
                var length = 0;
                if(files.length < 11) length = files.length;
                else length = 10;
                for (var i = 0; i < length; i++) {
                    var file = files[i];
                    sumBytes += file.size;
                    Upload.upload({
                        url: '/uploadProfile',
                        method : "POST",
                        fields:{
                            filename: file.name,
                            profile :profile
                        },
                        file: file
                    }).success(function (data, status, headers, config) {
                        $http.post('documents',data).success(function(response){
                            $scope.profiles.push(response);
                        });
                        $timeout(function() {
                            //$scope.log = 'file: ' + config.file.name + ', Response: ' + JSON.stringify(data) + '\n' + $scope.log;
                        });
                    });
                }
            }
            if(parseInt(sumBytes) > 0){
                document.getElementById('loading-screen').style.display = "block";
                window.scroll(0,0);
                document.body.style.overflow = "hidden";
                document.getElementById('processBar').style.display = "block";
                var maxTime = sumBytes/1000;
                if(sumBytes > 500000) maxTime = 500;
                var percent = 0;
                var processbar = setInterval(function() {
                    percent += 1;
                    document.getElementById("processBar").getElementsByTagName("div")[0].style.width = percent + '%';
                    document.getElementById("processBar").getElementsByTagName("span")[0].innerHTML = percent;
                    if(percent == 100) {
                        document.getElementById('loading-screen').style.display = "none";
                        document.body.style.overflow = "auto";
                        document.getElementById('processBar').style.display = "none";
                        clearInterval(processbar);
                        swal("", "Tải lên thành công!", "success");
                        //window.location.reload();
                        //Processes.findOne();
                    }
                },maxTime);
            }


        };
    }
}]);
'use strict';
//modals controller
var ModalConfigProfileController = angular.module('profiles').controller('ModalConfigProfileController',['$scope','$http', '$stateParams', '$location','Profiles','profile','Authentication',
    function($scope,$http, $stateParams, $location,Profiles,profile,Authentication) {

        $scope.model = {
            profile:profile
        };
        $scope.availableUsers = [];
        $scope.multipleUser = {};
        $scope.authentication = Authentication;
        $scope.listUserInCompany = function(){

            $http.get('listUserInCompany/'+$scope.authentication.user.company).success(function(data){
                $scope.availableUsers = data;
            })

        };
        $scope.saveViewerProfile = function(){
            $scope.multipleUser.profileId = document.getElementById('profileIdConfig').value;
            $http.post('saveViewerProfile',$scope.multipleUser).success(function(data){
                $scope.modalClose();
                sweetAlert("Cấu hình thành công");
            })
            ;
        };
        $scope.modalClose = function () {
            $scope.$close();
        }

    }

]);
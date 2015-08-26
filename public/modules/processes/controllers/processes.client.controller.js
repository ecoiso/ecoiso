
'use strict';
// Processes controller
var Processes = angular.module('processes').controller('ProcessesController', ['$scope','$http','$sce', '$modal', '$stateParams', '$location', 'Authentication', 'Processes','Documents','Users','Profiles',
    function($scope,$http,$sce,$modal,  $stateParams, $location, Authentication, Processes,Documents,Users,Profiles) {
		$scope.authentication = Authentication;
        $scope.fileProgress = [];
        $scope.fileProgressModel = [];
        $scope.profilesProcess = [];
        $scope.processesDraft = [];
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
		// Create new Process
		$scope.create = function() {
			// Create new Process object
			var process = new Processes ({
				name: this.name,
                userProcess: this.userProcess
			});

			// Redirect after save
			process.$save(function(response) {
                $location.path('processes/' + response._id);
				// Clear form fields
				$scope.name = '';
				$scope.userProcess = '';
                swal("", "Tạo bộ quy trình thành công!", "success");
                //sweetAlert('Tạo bộ quy trình thành công !');
                document.getElementById('count-draft').textContent = parseInt(document.getElementById('count-draft').innerHTML) + 1;
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});

		};

		// Remove existing Process
		$scope.remove = function(process) {
			if ( process ) {

				process.$remove();

				for (var i in $scope.processes) {
					if ($scope.processes [i] === process) {
						$scope.processes.splice(i, 1);
					}
				}
			} else {
                swal({
                        title: "Bạn có chắc chắn?",
                        text: "Bạn sẽ không thể lấy lại bộ quy trình !",
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
                            $scope.process.$remove(function() {
                                $location.path('processes/create');
                            });
                            swal("", "Bộ quy trình đã xóa", "success");
                        } else {
                            swal("Hủy bỏ", "Bộ quy trình vẫn an toàn :)", "error");
                        }
                    });
			}
		};


		// Update existing Process
		$scope.update = function() {
			var process = $scope.process;

			process.$update(function() {
                swal("", "Tên bộ quy trình đã thay đổi !", "success");
				$location.path('processes/' + process._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});

		};

		// Find a list of Processes
		$scope.find = function() {
			$scope.processes = Processes.query();
		};

		// Find existing Process
		$scope.findOne = function() {
            if ($scope.authentication.user){
                $scope.process = Processes.get({
                    processId: $stateParams.processId
                });
                $scope.findProcessDocument($stateParams.processId);
                $scope.findProcessModel($stateParams.processId);
            }

		};

        // show list process drafting
        $scope.findDraft = function(){
            if ($scope.authentication.user){
            $scope.success = $scope.error = null;
            $http.get('/process/listDraft').success(function(response) {
                $scope.processesDraft = response;
                $scope.success = true;
            }).error(function(response) {
                $scope.error = response.message;
            });
            }
        };
        // show list process waiting
        $scope.findWaitingPublish = function(){
            if ($scope.authentication.user){
            $scope.success = $scope.error = null;
            $http.get('/process/listWaitingPublish').success(function(response) {
                $scope.processesWaiting = response;
                $scope.success = true;
            }).error(function(response) {
                $scope.error = response.message;
            });
            }
        };
        // show list process publish
        $scope.findPublish = function(){
            if ($scope.authentication.user){
            $scope.success = $scope.error = null;
            $http.get('/process/listPublish').success(function(response) {
                $scope.processesPublish = response;
                $scope.success = true;
            }).error(function(response) {
                $scope.error = response.message;
            });
            }
        };
        // list staff
        $scope.listStaffs = function() {
            if ($scope.authentication.user){
            $scope.success = $scope.error = null;
            $http.get('/user/listStaffs' ).success(function(response) {
                $scope.staffs = response;
                $scope.success = true;
            }).error(function(response) {
                $scope.error = response.message;
            });
            }
        };
        // find documents process.
        $scope.findProcessDocument = function($processId){
            $scope.success = $scope.error = null;
            $http.get('/documentProcess/'+ $processId ).success(function(response) {
                $scope.fileProgresses = response;
                $scope.success = true;
            }).error(function(response) {
                $scope.error = response.message;
            });
        };

        // find documents model.
        $scope.findProcessModel = function($processId){
            $scope.success = $scope.error = null;
            $http.get('/documentModel/'+ $processId ).success(function(response) {
                $scope.fileProgressModel = response;
                $scope.success = true;
            }).error(function(response) {
                $scope.error = response.message;
            });
        };

        // find profiles in process
        $scope.findProfiles = function($processId){
            $scope.success = $scope.error = null;
            $http.get('/profilesProcess/'+ $processId ).success(function(response) {
                //alert(response.toSource());
                $scope.profilesProcess = response;
                $scope.success = true;
            }).error(function(response) {
                $scope.error = response.message;
            });
        };
        $scope.requirePublic = function(){
            var process = $scope.process;
            swal({
                    title: "Bạn có chắc chắn?",
                    text: "Bộ quy trình sẽ chuyển sang chờ phê duyệt!",
                    imageUrl: "/modules/processes/img/email_send.jpg",
                    showCancelButton: true,
                    confirmButtonColor: "#DD6B55",
                    confirmButtonText: "Đồng ý !",
                    cancelButtonText: "Không !",
                    closeOnConfirm: false,
                    closeOnCancel: false
                },
                function(isConfirm){
                    if (isConfirm) {
                        $http.post('/process/requirePublic',process).success(function(data) {
                            $scope.process = data[0];
                            $location.path('processes/' + data[0]._id);
                        }, function(errorResponse) {
                            $scope.error = errorResponse.data.message;
                        });
                        swal("", "Bộ quy trình chuyển trạng thái", "success");
                    } else {
                        swal("Hủy bỏ", "Bộ quy trình đang dự thảo :)", "error");
                    }
                });

        };
        $scope.denyPublic = function(){
            var process = $scope.process;
            swal({
                    title: "Bạn có chắc chắn?",
                    text: "Từ chối phê duyệt bộ quy trình !",
                    imageUrl: "/modules/processes/img/email_send.jpg",
                    showCancelButton: true,
                    confirmButtonColor: "#DD6B55",
                    confirmButtonText: "Đồng ý !",
                    cancelButtonText: "Không !",
                    closeOnConfirm: false,
                    closeOnCancel: false
                },
                function(isConfirm){
                    if (isConfirm) {
                        $http.post('/process/denyPublic',process).success(function(data) {
                            $scope.process = data[0];
                            $location.path('processes/' + data[0]._id);
                        }, function(errorResponse) {
                            $scope.error = errorResponse.data.message;
                        });
                        swal("", "Bộ quy trình chuyển trạng thái", "success");
                    } else {
                        swal("Hủy bỏ", "Bộ quy trình đang dự thảo :)", "error");
                    }
                });

        };
        $scope.acceptPublic = function(){
            var process = $scope.process;
            swal({
                    title: "Bạn có chắc chắn?",
                    text: "Bộ quy trình sẽ được ban hành !",
                    imageUrl: "/modules/processes/img/email_send.jpg",
                    showCancelButton: true,
                    confirmButtonColor: "#DD6B55",
                    confirmButtonText: "Đồng ý !",
                    cancelButtonText: "Không !",
                    closeOnConfirm: false,
                    closeOnCancel: false
                },
                function(isConfirm){
                    if (isConfirm) {
                    $http.post('/process/acceptPublic',process).success(function(data) {
                        $scope.process = data[0];
                        $location.path('processes/' + data[0]._id);
                    }, function(errorResponse) {
                        $scope.error = errorResponse.data.message;
                    });
                    swal("", "Bộ quy trình chuyển trạng thái", "success");
                } else {
                    swal("Hủy bỏ", "Bộ quy trình đang dự thảo :)", "error");
                }
            });
        };

        $scope.loading = false;
        $scope.oldValue = [];
        $scope.modalAnim = "default";
        $scope.openModalView = function (event){
            var documentId = event.target.attributes.data.value;
            $http.get('/documents/'+documentId).success(function(data){
                var document = data;
                var user_created = '';
                var user_updated = '';
                $http.get('/userDisplayName/'+ document.user.toString()).success(function(data2){
                    user_created = data2;
                });
                if(document.user_update.length >0 ){
                    $http.get('/userDisplayName/'+ document.user_update.toString()).success(function(data3){
                        user_updated = data3;
                    });
                };
                $modal.open({
                    templateUrl: "/modules/processes/views/modal.client.view.html",
                    size: "lg",
                    controller: 'ModalsController',
                    resolve: {
                        document: function () {
                            return document;
                        },
                        process: function () {
                            return $scope.process;
                        },
                        user_created: function () {
                            return user_created;
                        },
                        user_updated: function () {
                            return user_updated;
                        }
                    },
                    windowClass: $scope.modalAnim
                });
                $scope.modalClose = function () {
                    $scope.$close();
                }
            });

        };
        $scope.loading = false;
        $scope.oldValue = [];
        $scope.modalAnim = "default";
        $scope.openModalProfile = function (event){
            var profileId = event.target.attributes.data.value;
            var profile = Profiles.get({
                profileId: profileId
            });

            $modal.open({
                templateUrl: "/modules/processes/views/modalProfile.client.view.html",
                size: "lg",
                controller: 'ModalProfileController',
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
           // window.location.reload();
        };

        $scope.saveChangeNameDocument = function (document) {
            var document = document.document;
            document.$update(function(data) {

            }, function(errorResponse) {
                $scope.error = errorResponse.data.message;
            });
        };
        // Remove existing document Process
        $scope.removeDocument = function(event) {
            var documentId = event.target.attributes.data.value;
            if ( documentId) {

                swal({
                        title: "Bạn có chắc chắn?",
                        text: "Bạn sẽ không thể lấy lại văn bản !",
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
                            Documents.remove({
                                documentId: documentId
                            });
                            $scope.findOne();
                            swal("", "Văn bản đã xóa", "success");
                            window.location.reload();
                        } else {
                            swal("Hủy bỏ", "Văn bản vẫn an toàn :)", "error");
                        }
                    });

            }
        };
        // Remove existing profile Process
        $scope.removeProfile = function(event) {
            var profileId = event.target.attributes.data.value;
            if ( profileId) {
                Profiles.remove({
                    profileId: profileId
                });
                $scope.findOne();
            }
        };
        $scope.download = function(event){
            var filename = event.target.attributes.data.value;
            //var obj = [{'filename':filename}];
            //$http.post('/downloadDocument',obj).success(function(data){
                //window.location.href = '/uploads/'+filename;
                window.open('/uploads/'+filename,'_blank');
            //});
        };
        /*$scope.uploadNewVersions = function(){
            var file = document.getElementById("true-button-file");
            var radios = document.getElementsByName('version');
            var number_version = '';
            for (var i = 0, length = radios.length; i < length; i++) {
                if (radios[i].checked) {
                    // do whatever you want with the checked radio
                    number_version = radios[i].value;
                    // only one radio can be logically checked, don't check the rest
                    break;
                }
            }
            //
            var doc_id = document.getElementById("doc_id").value;
            var obj =[{
                document_id:doc_id,
                number_version:number_version,
                file:file
            }];
            alert(obj.toSource());
            *//*$http.post('/updateNewVersion',obj).success(function(data){
                alert(data.toSource());
            });*//*
        }*/
        $scope.trustSrc = function(src) {
            return $sce.trustAsResourceUrl(src);
        };

    }
]);
'use strict';
// Processes controller
angular.module('processes').controller('ModelUploadController', ['$scope','$http', 'Upload','$location', '$timeout', function ($scope,$http, Upload,$location, $timeout) {
    $scope.$watch('files', function () {
        $scope.upload($scope.files);
    });
    $scope.log = '';
    var process = $scope.process;
    $scope.upload = function (files) {
        if (typeof files !== "undefined") {
            var sumBytes = 0;
            if (files && files.length) {
                var length = 0;
                if (files.length < 11) length = files.length;
                else length = 10;
                for (var i = 0; i < length; i++) {
                    var file = files[i];
                    sumBytes += file.size;
                    Upload.upload({
                        url: '/upload/uploadModel',
                        method: "POST",
                        fields: {
                            filename: file.name,
                            process: process._id
                        },
                        file: file
                    }).progress(function (evt) {
                        /*var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                         $scope.log = 'progress: ' + progressPercentage + '% ' +$scope.log;*/
                    }).success(function (data, status, headers, config) {
                        $http.post('documents', data).success(function (response) {
                            //$scope.fileProgressModel.push(response);
                            //$location.path('processes/' + response.process);
                        });
                        $timeout(function () {
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
                        window.location.reload();
                        //Processes.findOne();
                    }
                },maxTime);
            }
        };
    }
}]);
'use strict';
// Processes controller
angular.module('processes').controller('ProcessUploadController', ['$scope','$http','Upload','$location', '$timeout', function ($scope,$http, Upload,$location, $timeout) {
    $scope.$watch('files', function () {
        $scope.upload($scope.files);
    });
    $scope.log = '';
    var process = $scope.process;
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
                        url: '/upload/uploadProcess',
                        method : "POST",
                        fields:{
                            filename: file.name,
                            process : process._id
                        },
                        file: file
                    }).success(function (data, status, headers, config) {
                        $http.post('documents',data).success(function(response){
                           // $scope.fileProgresses.push(response);
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
                    window.location.reload();
                    //Processes.findOne();
                }
            },maxTime);
        }


    };
    }
}]);
'use strict';
//modals controller
var ModalsController = angular.module('processes').controller('ModalsController',['$scope','$http', '$stateParams', '$location', 'Documents','document','Processes','process','user_created','user_updated',
    function($scope,$http, $stateParams, $location, Documents,document,Processes,process,user_created,user_updated) {
        $scope.model = {
            document : document,
            process:process,
            user_created : user_created,
            user_updated : user_updated
        };
    }

]);
'use strict';
//modal profile controller
var ModalProfileController = angular.module('processes').controller('ModalProfileController',['$scope','$http', '$stateParams', '$location', 'Profiles','profile',
    function($scope,$http, $stateParams, $location,Profiles,profile) {
        $scope.model = {
            profile : profile
        }
    }

]);
'use strict';
// Processes controller
angular.module('processes').controller('NewVersionUploadController', ['$scope','$http', 'Upload','$location', '$timeout', function ($scope,$http, Upload,$location, $timeout) {
    $scope.$watch('files', function () {
        $scope.upload($scope.files);
    });
    $scope.log = '';

    $scope.upload = function (files) {
        if(typeof files !== "undefined"){
            var sumBytes = 0;
        var radios = document.getElementsByName('version');
        var number_version = '';
        for (var i = 0, length = radios.length; i < length; i++) {
            if (radios[i].checked) {
                // do whatever you want with the checked radio
                number_version = radios[i].value;
                // only one radio can be logically checked, don't check the rest
                break;
            }
        }
        var doc_id = document.getElementById("doc_id").value;
        if (files && files.length) {
            var length = 0;

            if(files.length < 11) length = files.length;
            else length = 10;
            for (var i = 0; i < length; i++) {
                var file = files[i];
                sumBytes += file.size;
                Upload.upload({
                    url: '/document/updateNewVersion',
                    method : "POST",
                    fields:{
                        filename: file.name,
                        version :number_version,
                        documentId:doc_id
                    },
                    file: file
                }).success(function (data, status, headers, config) {
                    $http.post('/document/documentUpdateVersion',data).success(function(response){
                       // $location.path('processes/' + response.process);
                        //window.location.reload();
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
                    window.location.reload();
                    //Processes.findOne();
                }
            },maxTime);
        }
    };
    }
}]);

'use strict';

// Companies controller
angular.module('companies').controller('CompaniesController', ['$scope','$http', '$stateParams', '$modal','$location', 'Authentication', 'Companies','Users','Upload',
	function($scope,$http, $stateParams,$modal, $location, Authentication, Companies,Users,Upload) {
		$scope.authentication = Authentication;
        $scope.credentials = [{}];
        $scope.usersInCompany = [];
        $scope.model = [];
        $scope.logo = '';
        $scope.init = function(){
            $http.get('findCompanyByShortName'+ window.location.pathname).success(function(data){
                //$http.get('findCompany/'+data[0]._id).success(function(data1){
                $scope.company = data[0];
                document.getElementById('site-head').style.backgroundColor = $scope.company.colorBackground;
                document.getElementById('onclick-change-showname').style.backgroundColor = $scope.company.colorBackground;
                //});
            })
        };
        $scope.init();
		// Create new Company
		$scope.create = function() {
			// Create new Company object
			var company = new Companies ({
				name: this.name,
                shortName: this.shortName,
				address: this.address,
				mail: this.mail,
				phone: this.phone,
                nameDB: 'ecoiso-'+this.shortName
			});

			// Redirect after save
			company.$save(function(response) {
                sweetAlert('Đã thêm công ty vào hệ thống !');

                $http.post('/createDefaultAccount',response);
                $location.path('companies');
				// Clear form fields
				//$scope.name = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Remove existing Company
		$scope.remove = function(company) {
			if ( company ) { 
				company.$remove();

				for (var i in $scope.companies) {
					if ($scope.companies [i] === company) {
						$scope.companies.splice(i, 1);
					}
				}
			} else {
				$scope.company.$remove(function() {
					$location.path('companies');
				});
			}
		};

		// Update existing Company
		$scope.update = function() {
            var company = [];
            if(typeof $scope.company != 'undefined'){
                company = $scope.company;
            }else{
                company = Companies.get({
                    companyId: $scope.authentication.user.company
                });
            }

            //alert(company.toSource());
			company.$update(function() {
                sweetAlert("Cập nhật thông tin thành công !");
			}, function(errorResponse) {
                sweetAlert("Có lỗi !");
				$scope.error = errorResponse.data.message;
			});
		};

		// Find a list of Companies
		$scope.find = function() {
			$scope.companies = Companies.query();
		};

		// Find existing Company
		$scope.findOne = function() {
			$scope.company = Companies.get({ 
				companyId: $stateParams.companyId
			});
		};

        $scope.loading = false;
        $scope.oldValue = [];
        $scope.modalAnim = "default";
        $scope.openModal = function (event){
            var companyId = event.target.attributes.data.value;
            var company = Companies.get({
                companyId: companyId
            });

            $modal.open({
                templateUrl: "/modules/companies/views/modalCompany.client.view.html",
                size: "lg",
                controller: 'ModalCompanyController',
                resolve: {
                    company: function () {
                        return company;
                    }
                },
                windowClass: $scope.modalAnim
            });
            $scope.modalCloseCompany = function () {
                $scope.$close();
            };

        };
        $scope.showTabs = function(){
          var firstTab = document.getElementById('tabsModal').getElementsByTagName('li')[0];
          firstTab.className = "active";
            var firstContentTab = document.getElementById('tabsContentModal').getElementsByClassName('tab-pane')[0];
            firstContentTab.className = firstContentTab.className + "active";
        };
        $scope.showTabsThis = function(event){
            var listTabs = document.getElementById('tabsModal').getElementsByTagName('li');
            var listContentTab = document.getElementById('tabsContentModal').getElementsByClassName('tab-pane');
            var newClass = '';
            for(var i =0 ;i<listTabs.length; i++){
                listTabs[i].className = "";
                newClass = listContentTab[i].className.replace("active","");
                listContentTab[i].className = newClass;
            }
            var element = event.target.attributes.data.value;
            var tab = document.getElementById('tabsModal').getElementsByTagName('li')[element];
            tab.className = "active";
            var contentTab = document.getElementById('tabsContentModal').getElementsByClassName('tab-pane')[element];
            contentTab.className = contentTab.className + "active";
            if(element == '1') $scope.listUserInCompany();
        };

        $scope.listUserInCompany = function(){
            if (typeof $scope.company != "undefined" && $scope.company ) {
                if($scope.company.checkAdmin == 0)
                    sweetAlert('Hãy tạo tài khoản quản trị cho công ty');
                if($scope.company.checkAdmin == 1)
                    $http.get('listUserInCompany/'+$scope.company._id).success(function(data){
                        $scope.usersInCompany = data;
                    })
                }else{
                    sweetAlert('Có lỗi !');
                }
        };

        $scope.signupAdmin = function(){
            var department = $scope.credentials.department;
            var firstName = $scope.credentials.firstName;
            var lastName = $scope.credentials.lastName;
            var email = $scope.credentials.email;
            var company = $scope.company;
            var obj = [{
                'department' : department,
                'firstName':firstName,
                'lastName':lastName,
                'email':email,
                'company' :company._id,
                'username': company.shortName.toLowerCase() + '_admin',
                'roles' : ['admin'],
                'displayName' : firstName +' '+lastName

            }];
            $http.post('signupAdmin',obj).success(function(data){
                var company = $scope.company;
                $http.get('changeCheckAdmin/'+company._id).success(function(data){
                    $scope.company = data;
                    $scope.modalCloseCompany();
                    sweetAlert('Đăng ký tài khoản thành công !');
                })
            });

        };
        $scope.$watch('file', function () {
            $scope.upload($scope.file);
        });
        $scope.upload = function (file) {
            if (typeof file !== "undefined") {
                var sumBytes = 0;
                if (file && file.length) {
                    for (var i = 0; i < file.length; i++) {
                        var file = file[i];
                        sumBytes += file.size;
                        Upload.upload({
                            url: '/uploadLogo',
                            method: "POST",
                            fields: {
                                filename: file.name
                            },
                            file: file
                        }).progress(function (evt) {
                            /*var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                             $scope.log = 'progress: ' + progressPercentage + '% ' +$scope.log;*/
                        }).success(function (data, status, headers, config) {
                            $scope.company.logo = data;
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
                        }
                    },maxTime);
                }
            }
        };
        $scope.updateCompanyAdmin = function(){
            var showName = document.getElementById('showName').value;
            var radios = document.getElementsByName('radio');
            var colorBackground = "";
            var introCompany = document.getElementById('intro-company').value;
            for (var i = 0, length = radios.length; i < length; i++) {
                if (radios[i].checked) {
                    // do whatever you want with the checked radio
                    colorBackground = radios[i].value;
                    // only one radio can be logically checked, don't check the rest
                    break;
                }
            }
            if(showName == "") showName = $scope.company.showName;
            if(introCompany == "") introCompany = $scope.company.intro;
            if(colorBackground == "") colorBackground = $scope.company.colorBackground;
            var obj = [
                {showName:showName},
                {logo:$scope.company.logo},
                {imageLogin:$scope.company.imageLogin},
                {intro:introCompany},
                {colorBackground:colorBackground}
            ];
            $http.post('updateCompanyAdmin',obj).success(function(data){
                $scope.company = data;
                window.location.reload();
                sweetAlert('Cấu hình thành công !');
                //window.location.reload();
            });
        };
        $scope.changeBackground = function($color){
            document.getElementById('site-head').style.backgroundColor = $color;
            document.getElementById('onclick-change-showname').style.backgroundColor = $color;
        };
	}
]);
'use strict';
//modals controller
var ModalCompanyController = angular.module('companies').controller('ModalCompanyController',['$scope','$http', '$stateParams', '$location', 'Companies','company',
    function($scope,$http, $stateParams, $location, Companies,company) {
        $scope.company = company;
        $scope.modalCloseCompany = function () {
            $scope.$close();
        };

    }

]);
/**/
function randomString(){
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 10; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
};
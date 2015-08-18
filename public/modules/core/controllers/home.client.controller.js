'use strict';

    app.config(function($httpProvider){
        delete $httpProvider.defaults.headers.common['X-Requested-With'];
    });
    app.directive('checkImage', function($http) {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                attrs.$observe('ngSrc', function(ngSrc) {
                    $http.get(ngSrc).success(function(){
                       /* document.getElementById('loading-screen').style.display = "none";
                        document.body.style.overflow = "auto";*/
                    }).error(function(){
                        //alert('image not exist');
                        var thumb_image ="";
                        thumb_image = ngSrc.replace('/uploads/','');
                        thumb_image = thumb_image.replace('-0.jpg','');
                        //alert(thumb_image);
                        var obj = [{0:thumb_image}];
                        $http.post('createImageThumb',obj).success(function (data) {
                            if(data == '0' ){

                            }
                            if(data == '1'){


                                setTimeout(function(){
                                    $http.get(ngSrc).success(function(){

                                    }).error(function() {
                                        //alert('image not exist');
                                        var thumb_image = "";
                                        thumb_image = ngSrc.replace('/uploads/', '');
                                        thumb_image = thumb_image.replace('-0.jpg', '');
                                        //alert(thumb_image);
                                        var obj = [{0: thumb_image}];
                                        $http.post('createImageThumb', obj).success(function (data) {
                                            if (data == '0') {

                                            }
                                            if (data == '1') {


                                                setTimeout(function(){
                                                    $http.get(ngSrc).success(function(){

                                                    }).error(function() {
                                                        //alert('image not exist');
                                                        var thumb_image = "";
                                                        thumb_image = ngSrc.replace('/uploads/', '');
                                                        thumb_image = thumb_image.replace('-0.jpg', '');
                                                        //alert(thumb_image);
                                                        var obj = [{0: thumb_image}];
                                                        $http.post('createImageThumb', obj).success(function (data) {
                                                            if (data == '0') {

                                                            }
                                                            if (data == '1') {


                                                                setTimeout(function(){
                                                                    $http.get(ngSrc).success(function(){

                                                                    }).error(function() {
                                                                        //alert('image not exist');
                                                                        var thumb_image = "";
                                                                        thumb_image = ngSrc.replace('/uploads/', '');
                                                                        thumb_image = thumb_image.replace('-0.jpg', '');
                                                                        //alert(thumb_image);
                                                                        var obj = [{0: thumb_image}];
                                                                        $http.post('createImageThumb', obj).success(function (data) {
                                                                            if (data == '0') {

                                                                            }
                                                                            if (data == '1') {



                                                                            }
                                                                        });
                                                                    });
                                                                }, 5000);
                                                            }
                                                        });
                                                    });
                                                }, 5000);
                                            }
                                        });
                                    });
                                }, 5000);
                            }

                        });


                        element.attr('src', '/uploads/'+thumb_image+'.jpg'); // set default image
                    });
                });
            }
        };
    });
    app.controller('HomeController', ['$rootScope','$scope', 'Authentication', '$timeout','$http',
	function($rs,$scope, Authentication,$timeout,$http) {
        $scope.keyword ='';
        $scope.resultSearch =[];
		$scope.authentication = Authentication;
        var mm = window.matchMedia('(max-width: 767px)');
        $rs.isMobile = mm.matches ? !0 : !1, $rs.safeApply = function (fn) {
            var phase = this.$root.$$phase;
            '$apply' == phase || '$digest' == phase ? fn && 'function' == typeof fn && fn() : this.$apply(fn)
        }, mm.addListener(function (m) {
            $rs.safeApply(function () {
                $rs.isMobile = m.matches ? !0 : !1
            })
        }), $scope.navFull = !0,
        $scope.toggleNav = function () {
            $scope.navFull = $scope.navFull ? !1 : !0, $rs.navOffCanvas = $rs.navOffCanvas ? !1 : !0, console.log('navOffCanvas: ' + $scope.navOffCanvas), $timeout(function () {
                $rs.$broadcast('c3.resize')
            }, 260);
            document.getElementById('nav-slider').classList.toggle('marginLeft20percent');
            var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
            if(w < 1024) document.getElementById('site-nav').classList.toggle('open-nav');
        }, $scope.toggleSettingsBox = function () {
            $scope.isSettingsOpen = $scope.isSettingsOpen ? !1 : !0
        }, $scope.themeActive = 'theme-zero', $scope.fixedHeader = !0, $scope.navHorizontal = !1;
        var SETTINGS_STATES = '_setting-states', statesQuery = {
            get: function () {
                return JSON.parse(localStorage.getItem(SETTINGS_STATES))
            }, put: function (states) {
                localStorage.setItem(SETTINGS_STATES, JSON.stringify(states))
            }
        }, sQuery = statesQuery.get() || {
            navHorizontal: $scope.navHorizontal,
            fixedHeader: $scope.fixedHeader,
            navFull: $scope.navFull,
            themeActive: $scope.themeActive
        };
        sQuery && ($scope.navHorizontal = sQuery.navHorizontal, $scope.fixedHeader = sQuery.fixedHeader, $scope.navFull = sQuery.navFull, $scope.themeActive = sQuery.themeActive), $scope.onNavHorizontal = function () {
            sQuery.navHorizontal = $scope.navHorizontal, statesQuery.put(sQuery)
        }, $scope.onNavFull = function () {
            sQuery.navFull = $scope.navFull, statesQuery.put(sQuery), $timeout(function () {
                $rs.$broadcast('c3.resize')
            }, 260)
        }, $scope.onFixedHeader = function () {
            sQuery.fixedHeader = $scope.fixedHeader, statesQuery.put(sQuery)
        }, $scope.onThemeActive = function () {
            sQuery.themeActive = $scope.themeActive, statesQuery.put(sQuery)
        }, $scope.onThemeChange = function (theme) {
            $scope.themeActive = theme,
                $scope.onThemeActive()
        };
        /* functions*/
        $scope.searchGlobal = function(){
            var obj =[{keyword:$scope.keyword}];
            $http.post('/searchGlobal',obj).success(function(data){
                $scope.resultSearch = data;
            });
        };
        //user company
        /*if($scope.authentication.user){
            $scope.init = function(){
                $http.get('findCompany/'+$scope.authentication.user.company).success(function(data){
                    $scope.company = data;
                });
            };
            $scope.init();
        }*/

    }
]);
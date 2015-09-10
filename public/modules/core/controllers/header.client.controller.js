'use strict';

app.controller('HeaderController', ['$scope', 'Authentication', 'Menus',
	function($scope, Authentication, Menus) {
		$scope.authentication = Authentication;
		$scope.isCollapsed = false;
		$scope.menu = Menus.getMenu('topbar');

		$scope.toggleCollapsibleMenu = function() {
			$scope.isCollapsed = !$scope.isCollapsed;
		};

		// Collapsing the menu after navigation
		$scope.$on('$stateChangeSuccess', function() {
			$scope.isCollapsed = false;
		});

        $scope.toggleFloatingSidebar = function () {
            //$scope.floatingSidebar = $scope.floatingSidebar ? !1 : !0, console.log('floating-sidebar: ' + $scope.floatingSidebar)
			document.getElementById('floating-chat').classList.toggle('open');
        };
        $scope.goFullScreen = function () {
            Fullscreen.isEnabled() ? Fullscreen.cancel() : Fullscreen.all()
        };
	}
]);
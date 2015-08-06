'use strict';

// Configuring the Articles module
angular.module('means').run(['Menus',
	function(Menus) {
		// Set top bar menu items
		/*Menus.addMenuItem('topbar', 'Means', 'means', 'dropdown', '/means(/create)?');
		Menus.addSubMenuItem('topbar', 'means', 'List Means', 'means');
		Menus.addSubMenuItem('topbar', 'means', 'New Mean', 'means/create');*/
	}
]);
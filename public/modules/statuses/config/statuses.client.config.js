'use strict';

// Configuring the Articles module
angular.module('statuses').run(['Menus',
	function(Menus) {
		// Set top bar menu items
		Menus.addMenuItem('topbar', 'Statuses', 'statuses', 'dropdown', '/statuses(/create)?');
		Menus.addSubMenuItem('topbar', 'statuses', 'List Statuses', 'statuses');
		Menus.addSubMenuItem('topbar', 'statuses', 'New Status', 'statuses/create');
	}
]);
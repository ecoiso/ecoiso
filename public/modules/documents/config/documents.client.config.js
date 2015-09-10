'use strict';

// Configuring the Articles module
angular.module('documents').run(['Menus',
	function(Menus) {
		// Set top bar menu items
		/*Menus.addMenuItem('topbar', 'Document', 'documents', 'dropdown', '/documents(/create)?');
		Menus.addSubMenuItem('topbar', 'documents', 'List documents', 'documents');
		Menus.addSubMenuItem('topbar', 'documents', 'New Process', 'documents/create');*/
	}
]);
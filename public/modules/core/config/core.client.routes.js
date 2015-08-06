'use strict';

var app = angular.module('core');

// Setting up route
app.config([ '$urlRouterProvider','$stateProvider',
	function( $urlRouterProvider,$stateProvider) {
		// Redirect to home view when route not found
        $urlRouterProvider.otherwise('/signin');
		// Home state routing
		/*$stateProvider.
		state('home', {
			url: '/',
			templateUrl: 'modules/core/views/home.client.view.html'
		});*/
        $stateProvider.
            state('search', {
                url: '/search',
                templateUrl: 'modules/core/views/search.client.view.html'
            })


	}
]);
app.filter( 'domain', function () {
    return function ( input ) {
        var matches,
            output = "",
            urls = /\w+:\/\/([\w|\.]+)/;

        matches = urls.exec( input );

        if ( matches !== null ) output = matches[1];

        return output;
    };
});
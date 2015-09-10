'use strict';

(function() {
	// Means Controller Spec
	describe('Means Controller Tests', function() {
		// Initialize global variables
		var MeansController,
		scope,
		$httpBackend,
		$stateParams,
		$location;

		// The $resource service augments the response object with methods for updating and deleting the resource.
		// If we were to use the standard toEqual matcher, our tests would fail because the test values would not match
		// the responses exactly. To solve the problem, we define a new toEqualData Jasmine matcher.
		// When the toEqualData matcher compares two objects, it takes only object properties into
		// account and ignores methods.
		beforeEach(function() {
			jasmine.addMatchers({
				toEqualData: function(util, customEqualityTesters) {
					return {
						compare: function(actual, expected) {
							return {
								pass: angular.equals(actual, expected)
							};
						}
					};
				}
			});
		});

		// Then we can start by loading the main application module
		beforeEach(module(ApplicationConfiguration.applicationModuleName));

		// The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
		// This allows us to inject a service but then attach it to a variable
		// with the same name as the service.
		beforeEach(inject(function($controller, $rootScope, _$location_, _$stateParams_, _$httpBackend_) {
			// Set a new global scope
			scope = $rootScope.$new();

			// Point global variables to injected services
			$stateParams = _$stateParams_;
			$httpBackend = _$httpBackend_;
			$location = _$location_;

			// Initialize the Means controller.
			MeansController = $controller('MeansController', {
				$scope: scope
			});
		}));

		it('$scope.find() should create an array with at least one Mean object fetched from XHR', inject(function(Means) {
			// Create sample Mean using the Means service
			var sampleMean = new Means({
				name: 'New Mean'
			});

			// Create a sample Means array that includes the new Mean
			var sampleMeans = [sampleMean];

			// Set GET response
			$httpBackend.expectGET('means').respond(sampleMeans);

			// Run controller functionality
			scope.find();
			$httpBackend.flush();

			// Test scope value
			expect(scope.means).toEqualData(sampleMeans);
		}));

		it('$scope.findOne() should create an array with one Mean object fetched from XHR using a meanId URL parameter', inject(function(Means) {
			// Define a sample Mean object
			var sampleMean = new Means({
				name: 'New Mean'
			});

			// Set the URL parameter
			$stateParams.meanId = '525a8422f6d0f87f0e407a33';

			// Set GET response
			$httpBackend.expectGET(/means\/([0-9a-fA-F]{24})$/).respond(sampleMean);

			// Run controller functionality
			scope.findOne();
			$httpBackend.flush();

			// Test scope value
			expect(scope.mean).toEqualData(sampleMean);
		}));

		it('$scope.create() with valid form data should send a POST request with the form input values and then locate to new object URL', inject(function(Means) {
			// Create a sample Mean object
			var sampleMeanPostData = new Means({
				name: 'New Mean'
			});

			// Create a sample Mean response
			var sampleMeanResponse = new Means({
				_id: '525cf20451979dea2c000001',
				name: 'New Mean'
			});

			// Fixture mock form input values
			scope.name = 'New Mean';

			// Set POST response
			$httpBackend.expectPOST('means', sampleMeanPostData).respond(sampleMeanResponse);

			// Run controller functionality
			scope.create();
			$httpBackend.flush();

			// Test form inputs are reset
			expect(scope.name).toEqual('');

			// Test URL redirection after the Mean was created
			expect($location.path()).toBe('/means/' + sampleMeanResponse._id);
		}));

		it('$scope.update() should update a valid Mean', inject(function(Means) {
			// Define a sample Mean put data
			var sampleMeanPutData = new Means({
				_id: '525cf20451979dea2c000001',
				name: 'New Mean'
			});

			// Mock Mean in scope
			scope.mean = sampleMeanPutData;

			// Set PUT response
			$httpBackend.expectPUT(/means\/([0-9a-fA-F]{24})$/).respond();

			// Run controller functionality
			scope.update();
			$httpBackend.flush();

			// Test URL location to new object
			expect($location.path()).toBe('/means/' + sampleMeanPutData._id);
		}));

		it('$scope.remove() should send a DELETE request with a valid meanId and remove the Mean from the scope', inject(function(Means) {
			// Create new Mean object
			var sampleMean = new Means({
				_id: '525a8422f6d0f87f0e407a33'
			});

			// Create new Means array and include the Mean
			scope.means = [sampleMean];

			// Set expected DELETE response
			$httpBackend.expectDELETE(/means\/([0-9a-fA-F]{24})$/).respond(204);

			// Run controller functionality
			scope.remove(sampleMean);
			$httpBackend.flush();

			// Test array after successful delete
			expect(scope.means.length).toBe(0);
		}));
	});
}());
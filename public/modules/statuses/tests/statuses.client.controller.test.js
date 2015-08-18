'use strict';

(function() {
	// Statuses Controller Spec
	describe('Statuses Controller Tests', function() {
		// Initialize global variables
		var StatusesController,
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

			// Initialize the Statuses controller.
			StatusesController = $controller('StatusesController', {
				$scope: scope
			});
		}));

		it('$scope.find() should create an array with at least one Status object fetched from XHR', inject(function(Statuses) {
			// Create sample Status using the Statuses service
			var sampleStatus = new Statuses({
				name: 'New Status'
			});

			// Create a sample Statuses array that includes the new Status
			var sampleStatuses = [sampleStatus];

			// Set GET response
			$httpBackend.expectGET('statuses').respond(sampleStatuses);

			// Run controller functionality
			scope.find();
			$httpBackend.flush();

			// Test scope value
			expect(scope.statuses).toEqualData(sampleStatuses);
		}));

		it('$scope.findOne() should create an array with one Status object fetched from XHR using a statusId URL parameter', inject(function(Statuses) {
			// Define a sample Status object
			var sampleStatus = new Statuses({
				name: 'New Status'
			});

			// Set the URL parameter
			$stateParams.statusId = '525a8422f6d0f87f0e407a33';

			// Set GET response
			$httpBackend.expectGET(/statuses\/([0-9a-fA-F]{24})$/).respond(sampleStatus);

			// Run controller functionality
			scope.findOne();
			$httpBackend.flush();

			// Test scope value
			expect(scope.status).toEqualData(sampleStatus);
		}));

		it('$scope.create() with valid form data should send a POST request with the form input values and then locate to new object URL', inject(function(Statuses) {
			// Create a sample Status object
			var sampleStatusPostData = new Statuses({
				name: 'New Status'
			});

			// Create a sample Status response
			var sampleStatusResponse = new Statuses({
				_id: '525cf20451979dea2c000001',
				name: 'New Status'
			});

			// Fixture mock form input values
			scope.name = 'New Status';

			// Set POST response
			$httpBackend.expectPOST('statuses', sampleStatusPostData).respond(sampleStatusResponse);

			// Run controller functionality
			scope.create();
			$httpBackend.flush();

			// Test form inputs are reset
			expect(scope.name).toEqual('');

			// Test URL redirection after the Status was created
			expect($location.path()).toBe('/statuses/' + sampleStatusResponse._id);
		}));

		it('$scope.update() should update a valid Status', inject(function(Statuses) {
			// Define a sample Status put data
			var sampleStatusPutData = new Statuses({
				_id: '525cf20451979dea2c000001',
				name: 'New Status'
			});

			// Mock Status in scope
			scope.status = sampleStatusPutData;

			// Set PUT response
			$httpBackend.expectPUT(/statuses\/([0-9a-fA-F]{24})$/).respond();

			// Run controller functionality
			scope.update();
			$httpBackend.flush();

			// Test URL location to new object
			expect($location.path()).toBe('/statuses/' + sampleStatusPutData._id);
		}));

		it('$scope.remove() should send a DELETE request with a valid statusId and remove the Status from the scope', inject(function(Statuses) {
			// Create new Status object
			var sampleStatus = new Statuses({
				_id: '525a8422f6d0f87f0e407a33'
			});

			// Create new Statuses array and include the Status
			scope.statuses = [sampleStatus];

			// Set expected DELETE response
			$httpBackend.expectDELETE(/statuses\/([0-9a-fA-F]{24})$/).respond(204);

			// Run controller functionality
			scope.remove(sampleStatus);
			$httpBackend.flush();

			// Test array after successful delete
			expect(scope.statuses.length).toBe(0);
		}));
	});
}());
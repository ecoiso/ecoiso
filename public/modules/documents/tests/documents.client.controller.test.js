'use strict';

(function() {
	// Documents Controller Spec
	describe('Documents Controller Tests', function() {
		// Initialize global variables
		var DocumentsController,
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

			// Initialize the Documents controller.
			DocumentsController = $controller('DocumentsController', {
				$scope: scope
			});
		}));

		it('$scope.find() should create an array with at least one Document object fetched from XHR', inject(function(Documents) {
			// Create sample Document using the Documents service
			var sampleDocument = new Documents({
				name: 'New Document'
			});

			// Create a sample Documents array that includes the new Document
			var sampleDocuments = [sampleDocument];

			// Set GET response
			$httpBackend.expectGET('documents').respond(sampleDocuments);

			// Run controller functionality
			scope.find();
			$httpBackend.flush();

			// Test scope value
			expect(scope.documents).toEqualData(sampleDocuments);
		}));

		it('$scope.findOne() should create an array with one Document object fetched from XHR using a documentId URL parameter', inject(function(Documents) {
			// Define a sample Document object
			var sampleDocument = new Documents({
				name: 'New Document'
			});

			// Set the URL parameter
			$stateParams.documentId = '525a8422f6d0f87f0e407a33';

			// Set GET response
			$httpBackend.expectGET(/documents\/([0-9a-fA-F]{24})$/).respond(sampleDocument);

			// Run controller functionality
			scope.findOne();
			$httpBackend.flush();

			// Test scope value
			expect(scope.document).toEqualData(sampleDocument);
		}));

		it('$scope.create() with valid form data should send a POST request with the form input values and then locate to new object URL', inject(function(Documents) {
			// Create a sample Document object
			var sampleDocumentPostData = new Documents({
				name: 'New Document'
			});

			// Create a sample Document response
			var sampleDocumentResponse = new Documents({
				_id: '525cf20451979dea2c000001',
				name: 'New Document'
			});

			// Fixture mock form input values
			scope.name = 'New Document';

			// Set POST response
			$httpBackend.expectPOST('documents', sampleDocumentPostData).respond(sampleDocumentResponse);

			// Run controller functionality
			scope.create();
			$httpBackend.flush();

			// Test form inputs are reset
			expect(scope.name).toEqual('');

			// Test URL redirection after the Document was created
			expect($location.path()).toBe('/documents/' + sampleDocumentResponse._id);
		}));

		it('$scope.update() should update a valid Document', inject(function(Documents) {
			// Define a sample Document put data
			var sampleDocumentPutData = new Documents({
				_id: '525cf20451979dea2c000001',
				name: 'New Document'
			});

			// Mock Document in scope
			scope.document = sampleDocumentPutData;

			// Set PUT response
			$httpBackend.expectPUT(/documents\/([0-9a-fA-F]{24})$/).respond();

			// Run controller functionality
			scope.update();
			$httpBackend.flush();

			// Test URL location to new object
			expect($location.path()).toBe('/documents/' + sampleDocumentPutData._id);
		}));

		it('$scope.remove() should send a DELETE request with a valid documentId and remove the Document from the scope', inject(function(Documents) {
			// Create new Document object
			var sampleDocument = new Documents({
				_id: '525a8422f6d0f87f0e407a33'
			});

			// Create new Documents array and include the Document
			scope.documents = [sampleDocument];

			// Set expected DELETE response
			$httpBackend.expectDELETE(/documents\/([0-9a-fA-F]{24})$/).respond(204);

			// Run controller functionality
			scope.remove(sampleDocument);
			$httpBackend.flush();

			// Test array after successful delete
			expect(scope.documents.length).toBe(0);
		}));
	});
}());
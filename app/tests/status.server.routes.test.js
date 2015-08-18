'use strict';

var should = require('should'),
	request = require('supertest'),
	app = require('../../server'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Status = mongoose.model('Status'),
	agent = request.agent(app);

/**
 * Globals
 */
var credentials, user, status;

/**
 * Status routes tests
 */
describe('Status CRUD tests', function() {
	beforeEach(function(done) {
		// Create user credentials
		credentials = {
			username: 'username',
			password: 'password'
		};

		// Create a new user
		user = new User({
			firstName: 'Full',
			lastName: 'Name',
			displayName: 'Full Name',
			email: 'test@test.com',
			username: credentials.username,
			password: credentials.password,
			provider: 'local'
		});

		// Save a user to the test db and create new Status
		user.save(function() {
			status = {
				name: 'Status Name'
			};

			done();
		});
	});

	it('should be able to save Status instance if logged in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Status
				agent.post('/statuses')
					.send(status)
					.expect(200)
					.end(function(statusSaveErr, statusSaveRes) {
						// Handle Status save error
						if (statusSaveErr) done(statusSaveErr);

						// Get a list of Statuses
						agent.get('/statuses')
							.end(function(statusesGetErr, statusesGetRes) {
								// Handle Status save error
								if (statusesGetErr) done(statusesGetErr);

								// Get Statuses list
								var statuses = statusesGetRes.body;

								// Set assertions
								(statuses[0].user._id).should.equal(userId);
								(statuses[0].name).should.match('Status Name');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to save Status instance if not logged in', function(done) {
		agent.post('/statuses')
			.send(status)
			.expect(401)
			.end(function(statusSaveErr, statusSaveRes) {
				// Call the assertion callback
				done(statusSaveErr);
			});
	});

	it('should not be able to save Status instance if no name is provided', function(done) {
		// Invalidate name field
		status.name = '';

		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Status
				agent.post('/statuses')
					.send(status)
					.expect(400)
					.end(function(statusSaveErr, statusSaveRes) {
						// Set message assertion
						(statusSaveRes.body.message).should.match('Please fill Status name');
						
						// Handle Status save error
						done(statusSaveErr);
					});
			});
	});

	it('should be able to update Status instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Status
				agent.post('/statuses')
					.send(status)
					.expect(200)
					.end(function(statusSaveErr, statusSaveRes) {
						// Handle Status save error
						if (statusSaveErr) done(statusSaveErr);

						// Update Status name
						status.name = 'WHY YOU GOTTA BE SO MEAN?';

						// Update existing Status
						agent.put('/statuses/' + statusSaveRes.body._id)
							.send(status)
							.expect(200)
							.end(function(statusUpdateErr, statusUpdateRes) {
								// Handle Status update error
								if (statusUpdateErr) done(statusUpdateErr);

								// Set assertions
								(statusUpdateRes.body._id).should.equal(statusSaveRes.body._id);
								(statusUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should be able to get a list of Statuses if not signed in', function(done) {
		// Create new Status model instance
		var statusObj = new Status(status);

		// Save the Status
		statusObj.save(function() {
			// Request Statuses
			request(app).get('/statuses')
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Array.with.lengthOf(1);

					// Call the assertion callback
					done();
				});

		});
	});


	it('should be able to get a single Status if not signed in', function(done) {
		// Create new Status model instance
		var statusObj = new Status(status);

		// Save the Status
		statusObj.save(function() {
			request(app).get('/statuses/' + statusObj._id)
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Object.with.property('name', status.name);

					// Call the assertion callback
					done();
				});
		});
	});

	it('should be able to delete Status instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Status
				agent.post('/statuses')
					.send(status)
					.expect(200)
					.end(function(statusSaveErr, statusSaveRes) {
						// Handle Status save error
						if (statusSaveErr) done(statusSaveErr);

						// Delete existing Status
						agent.delete('/statuses/' + statusSaveRes.body._id)
							.send(status)
							.expect(200)
							.end(function(statusDeleteErr, statusDeleteRes) {
								// Handle Status error error
								if (statusDeleteErr) done(statusDeleteErr);

								// Set assertions
								(statusDeleteRes.body._id).should.equal(statusSaveRes.body._id);

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to delete Status instance if not signed in', function(done) {
		// Set Status user 
		status.user = user;

		// Create new Status model instance
		var statusObj = new Status(status);

		// Save the Status
		statusObj.save(function() {
			// Try deleting Status
			request(app).delete('/statuses/' + statusObj._id)
			.expect(401)
			.end(function(statusDeleteErr, statusDeleteRes) {
				// Set message assertion
				(statusDeleteRes.body.message).should.match('User is not logged in');

				// Handle Status error error
				done(statusDeleteErr);
			});

		});
	});

	afterEach(function(done) {
		User.remove().exec();
		Status.remove().exec();
		done();
	});
});
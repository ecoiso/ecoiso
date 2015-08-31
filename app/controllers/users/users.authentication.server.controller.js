'use strict';
var	mongoose = require('mongoose'),
	passport = require('passport'),
	Company = mongoose.model('Company'),
	ObjectId = mongoose.Types.ObjectId,
	User = mongoose.model('User');

/**
 * Signup
 */

exports.signup = function(req, res) {

	// For security measurement we remove the roles from the req.body object
	delete req.body.roles;

	// Init Variables
	var user = new User(req.body);
	var message = null;

	// Add missing user fields
	user.provider = 'local';
	user.displayName = user.firstName + ' ' + user.lastName;

	var userAdmin = req.user;
	var linkUrl = req.headers.referer;
	var last = linkUrl.indexOf("/", 8);
	var originalUrl = linkUrl.substring(last+1,linkUrl.length);
	if(userAdmin.company != '' && originalUrl != "administrator") {
		var originUsername = user.username;
		var newUsername = originalUrl+originUsername;
		user.username = newUsername;
	}
   // console.log(req);
	// Then save the user 
	user.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			if(userAdmin.company != '' && originalUrl != "administrator") {
				var client = mongoose.createConnection('mongodb://localhost/' + originalUrl);
				client.on('connected', function () {

					var user_default = {
						"_id": user._id,
						'username' : originUsername,
						"company" : userAdmin.company,
						"lastName" : user.lastName,
						"firstName" :  user.firstName,
						"displayName" : user.displayName,
						"provider" : "local",
						"password":user.password,
						'roles': ['user']
					};
					client.collection('users').save(user_default, function (err) {
						if (err) return console.log(err);
						else console.log(user);
					});
				});
			}
			res.json(user);
		}
	});
};

/**
 * Signup admin
 */
exports.signupAdmin = function(req,res){
    // Init Variables
    var user = new User(req.body[0]);
	console.log(user);
    // Add missing user fields
    user.provider = 'local';
    user.resetPasswordToken = user.password = randomString();
    //console.log(user);
    // Then save the user
   user.save(function(err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
			Company.find({"_id": user.company}, function (err, company) {
				if (err) {
					return res.status(400).send({
						message: errorHandler.getErrorMessage(err)
					});
				} else {
					var client = mongoose.createConnection('mongodb://localhost/'+company[0].nameDB);
					client.on('connected', function() {
						var user_default = {
							"_id": user._id,
							"username":user.username,
							"lastName" : user.lastName,
							"firstName" :  user.firstName,
							"displayName" : user.displayName,
							"company" : user.company,
							"provider" : "local",
							"password":user.password,
							"resetPasswordToken" : user.resetPasswordToken,
							'roles': ['user']
						};
						client.collection('users').save(user_default,function(err) {
							if (err) return console.log(err);
						});
					});
				}
			});
			res.send('okie');
        }
    });
};
/**
 * Signin after passport authentication
 */
exports.signin = function(req, res, next) {
	var linkUrl = req.headers.referer;
	var last = linkUrl.indexOf("/", 8);
	var originalUrl = linkUrl.substring(last+1,linkUrl.length);
	if(originalUrl.length == 0){
		res.status(400).send(info);
	}else {
		passport.authenticate('local', function(err, user, info) {
			if (err || !user) {
				res.status(400).send(info);
			} else {
				// Remove sensitive data before login
				user.password = undefined;
				user.salt = undefined;

				req.login(user, function(err) {
					if (err) {
						res.status(400).send(err);
					} else {
						res.json(user);
					}
				});
			}
		})(req, res, next);
	}
};

/**
 * Signout
 */
exports.signout = function(req, res) {
	var user = req.user;
	req.logout();
	if(user.company.length > 0){
		Company.find({"_id": user.company}, function (err, company) {

			res.redirect('/'+company[0].shortName+'#!/signin');
		});

	}
    else res.redirect('/#!/signin');
};

/**
 * OAuth callback
 */
exports.oauthCallback = function(strategy) {
	return function(req, res, next) {
		passport.authenticate(strategy, function(err, user, redirectURL) {
			if (err || !user) {
				return res.redirect('/#!/signin');
			}
			req.login(user, function(err) {
				if (err) {
					return res.redirect('/#!/signin');
				}

				return res.redirect(redirectURL || '/');
			});
		})(req, res, next);
	};
};

/**
 * Helper function to save or update a OAuth user profile
 */
exports.saveOAuthUserProfile = function(req, providerUserProfile, done) {
	if (!req.user) {
		// Define a search query fields
		var searchMainProviderIdentifierField = 'providerData.' + providerUserProfile.providerIdentifierField;
		var searchAdditionalProviderIdentifierField = 'additionalProvidersData.' + providerUserProfile.provider + '.' + providerUserProfile.providerIdentifierField;

		// Define main provider search query
		var mainProviderSearchQuery = {};
		mainProviderSearchQuery.provider = providerUserProfile.provider;
		mainProviderSearchQuery[searchMainProviderIdentifierField] = providerUserProfile.providerData[providerUserProfile.providerIdentifierField];

		// Define additional provider search query
		var additionalProviderSearchQuery = {};
		additionalProviderSearchQuery[searchAdditionalProviderIdentifierField] = providerUserProfile.providerData[providerUserProfile.providerIdentifierField];

		// Define a search query to find existing user with current provider profile
		var searchQuery = {
			$or: [mainProviderSearchQuery, additionalProviderSearchQuery]
		};

		User.findOne(searchQuery, function(err, user) {
			if (err) {
				return done(err);
			} else {
				if (!user) {
					var possibleUsername = providerUserProfile.username || ((providerUserProfile.email) ? providerUserProfile.email.split('@')[0] : '');

					User.findUniqueUsername(possibleUsername, null, function(availableUsername) {
						user = new User({
							firstName: providerUserProfile.firstName,
							lastName: providerUserProfile.lastName,
							username: availableUsername,
							displayName: providerUserProfile.displayName,
							email: providerUserProfile.email,
							provider: providerUserProfile.provider,
							providerData: providerUserProfile.providerData
						});

						// And save the user
						user.save(function(err) {
							return done(err, user);
						});
					});
				} else {
					return done(err, user);
				}
			}
		});
	} else {
		// User is already logged in, join the provider data to the existing user
		var user = req.user;

		// Check if user exists, is not signed in using this provider, and doesn't have that provider data already configured
		if (user.provider !== providerUserProfile.provider && (!user.additionalProvidersData || !user.additionalProvidersData[providerUserProfile.provider])) {
			// Add the provider data to the additional provider data field
			if (!user.additionalProvidersData) user.additionalProvidersData = {};
			user.additionalProvidersData[providerUserProfile.provider] = providerUserProfile.providerData;

			// Then tell mongoose that we've updated the additionalProvidersData field
			user.markModified('additionalProvidersData');

			// And save the user
			user.save(function(err) {
				return done(err, user, '/#!/settings/accounts');
			});
		} else {
			return done(new Error('User is already connected using this provider'), user);
		}
	}
};

/**
 * Remove OAuth provider
 */
exports.removeOAuthProvider = function(req, res, next) {
	var user = req.user;
	var provider = req.param('provider');

	if (user && provider) {
		// Delete the additional provider
		if (user.additionalProvidersData[provider]) {
			delete user.additionalProvidersData[provider];

			// Then tell mongoose that we've updated the additionalProvidersData field
			user.markModified('additionalProvidersData');
		}

		user.save(function(err) {
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				req.login(user, function(err) {
					if (err) {
						res.status(400).send(err);
					} else {
						res.json(user);
					}
				});
			}
		});
	}
};
exports.doAction = function(req,res){
	var action = req.body[0].choose;
	var data = req.body[0].data;
	var check = false;
	//console.log(JSON.stringify(req.body[0].choose));
	if (action == 'remove'){
		check = removeMultipleUser(data);
	}
	else if(action == 'active'){
		check = activeMultipleUser(data);
	}
	else if(action =='deactive'){
		check = deactiveMultipleUser(data);
	}
	else if(action == 'manager'){
		check = assignManagerMultipleUser(data);
	}
	else if(action =='staff'){
		check = assignStaffMultipleUser(data);
	}
	else if(action =='user'){
		check = assignUserMultipleUser(data);
	}

	if(check) res.json({'status':1});
	else res.json(check);
}
/**
 * delete , change status, change permission
 */
function removeMultipleUser(data){

    for (var i in data) {
        var id = data[i];
        var user = User.find({'_id': id});
        if(user){
			Company.find({_id: user.company},function(err,data){
				var client = mongoose.createConnection('mongodb://localhost/' + data[0].nameDB);
				client.on('connected', function () {
					client.collection('users').remove({_id:user._id});
				});
			});
            user.remove().exec(function(err){
                if (err) {
                    return err;
                } else {
                    return true;
                }
            });
        }
    }

};
function activeMultipleUser(data){
    for (var i in data) {
        var id = data[i];
        var user = User.find({'_id': id});
        if(user){
			Company.find({_id: user.company},function(err,data){
				var client = mongoose.createConnection('mongodb://localhost/' + data[0].nameDB);
				client.on('connected', function () {
					client.collection('users').update({_id:user._id}, {$set: {status: ['on'] }});
				});
			});

            user.update({_id:id}, {$set: {status: ['on'] }}).exec(function(err){
                if (err) {
                    return err;
                } else {
                    return true;
                }
            });
        }
    }

};
function deactiveMultipleUser(data){
    for (var i in data) {
        var id = data[i];
        var user = User.find({'_id': id});
        if(user){
			Company.find({_id: user.company},function(err,data){
				var client = mongoose.createConnection('mongodb://localhost/' + data[0].nameDB);
				client.on('connected', function () {
					client.collection('users').update({_id:user._id}, {$set: {status: ['off'] }});
				});
			});
            user.update({_id:id}, {$set: {status: ['off'] }}).exec(function(err){
                if (err) {
                    return err;
                } else {
                    return true;
                }
            });
        }
    }
};
function assignManagerMultipleUser(data){
    for (var i in data) {
        var id = data[i];
        var user = User.find({'_id': id});
        if(user){
			Company.find({_id: user.company},function(err,data){
				var client = mongoose.createConnection('mongodb://localhost/' + data[0].nameDB);
				client.on('connected', function () {
					client.collection('users').update({_id:user._id}, {$set: {roles: ['manager'] }});
				});
			});
            user.update({_id:id}, {$set: {roles: ['manager'] }}).exec(function(err){
                if (err) {
                    return err;
                } else {
                    return true;
                }
            });
        }
    }
};
function assignStaffMultipleUser(data){
    for (var i in data) {
        var id = data[i];
        var user = User.find({'_id': id});
        if(user){
			Company.find({_id: user.company},function(err,data){
				var client = mongoose.createConnection('mongodb://localhost/' + data[0].nameDB);
				client.on('connected', function () {
					client.collection('users').update({_id:user._id}, {$set: {roles: ['staff'] }});
				});
			});
            user.update({_id:id}, {$set: {roles: ['staff'] }}).exec(function(err){
                if (err) {
                    return err;
                } else {
                    return true;
                }
            });
        }
    }
};
function assignUserMultipleUser(data){
    for (var i in data) {
        var id = data[i];
        var user = User.find({'_id': id});
        if(user){
			Company.find({_id: user.company},function(err,data){
				var client = mongoose.createConnection('mongodb://localhost/' + data[0].nameDB);
				client.on('connected', function () {
					client.collection('users').update({_id:user._id}, {$set: {roles: ['user'] }});
				});
			});
            user.update({_id:id}, {$set: {roles: ['user'] }}).exec(function(err){
                if (err) {
                    return err;
                } else {
                    return true;
                }
            });
        }
    }
};

/**/
function randomString(){
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 10; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
};
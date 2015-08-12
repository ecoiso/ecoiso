'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	Standard = mongoose.model('Standard'),
	_ = require('lodash');

/**
 * Create a Standard
 */
exports.create = function(req, res) {
	var standard = new Standard(req.body);
	standard.user = req.user;

	standard.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(standard);
		}
	});
};

/**
 * Show the current Standard
 */
exports.read = function(req, res) {
	res.jsonp(req.standard);
};

/**
 * Update a Standard
 */
exports.update = function(req, res) {
	var standard = req.standard ;

	standard = _.extend(standard , req.body);

	standard.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(standard);
		}
	});
};

/**
 * Delete an Standard
 */
exports.delete = function(req, res) {
	var standard = req.standard ;

	standard.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(standard);
		}
	});
};

/**
 * List of Standards
 */
exports.list = function(req, res) { 
	Standard.find().sort('-created').populate('user', 'displayName').exec(function(err, standards) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(standards);
		}
	});
};

/**
 * Standard middleware
 */
exports.standardByID = function(req, res, next, id) { 
	Standard.findById(id).populate('user', 'displayName').exec(function(err, standard) {
		if (err) return next(err);
		if (! standard) return next(new Error('Failed to load Standard ' + id));
		req.standard = standard ;
		next();
	});
};

/**
 * Standard authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if (req.standard.user.id !== req.user.id) {
		return res.status(403).send('User is not authorized');
	}
	next();
};

'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	Mean = mongoose.model('Mean'),
	_ = require('lodash');

/**
 * Create a Mean
 */
exports.create = function(req, res) {
	var mean = new Mean(req.body);
	mean.user = req.user;

	mean.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(mean);
		}
	});
};

/**
 * Show the current Mean
 */
exports.read = function(req, res) {
	res.jsonp(req.mean);
};

/**
 * Update a Mean
 */
exports.update = function(req, res) {
	var mean = req.mean ;

	mean = _.extend(mean , req.body);

	mean.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(mean);
		}
	});
};

/**
 * Delete an Mean
 */
exports.delete = function(req, res) {
	var mean = req.mean ;

	mean.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(mean);
		}
	});
};

/**
 * List of Means
 */
exports.list = function(req, res) { 
	Mean.find().sort('-created').populate('user', 'displayName').exec(function(err, means) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(means);
		}
	});
};

/**
 * Mean middleware
 */
exports.meanByID = function(req, res, next, id) { 
	Mean.findById(id).populate('user', 'displayName').exec(function(err, mean) {
		if (err) return next(err);
		if (! mean) return next(new Error('Failed to load Mean ' + id));
		req.mean = mean ;
		next();
	});
};

/**
 * Mean authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if (req.mean.user.id !== req.user.id) {
		return res.status(403).send('User is not authorized');
	}
	next();
};

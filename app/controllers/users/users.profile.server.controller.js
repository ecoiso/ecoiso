'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
	errorHandler = require('../errors.server.controller.js'),
	mongoose = require('mongoose'),
	passport = require('passport'),
	Company = mongoose.model('Company'),
	User = mongoose.model('User');

/**
 * Update user details
 */
exports.update = function(req, res) {
	// Init Variables
	var user = req.user;
	var message = null;

	// For security measurement we remove the roles from the req.body object
	delete req.body.roles;

	if (user) {
		// Merge existing user
		user = _.extend(user, req.body);
		user.updated = Date.now();
		user.displayName = user.firstName + ' ' + user.lastName;

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
	} else {
		res.status(400).send({
			message: 'Người dùng chưa đăng nhập '
		});
	}
};

/**
 * Send User
 */
exports.me = function(req, res) {
	res.json(req.user || null);
};
/**
 * List of Users
 */
exports.list = function(req, res) {
        /*User.find().sort('-created').exec(function(err, users) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            } else {
                console.log(users);
                res.jsonp(users);
            }
        });
        */
};
/**
 * Remove User
 */
exports.removeUser = function(req, res) {
    var user = User.find({'_id': req.params.id});
    user.remove().exec(function(err){
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.json({'status':1});
        }
    });
};
/**
* List staffs
*
*/
exports.listStaffs = function(req, res) {
    User.find({$and:[{'roles': ['staff']},{'company' : req.user.company}]}, function (err, staffs) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
        res.json(staffs);
        }
    });
};
/**
*   Check Exist Admin
 *
 *
 * */
exports.changeCheckAdmin = function(req,res){
    var companyId = req.company._id;
    Company.update({"_id": companyId},{$set:{'checkAdmin':"1"}}).exec(function(err){
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            Company.find({"_id": companyId}, function (err, company) {
                if (err) {
                    return res.status(400).send({
                        message: errorHandler.getErrorMessage(err)
                    });
                } else {
                    res.json(company);
                }
            });
        }
    });
};
/**
 *
 *
 *
 * */

exports.listUserInCompany = function(req,res){
    var companyID = req.user.company;
    User.find({company:companyID}).exec(function(err, users) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.json(users);
        }
    });
}
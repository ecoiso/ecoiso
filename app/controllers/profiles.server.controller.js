'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	Profile = mongoose.model('Profile'),
    Document = mongoose.model('Document'),
	_ = require('lodash');

/**
 * Create a Profile
 */
exports.create = function(req, res) {
    //console.log(req);
	var profile = new Profile(req.body);
	profile.user = req.user;
    profile.company = req.user.company;

	profile.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(profile);
		}
	});
};

/**
 * Show the current Profile
 */
exports.read = function(req, res) {
	res.jsonp(req.profile);
};

/**
 * Update a Profile
 */
exports.update = function(req, res) {
	var profile = req.profile ;

	profile = _.extend(profile , req.body);

	profile.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(profile);
		}
	});
};

/**
 * Delete an Profile
 */
exports.delete = function(req, res) {
	var profile = req.profile ;

	profile.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(profile);
		}
	});
};

/**
 * List of Profiles
 */
exports.list = function(req, res) { 
	Profile.find().sort('-created').populate('user', 'displayName').exec(function(err, profiles) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(profiles);
		}
	});
};

/**
 * Profile middleware
 */
exports.profileByID = function(req, res, next, id) { 
	Profile.findById(id).populate('user', 'displayName').exec(function(err, profile) {
		if (err) return next(err);
		if (! profile) return next(new Error('Failed to load Profile ' + id));
		req.profile = profile ;
		next();
	});
};

/**
 * Profile authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if (req.profile.user.id !== req.user.id) {
		return res.status(403).send('User is not authorized');
	}
	next();
};

/**
 * Profile in this Process
 */
exports.profilesProcess = function(req, res){
    var processid = req.params.processId;
    Profile.find({'process': processid}, function (err, profiles) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.json(profiles);
        }
    });
};
/**
 *
 **/
exports.listProfiles = function(req, res) {}
/**
 *
 **/
exports.rootProfile = function(req, res) {
    console.log(req.user._id);
    Profile.find( {$and : [{'company': req.user.company},{'parent':[]},{$or:[{'user':req.user._id},{'viewer' : {$elemMatch: {"_id":req.user._id.toString()}}}] }] }, function (err, profiles) {
    //Profile.find( {'viewer' : {$elemMatch: {"_id":req.user._id.toString()}}}, function (err, profiles) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.json(profiles);
        }
    });
}
/**
 *
 * */

exports.childProfile = function(req, res) {
    console.log(req.user._id);
    var obj = [];
    obj.push(req.profile._id.toString());
    Profile.find({$and : [{'company': req.user.company},{'parent':obj},{$or:[{'user':req.user._id},{'viewer' : {$elemMatch: {"_id":req.user._id.toString()}}} ] } ]}, function (err, profiles) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.json(profiles);
        }
    });
};
exports.documentChildProfile = function(req, res) {
    Document.find({'folder':req.profile._id}, function (err, documents) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.json(documents);
        }
    });
};

/**
 *
 * */

var multiparty = require('multiparty');
var fs = require('fs');
exports.uploadProfile = function(req, res) {
    if (req.url === '/folder/uploadProfile' && req.method === 'POST') {
        var form = new multiparty.Form();
        var host = req.get('host');

        form.parse(req, function(err, fields, files) {
            var profile = JSON.parse(fields.profile[0]);
            if(typeof files !== "undefined"){
                if( typeof  files.file[0] !== "undefined") {
                    var file = files.file[0];
                    var filename = Date.now() + '_' + file.originalFilename;
                    var _filename = filename.split(' ').join('_');
                    fs.readFile(file.path, function (err, data) {
                        var newPath = "./public/uploads/" + _filename;
                        fs.writeFile(newPath, data, function (err) {
                            if (err) {
                                res.json(err);
                            } else {
                                var doc = [{
                                    name: file.originalFilename,
                                    kind: 'profile',
                                    size: file.size,
                                    number_versions: '1.0',
                                    versions: _filename,
                                    process: '',
                                    urlPdf: '',
                                    folder:profile[profile.length -1]._id,
                                    textContent : data.toString('base64')
                                }];
                                res.json(doc);
                            }
                        });
                    });
                }}
        });
    }
};
/**
 *
 * */
exports.saveViewerProfile = function(req,res){
    //console.log(req.body);

    var obj = [];
    for(var i in req.body.users){
        obj.push({'_id':req.body.users[i]._id});
    }
    Profile.update({"_id": req.body.profileId},{$set:{'viewer':obj}}).exec(function(err){
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        }else{

            res.send('1');
        }
    });
};
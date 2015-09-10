'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	Profile = mongoose.model('Profile'),
    Company = mongoose.model('Company'),
    Document = mongoose.model('Document'),
    ObjectId = mongoose.Types.ObjectId,
	_ = require('lodash');

/**
 * Create a Profile
 */
exports.create = function(req, res) {
    //console.log(req);
    var profile = new Profile();
    profile = _.extend(profile , req.body);
    //console.log(profile);
    var user = req.user;
    Company.find({"_id": user.company}, function (err, company) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            var client = mongoose.createConnection('mongodb://localhost/' + company[0].nameDB);
            client.on('connected', function () {
                var _profile =
                {
                    user: req.user._id,
                    company: req.user.company,
                    created : Date.now(),
                    name: profile.name,
                    parent: profile.parent,
                    viewer: profile.viewer,
                    color: profile.color,
                    inherit:profile.inherit.toString()

                };
                client.collection('profiles').save(_profile,function(err,profile_done) {
                    if (err) return console.log(err);
                    else res.jsonp(profile_done);
                });
            });
        };
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
    profile._id = ObjectId(profile._id);
    //console.log(profile);
    //var nameProfile = req.body.name;
    var user = req.user;
    Company.find({"_id": user.company}, function (err, company) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            var client = mongoose.createConnection('mongodb://localhost/' + company[0].nameDB);
            client.on('connected', function () {
                client.collection('profiles').update({_id:ObjectId(profile._id)},profile,function(err){
                    if (err) return console.log(err);
                    else{
                        client.collection('profiles').find({_id : ObjectId(profile._id)}).toArray(function(err, process_done) {
                            if (err) return console.log(err);
                            res.jsonp(process_done[0]);
                        });
                    }
                });

            });
        }
    });
};

/**
 * Delete an Profile
 */
exports.delete = function(req, res) {
    var profile = req.profile ;
    var user =req.user;
    Company.find({_id: user.company},function(err,data){
        var client = mongoose.createConnection('mongodb://localhost/' + data[0].nameDB);
        client.on('connected', function () {
            client.collection('profiles').remove({_id:ObjectId(profile._id)},function(err){
                if(err) console.log(err);
                else {
                    res.jsonp(profile);
                }
            });
        });
    });
	/*var profile = req.profile ;

	profile.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(profile);
		}
	});*/
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
    var user = req.user;
    Company.find({"_id": user.company}, function (err, company) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            var client = mongoose.createConnection('mongodb://localhost/' + company[0].nameDB);
            client.on('connected', function () {
                client.collection('profiles').find({_id:ObjectId(id)}).toArray(function(err,profiles) {
                    if (err) return next(err);
                    if (! profiles) return next(new Error('Failed to load Profile ' + id));
                    req.profile = profiles[0] ;
                    next();
                });
            });
        };
    });
	/*Profile.findById(id).populate('user', 'displayName').exec(function(err, profile) {
		if (err) return next(err);
		if (! profile) return next(new Error('Failed to load Profile ' + id));
		req.profile = profile ;
		next();
	});*/
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
    var user = req.user;
    var processid = req.params.processId;
    Company.find({"_id": user.company}, function (err, company) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            var client = mongoose.createConnection('mongodb://localhost/' + company[0].nameDB);
            client.on('connected', function () {
                client.collection('profiles').find({'process': processid}).toArray(function(err,profiles) {
                    if (err) {
                        return res.status(400).send({
                            message: errorHandler.getErrorMessage(err)
                        });
                    } else {
                        res.json(profiles[0]);
                    }
                });
            });
        };
    });
    /*var processid = req.params.processId;
    Profile.find({'process': processid}, function (err, profiles) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.json(profiles);
        }
    });*/
};
/**
 *
 **/
exports.listProfiles = function(req, res) {}
/**
 *
 **/
exports.rootProfile = function(req, res) {
    var user = req.user;
    Company.find({"_id": user.company}, function (err, company) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            var client = mongoose.createConnection('mongodb://localhost/' + company[0].nameDB);
            client.on('connected', function () {
                client.collection('profiles').find( {$and : [{'company': user.company},{'parent':[]},{$or:[{'user':user._id},{'viewer' : {$elemMatch: {"_id":user._id}}}] }] }).toArray(function(err,profiles) {
                    if (err) return next(err);
                    if (! profiles) return next(new Error('Failed to load profiles ' + id));
                    res.json(profiles);
                });
            });
        };
    });
    /*Profile.find( {$and : [{'company': req.user.company},{'parent':[]},{$or:[{'user':req.user._id},{'viewer' : {$elemMatch: {"_id":req.user._id.toString()}}}] }] }, function (err, profiles) {
    //Profile.find( {'viewer' : {$elemMatch: {"_id":req.user._id.toString()}}}, function (err, profiles) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.json(profiles);
        }
    });*/
}
/**
 *
 * */

exports.childProfile = function(req, res) {
    var user = req.user;
    var obj = [];
    obj.push(req.profile._id.toString());
    Company.find({"_id": user.company}, function (err, company) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            var client = mongoose.createConnection('mongodb://localhost/' + company[0].nameDB);
            client.on('connected', function () {
                client.collection('profiles').find({$and : [{'company': req.user.company},{'parent':obj},{$or:[{'user':req.user._id.toString()},{'viewer' : {$elemMatch: {"_id":req.user._id.toString()}}} ] } ]}).toArray(function (err, profiles) {
                    if (err) return next(err);
                    if (! profiles) return next(new Error('Failed to load profiles ' + id));
                    res.json(profiles);
                });
            });
        };
    });
    /*console.log(req.user._id);
    var obj = [];
    obj.push(req.profile._id.toString());
    Profile.find({$and : [{'company': req.user.company},{'parent':obj},{$or:[{'user':req.user._id},{'viewer' : {$elemMatch: {"_id":req.user._id.toString()}}} ] } ]}).toArray(function (err, profiles) {
        if (err) return next(err);
        if (! profiles) return next(new Error('Failed to load profiles ' + id));
        res.json(profiles);
    });*/
};
exports.documentChildProfile = function(req, res) {
    var user = req.user;
    Company.find({"_id": user.company}, function (err, company) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            var client = mongoose.createConnection('mongodb://localhost/' + company[0].nameDB);
            client.on('connected', function () {
                client.collection('documents').find({'folder':req.profile._id.toString()}).toArray(function (err, document) {
                    if (err) {
                        return res.status(400).send({
                            message: errorHandler.getErrorMessage(err)
                        });
                    } else {
                        res.json(document);
                    }
                });
            });
        };
    });
    /*Document.find({'folder':req.profile._id}, function (err, documents) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.json(documents);
        }
    });*/
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
    var obj = [];
    for(var i in req.body.users){
        obj.push({'_id':req.body.users[i]._id});
    }
    var user = req.user;
    Company.find({"_id": user.company}, function (err, company) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            var client = mongoose.createConnection('mongodb://localhost/' + company[0].nameDB);
            client.on('connected', function () {
                client.collection('profiles').update({_id:ObjectId( req.body.profileId)},{$set:{'viewer':obj}},function(err){
                    if (err) return console.log(err);
                    else{
                        res.send('1');
                    }
                });
            });
        };
    });
    /*var obj = [];
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
    });*/
};
/**
 * */
exports.totalProfiles = function(req,res){
    res.send('20');
};
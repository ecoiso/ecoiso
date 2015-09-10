'use strict';
/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
    ObjectId = mongoose.Types.ObjectId,
	Process = mongoose.model('Process'),
    Company = mongoose.model('Company'),
	_ = require('lodash');

/**
 * Create a Process
 */
exports.create = function(req, res) {
	var process = new Process(req.body);
	process.user = req.user;
    Company.find({"_id": req.user.company}, function (err, company) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            var client = mongoose.createConnection('mongodb://localhost/' + company[0].nameDB);
            var user_process_val = '';
            if(typeof process.userProcess != 'undefined'){
                user_process_val = process.userProcess._id;
            };
            client.on('connected', function () {
                var _process =
                    {
                        user: process.user,
                        kind: [ 'draft' ],
                        name: process.name,
                        created : Date.now(),
                        userProcess:user_process_val
                    };
                client.collection('processes').save(_process,function(err,process_done) {
                    if (err) return console.log(err);
                    else res.jsonp(process_done);
                });
            });
        }
    });
	/*process.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(process);
		}
	});*/
};

/**
 * Show the current Process
 */
exports.read = function(req, res) {
	res.jsonp(req.process);
};

/**
 * Update a Process
 */
exports.update = function(req, res) {
	var process = req.process ;

	process = _.extend(process , req.body);
    var nameProcess = req.body.name;
    var user = req.user;
    Company.find({"_id": user.company}, function (err, company) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            var client = mongoose.createConnection('mongodb://localhost/' + company[0].nameDB);
            client.on('connected', function () {
                client.collection('processes').update({_id:ObjectId(process._id)},{$set:{name:nameProcess}},function(err){
                    if (err) return console.log(err);
                    else{
                        client.collection('processes').find({_id : ObjectId(process._id)}).toArray(function(err, process_done) {
                            if (err) return console.log(err);
                            res.jsonp(process_done[0]);
                        });
                    }
                });

            });
        }
    });
	/*process.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(process);
		}
	});*/
};

/**
 * Delete an Process
 */
exports.delete = function(req, res) {
	var process = req.process ;
    var user =req.user;
    Company.find({_id: user.company},function(err,data){
        var client = mongoose.createConnection('mongodb://localhost/' + data[0].nameDB);
        client.on('connected', function () {
            client.collection('processes').remove({_id:ObjectId(process._id)},function(err){
                if(err) console.log(err);
                else {
                        res.jsonp(process);
                }
            });
        });
    });
	/*process.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(process);
		}
	});*/
};

/**
 * List of Processes
 */
exports.list = function(req, res) { 
	Process.find().sort('-created').populate('user', 'displayName').exec(function(err, processes) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(processes);
		}
	});
};

/**
 * Process middleware
 */
exports.processByID = function(req, res, next, id) {
    Company.find({"_id": req.user.company}, function (err, company) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            var client = mongoose.createConnection('mongodb://localhost/' + company[0].nameDB);
            client.on('connected', function () {
                client.collection('processes').find({_id : ObjectId(id)}).toArray(function(err, process) {
                    if (err) return next(err);
                    if (! process) return next(new Error('Failed to load Process ' + id));
                    req.process = process[0] ;
                    next();
                });
            });
        }
    });
};

/**
 * Process authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if (req.process.user.id !== req.user.id) {
		return res.status(403).send('User is not authorized');
	}
	next();
};
/**
 * List Drafts
 *
 */
exports.listDraft = function(req, res) {
    Company.find({"_id": req.user.company}, function (err, company) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            var client = mongoose.createConnection('mongodb://localhost/' + company[0].nameDB);
            client.on('connected', function () {
                client.collection('processes').find({$and : [{ "kind": ['draft'] },{$or:[{'user': req.user._id},{'userProcess': req.user._id.toString()}] } ] }).toArray(function(err, process) {
                    if (err) return next(err);
                    if (! process) return next(new Error('Failed to load Process ' + id));
                    res.json(process);
                });
            });
        }
    });
    /*Process.find({$and : [{ "kind": ['draft'] },{$or:[{'user': req.user.id},{'userProcess._id': req.user.id}] } ] }, function (err, drafts) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.json(drafts);
        }
    });*/
};
/**
 * List waitings
 *
 */
exports.listWaitingPublish = function(req, res) {
    Company.find({"_id": req.user.company}, function (err, company) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            var client = mongoose.createConnection('mongodb://localhost/' + company[0].nameDB);
            client.on('connected', function () {
                client.collection('processes').find({$and : [{ "kind": ['waitingPublish'] },{$or:[{'user': req.user._id},{'userProcess._id': req.user._id}] } ] }).toArray(function(err, process) {
                    if (err) return next(err);
                    if (! process) return next(new Error('Failed to load Process ' + id));
                    res.json(process);
                });
            });
        }
    });
    /*Process.find({$and : [{ "kind": ['waitingPublish'] },{$or:[{'user': req.user._id},{'userProcess._id': req.user._id}] } ] }, function (err, waitings) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.json(waitings);
        }
    });*/
};
/**
 * List publishs
 *
 */
exports.listPublish = function(req, res) {
    Company.find({"_id": req.user.company}, function (err, company) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            var client = mongoose.createConnection('mongodb://localhost/' + company[0].nameDB);
            client.on('connected', function () {
                client.collection('processes').find({ "kind": ['publish'] }).toArray(function(err, process) {
                    if (err) return next(err);
                    if (! process) return next(new Error('Failed to load Process ' + id));
                    res.json(process);
                });
            });
        }
    });
   /* Process.find({ $and: [{ "kind": ['publish'] }]}, function (err, publish) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.json(publish);
        }
    });*/
};
/**
 * Require Publish
 *
 */
exports.requirePublic = function(req,res){
    Company.find({"_id": req.user.company}, function (err, company) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            var client = mongoose.createConnection('mongodb://localhost/' + company[0].nameDB);
            client.on('connected', function () {
                client.collection('processes').find({_id:ObjectId(req.body._id)}).toArray(function(err, process) {
                    if (err) return next(err);
                    if (! process) return next(new Error('Failed to load Process ' + id));
                    client.collection('processes').update({_id:ObjectId(req.body._id)},{$set:{kind:['waitingPublish']}},function(err,data){
                        if (err) { return console.log(err); }
                    });
                    client.collection('processes').find({_id:ObjectId(req.body._id)}).toArray(function(err, process) {
                        if (err) return next(err);
                        if (! process) return next(new Error('Failed to load Process ' + id));
                        res.json(process);
                    });
                });
            });
        }
    });
    /*Process.findOne({_id:req.body._id}, function(err, process){
        if (err) { return next(err); }
        process.kind = ['waitingPublish'];
        process.save(function(err) {
            if (err) { return next(err); }
            else res.json(process);
        });
    });*/
}
/**
 * Require Publish
 *
 */
exports.acceptPublic = function(req,res){
    Company.find({"_id": req.user.company}, function (err, company) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            var client = mongoose.createConnection('mongodb://localhost/' + company[0].nameDB);
            client.on('connected', function () {
                client.collection('processes').find({_id:ObjectId(req.body._id)}).toArray(function(err, process) {
                    if (err) return next(err);
                    if (! process) return next(new Error('Failed to load Process ' + id));
                    client.collection('processes').update({_id:ObjectId(req.body._id)},{$set:{kind:['publish']}},function(err,data){
                        if (err) { return console.log(err); }
                    });
                    client.collection('processes').find({_id:ObjectId(req.body._id)}).toArray(function(err, process) {
                        if (err) return next(err);
                        if (! process) return next(new Error('Failed to load Process ' + id));
                        res.json(process);
                    });
                });
            });
        }
    });
}
/**
 * Require Publish
 *
 */
exports.denyPublic = function(req,res){
    Company.find({"_id": req.user.company}, function (err, company) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            var client = mongoose.createConnection('mongodb://localhost/' + company[0].nameDB);
            client.on('connected', function () {
                client.collection('processes').find({_id:ObjectId(req.body._id)}).toArray(function(err, process) {
                    if (err) return next(err);
                    if (! process) return next(new Error('Failed to load Process ' + id));
                    client.collection('processes').update({_id:ObjectId(req.body._id)},{$set:{kind:['draft']}},function(err,data){
                        if (err) { return console.log(err); }
                    });
                    client.collection('processes').find({_id:ObjectId(req.body._id)}).toArray(function(err, process) {
                        if (err) return next(err);
                        if (! process) return next(new Error('Failed to load Process ' + id));
                        res.json(process);
                    });
                });
            });
        }
    });
};
var multiparty = require('multiparty');
var fs = require('fs');

/**
 * Upload files to Processes
 *
 */
exports.uploadProcess = function (req, res) {
    if (req.url === '/upload/uploadProcess' && req.method === 'POST') {
        // parse a file upload
        var form = new multiparty.Form();
        var host = req.get('host');

        form.parse(req, function(err, fields, files) {
            //console.log(files);
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
                            var fileExt = _filename.split('.').pop();
                            var input = _filename;
                            var output = input.substr(0, input.lastIndexOf('.')) || input;
                            /*if (fileExt != 'pdf') {
                                var spawn = require('child_process').spawn;
                                var libre = spawn("libreoffice4.4", ['--headless', '--convert-to', 'output.pdf', '--outdir', '/var/www/html/public/uploads/', '/var/www/html/public/uploads/' + _filename + '']);
                            }else{
                                /// create image thumb
                                var spawn_ = require('child_process').spawn;
                                var imageick;
                                imageick = spawn_("convert",['-thumbnail',' x150','/var/www/html/public/uploads/'+output+'.pdf','/var/www/html/public/uploads/'+output+'.jpg']);
                            }*/

                            var urlPdf = '';
                            if (fileExt != 'pdf') {
                                urlPdf = "/ViewerJS/index.html#/uploads/" + output + ".output.pdf";
                            } else {
                                urlPdf = "/ViewerJS/index.html#/uploads/" + output + ".pdf";
                            }
                            var doc = [{
                                name: file.originalFilename,
                                kind: 'process',
                                size: file.size,
                                number_versions: '1.0',
                                versions: _filename,
                                process: fields.process,
                                urlPdf: urlPdf,
                                folder:'',
                                thumb_image: output,
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
 * Upload files to Model
 *
 */
exports.uploadModel = function(req, res) {
    if (req.url === '/upload/uploadModel' && req.method === 'POST') {
        // parse a file upload
        var form = new multiparty.Form();

        form.parse(req, function(err, fields, files) {
            if(typeof files !== "undefined"){
            if(typeof  files.file[0] !== "undefined") {
                var file = files.file[0];
                var filename = Date.now() + '_' + file.originalFilename;
                var _filename = filename.split(' ').join('_');
                fs.readFile(file.path,function (err, data) {
                    var newPath = "./public/uploads/" + _filename;
                    fs.writeFile(newPath, data, function (err) {
                        //console.log(data.toString());
                        if (err) {
                            res.json(err);
                        } else {
                            var fileExt = _filename.split('.').pop();
                            var input = _filename;
                            var output = input.substr(0, input.lastIndexOf('.')) || input;
                            /*if (fileExt != 'pdf') {
                                var spawn = require('child_process').spawn;
                                var libreoffice;
                                libreoffice = spawn("libreoffice4.4", ['--headless', '--convert-to', 'output.pdf', '--outdir', '/var/www/html/public/uploads/', '/var/www/html/public/uploads/' + _filename + '']);
                            }else{
                                /// create image thumb
                                var spawn_ = require('child_process').spawn;
                                var imageick;
                                imageick = spawn_("convert",['-thumbnail',' x150','/var/www/html/public/uploads/'+output+'.pdf','/var/www/html/public/uploads/'+output+'.jpg']);
                            }*/
                            var urlPdf = '';
                            if (fileExt != 'pdf') {
                                urlPdf = "/ViewerJS/index.html#/uploads/" + output + ".output.pdf";
                            } else {
                                urlPdf = "/ViewerJS/index.html#/uploads/" + output + ".pdf";
                            }
                            var doc = [{
                                name: file.originalFilename,
                                kind: 'model',
                                size: file.size,
                                number_versions: '1.0',
                                versions: _filename,
                                process: fields.process,
                                urlPdf: urlPdf,
                                thumb_image: output,
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
 * */
function sleep(milliseconds) {
    var start = new Date().getTime();
    for (var i = 0; i < 1e7; i++) {
        if ((new Date().getTime() - start) > milliseconds){
            break;
        }
    }
}
/**
 * */
exports.searchGlobal = function (req, res) {
     var key = req.body[0].keyword;
    /*Process.find({ $and :[{'company':req.user.company},{'kind[0]': "publish" } ,{'name':/.*key.*//*}] }, function(err, process){
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.json(process);
        }
    });*/
    Process.find({ 'name': new RegExp( key) }, function(err, process){
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.json(process);
        }
    });
};

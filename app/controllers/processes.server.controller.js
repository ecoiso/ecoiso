'use strict';
/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	Process = mongoose.model('Process'),
	_ = require('lodash');

/**
 * Create a Process
 */
exports.create = function(req, res) {
	var process = new Process(req.body);
	process.user = req.user;

	process.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(process);
		}
	});
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

	process.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(process);
		}
	});
};

/**
 * Delete an Process
 */
exports.delete = function(req, res) {
	var process = req.process ;

	process.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(process);
		}
	});
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
	Process.findById(id).populate('user', 'displayName').exec(function(err, process) {
		if (err) return next(err);
		if (! process) return next(new Error('Failed to load Process ' + id));
		req.process = process ;
		next();
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
    Process.find({$and : [{ "kind": ['draft'] },{"userProcess.company":req.user.company },{$or:[{'user': req.user.id},{'userProcess._id': req.user.id}] } ] }, function (err, drafts) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.json(drafts);
        }
    });
};
/**
 * List waitings
 *
 */
exports.listWaitingPublish = function(req, res) {
    Process.find({$and : [{ "kind": ['waitingPublish'] },{"userProcess.company":req.user.company },{$or:[{'user': req.user.id},{'userProcess._id': req.user.id}] } ] }, function (err, waitings) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.json(waitings);
        }
    });
};
/**
 * List publishs
 *
 */
exports.listPublish = function(req, res) {
    Process.find({ $and: [{ "kind": ['publish'] },{"userProcess.company":req.user.company }]}, function (err, publish) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.json(publish);
        }
    });
};
/**
 * Require Publish
 *
 */
exports.requirePublic = function(req,res){
    Process.findOne({_id:req.body._id}, function(err, process){
        if (err) { return next(err); }
        process.kind = ['waitingPublish'];
        process.save(function(err) {
            if (err) { return next(err); }
            else res.json(process);
        });
    });
}
/**
 * Require Publish
 *
 */
exports.acceptPublic = function(req,res){
    Process.findOne({_id:req.body._id}, function(err, process){
        if (err) { return next(err); }
        process.kind = ['publish'];
        process.save(function(err) {
            if (err) { return next(err); }
            else res.json(process);
        });
    });
}
/**
 * Require Publish
 *
 */
exports.denyPublic = function(req,res){
    Process.findOne({_id:req.body._id}, function(err, process){
        if (err) { return next(err); }
        process.kind = ['draft'];
        process.save(function(err) {
            if (err) { return next(err); }
            else res.json(process);
        });
    });
}
var multiparty = require('multiparty');
var fs = require('fs');

/**
 * Upload files to Processes
 *
 */
function convertDoc2Pdf(_filename){
    var spawn = require('child_process').spawn;
    var libreoffice;
    libreoffice = spawn("libreoffice4.4",['--headless','--convert-to', ' pdf','--outdir','/var/www/html/public/uploads/','/var/www/html/public/uploads/'+_filename+'']);
    libreoffice.stdout.on('data', function (data) {
        console.log('stdout: ' + data);
    });

    libreoffice.stderr.on('data', function (data) {
        console.log('stderr: ' + data);
    });

    libreoffice.on('close', function (code) {
        if (code !== 0) {
            console.log(' process exited with code ' + code);
        }
    });
    return 1;
}
exports.createPdf2Jpg = function(req, res){
    var output = req.body[0].output;

    var spawn_ = require('child_process').spawn;
    var imageick;
    imageick = spawn_("convert",['-thumbnail',' x150','/var/www/html/public/uploads/'+output+'.pdf','/var/www/html/public/uploads/'+output+'.jpg']);
    imageick.stdout.on('data', function (data) {
        console.log('stdout: ' + data);
    });

    res.end("convert success");
}
exports.uploadProcess = function (req, res) {
    if (req.url === '/uploadProcess' && req.method === 'POST') {
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
                            if (fileExt != 'pdf') {
                                //convertDoc2Pdf(_filename);
                                var spawn = require('child_process').spawn;
                                var libreoffice;
                                libreoffice = spawn("libreoffice4.4", ['--headless', '--convert-to', 'output.pdf', '--outdir', '/var/www/html/public/uploads/', '/var/www/html/public/uploads/' + _filename + '']);
                                libreoffice.stdout.on('data', function (data) {
                                    console.log('stdout: ' + data);
                                });
                                libreoffice.on('close', function (code) {
                                    console.log('closing libreoffice code: ' + code);
                                });
                            }
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
    if (req.url === '/uploadModel' && req.method === 'POST') {
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
                            if (fileExt != 'pdf') {
                                var spawn = require('child_process').spawn;
                                var libreoffice;
                                libreoffice = spawn("libreoffice4.4", ['--headless', '--convert-to', 'output.pdf', '--outdir', '/var/www/html/public/uploads/', '/var/www/html/public/uploads/' + _filename + '']);
                                libreoffice.stdout.on('data', function (data) {
                                    console.log('stdout: ' + data);
                                });
                                libreoffice.on('close', function (code) {
                                    console.log('closing libreoffice code: ' + code);
                                });
                            }
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
/**
 * */
exports.findCompany = function(req,res){
    res.json(req.company);
}
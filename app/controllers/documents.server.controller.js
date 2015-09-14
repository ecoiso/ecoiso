'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	Document = mongoose.model('Document'),
    ObjectId = mongoose.Types.ObjectId,
    Company = mongoose.model('Company'),
	_ = require('lodash');

/**
 * Create a Document
 */
exports.create = function(req, res) {
    var doc = req.body;
    var id = JSON.stringify(doc[0].process);
    id = id.substring(2, id.length - 2);
    /// create image thumb
    /*var spawn_ = require('child_process').spawn;
    spawn_("convert", ['-thumbnail', ' x150', '/var/www/html/public/uploads/' + doc[0].thumb_image + '.pdf', '/var/www/html/public/uploads/' + doc[0].thumb_image + '.jpg']);
    */var user =req.user;
    Company.find({_id: ObjectId(user.company)},function(err,data){
        var client = mongoose.createConnection('mongodb://localhost/' + data[0].nameDB);
        client.on('connected', function () {
            var document1 = {
                user : req.user._id,
                name : doc[0].name,
                kind : doc[0].kind,
                size : doc[0].size,
                versions : doc[0].versions,
                number_versions : doc[0].number_versions,
                process : id,
                folder : doc[0].folder,
                user_update : '',
                thumb_image : doc[0].thumb_image,
                urlPdf : doc[0].urlPdf,
                textContent : doc[0].textContent,
                created : Date.now()
            };
            /**/
            client.collection('documents').save(document1,function(err,document_done){
                if(err) console.log(err);
                else {
                    res.jsonp(document_done);
                }
            });
        });
    });
};

/**
 * Show the current Document
 */
exports.read = function(req, res) {
	res.jsonp(req.document);
};

/**
 * Update a Document
 */
exports.update = function(req, res) {
	var document = req.document ;

	document = _.extend(document , req.body);
    var nameDocument= req.document.name;
    var user = req.user;
    Company.find({"_id": user.company}, function (err, company) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            var client = mongoose.createConnection('mongodb://localhost/' + company[0].nameDB);
            client.on('connected', function () {
                client.collection('documents').update({_id:ObjectId(document._id)},{$set:{name:nameDocument}},function(err){
                    if (err) return console.log(err);
                    else{
                        client.collection('documents').find({_id : ObjectId(document._id)}).toArray(function(err, process_done) {
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
 * Delete an Document
 */
exports.delete = function(req, res) {
	var document = req.document ;
    var user =req.user;
    Company.find({_id: user.company},function(err,data){
        var client = mongoose.createConnection('mongodb://localhost/' + data[0].nameDB);
        client.on('connected', function () {
            client.collection('documents').remove(document,function(err){
                if(err) console.log(err);
                else {
                    res.jsonp(document);
                }
            });
        });
    });
	/*remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(document);
		}
	});*/
};

/**
 * List of Documents
 */
exports.list = function(req, res) { 
	/*find().sort('-created').populate('user', 'displayName').exec(function(err, documents) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(documents);
		}
	});*/
};

/**
 * Document middleware
 */
exports.documentByID = function(req, res, next, id) {
    var user =req.user;
    Company.find({_id: user.company},function(err,data){
        var client = mongoose.createConnection('mongodb://localhost/' + data[0].nameDB);
        client.on('connected', function () {
            client.collection('documents').find({_id:ObjectId(id)}).toArray(function(err, document_done) {
                if (err) return console.log(err);
                req.document = document_done[0];
                next();
            });

        });
    });
	/*findById(id).populate('user', 'displayName').exec(function(err, document) {
		if (err) return next(err);
		if (! document) return next(new Error('Failed to load Document ' + id));
		req.document = document ;
		next();
	});*/
};

/**
 * Document authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if (req.user.id !== req.user.id) {
		return res.status(403).send('User is not authorized');
	}
	next();
};
/**
* Documents of Process
*
* */
exports.documentProcess = function(req,res){
    var processid = req.params.processId;
    var user =req.user;
    Company.find({_id: user.company},function(err,data) {
        var client = mongoose.createConnection('mongodb://localhost/' + data[0].nameDB);
        client.on('connected', function () {
            client.collection('documents').find({$and:[{'kind': "process" },{'process': processid}]}).toArray(function(err, document_done) {
                if (err) return console.log(err);
                res.json(document_done);
            });
        });
    });
   /* find({$and:[{'kind': "process" },{'process': processid}]}, function (err, documents) {
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
 * Documents of Model
 *
 * */
exports.documentModel = function(req,res){
    var processid = req.params.processId;
    var user =req.user;
    Company.find({_id: user.company},function(err,data) {
        var client = mongoose.createConnection('mongodb://localhost/' + data[0].nameDB);
        client.on('connected', function () {
            client.collection('documents').find({$and:[{'kind': "model" },{'process': processid}]}).toArray(function(err, document_done) {
                if (err) return console.log(err);
                res.json(document_done);
            });
        });
    });
    /*find({$and:[{'kind': "model" },{'process': processid}]}, function (err, documents) {
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
* remove document process
*
*
* */
exports.removeDocumentProcess = function(req,res){
   console.log(req);
};
/**
 * remove document model
 *
 *
 * */
exports.removeDocumentModel = function(req,res){
    res.json(req);
};
/**/
var fs = require('fs');
exports.downloadDocument = function(req, res){
    //console.log(req);
    var filename = req.body[0].filename, path = '/var/www/html/public/uploads/' + filename;
    var fileExt = filename.split('.').pop();
    if(fileExt == 'pdf'){
        /*fs.readFile(path,function(error,data){
            if(error){
                res.json({'status':'error',msg:err});
            }else{
                res.writeHead(200, {"Content-Type": "application/pdf"});
                res.write(data);
                res.end();
            }
        });*/
    }
    //req.json(req);
    res.download(path);
};
/**/
var multiparty = require('multiparty');
var fs = require('fs');
exports.updateNewVersion = function(req,res){
    if (req.url === '/document/updateNewVersion' && req.method === 'POST') {
        // parse a file upload
        var form = new multiparty.Form();
        var host = req.get('host');

        var user_update = req.user;
        form.parse(req, function(err, fields, files) {
            if(typeof files !== "undefined"){
            if(typeof  files.file[0] !== "undefined") {
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
                                //convertDoc2Pdf(_filename);
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
                                docId: fields.documentId,
                                size: file.size,
                                number_versions: fields.version,
                                versions: _filename,
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
    };
};

/**/
exports.documentUpdateVersion = function(req,res){
    if (req.url === '/document/documentUpdateVersion' && req.method === 'POST') {
        var doc = req.body[0];
        var id = doc.docId.toString();
        //console.log(id.toString());
        var user = req.user;
        Company.find({_id: user.company}, function (err, data) {
            var client = mongoose.createConnection('mongodb://localhost/' + data[0].nameDB);
            client.on('connected', function () {
                client.collection('documents').find({_id: ObjectId(id.toString())}).toArray(function (err, old_document) {
                    if (err) {
                        return res.status(400).send({
                            message: errorHandler.getErrorMessage(err)
                        });
                    } else {
                        var numbers = [];
                        var vers = [];
                        numbers.push(Cut2FirstLastChar(doc.number_versions));
                        if (old_document[0].number_versions.length > 1) {
                            for (var n = 0; n < old_document[0].number_versions.length; n++)
                                numbers.push(old_document[0].number_versions[n]);
                        } else {
                            numbers.push(Cut2FirstLastChar(old_document[0].number_versions));
                        }
                        vers.push(CutFirstLastChar(doc.versions));
                        if (old_document[0].versions.length > 1) {
                            for (var m = 0; m < old_document[0].versions.length; m++)
                                vers.push(old_document[0].versions[m]);
                        } else {
                            vers.push(Cut2FirstLastChar(old_document[0].versions));
                        }

                        ///update
                        client.collection('documents').update({_id: ObjectId(id.toString())}, {
                            $set: {
                                number_versions: numbers,
                                versions: vers,
                                size: doc.size,
                                user_update: req.user._id,
                                last_updated: Date.now(),
                                thumb_image: doc.thumb_image,
                                urlPdf: doc.urlPdf
                            }
                        }, function (err, data) {
                            if (err) console.log(err);
                        });
                        client.collection('documents').find({_id: ObjectId(id.toString())}).toArray(function (err, document) {
                            if (err) return next(err);
                            if (!document) return next(new Error('Failed to load Document '));
                            res.json(document);
                        });
                    };
                });
            });
        });
    };
};
/**/
function CutFirstLastChar(chars){
    var x = JSON.stringify(chars);
    var temp = '';
    x = x.split(" ");
    for(var i = 0; i < x.length; i++)
        temp += x[i];
    var result = temp.substring(1, temp.length - 1);
    return result;
}
/**/
function Cut2FirstLastChar(chars){
    var x = JSON.stringify(chars);
    var temp = '';
    x = x.split(" ");
    for(var i = 0; i < x.length; i++)
        temp += x[i];
    var result = temp.substring(2, temp.length - 2);
    return result;
}
/**/
exports.createImageThumb = function(req,res){
    var image = req.body[0];
    var thumb_image;
    thumb_image = image[0];

    if(fs.existsSync('/var/www/html/public/uploads/'+thumb_image+'.jpg') || fs.existsSync('/var/www/html/public/uploads/'+thumb_image+'-0.jpg')){
        // had been thumb images
        res.send('0');
    }else{
        //sleep(10000);
        if(fs.existsSync('/var/www/html/public/uploads/'+thumb_image+'.output.pdf')){
            /// create image thumb
            var spawn_ = require('child_process').spawn;
            var imageick;
            imageick = spawn_("convert",['-thumbnail',' x150','/var/www/html/public/uploads/'+thumb_image+'.output.pdf','/var/www/html/public/uploads/'+thumb_image+'.jpg']);
            res.send('1');
        }else{
            if(fs.existsSync('/var/www/html/public/uploads/'+thumb_image+'.doc')) convertToPDf(thumb_image+'.doc');
            if(fs.existsSync('/var/www/html/public/uploads/'+thumb_image+'.docx')) convertToPDf(thumb_image+'.docx');
            if(fs.existsSync('/var/www/html/public/uploads/'+thumb_image+'.xls')) convertToPDf(thumb_image+'.xls');
            if(fs.existsSync('/var/www/html/public/uploads/'+thumb_image+'.xlsx')) convertToPDf(thumb_image+'.xlsx');
            res.send('1');
        }
    }
};
/**/
function sleep(milliseconds) {
    var start = new Date().getTime();
    for (var i = 0; i < 1e7; i++) {
        if ((new Date().getTime() - start) > milliseconds){
            break;
        }
    }
};
/**/
function convertToPDf(filename){
    var spawn = require('child_process').spawn;
    var libreoffice;
    libreoffice = spawn("libreoffice4.4", ['--headless', '--convert-to', 'output.pdf', '--outdir', '/var/www/html/public/uploads/', '/var/www/html/public/uploads/' + filename + '']);
}
/**
 * */
exports.totalDocs = function(req,res){
    res.send('10');
};
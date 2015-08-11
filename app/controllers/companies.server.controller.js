'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	Company = mongoose.model('Company'),
	User = mongoose.model('User'),
	_ = require('lodash');
var multiparty = require('multiparty');
var fs = require('fs');
/**
 * Create a Company
 */
exports.create = function(req, res) {
	var company = new Company(req.body);
    //console.log(company);
	company.user = req.user;
	company.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(company);
		}
	});
};

/**
 * Show the current Company
 */
exports.read = function(req, res) {
	res.jsonp(req.company);
};

/**
 * Update a Company
 */
exports.update = function(req, res) {
	var company = req.company ;

	company = _.extend(company , req.body);

	company.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(company);
		}
	});
};

/**
 * Delete an Company
 */
exports.delete = function(req, res) {
	var company = req.company ;

	company.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(company);
		}
	});
};

/**
 * List of Companies
 */
exports.list = function(req, res) { 
	Company.find().sort('-created').populate('user', 'displayName').exec(function(err, companies) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(companies);
		}
	});
};

/**
 * Company middleware
 */
exports.companyByID = function(req, res, next, id) { 
	Company.findById(id).populate('user', 'displayName').exec(function(err, company) {
		if (err) return next(err);
		if (! company) return next(new Error('Failed to load Company ' + id));
		req.company = company ;
		next();
	});
};

/**
 * Company authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if (req.company.user.id !== req.user.id) {
		return res.status(403).send('User is not authorized');
	}
	next();
};
/**/
function randomString(){
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 10; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
};
/**
 * */
exports.updateCompanyAdmin = function(req,res){
	var linkUrl = req.headers.referer;
    var last = linkUrl.indexOf("/", 8);
	var originalUrl = linkUrl.substring(last+1,linkUrl.length);
	var att = req.body;
	Company.update({shortName:originalUrl},{$set:{
		'showName' : att[0].showName,
		'logo' : att[1].logo ,
		imageLogin : att[2].imageLogin,
		intro : att[3].intro,
		colorBackground : att[4].colorBackground
	} },function(err,data){
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(data);
		}
	});

};
/**
 * */
exports.uploadLogo = function(req,res){

    if (req.url === '/uploadLogo' && req.method === 'POST') {
        // parse a file upload
        var form = new multiparty.Form();
        var host = req.get('host');

        form.parse(req, function(err, fields, file) {
            //console.log(files);
            if(typeof file !== "undefined"){
                if( typeof  file.file[0] !== "undefined") {
                    var file = file.file[0];
                    var filename = Date.now() + '_' + file.originalFilename;
                    var _filename = filename.split(' ').join('_');
                    fs.readFile(file.path, function (err, data) {
                        var newPath = "./public/uploads/" + _filename;
						var gm = require('gm');
                        fs.writeFile(newPath, data, function (err) {
                            if (err) {
                                res.json(err);
                            } else {
								gm(this.getImgStream(newPath)).size(function(err, value){
										console.log(value);
									})
                                res.send(_filename);
                            }
                        });
                    });
                }}
        });

    }
};
exports.createDefaultAccount = function(req,res){
	var obj = req.body;
	var client = mongoose.createConnection('mongodb://localhost/'+obj.nameDB);
	client.on('connected', function() {
		delete obj.$resolved;
		client.collection('companies').save(obj,function(err, company) {
			if (err) return console.log(err);
		});
	});
};

exports.findCompanyByShortName = function(req,res){
	var shortName = req.params.shortName;
	Company.find({"shortName":shortName}).exec(function(err, company) {
		if (err) return console.log(err);
		res.json(company);
		});
};
/**
 * */
exports.findCompany = function(req,res){
	var companyID = req.params.companyID;
	Company.find({"_id":companyID}).exec(function(err, company) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(company);
		}
	});
}
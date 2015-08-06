'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Company Schema
 */
var CompanySchema = new Schema({
	name: {
		type: String,
		default: '',
		required: 'Please fill Company name',
		trim: true
	},
	created: {
		type: Date,
		default: Date.now
	},
	user: {
		type: Schema.ObjectId,
		ref: 'User'
	},
    shortName: {
        type: String,
        default: '',
        required: 'Please fill Company short name',
        trim: true
    },
    status: {
        type: [{
            type: String,
            enum: ['off','on']
        }],
        default: ['on']
    },
    expireDate: {
        type: Date
    },
    address: {
        type: String,
        trim: true
    },
    phone: {
        type: String,
        trim: true
    },
    mail: {
        type: String,
        trim: true
    },
    checkAdmin: {
        type: String,
        default: '0',
        trim: true
    },
    showName: {
        type: String,
        default: '',
        trim: true
    },
    logo: {
        type: String,
        default: '',
        trim: true
    },
    imageLogin:{
        type: String,
        default: '',
        trim: true
    },
        intro:{
        type: String,
        default: '',
        trim: true
    }

});

mongoose.model('Company', CompanySchema);
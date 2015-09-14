'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Profile Schema
 */
var ProfileSchema = new Schema({
	name: {
		type: String,
		default: '',
		required: 'Hãy điền tên thư mục !',
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
    process:{
        type: String,
        default: '',
        trim: true
    },
    viewer:[],
    parent:[],
    company:{
        type: String,
        default: '',
        trim: true
    },
	color:{
		type: String,
		default: '#FFA726',
		trim: true
	},
	inherit:{
		type: String,
		default: '0',
		trim: true
	}
});

mongoose.model('Profile', ProfileSchema);
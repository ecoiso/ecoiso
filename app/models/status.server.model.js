'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Status Schema
 */
var StatusSchema = new Schema({
	name: {
		type: String,
		default: '',
		required: 'Please fill Status name',
		trim: true
	},
	created: {
		type: Date,
		default: Date.now
	},
	user: {
		type: Schema.ObjectId,
		ref: 'User'
	}
});

mongoose.model('Status', StatusSchema);
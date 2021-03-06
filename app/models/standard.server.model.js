'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Standard Schema
 */
var StandardSchema = new Schema({
	name: {
		type: String,
		default: '',
		required: 'Please fill Standard name',
		trim: true
	},
	description: {
		type: String,
		default: '',
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
	company: {
		type: String,
		default: '',
		trim: true
	}
});

mongoose.model('Standard', StandardSchema);
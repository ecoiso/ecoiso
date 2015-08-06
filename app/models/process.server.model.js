'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Process Schema
 */
var ProcessSchema = new Schema({
	name: {
		type: String,
		default: '',
		required: 'Please fill Process name',
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
    userProcess:{
        type: {},
        trim :true
    },
    kind: {
        type: [{
            type: String,
            enum: ['draft','waitingPublish','publish']
        }],
        default: ['draft']
    }
});

mongoose.model('Process', ProcessSchema);
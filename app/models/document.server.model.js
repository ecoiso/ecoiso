'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Document Schema
 */
var DocumentSchema = new Schema({
	name: {
		type: String,
		default: '',
		required: 'Please fill Document name',
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
    kind:{
         type: String,
         trim:true
    },
    last_updated: {
        type: Date,
        default: Date.now
    },
    user_update: {
        type: String,
        trim : true
    },
    size:{
        type:String,
        trim:true
    },
    urlPdf:{
        type:String,
        trim:true
    },
    properties :[],
    number_versions :[],
    versions :[],
    folder:{
        type:String,
        trim:true
    },
    process:{
        type: String,
        trim:true
    },
    thumb_image:{
        type: String,
        trim:true
    },
    textContent:{
        type: String,
        default: '',
        trim:true
    }
});

mongoose.model('Document', DocumentSchema);
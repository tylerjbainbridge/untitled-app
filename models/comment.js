var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    shortid = require('shortid');

mongoose.Promise = require('bluebird');

var Comment = mongoose.Schema({
    user_id: String,
    username: String,

    image_id: String,
    fit_id: String,

    body: String
},
{
    timestamps: true
});

module.exports = mongoose.model('Comment', Comment);

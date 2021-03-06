var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    shortid = require('shortid');

var passportLocalMongoose = require('passport-local-mongoose');

var Account = new Schema({
    short_id: {
        type: String,
        'default': shortid.generate
    },
    username: String,
    name: String,
    password: String,
    brands: Schema.Types.Mixed,
    styles: Schema.Types.Mixed,
    following: [String],
    followers: [String]

});

Account.plugin(passportLocalMongoose);

module.exports = mongoose.model('Account', Account);

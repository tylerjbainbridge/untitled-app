var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    shortid = require('shortid');

/**
 * TODO: Add time stamp.
 */
var Image = mongoose.Schema({
    short_id: {
        type: String,
        'default': shortid.generate
    },

    fit_id: String,

    user_id: String,
    username: String,

    description: String,
    title: String,

    main:{
        key: String,
        link: String
    },

    thumbnail: {
        key: String,
        link: String
    },

    liked_by: [String],

    styles: [String],
    brands: [String],
    upload_date: String
});

module.exports = mongoose.model('Image', Image);

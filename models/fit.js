var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    shortid = require('shortid');

var Fit = new Schema({
    short_id: {
        type: String,
        'default': shortid.generate
    },

    user_id: String,
    username: String,

    comments: [String],

    style: [String],

    image_ids: [String],
    liked_by: [String]
},
{
    timestamps: true
});



module.exports = mongoose.model('Fit', Fit);

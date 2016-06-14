var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var Style = new Schema({
    name: String,
    brands_paired_with: Schema.Types.Mixed,
    styles: Schema.Types.Mixed,
    amount: Number
});

module.exports = mongoose.model('Style', Style);

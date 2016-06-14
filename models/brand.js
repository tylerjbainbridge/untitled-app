var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var Brand = new Schema({
    name: String,
    brands_paired_with: Schema.Types.Mixed,
    styles: Schema.Types.Mixed,
    amount: Number
});

module.exports = mongoose.model('Brand', Brand);

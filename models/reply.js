var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var repliesSchema = new Schema({
  text: String,
  created_on:{type: Date,default: new Date()},
  reported: {type: Boolean, default: false},
  delete_password: String
})

var Reply = mongoose.model('Reply',repliesSchema);

module.exports = Reply